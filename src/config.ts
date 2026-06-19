/**
 * config.ts — constantes du générateur « Top 10 FR » (plateformes, chemins, réglages).
 *
 * Les chemins sont résolus par rapport à la RACINE du dépôt (calculée depuis ce fichier),
 * pour que le générateur écrive au bon endroit quel que soit le répertoire courant.
 */
import { dirname, join } from "node:path";
import type { MediaType, PlatformConfig } from "./types.ts";

// ─────────── Chemins ───────────
/** Racine du dépôt : ce fichier vit dans `src/`, donc on remonte d'un cran. */
export const ROOT = dirname(import.meta.dir);
export const PUBLIC_DIR = join(ROOT, "public");
export const CACHE_DIR = join(ROOT, "cache");
export const DATA_DIR = join(ROOT, "data");
export const POSTERS_DIR = join(PUBLIC_DIR, "posters");

// ─────────── Publication ───────────
/** Déploiement de référence — dernier repli quand on tourne hors CI et sans override. */
export const PAGES_BASE = "https://apertaa.github.io/stremio-top10-fr";

/**
 * Base de l'URL publique servie (sert à fabriquer les URLs d'affiches), par ordre de priorité :
 *   1. `ADDON_BASE_URL` — override explicite (dev local, tunnel, domaine perso) ;
 *   2. en CI GitHub Actions : dérivée de `GITHUB_REPOSITORY` → l'URL GitHub Pages du dépôt.
 *      Un FORK fonctionne ainsi SANS configuration : ses affiches pointent vers SON propre Pages ;
 *   3. à défaut : le déploiement de référence ci-dessus.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.ADDON_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const repo = process.env.GITHUB_REPOSITORY?.trim(); // format "owner/name"
  if (repo?.includes("/")) {
    const [owner, name] = repo.split("/");
    const host = `${owner.toLowerCase()}.github.io`;
    // Dépôt nommé « owner.github.io » → Pages à la racine ; sinon Pages de projet « /name ».
    return name.toLowerCase() === host ? `https://${host}` : `https://${host}/${name}`;
  }
  return PAGES_BASE;
}

/** Base réellement servie (voir `resolveBaseUrl`). */
export const BASE_URL = resolveBaseUrl();
/** Préfixe des affiches TMDB (w780 = bon compromis qualité/poids). */
export const TMDB_IMG = "https://image.tmdb.org/t/p/w780";
/** Date du run AAAAMMJJ (UTC) — version du manifest + paramètre anti-cache des affiches. */
export const BUILD_DATE = ((d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
})();

// ─────────── Réglages ───────────
/** Types de média traités, dans l'ordre. */
export const MEDIA_TYPES: MediaType[] = ["movie", "series"];
/** Seuil de santé : en dessous de N entrées résolues, on garde la veille (filet de sécurité). */
export const HEALTH_MIN = 8;
/** Forme d'affiche (figée après validation visuelle TV — étape 3). */
export const POSTER_SHAPE: MetaShape = "poster";

type MetaShape = "poster" | "square" | "landscape";

// ─────────── Plateformes (ordre = celui de l'accueil de Sébastien) ───────────
const STD_SECTIONS = { movie: "TOP 10 Movies", series: "TOP 10 TV Shows" } as const;

export const PLATFORMS: PlatformConfig[] = [
  { slug: "netflix", fpName: "Netflix", id: "top10-netflix", name: "🔴 Netflix", sections: { ...STD_SECTIONS } },
  { slug: "disney", fpName: "Disney+", id: "top10-disney", name: "🏰 Disney+", sections: { ...STD_SECTIONS } },
  {
    slug: "amazon-prime",
    fpName: "Amazon Prime Video",
    id: "top10-prime",
    name: "📦 Prime Video",
    sections: { ...STD_SECTIONS },
  },
  { slug: "apple-tv", fpName: "Apple TV+", id: "top10-apple", name: "🍎 Apple TV+", sections: { ...STD_SECTIONS } },
  { slug: "hbo-max", fpName: "HBO Max", id: "top10-hbo", name: "🎭 HBO Max", sections: { ...STD_SECTIONS } },
  {
    slug: "paramount-plus",
    fpName: "Paramount+",
    id: "top10-paramount",
    name: "🗻 Paramount+",
    sections: { ...STD_SECTIONS },
  },
  // Canal+ : FlixPatrol n'expose pas de section « Movies » → films = « Overall » moins les séries.
  {
    slug: "canal",
    fpName: "Canal+",
    id: "top10-canal",
    name: "📡 Canal+",
    sections: { series: "TOP 10 TV Shows", overall: "TOP 10 Overall" },
  },
];
