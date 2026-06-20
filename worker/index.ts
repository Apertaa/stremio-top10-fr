/**
 * index.ts — Worker Cloudflare qui sert l'addon Stremio « Top 10 FR » configurable.
 *
 * Architecture hybride : les DONNÉES (listes + affiches) sont pré-générées et servies en statique par
 * GitHub Pages ; ce Worker ne fait que la LOGIQUE légère — décoder la config de l'URL, choisir les bons
 * fichiers statiques et assembler les réponses Stremio. Aucune image n'est composée ici.
 *
 * Routes (sous le domaine du Worker) :
 *   GET /                                    → page de configuration (HTML)
 *   GET /configure                           → idem (accepte `#<config>` pour pré-remplir)
 *   GET /availability.json                   → proxy des données statiques (même origine pour la page)
 *   GET /manifest.json                       → manifest « à configurer » (sans config)
 *   GET /<config>/manifest.json              → manifest selon la config (catalogues activés)
 *   GET /<config>/catalog/<type>/<id>.json   → contenu d'un catalogue
 *
 * <config> = base64url(JSON.stringify(Config)). Config = { v, sel: [{k,c,m,s}], kids? }.
 */
import CONFIGURE_HTML from "./configure.html";

export interface Env {
  /** Base des données statiques (GitHub Pages). Injectée par wrangler.toml ([vars]). */
  PAGES_BASE?: string;
}

/** Une sélection : source `k` (netflix…/global), pays `c`, films `m`, séries `s`. */
type Sel = { k: string; c: string; m?: boolean; s?: boolean };
/** Config encodée dans l'URL. */
type Config = { v: number; sel: Sel[]; kids?: boolean };

type ListKey = "movie" | "series" | "kids-movie" | "kids-series";

const DEFAULT_PAGES = "https://apertaa.github.io/stremio-top10-fr";
const ADDON_NAME = "Top 10 FR 🔟";
const ADDON_DESC =
  "Les vrais Top 10 du jour par plateforme et par pays (films & séries), avec les affiches « gros chiffre ».";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });

    const url = new URL(req.url);
    const pages = (env.PAGES_BASE || DEFAULT_PAGES).replace(/\/+$/, "");
    const parts = url.pathname.split("/").filter(Boolean);

    try {
      // Routes sans préfixe de config.
      if (parts.length === 0 || (parts.length === 1 && parts[0] === "configure")) return html(CONFIGURE_HTML);
      if (parts.length === 1 && parts[0] === "availability.json") return proxyJson(`${pages}/availability.json`);
      if (parts.length === 1 && parts[0] === "manifest.json") return json(stubManifest(url.origin, pages));

      // Routes avec préfixe de config : /<config>/…
      const cfgSeg = parts[0] ?? "";
      const rest = parts.slice(1);
      if (rest.length === 1 && rest[0] === "manifest.json") {
        return json(await buildManifest(cfgSeg, pages, url.origin));
      }
      if (rest[0] === "catalog" && rest.length >= 3) {
        const type = rest[1] ?? "";
        // L'id peut être suivi d'un segment « extra » et finit par .json — on ne garde que l'id.
        const id = (rest[2] ?? "").replace(/\.json$/, "");
        return json(await buildCatalog(cfgSeg, pages, type, id));
      }
      return notFound();
    } catch (e) {
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
        status: 400,
        headers: jsonHeaders(),
      });
    }
  },
};

// ─────────── Construction des réponses Stremio ───────────

/** Manifest « à configurer » (quand on installe l'URL nue, sans config). */
function stubManifest(origin: string, pages: string) {
  return {
    id: "fr.apertaa.top10",
    version: "1.0.0",
    name: ADDON_NAME,
    description: ADDON_DESC,
    logo: `${pages}/posters/_logo.png`,
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt", "tmdb:"],
    catalogs: [],
    behaviorHints: { configurable: true, configurationRequired: true, configurationURL: `${origin}/configure` },
  };
}

