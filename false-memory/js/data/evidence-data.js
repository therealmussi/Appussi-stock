/* FALSE MEMORY — CASE 001 : The Disappearance
   Dati delle prove. La "verità canonica" (TRUTH, fine file) è fissa: ogni prova
   deve restare coerente con essa. Gli sblocchi usano azioni:
   - 'ev:<id>'         → la prova <id> viene scoperta/ricevuta
   - 'ex:<id>'         → la prova <id> viene "esaminata" (esame approfondito)
   - 'talk:<char>:<n>' → argomento n chiesto al personaggio
   - 'con:<char>:<id>' → la prova <id> presentata al personaggio
   - 'flag:<nome>'     → un'osservazione è stata confermata
   Un'azione fa da prerequisito per altre prove (ANY sui prerequisiti). */

(function () {

const D = (o) => Object.assign({ cat: 'document', reliability: 'unknown', chapter: 1, prereqs: [], examines: [] }, o);
const code = (c, o) => Object.assign({ code: c }, o);

const E = [

/* ══════════════════════════════════ FOTOGRAFIE ══════════════════════════════════ */

D(code('FOT-01', {
  id: 'P01', cat: 'photo', title: 'Ingresso dell\'edificio', short: 'Le Sablon, facciata e portone — 18/10, mattina',
  body: '<p>La facciata in pietra chiara del residence «Le Sablon», fotografata la mattina seguente la denuncia. Sul portone, il citofono e la telecamera A sopra lo stipite destro. Un cartello del cantiere di facciata sporge a metà lato.</p><p>Il marciapiede è asciutto. L\'ombra del portone è lunga e netta, proiettata verso ovest: sole basso da est, coerente con il primo mattino.</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exP01', label: 'Analizza luce e meteo', title: 'Una notte senza pioggia',
    text: '<p>Direzione e lunghezza dell\'ombra datano lo scatto tra le 08:30 e le 09:00 del 18 ottobre. Il marciapiede è completamente asciutto. L\'archivio del servizio meteorologico comunale conferma: nessuna precipitazione tra le 15:00 del 17/10 e le 09:00 del 18/10. Notte asciutta, notte intera.</p>',
    setsFlag: 'dry_17', reliability: 'verified' }]
})),

D(code('FOT-02', {
  id: 'P02', cat: 'photo', title: 'Corridoio terzo piano', short: 'Pianerottolo davanti al 4B — rilievo del 19/10',
  body: '<p>Corridoio illuminato da una lampada a incasso. Sulla parete di sinistra, a circa un metro da terra, tre striature sottili di vernice rimossa, lunghe 20–30 cm.</p><p>La porta del 4B è socchiusa: dentro si intravede l\'angolo di uno scatolone da trasloco.</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exP02', label: 'Esamina le striature', title: 'Le striature della parete',
    text: '<p>Le striature seguono un arco discendente e terminano in un punto d\'impatto schiacciato: la traiettoria di un corpo che scivola lungo il muro dopo una spinta, con il tallone piantato a terra. Non il trascinamento di un corpo inerte: mancano i segni paralleli e regolari, e manca ogni traccia biologica. Sul battiscopa accanto, goccioline di stucco fresco: qualcuno stava già ritoccando quella parete.</p>',
    setsFlag: 'scratches_argument', reliability: 'verified' }]
})),

D(code('FOT-03', {
  id: 'P03', cat: 'photo', title: 'Appartamento di Daniel', short: '4B, zona giorno e scrivania — 19/10',
  body: '<p>Appartamento in ordine, non svaligiato. Sulla cucina, due tazze lavate rovesciate ad asciugare. Sul muro della cucina, un calendario da parete a pagina mensile. Sulla scrivania: un taccuino nero, un vecchio registratore a cassetta, la custodia vuota di un orologio.</p><p>Nell\'armadio della camera, un vano vuoto: la forma di un borsone sportivo è ancora visibile nella polvere.</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exP03', label: 'Zoom sul calendario', title: 'Il calendario da parete',
    text: '<p>Ad alto ingrandimento, la pagina di ottobre mostra tre note manoscritte di Daniel: «17 — C. 22:15» cerchiato, «10 — Dott. R» barrato con forza, «21 — M. 8:30» in matita, con un asterisco. Le voci sono state scritte in momenti diversi: la matita «21 — M. 8:30» è la più recente.</p>',
    unlocks: ['D06'], reliability: 'verified' }]
})),

D(code('FOT-04', {
  id: 'P04', cat: 'photo', title: 'Fotografia della festa', short: 'Compleanno di Daniel — fornita da Claire',
  body: '<p>Stampa fotografica: Daniel sorridente davanti a una torta, al centro dell\'inquadratura. Attorno, Claire, Thomas, Elise e tre altri invitati. Sul fondo, un muro di mattoni a vista e una griglia di aerazione.</p><p>Sul retro, con la penna: «Daniel — i 34. Giugno, il lago».</p>',
  reliability: 'uncertain', chapter: 2, prereqs: ['talk:claire:1'],
  examines: [
    { id: 'exP04', label: 'Confronta lo sfondo', title: '«Giugno, il lago»?',
      text: '<p>Il muro di mattoni a vista e la griglia di aerazione corrispondono al cortile interno del «Le Sablon», fotografato nell\'archivio del condominio. Nell\'angolo inferiore della stampa, la data impressa dal laboratorio: <strong>13 10 24</strong>. Nessun lago. Nessun giugno. (Vedi anche il verbale di condominio: DOC-02x.)</p>',
      unlocks: ['D02x'], setsFlag: 'party_false', reliability: 'certain' },
    { id: 'exP04b', label: 'Guarda i polsi in foto', title: 'Tutti i polsi della festa',
      text: '<p>Su ogni polso della fotografia si vede un orologio — tranne uno. Daniel non ne indossa nessuno. La custodia vuota sulla scrivania di P03 spiega il perché. Il 13 ottobre l\'orologio era già scomparso dal polso.</p>',
      requires: 'flag:watch_stopped', setsFlag: 'party_nowatch', reliability: 'certain' }]
})),

