/* PARALLEL — scenario TORINO 1962: territorio, iniziali, baseline storica, milestone, archetipi.
   NOTA METODOLOGICA: i valori iniziali e le serie di baseline sono stime illustrative
   ricostruite a partire dal contesto storico noto (censimenti, evoluzione documentata della città).
   Non vanno letti come statistiche ufficiali puntuali. */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});

  const PO = [{ x: 4.55, y: 0.0 }, { x: 4.35, y: 2.0 }, { x: 4.55, y: 4.0 }, { x: 4.75, y: 5.6 }, { x: 3.8, y: 7.6 }, { x: 2.2, y: 8.4 }];
  const DORA = [{ x: 0.0, y: 1.9 }, { x: 2.2, y: 2.5 }, { x: 3.4, y: 2.15 }, { x: 4.35, y: 1.9 }];

  PAR.baseValue = function (serie, year) {
    const keys = Object.keys(serie).map(Number).sort((a, b) => a - b);
    if (year <= keys[0]) return serie[keys[0]];
    if (year >= keys[keys.length - 1]) return serie[keys[keys.length - 1]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (year >= a && year <= b) return serie[a] + (serie[b] - serie[a]) * (year - a) / (b - a);
    }
    return serie[keys[0]];
  };

  const CICLO_NAZIONALE = {
    1962: 6.1, 1963: 5.5, 1964: 2.9, 1965: 3.3, 1966: 5.5, 1967: 6.5, 1968: 5.8, 1969: 6.0,
    1970: 5.3, 1971: 1.6, 1972: 2.7, 1973: 7.0, 1974: 4.2, 1975: -2.6, 1976: 6.4, 1977: 2.5,
    1978: 3.5, 1979: 4.9, 1980: 3.2, 1981: 0.6, 1982: 0.3, 1983: 1.2, 1984: 2.7, 1985: 2.8,
    1986: 3.2, 1987: 3.4, 1988: 4.2, 1989: 3.6, 1990: 2.1, 1991: 1.4, 1992: 0.8, 1993: -0.9,
    1994: 2.2, 1995: 2.9, 1996: 1.1, 1997: 2.0, 1998: 1.8, 1999: 1.6, 2000: 3.0,
    2001: 1.7, 2002: 0.5, 2003: 0.0, 2004: 1.5, 2005: 0.7, 2006: 2.0, 2007: 1.5, 2008: -1.0,
    2009: -5.5, 2010: 1.7, 2011: 0.6, 2012: -2.4, 2013: -1.9, 2014: 0.1, 2015: 0.8, 2016: 1.3,
    2017: 1.7, 2018: 0.9, 2019: 0.5, 2020: -9.0, 2021: 7.0, 2022: 3.7, 2023: 0.9, 2024: 0.5,
    2025: 0.7, 2026: 0.8
  };
  PAR.cicloNazionale = (year) => PAR.baseValue(CICLO_NAZIONALE, year);

  const DISTRETTI = [
    { id: 'centro',      nome: 'Centro storico',           x: 3.0,  y: 3.2,  tag: 'centro',       residenti: 100000, abitazioni: 31000, occupati: 67800,  industrie: 3000,  verdeHa: 5,  supHa: 320, costruitoHa: 300 },
    { id: 'vanchiglia',  nome: 'Vanchiglia',               x: 3.85, y: 3.35, tag: 'urbano',       residenti: 82000,  abitazioni: 26000, occupati: 19600,  industrie: 8000,  verdeHa: 6,  supHa: 340, costruitoHa: 290 },
    { id: 'sansalvario', nome: 'San Salvario',             x: 3.2,  y: 4.15, tag: 'popolare',     residenti: 90000,  abitazioni: 29000, occupati: 18100,  industrie: 6000,  verdeHa: 5,  supHa: 330, costruitoHa: 300 },
    { id: 'crocetta',    nome: 'Crocetta',                 x: 2.25, y: 4.0,  tag: 'residenziale', residenti: 72000,  abitazioni: 23000, occupati: 24100,  industrie: 2000,  verdeHa: 14, supHa: 380, costruitoHa: 270 },
    { id: 'sanpaolo',    nome: 'San Paolo–Parella',        x: 1.25, y: 2.3,  tag: 'residenziale', residenti: 68000,  abitazioni: 21000, occupati: 14300,  industrie: 8000,  verdeHa: 11, supHa: 400, costruitoHa: 230 },
    { id: 'cenisia',     nome: 'Cenisia',                  x: 1.65, y: 3.2,  tag: 'urbano',       residenti: 64000,  abitazioni: 20000, occupati: 11300,  industrie: 12000, verdeHa: 8,  supHa: 420, costruitoHa: 210 },
    { id: 'campagna',    nome: 'Madonna di Campagna',      x: 3.85, y: 1.05, tag: 'urbano',       residenti: 86000,  abitazioni: 27000, occupati: 15800,  industrie: 8000,  verdeHa: 9,  supHa: 450, costruitoHa: 220 },
    { id: 'regioparco',  nome: 'Regio Parco–Aurora',       x: 4.25, y: 2.25, tag: 'popolare',     residenti: 76000,  abitazioni: 24000, occupati: 20300,  industrie: 18000, verdeHa: 6,  supHa: 400, costruitoHa: 235 },
    { id: 'barriera',    nome: 'Barriera di Milano',       x: 5.3,  y: 1.2,  tag: 'operaio',      residenti: 95000,  abitazioni: 30000, occupati: 21800,  industrie: 24000, verdeHa: 5,  supHa: 430, costruitoHa: 245 },
    { id: 'falchera',    nome: 'Falchera',                 x: 6.6,  y: 0.75, tag: 'periferia',    residenti: 46000,  abitazioni: 15000, occupati: 6800,   industrie: 6000,  verdeHa: 12, supHa: 700, costruitoHa: 95 },
    { id: 'vallette',    nome: 'Vallette',                 x: 2.25, y: 0.7,  tag: 'periferia',    residenti: 19000,  abitazioni: 6000,  occupati: 1500,   industrie: 2000,  verdeHa: 14, supHa: 850, costruitoHa: 60 },
    { id: 'mirafiori',   nome: 'Mirafiori',                x: 1.55, y: 5.15, tag: 'industriale',  residenti: 98000,  abitazioni: 33000, occupati: 79100, industrie: 92000, verdeHa: 6,  supHa: 560, costruitoHa: 270 },
    { id: 'nizza',       nome: 'Lingotto–Nizza Millefonti',x: 3.55, y: 5.2,  tag: 'industriale',  residenti: 74000,  abitazioni: 23000, occupati: 64800,  industrie: 70000, verdeHa: 4,  supHa: 480, costruitoHa: 225 },
    { id: 'collina',     nome: 'Collina–Vigna',            x: 5.6,  y: 3.8,  tag: 'collina',      residenti: 28000,  abitazioni: 10000, occupati: 6800,   industrie: 0,     verdeHa: 45, supHa: 900, costruitoHa: 85 }
  ];

  PAR.SCENARIOS = [{
    id: 'torino1962',
    titolo: 'TORINO 1962',
    sottotitolo: 'La città che poteva essere',
    ruolo: 'Presidente del Comitato per lo Sviluppo della Città e del suo Territorio',
    start: {
      year: 1962, endYear: 2000, maxYear: 2026,
      introText: 'Torino vive il pieno miracolo economico: la grande industria assume decine di migliaia di operai portati dall\u2019immigrazione, l\u2019automobile cresce ovunque e le tranvie invecchiano. La città deve scegliere come crescere nei prossimi quarant\u2019anni. Le conseguenze arrivano lontano nel tempo \u2014 e non sempre dove le aspetti.'
    },
    mappa: {
      celle: { w: 8, h: 8 },
      fiumi: [
        { nome: 'Po', punti: PO, larghezza: 9, colore: '#3f6e80' },
        { nome: 'Dora Riparia', punti: DORA, larghezza: 4.5, colore: '#3f6e80' }
      ],
      comuni: [
        { nome: 'Venaria Reale', x: 0.7, y: 0.4 }, { nome: 'Rivoli', x: 0.35, y: 1.6 }, { nome: 'Collegno', x: 0.75, y: 2.6 },
        { nome: 'Grugliasco', x: 0.5, y: 3.8 }, { nome: 'Nichelino', x: 2.0, y: 6.7 }, { nome: 'Moncalieri', x: 3.2, y: 7.2 },
        { nome: 'Chieri', x: 6.7, y: 5.7 }, { nome: 'Settimo T.se', x: 6.95, y: 1.9 }
      ]
    },
    baseline: {
      nota: 'Serie di riferimento: percorso storico reale della città (stime illustrative su base documentaria).',
      popolazione: { 1962: 1020, 1965: 1064, 1970: 1140, 1971: 1168, 1974: 1172, 1978: 1132, 1981: 1090, 1985: 1052, 1990: 1000, 1995: 920, 2000: 872, 2005: 901, 2011: 911, 2016: 886, 2021: 848, 2026: 845 },
      autoMille: { 1962: 150, 1970: 300, 1974: 380, 1981: 450, 1990: 540, 2000: 590, 2010: 600, 2020: 615 },
      shareTpubb: { 1962: 36, 1970: 30, 1975: 26, 1985: 21, 2000: 19, 2011: 33, 2020: 31 },
      tempiMin: { 1962: 20, 1974: 23, 1990: 27, 2000: 26, 2020: 27 },
      inquinamento: { 1962: 42, 1970: 58, 1975: 65, 1985: 60, 1995: 50, 2005: 40, 2020: 32 },
      verdePerCapita: { 1962: 6.0, 1983: 7.5, 1990: 12.0, 2000: 14.0, 2020: 18.0 },
      occupati: { 1962: 470, 1974: 560, 1981: 500, 1991: 440, 2001: 420, 2011: 430, 2021: 435 },
      disoccupazione: { 1962: 2.5, 1971: 3.5, 1977: 6.0, 1984: 9.0, 1992: 8.0, 2000: 6.5, 2010: 7.0, 2020: 8.5 },
      pil: { 1962: 1600, 1970: 2900, 1980: 4100, 1990: 4600, 2000: 5300, 2010: 5600, 2020: 5300, 2026: 5500 }
    },
    milestone: [
      { year: 1964, tag: 'STORICO', titolo: 'Boom migratorio', testo: 'L\u2019immigrazione dal Meridione e dal Nord-Est si intensifica: decine di migliaia di persone l\u2019anno cercano casa e lavoro a Torino.' },
      { year: 1966, tag: 'EVENTO', evento: 'alluvione-po' },
      { year: 1971, tag: 'STORICO', titolo: 'Censimento: 1,17 milioni', testo: 'La popolazione comunale è vicina al massimo storico: il problema casa è centrale. (evento storico reale, censimento 1971)' },
      { year: 1973, tag: 'EVENTO', evento: 'shock-petrolio' },
      { year: 1975, tag: 'STORICO', titolo: 'La natalità crolla', testo: 'La natalità scende stabilmente: inizia il lungo lento declino demografico della popolazione residente.' },
      { year: 1977, tag: 'STORICO', titolo: 'Anni di piombo', testo: 'Tensioni sociali e politiche attraversano la città. Con il sostegno basso, le strade si accendono. (evento storico reale)' },
      { year: 1980, tag: 'STORICO', titolo: 'Crisi industriale: ottobre caldo', testo: 'La grande industria annuncia la riduzione della produzione. La città scopre quanto dipende da una sola casa madre. (evento storico reale)' },
      { year: 1990, tag: 'STORICO', titolo: 'Italia \u201990', testo: 'Il campionato mondiale di calcio si gioca in Italia: impianti nuovi, attenzione internazionale e ferie stradali.' },
      { year: 2001, tag: 'STORICO', titolo: 'Censimento: circa 872 mila residenti', testo: 'La popolazione comunale è in forte calo rispetto al 1974. Quanto ne dipende dalle scelte fatte, lo dirà il confronto. (nella storia reale il censimento 2001 segna 865.000 residenti circa)' },
      { year: 2006, tag: 'EVENTO', evento: 'olimpiadi', soloOltre2000: true },
      { year: 2011, tag: 'STORICO', titolo: 'La metropolitana nel mondo reale', testo: 'Nella storia reale la prima linea metropolitana torinese apre nel 2011, quasi cinquant\u2019anni dopo la questione del 1962. Nella tua timeline le cose possono essere andate diversamente.', soloOltre2000: true },
      { year: 2021, tag: 'STORICO', titolo: 'Censimento: 848 mila', testo: 'La città continua a perdere residenti nella storia reale. Il confronto con la tua timeline è a cura della simulazione.', soloOltre2000: true }
    ],
    territorioInit() {
      return {
        distretti: DISTRETTI.map(d => ({
          id: d.id, nome: d.nome, x: d.x, y: d.y, tag: d.tag,
          residenti: d.residenti, abitazioni: d.abitazioni, occupati: d.occupati, industrie: d.industrie,
          verdeHa: d.verdeHa, supHa: d.supHa, costruitoHa: d.costruitoHa, costruito0: d.costruitoHa,
          nuovaEdificazione: 0, accessibilita: 0.4
        }))
      };
    },
    initSystems(S) {
      S.systems.demografia = {
        popolazione: 1020000, areaMetropolitana: 620000,
        natalita: 0.0187, mortalita: 0.0093,
        fasce: { giovani: 0.21, lavoratori: 0.68, anziani: 0.11 },
        dimensioneHH: 3.2, saldoMigratorio: 0, integrazioneMetro: 0
      };
      S.systems.economia = {
        pil: 1600, occupati: 372000, quotaIndustria: 0.55, quotaTerziario: 0.34,
        disoccupazione: 0.025, produttivita: 1.0, diversificazione: 0.15,
        redditoIndice: 1.0, forzaLavoro: 0.375
      };
      S.systems.trasporti = {
        metroKm: 0, tramKm: 96, railKm: 14, indiceStrade: 1.0,
        autoMille: 150, shareAuto: 0.26, shareTpubb: 0.36, shareAttivo: 0.38,
        congestione: 0.30, tempiMin: 20, qualita: 0.42, accessibilita: 0.42,
        capacitaPubblico: 520000
      };
      S.systems.ambiente = {
        inquinamento: 42, verdeHa: 640, energia: 1.0, emissioni: 1.0, consumoSuolo: 0
      };
      S.systems.sociale = {
        qol: 58, servizi: 0.45, disuguaglianza: 34, abitazioniAdeguate: 1.0, soddisfazione: 0.52
      };
      S.systems.politica = {
        approvazione: 52, stabilita: 0.7,
        stakeholders: { sindacati: 8, industria: 15, commercianti: 0, ambientaliste: 0, residenti: 5, governo: 0 }
      };
      S.finanzaBase = { ricavi: 59, spese: 54, cassaIniziale: 22 };
    },
    archetipi: [
      { id: 'auto', nome: 'La Metropoli dell\u2019Automobile', descr: 'Strade e auto hanno plasmato lo spazio urbano: accessibile in auto, pesante nei gas, sparsa nel territorio.' },
      { id: 'transit', nome: 'La Città del Trasporto Pubblico', descr: 'Ferri e corsie riservate hanno dato alla città un organismo compatto e benservito.' },
      { id: 'ideale1', nome: 'La Città Sostenibile', descr: 'Un equilibrio riuscito tra economia, ambiente e socialità: raro, fragile, possibile.' },
      { id: 'policentrica', nome: 'La Metropoli Policentrica', descr: 'Più anime urbane, tutte connesse: nessun centro solo, periferie con identità propria.' },
      { id: 'fabbrica', nome: 'La Città-Fabbrica', descr: 'L\u2019industria ha tenuto in piedi la città più a lungo che nella storia reale, a un prezzo:' },
      { id: 'ideale2', nome: 'Il Capoluogo Regionale Equilibrato', descr: 'Un ritmo sobrio tra sviluppo, servizi e qualità della vita.' },
      { id: 'divisa', nome: 'La Potenza Divisa', descr: 'Ricca e produttiva, ma fortemente spaccata tra quartieri e modi di vita.' },
      { id: 'bruciata', nome: 'La Città che Fragilisce', descr: 'Un lungo dopo: debiti, abbandono e gente che parte.' }
    ]
  }];

  // helper condivisi per contenuti (decisioni/eventi/progetti)
  PAR.helpersTorino = {
    A(S) { return S.systems.trasporti; },
    ENV(S) { return S.systems.ambiente; },
    stakeholder(S, chiave, delta) {
      const st = S.systems.politica.stakeholders;
      if (st[chiave] !== undefined) st[chiave] = PAR.clamp(st[chiave] + delta, -100, 100);
    },
    bumpAccess(S, ids, delta) {
      ids.forEach(id => {
        const d = S.territorio.distretti.find(x => x.id === id);
        if (d) d.accessibilita = Math.min(1, d.accessibilita + delta);
      });
    },
    alloggi(S, dove, unita, densitaAlloggi) {
      const hh = S.systems.demografia.dimensioneHH;
      const dts = S.territorio.distretti;
      const ENV = S.systems.ambiente;
      let obiettivi;
      if (dove === 'mix-centrale') obiettivi = ['centro', 'crocetta', 'campagna', 'sansalvario'];
      else if (dove === 'periferie') obiettivi = ['barriera', 'vallette', 'falchera', 'mirafiori'];
      else obiettivi = [dove];
      const per = Math.floor(unita / obiettivi.length);
      const dens = dove === 'mix-centrale' ? 320 : (densitaAlloggi || 95);
      obiettivi.forEach(id => {
        const d = dts.find(x => x.id === id);
        if (!d) return;
        const ha = per * hh / dens;
        d.abitazioni += per;
        d.nuovaEdificazione += per;
        d.costruitoHa = Math.min(d.supHa - d.verdeHa, d.costruitoHa + ha);
        ENV.consumoSuolo += ha;
      });
      S.systems.sociale.abitazioniAdeguate = Math.min(1.1, S.systems.sociale.abitazioniAdeguate + 0.05);
    },
    ipotesi(S, testo) {
      PAR.Engine.timelineAdd(S, { year: S.year, kind: 'divergenza', tag: 'IPOTESI', titolo: 'La timeline diverge', testo });
    },
    contoDistretti(S) {
      let ab = 0, res = 0;
      S.territorio.distretti.forEach(d => { ab += d.abitazioni; res += d.residenti; });
      return { abitazioni: ab, residenti: res };
    }
  };
})();