/** Manifest personnalisé : un catalogue par (source × type) activé et réellement disponible. */
async function buildManifest(cfgSeg: string, pages: string, origin: string) {
  const cfg = decodeConfig(cfgSeg);
  const avail = await fetchJson(`${pages}/availability.json`);
  const flag = (c: string): string => avail.countries.find((x: any) => x.slug === c)?.flag ?? "";
  const sourceName = (k: string): string => avail.sources.find((x: any) => x.key === k)?.name ?? k;
  const has = (c: string, k: string, list: ListKey): boolean => !!avail.combos?.[c]?.[k]?.includes(list);

  const catalogs: Array<{ type: string; id: string; name: string }> = [];
  for (const sel of cfg.sel) {
    const name = sourceName(sel.k);
    const f = flag(sel.c);
    if (sel.m && has(sel.c, sel.k, "movie")) catalogs.push({ type: "movie", id: sel.k, name: `${name} ${f}` });
    if (sel.s && has(sel.c, sel.k, "series")) catalogs.push({ type: "series", id: sel.k, name: `${name} ${f}` });
    if (cfg.kids && sel.m && has(sel.c, sel.k, "kids-movie")) {
      catalogs.push({ type: "movie", id: `${sel.k}-kids`, name: `${name} Jeunesse ${f}` });
    }
    if (cfg.kids && sel.s && has(sel.c, sel.k, "kids-series")) {
      catalogs.push({ type: "series", id: `${sel.k}-kids`, name: `${name} Jeunesse ${f}` });
    }
  }

  const types = [...new Set(catalogs.map((c) => c.type))];
  return {
    id: "fr.apertaa.top10.custom",
    version: `1.0.${String(avail.date || "").replace(/-/g, "")}`,
    name: ADDON_NAME,
    description: ADDON_DESC,
    logo: `${pages}/posters/_logo.png`,
    resources: ["catalog"],
    types: types.length ? types : ["movie", "series"],
    idPrefixes: ["tt", "tmdb:"],
    catalogs,
    // Pré-remplit la page de configuration avec la config actuelle (via le hash).
    behaviorHints: { configurable: true, configurationURL: `${origin}/configure#${cfgSeg}` },
  };
}

/** Contenu d'un catalogue : lit le bon fichier statique et construit les metas (affiches sur GitHub Pages). */
async function buildCatalog(cfgSeg: string, pages: string, type: string, id: string) {
  const cfg = decodeConfig(cfgSeg);
  const kids = id.endsWith("-kids");
  const key = kids ? id.slice(0, -"-kids".length) : id;
  const sel = cfg.sel.find((s) => s.k === key);
  if (!sel) return { metas: [] };

  const media = type === "series" ? "series" : "movie";
  const list = (kids ? `kids-${media}` : media) as ListKey;
  const data = await fetchJson(`${pages}/data/${sel.c}/${key}/${list}.json`).catch(() => null);
  if (!data?.entries) return { metas: [] };

  const metas = data.entries.map((e: any) => ({
    id: e.id,
    type: media,
    name: e.name,
    poster: `${pages}/posters/${sel.c}-${key}-${list}-${e.rank}.jpg?v=${data.date}`,
    posterShape: "poster",
  }));
  return { metas };
}

// ─────────── Utilitaires ───────────

/** Décode le segment de config (base64url → JSON), avec validation minimale. */
function decodeConfig(seg: string): Config {
  let b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const cfg = JSON.parse(atob(b64)) as Config;
  if (!cfg || !Array.isArray(cfg.sel)) throw new Error("config invalide");
  return cfg;
}

/** Récupère un JSON statique avec cache d'edge (10 min). */
async function fetchJson(target: string): Promise<any> {
  const r = await fetch(target, { cf: { cacheTtl: 600, cacheEverything: true } } as RequestInit);
  if (!r.ok) throw new Error(`fetch ${target} → HTTP ${r.status}`);
  return r.json();
}

function cors(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "*",
  };
}

function jsonHeaders(): Record<string, string> {
  return { "content-type": "application/json; charset=utf-8", "cache-control": "max-age=600", ...cors() };
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers: jsonHeaders() });
}

async function proxyJson(target: string): Promise<Response> {
  const r = await fetchJson(target);
  return json(r);
}

function html(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "max-age=600", ...cors() },
  });
}

function notFound(): Response {
  return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: jsonHeaders() });
}