D(code('FOT-05', {
  id: 'P05', cat: 'photo', title: 'Ancora telecamera A — arrivo ore 22:12', short: 'Il citofono registra un\'arrivo alla 4B',
  body: '<p>Fotogramma della telecamera A (sopra il portone). Ora sovraimpressa: <strong>22:19</strong>. Una donna in cappotto grigio-verde, capelli raccolti, borsa a tracolla, preme il citofono e guarda in alto verso l\'obiettivo.</p><p>Il volto è nitido, di tre quarti.</p>',
  reliability: 'uncertain', chapter: 3, prereqs: ['ev:D11', 'ev:R05'],
  examines: [{ id: 'exP05', label: 'Confronta l\'orario', title: 'Tutte le telecamere marciano avanti',
    text: '<p>La telecamera A marcia avanti di 7 minuti e 10 secondi (verbale di manutenzione DOC-11). Ora sovraimpressa 22:19 → ora reale <strong>22:12</strong>. La donna è Claire Moreau, confermata dal confronto biometrico richiesto alla questura. Arriva alle 22:12, non alle 22:20 come lei ha dichiarato, e non alle 22:15 che ha scritto Daniel.</p>',
    reliability: 'verified' }]
})),

D(code('FOT-06', {
  id: 'P06', cat: 'photo', title: 'Ancora telecamera A — ore 22:35', short: 'Il portone tra le 22:28 e le 23:02',
  body: '<p>Fotogramma parziale: metà dell\'inquadratura della telecamera A è coperta dallo striscione del cantiere di facciata. Ora sovraimpressa <strong>22:42</strong>. Davanti al portone, nessuno. Il portone metallico è chiuso.</p>',
  reliability: 'uncertain', chapter: 3, prereqs: ['ev:P07'],
  examines: [{ id: 'exP06', label: 'Analizza la striscia di archivio', title: 'Nessuno davanti al portone',
    text: '<p>Dalla 22:24 alle 22:55 (ore reali, corrette della deriva di DOC-11) la telecamera A non registra <strong>nessun passaggio</strong> davanti al portone. Nessuna donna in cappotto grigio-verde. Nessuna sigaretta. Nessuna «Claire che fuma fuori alle 22:40».</p>',
    setsFlag: 'empty_2235', reliability: 'verified' }]
})),

D(code('FOT-07', {
  id: 'P07', cat: 'photo', title: 'Ancora telecamera A — ore 22:28', short: 'Un uomo con un borsone esce dal portone',
  body: '<p>Fotogramma ripreso di spalle: un uomo alto, cappotto scuro, un borsone sportivo su una spalla e una cartella rigida sotto il braccio. Ora sovraimpressa <strong>22:35</strong>. Attraversa la soglia senza esitare e piega verso la stazione.</p><p>Sul marciapiede: asciutto. Nessuna seconda persona. Nessuna lotta. Nessuna corsa.</p>',
  reliability: 'uncertain', chapter: 3, prereqs: ['ev:P05', 'flag:victor_fishing'],
  examines: [{ id: 'exP07', label: 'Analizza la figura', title: 'Tutto ciò che si porta via',
    text: '<p>La silhouette è compatibile con Daniel Moreau (altezza 1,84 m stimata dal rapporto con lo stipite). Il borsone corrisponde al vano — vuoto, ma con l\'impronta nella polvere — dell\'armadio di P03. La cartella rigida corrisponde alla cartella portadocumenti assente dal cassetto della scrivania. Il passo è regolare. Nessuno lo tocca.</p>',
    setsFlag: 'daniel_left', reliability: 'verified' }]
})),

D(code('FOT-08', {
  id: 'P08', cat: 'photo', title: 'Fotografia di N. Okafor — ore 22:41', short: 'Perizia infiltrazioni, piazza della stazione',
  body: '<p>Scatto dal secondo piano del palazzo di fronte alla stazione, allegato a una perizia assicurativa sulle infiltrazioni della grondaia. In primo piano, la grondaia. Sullo sfondo, sotto la pensilina: un uomo con un borsone e la cartella sotto il braccio entra nell\'ingresso della stazione.</p><p>Ora riportata a mano sulla perizia: 22:41.</p>',
  reliability: 'uncertain', chapter: 4, prereqs: ['ev:D05', 'ev:P06'],
  examines: [{ id: 'exP08', label: 'Confronta le due figure', title: 'Lo stesso uomo, dodici minuti dopo',
    text: '<p>Borsone, cartella rigida, cappotto: è la stessa figura di P07, circa 12–13 minuti dopo. La stazione dista 700 m dall\'edificio: 12 minuti a passo tranquillo con un borsone. Perfettamente coerente. Daniel è entrato alla stazione da solo, con calma, alle 22:41 del 17 ottobre.</p>',
    setsFlag: 'station_2241', reliability: 'certain' }]
})),

/* ═══════════════════════════════════ DOCUMENTI ═══════════════════════════════════ */

