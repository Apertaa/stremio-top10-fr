# Contribuer à Top 10 FR

Merci de l'intérêt que tu portes au projet ! Les contributions — corrections, nouvelles plateformes,
support d'autres pays, idées — sont les bienvenues. Ce guide explique comment t'y prendre.

## Signaler un bug ou proposer une idée

Ouvre une [issue](https://github.com/Apertaa/stremio-top10-fr/issues) en utilisant le modèle adapté
(*bug* ou *demande de plateforme / pays*). Donne un maximum de contexte : ce que tu attendais, ce qui se
passe, et si possible la plateforme et la date concernées.

Pour un changement non trivial, **ouvre d'abord une issue** pour en discuter avant de coder : ça évite le
travail en double.

## Mettre en place l'environnement

Prérequis : [Bun](https://bun.sh) et [ImageMagick](https://imagemagick.org) installés, plus une
[clé TMDB gratuite](https://www.themoviedb.org/settings/api).

```bash
git clone https://github.com/<ton-pseudo>/stremio-top10-fr.git
cd stremio-top10-fr
cp .env.example .env        # renseigne TMDB_READ_TOKEN (et TMDB_API_KEY)

bun run dry                 # scrape + résolution TMDB, SANS rien écrire (test rapide)
bun run build               # génère réellement public/
bun run verify              # valide les données produites
bun run lint                # style (Biome)
bun run typecheck           # types (tsc)
```

Le **Worker** (dossier `worker/`) se teste avec Wrangler, branché sur les données locales :

```bash
bun run serve                                                   # sert public/ sur :8088
cd worker && bunx wrangler dev --var PAGES_BASE:http://localhost:8088
```

## Conventions de code

Le style est appliqué par [Biome](https://biomejs.dev) (voir `biome.json`). Avant de proposer une PR,
lance `bun run lint`. En résumé :

- Runtime **Bun**, TypeScript exécuté directement (pas d'étape de build).
- **Identifiants en anglais**, **commentaires et messages en français**.
- 2 espaces d'indentation, guillemets doubles, point-virgules, virgules finales.
- En-tête de fichier en commentaire `/** … */` décrivant son rôle.
- Pas de secret en clair, jamais (ni dans le code, ni dans les logs).

## Ajouter une plateforme

1. Trouve le `slug` FlixPatrol de la plateforme (dans l'URL : `flixpatrol.com/top10/<slug>/france/`).
2. Ajoute une entrée `Source` dans `PLATFORMS` (`src/config.ts`) : `key` (identifiant court, ex. `netflix`),
   `slug` (FlixPatrol), `name` (avec emoji) et `sections` (en-têtes des sections du Markdown FlixPatrol).
3. Teste : `bun run src/generate.ts build --only=<key> --country=france`.

## Proposer une pull request

1. Crée une branche depuis `main`.
2. Fais des commits clairs (messages **en français**, à l'impératif : « Ajoute… », « Corrige… »).
3. Vérifie que `bun run lint` et `bun run dry` passent.
4. Ouvre la PR en décrivant le *quoi* et le *pourquoi*, et en liant l'issue concernée.

## Note sur les fichiers générés

`public/` (`data/`, `availability.json`, affiches) et `cache/tmdb-map.json` sont **régénérés par le robot**.
Ne les modifie pas à la main dans une PR : concentre-toi sur le code de `src/` et `worker/`.

Merci 🙏
