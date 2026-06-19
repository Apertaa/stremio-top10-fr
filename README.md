# Top 10 FR 🔟

> Les **vrais Top 10 du jour** des plateformes de streaming en **France**, dans Stremio — avec les
> **affiches « gros chiffre » façon Netflix**.

[![Build quotidien](https://github.com/Apertaa/stremio-top10-fr/actions/workflows/daily.yml/badge.svg)](https://github.com/Apertaa/stremio-top10-fr/actions/workflows/daily.yml)
[![Licence : MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)
[![Fait avec Bun](https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white)](https://bun.sh)
![Hébergé sur GitHub Pages](https://img.shields.io/badge/h%C3%A9bergement-GitHub%20Pages-222?logo=githubpages)

Un addon **catalogue** pour [Stremio](https://www.stremio.com) (lu aussi par l'app Android TV
[Nuvio](https://github.com/NuvioMedia)) qui ajoute, pour chaque grande plateforme, le **Top 10 du jour en
France** — **films et séries** — avec le **numéro de classement incrusté sur l'affiche**, comme dans l'app
Netflix.

Il est **100 % statique** et **régénéré chaque jour** par un robot GitHub Actions : aucun serveur à
maintenir, aucun ordinateur à laisser allumé.

![Aperçu — affiches Top 10 avec le gros chiffre de classement](assets/preview.jpg)

---

## 📥 Installation (déploiement public)

Une instance publique est déjà en ligne et mise à jour tous les jours. Pour l'utiliser, ajoute simplement
cette URL dans Stremio ou Nuvio (**Addons → Add addon / coller une URL**) :

```
https://apertaa.github.io/stremio-top10-fr/manifest.json
```

Tu obtiens **14 catalogues** (7 plateformes × films/séries) :

> 🔴 Netflix · 🏰 Disney+ · 📦 Prime Video · 🍎 Apple TV+ · 🎭 HBO Max · 🗻 Paramount+ · 📡 Canal+

*(Tu préfères héberger ta propre instance, ou viser un autre pays ? → [Déployer votre instance](#-déployer-votre-instance-fork).)*

---

## ✨ Fonctionnalités

- **Le vrai Top 10 du jour**, pas un catalogue de « disponibilité » : les classements proviennent des
  audiences réelles ([FlixPatrol](https://flixpatrol.com)), films **et** séries.
- **Affiches « gros chiffre »** générées sur mesure (1 → 10), avec un chiffre **semi-transparent** qui
  laisse voir l'affiche derrière — façon rangée « Top 10 » de Netflix.
- **Fiches en français** : titre, affiche et note récupérés sur [TMDB](https://www.themoviedb.org) en
  `fr-FR`, avec l'identifiant IMDb pour que tes autres addons reconnaissent le titre.
- **Catalogue pur** : il fournit les listes et les affiches, mais **ne touche ni aux fiches détaillées ni à
  la lecture** — celles-ci continuent de venir de tes addons habituels (Cinemeta, AIOMetadata, AIOStreams…),
  donc la VF et les sous-titres restent intacts.
- **Autonome et gratuit** : régénéré chaque jour par GitHub Actions, servi par GitHub Pages.
- **Robuste** : si une source échoue un jour, l'addon **conserve la liste de la veille** au lieu de se vider.

---

## ⚙️ Comment ça marche

```
┌── Robot GitHub Actions (chaque jour à 16 h UTC, automatiquement) ──────────────────────┐
│                                                                                        │
│  1. Récupère le Top 10 du jour de chaque plateforme sur FlixPatrol                      │
│     (via le proxy de lecture r.jina.ai, car FlixPatrol bloque les serveurs)            │
│  2. Retrouve chaque titre sur TMDB → fiche FR (titre, affiche, note) + identifiant IMDb │
│  3. Fabrique une affiche avec le gros chiffre de classement incrusté (ImageMagick)      │
│  4. Écrit les fichiers JSON de l'addon (manifest + 14 catalogues) dans public/          │
│                                                                                        │
└────────────────────────────────────┬───────────────────────────────────────────────────┘
                                      ▼
              GitHub Pages publie public/  →  Stremio / Nuvio lisent l'addon
```

L'horaire de 16 h UTC (18 h à Paris) est choisi pour passer **après** la publication des Top 10 par
FlixPatrol (classements généraux vers 11 h UTC, **Netflix pas avant 15 h UTC**) : on récupère ainsi le
classement du **jour même**.

---

## 🚀 Déployer votre instance (fork)

Forker est utile si tu veux **ton propre hébergement**, un **autre pays**, ou des **plateformes
différentes**. Le projet est prévu pour fonctionner sur un fork **sans modifier le code** : l'URL publique
est déduite automatiquement de ton dépôt.

### Prérequis

- Un **compte GitHub** (gratuit).
- Une **clé API TMDB** (gratuite) — voir ci-dessous.

### Obtenir une clé TMDB (gratuit)

1. Crée un compte sur [themoviedb.org](https://www.themoviedb.org/signup).
2. Va dans **Paramètres → API** ([lien direct](https://www.themoviedb.org/settings/api)) et demande une clé
   « Developer » (usage gratuit).
3. Note les deux valeurs :
   - **API Read Access Token** (v4) — un long jeton qui commence par `eyJ…` → `TMDB_READ_TOKEN` ;
   - **API Key** (v3) — une chaîne courte → `TMDB_API_KEY` (utilisée en repli).

### Étapes

1. **Fork** ce dépôt (bouton *Fork* en haut à droite).
2. **Ajoute tes secrets** dans ton fork : *Settings → Secrets and variables → Actions → New repository
   secret*, et crée :
   - `TMDB_READ_TOKEN` = ton jeton v4 ;
   - `TMDB_API_KEY` = ta clé v3.
3. **Active GitHub Pages** : *Settings → Pages → Build and deployment → Source =* **GitHub Actions**.
4. **Active les workflows** : onglet *Actions* → clique sur *« I understand my workflows, go ahead and
   enable them »* (GitHub désactive les Actions sur les forks par défaut).
5. **Lance un premier build** : *Actions → daily → Run workflow*. Au bout de ~2 min, ton addon est en ligne
   à l'adresse :
   ```
   https://<ton-pseudo>.github.io/<nom-du-dépôt>/manifest.json
   ```
6. **Installe** cette URL dans Stremio / Nuvio.

Ensuite, le robot se relance **tout seul chaque jour**.

---

## 🔧 Configuration & personnalisation

| Je veux… | Où | Comment |
|---|---|---|
| Changer **l'heure** du build quotidien | `.github/workflows/daily.yml` | Modifier le `cron`. ⚠️ Reste **après 15 h UTC** pour avoir Netflix à jour. |
| Ajouter / retirer une **plateforme** | `src/config.ts` (`PLATFORMS`) | Ajouter une entrée avec le bon `slug` FlixPatrol (ex. `hbo-max`, `apple-tv`). |
| Viser un autre **pays** | `src/scrape/flixpatrol.ts` | Remplacer `france` (URL + validation `in France`). Pense aussi à la langue des fiches dans `src/tmdb/resolve.ts`. |
| Forcer une **URL publique** (domaine perso, tunnel) | variable d'env `ADDON_BASE_URL` | Sinon l'URL est déduite automatiquement (`GITHUB_REPOSITORY` en CI). |

### Variables d'environnement

| Variable | Rôle | Requis |
|---|---|---|
| `TMDB_READ_TOKEN` | Jeton TMDB v4 (Bearer), utilisé en priorité | **Oui** |
| `TMDB_API_KEY` | Clé TMDB v3, repli | Recommandé |
| `ADDON_BASE_URL` | Force la base des URLs d'affiches (sinon déduite du dépôt) | Non |

---

## 💻 Développement local

Projet [**Bun**](https://bun.sh) (TypeScript exécuté directement, sans étape de build). Nécessite aussi
[**ImageMagick**](https://imagemagick.org) pour générer les affiches.

```bash
git clone https://github.com/Apertaa/stremio-top10-fr.git
cd stremio-top10-fr

cp .env.example .env        # puis renseigne TMDB_READ_TOKEN (et TMDB_API_KEY)

bun run build               # génère public/ (les 14 catalogues + manifest + affiches)
bun run dry                 # idem mais sans rien écrire (scrape + TMDB seulement, debug)
bun run verify              # valide les catalogues produits (10 entrées, ids, affiches)
bun run serve               # sert public/ en local sur http://localhost:8088
bun run lint                # vérifie le style (Biome)

# Ciblé (debug) :
bun run src/generate.ts build --only=netflix   # une seule plateforme
bun run src/generate.ts scrape netflix         # affiche le Markdown FlixPatrol brut
```

Pour tester l'addon local dans Stremio, sers `public/` puis expose-le en HTTPS (Stremio exige HTTPS), par
exemple avec un tunnel `cloudflared tunnel --url http://localhost:8088`, et installe l'URL obtenue +
`/manifest.json`.

---

## 🗂️ Structure du projet

```
src/
├── config.ts            constantes : plateformes, chemins, base d'URL
├── types.ts             types partagés (Entry, Title, MetaPreview, …)
├── scrape/
│   ├── flixpatrol.ts    récupère le Top 10 (FlixPatrol via r.jina.ai)
│   └── parse.ts         transforme le Markdown en entrées (rang, titre, tendance)
├── tmdb/
│   ├── client.ts        appels API TMDB (recherche, external_ids, détails)
│   ├── resolve.ts       titre FlixPatrol → fiche TMDB FR (désambiguïsation)
│   └── cache.ts         cache des correspondances (cache/tmdb-map.json)
├── poster/
│   ├── variants.ts      réglages de rendu des affiches
│   ├── magick.ts        composition ImageMagick (affiche + gros chiffre)
│   └── compose.ts       télécharge l'affiche TMDB et compose l'affiche finale
├── build/
│   ├── meta.ts          construit l'objet « meta » Stremio
│   ├── catalog.ts       écrit public/catalog/<type>/<id>.json
│   └── manifest.ts      écrit public/manifest.json
└── generate.ts          orchestrateur + interface en ligne de commande

public/   ← publié par GitHub Pages : manifest.json · catalog/<type>/<id>.json · posters/*.jpg
cache/    correspondances titre → TMDB (versionnées : accélèrent et stabilisent les résultats)
assets/   polices embarquées + image d'aperçu
```

---

## ⚠️ Limites connues

- **Dépendance à FlixPatrol** (via le proxy gratuit `r.jina.ai`, qui peut être lent ou limité). En cas
  d'échec un jour donné, l'addon **garde la liste de la veille** plutôt que de se vider.
- **Canal+** : FlixPatrol n'expose pas de section « films » dédiée → la liste films est dérivée du
  classement global moins les séries (approximation).
- **Fraîcheur** : comme tous les Top 10 (y compris l'app officielle), le classement reflète les audiences de
  la veille.
- **Volume Git** : ~136 affiches sont régénérées et committées chaque jour (poids modéré, mais l'historique
  grossit avec le temps).

---

## 🤝 Contribuer

Les contributions sont bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md). En deux mots : ouvre une
*issue* pour discuter, garde le style (`bun run lint`), et teste avec `bun run dry` avant de proposer une
*pull request*.

---

## 🙏 Crédits & attributions

- **Classements** : [FlixPatrol](https://flixpatrol.com) — les Top 10 du jour par plateforme et par pays.
- **Proxy de lecture** : [Jina AI Reader](https://jina.ai/reader/) (`r.jina.ai`).
- **Métadonnées** : ce produit utilise l'API **TMDB** mais **n'est ni approuvé ni certifié par TMDB**.
  *This product uses the TMDB API but is not endorsed or certified by [TMDB](https://www.themoviedb.org).*
- **Polices** : Archivo Black, Anton, Bebas Neue ([SIL Open Font License](https://opentype.com/)).
- **Écosystème** : [Stremio](https://www.stremio.com) et [Nuvio](https://github.com/NuvioMedia).

> **Avertissement** — Projet indépendant, **sans aucune affiliation** avec Netflix, Disney+, Amazon, Apple,
> HBO Max, Paramount+, Canal+, ni avec FlixPatrol, TMDB ou Stremio. Les noms et logos appartiennent à leurs
> propriétaires respectifs. Aucune vidéo n'est hébergée ni distribuée : cet addon ne fournit que des
> **listes de titres**.

---

## 📄 Licence

[MIT](LICENSE) © Apertaa
