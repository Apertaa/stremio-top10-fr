/**
 * flixpatrol.ts — récupère le Top 10 d'une plateforme depuis FlixPatrol.
 *
 * FlixPatrol bloque les IP de datacenter (HTTP 403). On passe donc par le proxy de lecture
 * gratuit `r.jina.ai`, qui renvoie la page en Markdown. ⚠️ r.jina.ai renvoie HTTP 200 MÊME sur
 * une page 404 de FlixPatrol → on valide le CONTENU (présence du titre « TOP 10 … in France »
 * et absence de « Page Not Found »), pas seulement le code HTTP.
 */
const JINA = "https://r.jina.ai/";
const FLIXPATROL = "https://flixpatrol.com/top10/";
const UA = "stremio-top10-fr/1.0 (+https://github.com/Apertaa/stremio-top10-fr)";
const TIMEOUT_MS = 45_000; // r.jina.ai rend la page côté serveur → lent
const RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Récupère le Markdown du Top 10 FlixPatrol pour `slug` (France). Throw après échecs/contenu invalide. */
export async function fetchTop10(slug: string): Promise<string> {
  const url = `${JINA}${FLIXPATROL}${slug}/france/`;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": UA, "X-Return-Format": "markdown", Accept: "text/plain" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const md = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!isValidTop10(md)) throw new Error("page invalide (404 / slug erroné / contenu absent)");
      return md;
    } catch (e) {
      lastErr = e;
      if (attempt < RETRIES) await sleep(attempt * 3000); // backoff 3s, 6s
    }
  }
  throw new Error(`fetchTop10(${slug}) a échoué après ${RETRIES} essais : ${err(lastErr)}`);
}

/** Vrai si le Markdown est bien une page Top 10 valide (et pas une 404 déguisée en 200). */
export function isValidTop10(md: string): boolean {
  return /TOP 10 on .+ in France/i.test(md) && !/Page Not Found/i.test(md);
}

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
