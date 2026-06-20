/**
 * variants.ts — réglages de rendu des affiches custom.
 *
 * Format figé : poster 2:3 (compatible grille Stremio/Nuvio), chiffre en bas-gauche. On garde 2 variantes
 * de POLICE à comparer sur la TV : « archivo » (large, proche Netflix Sans) et « anton » (condensée, plus haute).
 */
import { join } from "node:path";
import { ROOT } from "../config.ts";

export type Variant = {
  name: string;
  shape: "poster";
  width: number;
  height: number;
  font: string; // chemin du TTF embarqué
  numberFill: string; // gris très foncé (façon Netflix)
  numberStroke: string; // fin contour clair
  strokeWidth: number;
  numberHeightRatio: number; // hauteur du chiffre en fraction de la hauteur de l'affiche (0.4 = 40 %)
  bg: string;
};

const FONT = {
  archivo: join(ROOT, "assets/fonts/ArchivoBlack-Regular.ttf"),
  anton: join(ROOT, "assets/fonts/Anton-Regular.ttf"),
};

const BASE = {
  shape: "poster" as const,
  width: 600,
  height: 900,
  numberFill: "rgba(0,0,0,0.30)", // remplissage noir SEMI-TRANSPARENT (opacité 30 %) → on voit l'affiche derrière
  numberStroke: "#9a9a9a", // contour gris clair opaque → dessine le chiffre même sur fond sombre
  strokeWidth: 6,
  numberHeightRatio: 0.25, // chiffre = 25 % de la hauteur → sommet à ~73 %, sous la bande du rendu paysage Nuvio (mesurée à y≈634/900) avec marge ; le chiffre disparaît en vue horizontale
  bg: "#000000",
};

export const VARIANTS: Record<string, Variant> = {
  archivo: { name: "archivo", ...BASE, font: FONT.archivo },
  anton: { name: "anton", ...BASE, font: FONT.anton },
};

export const DEFAULT_VARIANT = "archivo";
