/**
 * parse.ts — extrait les entrées du Top 10 depuis le Markdown FlixPatrol (rendu par r.jina.ai).
 *
 * Format d'une ligne de rang (vérifié sur données réelles) :
 *   `1.–[Maternal Instinct](https://flixpatrol.com/title/maternal-instinct/)7 d`
 *    │ │ │                  │                                              │
 *    │ │ │                  └ slug FlixPatrol (peut finir par -AAAA)        └ jours dans le top
 *    │ │ └ titre (souvent EN)
 *    │ └ tendance : `–`(stable) · `+N`(monte) · `-N`(descend) · `n/a`(nouveau)
 *    └ rang
 * Sections ciblées : `### TOP 10 Movies` / `### TOP 10 TV Shows` (on IGNORE `Kids …` et `Top ranked …`).
 */
import type { Entry, MediaType, PlatformConfig, Trend } from "../types.ts";

// Tendance non vide (tout ce qui suit le `.` du rang jusqu'au `[`), puis [titre](url …/title/slug/), puis « N d ».
const LINE_RE = /^(\d{1,2})\.([^[]*)\[([^\]]+)\]\(https:\/\/flixpatrol\.com\/title\/([^/)]+)\/?\)(?:\s*(\d+)\s*d)?/;

/** Parse le Markdown d'une plateforme → { movie: Entry[], series: Entry[] }. */
export function parseTop10(md: string, platform: PlatformConfig): Record<MediaType, Entry[]> {
  const series = parseSection(md, platform.sections.series);
  let movie: Entry[];
  if (platform.sections.movie) {
    movie = parseSection(md, platform.sections.movie);
  } else if (platform.sections.overall) {
    // Canal+ : pas de section « Movies » → films = « Overall » privé des séries, re-rangé 1..N.
    const seriesSlugs = new Set(series.map((e) => e.fpSlug));
    movie = parseSection(md, platform.sections.overall)
      .filter((e) => !seriesSlugs.has(e.fpSlug))
      .map((e, i) => ({ ...e, rank: i + 1 }));
  } else {
    movie = [];
  }
  return { movie, series };
}

/** Extrait les entrées d'une section `### <header>` (jusqu'à la section suivante). */
function parseSection(md: string, header: string): Entry[] {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.trim() === `### ${header}`);
  if (start < 0) return [];
  const out: Entry[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,4}\s/.test(lines[i] ?? "")) break; // début de la section suivante
    const m = (lines[i] ?? "").match(LINE_RE);
    if (m) out.push(toEntry(m));
  }
  return out;
}

function toEntry(m: RegExpMatchArray): Entry {
  const fpSlug = m[4] ?? "";
  return {
    rank: Number(m[1]),
    title: (m[3] ?? "").trim(),
    fpSlug,
    year: yearFromSlug(fpSlug),
    days: m[5] ? Number(m[5]) : null,
    trend: parseTrend(m[2] ?? ""),
  };
}

/** Interprète la chaîne de tendance FlixPatrol. */
export function parseTrend(s: string): Trend {
  const t = s.trim();
  if (t === "" || t.toLowerCase() === "n/a") return { dir: "new", delta: null };
  if (/^[–—-]$/.test(t)) return { dir: "same", delta: 0 }; // tiret seul = stable
  const m = t.match(/^([+\-–—])(\d+)$/);
  if (m) return { dir: m[1] === "+" ? "up" : "down", delta: Number(m[2]) };
  return { dir: "same", delta: null };
}

/** Année si le slug finit par `-AAAA` (ex. « the-stranger-2025 » → 2025). */
function yearFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d{4})$/);
  if (!m) return null;
  const y = Number(m[1]);
  return y >= 1900 && y <= 2100 ? y : null;
}
