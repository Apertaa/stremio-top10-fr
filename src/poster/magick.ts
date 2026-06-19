/**
 * magick.ts — compose une affiche custom (gros chiffre de rang « façon Netflix » + affiche TMDB) via ImageMagick.
 *
 * Format poster 2:3 (compatible avec la grille Stremio/Nuvio) : l'affiche TMDB occupe tout le cadre, et le
 * numéro de rang est incrusté en bas-gauche, gros, gris très foncé + fin contour clair, avec une ombre portée
 * douce pour rester lisible quelle que soit l'affiche (claire ou sombre). Un léger dégradé sombre en bas
 * renforce le contraste sans masquer l'affiche.
 */
import { spawnSync } from "node:child_process";
import type { Variant } from "./variants.ts";

const BIN = spawnSync("magick", ["-version"], { encoding: "utf8" }).status === 0 ? "magick" : "convert";

/** Compose l'affiche et l'écrit dans `out`. Throw si ImageMagick échoue. */
export function compose(posterPath: string | null, rank: number, v: Variant, out: string): void {
  const { width: W, height: H } = v;
  const numH = Math.round(H * 0.4); // hauteur du chiffre ≈ 40% de l'affiche
  const margin = Math.round(W * 0.035);

  const args: string[] = ["-size", `${W}x${H}`, `canvas:${v.bg}`];

  // 1) Affiche TMDB plein cadre (ou fond noir seul si absente)
  if (posterPath) {
    args.push("(", posterPath, "-resize", `${W}x${H}^`, "-gravity", "center", "-extent", `${W}x${H}`, ")", "-composite");
  }
  // 2) Léger dégradé sombre en bas (décolle le chiffre des affiches claires, sans masquer l'affiche)
  args.push(
    "(", "-size", `${W}x${Math.round(H * 0.3)}`, "gradient:none-black", ")",
    "-gravity", "South", "-geometry", "+0+0", "-compose", "over", "-composite",
  );
  // 3) Le chiffre (remplissage foncé + contour clair = effet « outline »), avec ombre portée, en bas-gauche
  args.push(
    "(",
    "(", "-background", "none", "-fill", v.numberFill, "-stroke", v.numberStroke, "-strokewidth", String(v.strokeWidth),
    "-font", v.font, "-pointsize", String(Math.round(numH * 1.4)), `label:${rank}`, "-trim", "+repage", "-resize", `x${numH}`, ")",
    "(", "+clone", "-background", "black", "-shadow", "90x6+0+3", ")", "+swap", "-background", "none", "-layers", "merge", "+repage",
    ")",
    "-gravity", "SouthWest", "-geometry", `+${margin}+${margin}`, "-composite",
  );

  args.push("-quality", "88", out);

  const r = spawnSync(BIN, args, { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`ImageMagick a échoué (rang ${rank}) : ${(r.stderr || r.error?.message || "").slice(0, 300)}`);
  }
}
