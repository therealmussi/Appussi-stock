# Dream LNH 🏒

Application web mono-page mobile-first : simulateur rapide de carrière de joueur de la LNH, en tours de roue, du soir de repêchage au Temple de la renommée. Édition française — la version anglaise vit dans `dream-nhl-src/` ([jouer à Dream NHL](https://therealmussi.github.io/Appussi-stock/dream-nhl/)).

**Stack :** React 18 + Vite + Tailwind CSS 4, zéro backend, sauvegarde auto dans `localStorage` (clé `dream-lnh-save-v1`).

## Lancer

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans ../dream-lnh/ (commité, servi par GitHub Pages)
npm run preview  # prévisualiser le build
```

Le build utilise `base: './'` avec sortie dans `../dream-lnh/` : la version en ligne est sur
[therealmussi.github.io/Appussi-stock/dream-lnh/](https://therealmussi.github.io/Appussi-stock/dream-lnh/).
Après toute modification du code, relancer `npm run build` et commiter aussi le dossier `dream-lnh/`.

## Gameplay

1. **Création** — position (C/LW/RW/D), archétype (Tireur d'élite, Meneur, Deux volets, Défenseur engagé), débuts au repêchage à 19 ans avec 72–76 OVR.
2. **Repêchage** — roue pondérée à 32 équipes : choix élevé = équipe faible mais temps de jeu garanti.
3. **Boucle de saison** (de 19 à ~40 ans), 4 étapes par saison :
   - **Étape A · Entraînement :** roue pondérée (Explosion, Progrès sûr, Palier, Déclin, Blessure) → ±OVR.
   - **Étape B · Saison régulière :** simul instantanée (PTS/M, A/M, ME/M, TGL), fiche, rang (Séries 1–8, Play-In 9–10, éliminé) + événements (tours du chapeau, clips viraux, périodes froides, blessures mineures, tension au vestiaire).
   - **Étape C · Honneurs & Séries :** Calder, Étoiles, 1ʳᵉ équipe d'étoiles, Art Ross, Selke, Norris, Hart ; play-in, séries rond par rond avec logos des équipes et **un match 7 de la finale de la Coupe Stanley décidé par une roue dédiée** ; victoire = Coupe Stanley + chance de Conn Smythe.
   - **Étape D · Agence libre** à l'expiration du contrat : roue uniforme avec 4 offres de franchises (toutes les équipes à égalité) plus « Re-signer ».
4. **Retraite** — manuelle dès 35 ans ou automatique avec probabilité croissante, jusqu'à 40 ans.
5. **Palmarès** — carte avec Score de carrière, verdict (de *Raté* à *GOAT* 🐐), trophées (Coupe Stanley, Conn Smythe, Hart, Norris…), totaux et jalons de carrière, numéro de chandail, chronologie saison par saison.

## Architecture

```
src/
  data/
    teams.js              # franchises : id, noms, couleurs, rating — les données de la ligue
    events.js             # règles/params : archétypes, table de développement, trophées, poids, verdicts
  engine/
    simulationEngine.js   # moteur de simulation PUR : pas de DOM, pas de React
  store/
    useGame.js            # reducer + persistance localStorage + machine à écrans
  components/
    Wheel.jsx             # roue de la fortune CSS à poids arbitraires
    Burst.jsx             # particules/flash pour Coupes, Hart, 1er choix au total
    ui.jsx                # widgets partagés (blason avec vrais logos, trophée, barres, chips)
    ProfilePanel.jsx      # modale profil joueur (attributs, chandail, équipes portées)
  screens/                # un écran par étape du flux
  App.jsx                 # HUD + routeur d'écrans
```

## Crédits

- Logos des équipes servis depuis le [CDN ESPN](https://www.espn.com).
- Image de la Coupe Stanley : SVG original dans le dépôt (`src/assets/stanley-cup.svg`), domaine public.

Développé par Matteo Mussillon.
