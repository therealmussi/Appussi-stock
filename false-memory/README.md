# FALSE MEMORY — CASE 001: The Disappearance

Thriller investigativo da giocare nel browser, in italiano. Sei un investigatore indipendente incaricato di ricostruire la scomparsa di **Daniel Moreau**, scomparso nel nulla la notte del 17 ottobre 2024 nel residence «Le Sablon» di Saint-Aurel. Quattro persone sapevano dove fosse: ognuna ha una versione diversa. **Il mistero non si lascia capire leggendo: va ricostruito.**

## Come si gioca

- **CASE FILE** — il fascicolo di apertura, obiettivi e stato dell'indagine.
- **PERSONS** — profili e interrogatori condizionali: le risposte cambiano a seconda delle prove che presenti.
- **TESTIMONIES** — dichiarazioni scritte e registrazioni con player e trascrizione progressiva.
- **EVIDENCE** — 30 prove divise in fotografie, documenti, registrazioni e oggetti, con livello di affidabilità e analisi approfondite progressive. Alcuni dettagli emergono solo al secondo sguardo.
- **TIMELINE** — ricostruzione cronologica con 4 tipi di tempo (confermato, stimato, riferito dal testimone, da verificare): aggiungi eventi, ordinali, segnala le incoerenze.
- **BOARD** — bacheca investigativa trascinabile: collega prove e dichiarazioni con 6 tipi di relazione (conferma, contraddice, sostiene, indebolisce, nessun legame, incerta), aggiungi note e ipotesi. Salvataggio automatico.
- **CONCLUSIONS** — consegna la tua ricostruzione rispondendo alle domande cruciali e allegando le prove. **Cinque finali possibili**, non casuali: corretto, plausibile, accusa sbagliata, caso incompleto, verità irrisolta.

## Caratteristiche

- Verità canonica **unica e predefinita**: nessuna generazione casuale. Tutte le prove sono coerenti con essa.
- **Ricordi veri e bugie deliberati non sono distinguibili a colpo d'occhio**: alcune testimonianze sono ingannevoli perché sincere, e viceversa.
- Sblocchi progressivi: la catena di prove è validata da uno script di verifica (`tools/validate.js`).
- Salvataggio automatico in `localStorage`, menu con NUOVA INDAGINE (con conferma se c'era una partita in corso) / CONTINUA (con progresso) / ARCHIVIO CASI (finali n/5) / COME SI GIOCA / IMPOSTAZIONI / CREDITI.
- Intro narrativa a tre card all'avvio di una nuova indagine; suggerimenti contestuali al primo utilizzo delle viste; scorciatoie tastiera (1-7 viste, ESC chiude, ? guida).
- Ricerca testuale in EVIDENCE; etichette delle relazioni direttamente sulle linee della bacheca (con aggancio alla griglia).
- Audio **interamente sintetizzato con Web Audio API** (musica ambientale, effetti, voci per le registrazioni) — nessun asset esterno.
- Immagini generate proceduralmente come SVG; testo scalabile; tema scuro da postazione investigativa.

## Tecnica

Vanilla HTML/CSS/JS, nessun build step, nessuna API esterna, deployabile su hosting statico (GitHub Pages). Compatibile con PC e mobile. Struttura:

```
false-memory/
├── index.html            shell del gioco
├── css/style.css         tema investigative dark
├── js/
│   ├── data/evidence-data.js   30 prove + verità canonica
│   ├── data/case-data.js       brief, personaggi, capitoli, domande, finali
│   ├── state.js                persistenza e progressione
│   ├── audio.js                motore WebAudio
│   ├── ui.js                   router, modal, toast, thumbnail, sblocchi
│   ├── views/                  le 7 viste (casew, persons, testimonies,
│   │                           evidence, board, timeline, conclusions)
│   ├── menu.js                 menu principale, impostazioni, crediti
│   └── main.js                 bootstrap
└── tools/validate.js     validatore del grafo di sblocchi e coerenza dati
```

Verifica dei dati: `node tools/validate.js` (richiede Node 18+).
