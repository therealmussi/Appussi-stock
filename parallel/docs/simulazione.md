# Il motore di simulazione di PARALLEL

Questo documento descrive le formule del tick annuale di `js/engine.js` e la metodologia. L'obiettivo è che **ogni numero mostrato al giocatore sia spiegabile**: niente bonus arbitrari, solo relazioni tra variabili.

Tutte le quantità monetarie sono in **miliardi di lire 1962, costanti** (valore illustrativo). La simulazione avanza a passi di **un anno**, con l'ordine qui sotto.

## Framework generale

- Stato `S` = oggetto semplice serializzabile: `S.systems.{demografia, economia, trasporti, ambiente, sociale, politica}`, `S.territorio.distretti[]`, `S.projects[]`, `S.treasury`, `S.debt`, `S.mods[]`, `S.timeline[]`, `S.history[]` (snapshot annuale), `S.flags`, `S.yearReport`.
- **Conseguenze a lungo termine** = `mod`: record `{id, year, effetti{...}, scadenza?}` inserito da decisioni, progetti ed eventi. Consultati con `E.modFactor(S, chiave, fallback, modo)` in modalità `somma` (default) o `prodotto`. I mod possono scadere (`scadenza` in anni) — così un patto del 1971 svanisce nel 1983 e la città torna a evolvere secondo le condizioni correnti.
- **RNG deterministico**: mulberry32 con seed scelto dal giocatore; `S.rngState` viene salvato a ogni tick, così salvataggio/ripristino sono bit-per-bit equivalenti.

## Ordine del tick annuale

