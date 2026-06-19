/**
 * meta.ts — convertit un `Title` résolu en objet « meta preview » Stremio (une carte de grille).
 *
 * L'affiche pointe vers notre affiche custom (gros chiffre de rang) servie par GitHub Pages — ou par le
 * tunnel en test (cf. `BASE_URL`). Le paramètre `?v=<date>` casse le cache CDN pour forcer le rafraîchissement.
 */
import { BASE_URL, BUILD_DATE, POSTER_SHAPE } from "../config.ts";
import type { Entry, MediaType, MetaPreview, Title } from "../types.ts";

export function toMetaPreview(title: Title, entry: Entry, posterKey: string): MetaPreview {
  const type: MediaType = title.tmdbType === "tv" ? "series" : "movie";
  return {
    id: title.imdbId ?? (title.tmdbId ? `tmdb:${title.tmdbId}` : `top10:${entry.fpSlug}`),
    type,
    name: title.titleFr,
    poster: `${BASE_URL}/posters/${posterKey}.jpg?v=${BUILD_DATE}`,
    posterShape: POSTER_SHAPE,
  };
}
