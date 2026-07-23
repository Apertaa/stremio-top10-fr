# stremio-top10-fr — addon Stremio « Top 10 du jour »

Addon public (PolyForm-Noncommercial) : classements quotidiens des plateformes de streaming pour la France. Architecture : GitHub Actions (cron quotidien 16:00 UTC — après la publication Netflix) régénère les données → GitHub Pages (statique) + Cloudflare Worker (`worker/`, manifest configurable par utilisateur).

## Commandes

```bash
bun run dry        # génération à blanc (sans écrire)
bun run build      # génération complète
bun run verify     # vérification des données produites
bun run lint       # Biome
bun run typecheck
```

## Règles

1. Les posters sont **régénérés à chaque run et jamais commités** (sinon ~930 images/jour dans l'historique).
2. Déploiement du Worker : `bunx wrangler deploy` depuis `worker/` — uniquement sur demande explicite.
3. Toute modification suit le flux PR (commits liés à une PR numérotée) ; pas de push direct de fonctionnalité sur `main`.
4. Pas de secret dans ce repo (public). Les clés API n'existent qu'en variables d'environnement CI.
5. Français pour la prose et les messages de commit ; anglais pour les identifiants de code.

## Note mainteneur

Ce dépôt est un **satellite** : les décisions, l'historique de construction et la base de connaissances vivent dans le workspace privé `~/dev/stremio` (voir aussi `~/dev/Atlas/registre/fiches/stremio-top10-fr.md`). Pour un changement substantiel, ouvrir la session depuis le cockpit. Leçons apprises ici → `/socle:retrospective`.