1. **Progetti** — i cantieri in corso avanzano di `100/durata` punti l'anno; al completamento girano gli effetti `onComplete` e si registra la sequenza temporale. Il costo annuale è stabilito (`costoTotale/durata`, con sconti dottrina e cofinanziamento) e viene pagato dalla cassa.
2. **Economia** — PIL, occupati, struttura settoriale, disoccupazione.
3. **Demografia** — natalità/mortalità, fasce d'età, migrazione, popolazione.
4. **Territorio** — fabbisogno abitativo, edificazione spontanea vs densificazione, consumo di suolo, riequilibrio dei distretti.
5. **Trasporti** — motorizzazione, quote modali, congestione, tempi di percorrenza, accessibilità.
6. **Ambiente** — inquinamento, energia, emissioni, verde pro capite.
7. **Sociale** — qualità della vita, abitazioni adeguate, disuguaglianza, servizi.
8. **Politica** — approvazione, stabilità.
9. **Finanza** — ricavi, spese, saldo, cassa, debito.
10. **Trigger** — decisioni ed eventi che scattano per anno/condizione (in attesa per il giocatore).
11. **Milestone** — eventi di contesto (censimenti, crisi energetica, Italia '90, olimpiadi…).
12. **Snapshot** — `E.derived` + entry in `S.history`.

## 1. Economia

**Crescita PIL** (`g`, % annua):

```
g = 0.5·nazione + 0.8
  + 2.5·(accessibilità − 0.42)       # infrastrutture e mobilità
  + 1.2·(diversificazione − 0.15)    # struttura economica
  − max(0, congestione − 0.7)·2.5    # attrito del traffico
  − max(0, inquinamento − 65)·0.05   # costi ambientali
  − max(0, debito − 200)·0.002       # tenuta finanziaria
g = clamp(g, −4, +7)
```

`nazione` è il ciclo industriale italiano reale (tabella `CICLO_NAZIONALE` in `js/data-torino.js`: crescita annua del PIL italiano, storica fino al 2024 e proiettata piatamente oltre; valore di contesto STORICO).

**Occupazione**:

```
declinoInd = clamp(0.010 − 0.25·industriaTasso − 0.25·(diversificazione − 0.15), 0.001, 0.02)
quotaIndustria −= declinoInd    (min 0.12)

occupG = clamp(0.62·g − 1.05 + indBonus − ristrutturazione, −7, +4)
ristrutturazione = declinoInd·620·(quotaIndustria − 0.05)·clamp((3.9 − nazione)/3.4, −0.55, +1.3)

occupati = min(popolazione·forzaLavoro, occupati·(1 + occupG/100))
```

Significato: nel boom (`nazione` alto) `ristrutturazione` diventa **negativa** (la grande industria assume); nella stagnazione (anni '80) lo svucamento di posti industriali pesa sul totale. La **diversificazione** — cioè le politiche di conversione approvate dal giocatore anche dieci anni prima — riduce `declinoInd` e quindi l'intensità della crisi.

**Disoccupazione** = componente ciclica + componente strutturale (**isteresi**):

```
disoccCiclica = clamp(1 − occupati/forzaLavoro, 0.012, 0.25)
strutturale += 0.35·max(0, disoccCiclica − 0.03) − 0.05·strutturale − 0.25·diversificazionePerAnno
disoccupazione = clamp(disoccCiclica + strutturale + mods, 0.01, 0.26)
```

Le crisi lasciano segni: una recessione profonda deposita disoccupazione strutturale che si smobilita lentamente, prima ancora se la città ha investito in diversificazione.

## 2. Demografia

```
natalita → floor 0.0085 (transizione demografica)
mortalita → ceiling 0.0125

migrTarget = clamp(0.028 − 0.75·disoccupazione, −0.012, +0.024)·abitazioniAdeguate
           − penalità inquinamento − penalità congestione
saldoMigratorio = 0.55·saldo_precedente + 0.45·migrTarget    (inerzia migratoria)

popolazione += popolazione·(natalita − mortalita) + popolazione·saldoMigratorio
fasce d'età transitano (giovani/lavoratori/anziani)
dimensioneHH −= 0.011/anno (min 2.2)
```

Le persone arrivano dove ci sono **lavori e abitazioni**; se ne vanno (lentamente, con inerzia) dove mancano. Una città che perde industria si svuota non per decreto ma perché il saldo si inverte anno dopo anno.

## 3. Territorio e consumo di suolo

```
necessarie = popolazione / dimensioneHH
carenti = max(0, necessarie − abitazioni_totali)
```

Se mancano alloggi:
- **espansione spontanea**: `min(carenti·0.30·(1 + 0.55·espansionePeriurbana), 14000)` unità; la parte non densificata va nei distretti esterni e consuma `unità·hh/90·leapfrog` ettari, con `leapfrog = clamp(1 + 0.4·espansionePeriurbana, 1, 1.7)`;
- **densificazione** nei quartieri centrali più accessibili se esiste il mod `densificaCorridoio` (es. la metropolitana), a `unità·hh/300` ettari — ~3× più efficiente in suolo.

Oltre al fabbisogno esiste l'**edificazione speculativa** tipica delle città autos: con `espansionePeriurbana` alto si costruisce in periferia *anche senza deficit* (leapfrog), proporzionale alla motorizzazione e limitato dal rapporto abitazioni/popolazione.

`abitazioniAdeguate = abitazioni/necessarie` alimenta migrazione e QoL; sotto 0.97 può scattare l'emergenza abitativa del 1968; con `flags.abusivismo` l'auto-costruzione copre il fabbisogno a costo di disuguaglianza e degrado.

## 4. Trasporti

```
autoMille → saturazione (verso 2000+) guidata da autoFattore, qualità del Tpubb e congestione
attrattivaTpubb = 0.14 + 0.42·qualità + 0.10·(congestione − 0.5) + 0.05·presenzaMetro
shareTpubb → tende a attrattivaTpubb (max 0.55)
congestione = viaggiAuto / (2.2M·indiceStrade^0.8), clamp 0.1…0.99
tempiMin = 12 + 26·congestione·shareAuto + urti da cantieri
accessibilità += 0.02·qualità + 0.03·metroKm/20 + 0.02·tramKm/100 + 0.03·railKm/25 − 0.03·congestione
```

La metropolitana non "dà punti": **sposta l'equilibrio** della quota modale, riduce congestione (che a sua volta sostiene PIL e aria pulita) e sblocca densificazione. Le strade aumentano `indiceStrade` (meno congestione subito) ma alzano `autoFattore`: motorizzazione → congestione ritorna, suolo ed emissioni crescono. Nessuna strategia domina: i circuiti di feedback decideranno.

## 5. Ambiente

```
inquinamento → base da trasporto (autoMille, congestione, quotaIndustria) × inquinamentoFattore,
               alleggerita dalla tecnologia post-1985 (max −15 punti)
verde += 2 + 18·popolazione/Mln ha/anno (passivo) + progetti (Parco del Po, cunei verdi)
verdePerCapita = verdeHa / popolazione
energia/emissioni: pendenze con motorizzazione, industria, teleriscaldamento, shock petrolifero
```

## 6. Sociale

```
qol += 0.12·(verdePerCapita − 6)/10 + effetti qualità/servizi/abitazioni
     − penalità congestione, inquinamento, disuguaglianza, mods negativi, clamp 10…95
disuguaglianza: pendenza da diseguaglianzaPerAnno (mods), abitazioni adeguate, abusivismo
```

## 7. Politica e finanza

```
approvazione = 50 + (qol − 58)·0.55 + (0.05 − disoccupazione)·120 + (saldo > 0 ? +1.5 : −2) − cantieri·1.5

ricavi = PIL·0.0228 + 8 + popolazione·0.000012      (Mld Lire 1962, illustrativo)
spese  = popolazione·0.000052·(1 + (shareAnziani − 0.11))·speseFattore + manutenzioni
saldo  = ricavi − spese − interessi (5% sul debito)
deficit: prima cassa, poi debito; il surplus ripaga il debito
```

I vincoli sono veri: niente approvazioni senza cassa o con debito > 380 Mld; massimo 4 cantieri in parallelo; eventi come `fondi-statali` o il patto Fiat possono cofinanziare.

## 8. Valutazione finale

`E.classificaFinale` misura 7 dimensioni (0–100): economia, ambiente, accessibilità, equità sociale, abitazione, tenuta finanziaria, resilienza. L'archetipo (**Metropoli Industriale**, **Città Sostenibile**, **Dipendente dall'Auto**, **Metropoli Policentrica**…) viene selezionato da soglie su queste dimensioni *calcolate*, non da scelte dichiarate: nessuna città perfetta esiste nel sistema.

## Tracciatura delle stime

- **STORICO**: fatti documentati (censimenti ISTAT, crisi petrolifera, Italia '90, olimpiadi invernali 2006…).
- **IPOTESI**: parametri iniziali e baseline annuale dove mancano serie ufficiali utilizzabili (es. tempi medi di percorrenza 1970): valori illustrativi, dichiarati tali nell'interfaccia.
- **SIMULATO**: ogni conseguenza del giocatore. `S.timeline` etichetta ogni voce; la vista Parallel Timelines mostra divergenze crescenti rispetto alla baseline.

La baseline di confronto non è una predizione di ciò che sarebbe realmente successo, sempre un riferimento di stima. La verità controfattuale non viene predicata: si esplora.

## 9. Rappresentazione cartografica

La mappa (`js/map.js`) è pura visualizzazione, non fonte di verità: legge gli stessi valori del motore. La geometria di `data-torino.js` (poligoni distrettuali, fiumi, parchi, assi, ferrovia, stazioni, comuni) definisce solo le posizioni; il colore di ogni distretto deriva da `E.valoreDistretto` sugli indicatori simulati (densità, accessibilità, uso del suolo…). I corridoi progettuali vengono tracciati solo quando il cantiere esiste in `S.projects`, con tratteggio finché incompleti e anello di percentuale sul punto medio. La vista è zoomabile/pannabile e persiste tra i re-render.
