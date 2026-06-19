# Top 10 FR 🔟 — addon Stremio

Les **vrais Top 10 du jour** par plateforme de streaming en **France** — Netflix, Disney+, Prime Video,
Apple TV+, HBO Max, Paramount+, Canal+ — **films et séries**, avec des **affiches « gros chiffre » façon
Netflix**.

Addon **catalogue** Stremio (lu aussi par l'app Android TV **Nuvio**), **100 % statique**, **régénéré chaque
jour** par GitHub Actions — aucun serveur à maintenir, aucun ordinateur à laisser allumé.

## Installer

Ajoute cette URL dans Stremio (ou Nuvio) :

```
https://apertaa.github.io/stremio-top10-fr/manifest.json
```

## Comment ça marche

```
GitHub Actions (chaque jour, automatiquement)
  1. récupère le Top 10 du jour de chaque plateforme depuis FlixPatrol (via le proxy de lecture r.jina.ai)
  2. retrouve chaque titre sur TMDB → fiche française (titre, affiche, note) + identifiant IMDb
  3. fabrique une affiche avec le gros chiffre de rang incrusté (façon Netflix)
  4. écrit les fichiers JSON de l'addon (manifest + catalogues) dans public/
GitHub Pages publie public/ → Stremio / Nuvio lisent l'addon
```

C'est un addon **catalogue pur** : il fournit les listes et les affiches, mais la fiche détaillée et la
lecture viennent de tes autres addons (Cinemeta, AIOMetadata, AIOStreams) — la VF et les sous-titres restent
donc intacts.

## Données

- **Top 10** : [FlixPatrol](https://flixpatrol.com) (le « Top 10 du jour » affiché dans les apps, audiences
  réelles), récupéré via le proxy de lecture gratuit [r.jina.ai](https://r.jina.ai) (FlixPatrol bloque les
  serveurs ; ce proxy contourne).
- **Fiches FR** : [TMDB](https://www.themoviedb.org) (titre français, affiche, note, identifiant IMDb).

## Développement

Projet **Bun** (TypeScript exécuté directement, sans build).

```bash
cp .env.example .env        # puis renseigne TMDB_READ_TOKEN (et TMDB_API_KEY)
bun run build               # génère public/ (les 14 catalogues + manifest)
bun run dry                 # même chose sans rien écrire (debug)
bun run verify              # valide les catalogues produits
bun run src/generate.ts build --only=netflix   # une seule plateforme
bun run src/generate.ts scrape netflix          # dump du Markdown FlixPatrol (debug)
bun run serve               # sert public/ en local sur http://localhost:8088
```

### Arborescence

```
src/        code source (scrape FlixPatrol · résolution TMDB · génération · orchestrateur)
public/     ← publié par GitHub Pages : manifest.json + catalog/<type>/<id>.json + posters/
cache/      cache des correspondances titre → TMDB (versionné, accélère et stabilise)
data/       historique (tendances de la veille + filet de sécurité)
```

## Pourquoi ce projet

L'addon tiers « TOP Streaming » avait un bug serveur sur certains catalogues séries (listes périmées,
contamination entre plateformes). Cet addon fait la même chose **sous notre contrôle** : plus frais, plus
fiable, et avec le **numéro de rang** que les autres addons n'affichent pas.
