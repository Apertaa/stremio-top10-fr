/**
 * manifest.ts — écrit `public/manifest.json`.
 *
 * Addon catalogue PUR (`resources: ["catalog"]`) : la fiche détail et les flux viennent des addons déjà
 * installés (Cinemeta + AIOMetadata + AIOStreams) → lecture et sous-titres FR préservés. Les ids des metas
 * sont des `tt…` (IMDb) → Stremio relie chaque titre aux autres addons.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PAGES_BASE, PUBLIC_DIR } from "../config.ts";
import type { PlatformConfig } from "../types.ts";

export function writeManifest(platforms: PlatformConfig[]): void {
  const catalogs = platforms.flatMap((p) => [
    { type: "movie", id: p.id, name: p.name },
    { type: "series", id: p.id, name: p.name },
  ]);
  const manifest = {
    id: "fr.apertaa.top10",
    version: `1.0.${buildDate()}`,
    name: "Top 10 FR 🔟",
    description:
      "Les vrais Top 10 du jour par plateforme en France (Netflix, Disney+, Prime Video, Apple TV+, HBO Max, Paramount+, Canal+) — films et séries, mis à jour chaque jour.",
    logo: `${PAGES_BASE}/posters/_logo.png`,
    resources: ["catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt", "tmdb:"],
    catalogs,
    behaviorHints: { configurable: false },
  };
  writeFileSync(join(PUBLIC_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Date du jour AAAAMMJJ (UTC) — sert de patch de version pour aider les clients à revalider. */
function buildDate(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
}
