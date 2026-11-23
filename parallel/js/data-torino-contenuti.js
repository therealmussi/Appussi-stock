/* PARALLEL — scenario TORINO 1962: catalogo progetti, decisioni storiche, eventi dinamici */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});
  const H = () => PAR.helpersTorino;

  PAR.TORINO_PROGETTI = [
    // ————— TRASPORTI —————
    { id: 'tram-up', nome: 'Rinnovamento della rete tranviaria', cat: 'trasporti', costo: 26, durata: 3, mantenimento: 1.2, cofin: 0.4, ripetibile: 2,
      corridoio: ['sansalvario', 'nizza', 'mirafiori', 'campagna', 'barriera'],
      effettoDesc: '+18 km di tranvia rinnovata, qualità del trasporto pubblico in aumento, tempi di percorrenza più stabili.',
      onComplete(S, pro) { PAR.helpersTorino.A(S).tramKm += 18; PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.06); bump(S, pro.corridoio, 0.035); } },
    { id: 'tram-est', nome: 'Nuove linee tranviarie verso le periferie', cat: 'trasporti', costo: 42, durata: 3, mantenimento: 1.6, cofin: 0.4, ripetibile: 2, req: 'tram-up',
      corridoio: ['vanchiglia', 'regioparco', 'vallette', 'falchera'],
      effettoDesc: '+14 km di tranvia verso nord ed est, accessibilità periferica in aumento.',
      onComplete(S, pro) { PAR.helpersTorino.A(S).tramKm += 14; PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.05); PAR.helpersTorino.A(S).capacitaPubblico += 45000; bump(S, pro.corridoio, 0.045); } },
    { id: 'metro-m1', nome: 'Metropolitana Linea 1 (Vallette–Centro–Lingotto)', cat: 'trasporti', costo: 430, durata: 7, mantenimento: 9.5, cofin: 0.6,
      corridoio: ['vallette', 'cenisia', 'centro', 'sansalvario', 'nizza'],
      effettoDesc: '12,5 km di metropolitana: +300.000 passeggeri/giorno di capacità e un salto duraturo di accessibilità. Riorganizza lo sviluppo urbano lungo la linea.',
      onComplete(S) { PAR.helpersTorino.A(S).metroKm += 12.5; PAR.helpersTorino.A(S).capacitaPubblico += 300000; PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.14); bump(S, ['vallette', 'cenisia', 'centro', 'sansalvario', 'nizza'], 0.07); PAR.Engine.mod(S, { id: 'corridoio-metro', accessibilita: 0.03, densificaCorridoio: 0.5 }); PAR.helpersTorino.ipotesi(S, 'Una metropolitana torinese costruita negli anni ’60–’70: nella storia reale non sarà aperta prima del 2011.'); } },
    { id: 'metro-m2', nome: 'Metropolitana Linea 2 (Mirafiori–Vanchiglia–Barriera)', cat: 'trasporti', costo: 390, durata: 6, mantenimento: 9.0, cofin: 0.55, req: 'metro-m1',
      corridoio: ['mirafiori', 'crocetta', 'vanchiglia', 'regioparco', 'barriera'],
      effettoDesc: '11 km di seconda linea tangenziale: collega i grandi quartieri operai senza passare per il centro.',
      onComplete(S) { PAR.helpersTorino.A(S).metroKm += 11; PAR.helpersTorino.A(S).capacitaPubblico += 260000; PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.10); bump(S, ['mirafiori', 'crocetta', 'vanchiglia', 'regioparco', 'barriera'], 0.07); PAR.helpersTorino.ipotesi(S, 'La linea 2 è un progetto puramente ipotetico, mai realizzato in nessuna forma.'); } },
    { id: 'rail-sub', nome: 'Ferrovia suburbana e passante ferroviario', cat: 'trasporti', costo: 185, durata: 6, mantenimento: 7.0, cofin: 0.65,
      corridoio: ['campagna', 'regioparco', 'centro', 'nizza', 'mirafiori'],
      effettoDesc: '27 km di rete suburbana con nuove stazioni: collega la città ai comuni dell’area metropolitana.',
      onComplete(S) { PAR.helpersTorino.A(S).railKm += 27; PAR.helpersTorino.A(S).capacitaPubblico += 220000; PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.08); bump(S, ['campagna', 'regioparco', 'centro', 'nizza', 'mirafiori'], 0.05); S.systems.demografia.integrazioneMetro = Math.min(1, (S.systems.demografia.integrazioneMetro || 0) + 0.4); PAR.helpersTorino.ipotesi(S, 'Una rete ferroviaria suburbana organizzata del genere arriverà nella storia reale solo dopo il 2000.'); } },
    { id: 'rail-stazioni', nome: 'Nuove stazioni e grandi interscambi', cat: 'trasporti', costo: 48, durata: 3, mantenimento: 1.8, cofin: 0.5, req: 'rail-sub',
      corridoio: ['barriera', 'falchera', 'cenisia'],
      effettoDesc: 'Intermodalità tra ferrovie e tranvie: accessi periferici più solidi.',
      onComplete(S, pro) { PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.04); PAR.helpersTorino.A(S).capacitaPubblico += 60000; bump(S, pro.corridoio, 0.04); } },
    { id: 'brt', nome: 'Corridoi filoviari e corsie riservate', cat: 'trasporti', costo: 40, durata: 2, mantenimento: 2.0, cofin: 0.3, ripetibile: 2,
      corridoio: ['crocetta', 'sanpaolo', 'vallette', 'collina'],
      effettoDesc: 'Corsie preferenziali e filoviari su più assi: capacità del trasporto pubblico +40.000 posti/giorno.',
      onComplete(S, pro) { PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.03); PAR.helpersTorino.A(S).capacitaPubblico += 40000; bump(S, pro.corridoio, 0.025); } },
    { id: 'road-sud', nome: 'Cintura autostradale Sud', cat: 'trasporti', costo: 125, durata: 4, mantenimento: 3.2, cofin: 0.7,
      corridoio: ['nizza', 'mirafiori', 'collina'],
      effettoDesc: 'Nuova tangenziale a sud: indice strade +0.18, congestione in calo immediato. Nel lungo periodo spinge all’espandersi della città.',
      onComplete(S) { PAR.helpersTorino.A(S).indiceStrade += 0.18; PAR.Engine.mod(S, { id: 'autorizzazione-auto', autoFattore: 1.18, espansionePeriurbana: 0.5 }); PAR.helpersTorino.ipotesi(S, 'Una cintura autostradale a sud, spinta verso il fiume: schema anticipato rispetto alla realtà.'); } },
    { id: 'road-nord', nome: 'Completamento della cintura Nord', cat: 'trasporti', costo: 90, durata: 3, mantenimento: 2.4, cofin: 0.65,
      corridoio: ['vallette', 'falchera', 'barriera'],
      effettoDesc: 'Indice strade +0.13 e forte appeal logistico-industriale verso nord.',
      onComplete(S) { PAR.helpersTorino.A(S).indiceStrade += 0.13; PAR.Engine.mod(S, { id: 'cintura-nord', autoFattore: 1.10, espansionePeriurbana: 0.3 }); } },
    { id: 'ped-central', nome: 'Zona pedonale del centro storico', cat: 'trasporti', costo: 10, durata: 1, mantenimento: 0.4, cofin: 0,
      corridoio: ['centro'],
      effettoDesc: 'Meno traffico nel centro, maggiore qualità urbana: commercianti contrariati, residenti entusiasti.',
      onComplete(S) { bump(S, ['centro'], 0.02); H().stakeholder(S, 'commercianti', -8); H().stakeholder(S, 'residenti', 6); S.systems.sociale.qol += 0.8; PAR.helpersTorino.A(S).congestione = Math.max(0, PAR.helpersTorino.A(S).congestione - 0.03); } },
    { id: 'bike-net', nome: 'Rete ciclabile urbana', cat: 'trasporti', costo: 14, durata: 2, mantenimento: 0.4, cofin: 0.2,
      corridoio: ['centro', 'vanchiglia', 'crocetta', 'sansalvario'],
      effettoDesc: 'La mobilità attiva cresce anno dopo anno.',
      onComplete() { PAR.Engine.mod(S感染的, {}) }, noOpExcept: true },
    { id: 'park-ride', nome: 'Parcheggi di scambio alle porte della città', cat: 'trasporti', costo: 22, durata: 2, mantenimento: 1.0, cofin: 0.25,
      corridoio: ['falchera', 'cenisia', 'mirafiori'],
      effettoDesc: 'Chi vive fuori può raggiungere il trasporto pubblico: qualità tpubb +0.02.',
      onComplete() { PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.02); } },

    // ————— URBANISTICA —————
    { id: 'edt-falchera2', nome: 'Secondo programma di edilizia popolare alla Falchera', cat: 'urbanistica', costo: 58, durata: 4, mantenimento: 1.0, cofin: 0.4, ripetibile: 1,
      corridoio: ['falchera'],
      effettoDesc: '+8.000 alloggi a norma e a canone contenuto nella periferia nord.',
      onComplete(S) { PAR.helpersTorino.alloggi(S, 'falchera', 8000); } },
    { id: 'edt-vallette', nome: 'EDT: grande quartiere delle Vallette', cat: 'urbanistica', costo: 90, durata: 5, mantenimento: 1.5, cofin: 0.45,
      corridoio: ['vallette'],
      effettoDesc: '+11.000 alloggi pubblici: sblocca l’emergenza abitativa, ma senza servizi diventa una città satellare fragile.',
      onComplete(S) { PAR.helpersTorino.alloggi(S, 'vallette', 11000); if (S.systems.sociale.servizi < 0.55) { PAR.Engine.mod(S, { id: 'vallette-fragile', qolPerAnno: -0.10, disuguaglianzaPerAnno: 0.25 }); PAR.Engine.timelineAdd(S, { year: S.year, kind: 'conseguenza', tag: 'SIMULATO', titolo: 'Vallette senza servizi', testo: 'Il quartiere nasce senza scuole, asili e trasporto adeguato: la simulazione tiene conto di questa carenza nel tempo.' }); } } },
    { id: 'edt-mirafiori', nome: 'Edilizia pubblica a Mirafiori Nord', cat: 'urbanistica', costo: 62, durata: 4, mantenimento: 1.1, cofin: 0.4,
      corridoio: ['mirafiori'],
      effettoDesc: '+7.500 alloggi vicini ai luoghi di lavoro industriale.',
      onComplete(S) { PAR.helpersTorino.alloggi(S, 'mirafiori', 7500); } },
    { id: 'densifica', nome: 'Programma di densificazione dei quartieri consolidati', cat: 'urbanistica', costo: 72, durata: 5, mantenimento: 0.8, cofin: 0.3, ripetibile: 2,
      corridoio: ['centro', 'crocetta', 'campagna', 'sansalvario'],
      effettoDesc: '+9.000 alloggi ad alta densità dove i servizi esistono già, con consumo di suolo quasi nullo.',
      onComplete(S) { PAR.helpersTorino.alloggi(S, 'mix-centrale', 9000); } },
    { id: 'riqualifica', nome: 'Riqualificazione dei quartieri popolari', cat: 'urbanistica', costo: 52, durata: 4, mantenimento: 1.0, cofin: 0.5, ripetibile: 2,
      corridoio: ['regioparco', 'barriera', 'vanchiglia'],
      effettoDesc: 'Miglioramento abitativo e sociale nei quartieri più fragili: disuguaglianze in calo.',
      onComplete() { PAR.Engine.mod(S感染的, { id: 'riqualifica', accessibilita: 0.015 }); H().stakeholder(S, 'residenti', 8); } },
    { id: 'servizi-quartiere', nome: 'Scuole, asili e centri di quartiere', cat: 'urbanistica', costo: 42, durata: 3, mantenimento: 2.2, cofin: 0.5, ripetibile: 4,
      corridoio: ['barriera', 'vallette', 'falchera', 'sansalvario', 'mirafiori'],
      effettoDesc: 'Servizi pubblici capillari: accessibilità dei servizi +0.06 e più lavoro femminile.',
      onComplete(S) { S.systems.sociale.servizi = Math.min(1, S.systems.sociale.servizi + 0.06); S.systems.economia.forzaLavoro = Math.min(0.44, S.systems.economia.forzaLavoro + 0.004); PAR.Engine.mod(S, { id: 'servizi-capillari', qolPerAnno: 0.06 }); } },

    // ————— ECONOMIA —————
    { id: 'ind-mod', nome: 'Accordi di programma per la modernizzazione industriale', cat: 'economia', costo: 98, durata: 5, mantenimento: 1.0, cofin: 0.5,
      corridoio: ['mirafiori', 'nizza', 'barriera'],
      effettoDesc: 'Processi produttivi più efficienti: l’occupazione industriale regge meglio nei decenni di crisi.',
      onComplete(S) { PAR.Engine.mod(S, { id: 'ind-modernizzazione', industriaTasso: 0.012, inquinamentoFattore: 0.94 }); S.systems.economia.produttivita *= 1.04; } },
    { id: 'diversifica', nome: 'Distretto tecnologico ed elettronico', cat: 'economia', costo: 78, durata: 6, mantenimento: 1.5, cofin: 0.5, minYear: 1968,
      corridoio: ['cenisia', 'sanpaolo'],
      effettoDesc: 'Ricerca e progettazione elettronica: diversificazione +0.16 progressiva, il declino industriale pesa meno.',
      onComplete(S) { PAR.Engine.mod(S, { id: 'distretto-elettronica', diversificazionePerAnno: 0.011, industriaTasso: 0.004 }); PAR.helpersTorino.ipotesi(S, 'Un distretto tecnologico urbano di scala: nella storia reale Torino lo avvierà solo negli anni 2000.'); } },
    { id: 'terziario', nome: 'Distretto terziario e fieristico al sud', cat: 'economia', costo: 125, durata: 6, mantenimento: 2.0, cofin: 0.4, minYear: 1975,
      corridoio: ['nizza'],
      effettoDesc: 'Grandi uffici, convegni e servizi alle imprese: un secondo motore dopo la grande industria.',
      onComplete(S) { PAR.Engine.mod(S, { id: 'terziario-sud', terziarioPerAnno: 0.008, accessibilita: 0.01 }); S.systems.economia.diversificazione = Math.min(1, S.systems.economia.diversificazione + 0.10); } },

    // ————— AMBIENTE —————
    { id: 'parco-po', nome: 'Parco fluviale del Po e cintura verde', cat: 'ambiente', costo: 36, durata: 4, mantenimento: 0.9, cofin: 0.4,
      corridoio: ['collina', 'vanchiglia', 'regioparco', 'falchera'],
      effettoDesc: '+520 ettari di verde protetto, difesa idraulica soffice, attrattività della città in aumento.',
      onComplete(S) { S.systems.ambiente.verdeHa += 520; PAR.Engine.mod(S, { id: 'parco-fluviale', verdeFattore: 0.85, espansionePeriurbana: -0.4, qolPerAnno: 0.07 }); PAR.helpersTorino.ipotesi(S, 'Una grande fascia verde fluviale: nella realtà parzialmente attuata negli anni ’80–’90.'); } },
    { id: 'cunei-verdi', nome: 'Cunei verdi tra i quartieri', cat: 'ambiente', costo: 26, durata: 3, mantenimento: 0.7, cofin: 0.3,
      corridoio: ['cenisia', 'sanpaolo', 'vallette'],
      effettoDesc: '+230 ettari di verde urbano, consumo di suolo frenato.',
      onComplete(S) { S.systems.ambiente.verdeHa += 230; PAR.Engine.mod(S, { id: 'cunei-verdi', espansionePeriurbana: -0.3 }); } },
    { id: 'teleriscaldamento', nome: 'Teleriscaldamento e cogenerazione urbana', cat: 'ambiente', costo: 58, durata: 5, mantenimento: 1.2, cofin: 0.5, minYear: 1970,
      corridoio: ['centro', 'crocetta', 'campagna'],
      effettoDesc: 'Consumo energetico e emissioni in calo progressivo, circa −4% a anno.',
      onComplete(S) { PAR.Engine.mod(S, { id: 'teleriscaldamento', energiaPerAnno: -0.008, inquinamentoFattore: 0.96 }); } }
  ];

  // nota: due progetti usano la chiusura di stato al completamento
  PAR.TORINO_PROGETTI.find(p => p.id === 'bike-net').onComplete = function (S) {
    PAR.helpersTorino.A(S).shareAttivo = Math.min(0.55, PAR.helpersTorino.A(S).shareAttivo + 0.03);
    PAR.Engine.mod(S, { id: 'ciclabile', shareAttivoPerAnno: 0.0012, qolPerAnno: 0.05 });
  };
  PAR.TORINO_PROGETTI.find(p => p.id === 'riqualifica').onComplete = function (S) {
    PAR.Engine.mod(S, { id: 'riqualifica', accessibilita: 0.015 });
    H().stakeholder(S, 'residenti', 8);
  };
  PAR.TORINO_PROGETTI.find(p => p.id === 'park-ride').onComplete = function (S) {
    PAR.helpersTorino.A(S).qualita = Math.min(1, PAR.helpersTorino.A(S).qualita + 0.02);
  };

  function bump(S, ids, delta) { PAR.helpersTorino.bumpAccess(S, ids, delta); }

  PAR.TORINO_DECISIONI = [
    {
      id: 'question-metropolitana', anno: 1962, titolo: 'La questione metropolitana',
      testo: 'Il traffico cresce più veloce della città che ha legato il proprio destino alla tranvia. Londra ha appena deciso una nuova metropolitana, Parigi disegna il Réseau Express. Torino deve scegliere una direzione per il prossimo mezzo secolo: la scelta fatta oggi peserà per decenni.',
      opzioni: [
        { label: 'A — Costruire una metropolitana', costo: 30, effettoDesc: 'Anticipa il progetto metropolitana (sconto −15% su metro-m1), forte sostegno degli utenti del trasporto pubblico.',
          apply(S) { S.flags.dottrina = 'metro'; S.flags.scontoMetro = 0.85; H().stakeholder(S, 'residenti', 6); H().stakeholder(S, 'industria', -3); PAR.Engine.timelineAdd(S, { year: 1962, kind: 'decisione', tag: 'IPOTESI', titolo: 'La città sceglie la metropolitana', testo: 'La direzione è densità e ferro sotterraneo.' }); } },
        { label: 'B — Modernizzare le tranvie', costo: 18, effettoDesc: 'Rete tranviaria rinnovata per 12 km subito, sconto −20% sui progetti tranviari.',
          apply(S) { S.flags.dottrina = 'tram'; S.flags.scontoTram = 0.8; const Tt = S.systems.trasporti; Tt.tramKm += 12; Tt.qualita = Math.min(1, Tt.qualita + 0.03); H().stakeholder(S, 'residenti', 4); PAR.Engine.timelineAdd(S, { year: 1962, kind: 'decisione', tag: 'IPOTESI', titolo: 'La città rinnova le tranvie', testo: 'Una scelta sorprendentemente lungimirante per il 1962: nella storia reale la rete tranviaria si assottiglierà.' }); } },
        { label: 'C — Darsi alle strade', costo: 22, effettoDesc: 'Indice strade +0.10, sconto −20% sulle cinture, industrialisti soddisfatti ma dipendenza dall’auto in aumento.',
          apply(S) { S.flags.dottrina = 'automobile'; S.flags.scontoStrade = 0.8; const Tt = S.systems.trasporti; Tt.indiceStrade += 0.10; PAR.Engine.mod(S, { id: 'dottrina-auto', autoFattore: 1.15, espansionePeriurbana: 0.4 }); H().stakeholder(S, 'industria', 8); H().stakeholder(S, 'commercianti', 6); PAR.Engine.timelineAdd(S, { year: 1962, kind: 'decisione', tag: 'IPOTESI', titolo: 'La città sceglie l’automobile', testo: '“Superare” il trasporto pubblico a favore delle auto: un paradigma che segnerà i decenni.' }); } },
        { label: 'D — Scommettere sulla ferrovia', costo: 20, effettoDesc: 'Sconto −15% sulla ferrovia suburbana, grande sostegno dei comuni dell’area metropolitana.',
          apply(S) { S.flags.dottrina = 'ferroviaria'; S.flags.scontoFerrovia = 0.85; H().stakeholder(S, 'governo', 8); PAR.Engine.timelineAdd(S, { year: 1962, kind: 'decisione', tag: 'IPOTESI', titolo: 'La città sceglie la ferrovia', testo: 'Una visione metropolitana centrata sui treni e sulle relazioni con i comuni.' }); } }
      ]
    },
    {
      id: 'alluvione-po', anno: 1966, titolo: 'L’alluvione del Po',
      testo: 'Il Po ha invaso le zone basse della città, come il Po in Piemonte farà nel novembre del 1966. Il fiume chiede alla città una risposta urbanistica.',
      opzioni: [
        { label: 'Argini e opere sistematiche di difesa', costo: 26, effettoDesc: 'Difese solide: il rischio futuro si riduce molto, ma la città resta rivolta al fiume di spalle.',
          apply(S) { S.flags.difesePo = 'argini'; PAR.Engine.mod(S, { id: 'difesePo', alluvioneFattore: 0.3 }); H().stakeholder(S, 'governo', 4); } },
        { label: 'Parco fluviale: il fiume come risorsa', costo: 20, effettoDesc: 'Difesa soffice col verde: sconto −30% sul parco fluviale e riduzione duratura del rischio.',
          apply(S) { S.flags.difesePo = 'parco'; S.flags.scontoParcoPo = 0.7; PAR.Engine.mod(S, { id: 'difesa-soffice', alluvioneFattore: 0.5, qolPerAnno: 0.03 }); H().stakeholder(S, 'ambientaliste', 12); } },
        { label: 'Non investire in difesa idraulica', costo: 0, effettoDesc: 'Nessun costo. Le alluvioni torneranno a ripetersi e toccheranno i quartieri più poveri.',
          apply(S) { S.flags.difesePo = 'nessuna'; H().stakeholder(S, 'residenti', -6); PAR.Engine.timelineAdd(S, { year: 1966, kind: 'decisione', tag: 'SIMULATO', titolo: 'Nessuna difesa idraulica', testo: 'La città lascia le sponde indifese: il rischio dorme sotto il sedimento del Po.' }); } }
      ]
    },
    {
      id: 'emergenza-abitativa', anno: 1968, titolo: 'L’emergenza abitativa',
      testo: 'Le persone arrivano più veloce delle case. In baracche e cantieri: la città deve decidere come rispondere, oggi, a un problema che durerà decenni.',
      condizione: (S) => S.systems.sociale.abitazioniAdeguate < 0.97,
      opzioni: [
        { label: 'Grande programma di edilizia pubblica', costo: 30, effettoDesc: 'Anticipa Vallette e Falchera 2 (sconto −20%): case in fretta, problemi sociali in periferia.',
          apply(S) { S.flags.scontoEDT = 0.8; PAR.Engine.mod(S, { id: 'edt-anticipo', espansionePeriurbana: 0.3 }); } },
        { label: 'Densificare i quartieri esistenti', costo: 26, effettoDesc: 'Anticipa il programma di densificazione (sconto −20%): verde protetto, densità alte.',
          apply(S) { S.flags.scontoDens = 0.8; } },
        { label: 'Tollerare l’autocostruzione abusiva', costo: 0, effettoDesc: 'Zero costi immediati: un debito sociale e urbanistico che scoppierà più avanti.',
          apply(S) { S.flags.abusivismo = true; PAR.Engine.mod(S, { id: 'abusivismo', qolPerAnno: -0.08, disuguaglianzaPerAnno: 0.3 }); H().stakeholder(S, 'residenti', 5); PAR.Engine.timelineAdd(S, { year: 1968, kind: 'decisione', tag: 'IPOTESI', titolo: 'L’abusivismo come valvola', testo: 'La città lascia aperta la valvola dell’autocostruzione: soluzioni immediate, guai a decenni.' }); } }
      ]
    },
    {
      id: 'patto-fiat', anno: 1971, titolo: 'La grande industria pretende spazio',
      testo: 'La Fiat chiede espansione degli impianti di Mirafiori e del sud della città: decine di migliaia di posti in cambio di suolo, traffico e un’industria con un solo sguardo.',
      opzioni: [
        { label: 'Concedere l’espansione piena', costo: 10, effettoDesc: 'Occupazione industriale più forte per un decennio, inquinamento in aumento, dipendenza dalla casa madre.',
          apply(S) { PAR.Engine.mod(S, { id: 'patto-fiat', industriaTasso: 0.014, inquinamentoFattore: 1.10 }, 12); H().stakeholder(S, 'industria', 15); H().stakeholder(S, 'ambientaliste', -10); } },
        { label: 'Espansione a condizione di servizi e tranvie', costo: 25, effettoDesc: 'Meno occupazione ma quartieri meglio serviti e trasporto pubblico rinforzato.',
          apply(S) { PAR.Engine.mod(S, { id: 'patto-fiat', industriaTasso: 0.009 }, 12); S.systems.sociale.servizi = Math.min(1, S.systems.sociale.servizi + 0.08); S.systems.trasporti.qualita = Math.min(1, S.systems.trasporti.qualita + 0.03); H().stakeholder(S, 'industria', 6); H().stakeholder(S, 'sindacati', 8); H().stakeholder(S, 'residenti', 6); } },
        { label: 'Limitare gli ampliamenti e diversificare', costo: 18, effettoDesc: 'L’industria protesta ad alta voce: meno occupazione industriale, economia meno monoculturale.',
          apply(S) { PAR.Engine.mod(S, { id: 'limite-fiat', diversificazionePerAnno: 0.006 }); S.systems.economia.diversificazione = Math.min(1, S.systems.economia.diversificazione + 0.08); H().stakeholder(S, 'industria', -18); H().stakeholder(S, 'ambientaliste', 10); } }
      ]
    },
    {
      id: 'shock-petrolio', anno: 1973, titolo: 'La domenica senza auto?',
      testo: 'La crisi petrolifera impenna i costi dell’energia e la politica discute della città: razionalizzare il traffico o continuare a correre?',
      opzioni: [
        { label: 'Piano di razionalizzazione energetica', costo: 16, effettoDesc: 'Consumo energetico e traffico in calo, umori contrastanti.',
          apply(S) { PAR.Engine.mod(S, { id: 'razionalizzazione-73', energiaPerAnno: -0.006, autoFattore: 0.92, inquinamentoFattore: 0.96 }, 8); PAR.Engine.mod(S, { id: 'razion-parziale', autoFattore: 0.97 }); H().stakeholder(S, 'commercianti', -4); } },
        { label: 'Investire nel trasporto pubblico', costo: 22, effettoDesc: 'Filoviari e tranvie rinforzate: qualità del trasporto pubblico +0.04.',
          apply(S) { const Tt = S.systems.trasporti; Tt.qualita = Math.min(1, Tt.qualita + 0.04); Tt.capacitaPubblico += 40000; PAR.Engine.mod(S, { id: 'energetico-73', autoFattore: 0.95 }, 8); H().stakeholder(S, 'governo', 5); } },
        { label: 'Continuare senza cambiamenti', costo: 0, effettoDesc: 'Nessun costo, nessun cambiamento: l’auto resta regina.',
          apply(S) { PAR.Engine.mod(S, { id: 'niente-73', autoFattore: 1.06 }, 6); } }
      ]
    },
    {
      id: 'crisi-industriale', anno: 1978, titolo: 'La grande industria trema',
      testo: 'La produttività cresce più dell’occupazione: i primi licenziamenti collettivi sono dietro l’angolo. Che cosa fa una città nata per un’unica azienda quando l’azienda cambia pelle?',
      condizione: (S) => S.systems.economia.quotaIndustria < 0.5,
      opzioni: [
        { label: 'Piano di conversione: servizi e riuso delle grandi aree', costo: 42, effettoDesc: 'Smorza il declino, apre il riuso delle aree industriali (che porterà al Lingotto nel 1982).',
          apply(S) { S.flags.conversioneAperta = true; PAR.Engine.mod(S, { id: 'conversione', industriaTasso: 0.006, diversificazionePerAnno: 0.004 }); H().stakeholder(S, 'sindacati', 10); } },
        { label: 'Formazione e offerte per nuovi bacini di lavoro', costo: 30, effettoDesc: 'Ripresa lenta ma stabile: diversificazione +0.12 progressiva.',
          apply(S) { PAR.Engine.mod(S, { id: 'formazioni', diversificazionePerAnno: 0.009 }); } },
        { label: 'Non intervenire', costo: 0, effettoDesc: 'Risparmi oggi: disoccupazione e partenze pagheranno la factura.',
          apply(S) { PAR.Engine.mod(S, { id: 'non-intervento', disuguaglianzaPerAnno: 0.25 }); H().stakeholder(S, 'sindacati', -15); } }
      ]
    },
    {
      id: 'lingotto', anno: 1982, titolo: 'Che cosa fare del Lingotto?',
      testo: 'L’enorme stabilimento del Lingotto chiude: sotto il tetto c’è ancora la pista di prova. Una scelta che cambierà il sud della città.',
      condizione: (S) => S.flags.conversioneAperta === true,
      opzioni: [
        { label: 'Polo di servizi avanzati e tecnologia', costo: 60, effettoDesc: 'Diversificazione +0.12, nuovi occupati terziari nel sud.',
          apply(S) { S.systems.economia.diversificazione = Math.min(1, S.systems.economia.diversificazione + 0.12); PAR.Engine.mod(S, { id: 'lingotto-tech', terziarioPerAnno: 0.006 }); } },
        { label: 'Quartiere misto: case, cultura, enti', costo: 48, effettoDesc: 'Alloggi e servizi nel sud-est della città.',
          apply(S) { PAR.helpersTorino.alloggi(S, 'nizza', 6000); S.systems.sociale.servizi = Math.min(1, S.systems.sociale.servizi + 0.05); } },
        { label: 'Lasciarlo in abbandono', costo: 0, effettoDesc: 'Nessun costo, degrado pesante nella zona sud per un decennio.',
          apply(S) { PAR.Engine.mod(S, { id: 'lingotto-abbandono', qolPerAnno: -0.10 }, 10); H().stakeholder(S, 'residenti', -8); H().stakeholder(S, 'governo', -5); } }
      ]
    },
    {
      id: 'mondiali-90', anno: 1984, titolo: 'Italia ’90: candidarsi o no?',
      testo: 'La federazione sta selezionando le città del mondiale del 1990: la candidatura richiede impianti pubblici e infrastrutture adeguate.',
      opzioni: [
        { label: 'Candidarsi con un grande stadio nuovo', costo: 72, effettoDesc: 'Profilo storico fedele (Stadio delle Alpi): visibilità e ricadute, ma un impianto a debito nella periferia nord.',
          apply(S) { S.flags.stadioDelleAlpi = true; H().stakeholder(S, 'governo', 8); PAR.Engine.mod(S, { id: 'alpi', qolPerAnno: -0.02 }, 12); PAR.Engine.timelineAdd(S, { year: 1984, kind: 'decisione', tag: 'STORICO', titolo: 'Candidatura con il nuovo stadio', testo: 'La città costruirà un grande stadio ai margini urbani, come nella storia reale.' }); } },
        { label: 'Candidarsi riqualificando gli impianti esistenti', costo: 34, effettoDesc: 'Meno spreco di suolo: soddisfazione dei residenti e degli ambientalisti.',
          apply(S) { H().stakeholder(S, 'residenti', 8); H().stakeholder(S, 'ambientaliste', 8); PAR.Engine.timelineAdd(S, { year: 1984, kind: 'decisione', tag: 'IPOTESI', titolo: 'Un mondiale senza lo stadio gigante', testo: 'La città riutilizza gli impianti esistenti: per l’epoca un piccolo miracolo urbanistico.' }); } },
        { label: 'Non candidarsi', costo: 0, effettoDesc: 'Nessuna spesa, nessuna visibilità.',
          apply(S) { H().stakeholder(S, 'governo', -5); } }
      ]
    },
    {
      id: 'svolta-90', anno: 1992, titolo: 'La svolta degli anni Novanta',
      testo: 'La città guarda al nuovo secolo: conviene rilanciare un grande progetto di mobilità o accettare la città dell’auto così com’è?',
      condizione: (S) => (S.systems.trasporti.metroKm === 0 && S.systems.trasporti.railKm < 20 && (S.systems.trasporti.qualita < 0.55 || S.systems.trasporti.autoMille > 480)),
      opzioni: [
        { label: 'Tornare alla metropolitana (a costi altissimi)', costo: 20, effettoDesc: 'Sblocca metro-m1 con sconto solo −10%: le cose non sono più come nel 1962.',
          apply(S) { S.flags.scontoMetro = 0.9; S.flags.conversioneAperta = true; } },
        { label: 'Restare una città dell’auto', costo: 0, effettoDesc: 'Nessun costo: l’auto completa la sua conquista della città.',
          apply(S) { PAR.Engine.mod(S, { id: 'auto-90', autoFattore: 1.10 }); H().stakeholder(S, 'commercianti', 6); } }
      ]
    },
    {
      id: 'crisi-debito', anno: 0, titolo: 'La finanza sotto osservazione',
      testo: 'Il livello del debito non è più sostenibile. Governo e concessionari chiedono un piano di bilancio brutale.',
      condizione: (S) => S.debt > 320,
      maxRipetizioni: 3,
      opzioni: [
        { label: 'Piano di austerità', costo: 0, effettoDesc: 'Spese di base −12% per un decennio: approvazione e servizi in calo.',
          apply(S) { PAR.Engine.mod(S, { id: 'austerita', speseFattore: 0.88, qolPerAnno: -0.10 }, 10); H().stakeholder(S, 'sindacati', -12); H().stakeholder(S, 'residenti', -10); } },
        { label: 'Piano di rientro lento', costo: 0, effettoDesc: 'Spese di base −5% per un decennio, disoccupazione leggermente più alta.',
          apply(S) { PAR.Engine.mod(S, { id: 'rientro', speseFattore: 0.95 }, 10); H().stakeholder(S, 'governo', 8); } }
      ]
    }
  ];

  PAR.TORINO_EVENTI = [
    {
      id: 'onda-migratoria', titolo: 'Nuova onda migratoria',
      testo: 'Il lavoro chiamà migranti da tutto il paese e oltre: migliaia di persone arrivano in pochi mesi. Scuole e case si sovraffollano.',
      condizione: (S) => S.systems.demografia.saldoMigratorio > 0.025,
      cooldownAnni: 6,
      opzioni: [
        { label: 'Programma di alloggi rapidi', costo: 25, effettoDesc: 'Alloggi rapidi e soggiorni better: danno sociale evitato.',
          apply(S) { PAR.helpersTorino.alloggi(S, 'periferie', 5000); } },
        { label: 'Restare a debito di case', costo: 0, effettoDesc: 'Sovraffollamento: disponibilità abitativa in calo.',
          apply(S) { S.systems.sociale.abitazioniAdeguate -= 0.03; } }
      ]
    },
    {
      id: 'emergenza-traffico', titolo: 'L’emergenza del traffico',
      testo: 'Code chilometriche e ritardi ovunque: la stampa chiede un piano o la città si congela.',
      condizione: (S) => S.systems.trasporti.congestione > 0.8,
      cooldownAnni: 5,
      opzioni: [
        { label: 'Restrizioni alla circolazione in centro', costo: 6, effettoDesc: 'Auto e congestione in calo, commercianti contrariati.',
          apply(S) { PAR.Engine.mod(S, { id: 'restrizione-circolazione', autoFattore: 0.94 }, 6); S.systems.trasporti.congestione -= 0.06; H().stakeholder(S, 'commercianti', -8); } },
        { label: 'Più strade', costo: 30, effettoDesc: 'Indice strade +0.06 ma l’appetito per l’auto aumenta.',
          apply(S) { S.systems.trasporti.indiceStrade += 0.06; PAR.Engine.mod(S, { id: 'strade-effimere', autoFattore: 1.06 }, 6); } },
        { label: 'Restare fermi', costo: 0, effettoDesc: 'La congestione resta e parla da sola.',
          apply(S) { H().stakeholder(S, 'residenti', -6); } }
      ]
    },
    {
      id: 'crisi-abitativa-evento', titolo: 'L’abitare si spacca',
      testo: 'Troppi per le case disponibili: affitti ai limiti di sostenibilità e affollamento record.',
      condizione: (S) => S.systems.sociale.abitazioniAdeguate < 0.9,
      cooldownAnni: 6,
      opzioni: [
        { label: 'Piano di alloggi di emergenza', costo: 30, effettoDesc: '+5.000 alloggi, disponibilità in ripresa.',
          apply(S) { PAR.helpersTorino.alloggi(S, 'periferie', 5000); S.systems.sociale.abitazioniAdeguate += 0.02; } },
        { label: 'Restare a guardare', costo: 0, effettoDesc: 'La crisi abitativa continua in silenzio.',
          apply(S) { H().stakeholder(S, 'residenti', -8); S.systems.sociale.disuguaglianza += 2; } }
      ]
    },
    {
      id: 'fondi-statali', titolo: 'Fondi nazionali inaspettati',
      testo: 'Un decreto di investimento metropolitano porta fondi extra alla città.',
      condizione: (S) => PAR.rng() < 0.12 && S.systems.politica.stabilita > 0.5,
      cooldownAnni: 8,
      opzioni: [{ label: 'Raccogliere', costo: 0, effettoDesc: '+18 Mld L nella cassa comunale.', apply(S) { S.treasury += 18; } }]
    },
    {
      id: 'alluvione-rischio', titolo: 'L’alluvione torna',
      testo: 'Una piena del Po ripete gli scenari del passato: senza difese e verde, i quartieri oltre il fiume pagano più di tutti.',
      condizione: (S) => (S.year - (S.flags.lastAlluvione || 1966) >= 9) && S.flags.difesePo !== 'parco',
      cooldownAnni: 9,
      opzioni: [
        { label: 'Costruire difese e verde, una volta per tutte', costo: 35, effettoDesc: 'Difese sbloccate con verde e argini: rischio ridotto.',
          apply(S) { S.flags.difesePo = 'argini'; PAR.Engine.mod(S, { id: 'dopo-alluvione', alluvioneFattore: 0.4 }); S.systems.ambiente.verdeHa += 80; } },
        { label: 'Restare esposti', costo: 0, effettoDesc: 'Rischio e danni restano: qualità della vita e approvazione subiranno.',
          apply(S) { PAR.Engine.mod(S, { id: 'danno-alluvione', qolPerAnno: -0.10 }, 4); H().stakeholder(S, 'residenti', -12); } }
      ]
    },
    {
      id: 'allarme-aria', titolo: 'Allarme aria nei quartieri',
      testo: 'I valori dell’inquinamento sono sopra ogni accettabilità. I medici parlano di dérive annuale.',
      condizione: (S) => S.systems.ambiente.inquinamento > 72,
      cooldownAnni: 5,
      opzioni: [
        { label: 'Restrizioni al traffico e iniziative energetiche', costo: 24, effettoDesc: 'Inquinamento in calo, commercianti contrariati, ambientaliste sollevati.',
          apply(S) { PAR.Engine.mod(S, { id: 'allarme-aria', inquinamentoFattore: 0.93, autoFattore: 0.96 }, 6); H().stakeholder(S, 'commercianti', -5); H().stakeholder(S, 'ambientaliste', 8); } },
        { label: 'Aspettare la fine dell’inverno', costo: 0, effettoDesc: 'Nessun costo: l’aria resta come è.',
          apply(S) { H().stakeholder(S, 'ambientaliste', -10); } }
      ]
    },
    {
      id: 'declino-industriale', titolo: 'La fabbrica si svuota',
      testo: 'Squadre intere di operai restano fuori dai cancelli: la città prova il peso del proprio modello produttivo.',
      condizione: (S) => S.systems.economia.quotaIndustria < 0.38 && S.systems.economia.disoccupazione > 0.07,
      cooldownAnni: 7,
      opzioni: [
        { label: 'Piano di piccole imprese e attività diffuse', costo: 36, effettoDesc: 'Diversificazione +0.1 progressiva, sindacati confortati.',
          apply(S) { PAR.Engine.mod(S, { id: 'piccole-imprese', diversificazionePerAnno: 0.007 }); H().stakeholder(S, 'sindacati', 8); } },
        { label: 'Emigrazione assistita e sussidi', costo: 18, effettoDesc: 'La disoccupazione si riduce ma la popolazione si spopola.',
          apply(S) { PAR.Engine.mod(S, { id: 'esodo-organizzato', popFattore: 0.985 }, 8); } }
      ]
    },
    {
      id: 'olimpiadi', titolo: 'L’eredità dei Giochi',
      testo: 'I Giochi invernali del 2006: le opere per l’evento toccano davvero la città o restano un attraversamento?',
      annoFisso: 2006, soloOltre2000: true,
      opzioni: [
        { label: 'Sfruttare l’occasione per la riqualificazione', costo: 90, effettoDesc: 'Rigenerazione e accessibilità in aumento duraturo.',
          apply(S) { PAR.Engine.mod(S, { id: 'olimpiadi', accessibilita: 0.03, qolPerAnno: 0.1 }, 6); H().stakeholder(S, 'governo', 8); } }
      ]
    }
  ];

  // nota: le chiusure di stato di alcuni eventi usano il riferimento corretto
  PAR.TORINO_EVENTI.find(e => e.id === 'onda-migratoria').opzioni[0].testoEffetto = 'Alloggi rapidi e soggiorni better: danno sociale evitato.';
})();
