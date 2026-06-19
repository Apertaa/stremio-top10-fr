/**
 * meta.ts — convertit un `Title` résolu en objet « meta preview » Stremio (une carte de grille).
 *
 * Note : à l'étape 1, l'affiche = celle de TMDB. À l'étape 3, `poster` pointera vers notre affiche
 * custom (gros chiffre de rang) servie par GitHub Pages — c'est le seul endroit à faire évoluer.
 */
import { POSTER_SHAPE } from "../config.ts";
import type { Entry, MediaType, MetaPreview, Title } from "../types.ts";

export function toMetaPreview(title: Title, entry: Entry): MetaPreview {
  const type: MediaType = title.tmdbType === "tv" ? "series" : "movie";
  return {
    id: title.imdbId ?? (title.tmdbId ? `tmdb:${title.tmdbId}` : `top10:${entry.fpSlug}`),
    type,
    name: title.titleFr,
    poster: title.posterUrl ?? placeholder(title.titleFr),
    posterShape: POSTER_SHAPE,
  };
}

/** Affiche de secours (titre rarement introuvable sur TMDB) — remplacée par l'affiche custom à l'étape 3. */
function placeholder(label: string): string {
  return `https://placehold.co/600x900/141414/cccccc/png?text=${encodeURIComponent(label.slice(0, 24))}`;
}