D(code('DOC-01', {
  id: 'D01', cat: 'document', title: 'Registro degli accessi', short: 'Fotocopia delle pagine del 16–18/10',
  body: '<p>Registro manoscritto dell\'inserviente. La colonna «ingressi» è compilata con cura; la colonna «uscite» è quasi vuota.</p><p><em>16/10</em>: (pagine bianche, poche voci) · <em>17/10</em>: 20:05 — «E. Laurent (in visita 4B)»; 22:12 — «C. Moreau (in visita 4B)». <strong>Nessuna voce di uscita</strong> per l\'intero 17 ottobre: né per Thomas Keller, né per Claire, né per lo stesso Daniel.</p><p>In fondo alla pagina del 17, una macchia d\'inchiostro e una parola interrotta a metà: «23:3—».</p>',
  reliability: 'verified', chapter: 1,
  examines: [{ id: 'exD01', label: 'Confronta con il citofono', title: 'Una colonna «uscite» vuota',
    text: '<p>Un edificio di 18 appartamenti, un giorno di settimana, e <em>nessuna uscita</em> registrata in 24 ore. O non c\'erano entrate da registrare — impossibile, ci sono — oppure chi teneva il registro non era al suo posto. La parola «23:3—» comincia un orario che non verrà mai finito.</p>',
    setsFlag: 'register_gap', reliability: 'certain' }]
})),

D(code('DOC-02', {
  id: 'D02', cat: 'document', title: 'Ritaglio necrologio — Adèle Moreau', short: '«Le Réveil de Saint-Aurel», 12/03/2019',
  body: '<p>«<em>Adèle Moreau, 63 anni, ricercatrice in linguistica, ci ha lasciati dopo una lunga malattia, affrontata con la lucidità e l\'ironia dei suoi libri. Lascia i figli Claire e Daniel.</em>»</p><p>Sul margine, a matita di mano di Daniel: «A. R. — parlarne». La data è di cinque anni e mezzo prima.</p>',
  reliability: 'verified', chapter: 1,
  examines: [{ id: 'exD02', label: 'Cerca l\'articolo esteso', title: 'La malattia che non nomina',
    text: '<p>L\'archivio del giornale conserva l\'articolo completo: la «lunga malattia» era una <strong>degenerazione frontotemporale ad esordio precoce, forma familiare</strong>. I figli, precisa il giornalista, «hanno chiesto di non essere contattati per lo studio genetico». Claire aveva rifiutato di sapere. Daniel, ventotto anni, si era iscritto alla lista di attesa.</p>',
    setsFlag: 'family_illness', reliability: 'certain' }]
})),

D(code('DOC-03', {
  id: 'D03', cat: 'document', title: 'Ricevuta visita specialistica', short: 'Dr. A. Renard, neurologia — 10/10/2024, ore 11:20',
  body: '<p>Ricevuta timbrata: «Dr. A. Renard, specialista in neurologia — Saint-Aurel, 10 ottobre 2024, ore 11:20 — visita specialistica». Importo saldato in contanti.</p><p>Sul retro, con la matita, una nota di Daniel: «16:40? no. il 10. 40 min.».</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exD03', label: 'Verifica data e specialista', title: 'Il 10 ottobre, non il 17',
    text: '<p>Il timbro del laboratorio conferma: 10 ottobre, ore 11:20. Sul retro, Daniel si corregge da solo — aveva scritto «16:40» come orario, e scivolato la data al 17, prima di barrare tutto. Stava sbagliando di una settimana l\'appuntamento con il suo neurologo. E lo <em>sapeva</em>: la correzione è scritta da lui, come si corregge chi sente che la memoria sta cominciando a mentirgli.</p>',
    setsFlag: 'renard_confirmed', reliability: 'certain' }]
})),

D(code('DOC-04', {
  id: 'D04', cat: 'document', title: 'Biglietto sulla lavagnetta', short: '«C. — 22:15. Porta le lettere. NON firmare.»',
  body: '<p>Lavagnetta bianca appesa alla porta interna dell\'appartamento, sequestrata nella seconda perquisizione (20/10). Scrittura frettolosa di Daniel: «<strong>C. — 22:15. Porta le lettere. NON firmare.</strong>»</p><p>Più sotto, più piccola, una seconda riga in una mano diversa — pressione irregolare, tremore fine: «non come mamma».</p>',
  reliability: 'uncertain', chapter: 2, prereqs: [],
  examines: [{ id: 'exD04', label: 'Analisi della scrittura', title: 'Due mani, due stati d\'animo',
    text: '<p>Grafologico: la prima riga è di Daniel, decisa, modellata sulla sua solita scrittura. La seconda riga non è di Claire, né di Thomas, né di Elise. La pressione alterna e il tremore fine indicano chi scrive raramente a mano — o chi ha appena cominciato a perdere l\'abitudine. Stessa pressione, stesso tremore si ritrovano negli appunti di Daniel del 2019: la stessa mano, meno sicura. «Non come mamma» è di lui.</p>',
    setsFlag: 'secondhand_note', reliability: 'certain' }]
})),

