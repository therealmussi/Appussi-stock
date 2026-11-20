# Sport Shot Challenge

Mini-gioco web di lanci sportivi: a ogni round ricevi una **palla casuale** di uno sport qualsiasi (basket, calcio, pallavolo, tennis, golf, baseball, rugby, football americano, bowling, pallamano) e un **obiettivo casuale**:

- 🏀 **Canestro** (+3 punti)
- ⚽ **Goal** (+3 punti)
- 📏 **Lancio di distanza** (+1 punto ogni 8 metri)

Ogni palla ha peso, dimensione, resistenza all'aria e rimbalzo diversi, quindi cambia completamente il modo in cui vola. Il vento è casuale a ogni round. I risultati consecutivi di successo danno un **bonus** fino a +3. La partita dura **10 round**.

Il record personale è salvato nel browser (`localStorage`).

## Come si gioca

1. Apri la pagina in un browser (PC, tablet o smartphone).
2. Premi **Gioca**.
3. Trascina il dito (o il mouse) sul campo come una fionda: la direzione del trascinamento imposta la mira e la lunghezza imposta la potenza. I puntini gialli mostrano l'inizio della traiettoria.
4. Rilascia per lanciare la palla.

## Struttura

App statica, senza dipendenze né build:

```
sport-shot-challenge/
├── index.html
├── css/style.css
└── js/game.js
```

## Pubblicazione su internet (GitHub Pages)

1. Su GitHub apri **Settings → Pages**.
2. In **Build and deployment** scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Il gioco sarà disponibile su:
   `https://<utente>.github.io/Appussi-stock/sport-shot-challenge/`

Nessun server o database richiesto: tutto gira nel browser.
