'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const DATA = E.DATA = {};
  const D = E.Core; // richiede core.js

  DATA.W = 1700;
  DATA.H = 1000;
  DATA.CITY_NAME = 'NORTHBRIDGE';

  DATA.NEIGHBORHOODS = [
    { id: 'suburbs', name: 'Sobborgo', tone: '#96c48a', rect: { x: 40, y: 30, w: 560, h: 290 },
      desc: 'Case con giardino, scuole di quartiere e campi sportivi: il Northbridge famigliare.' },
    { id: 'riverside', name: 'Riverside', tone: '#7fb069', rect: { x: 40, y: 360, w: 600, h: 360 },
      desc: 'Il quartiere lungo il fiume: passeggiata, parchi, palazzine e piccole attività.' },
    { id: 'old-town', name: 'Centro Storico', tone: '#c9a86b', rect: { x: 640, y: 360, w: 430, h: 360 },
      desc: 'Il cuore antico di Northbridge: appartamenti piccoli, caffè, botteghe e piazze.' },
    { id: 'university', name: 'Quartiere Universitario', tone: '#6a93c3', rect: { x: 1160, y: 30, w: 500, h: 390 },
      desc: 'Il campus, le biblioteche, le residenze studentesche e i caffè dove le idee non dormono mai.' },
    { id: 'business', name: 'Distretto degli Affari', tone: '#a8a8a8', rect: { x: 1160, y: 400, w: 500, h: 320 },
      desc: 'Torri per uffici, hotel, studi professionali e il quotidiano cittadino.' },
    { id: 'industrial', name: 'Distretto Industriale', tone: '#9693a8', rect: { x: 40, y: 750, w: 1080, h: 210 },
      desc: 'Il polmone lavorativo: fabbriche, officine, magazzini e logistica.' }
  ];

  DATA.RIVER = [
    { x: 0, y: 330 }, { x: 180, y: 316 }, { x: 360, y: 332 }, { x: 540, y: 318 },
    { x: 760, y: 330 }, { x: 980, y: 318 }, { x: 1200, y: 326 }, { x: 1440, y: 312 }, { x: 1700, y: 326 }
  ];

  DATA.ROADS = [
    { x1: 30, y1: 345, x2: 1670, y2: 345 },
    { x1: 30, y1: 740, x2: 1670, y2: 740 },
    { x1: 615, y1: 20, x2: 615, y2: 980 },
    { x1: 1140, y1: 20, x2: 1140, y2: 980 }
  ];

  DATA.MALE_NAMES = ['Alessandro','Marco','Luca','Davide','Matteo','Giulio','Enzo','Paolo','Tomas','Daniel','Viktor','Ivan','Jonas','Felix','Emil','Otto','Hugo','Nils','Bruno','Carlo','Elio','Sandro','Piotr','Milan','Anton','René','Stefan','Álvaro','Rui','Nuno','Levi','Adam','Omar','Yusuf'];
  DATA.FEMALE_NAMES = ['Elena','Sofia','Giulia','Laura','Marta','Chiara','Anna','Clara','Selma','Nora','Lena','Ingrid','Iris','Mila','Vera','Dana','Petra','Katia','Ivana','Lea','Elisa','Rita','Bruna','Alice','Emma','Larissa','Camille','Małgorzata','Zofia','Carmen','Lucia','Noemi','Freja','Anouk'];
  DATA.SURNAMES = ['Moretti','Rossi','Bianchi','Ferraro','Colombo','Ricci','Kowalski','Novak','Schmidt','Weber','Dupont','Janssen','Lindqvist','Iversen','Keller','Bruni','Fabbrini','Marchetti','Ostrowski','Svátka','Lorentzen','Vissers','Gallardo','Silva','Okafor','Haddad','Bergmann','Toma','Krüger','Vance','Dell\u2019Orso','Perego','Zima','Aalto','Gruber','Lehmann','Beaufort','Carlier','Renkema','Duval'];
  DATA.STREET_NAMES = ['Corso del Fiume','Via delle Rondini','Piazza delle Erbe','Via San Martino','Corso Amber','Via dei Fontanili','Viale dei Pioppi','Via del Moro','Piazza Gracco','Via Arsenio','Viale Nordbridge','Via dei Trovatori','Via del Mulino Vecchio','Corso Baltyk'];

  DATA.INTERESTS = ['lettura','sport','cucina','musica','escursionismo','fotografia','giardinaggio','cinema','scacchi','enogastronomia','pesca','artigianato','calcio','teatro','viaggi','animali','tecnologia','vino'];

  DATA.FOREIGN_CITIES = ['Marburg','Kraków','Haarlem','Valence','Bristol','Linz','Brno','Ghent','Toulouse','Odense','Kalmar','Exeter','Schwerin','Zagabria'];

  DATA.JOB_TABLE = {
    fabbrica: [
      { t: 'Operaio', e: 1, w: 1850 }, { t: 'Tecnico di linea', e: 2, w: 2400 },
      { t: 'Caposquadra', e: 2, w: 2750 }, { t: 'Dirigente di produzione', e: 3, w: 3450 }
    ],
    officina: [{ t: 'Meccanico', e: 1, w: 1900 }, { t: 'Maestro officina', e: 2, w: 2500 }],
    magazzino: [{ t: 'Magazziniere', e: 1, w: 1600 }, { t: 'Coordinatore logistica', e: 2, w: 2250 }],
    ufficio: [
      { t: 'Impiegato', e: 2, w: 2150 }, { t: 'Analista', e: 3, w: 2750 }, { t: 'Ingegnere', e: 3, w: 3100 },
      { t: 'Architetto', e: 3, w: 3050 }, { t: 'Manager', e: 3, w: 3400 }, { t: 'Direttore', e: 4, w: 4300 }
    ],
    giornale: [{ t: 'Giornalista', e: 3, w: 2500 }, { t: 'Redattore capo', e: 3, w: 3200 }],
    banca: [{ t: 'Addetto allo sportello', e: 2, w: 2150 }, { t: 'Analista crediti', e: 3, w: 3000 }, { t: 'Direttore di filiale', e: 4, w: 4000 }],
    scuola: [{ t: 'Insegnante', e: 3, w: 2250 }, { t: 'Preside', e: 3, w: 3000 }],
    universita: [{ t: 'Ricercatore', e: 4, w: 2750 }, { t: 'Professore', e: 4, w: 3750 }, { t: 'Amministrativo', e: 2, w: 2050 }],
    clinica: [{ t: 'Infermiere', e: 2, w: 2050 }, { t: 'Medico di base', e: 4, w: 4000 }, { t: 'Specialista', e: 4, w: 4400 }],
    negozio: [{ t: 'Commerciante', e: 1, w: 1750 }, { t: 'Titolare', e: 2, w: 2650 }],
    ristorante: [{ t: 'Cameriere', e: 1, w: 1500 }, { t: 'Cuoco', e: 2, w: 1900 }, { t: 'Gestore', e: 2, w: 2650 }],
    bar: [{ t: 'Barista', e: 1, w: 1450 }, { t: 'Gestore', e: 2, w: 2500 }],
    stazione: [{ t: 'Capostazione', e: 2, w: 2300 }, { t: 'Controllore', e: 1, w: 1800 }],
    administrative: [{ t: 'Funzionario', e: 3, w: 2500 }, { t: 'Agente della polizia', e: 2, w: 2150 }, { t: 'Segretaria comunale', e: 2, w: 2000 }],
    hotel: [{ t: 'Receptionist', e: 2, w: 1900 }, { t: 'Direttore hotel', e: 3, w: 3200 }],
    laboratorio: [{ t: 'Tecnico di laboratorio', e: 3, w: 2750 }]
  };

  DATA.SOCIAL_SLOTS = {
    bar: [{ h0: 7, h1: 9 }, { h0: 17, h1: 21 }],
    ristorante: [{ h0: 12, h1: 14 }, { h0: 19, h1: 22 }],
    parco: [{ h0: 9, h1: 12 }, { h0: 15, h1: 19 }],
    piazza: [{ h0: 10, h1: 12 }, { h0: 17, h1: 21 }],
    campo: [{ h0: 9, h1: 12 }, { h0: 15, h1: 19 }],
    chiesa: [{ h0: 9, h1: 11 }],
    biblioteca: [{ h0: 10, h1: 18 }],
    mercato: [{ h0: 9, h1: 12 }]
  };

  DATA.EMPLOYER_TYPES = new Set(Object.keys(DATA.JOB_TABLE));

  DATA.BUILDING_LABELS = {
    casa: 'Residenza', negozio: 'Negozio', ristorante: 'Ristorante', ufficio: 'Ufficio',
    fabbrica: 'Fabbrica', scuola: 'Scuola', universita: 'Università', clinica: 'Clinica',
    stazione: 'Stazione', parco: 'Parco', bar: 'Bar', biblioteca: 'Biblioteca',
    campo: 'Campo sportivo', chiesa: 'Chiesa', mercato: 'Mercato', giornale: 'Giornale',
    banca: 'Banca', hotel: 'Hotel', laboratorio: 'Studio / Laboratorio', officina: 'Officina',
    magazzino: 'Magazzino', administrative: 'Uffici comunali', piazza: 'Piazza',
    centro: 'Centro comunitario'
  };

  DATA.INTERVENTIONS = [
    { id: 'evento', name: 'Sponsorizza una festa di quartiere', cost: '€4.000', eff: 'Sociabilità e contentezza in aumento per alcuni mesi.' },
    { id: 'centro', name: 'Fonda un centro comunitario', cost: '€220.000', eff: 'Nuovo luogo di incontro permanente, meno isolamento sociale.' },
    { id: 'scuola', name: 'Sostieni una scuola locale', cost: '€60.000', eff: 'Più opportunità formative per i giovani di Northbridge.' },
    { id: 'trasporti', name: 'Migliora il trasporto pubblico', cost: '€150.000', eff: 'Nuova linea di autobus: meno tempo perso, più incontri.' },
    { id: 'parco', name: 'Crea un nuovo parco', cost: '€90.000', eff: 'Nuovo spazio verde pubblico in un quartiere.' },
    { id: 'aiuto', name: 'Sostieni le attività in difficoltà', cost: '€45.000', eff: 'Prestiti alle imprese a rischio: le aiuta a sopravvivere.' }
  ];

  /* ---- Generazione della città ---- */
  let BSEQ = 0;

  function mk(type, hood, x, y, w, h, name, cap, jobIdx, rng) {
    const b = {
      id: 'b' + (++BSEQ), type, hood, x, y, w, h, name: name || null, cap: cap || 0,
      residents: [], jobs: [], business: null, founded: null
    };
    if (jobIdx) {
      const table = DATA.JOB_TABLE[type] || [];
      b.jobs = jobIdx.map(i => ({ title: table[i].t, edu: table[i].e, wage: table[i].w, citizen: null }));
      b.business = { health: rng.int(38, 72), founded: -rng.int(365, 365 * 80), closed: null };
    }
    return b;
  }

  DATA.layout = function (rng) {
    BSEQ = 0;
    const B = [];
    const A = (...args) => B.push(mk(...args, rng));

    /* Sobborgo: case + scuole + sport + negozi */
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++)
      A('casa', 'suburbs', 100 + c * 100, 70 + r * 62, 62, 42, null, rng.int(2, 4), null);
    A('scuola', 'suburbs', 100, 302, 110, 54, 'Scuola Elementare dell\u2019Ovest', 0, [0, 1]);
    A('scuola', 'suburbs', 240, 302, 110, 54, 'Istituto Arnason', 0, [0, 1]);
    A('campo', 'suburbs', 400, 302, 90, 54, 'Campo Sportivo Nord', 0, null);
    A('negozio', 'suburbs', 520, 302, 56, 50, 'Market degli Olmi', 0, [0, 1]);

    /* Riverside */
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++)
      A('casa', 'riverside', 90 + c * 108, 385 + r * 62, 66, 46, null, rng.int(3, 6), null);
    A('scuola', 'riverside', 90, 575, 110, 54, 'Scuola del Fiume', 0, [0, 1]);
    A('clinica', 'riverside', 230, 575, 110, 54, 'Ambulatorio Riverside', 0, [0, 1, 2]);
    A('bar', 'riverside', 370, 575, 62, 50, 'Caffè della Diga', 0, [0, 1]);
    A('bar', 'riverside', 460, 575, 62, 50, 'Bar Noce', 0, [0]);
    A('negozio', 'riverside', 550, 575, 56, 50, 'Enoteca Pergolesi', 0, [0, 1]);
    A('parco', 'riverside', 150, 660, 220, 64, 'Parco Riva Nord', 0, null);
    A('parco', 'riverside', 430, 660, 190, 64, 'Giardini Lavanda', 0, null);
    A('chiesa', 'riverside', 100, 660, 40, 64, 'Chiesa di Santa Gatta', 0, null);
    A('mercato', 'riverside', 640, 575, 56, 50, 'Mercato del Sabato', 0, null);

    /* Centro storico */
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
      A('casa', 'old-town', 670 + c * 100, 420 + r * 62, 60, 44, null, rng.int(3, 7), null);
    A('bar', 'old-town', 670, 380, 60, 36, 'Caffè Gracco', 0, [0, 1]);
    A('bar', 'old-town', 740, 380, 60, 36, 'Ritrovo del Corso', 0, [0, 1]);
    A('ristorante', 'old-town', 870, 376, 64, 40, 'Trattoria Vecchio Ponte', 0, [0, 1, 2]);
    A('ristorante', 'old-town', 944, 376, 64, 40, 'Ristorante Amber', 0, [0, 1, 2]);
    A('negozio', 'old-town', 1018, 376, 56, 40, 'Antiquariato Folco', 0, [0, 1]);
    A('negozio', 'old-town', 670, 690, 56, 42, 'Cartoleria Lindqvist', 0, [0]);
    A('negozio', 'old-town', 736, 690, 56, 42, 'Casa del Disco', 0, [0]);
    A('biblioteca', 'old-town', 870, 690, 68, 48, 'Biblioteca Civica', 0, null);
    A('piazza', 'old-town', 948, 690, 110, 54, 'Piazza delle Erbe', 0, null);
    A('scuola', 'old-town', 1068, 690, 60, 48, 'Liceo Northbridge', 0, [0, 1]);
    A('scuola', 'old-town', 1068, 380, 60, 48, 'Scuola Media Soave', 0, [0, 1]);

    /* Distretto degli affari */
    A('ufficio', 'business', 1180, 430, 90, 78, 'Torre Nordbridge', 0, [0, 1, 2, 3, 4, 5]);
    A('ufficio', 'business', 1290, 430, 90, 78, 'Palazzo dei Contratti', 0, [0, 1, 4, 5]);
    A('ufficio', 'business', 1400, 430, 90, 78, 'Centro Assicurazioni Halden', 0, [0, 1, 2, 4]);
    A('banca', 'business', 1180, 530, 90, 60, 'Banca Popolare di Northbridge', 0, [0, 1, 2]);
    A('giornale', 'business', 1290, 530, 90, 60, 'La Gazzetta di Northbridge', 0, [0, 1]);
    A('hotel', 'business', 1400, 530, 90, 60, 'Grand Hotel Station', 0, [0, 1]);
    A('laboratorio', 'business', 1180, 610, 90, 56, 'Studio West & Partner', 0, [0]);
    A('laboratorio', 'business', 1290, 610, 90, 56, 'Laboratorio Analisi Zima', 0, [0]);
    A('bar', 'business', 1400, 610, 58, 44, 'Café Interludio', 0, [0, 1]);
    A('bar', 'business', 1470, 610, 58, 44, 'Bar Halliwell', 0, [0, 1]);
    A('administrative', 'business', 1310, 690, 140, 60, 'Palazzo Comunale', 0, [0, 1, 2]);

    /* Quartiere universitario */
    A('universita', 'university', 1180, 80, 200, 110, 'Università di Northbridge', 0, [0, 1, 2]);
    A('biblioteca', 'university', 1400, 80, 80, 70, 'Biblioteca Aalto', 0, null);
    A('scuola', 'university', 1180, 220, 120, 56, 'Scuola Superiore Nord', 0, [0, 1]);
    A('scuola', 'university', 1320, 220, 120, 56, 'Istituto Tecnico Krüger', 0, [0, 1]);
    A('scuola', 'university', 1460, 220, 120, 56, 'Collegio Crespi', 0, [0, 1]);
    A('bar', 'university', 1180, 300, 60, 42, 'Caffè Seminario', 0, [0, 1]);
    A('bar', 'university', 1250, 300, 60, 42, 'L\u2019Aula Magna', 0, [0, 1]);
    A('scuola', 'university', 1390, 300, 110, 54, 'Scuola Elementare dell\u2019Est', 0, [0, 1]);
    for (let c = 0; c < 4; c++)
      A('casa', 'university', 1180 + c * 100, 380, 62, 44, null, rng.int(3, 6), null);

    /* Distretto industriale */
    A('fabbrica', 'industrial', 90, 790, 190, 150, 'Fabbrica Meridiana', 0, [0, 1, 2, 3]);
    A('fabbrica', 'industrial', 320, 790, 170, 150, 'Fonderia Otten', 0, [0, 1, 2]);
    A('magazzino', 'industrial', 530, 790, 140, 150, 'Logistica Palladio', 0, [0, 1]);
    A('magazzino', 'industrial', 700, 790, 140, 150, 'Cooperativa La Riva', 0, [0, 1]);
    A('officina', 'industrial', 870, 790, 100, 80, 'Officina Duval', 0, [0, 1]);
    A('scuola', 'industrial', 870, 890, 100, 50, 'Scuola Tecnica Danubio', 0, [0, 1]);
    A('stazione', 'old-town', 1000, 690, 130, 54, 'Stazione di Northbridge', 0, [0, 1]);

    return B;
  };

  DATA.HOOD_BY_ID = {};
  for (const h of DATA.NEIGHBORHOODS) DATA.HOOD_BY_ID[h.id] = h;

  /* Nomi per nuove attività */
  DATA.BUSINESS_NAMES = {
    negozio: ['Bottega Vellini', 'Mercatino Posta', 'Salumeria da Vito', 'Fiorista Primavera', 'Libreria Aurora', 'Dischi Radio', 'Sartoria Corsi'],
    ristorante: ['Osteria del Bue', 'Ristorantino Miramare', 'Pizzeria Sole', 'Kuchnia Nowa', 'Table d\u2019Hôte'], 
    bar: ['Caffè Metro', 'Bar SVT', 'Caffè degli Studenti', 'Bar Cordata', 'Café Möbel'],
    ufficio: ['Studio Norden', 'Consulenze Bravo', 'Uffici Meridian', 'Agenzia Ponte', 'Dati & Co.'],
    fabbrica: ['Vetreria Duval', 'Molisten SPA', 'Cartotecnica Camen', 'Fonderia Nord'],
    laboratorio: ['Studio Forma', 'Biotech Vendel', 'Geo Lab Nord'],
    parco: ['Parco delle Querce', 'Giardino del Ponte', 'Parco di Primavera'],
    centro: ['Centro Comunitario Ponte', 'Casa del Quartiere', 'Circolo Civico']
  };
})(window.EHL);
