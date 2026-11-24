# TIME DEPARTMENT

Gioco investigativo da giocare nel browser. Sei un **Temporal Investigator** appena reclutato dal **Department for Temporal Stability**: il tuo lavoro non è salvare il mondo a colpi di astronavi, è capire perché un uomo è comparso in stazione con i documenti nati tra tre giorni, perché un treno è arrivato prima di essere partito e perché un'intera città non ha nessuna traccia di un lunedì. Ogni caso ha una **verità canonica unica e predefinita**: tutte le prove sono coerenti con essa e ogni caso è risolvibile con il ragionamento, non con l'intuizione.

## Come si gioca

- **OPERATIONS ROOM** — la scrivania del dipartimento: indice di stabilità temporale, casi attivi, avvisi del personale.
- **CASE FILES** — i cinque casi iniziali (TC-001…TC-005), con classificazione di gravità, difficoltà e stato (SEALED / aperto / CLOSED · punteggio).
- **EVIDENCE** — fino a 12 esibiti per caso (documenti, fotografie, intercettazioni, filmati, dichiarazioni, misure scientifiche, firme temporali): lettura dettagliata, note personali, marcatura (UNVERIFIED / FACT / SUSPICION / CONTRADICTION), analisi di laboratorio, pin sulla bacheca.
- **TEMPORAL SCANNER** — letture di firma temporale per bersaglio: normal, displaced, duplicate, missing, fragmented, unknown. Le scansioni generations ulteriori esibiti consultabili.
- **TIMELINE** — ricostruzione cronologica interattiva: trascina gli eventi nell'ordine giusto, con timestamp confermati / stimati / riferiti dai testimoni. Auto-Fill usa i cartellini stampati; sta a te capire se sono attendibili.
- **CAUSALITY** — costruisci la catena causa → conseguenza → contraddizione → displacement tra gli eventi del caso.
- **BOARD** — bacheca investigativa trascinabile: pin degli esibiti, note libere, collegamenti con 8 tipi di relazione, rimozione card e link. Doppio clic sullo sfondo per una nota.
- **FINAL REPORT** — la relazione ufficiale: 5 domande di ricostruzione, scelta dell'intervento con stabilità previsionale, valutazione su 6 misure (identificazione dell'anomalia, accuratezza cronologica, ricostruzione causale, uso delle prove, intervento, stabilità residua) con punteggio 0–100, grado S/A/B/C/D e spiegazione di ogni errore.
- **COMMS** — messaggi e consultazioni con il personale; ogni suggerimento chiesto costa punti.

## I casi

1. **TC-001 · The Man Who Was Born Tomorrow** — un uomo incosciente in stazione, nato "tra tre giorni" secondo i suoi documenti.
2. **TC-002 · The Train That Arrived Yesterday** — un treno in arrivo alle 09:15 la cui partenza risulta alle 11:40.
3. **TC-003 · The House That Remembers** — una casa presente nelle fotografie dal 1989, costruita nel 2004.
4. **TC-004 · The Missing Monday** — un lunedì intero senza fotografie, transazioni o registri.
5. **TC-005 · The Last Telephone Call** — una chiamata dal proprio numero, registrata 17 anni nel futuro.

Dietro i casi c'è la meta-storia di **PROJECT JANUS**: dipendenti che ricordano divaramente, un simbolo ricorrente, un ufficio che non dovrebbe esistere. Il Temporal Archive e i Classified Files si sbloccano progressivamente con la progressione (6 ranghi, da Junior Investigator a Director) e con i PATTERN JANUS scoperti negli esibiti.

## Caratteristiche

- **Verità canonica scritta prima dei casi**: nessun indizio arbitrario; validatore dedicato che controlla riferimenti incrociati, permutazioni della timeline, relazioni causali e giocata perfetta.
- Alcune prove sono incomplete, fuorvianti o contradditorie — ma **ogni contraddizione ha una spiegazione logica** nel caso.
- **L'intervento migliore non è sempre quello moralmente giusto**: massimizzare la stabilità può costare qualcosa a qualcuno (guarda il caso 004).
- Progressione a ranghi basata sulle prestazioni (media punteggi ≥ 55), sblocchi di archivio e fascicoli riservati.
- Salvataggio automatico in `localStorage` (autosave 15s + ad ogni azione + chiusura), **export/import JSON** dalle impostazioni.
- Audio **interamente sintetizzato con Web Audio API** (hum, ticchettio, blip, chime) con volumi separati per master / musica / ambiente / effetti, plus effetti CRT disattivabili.
- Desktop-first, tastiera parziale (ESC chiude modali e torna al menu), tema CRT istituzionale ambra/turchese.

## Tecnica

Vanilla HTML/CSS/JS, zero dipendenze, nessun build step, deployabile su hosting statico (GitHub Pages). Dati e motori separati: ogni caso è un file di dati puro, aggiungere un caso non richiede toccare il codice. Struttura:

```
time-department/
├── index.html              shell del gioco
├── css/style.css           tema CRT istituzionale
├── js/
│   ├── data/meta.js        costanti, personale, archivio, fascicoli riservati, ranghi
│   ├── data/case1..5.js    i 5 casi come dati (prove, scanner, timeline, causalità, interventi, report, verità)
│   ├── data/index.js       registro dei casi
│   ├── state.js            persistenza, progressione, save export/import
│   ├── audio.js            motore WebAudio sintetizzato
│   ├── engine.js           punteggio (timeline pairwise, causalità, report, prove, intervento)
│   ├── ui/                 menu, hq, case, tools (scanner/timeline/causalità), board, report
│   └── main.js             router, shell, impostazioni, boot
└── test/
    ├── validate.js         validatore dati: coerenza, completabilità, perfect-play = 100
    └── smoke.js            smoke test headless (jsdom): gioca il caso 001 da capo a fondo
```

Verifica dei dati: `node test/validate.js` (richiede Node 18+). Smoke test completo: `node test/smoke.js` (richiede `jsdom`, es. `NODE_PATH=<path>/node_modules node test/smoke.js`).
