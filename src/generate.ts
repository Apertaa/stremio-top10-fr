#!/usr/bin/env bun
/**
 * generate.ts — orchestrateur + CLI du générateur « Top 10 FR ».
 *
 * Pour chaque plateforme et chaque type (films/séries) : scrape FlixPatrol (via r.jina.ai) → parse →
 * résout chaque titre sur TMDB (fiche FR + IMDb) → écrit le catalogue Stremio. Puis écrit le manifest.
 *
 * Commandes :
 *   (défaut) build [--dry] [--only=<slug>]   pipeline complet ; --dry n'écrit rien (debug/CI) ; --only cible une plateforme
 *   scrape <slug>                            dump du Markdown brut d'une plateforme (debug parsing)
 *   verify                                   valide les catalogues produits (10 entrées, ids, posters)
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MEDIA_TYPES, PLATFORMS, PUBLIC_DIR } from "./config.ts";
import { writeCatalog } from "./build/catalog.ts";
import { writeManifest } from "./build/manifest.ts";
import { toMetaPreview } from "./build/meta.ts";
import { fetchTop10 } from "./scrape/flixpatrol.ts";
import { parseTop10 } from "./scrape/parse.ts";
import { loadCache, saveCache } from "./tmdb/cache.ts";
import { resolveTitle } from "./tmdb/resolve.ts";
import type { MetaPreview } from "./types.ts";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const cmd = positional[0] ?? "build";
const dry = args.includes("--dry");
const only = args.find((a) => a.startsWith("--only="))?.slice("--only=".length);

async function build(): Promise<void> {
  const platforms = only ? PLATFORMS.filter((p) => p.slug === only || p.id === only) : PLATFORMS;
  if (!platforms.length) throw new Error(`Aucune plateforme ne correspond à --only=${only}`);

  const cache = loadCache();
  let catalogs = 0;
  for (const platform of platforms) {
    console.error(`\n📡 ${platform.name} (${platform.slug})`);
    const md = await fetchTop10(platform.slug);
    const parsed = parseTop10(md, platform);
    for (const type of MEDIA_TYPES) {
      const metas: MetaPreview[] = [];
      for (const entry of parsed[type]) {
        const title = await resolveTitle(entry, type, cache);
        metas.push(toMetaPreview(title, entry));
      }
      console.error(`   ${type === "movie" ? "🎬 Films " : "📺 Séries"} : ${metas.length} titres`);
      if (dry) metas.forEach((m, i) => console.error(`      ${String(i + 1).padStart(2)}. ${m.name}  [${m.id}]`));
      else {
        writeCatalog(platform, type, metas);
        catalogs++;
      }
    }
  }

  saveCache(cache); // on garde les correspondances trouvées, même en --dry
  if (!dry) {
    writeManifest(PLATFORMS); // le manifest liste TOUJOURS les 7 plateformes, même avec --only
    console.error(`\n✅ ${catalogs} catalogues + manifest écrits dans public/.`);
  }
}

/** Valide les fichiers produits : chaque catalogue du manifest existe, est non vide, metas bien formées. */
async function verify(): Promise<void> {
  const manifestFile = join(PUBLIC_DIR, "manifest.json");
  if (!existsSync(manifestFile)) throw new Error("public/manifest.json absent — lance d'abord `build`.");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  let problems = 0;
  for (const cat of manifest.catalogs) {
    const file = join(PUBLIC_DIR, "catalog", cat.type, `${cat.id}.json`);
    if (!existsSync(file)) {
      console.error(`❌ catalogue manquant : ${cat.type}/${cat.id}`);
      problems++;
      continue;
    }
    const metas = JSON.parse(readFileSync(file, "utf8")).metas;
    const bad = metas.filter((m: any) => !m.id || !m.type || !m.name || !m.poster).length;
    const unresolved = metas.filter((m: any) => String(m.id).startsWith("top10:")).length;
    if (!metas.length || bad) problems++;
    console.error(`${!metas.length || bad ? "❌" : "✅"} ${cat.type}/${cat.id} : ${metas.length} metas${bad ? `, ${bad} incomplètes` : ""}${unresolved ? `, ${unresolved} non résolus` : ""}`);
  }
  console.error(problems ? `\n⚠️ ${problems} problème(s).` : "\n✅ Tous les catalogues sont valides.");
  if (problems) process.exit(1);
}

async function main(): Promise<void> {
  switch (cmd) {
    case "build":
      await build();
      break;
    case "verify":
      await verify();
      break;
    case "scrape": {
      const slug = positional[1];
      if (!slug) throw new Error("Usage : scrape <slug>");
      console.log(await fetchTop10(slug));
      break;
    }
    default:
      console.error("Commandes : build [--dry] [--only=<slug>]  ·  scrape <slug>  ·  verify");
      process.exit(1);
  }
}

main().catch((e) => {
  console.error("Erreur :", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
