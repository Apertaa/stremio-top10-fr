/**
 * types.ts — types partagés du générateur « Top 10 FR ».
 *
 * Flux : FlixPatrol (Markdown via r.jina.ai) → `Entry` → résolution TMDB → `Title` → `MetaPreview` (objet Stremio).
 */

/** Type de média côté Stremio (catalogue/manifest). */
export type MediaType = "movie" | "series";

/** Type de média côté TMDB (endpoints). */
export type TmdbType = "movie" | "tv";

/** Tendance d'un titre dans le Top 10 (fournie par FlixPatrol). */
export type Trend = {
  dir: "up" | "down" | "same" | "new";
  delta: number | null; // nombre de places gagnées/perdues (null si inconnu)
};

/** Une entrée brute du Top 10 FlixPatrol (avant résolution TMDB). */
export type Entry = {
  rank: number; // 1..10
  title: string; // titre tel qu'affiché par FlixPatrol (souvent en anglais)
  fpSlug: string; // slug FlixPatrol (clé de cache stable + indice d'année)
  year: number | null; // année extraite du slug si présente
  days: number | null; // nombre de jours consécutifs dans le Top 10
  trend: Trend;
};

/** Un titre résolu sur TMDB (fiche FR + identifiants). */
export type Title = {
  tmdbId: number; // 0 si non résolu
  tmdbType: TmdbType;
  imdbId: string | null; // tt… (id du meta si présent)
  titleFr: string; // titre français (champ name)
  year: number | null;
  posterUrl: string | null; // affiche TMDB d'origine (source de l'affiche custom)
  rating: number | null; // note TMDB (vote_average), 0 → null
};

/** Objet « meta preview » d'un catalogue Stremio (une carte de la grille). */
export type MetaPreview = {
  id: string; // tt… ou tmdb:<id>
  type: MediaType;
  name: string;
  poster: string; // URL (affiche custom une fois l'étape 3 faite)
  posterShape?: "poster" | "square" | "landscape";
};

/** Configuration d'une plateforme (slug FlixPatrol + rendu + sections du Markdown). */
export type PlatformConfig = {
  slug: string; // slug FlixPatrol (ex. "netflix", "hbo-max")
  fpName: string; // nom lisible (debug/log)
  id: string; // id du catalogue Stremio (ex. "top10-netflix")
  name: string; // nom affiché dans Stremio (ex. "🔴 Netflix")
  /** En-têtes de section du Markdown FlixPatrol à utiliser, par type.
   *  La plupart ont `movie` + `series` ; Canal+ n'a pas de section films → on dérive de `overall`. */
  sections: { movie?: string; series: string; overall?: string };
};

/** Fichier d'historique (état de la veille : tendances + filet de sécurité). */
export type HistoryFile = {
  date: string;
  lists: Record<string, Array<{ rank: number; fpSlug: string; days: number | null }>>;
};
