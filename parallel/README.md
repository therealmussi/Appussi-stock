# PARALLEL

**Un gioco-simulazione di storia alternativa.** Che cosa sarebbe successo se una città avesse preso una direzione diversa nel momento decisivo?

Non un city-builder a punteggio, né una sequenza di schermate di decisioni: un motore di simulazione interconnesso (demografia, economia, trasporti, territorio, ambiente, società, politica) in cui i risultati **emergono** dalle scelte del giocatore e interagiscono tra loro, spesso decenni dopo la decisione.

## Primo scenario: TORINO 1962 — *La città che poteva essere*

Torino, 1962: pieno miracolo economico, immigrazione interna, motorizzazione in corsa, tranvie che invecchiano. La prima decisione obbligata è **La questione metropolitana** (metropolitana / tranvie / strade / ferrovia suburbana) e da lì la campagna prosegue fino al 2000, estendibile al 2026.

- **7 sistemi interconnessi** con tick annuale: demografia, economia, trasporti, territorio, ambiente, sociale, politica.
- **10 decisioni storiche** con alternative plausibili (l'alluvione del Po 1966, l'emergenza abitativa 1968, il patto Fiat 1971, lo shock petrolifero 1973, la crisi industriale 1978, il Lingotto 1982, i Mondiali '90…), più **8 eventi dinamici** condizionati dallo stato della simulazione.
- **24 progetti infrastrutturali** con costo, durata, cofinanziamento, manutenzione e conseguenze a decenni.
- **Mappa interattiva SVG** di Torino a geometria vettoriale: 14 distretti con contorni irregolari riconoscibili, Po arginato, Dora Riparia e Stura di Lanzo, 6 parchi, assi stradali con doppio tratteggio, spina ferroviaria, 4 stazioni, punti di riferimento (Mole Antonelliana, Lingotto, Superga…), 9 comuni dell'area metropolitana; 7 livelli tematici (densità, accessibilità, attività, uso del suolo, ambiente, espansione, progetti); **zoom con rotella, pan col trascinamento e controlli +/−/⌂**; i cantieri appaiono come anelli di progresso sui corridoi.
- **Parallel Timelines**: confronto sistematico tra la tua linea temporale e quella storica di riferimento, con etichettatura rigorosa **STORICO** (dato documentato) / **IPOTESI** (valore illustrativo stimato) / **SIMULATO** (risultato della simulazione).
- **Rapporto finale** con valutazione su 7 dimensioni e **archetipo di città emergente** dai risultati (nessuna città perfetta).
- **Saving**: autosave annuale + 3 slot manuali + export/import JSON, su `localStorage`.

## Come si gioca

Nessuna dipendenza, nessun server, nessuna build: apri `index.html` in un browser moderno (funziona anche in `file://`).

- Pulsante **Avanza ▸** (o tasto `T`): avanza di un anno, mostra il resoconto e apre le decisioni/eventi dovuti.
- **Mappa / Progetti / Economia / Popolazione / Trasporti / Ambiente / Politica / Timeline / Analisi / Parallel Timelines / Sistema** dal menu superiore.
- Ogni progetto approvato entra in cantiere (max 4 contemporanei) e consuma cassa ogni anno; i costi che eccedono la cassa diventano **debito** con interessi.
- Nessuna opzione è universalmente vincente: la strategia corretta dipende da come vuoi che la città diventi.

## Architettura

```
index.html                 shell dell'app (script classici, no build)
css/style.css              identità visiva: cartografia storica + GIS moderno
js/
  core.js                  RNG deterministico (mulberry32 + seed), storage, stato iniziale
  data-torino.js           scenario TORINO 1962: distretti, baseline storica, milestone, archetipi
  data-torino-contenuti.js progetti, decisioni, eventi dinamici (contenuti di gioco)
  engine.js                MOTORE di simulazione (tick annuale, indipendente dalla UI)
  actions.js               azioni del giocatore (approva progetti, risolvi decisioni/eventi)
  charts.js                grafici canvas (linee/barre) senza dipendenze
  map.js                   mappa SVG con livelli tematici
  ui.js / ui-panels.js     interfaccia (solo lettura/visualizzazione)
  main.js                  avvio
test/
  headless.js              suite test del motore in Node (`node test/headless.js`)
```

Principi: il **motore non dipende dalla UI**; lo stato `S` è un oggetto semplice serializzabile (le funzioni restano nei cataloghi, mai nello stato); RNG con **seed** → ogni campagna con lo stesso seed è riproducibile al 100%.

Ulteriori scenari (Paris 1965, New York 1950, Venice 1960, Grenoble 1970, London 1945) sono previsti come moduli indipendenti nello stesso formato di `data-torino.js`: l'architettura è già pronta, solo Torino è giocabile in questa versione.

## Test

```bash
node test/headless.js
```

Esegue campagne complete (1962→2000) senza browser: consistenza dello stato iniziale, campagna neutra in range, divergenza metro vs strade (mobilità, suolo, motorizzazione), ciclo di vita dei progetti, determinismo del seed, round-trip di salvataggio, vincoli di bilancio.

## Avvertenza sui dati

La baseline storica usa valori indicativi. Dove esistono dati ufficiali affidabili (censimenti, motorizzazione, crescita nazionale) sono utilizzati come ordine di grandezza; dove non li esistono in forma serie-per-anno, i valori sono **stime illustrative** e sono etichettati come tali nell'interfaccia. **Nessun valore simulato va inteso come ricostruzione di ciò che sarebbe realmente accaduto.**

Leggi [docs/simulazione.md](docs/simulazione.md) per formule e metodologia.
