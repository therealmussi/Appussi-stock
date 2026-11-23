/* FALSE MEMORY - CASE 001 : personaggi, testimonianze, interrogatori, capitoli, finali. */

(function () {

window.FM_META = {
  title: 'FALSE MEMORY',
  caseId: 'CASE 001 - THE DISAPPEARANCE',
  subject: 'Daniel Moreau, 34 anni, restauratore architettonico',
  place: 'Edificio Le Sablon, 12 rue de la Fonderie - Saint-Aurel',
  dateOfDisappearance: '17 ottobre 2024',
  reported: '18 ottobre 2024, ore 08:52 (Claire Moreau)',
  status: 'persona scomparsa - indagine indipendente',
  briefing:
    '<p>Le Sablon e un edificio residenziale del 1936: diciotto appartamenti e un inserviente di notte. ' +
    'Daniel Moreau vive al 4B dal 2015. Il 18 ottobre alle 08:52 la sorella Claire lo dichiara disperso: ' +
    'non risponde da ieri sera.</p>' +
    '<p>La questura apre il fascicolo e rende l\'edificio disponibile per i rilievi. I risultati preliminari ' +
    'sono un mosaico: quattro persone collegate al disperso, quattro versioni, e un appartamento troppo ' +
    'ordinato per un uomo sparito nel nulla.</p>' +
    '<p>In questo caso nessuna fonte e affidabile per principio. Alle volte chi mente crede davvero a ' +
    'quello che dice. Consegna le tue conclusioni soltanto quando avrai prove adeguate.</p>',
  objectives: [
    'Raccogli le testimonianze e confrontale con le prove fisiche.',
    'Esamina a fondo fotografie, documenti e registrazioni: molti dettagli escono solo al secondo sguardo.',
    'Costruisci la bacheca: collega le prove e assegna le relazioni.',
    'Ricostruisci la notte del 17 ottobre nella Timeline.',
    'Quando avrai abbastanza elementi, apri CONCLUSIONI e consegna la tua ricostruzione.'
  ]
};

window.FM_CHARACTERS = {

  daniel: {
    id: 'daniel', name: 'Daniel Moreau', age: 34, role: 'Scomparso',
    relation: '-', trust: 'indeterminata',
    portrait: 'DM', accent: '#9db4c8',
    desc: 'Restauratore architettonico. Vive al 4B di Le Sablon dal 2015. Chiuso e preciso: non perde mai un appuntamento. Il laboratorio che teneva con due soci ha chiuso nel marzo 2024.',
    profile:
      '<p><strong>Professione:</strong> restauro architettonico (laboratorio ceduto, 03/2024)</p>' +
      '<p><strong>Famiglia:</strong> sorella Claire, 38 anni. Madre Adele, morta nel 2019. Padre assente dal 2008.</p>' +
      '<p><strong>Salute:</strong> nessuna segnalazione fino al 2024. Visite pagate in contanti.</p>' +
      '<p><strong>Finanze:</strong> debito di 12.000 euro con Thomas Keller (02/2024); mutuo con tre rate arretrate.</p>' +
      '<p><strong>Abitudini:</strong> camminate serali, appunti su taccuino, orologi disegnati su ogni margine.</p>',
    statement: null, topics: [], confronts: {}
  },

  claire: {
    id: 'claire', name: 'Claire Moreau', age: 38, role: 'Sorella',
    relation: 'Sorella maggiore', trust: 'affidabile in apparenza',
    portrait: 'CM', accent: '#b98d6f',
    desc: 'Farmacista. Organizzata e protettiva. Ha gestito la malattia della madre come un impresa: orari, farmaci, rifiuti. E lei che ha deciso di vendere la casa di famiglia.',
    profile:
      '<p><strong>Lavoro:</strong> farmacia civica, turno di mattina.</p>' +
      '<p><strong>Rapporto con Daniel:</strong> una telefonata ogni domenica. Dal 2016 gestisce lei la burocrazia della famiglia.</p>' +
      '<p><strong>Dopo la morte della madre (2019):</strong> ha rifiutato ogni colloquio con i neurologi. «Non sapevamo, e non dovevamo sapere.»</p>' +
      '<p><strong>Progetto in corso:</strong> vendita della casa di famiglia. Serve la firma di Daniel.</p>',
    statement: { title: 'Dichiarazione scritta', date: '18/10/2024, ore 08:52', text:
      '<p>«Sono Claire Moreau, sorella di Daniel. Ieri sera gli ho parlato al telefono verso le 22:15; poi sono salita a casa sua, gli ho lasciato delle cose allo sportello e sono uscita subito, perche non avevo trovato parcheggio. Poi stamattina non rispondeva piu, e ho chiamato voi.</p>' +
      '<p>Daniel non ha nemici. A volte e distratto, ultimamente: ha chiuso il laboratorio. Ma questo e tutto. Per il resto era un periodo tranquillo.»</p>' },
    topics: [
      { n: 1, q: 'Raccontami la festa di compleanno. Che cosa ricordi esattamente?',
        a: '«Giugno, al lago: la casa dei nostri nonni, prima che la vendessero. Era l\'ultimo anno in cui eravamo tutti e tre insieme. Ho una fotografia; se aiuta, te la mando.»',
        unlocks: ['P04'], note: 'La festa ha una data precisa nella memoria di Claire. Verificala.' },
      { n: 2, q: 'Nei giorni prima della sparizione, vi eri parlata al telefono?',
        a: '«No. Non questa settimana. Se mi avesse chiamato, l\'avrei saputo. Perche me lo chiedi?»',
        setsFlag: 'claire_nocontact', note: 'Il gestore telefonico potra dire l\'ultima parola su questo.' },
      { n: 3, q: 'Che cosa hai lasciato allo sportello? Che cos\'era la busta?',
        a: '«Le lettere della mamma. Erano raccolte in una busta da spedire. Volevo anche fargli firmare il mandato per la casa, si: serve adesso, non tra un anno. E stato strano: ha detto «tu sai perche non posso firmare ancora». Io non ho capito.»',
        setsFlag: 'claire_envelope', note: 'Tra le lettere c\'era «anche una cosa in piu», secondo il messaggio in segreteria.' },
      { n: 4, q: 'Tu come lo descriveresti, ultimamente? Avevi notato qualcosa di diverso?',
        requires: 'flag:family_illness',
        lockedHint: 'nota l\'articolo esteso: rivedi il necrologio (DOC-02)',
        a: '«A volte si. Dimenticava gli orari, chiudeva le conversazioni a meta. L\'ultima volta che l\'ho sentito, fine settembre, mi ha chiesto se il garofano era il farmaco della zia. Era il farmaco della mamma, per tre anni. Daniel stava scegliendo che cosa ricordare. Non dirmi che e malato. Fermati qui.»',
        note: 'Claire sa, e non lo vuole sapere. Non e una bugiarda: si sta difendendo da un\'ipotesi.' }
    ],
    confronts: {
      'D07': { tone: 'scossa',
        text: '«La chiamata? Si. L\'ho chiamato io, il 16. Era roba delle lettere. Perche non me lo ricordo? Non lo so. Ricordo di aver parlato con lui, ricordo la voce. Mi sara sembrato una settimana fa, con la farmacia e tutto il resto. Aspetta: che mi stai dicendo? Che io ho mentito?»',
        flags: ['claire_phone'],
        note: 'Claire ha chiamato Daniel il 16/10 alle 21:15 per 11 minuti. Non lo ricordava. Un buco di due giorni in una memoria perfetta.' },
      'R04': { tone: 'scossa',
        text: '«La segreteria, la ascoltavo ancora. «Non e niente», dice. Lui non parla cosi. Quando e qualcosa di vero, Daniel dice «non mi chiedere niente». E cambiato, si. Due mesi, forse tre. Avevo pensato a un\'altra donna. Credevo ancora di potergli chiedere.»',
        note: 'Il messaggio esiste dal 16/10. Claire lo conosceva e non l\'ha citato. Non una bugia: l\'ha archiviato.' },
      'D05': { tone: 'svolta',
        text: '«Marsiglia? Daniel non... aspetta. La clinica: c\'era un cartoncino nelle lettere della mamma, io pensavo fosse un invito di un collega. Fammi controllare. Dio. Daniele. C\'e scritto «21 ottobre, ore 08:30». E questa settimana. Hai capito? Questa settimana.»',
        unlocks: ['D09'], flags: ['clinic_found'],
        note: 'La busta con le lettere della madre conteneva anche la tessera della clinica di Marsiglia.' },
      'D03': { tone: 'svolta',
        text: '«Dr. Renard? Conosco il cognome. E un neurologo. Le uniche volte che ho sentito quel nome erano le ricevute della mamma. Daniel si e fatto vedere da un neurologo, e non me l\'ha detto. Mica «non l\'ha sottolineato»: non ne ha detto niente. Due anni, se questo e il cronometro.»',
        flags: ['claire_renard'],
        note: 'Il nome Renard appartiene alla malattia della madre. Per Claire e un ricordo che spegne le luci.' },
      'P05': { tone: 'svolta',
        text: '«Questa sono io. Il cappotto grigio-verde e il mio. Ero li alle 22:20, mi correggo: alle 22:12. Il registro dice 22:12? Allora ha ragione il registro, e io no. Ho pensato di essere uscita subito, e non e vero: sono rimasta quindici minuti. Non so perche mi sia rimasto in mente di tagliare corto. La fretta e comoda.»',
        flags: ['claire_arrival'],
        note: 'Claire corregge il proprio ricordo: entrata 22:12, uscita 22:26.' },
      'R01': { tone: 'svolta',
        text: '««Se lo senti, Claire, spegnilo». L\'ha fatto apposta. Diceva «come mamma ha preso papa». Papa se n\'e andato per primo, e la mamma ha smesso di mangiare. Quando la malattia della mamma e cominciata, Daniel aveva ventotto anni. Io non ho voluto sapere. Lui ha voluto, per me.»',
        flags: ['claire_understands'],
        note: 'Claire capisce. Non tutti i ricordi falsi nascono dalla cattiveria.' },
      'D09': { tone: 'scossa',
        text: '«La tessera della clinica. C\'era anche quel «portare le bobine e il diario». Le bobine: il dictafono. Il diario: il taccuino che non ha portato. Daniel ha lasciato tutte le cose che contavano, tranne quelle che spiegano perche sta andando via. Non e fuggito da noi: ci ha lasciati indietro, con gentilezza.»' }
    },
    default: { tone: 'evasiva',
      text: '«La guardi di nuovo, la fotografi di nuovo: la mia versione non cambia. Non so niente, non l\'ho visto, non mi ha chiamato.»' }
  },
  thomas: {
    id: 'thomas', name: 'Thomas Keller', age: 35, role: 'Amico',
    relation: 'Miglior amico dai tempi del liceo', trust: 'slittante',
    portrait: 'TK', accent: '#7f9d7c',
    desc: 'Impresa di pavimenti con il fratello. Veloce e simpatico. Ha prestato 12.000 euro a Daniel nel febbraio 2024; il debito non e mai cominciato a calare. Il matrimonio e fissato in primavera.',
    profile:
      '<p><strong>Lavoro:</strong> societa di pavimenti, soci: lui e il fratello.</p>' +
      '<p><strong>Rapporto con Daniel:</strong> una birra ogni giovedi, dal 2004. Chiamano l\'appuntamento «il giovedi».</p>' +
      '<p><strong>Finanze:</strong> i 12.000 euro prestati a Daniel erano il fondo del matrimonio di Thomas.</p>' +
      '<p><strong>La sera del 17/10:</strong> dichiara un incontro alle 19:00 e un passaggio al bar Le Steam come cliente.</p>',
    statement: { title: 'Dichiarazione scritta', date: '19/10/2024, ore 14:10', text:
      '<p>«Thomas Keller, amico di Daniel. L\'ho visto martedi sera verso le sette, da lui. Abbiamo bevuto una birra, sono uscito verso le 19:45. Tutto normale. Daniel stava bene. Nessun viaggio in programma, mi avrebbe detto. Volevamo fare un giro insieme a fine mese.</p>' +
      '<p>La strada? Piovigginosa, mi sembra. E ho incrociato Claire sotto casa, verso le 22:40: ho rientrato tardi, mi sono fermato al Steam. Fumava davanti al portone, col cappotto grigio-verde. Non le ho detto niente, ero di fretta.»</p>' },
    topics: [
      { n: 1, q: 'A che ora sei stato da Daniel l\'ultima volta? Che cosa avete fatto?',
        a: '«Martedi, come ho scritto. Le sette, le sette e un quarto. Una birra sul pianerottolo, se non mi ricordo male. Poi ho dovuto andare dal fratello e ho lasciato. Tranquilli: niente di speciale.»',
        setsFlag: 'thomas_time_claim', note: 'Thomas fissa l\'incontro «alle sette, martedi». Le fonti dell\'edificio raccontano un\'altra serata.' },
      { n: 2, q: 'Tu e Daniel, i debiti? Voi siete amici, ma i soldi...',
        a: '«Ah. Si. Gli ho prestato dodicimila euro quando ha chiuso il laboratorio. Lo so cosa pensa: e il motivo numero uno per ammazzare un amico. Ma non me lo vedo. Daniel non l\'ho mai vista arrabbiarsi davvero. Negli ultimi mesi era solo... assente.»',
        note: 'Thomas ammette il debito e poi lo mette tra parentesi. Una seconda voce, nella registrazione citofonica, fa la tua stessa domanda.' },
      { n: 3, q: 'Daniel aveva in programma un viaggio? Qualsiasi cosa, anche piccola.',
        a: '«Nessun viaggio. Mi avrebbe detto: mi diceva tutto, da vent\'anni. A fine mese dovevamo andare a Strasburgo a vedere un restauro, glielo avevo promesso io. Questi giorni, no.»',
        setsFlag: 'thomas_notrip', note: 'Il biglietto a nome MORAN dice l\'opposto. Chi hai davanti: un bugiardo, o un amico che non sapeva?' }
    ],
    confronts: {
      'D10': { tone: 'difensiva',
        text: '«Il bonifico lo conosco. Sono gli euro del fondo matrimonio, e mia moglie lo sa. Risparmia il tono da interrogatorio. La verita sul debito e questa: Daniel si vergognava, e ultimamente io avevo cominciato a farmene una ragione mentale: se non mi ripaga, pazienza. Solo che con Daniel le ragioni vanno male: le cose vaghe le lascia vaghe apposta.»' },
      'R05': { tone: 'scossa',
        text: '«Dove e captata questa? Nell\'edificio? Si. Sono stato li, ma non alle sette. Sono arrivato alle 21:48, col portellone del furgone che faceva quel rumore. Abbiamo litigato, sui soldi. Mi ha spinto: piano, con una mano, ma mi ha spinto. E il bottone del cappotto e rimasto li. Sono uscito sbattendo la porta alle 22:04; la porta di Daniel si chiudeva dietro di me. Da li in poi non l\'ho piu visto. L\'ultima volta che ho visto il mio migliore amico gli ho detto quello che gli ho detto.»',
        flags: ['thomas_recants'],
        note: 'Thomas riscrive il proprio ricordo quando la prova lo obbliga: 21:48 - 22:04, lite, spinta.' },
      'R03': { tone: 'svolta',
        text: '«La pioggia. Aspetta: hai detto che non ha piovuto martedi sera. Il portone, il cappotto grigio-verde, gli agenti... era la mattina dopo. Me lo sto vedendo chiaro, adesso: lei davanti al portone, le due radio, la pioggia leggera. Ma io ero li. Ci sono stato. Ho sentito l\'odore della pioggia. Che significa? Che io sono pazzo?»',
        flags: ['thomas_confused'],
        note: 'Il «22:40» di Thomas e la mattina del 18, ore 09:40. Per lui le due notti hanno lo stesso volto.' },
      'P06': { tone: 'svolta',
        text: '«Nessuno fuori alle 22:40. Ma io l\'ho vista, tuttavia. Il cappotto, i capelli. Era lei la mattina dopo. Non l\'ho nemmeno vista martedi sera: l\'ho ricordata.»' },
      'P07': { tone: 'svolta',
        text: '«Martedi, 22:28. Quello col borsone e Daniel. Va via? Col borsone da palestra che gli ho regalato io per i trent\'anni? Perche mi ha detto che nessun viaggio? Perche mentiva a me? Perche i miei dodicimila. Oh. Oh no.»' },
      'O05': { tone: 'svolta',
        text: '«Il bottone e mio. Ho controllato il cappotto stamattina: al lato sinistro manca un bottone, tra il secondo e il terzo. Conti anche questo?»' }
    },
    default: { tone: 'evasiva',
      text: '«Martedi sera, alle sette, tutto normale. E l\'unica serata che ho da dirti.»' }
  },

  victor: {
    id: 'victor', name: 'Victor Hale', age: 61, role: 'Inserviente di notte',
    relation: 'Inserviente dell\'edificio dal 2011', trust: 'instabile',
    portrait: 'VH', accent: '#a48fb4',
    desc: 'Tredici anni di registro al Le Sablon. Una nota servizi all\'attivo, lontana, per una porta lasciata aperta. Parla lentamente e con precisione, tutto attorno ai suoi orari. Ha una paura nera del licenziamento.',
    profile:
      '<p><strong>Lavoro:</strong> turno di notte 19:00-07:00, lodge al pianterreno.</p>' +
      '<p><strong>Note servizi:</strong> 04/2019 - portone lasciato aperto per 40 minuti. Nessuna conseguenza.</p>' +
      '<p><strong>La sera del 17/10:</strong> in servizio. Registro compilato fino alle 20:10; poi inchiostro sbavato e parole interrotte.</p>' +
      '<p><strong>Salute:</strong> apnee notturne: si addormenta sul sedile della lodge. Lo sanno tutti i residenti, e per questo nessuno lo segnala.</p>',
    statement: { title: 'Dichiarazione scritta', date: '18/10/2024, ore 11:30', text:
      '<p>«Tutto regolare la sera del giorno 17. Ingressi: la signorina Laurent alle 20:05, la signora Moreau alle 22:12. Il signor Daniel, come sempre, dentro o fuori secondo i suoi affari. Uscite: non le appunto, non sono tenuto. Venerdi mattina, alle 06:50, ho trovato un orologio sul pianerottolo di piano tre e l\'ho messo in dogana. Nessuna anomalia.»</p>' },
    topics: [
      { n: 1, q: 'Ci dia dettagli sulle ronde. C\'e mai una ronda che parte dall\'ingresso?',
        a: '«Una ronda ogni due ore. Giovedi 17 ho girato poco, serio: mia moglie era sotto, con la doccia rotta. No, il contrario: era sopra. Lasciamo il grosso al registro. Il registro e la mia garanzia davanti a voi.»',
        note: 'Victor riporta tutto a ronde, registro, garanzia. Sta gia difendendo una posizione.' },
      { n: 2, q: 'Ci dia dettagli sulle telecamere. Che cosa riprendono, e quante sono?',
        a: '«Ne abbiamo due: una sopra il portone, la A; una nel cortile, la B. La B e coperta dallo striscione del cantiere da un pezzo: vengano a ritirarla la settimana del 21. Il verbale dell\'installatrice ce l\'ho, non lo perdo mai. E il mio scudo.»',
        unlocks: ['D11'], note: 'Il verbale di manutenzione (DOC-11) e disponibile nel lodge. Chiedine l\'originale.' },
      { n: 3, q: 'Tu come stai con le disposizioni? Cosa devi dimostrare in questo caso?',
        a: '«Certamente. Come sempre. All\'uscita, in camera, come chi... Noi con l\'inserviente siamo in fretta. Al lodge la poliz... la signora, scusi. A volte i toni divengono uncini. E il registro e l\'unica cosa che conta per la azienda.»',
        setsFlag: 'victor_fear', note: 'Tra le frasi di Victor comincia a filtrare un\'ansia precisa: la polizia del registro. Qual e la sua paura esatta?' }
    ],
    confronts: {
      'D01': { tone: 'difensiva',
        text: '«La colonna delle uscite. La conosco. Alle 20:10 facevo le ore. Poi mi sono seduto al sedile, alle 21:15: me lo ricordo, perche era il tipo di ora in cui l\'anno scorso... (si raddrizza). Nessuno e uscito senza che io... Aspetta. Alle 06:50 di venerdi mattina ho trovato due cose: l\'orologio, rotto, e un bottone. Li ho tenuti in dogana, non li ho denunciati. Lo so cosa sembra. Se la direzione vede questo registro, sono finito. Due volte. Senza appello.»',
        unlocks: ['O02', 'O05'], flags: ['victor_gap'],
        note: 'Victor dorme circa tra le 21:15 e le 22:30. Il registro e completamente bianco in quella finestra.' },
      'R05': { tone: 'scossa',
        text: '«La lite. La sento ancora. Ho avvicinato le orecchie quando e cominciata, verso le 21:50: «dodici mila, Daniel». Ho dei debiti anch\'io, un inserviente: quelle voci le sogni. Poi il tonfo. Poi il signor Daniel che passa davanti alla lodge alle 22:28, col borsone. Mi ha salutato: «Se qualcuno chiede, di che sono andato a pescare». Poi e uscito. Io sono andato a completare il registro e... mi sono messo a dormire.»',
        flags: ['victor_fishing'],
        note: 'Victor ha visto Daniel uscire, vivo, alle 22:28. E ha una frase esatta da riportare. (FOT-07)' },
      'O02': { tone: 'svolta',
        text: '«L\'orologio l\'ho messo in una scatola da scarpe, nel lodge: la merce va messa da parte, sono le regole. Ho aspettato un giorno, forse due. Poi e arrivata la polizia.»' },
      'P05': { tone: 'svolta',
        text: '«La signora Moreau alle 22:12, si. Il cappotto grigio-verde l\'ho riconosciuto io, quando l\'hanno mostrato. Ma lei dice di essere uscita subito, e non e vero: nel buffer dell\'interfono viene fuori anche quando e uscita. L\'interfono non perde; e l\'unica cosa fatta per i residenti.»',
        flags: ['claire_arrival'] },
      'P07': { tone: 'svolta',
        text: '«Questo fotogramma e quello che sta giu. Il borsone, la cartella. Se l\'ho visto, non lo chiedere: l\'ho visto. Uscendo. Da solo. Sempre. Lo so cosa sembrava, quando lascio bianca la colonna delle uscite. All\'uscita, in camera, lo sapevo.»' },
      'D11': { tone: 'svolta',
        text: '«Il verbale? I sette minuti? Ecco perche nessuno si concorda sugli orari: la camera A segna 22:35 anche quando sono le 22:28. Chi viene incrocia l\'orario; poi raddrizza la propria memoria. L\'interfono mai.»' }
    },
    default: { tone: 'evasiva',
      text: '«Il registro e come l\'ho ricostruito a memoria. Perche si chiede la mia parte, e questa e la mia parte: nessuna anomalia.»' }
  },
  elise: {
    id: 'elise', name: 'Elise Laurent', age: 31, role: 'Ex partner',
    relation: 'Convivente 2019-2022, separate nel febbraio 2024', trust: 'affidabile',
    portrait: 'EL', accent: '#c2983f',
    desc: 'Grafica. Parla piano, con misure precise. La rottura con Daniel e stata reciproca e pulita: lui si e chiuso in un silenzio che lei chiamava «la distanza». Si parlano ancora, con la stima di chi ha smesso di ferirsi.',
    profile:
      '<p><strong>Lavoro:</strong> studio di grafica, libera professionista.</p>' +
      '<p><strong>Rapporto con Daniel:</strong> cinque anni insieme, poi due di amicizia. Non litigano dal 2023.</p>' +
      '<p><strong>La famiglia Moreau:</strong> accompagno Adele alle visite nel 2018.</p>' +
      '<p><strong>La sera del 17/10:</strong> in visita da Daniel, 19:58 - 20:35 (citofono 20:05: ha citofonato due volte, opening lenta).</p>',
    statement: { title: 'Dichiarazione scritta', date: '19/10/2024, ore 16:00', text:
      '<p>«Sono Elise Laurent. Il 17 ottobre ho visto Daniel: mi ha ricevuto verso le 19:58 e sono uscita verso le 20:35. Abbiamo parlato con calma. E stato lui a chiedermi di arrivare, quella sera, perche aveva una cosa da farmi vedere. Mi ha dato una scatola con delle nostre vecchie fotografie. Mi ha detto: «Tienile tu, adesso servono a te». L\'ho trovato strano. Poi sono uscita. Non ho altro da aggiungere.»</p>' },
    topics: [
      { n: 1, q: 'Che cosa significava la scatola di fotografie? Che cosa aveva da farti vedere?',
        a: '«Una premessa. Le foto dell\'estate in Provenza, quelle con Adele. Ma in piu c\'era una fotocopia di una pagina del suo taccuino: la lista del debito, senza nomi. E in fondo, un inizio di lettera firmato «D.», senza contenuto. Gli ho chiesto che cosa stava preparando. Ha riso: «Ti spiego quando torno». Torno, non «se torno». Come se stesse gia tornando. Sul davanzale vicino alla porta c\'era il borsone da palestra, pieno e gia chiuso. Se lo aspettava da giorni.»',
        setsFlag: 'bag_packed', note: 'Il borsone su cui tutti interrogano l\'appartamento era gia pronto alle 20:35.' },
      { n: 2, q: 'Vi siete dati appuntamento per rivedervi? Voi avevate un accordo?',
        a: '«Si. Il lunedi. Non un accordo: una promessa mia. Lui ha riso e ha detto «vedremo, Elise, vedremo». Nei giorni dopo l\'ho ricostruita in mente come se fosse stato un accordo, un appuntamento mancato. Non lo era. Ma quando lo si cerca tutti i giorni, la promessa diventa un ricordo. Lo sto ammettendo qui, adesso, per la prima volta.»',
        setsFlag: 'elise_monday', note: 'Il «lunedi» di Elise e una proiezione — ma utile: lunedi e il 21. Il calendario di Daniel dice «21 - M. 8:30».' },
      { n: 3, q: 'Tu conoscevi la mamma. Che cosa ti ricordi della malattia di Adele?',
        a: '«Accompagnavo Adele alle visite nel 2018, quando Claire non voleva entrare in stanza. Adele dimenticava, e si accorgeva di dimenticare. Diceva: «Il tempo non passa, scorre; io lo perdo». Il modo di lei era calmo. Daniel l\'ha imparata, quella stessa calma, l\'ultima sera. L\'ho riconosciuta. Non l\'ho detto ai poliziotti perche non sapevo ancora che cosa fosse.»',
        setsFlag: 'family_history', note: 'La calma di Daniel era la calma della madre: la calma di chi si sta per dire addio.' }
    ],
    confronts: {
      'D03': { tone: 'svolta',
        text: '«Dr. Renard e un neurologo. So il cognome perche nel 2018 Adele era sulla sua lista di attesa. Se Daniel e andato da lui, non e per le vertigini, come mi aveva detto in estate. E per la stessa cosa. Oh, Daniel.»',
        flags: ['elise_renard'] },
      'P07': { tone: 'svolta',
        text: '«Il borsone. Quello l\'ho visto con i miei occhi, alle 20:35, davanti alla porta: gia pronto e chiuso. Se andava via, e ora vedo che andava via, era gia dentro il suo piano da ore. Sono giorni che penso: se quel giorno resto un\'ora di piu, che cosa succede? Niente. Niente accadeva. E questo che non riesco a dire alla sua sorella.»' },
      'R01': { tone: 'svolta',
        text: '«La frase: «Lunedi prossimo non saro piu lo stesso, in un certo senso». La conosco. Adele la usava uguale, nel 2018, una settimana prima della visita in cui le hanno detto il nome della malattia: «Il lunedi non saro piu la stessa, in un certo senso. E va bene cosi». Daniel sta ripetendo le parole di sua madre.»',
        flags: ['elise_phrase'], note: 'Il «lunedi» compare in tre posti: calendario, promessa di Elise, dictafono. Tre posti, un solo evento.' },
      'D05': { tone: 'svolta',
        text: '«Marsiglia, 06:12. Al bar sotto l\'ospedale c\'era un manifesti delle fermate verso Marsiglia. Daniel l\'ha guardato a lungo: io pensavo a un\'associazione. Adesso capisco che stava memorizzando la direzione della fuga. Quattro ore di treno, per arrivare a Marsiglia, portare le sue bobine e chiedere aiuto in una sala d\'attesa di un\'altra citta.»' },
      'R04': { tone: 'svolta',
        text: '««Non e niente». L\'ha detto anche in estate: «Renard? E il controllo annuale». Anche Claire l\'ha sentito. Noi due abbiamo deciso di crederci, entrambe, per comodita. Adesso lo ripensisca senza male: la comodita e un tipo di ricordo falso anche lei.»' }
    },
    default: { tone: 'onestà',
      text: '«La guardo, la fotografo. Non so niente di piu di quanto ho gia detto. E per una volta non e una scusa: sapevo poco anche lui.»' }
  }
};

/* ------------------------- CAPITOLI ------------------------- */
window.FM_CHAPTERS = [
  { n: 1, title: 'La sparizione', subtitle: '17 ottobre 2024',
    text: 'Daniel Moreau e scomparso. Quattro persone sapevano dove fosse, quella sera. Ognuna ha una versione diversa. Inizia con il fascicolo: niente e affidabile per principio.' },
  { n: 2, title: 'Contraddizioni', subtitle: '',
    text: 'Una delle versioni comincia a non reggere. Altri dettagli escono solo se vuoi vederli: esamina le prove, fai le domande scomode, presenta i documenti.' },
  { n: 3, title: 'La memoria sbagliata', subtitle: '',
    text: 'Fotografie, orari, registrazioni: tutto sembra concordare con nessuna delle versioni, nemmeno la tua. Non fidarti dell\'ordine in cui hai imparato le cose.' },
  { n: 4, title: 'Ricostruzione', subtitle: '',
    text: 'Due fili che sembravano separati hanno cominciato a intrecciarsi. Alcune prove che sembravano decisive stanno smettendo di esserlo.' },
  { n: 5, title: 'La verita', subtitle: 'consegna la tua ricostruzione',
    text: 'Una versione degli eventi sta tenendo in piedi tutte le altre. Confrontala con la tua: che cosa e successo davvero, e che cosa hai deciso di credere.' }
];

/* --------------------- DOMANDE FINALI --------------------- */
window.FM_QUESTIONS = [
  { id: 'whatHappened', q: 'Che cosa e successo a Daniel Moreau, la serata del 17 ottobre?',
    essential: true,
    options: [
      { key: 'voluntary', label: 'E uscito da solo, spontaneamente, verso la stazione' },
      { key: 'violence',  label: 'E stato aggredito e violentato nell\'edificio' },
      { key: 'accident',  label: 'Ha avuto un malore ed e morto nell\'edificio' },
      { key: 'coerced',   label: 'E stato portato via con la forza da qualcuno' },
      { key: 'stayed',    label: 'E ancora dentro l\'edificio, nascosto o ferito' }
    ] },
  { id: 'lastInside', q: 'Chi e stata l\'ultima persona a vederlo all\'interno dell\'edificio?',
    essential: true,
    options: [
      { key: 'claire', label: 'Claire Moreau, la sorella' },
      { key: 'thomas', label: 'Thomas Keller, l\'amico' },
      { key: 'elise',  label: 'Elise Laurent, l\'ex partner' },
      { key: 'victor', label: 'Victor Hale, l\'inserviente di notte' },
      { key: 'none',   label: 'Non si puo stabilire con le prove disponibili' }
    ] },
  { id: 'whyLeft', q: 'Perche Daniel ha lasciato Saint-Aurel?',
    essential: true,
    options: [
      { key: 'illness', label: 'Per una malattia: doveva affrontarla da solo, lontano dai suoi' },
      { key: 'debt',    label: 'Per i debiti: doveva racimolare i 12.000 euro' },
      { key: 'unknown', label: 'Non si puo stabilire con le prove disponibili' }
    ] },
  { id: 'watch', q: 'Che cosa prova l\'orologio rotto, fermo sulle 21:47?',
    essential: false,
    options: [
      { key: 'struggle',       label: 'Che alle 21:47 c\'e stata una lotta' },
      { key: 'stopped_before', label: 'Non prova nulla di quella sera: era gia fermo da due giorni' },
      { key: 'unknown',        label: 'Non si puo stabilire con le prove disponibili' }
    ] },
  { id: 'liars', q: 'Chi, tra le persone interrogate, ha mentito deliberatamente?',
    multi: true, essential: false,
    options: [
      { key: 'claire', label: 'Claire Moreau' },
      { key: 'thomas', label: 'Thomas Keller' },
      { key: 'elise',  label: 'Elise Laurent' },
      { key: 'victor', label: 'Victor Hale' }
    ] },
  { id: 'falseMemory', q: 'Chi, tra le persone interrogate, aveva ricordi falsi o distorti in buona fede?',
    multi: true, essential: false,
    options: [
      { key: 'claire', label: 'Claire Moreau' },
      { key: 'thomas', label: 'Thomas Keller' },
      { key: 'elise',  label: 'Elise Laurent' },
      { key: 'victor', label: 'Victor Hale' },
      { key: 'daniel', label: 'Daniel stesso, nelle sue note e nei suoi appunti' }
    ] }
];

/* ------------------------- FINALI ------------------------- */
window.FM_ENDINGS = {
  correct: { label: 'LA RICOSTRUZIONE CORRETTA', tone: 'good',
    text: 'Una ricostruzione puntuale. Ogni contraddizione e stata spiegata con una prova, e ogni prova ha la sua posta nel quadro.' },
  plausible: { label: 'LA TEORIA PLAUSIBILE', tone: 'ok',
    text: 'La comprensione del caso e sostanzialmente corretta, con un punto cieco in un elemento importante.' },
  wrong: { label: 'L\'ACCUSA SBAGLIATA', tone: 'bad',
    text: 'Una persona e stata accusata a torto. Le prove, rileggite, non reggevano; ma le apparenze erano forti.' },
  incomplete: { label: 'IL CASO INCOMPLETO', tone: 'meh',
    text: 'La ricostruzione e rimasta senza fondamenta: poche prove alle spalle, o risposte lasciate a vuoto.' },
  unresolved: { label: 'LA VERITA IRRISOLTA', tone: 'meh',
    text: 'Molte contraddizioni scoperte, e nessuna ricostruzione capace di tenerle insieme in un quadro.' }
};

})();
