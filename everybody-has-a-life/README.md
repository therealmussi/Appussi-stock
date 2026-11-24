# EVERYBODY HAS A LIFE

*Le cronache di Northbridge* — una social simulation nel browser in cui **il giocatore non controlla nessuno**: osserva una città europea e le vite che la abitano. Il vero protagonista è la società.

## Il concetto

Northbridge è una città media europea con **~120 abitanti simulati uno per uno**: personalità (Big Five + 6 tendenze), famiglia, amici, lavoro, ambizioni, ricordi, risparmi, salute. Le persone si incontrano per contesto e prossimità, si innamorano, sposano, litigano, fanno figli, cambiano lavoro, emigrano, invecchiano e muoiono. La città continua a vivere anche se non tocchi nulla: attività che chiudono e riaprono, case che si costruiscono, quartieri che cambiano popolazione.

Il gioco non è un city builder: non puoi comandare un singolo abitante. Puoi però **seguire una persona per tutta la vita** (cartellino "Segui questa vita"), leggere la **biografia generata dagli eventi realmente accaduti**, esplorare le **dinastie familiari su 4–5 generazioni** e consultare l'**archivio storico** di chi non c'è più.

## Come si gioca (si osserva)

- **Splash**: "Nuova città" con un seme a scelta (stesso seme = stessa città, RNG deterministico) o "Continua" dall'ultimo salvataggio.
- **Mappa della città**: zoom (rotella / pulsanti), pan (trascina), click su un edificio (residenti, dipendenti, salute aziendale) o su un puntino-cittadino (vita intera). Giorno/notte, meteo e tinta stagionale sul rendering.
- **Orologio multi-scala**: pausa, play (30 min/s), veloce (6 h/s), molto veloce (2 giorni/s) e salti +1h / +1g / +1 settimana / +1 mese / +1 anno (chunked, con barra di progresso). Spazio = pausa.
- **Cartellino "Segui questa vita"**: attività corrente, luogo, lavoro, famiglia; con la camera che può inseguire il cittadino sulla mappa.
- **Cronaca in diretta**: feed eventi reali filtrabile per categoria (personale, sociale, cuori, famiglia, lavoro, economia, città) e per importanza.
- **Il Giornale**: "Cronache di Northbridge" esce ogni mese e riscrive solo gli eventi davvero accaduti.
- **Interventi della città** (opzionali): festa di quartiere, centro comunitario, sostegno alle scuole, trasporti, nuovo parco, aiuto alle imprese in difficoltà. Modificano l'ambiente — mai le persone. La **modalità osservatore pura** li disattiva del tutto.
- **Viste**: Cittadini (ricerca/ordinamenti), Famiglie (dinastie per generazioni), Relazioni (grafo sociale cliccabile), Economia e Statistiche (grafici da dati simulati), Giornale, Storia (memoriali, attività chiuse/nate, eventi notevoli).
- **Salvataggio**: automatico ogni mese simulato + pulsante manuale, in `localStorage` (chiave `ehl-save-v1`).

## Architettura

Vanilla HTML/CSS/JS, zero dipendenze, nessuna build. Motore separato dalla presentazione, namespace globale `window.EHL`:

| File | Ruolo |
| --- | --- |
| `js/core.js` | `E.Core` — RNG mulberry32 con seed, tempo simulato a minuti dal 1/1/2026, date/stagioni, digest deterministico, storage |
| `js/data.js` | `E.DATA` — città: 6 quartieri, fiume, strade, ~120 edifici con nomi/posti di lavoro, tabella interventi |
| `js/people.js` | `E.People` — identità, Big Five, tendenze derivate, compatibilità, seeding della popolazione (nuclei, single, anziani) |
| `js/biography.js` | `E.Bio` — timeline, memorie, biografia generata, albero dinastico per generazioni |
| `js/engine.js` | `E.Engine` — stato, ciclo giornaliero, routine per archetipo, meteo, lavoro, posizione (`whereIs`) |
| `js/society.js` | estende il motore — incontri contestuali, relazioni che si evolvono, amore/matrimoni/rotture, nascite, morti, lutto, emigrazioni |
| `js/economy.js` | estende il motore — economia mensile, ciclo aziendale, chiusure/aperture, nuove case, migrazione, statistiche annue, giornale, interventi, revive |
| `js/charts.js` | `E.Charts` — grafici 2D su canvas senza librerie (linee, barre, donut) |
| `js/map.js` | `E.Map` — rendering canvas della città con culling del viewport, pan/zoom, notte/meteo, picking |
| `js/ui.js` | `E.UI` — guscio, feed, modale cittadino (biografia/timeline/relazioni/carattere/famiglia/memorie) e edificio, interventi |
| `js/views.js` | `E.Views` — le sette viste a pagina intera |
| `js/main.js` | bootstrap, loop di simulazione con velocità multiple, salti chunked, autosave |
| `test/headless.js` | suite di integrazione in Node (`vm`, 10 sezioni) |

### Modello di simulazione

Ibrido ed efficiente: routine giornaliere **schedulate** (non a tick continuo), incontri generati per contesto (lavoro, scuola, casa, luoghi sociali nel quartiere), eventi di vita valutati a intervalli, economia mensile e demografia annuale. La lista attiva delle relazioni è incrementale e le "relazioni care" vengono ricalcolate a cadenza a giorni — così 50 anni simulati restano fluidi.

### Test

```bash
node test/headless.js
```

10 sezioni: fondazione della città, determinismo del seed, routine e movimento, un anno, dieci anni, città che cambia (aperture/chiusure/migrazione), dinastie, salvataggio/ripristino, interventi e modalità osservatore, cinquant'anni di simulazione con verifiche demografiche.
