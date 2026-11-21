# Copero NBA 🏀

Single-page web app mobile-first: simulatore rapido di carriera da giocatore NBA a turni/ruote, ispirato al gioco "Copero".

**Stack:** React 18 + Vite + Tailwind CSS 4, zero backend, salvataggio automatico in `localStorage`.

## Avvio

```bash
npm install
npm run dev      # sviluppo
npm run build    # build di produzione in app/ (committata, servita da GitHub Pages)
npm run preview  # anteprima della build
```

La build usa `base: './'` con output in `app/`: la versione online è disponibile su
[therealmussi.github.io/Appussi-stock/copero-nba/app/](https://therealmussi.github.io/Appussi-stock/copero-nba/app/).
Dopo ogni modifica ai sorgenti ri-esegui `npm run build` e committa anche la cartella `app/`.

## Gameplay

1. **Creazione** — ruolo (PG/SG/SF/PF/C), archetipo (Scorer, Playmaker, Two-Way, Rim Protector), esordio a 19 anni con 72–76 OVR.
2. **Draft** — ruota della fortuna con 30 scelte pesate: scelta alta = squadra debolissima ma minuti garantiti.
3. **Ciclo stagionale** (dai 19 ai ~38 anni), 4 step a ruote/carte:
   - **Step A · Allenamento:** ruota con esiti pesati per età (Breakout, Passo Avanti, Stagnazione, Calo, Infortunio) → ±OVR.
   - **Step B · Regular Season:** simulazione istantanea: medie (PPG/RPG/APG/MIN), record, seed (Playoff 1–8, Play-In 9–10, eliminato).
   - **Step C · Premi & Playoff:** ROY, MIP, All-Star, All-NBA, DPOY, MVP; play-in, post-season turno per turno e **Gara 7 delle Finals decisa con una ruota dedicata**; vittoria = anello + chance di Finals MVP.
   - **Step D · Free Agency** a scadenza contratto: ruota con 4 offerte di franchigia (rating e tier visibili) più l'opzione "Rimani".
4. **Ritiro** — manuale dai 35 anni o probabilità crescente automatica, fino al tetto dei 40.
5. **Bacheca finale** — figurina con Career Score, verdetto (da *Bust* a *GOAT* 🐐), trofei, medie carriera, timeline stagione per stagione.

## Architettura (pensata per NFL/MLB/NHL)

```
src/
  data/
    teams.js              # franchigie: id, nomi, colori, rating — DA DUPLICARE per altre leghe
    events.js             # regole/parametri: archetipi, tabella sviluppo, premi, pesi draft, verdetti
  engine/
    simulationEngine.js   # motore di simulazione PURO: nessun DOM, nessuna dipendenza da UI
  store/
    useGame.js            # reducer + persistenza localStorage + macchina a stati delle schermate
  components/
    Wheel.jsx             # ruota della fortuna CSS con pesi arbitrari
    Burst.jsx             # particelle/flash per anelli, MVP, draft
    ui.jsx                # widget condivisi (crest, barre, chip, card)
  screens/                # una schermata per step del flusso
  App.jsx                 # HUD + router delle schermate
```

Il motore (`simulationEngine.js`) legge solo dai moduli in `src/data/`: per creare Copero NFL/MLB/NHL basta duplicare
`teams.js` e `events.js` con i valori giusti (conferenze, ruoli, premi, `SEASON_GAMES`, `PLAYOFF_ROUNDS`) e riutilizzare
React/store/scratcher identici.
