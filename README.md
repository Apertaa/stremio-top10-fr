# Top 10 FR 🔟

> Les **vrais Top 10 du jour** des plateformes de streaming, dans Stremio — **configurable** (plateformes,
> pays, films/séries) et avec les **affiches « gros chiffre » façon Netflix**.

[![Build quotidien](https://github.com/Apertaa/stremio-top10-fr/actions/workflows/daily.yml/badge.svg)](https://github.com/Apertaa/stremio-top10-fr/actions/workflows/daily.yml)
[![Licence : PolyForm Noncommercial](https://img.shields.io/badge/Licence-PolyForm%20Noncommercial%201.0.0-orange.svg)](LICENSE)
[![Fait avec Bun](https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

Un addon **catalogue** pour [Stremio](https://www.stremio.com) (lu aussi par l'app Android TV
[Nuvio](https://github.com/NuvioMedia)) qui ajoute, pour chaque grande plateforme, le **Top 10 du jour** —
**films et séries** — avec le **numéro de classement incrusté sur l'affiche**, comme dans l'app Netflix.

Tu choisis **tes plateformes**, **le pays** de chaque classement (🇫🇷 🇧🇪 🇨🇭 🇨🇦 🇺🇸 🇬🇧), et **films / séries**.
En option : une rangée **« Toutes plateformes »** et des rangées **« Jeunesse »**. Les données sont
**régénérées chaque jour** automatiquement.

![Aperçu — affiches Top 10 avec le gros chiffre de classement](assets/preview.jpg)

---

## 📥 Installation

Ouvre la **page de configuration** ci-dessous, choisis tes plateformes, pays et films/séries (et, si tu veux,
renomme tes rangées), puis **copie l'URL qu'elle génère** et ajoute-la dans Stremio ou Nuvio :

> 🔧 **https://stremio-top10-fr.apertaa-dev.workers.dev**

Sur une **TV (Nuvio)**, fais la configuration depuis ton ordinateur ou ton téléphone (les TV gèrent mal les
formulaires), puis colle l'URL obtenue dans l'app.

---

## ✨ Fonctionnalités

- **Le vrai Top 10 du jour**, pas un catalogue de « disponibilité » : classements issus des audiences réelles
  ([FlixPatrol](https://flixpatrol.com)), films **et** séries.
- **Configurable** : tes plateformes, le **pays** de chaque classement, et films / séries / les deux.
- **7 plateformes** : 🔴 Netflix · 🏰 Disney+ · 📦 Prime Video · 🍎 Apple TV+ · 🎭 HBO Max · 🗻 Paramount+ · 📡 Canal+
- **6 pays** : France, Belgique, Suisse, Canada, États-Unis, Royaume-Uni.
- **Rangée « 🌍 Toutes plateformes »** (le palmarès du jour tous services confondus) et **rangées « 🧸 Jeunesse »**
  (Top 10 enfants), en option.
- **Affiches « gros chiffre »** générées sur mesure (1 → 10), avec un chiffre semi-transparent qui laisse voir
  l'affiche derrière — façon rangée « Top 10 » de Netflix.
- **Fiches en français** : titre, affiche et note récupérés sur [TMDB](https://www.themoviedb.org) en `fr-FR`,
  avec l'identifiant IMDb pour que tes autres addons reconnaissent le titre.
- **Catalogue pur** : il fournit les listes et les affiches, mais **ne touche ni aux fiches détaillées ni à la
  lecture** — celles-ci continuent de venir de tes addons habituels (Cinemeta, AIOMetadata, AIOStreams…), donc
  la VF et les sous-titres restent intacts.
- **Robuste** : si une source échoue un jour, l'addon **conserve la liste de la veille** au lieu de se vider ;
  un combo qui n'existe pas (ex. Canal+ hors de France) est automatiquement masqué.

---

## ⚙️ Comment ça marche

Architecture **hybride** : des données pré-générées (gratuit, robuste) + une fine couche dynamique (la config).

```
┌── Robot GitHub Actions (chaque jour à 16 h UTC) ───────────────────────────────────┐
│  Pour chaque pays × plateforme × liste :                                           │
│   1. récupère le Top 10 du jour sur FlixPatrol (via le proxy de lecture r.jina.ai)  │
│   2. retrouve chaque titre sur TMDB → fiche FR (titre, affiche, note) + IMDb        │
│   3. fabrique l'affiche « gros chiffre » (ImageMagick)                              │
│   4. écrit les données JSON + availability.json dans public/                        │
└───────────────────────────────────┬────────────────────────────────────────────────┘
                                     ▼
                  GitHub Pages publie public/  (données statiques + affiches)
                                     ▼
┌── Worker Cloudflare (à chaque requête) ────────────────────────────────────────────┐
│   lit TA config dans l'URL → choisit les bons fichiers statiques →                  │
│   assemble le manifest et les catalogues Stremio (aucune image composée ici)        │
└───────────────────────────────────┬────────────────────────────────────────────────┘
                                     ▼
                              Stremio / Nuvio
```

L'horaire de 16 h UTC (18 h à Paris) passe **après** la publication des Top 10 par FlixPatrol (classements
généraux ~11 h UTC, **Netflix pas avant 15 h UTC**) : on récupère ainsi le classement du **jour même**.

---

## 🔧 Réglages disponibles (page de configuration)

| Réglage | Détail |
|---|---|
| **Plateformes** | Active/désactive chacune des 7 plateformes. |
| **Pays** (par plateforme) | Le classement vient du pays choisi (parmi ceux où la plateforme existe). |
| **Films / Séries / Les deux** | Par plateforme. |
| **🌍 Toutes plateformes** | Ajoute le Top 10 du jour tous services confondus. |
| **🧸 Jeunesse** | Ajoute les Top 10 enfants (films & séries) là où ils existent. |
| **✎ Nom de la rangée** | Par plateforme : un libellé libre (vide = nom automatique) + l'affichage du pays au choix — en toutes lettres (« en France »), en drapeau (🇫🇷) ou personnalisé. Aperçu en direct. |
| **Mention « Film » / « Série »** | Par défaut, Stremio (et Nuvio) ajoutent eux-mêmes « - Film » / « - Série » à la fin du titre (*Automatique*). Si tu as désactivé cette option dans Nuvio, choisis *Intégrée au titre* : le type est alors tissé dans le nom (« … des films / séries du jour »). |

Seules les combinaisons réellement disponibles sont proposées (la page lit `availability.json`).

---

## 🚀 Héberger ta propre instance (fork)

Le projet est prévu pour fonctionner sur un fork. Il faut un compte **GitHub** (Pages + Actions, gratuits) et
un compte **Cloudflare** (Workers, gratuit), plus une **clé TMDB** (gratuite).

<details>
<summary><b>Étapes détaillées</b></summary>

### 1. Les données (GitHub)

1. **Fork** ce dépôt.
2. *Settings → Secrets and variables → Actions* → ajoute `TMDB_READ_TOKEN` (jeton v4) et `TMDB_API_KEY`
   (clé v3). Obtention : [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
3. *Settings → Pages → Source =* **GitHub Actions**.
4. Onglet *Actions* → active les workflows → lance **daily** (*Run workflow*). Au bout de ~quelques minutes,
   tes données sont en ligne sur `https://<toi>.github.io/<dépôt>/` (l'URL est déduite automatiquement).

### 2. Le Worker (Cloudflare)

```bash
cd worker
# Pointe le Worker vers TON GitHub Pages :
#   édite wrangler.toml → PAGES_BASE = "https://<toi>.github.io/<dépôt>"
bunx wrangler login
bunx wrangler deploy
```

Au **tout premier déploiement**, Cloudflare demande de choisir un **sous-domaine `workers.dev`** (dans le
dashboard *Workers & Pages*) ; choisis-en un puis relance `bunx wrangler deploy`. Wrangler affiche alors l'URL
de ton Worker (`https://stremio-top10-fr.<ton-sous-domaine>.workers.dev`) — c'est l'adresse de **ta** page de
configuration. (Pense à pointer `wrangler.toml → PAGES_BASE` vers ton propre GitHub Pages.)

</details>

---

## 💻 Développement local

Projet [**Bun**](https://bun.sh) (TypeScript exécuté directement, sans build). Le générateur nécessite
[**ImageMagick**](https://imagemagick.org) ; le Worker se teste avec **Wrangler**.

```bash
cp .env.example .env        # renseigne TMDB_READ_TOKEN (et TMDB_API_KEY)

# Le générateur (l'« usine » à données) :
bun run build               # génère public/ (données + affiches, 6 pays)
bun run dry                 # scrape + TMDB sans rien écrire (debug)
bun run verify              # valide les données produites
bun run lint                # style (Biome)
bun run typecheck           # types (tsc)
bun run src/generate.ts build --only=netflix --country=france   # ciblé (debug)

# Le Worker (en local, branché sur les données locales) :
bun run serve               # sert public/ sur http://localhost:8088
cd worker && bunx wrangler dev --var PAGES_BASE:http://localhost:8088
```

---

## 🗂️ Structure du projet

```
src/                générateur (l'« usine ») — Bun
├── config.ts        pays, sources, listes, chemins
├── scrape/          FlixPatrol (via r.jina.ai) → entrées
├── tmdb/            résolution des titres (fiche FR + IMDb) + cache
├── poster/          composition ImageMagick (affiche + gros chiffre)
├── build/           écriture data/ · availability.json
└── generate.ts      orchestrateur + CLI

worker/              Worker Cloudflare — sert l'addon configurable
├── index.ts         routage, manifest, catalogues, CORS
├── configure.html   page de configuration
└── wrangler.toml    config de déploiement (variable PAGES_BASE)

public/   ← publié par GitHub Pages
├── data/<pays>/<source>/<liste>.json   données (source de vérité)
├── availability.json                   combos disponibles
└── posters/*.jpg                        affiches (régénérées, non versionnées)
```

---

## ⚠️ Limites connues

- **Dépendance à FlixPatrol** (via le proxy gratuit `r.jina.ai`). En cas d'échec un jour donné, l'addon
  **garde la liste de la veille** plutôt que de se vider.
- **Couverture variable** : toutes les plateformes ne sont pas classées dans tous les pays (ex. Canal+ ≈ France
  uniquement). Les combinaisons absentes sont automatiquement masquées.
- **Canal+** : FlixPatrol n'expose pas de section « films » dédiée → la liste films est dérivée du classement
  global moins les séries (approximation).
- **Jeunesse** : disponible là où FlixPatrol publie des sections « Kids » (surtout Netflix).

---

## 🤝 Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). En deux mots : ouvre une *issue* pour discuter, garde le style
(`bun run lint`), et teste avec `bun run dry` avant de proposer une *pull request*.

---

## 🙏 Crédits & attributions

- **Classements** : [FlixPatrol](https://flixpatrol.com) — les Top 10 du jour par plateforme et par pays.
- **Proxy de lecture** : [Jina AI Reader](https://jina.ai/reader/) (`r.jina.ai`).
- **Métadonnées** : ce produit utilise l'API **TMDB** mais **n'est ni approuvé ni certifié par TMDB**.
  *This product uses the TMDB API but is not endorsed or certified by [TMDB](https://www.themoviedb.org).*
- **Hébergement** : [GitHub Pages](https://pages.github.com) (données) + [Cloudflare Workers](https://workers.cloudflare.com) (config).
- **Polices** : Archivo Black, Anton, Bebas Neue ([SIL Open Font License](https://opentype.com/)).
- **Écosystème** : [Stremio](https://www.stremio.com) et [Nuvio](https://github.com/NuvioMedia).

> **Avertissement** — Projet indépendant, **sans aucune affiliation** avec Netflix, Disney+, Amazon, Apple,
> HBO Max, Paramount+, Canal+, ni avec FlixPatrol, TMDB ou Stremio. Les noms et logos appartiennent à leurs
> propriétaires respectifs. Aucune vidéo n'est hébergée ni distribuée : cet addon ne fournit que des
> **listes de titres**.

---

## 📄 Licence

**[PolyForm Noncommercial 1.0.0](LICENSE)** © Apertaa.

Le code est **ouvert** — tu peux le lire, le forker, le modifier et le partager — mais **uniquement à des fins
non commerciales** (usage personnel, loisir, recherche, associations, établissements publics…). En faire un
**usage commercial** nécessite l'accord préalable de l'auteur.
