# Strat·TV

Lecteur IPTV moderne : playlists M3U, direct (HLS), mosaïque multi-écran, favoris, statistiques de visionnage et mode TV.

## Fonctionnalités

- **Accueil** : reprise de la dernière chaîne, activité des 7 derniers jours, favoris, sources rapides.
- **Explorer** : sources par pays, langue ou genre, recherche, import de ta propre playlist M3U (lien ou fichier).
- **Lecteur** : zapping, volume avec boost jusqu'à 200 %, qualité, pistes audio, sous-titres, minuterie, Picture-in-Picture, Cast.
- **Mosaïque** : jusqu'à 4 chaînes en même temps.
- **Favoris**, **Activité** (temps par jour, chaîne ou genre), **Réglages** (sources, santé des chaînes, contraste élevé).
- **Mode TV** : grandes cartes et navigation à la télécommande.
- **Recherche globale** : `Ctrl K`.

### Raccourcis clavier

| Touche | Action |
| --- | --- |
| `Espace` | Lecture / pause |
| `M` | Couper le son |
| `F` | Plein écran |
| `←` `→` `↑` `↓` | Chaîne précédente / suivante |
| `1` à `9` | Volume |
| `Ctrl K` | Recherche |
| `Échap` | Fermer / quitter le mode TV |

## Démarrer

```bash
npm install
npm run dev      # serveur de développement (Express + Vite) sur http://localhost:3000
npm run lint     # vérification des types
npm run build    # build de production dans dist/
```

## Structure

```
src/
  App.tsx              Navigation entre les vues, état global du lecteur
  views/               Accueil, Explorer, Favoris, Activité, Réglages, Mode TV
  components/          Rail de navigation, lecteur vidéo, liste des chaînes, recherche, dialogues
  hooks/               Favoris, contraste élevé, media queries
  utils/               Analyse M3U, statistiques, stockage local, vérification du code
  constants/           Sources du portail (pays, langues, genres)
components/ui/         Composants de base (bouton, badge, interrupteur, carte, dialogue)
api/  netlify/functions/  server.ts   Proxy de playlists et de flux, vérification des chaînes, code d'accès
```

Le design repose sur des jetons définis dans `src/index.css` : cartes à coins de 24 px, tuiles de 16 px, boutons de 10 px (36 px de haut), badges de 6 px, accent menthe.

## Section protégée

Le code d'accès et l'adresse de la section protégée **ne sont jamais envoyés au navigateur** : ils sont vérifiés côté serveur (`/api/verify-code`). À définir dans l'hébergeur (et dans `.env.local` en développement) :

```
PROTECTED_SECTION_CODE=...
PROTECTED_SECTION_URL=...
```

Sans ces deux variables, la section reste indisponible. Les essais sont limités (8 par 10 minutes et par adresse).

## Déploiement

- **Netlify** : `netlify.toml` fournit la commande de build, le dossier `dist` et la redirection `/api/*` vers `netlify/functions`.
- **Vercel** : `vercel.json` redirige `/api/*` vers le dossier `api/`.

## Données locales

Les favoris, l'historique de visionnage, les playlists importées et l'option de contraste sont enregistrés dans le navigateur (clés `strat-tv-*`). Rien n'est envoyé à un serveur.