D(code('DOC-05', {
  id: 'D05', cat: 'document', title: 'Biglietto ferroviario', short: '#4417 — 18/10, 06:12 — Saint-Aurel → Marsiglia — a nome D. MORAN',
  body: '<p>Estratto dal sistema di vendita della compagnia: biglietto acquistato online <strong>il 15 ottobre alle 22:10</strong>, carta di credito personale di Daniel Moreau (carta che termina 4471), tariffa non rimborsabile, posto 2C.</p><p>Passeggero: <strong>«D. MORAN»</strong>. Partenza: <strong>18 ottobre, ore 06:12</strong>, Saint-Aurel → Marsiglia.</p>',
  reliability: 'verified', chapter: 3, prereqs: ['flag:daniel_left'],
  examines: [{ id: 'exD05', label: 'Controlla la data di acquisto', title: 'Pianificato allo scadere del 15',
    text: '<p>Il 15 ottobre alle 22:10 Daniel Moreau comprava un biglietto a nome falso. Acquistato nella stessa serata in cui, secondo l\'orologio che quel giorno si ferma per sempre (OBJ-02), il suo tempo si arresta alle 21:47. La data è <strong>due giorni prima della sparizione</strong>: la partenza non è stata una fuga improvvisata, ma un piano.</p>',
    setsFlag: 'ticket_planned', reliability: 'certain' }]
})),

D(code('DOC-06', {
  id: 'D06', cat: 'document', title: 'Pagina del calendario', short: 'Calendario da parete — ottobre 2024',
  body: '<p>Calendario mensile da cucina, sequestrato nella prima perquisizione. Manoscritto di Daniel:<br>• «17 — C. 22:15» (cerchiato, inchiostro stabile)<br>• «10 — Dott. R» (barrato due volte, pressione forte)<br>• «21 — M. 8:30» (matita recente, con un asterisco)<br>• «15 — K.?» con punto interrogativo</p>',
  reliability: 'uncertain', chapter: 1, prereqs: ['ev:P03'],
  examines: [{ id: 'exD06', label: 'Analizza le annotazioni', title: 'Chi è M.? Che cos\'è il 21?',
    text: '<p>«M. 8:30» del 21 ottobre è l\'unica voce in matita, aggiunta dopo tutte le altre: qualunque cosa sia, Daniel la aspettava <em>nel futuro</em>. Le prime visite degli ambulatori della regione partono tutte alle 8:30. Le ipotesi possibili sono due: un colloquio, o una cura.</p>',
    setsFlag: 'calendar_M830', reliability: 'uncertain' }]
})),

D(code('DOC-07', {
  id: 'D07', cat: 'document', title: 'Estratto traffico telefonico', short: 'Linea mobile di D. Moreau — 15–18/10 (gestore)',
  body: '<p>• <strong>15/10</strong>: (nessuna chiamata)<br>• <strong>16/10, 21:15</strong> — chiamata in ingresso «C. MOREAU», durata 11 min.<br>• <strong>16/10, 21:31</strong> — segreteria in uscita verso «C. MOREAU», 42 sec.<br>• <strong>17/10, 19:12</strong> — chiamata in ingresso «E. LAURENT», 4 min.<br>• <strong>17/10, 20:52</strong> — chiamata in uscita verso «E. LAURENT», 6 min.<br>• <strong>Dopo le 21:00 del 17/10: nessuna attività.</strong> Nessuna chiamata, nessun dato.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['ev:R02', 'flag:claire_nocontact'],
  examines: [{ id: 'exD07', label: 'Analizza i silenzi', title: 'Il telefono si spegne alle 21:07',
    text: '<p>L\'ultima antenna con cui il telefono di Daniel si registra è quella della piazza della stazione, ore <strong>21:07</strong> (ping secondario, interpretabile come un passaggio). Successivamente: spento o scarico. Se qualcuno l\'avesse portato via con la forza, il telefono non può essere «andato ad accomodarsi da solo» a 400 metri dalla stazione, dieci minuti dopo il borsone (P07) è passato davanti alla telecamera.</p>',
    setsFlag: 'phone_off_2107', reliability: 'certain' }]
})),

D(code('DOC-08', {
  id: 'D08', cat: 'document', title: 'E-mail di reclamo garanzia', short: 'Assicurazione dispositivo — inviata il 15/10 alle 10:02',
  body: '<p>«<em>Gentili signori, il 15 ottobre 2024 alle ore 09:12 il mio telefono è scivolato dai gradini tra il primo e il secondo piano del mio edificio. Lo schermo è crepato in tre punti. Chiedo l\'attivazione della garanzia danni accidentali. — Daniel Moreau</em>»</p><p>Allegato: foto del telefono crepato, scattata <strong>il 15/10 alle 09:40</strong>.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['ex:O03'],
  examines: [{ id: 'exD08', label: 'Confronta con il telefono sequestrato', title: 'Rotto due giorni prima',
    text: '<p>Le tre crepe dell\'allegato coincidono millimetricamente con quelle del telefono sequestrato il 19/10 nella cucina di Daniel. Lo schermo si era rotto <strong>due giorni prima della sparizione</strong>, scalando le scale, da solo. La polizia lo aveva classificato « possibile evidenza di aggressione»: era una pratica di garanzia.</p>',
    setsFlag: 'phone_old', reliability: 'certain' }]
})),

