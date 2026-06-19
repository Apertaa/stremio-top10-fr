/**
 * catalog.ts — écrit un fichier catalogue Stremio `public/catalog/<type>/<id>.json` = { metas: [...] }.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_DIR } from "../config.ts";
import type { MediaType, MetaPreview, PlatformConfig } from "../types.ts";

export function writeCatalog(platform: PlatformConfig, type: MediaType, metas: MetaPreview[]): void {
  const dir = join(PUBLIC_DIR, "catalog", type);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${platform.id}.json`), `${JSON.stringify({ metas }, null, 2)}\n`);
}
