/**
 * legacy.ts — écrit le manifest + catalogues « France par défaut » servis directement par GitHub Pages.
 *
 * But : l'URL simple `…/manifest.json` reste valable (rétro-compat des installs existants) ET offre une
 * installation SANS configuration (France, les 7 plateformes, films+séries grand public). La version
 * personnalisable, elle, passe par le Worker Cloudflare. Les affiches pointent vers les fichiers communs
 * `posters/france-…` (aucune duplication). Ids de catalogue historiques `top10-<source>` conservés.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BASE_URL, BUILD_DATE, DEFAULT_COUNTRY, PLATFORMS, POSTER_SHAPE, PUBLIC_DIR, posterKey } from "../config.ts";
import type { ListKey, MediaType, MetaPreview } from "../types.ts";
import { readDataFile } from "./data.ts";

const LEGACY_LISTS: Array<{ list: ListKey; type: MediaType }> = [
  { list: "movie", type: "movie" },
  { list: "series", type: "series" },
];

/** Écrit `public/manifest.json` + `public/catalog/<type>/top10-<source>.json` pour la France. */
export function writeLegacyFrance(): void {
  const catalogs: Array<{ type: MediaType; id: string; name: string }> = [];

  for (const p of PLATFORMS) {
    for (const { list, type } of LEGACY_LISTS) {
      const data = readDataFile(DEFAULT_COUNTRY, p.key, list);
      if (!data?.entries?.length) continue;
      const metas: MetaPreview[] = data.entries.map((e) => ({
        id: e.id,
        type,
        name: e.name,
        poster: `${BASE_URL}/posters/${posterKey(DEFAULT_COUNTRY, p.key, list, e.rank)}.jpg?v=${data.date}`,
        posterShape: POSTER_SHAPE,
      }));
      const dir = join(PUBLIC_DIR, "catalog", type);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `top10-${p.key}.json`), `${JSON.stringify({ metas }, null, 2)}\n`);
      catalogs.push({ type, id: `top10-${p.key}`, name: p.name });
    }
  }

  const manifest = {
    id: "fr.apertaa.top10",
    version: `1.0.${BUILD_DATE}`,
    name: "Top 10 FR 🔟",
    description:
      "Les vrais Top 10 du jour par plateforme en France (Netflix, Disney+, Prime Video, Apple TV+, " +
      "HBO Max, Paramount+, Canal+) — films et séries, mis à jour chaque jour. Version personnalisable " +
      "(autres pays, jeunesse, toutes plateformes) : voir la page de configuration.",
    logo: `${BASE_URL}/posters/_logo.png`,
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt", "tmdb:"],
    catalogs,
    behaviorHints: { configurable: false },
  };
  writeFileSync(join(PUBLIC_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}