D(code('DOC-09', {
  id: 'D09', cat: 'document', title: 'Tessera clinica Saint-Pierre', short: 'Neurologia — Marsiglia — 21/10, 08:30 — nome: D. MORAN',
  body: '<p>Tessera di ammissione del reparto di neurologia della clinica Saint-Pierre di Marsiglia, trovata <em>dentro la busta che Daniel aveva consegnato a Claire</em>, tra le lettere della madre (ritrovamento: 22/10, dopo il riesame chiesto dall\'investigatore).</p><p>Paziente: D. MORAN. Prima visita: lunedì 21 ottobre, ore 08:30. In basso, a mano: «portare le bobine e il diario».</p>',
  reliability: 'verified', chapter: 4, prereqs: ['con:claire:D05'],
  examines: [{ id: 'exD09', label: 'Collega il calendario', title: '«21 — M. 8:30»',
    text: '<p>La voce misteriosa del calendario (DOC-06) finalmente trova il suo «M.», e un perché a quel giorno: <strong>Marsiglia</strong>, la clinica Saint-Pierre, lunedì 21 alle 8:30. Daniel aveva comprato un biglietto (15/10), prenotato una clinica (21/10), e messo dentro la stessa busta le lettere della madre e la sua — per farle arrivare a Claire «quando sarebbe stato lontano abbastanza».</p>',
    setsFlag: 'clinic_confirmed', reliability: 'certain' }]
})),

D(code('DOC-10', {
  id: 'D10', cat: 'document', title: 'Estratto conto — bonifico Keller', short: '09/02/2024 — T. KELLER → D. MOREAU — € 12.000',
  body: '<p>Bonifico unico, causale «prestito — da restituire quando puoi». Mittente Thomas Keller, destinatario Daniel Moreau.</p><p>Nello stesso periodo, comunicazione della banca ipotecaria: tre rate arretrate del mutuo del laboratorio di restauro di Daniel.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['flag:ledger'],
  examines: [{ id: 'exD10', label: 'Verifica i tempi del debito', title: 'Dodici mila euro e un laboratorio',
    text: '<p>Il laboratorio di restauro di Daniel chiude nel marzo 2024. Il 9 febbraio Thomas lo tiene a galla con 12.000 euro. Sette mesi dopo, secondo le pagine del taccuino, il debito non è ancora cominciato a scendere.</p>',
    reliability: 'verified' }]
})),

D(code('DOC-11', {
  id: 'D11', cat: 'document', title: 'Verbale di manutenzione — telecamere', short: '«Le Sablon» — intervento del 09/10/2024',
  body: '<p>Verbale dell\'installatrice di impianti: «Sistema di videosorveglianza, due telecamere. <strong>Camera A (portone): orologio interno avanti di 7 minuti e 10 secondi</strong>, non allineato dopo lo stacco di corrente del 02/10. <strong>Camera B (cortile): obiettivo coperto dallo striscione del cantiere</strong> di facciata dal 14/10. Ritiro concertato per la settimana del 21/10.»</p>',
  reliability: 'verified', chapter: 2, prereqs: ['talk:victor:2'],
  examines: [{ id: 'exD11', label: 'Ricalibra gli orari', title: '+7 minuti su ogni fotogramma',
    text: '<p>Ogni «ancora» della camera A va corretto di <strong>−7 minuti e 10 secondi</strong>. Il fotogramma «22:35» dell\'archivio è in realtà delle 22:28. Prima di questa correzione gli orari delle telecamere dell\'edificio non sono affidabili entro una finestra di sette minuti — abbastanza grande da rendere tutti concordi e nessuno giusto.</p>',
    setsFlag: 'clock_drift', reliability: 'certain' }]
})),

D(code('DOC-02x', {
  id: 'D02x', cat: 'document', title: 'Verbale condominiale del 13/10', short: 'Festa nel cortile — autorizzazione del 09/10',
  body: '<p>Verbale dell\'assemblea di condominio: «Domanda di Claire Moreau (3A) per uso cortile, domenica <strong>13 ottobre</strong>, ore 15:00–19:00, compleanno del fratello Daniel. Approvata all\'unanimità.» A margine, la firma di Victor Hale come revisore.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['ev:P04'],
  examines: []
})),

/* ═══════════════════════════════════ REGISTRAZIONI ═══════════════════════════════════ */

D(code('REC-01', {
  id: 'R01', cat: 'recording', title: 'Memo del dictafono', short: 'Nastro di Daniel — 16/10/2024, ore 23:05 circa',
  body: '<p>Registratore a cassetta trovato nella scrivania di Daniel. Voce di Daniel, stanca, piatta, da solo in cucina. Sullo sfondo, il ticchettio di un orologio a pendolo. Durata dell\'ascolto: 2:12.</p><p><q>…Renard dice che è presto. Presto per cosa, Dottore? Ho comprato il biglietto. Il 21, alle otto e mezza, c\'è — come si chiama la stanza, la stanza dove ti spiegano cosa ti rimane. Se chiede Victor, dì che sono andato a pescare. Se chiede Thomas, non rispondere. Claire non deve sapere niente prima di mercoledì. Se lei sa, mi viene a prendere. Come mamma ha preso papà. Lunedì prossimo non sarò più lo stesso, in un certo senso. Questo nastro — se lo senti, Claire — spegnilo.</q></p>',
  reliability: 'verified', chapter: 3, prereqs: ['ev:D03', 'ev:D02'],
  examines: [{ id: 'exR01', label: 'Riascolta il finale', title: '«Lunedì non sarò più lo stesso»',
    text: '<p>La frase chiave, riascoltata in cuffia: «Lunedì prossimo non sarò più lo stesso, <em>in un certo senso</em>». Il lunedì successivo è il 21 ottobre, ore 08:30. La «stanza dove ti spiegano cosa ti rimane» è una visita neurologica. Daniel si stava salutando da solo, due giorni prima ancora di sparire.</p>',
    setsFlag: 'tape_plan', reliability: 'certain' }]
})),

D(code('REC-02', {
  id: 'R02', cat: 'recording', title: 'Dichiarazione registrata — Claire Moreau', short: 'Questura, 19/10/2024, ore 09:40',
  body: '<p>La voce di Claire, piana ma controllata:</p><p><q>No, Daniel non lo vedo da giorni. Una settimana, forse di più. L\'ultimo contatto… non ricordo, non gli ho telefonato. Sono passata a trovarlo verso le 22:15, gli ho lasciato delle cose allo sportello e sono uscita subito. Ero di fretta. Mi pare di averlo visto tranquillo, un po\' stanco. L\'estate scorsa siamo stati tutti al lago per il suo compleanno — era un periodo felice.</q></p>',
  reliability: 'uncertain', chapter: 2,
  examines: [{ id: 'exR02', label: 'Ascolta con cuffie', title: 'I dettagli fuori campo',
    text: '<p>A metà dichiarazione, a bassissima voce, una frase di un agente fuori campo: «<em>il cappotto grigio-verde? No, quello era di ieri mattina</em>». Qualcuno ricorda a Claire di averla vista <em>quella mattina</em>, davanti all\'edificio, con quel cappotto. Lei non risponde e cambia argomento. Il ricordo di «avere visto qualcuno fuori» potrebbe non essere affatto suo — o non essere di quella sera.</p>',
    setsFlag: 'claire_outofsync', reliability: 'certain' }]
})),

D(code('REC-03', {
  id: 'R03', cat: 'recording', title: 'Dichiarazione registrata — Thomas Keller', short: 'Questura, 19/10/2024, ore 14:10',
  body: '<p><q>Thomas Keller, amico di Daniel da vent\'anni. L\'ho visto martedì sera verso le sette, da lui. Abbiamo bevuto una birra, sono uscito verso le 19:45. Tutto normale. Daniel stava bene. Nessun viaggio in programma, mi avrebbe detto. Volevamo fare un giro a fine mese insieme.</q></p><p>«Com\'era la strada quando è uscito?»</p><p><q>Piovigginosa. Mi sembra. E ho incrociato Claire sotto casa, verso le 22:40 — sono rientrato tardi, mi sono fermato al Steam. Fumava davanti al portone, col cappotto grigio-verde. Non le ho detto niente, ero di fretta.</q></p>',
  reliability: 'uncertain', chapter: 2,
  examines: [{ id: 'exR03', label: 'Ascolta con cuffie', title: 'La pioggia che non c\'è stata',
    text: '<p>Thomas dichiara di aver incrociato Claire «verso le 22:40» <em>col cappotto grigio-verde, sotto la pioggia</em>. Ma quella notte non ha piovuto (FOT-01): il cappotto grigio-verde e la pioggia appartengono alla <strong>mattina del 18 ottobre, ore 09:40</strong>, quando Claire ha parlato con gli agenti davanti all\'edificio — lo stesso mattino in cui, fuori campo nella sua dichiarazione (REC-02), un agente la colloca davanti al portone. Thomas non mente: ha fuso due serate in una.</p>',
    setsFlag: 'thomas_confused', reliability: 'certain' }]
})),

D(code('REC-04', {
  id: 'R04', cat: 'recording', title: 'Messaggio in segreteria — Daniel → Claire', short: '16/10/2024, ore 21:31 — 42 secondi',
  body: '<p>Voce di Daniel, trattenuta:</p><p><q>Ciao Claire, sono io. Guarda, domani sera passo senz\'altro, mi pare di aver capito che hai le lettere della mamma pronte. Ti lascio anche una cosa in più — poi ti spiego. E non preoccuparti per il dottore, <em>non è niente</em>. Anzi, sì: è esattamente niente. A giovedì… no aspetta. A mercoledì… vabbè. A domani. Dormi bene.</q></p><p>Al secondo 31: un rumore metallico — qualcosa che si chiude.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['con:claire:D07'],
  examines: [{ id: 'exR04', label: 'Analizza i tempi', title: 'L\'orologio dei giorni',
    text: '<p>Il 16 è mercoledì, ma Daniel sbaglia due volte il giorno prima di arrivare a «domani» — lo stesso errore con cui, sulla ricevuta del dottore (DOC-03), aveva scritto «16:40» e «il 17». La memoria di Daniel slittava già da giorni: sulla segreteria, la preoccupazione di Claire per «il dottore» non ha riscontro nella sua dichiarazione (REC-02) in cui nega ogni contatto. La registrazione dura 42 secondi; la correzione dura 4.</p>',
    setsFlag: 'voicemail_day_slip', reliability: 'certain' }]
})),

D(code('REC-05', {
  id: 'R05', cat: 'recording', title: 'Registrazione citofono — 21:48 → 22:06', short: 'Buffer dell\'impianto «Le Sablon», canale interno',
  body: '<p>Traccia dell\'interfono, attivata dall\'apertura del portone. Il canale interno è sincronizzato, non deriva (a differenza delle telecamere, DOC-11).</p><p><strong>21:48</strong> — scatto del portone, due passi. <strong>21:51</strong> — voci maschili a bassa voce: «…dodici mila, Daniel.» — «Anche quest\'anno, sempre dodici mila?» — «Basta, Thomas, per favore.» <strong>21:55</strong> — tonfo sordo, stridio di scarpate sulla vernice della parete. <strong>22:04</strong> — scatto del portone. <strong>22:06</strong> — silenzio.</p>',
  reliability: 'verified', chapter: 2, prereqs: ['ev:D11'],
  examines: [{ id: 'exR05', label: 'Migliora l\'audio', title: 'Le voci di due uomini',
    text: '<p>Con il filtraggio del laboratorio: le due voci sono di <strong>due uomini</strong>, la seconda identificabile come Thomas Keller per tre tratti vocali confermati dalla banca vocale della questura. Il tonfo di 21:55 e lo stridore aprono una finestra di 9 secondi: qualcosa di violento, ma tra <em>due persone che si conoscono</em>. Poi una porta chiusa «normalmente». Nessun grido. Nessuna richiesta di aiuto.</p>',
    setsFlag: 'slam_2204', reliability: 'certain' }]
})),

/* ══════════════════════════════════════ OGGGETTI ══════════════════════════════════════ */

D(code('OBJ-01', {
  id: 'O01', cat: 'object', title: 'Set di chiavi', short: 'Chiavi dell\'app. 4B — trovate sul gancio della cucina',
  body: '<p>Tre chiavi: ingresso dell\'edificio, cancellino del cortile, cassetta postale. Collocate sull\'uncino di ottone all\'interno della porta della cucina di Daniel, esattamente dove le mostrava la fotografia del catastro del 2019.</p><p>Manca la chiave del laboratorio di restauro — ceduto nel marzo 2024.</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exO01', label: 'Ragiona sulle chiavi', title: 'Chi chiude e se ne va',
    text: '<p>Due letture possibili. <em>Lettura ingenua</em>: le chiavi a casa significano che Daniel non è mai uscito. <em>Lettura coerente</em>: chi parte per sempre porta con sé i bagagli e lascia le chiavi in un punto visibile, perché siano trovate e usate. A favore della seconda lettura: il borsone è sparito insieme a lui (FOT-07). Le chiavi, sul gancio, sono un messaggio — o una banalità. Sta a te decidere se è una firma.</p>',
    reliability: 'uncertain' }]
})),

D(code('OBJ-02', {
  id: 'O02', cat: 'object', title: 'Orologio rotto', short: 'Fermo alle 21:47 — trovato sul pianerottolo di piano 3',
  body: '<p>Orologio da polso con cinturino in pelle, vetro frantumato, lancette ferme alle <strong>21:47</strong>. Rinvenuto dall\'inserviente il 18/10 alle 06:50 sul pianerottolo del terzo piano, vicino alle striature della parete (FOT-02).</p><p>La finestrella della data segna: <strong>«15»</strong>.</p>',
  reliability: 'uncertain', chapter: 2, prereqs: ['con:victor:D01'],
  examines: [{ id: 'exO02', label: 'Controlla la finestrella della data', title: '21:47 di due giorni prima',
    text: '<p>La ghiera della data non è aggiornata da due giorni: segna «15», non «17». L\'orologio si è fermato alle 21:47 di <strong>venerdì 15 ottobre</strong> — il giorno in cui Daniel andò da Renard, comprò il biglietto e, secondo il suo dictafono, «lasciò sull\'armadio le cose che non avrebbe più ripreso». Nessuna lotta alle 21:47 del 17. Nessuna lotta alle 21:47 di nessun giorno: solo un orologio fermo da due giorni, caduto dalla tasca di un cappotto che scendeva le scale con zaino e cartella.</p>',
    setsFlag: 'watch_stopped', reliability: 'certain' }]
})),

D(code('OBJ-03', {
  id: 'O03', cat: 'object', title: 'Telefono danneggiato', short: 'Schermo crepato — sequestrato nella cucina, 19/10',
  body: '<p>Telefono con schermo incrinato in tre raggi partenti dal bordo superiore destro. Trovato sulla sedia della cucina di Daniel, schermo in su. Caricato al 61%.</p><p>La polizia lo ha classificato «possibile evidenza di aggressione nello spazio cucina».</p>',
  reliability: 'uncertain', chapter: 1,
  examines: [{ id: 'exO03', label: 'Esamina le crepe', title: 'Crepe secche',
    text: '<p>Nelle crepe più strette è penetrata <strong>polvere stabile</strong>: lo schermo è rotto da almeno 24, forse 48 ore prima del 19/10. Le crepe inoltre non attraversano i punti di flessione del telaio, come accade in un impatto da presa in mano: partono dal bordo, coerentemente con una caduta da altezza di mano. Il telefono aveva bisogno di una pratica di garanzia — non di un referto.</p>',
    unlocks: ['D08'], reliability: 'certain' }]
})),

D(code('OBJ-04', {
  id: 'O04', cat: 'object', title: 'Taccuino nero', short: 'Appunti e conti di Daniel — sequestrato sulla scrivania',
  body: '<p>Taccuino a righe, copertina flessibile. Voci sparse:<br>• «<strong>K. — 12.000</strong>» incolonnato nove volte, con date a scendere e nessuna riga barrata.<br>• «<strong>Renard 10/10</strong>» — e sotto, la stessa mano, «17? 16:40?» poi barrato forte.<br>• «<strong>MORAN</strong>» in maiuscolo, da solo al centro di una pagina.<br>• <strong>Pagine 41–44 strappate</strong> lungo la cucitura: quattro pagine via, con piccole fibre di carta ancora sulla spirale.</p>',
  reliability: 'verified', chapter: 1,
  examines: [{ id: 'exO04', label: 'Accosta le voci', title: 'Pagine strappate e due orologi',
    text: '<p>Le pagine 41–44 strappate contenevano, secondo le impronte di pressione lasciate sulla pagina seguente, «un elenco di nomi e orari» — o una lettera. Sotto la voce «MORAN», lo sfregamento di una matita ha lasciato leggibile uno schema: <strong>«S-A → M-A-R»</strong>. Saint-Aurel → Marsiglia. Il taccuino sapeva già la direzione.</p>',
    unlocks: ['D03', 'D06', 'D10'], setsFlag: 'ledger', reliability: 'certain' }]
})),

D(code('OBJ-05', {
  id: 'O05', cat: 'object', title: 'Bottone strappato', short: 'Bottone di cappotto — tasca dell\'inserviente',
  body: '<p>Bottone di noce, ø 23 mm, con filo nero ancora infilato, strappato con stoffa. Non denunciato: Victor Hale lo teneva nel taschino del cappotto. Consegna dall\'inserviente: «ritrovato sul pianerottolo di piano 3, la sera del 17 o la mattina del 18 — non ricordo con precisione».</p>',
  reliability: 'uncertain', chapter: 2, prereqs: ['con:victor:R05'],
  examines: [{ id: 'exO05', label: 'Confronta con gli abiti', title: 'Un bottone da cappotto da uomo',
    text: '<p>Il diametro (23 mm) e le quattro forature corrispondono ai bottoni dei cappotti di lana pesante da uomo. Il cappotto scuro che Thomas indossa nella dichiarazione registrata (REC-03, immagine di testa) ne ha due identici sul lato sinistro — e uno, al polso, <strong>manca</strong>. Il cappotto grigio-verde di Claire è da donna: niente a che fare.</p>',
    setsFlag: 'button_thomas', reliability: 'certain' }]
}))

];

window.FM_EVIDENCE = E;

/* ─────────────────────────── VERITÀ CANONICA ───────────────────────────
   17/10/2024 — edificio «Le Sablon», 12 rue de la Fonderie, Saint-Aurel.
   19:58→20:35  Elise in visita, si lasciano con calma; Daniel le affida una scatola di fotografie.
   21:48→22:04  Thomas: lite per i 12.000 € di debito. Daniel lo spinge contro
                la parete del pianerottolo di piano 3 (striature, bottone strappato). Thomas esce furioso.
   22:12→22:26  Claire consegna a Daniel la busta con le lettere della madre e un
                mandato da firmare per vendere la casa di famiglia. Daniel rifiuta («tu sai perché»).
   22:28  Daniel esce da solo con borsone e cartella. A Victor: «Se qualcuno chiede,
                dì che sono andato a pescare».
   22:41  fotografia Okafor: Daniel entra alla stazione. Telefono in silenzio dal 21:07.
   18/10 06:12 treno #4417 «D. MORAN» per Marsiglia.
   18/10 06:50 Victor trova l'orologio sul pianerottolo di piano 3.
   MOTIVO: il 10/10 il neurologo Renard gli ha comunicato la diagnosi della stessa
   malattia degenerativa ereditaria che ha ucciso la madre nel 2019. Valutazione
   clinica prenotata il 15/10 alla clinica Saint-Pierre di Marsiglia (21/10, 08:30).
   Sceglie di partire da solo per non farsi fermare da Claire — come lei aveva
   fermato il padre, «come mamma aveva preso papà» — e per non farle rivivere la
   lenta scomparsa della madre. NESSUN CRIMINE. NESSUN RAPITORE. NESSUN CADAVERE.
   BUGIARDI DELIBERATI: Thomas (orario della visita + «nessun viaggio»), Victor
   (omissioni nel registro e nelle segnalazioni — timore di essere licenziato).
   RICORDI FALSI SINCERI: Claire (orari, negazione della telefonata, festa «al lago
   a giugno»), Victor (orario dell'uscita di Daniel), Thomas (l'incontro con
   «Claire alle 22:40» fuso con il mattino del 18), Elise (il «lunedì» come
   promessa — era una speranza, non un accordo).
   PROVE TRUCIOLARI: orologio fermo (si era già rotto il 15/10), telefono crepato
   (caduto per le scale il 15/10), striature della parete e bottone (la lite con
   Thomas, non un sequestro), chiavi sul gancio (una scelta, non un indizio). */

window.FM_TRUTH = {
  whatHappened: 'voluntary',
  lastInside: 'victor',
  whyLeft: 'illness',
  liars: ['thomas', 'victor'],
  falseMemory: ['claire', 'victor', 'thomas', 'elise'],
  watch: 'stopped_before',
  essential: ['P07', 'D05', 'D09', 'R01', 'D11', 'R05'],
  misleading: ['O02', 'O03', 'O01'],
  summary: 'Daniel Moreau è uscito da solo dal «Le Sablon» alle 22:28 del 17 ottobre 2024, con un borsone sulla spalla e la cartella dei documenti, ed è entrato alla stazione alle 22:41. Ha dormito nei pressi e ha preso il treno delle 06:12 del 18 ottobre per Marsiglia, a nome D. Moran, per presentarsi con otto ore di anticipo alla visita neurologica della clinica Saint-Pierre fissata per il 21 ottobre, ore 08:30. Dieci giorni prima (10/10) il neurologo Renard gli aveva comunicato la diagnosi della stessa malattia degenerativa ereditaria che aveva ucciso la madre nel 2019. Ha comprato il biglietto il 15 ottobre. Ha scelto di non dire nulla a Claire per non farsi fermare — come lei aveva fermato il padre, che poi era morto lo stesso — e per non diventare, davanti a lei, di nuovo «mamma». Nessun crimine. Nessun rapitore. Nessun cadavere.'
};
})();
