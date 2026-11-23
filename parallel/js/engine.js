/* PARALLEL — motore di simulazione. Un tick = un anno.
   Ordine: progetti → economia → demografia → territorio → trasporti → ambiente
   → società → politica → finanza → trigger (decisioni/eventi) → milestone → snapshot.
   Le formule sono volontariamente trasparenti: vedi docs/simulazione.md. */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});
  const clamp = PAR.clamp;

  const E = (PAR.Engine = {
    scenario: null,
    progetti: [],
    decisioni: [],
    eventi: []
  });

  E.rebindScenario = function (sc) {
    E.scenario = sc;
    E.progetti = sc && sc.id === 'torino1962' ? PAR.TORINO_PROGETTI : [];
    E.decisioni = sc && sc.id === 'torino1962' ? PAR.TORINO_DECISIONI : [];
    E.eventi = sc && sc.id === 'torino1962' ? PAR.TORINO_EVENTI : [];
  };

  E.ensure = function (S) {
    if (!E.scenario || E.scenario.id !== S.scenario) {
      E.rebindScenario(PAR.SCENARIOS.find(x => x.id === S.scenario));
    }
  };

  // ————— modificatori duraturi (le conseguenze a lungo termine) —————
  E.mod = function (S, effetti, durataAnni) {
    const id = effetti.id || ('mod-' + S.year + '-' + Object.keys(effetti).join('-'));
    const effettiNetti = Object.assign({}, effetti);
    delete effettiNetti.id;
    const m = { id: id, year: S.year, effetti: effettiNetti };
    if (durataAnni) m.scadenza = S.year + durataAnni;
    S.mods.push(m);
  };

  E.modFactor = function (S, chiave, fallback, modo) {
    const attivi = S.mods.filter(m =>
      m.effetti[chiave] !== undefined &&
      (m.scadenza === undefined || m.scadenza === null || m.scadenza > S.year)
    );
    if (!attivi.length) return fallback;
    if (modo === 'prodotto') return attivi.reduce((a, m) => a * m.effetti[chiave], 1);
    return fallback + attivi.reduce((a, m) => a + m.effetti[chiave], 0);
  };

  // ————— timeline —————
  E.timelineAdd = function (S, entry) {
    S.timeline.push(Object.assign({ id: 'tl' + S.timeline.length, tag: 'SIMULATO', kind: 'nota' }, entry));
  };

  // ————— progetti: costi e completamento —————
  function progettoDef(S, id) { return E.progetti.find(x => x.id === id); }

  E.costoTotale = function (S, pro) {
    const f = S.flags || {};
    let sconto = 1;
    if (pro.id.indexOf('metro') === 0) sconto = f.scontoMetro || 1;
    else if (pro.id.indexOf('tram') === 0) sconto = f.scontoTram || 1;
    else if (pro.id.indexOf('road') === 0) sconto = f.scontoStrade || 1;
    else if (pro.id.indexOf('rail') === 0) sconto = f.scontoFerrovia || 1;
    else if (pro.id === 'parco-po') sconto = f.scontoParcoPo || 1;
    else if (pro.id.indexOf('edt') === 0 || pro.id === 'densifica') sconto = Math.min(f.scontoEDT || 1, f.scontoDens || 1);
    return pro.costo * sconto;
  };

  E.costoAnnuale = function (S, pro) {
    return E.costoTotale(S, pro) / pro.durata * (1 - pro.cofin);
  };

  function mantenimentiTotali(S) {
    let tot = 0;
    S.projects.forEach(p => {
      const def = progettoDef(S, p.id);
      if (def && p.completato) tot += def.mantenimento;
    });
    return tot;
  }

  E.progettiInCorso = S => S.projects.filter(p => !p.completato);

  function costoAnnuiInCorso(S) {
    let tot = 0;
    E.progettiInCorso(S).forEach(p => {
      const def = progettoDef(S, p.id);
      if (def) tot += E.costoAnnuale(S, def);
    });
    return tot;
  }

  function stepProgetti(S) {
    S.projects.forEach(p => {
      const def = progettoDef(S, p.id);
      if (!def || p.completato) return;
      p.versamentoAnno = E.costoAnnuale(S, def);
      p.progresso += 100 / def.durata;
      if (p.progresso >= 100) {
        p.progresso = 100;
        p.completato = true;
        p.annoCompletamento = S.year;
        if (def.onComplete) def.onComplete(S, p);
        S.yearReport.completati.push({ nome: def.nome, effetto: def.effettoDesc });
        E.timelineAdd(S, {
          year: S.year, kind: 'progetto', tag: S.flags.dottrina ? 'SIMULATO' : 'IPOTESI',
          titolo: 'Completato: ' + def.nome, testo: def.effettoDesc
        });
      }
    });
  }

  // ————— ECONOMIA —————
  function stepEconomia(S) {
    const ec = S.systems.economia, T = S.systems.trasporti, ENV = S.systems.ambiente;
    const nat = PAR.cicloNazionale(S.year);
    const accessibilita = clamp(T.accessibilita + E.modFactor(S, 'accessibilita', 0), 0.15, 1);
    const congPen = Math.max(0, T.congestione - 0.7) * 2.5;
    const pollPen = Math.max(0, ENV.inquinamento - 65) * 0.05;
    let g = 0.5 * nat + 0.8 + 2.5 * (accessibilita - 0.42) + 1.2 * (ec.diversificazione - 0.15) - congPen - pollPen;
    g -= Math.max(0, S.debt - 200) * 0.002;
    g = clamp(g, -4, 7);
    ec.crescitaPil = g;
    ec.pil = Math.max(300, ec.pil * (1 + g / 100));

    const declinoInd = clamp(0.010 - E.modFactor(S, 'industriaTasso', 0) * 0.25 - (ec.diversificazione - 0.15) * 0.25, 0.001, 0.02);
    ec.quotaIndustria = clamp(ec.quotaIndustria - declinoInd, 0.12, 0.62);
    const ristrutturazione = declinoInd * 620 * Math.max(0, ec.quotaIndustria - 0.05) * clamp((3.9 - nat) / 3.4, -0.55, 1.3);

    const indBonus = E.modFactor(S, 'industriaTasso', 0) * 100;
    const terzBonus = E.modFactor(S, 'terziarioPerAnno', 0) * 100;
    const occupG = clamp(0.62 * g - 1.05 + indBonus - ristrutturazione, -7, 4);
    ec.occupati = Math.max(120000, Math.min(forzaLavoroEff(S), ec.occupati * (1 + occupG / 100)));

    ec.quotaTerziario = clamp(ec.quotaTerziario + declinoInd * 0.85 + terzBonus / 10000, 0.2, 0.78);
    ec.diversificazione = clamp(ec.diversificazione + E.modFactor(S, 'diversificazionePerAnno', 0), 0, 1);

    ec.forzaLavoro = clamp(ec.forzaLavoro + 0.0006, 0.34, 0.45);
    const forzaLavoro = S.systems.demografia.popolazione * ec.forzaLavoro;
    if (ec.strutturale === undefined) ec.strutturale = 0.015;
    const disoccCiclica = clamp(1 - ec.occupati / Math.max(1, forzaLavoro), 0.012, 0.25);
    ec.strutturale = clamp(ec.strutturale + 0.35 * Math.max(0, disoccCiclica - 0.03) - 0.05 * ec.strutturale - E.modFactor(S, 'diversificazionePerAnno', 0) * 0.25, 0.012, 0.15);
    let disocc = disoccCiclica + ec.strutturale;
    disocc = clamp(disocc, 0.012, 0.25) + E.modFactor(S, 'disoccupazioneBonus', 0);
    ec.disoccupazione = clamp(disocc, 0.01, 0.26);
    ec.redditoIndice = Math.max(0.4, ec.redditoIndice * (1 + (g - 0.7) / 260));

    S.yearReport.noteEconomia.push(
      'PIL ' + (g >= 0 ? '+' : '') + g.toFixed(1) + '% · occupati ' + PAR.fmt.pop(ec.occupati) +
      ' · disoccupazione ' + PAR.fmt.pct(ec.disoccupazione)
    );
  }

  function forzaLavoroEff(S) {
    return S.systems.demografia.popolazione * S.systems.economia.forzaLavoro;
  }

  // ————— DEMOGRAFIA —————
  function stepDemografia(S) {
    const D = S.systems.demografia, ec = S.systems.economia, SOC = S.systems.sociale;
    const T = S.systems.trasporti, ENV = S.systems.ambiente;

    D.natalita = Math.max(0.0085, D.natalita - 0.00042);
    D.mortalita = Math.min(0.0125, D.mortalita + 0.00006);

    const F = D.fasce;
    const ingresso = F.giovani / 15;
    const pensionamento = F.lavoratori / 47;
    F.giovani = clamp(F.giovani + D.natalita - ingresso, 0.08, 0.30);
    F.lavoratori = clamp(F.lavoratori + ingresso - pensionamento, 0.5, 0.75);
    F.anziani = clamp(1 - F.giovani - F.lavoratori, 0.08, 0.34);

    const housingFactor = clamp(SOC.abitazioniAdeguate, 0.55, 1.1);
    const pollPen = Math.max(0, ENV.inquinamento - 58) * 0.0012;
    const congPen = Math.max(0, T.congestione - 0.8) * 0.012;
    const migrTarget = clamp(0.028 - 0.75 * ec.disoccupazione, -0.012, 0.024) * housingFactor;
    if (D.inerziaMigratoria === undefined) D.inerziaMigratoria = migrTarget;
    D.inerziaMigratoria = 0.55 * D.inerziaMigratoria + 0.45 * migrTarget;
    let migr = D.inerziaMigratoria - pollPen - congPen;
    migr *= E.modFactor(S, 'popFattore', 1, 'prodotto');
    D.saldoMigratorio = clamp(migr, -0.024, 0.06);

    const naturale = D.popolazione * (D.natalita - D.mortalita);
    const migratori = D.popolazione * D.saldoMigratorio;
    D.popolazione = Math.max(300000, D.popolazione + naturale + migratori);

    const am = 0.004 + 0.35 * Math.max(0, D.saldoMigratorio) + 0.004 * (D.integrazioneMetro || 0);
    D.areaMetropolitana = Math.max(300000, D.areaMetropolitana * (1 + clamp(am, 0, 0.03)));
    D.dimensioneHH = Math.max(2.2, D.dimensioneHH - 0.011);

    S.yearReport.noteEconomia.push(
      'Popolazione ' + PAR.fmt.pop(D.popolazione) + ' · saldo migratorio ' + (D.saldoMigratorio * 100).toFixed(1) + '‰'
    );
  }

  // ————— TERRITORIO E ABITAZIONI —————
  function stepTerritorio(S) {
    const D = S.systems.demografia, EC = S.systems.economia, ENV = S.systems.ambiente, SOC = S.systems.sociale;
    const hh = D.dimensioneHH;
    const DT = S.territorio.distretti;

    let abitazioni = 0;
    DT.forEach(d => { abitazioni += d.abitazioni; });
    const necessarie = D.popolazione / hh;
    const carenti = Math.max(0, necessarie - abitazioni);

    if (carenti > 0) {
      const espansioneTot = E.modFactor(S, 'espansionePeriurbana', 0);
      const spontanee = Math.min(carenti * 0.30 * clamp(1 + 0.55 * espansioneTot, 0.6, 1.8), 14000);
      const quotaDensa = clamp(E.modFactor(S, 'densificaCorridoio', 0), 0, 0.6);
      const nDense = Math.floor(spontanee * quotaDensa);
      const nEsp = spontanee - nDense;
      if (nDense > 0) {
        const centrali = DT.slice().sort((a, b) => b.accessibilita - a.accessibilita).slice(0, 4);
        centrali.forEach(d => {
          const q = Math.floor(nDense / centrali.length);
          d.abitazioni += q; d.nuovaEdificazione += q;
          d.costruitoHa = Math.min(d.supHa - d.verdeHa, d.costruitoHa + q * hh / 300);
        });
      }
      if (nEsp > 0) {
        const esterne = DT.filter(d => d.tag === 'periferia' || d.tag === 'collina' || d.tag === 'industriale');
        const leapfrog = clamp(1 + 0.4 * espansioneTot, 1, 1.7);
        esterne.forEach(d => {
          const q = Math.floor(nEsp / esterne.length);
          d.abitazioni += q; d.nuovaEdificazione += q;
          const ha = q * hh / 90 * leapfrog;
          d.costruitoHa = Math.min(d.supHa - d.verdeHa, d.costruitoHa + ha);
          ENV.consumoSuolo += ha;
        });
      }
    }

    const espSpec = E.modFactor(S, 'espansionePeriurbana', 0);
    if (espSpec > 0.25) {
      const Tt = S.systems.trasporti;
      const spec = Math.round(espSpec * 520 * clamp(Tt.autoMille / 260, 0, 1.3) * (S.year < 1980 ? 1.3 : 0.75));
      if (spec > 0) {
        const spec2 = Math.min(spec, Math.max(0, Math.round(D.popolazione / hh * 1.06 - DT.reduce((a, d) => a + d.abitazioni, 0))));
        if (spec2 > 0) {
          const esterne = DT.filter(d => d.tag === 'periferia' || d.tag === 'industriale');
          let haSpec = 0;
          esterne.forEach(d => {
            const q = Math.floor(spec2 / Math.max(1, esterne.length));
            d.abitazioni += q; d.nuovaEdificazione += q;
            const ha = q * hh / 110;
            d.costruitoHa = Math.min(d.supHa - d.verdeHa, d.costruitoHa + ha);
            ENV.consumoSuolo += ha;
            haSpec += ha;
          });
          if (haSpec >= 8) S.yearReport.noteTerritorio.push('Espansione speculativa oltre la cintura: ' + Math.round(haSpec) + ' ha di suolo periurbano edificato con accesso automobilistico.');
        }
      }
    }
    if (S.flags.abusivismo && carenti > 0) {
      const q = Math.min(6000, Math.floor(carenti * 0.12));
      const grosso = DT.slice().sort((a, b) => b.residenti - a.residenti).slice(0, 3);
      grosso.forEach(d => { d.abitazioni += Math.floor(q / 3); d.nuovaEdificazione += Math.floor(q / 3); });
      SOC.disuguaglianza += 0.3;
      E.timelineAdd(S, {
        year: S.year, kind: 'conseguenza', tag: 'SIMULATO', titolo: 'Abusivismo in espansione',
        testo: 'L’autocostruzione senza regole copre il fabbisogno ma degrada la qualità urbana del patrimonio edilizio.'
      });
    }

    let dopo = 0;
    DT.forEach(d => { dopo += d.abitazioni; });
    SOC.abitazioniAdeguate = clamp(dopo / necessarie, 0.7, 1.15);

    const wTot = DT.reduce((a, d) => a + Math.max(0.02, d.residenti + d.nuovaEdificazione * hh * 0.25), 0);
    DT.forEach(d => {
      const w = Math.max(0.02, d.residenti + d.nuovaEdificazione * hh * 0.25);
      d.residenti = D.popolazione * (w / wTot);
      d.nuovaEdificazione = 0;
    });

    const totOcc = DT.reduce((a, d) => a + d.occupati, 0) || 1;
    const fattoreOcc = EC.occupati / totOcc;
    DT.forEach(d => { d.occupati = Math.round(d.occupati * fattoreOcc); });

    const totInd = DT.reduce((a, d) => a + d.industrie, 0) || 1;
    const quotaIndAttuale = DT.reduce((a, d) => a + d.industrie, 0) / totOcc || 0;
    const fattoreInd = (EC.occupati * EC.quotaIndustria) / Math.max(1, totInd);
    DT.forEach(d => { d.industrie = Math.round(Math.min(d.occupati, d.industrie * fattoreInd)); });
  }

  // ————— TRASPORTI —————
  function stepTrasporti(S) {
    const T = S.systems.trasporti, D = S.systems.demografia;

    const saturazione = clamp((660 - T.autoMille) / 660, 0, 1) * 0.20;
    const qualitaFreno = 1 - 0.5 * clamp(T.qualita - 0.4, 0, 0.6);
    const shareFreno = 1 - 0.8 * clamp(T.shareTpubb - 0.3, 0, 0.3);
    const crescitaAuto = T.autoMille * saturazione * (E.modFactor(S, 'autoFattore', 1, 'prodotto')) * qualitaFreno * shareFreno;
    T.autoMille = Math.min(700, T.autoMille + crescitaAuto);

    const attrazioneTpubb = clamp(
      0.14 + 0.42 * T.qualita + 0.10 * (T.congestione - 0.5) + 0.05 * Math.min(1, T.metroKm / 12.5),
      0.06, 0.62
    );
    T.shareTpubb += clamp(attrazioneTpubb - T.shareTpubb, -0.012, 0.012);
    T.shareAttivo = clamp(T.shareAttivo + E.modFactor(S, 'shareAttivoPerAnno', 0), 0.15, 0.5);
    T.shareAuto = clamp(1 - T.shareTpubb - T.shareAttivo, 0.2, 0.7);

    const viaggiGiorno = D.popolazione * 2.45;
    const autoTrips = viaggiGiorno * T.shareAuto;
    const capStrade = 2200000 * Math.pow(T.indiceStrade, 0.8);
    T.congestione = clamp(autoTrips / capStrade * E.modFactor(S, 'congestioneFattore', 1, 'prodotto'), 0.15, 0.98);

    const tpubbTrips = viaggiGiorno * T.shareTpubb;
    const pressione = tpubbTrips / Math.max(1, T.capacitaPubblico);
    if (pressione > 1.2) T.qualita = Math.max(0.2, T.qualita - 0.005);

    T.tempiMin = clamp(17 + 16 * T.congestione - 5 * T.qualita, 14, 55);
    T.accessibilita = clamp(
      0.14 + 0.34 * (T.metroKm * 4 + T.tramKm + T.railKm * 1.6) / 180 + 0.22 * T.qualita,
      0.15, 1
    );
  }

  // ————— AMBIENTE —————
  function stepAmbiente(S) {
    const T = S.systems.trasporti, EC = S.systems.economia, ENV = S.systems.ambiente, D = S.systems.demografia;

    const puliziaTecnologica = Math.min(15, Math.max(0, S.year - 1985) * 0.75);
    const beneficioVerde = Math.min(6, ENV.verdeHa / 400);
    const target = 17 + (T.autoMille / 600) * 40 + EC.quotaIndustria * 30 - puliziaTecnologica - beneficioVerde;
    ENV.inquinamento = clamp((ENV.inquinamento + (target - ENV.inquinamento) * 0.25) * E.modFactor(S, 'inquinamentoFattore', 1, 'prodotto'), 10, 100);

    ENV.verdeHa += Math.max(0, 2 + 18 * D.popolazione / 1e6) * E.modFactor(S, 'verdeFattore', 1, 'prodotto');
    ENV.verdePerCapita = ENV.verdeHa * 10000 / Math.max(1, D.popolazione);

    const eg = 0.022 * (EC.crescitaPil || 1) / 3 + (S.year > 1985 ? -0.004 : 0) + E.modFactor(S, 'energiaPerAnno', 0);
    ENV.energia = clamp(ENV.energia + eg, 0.35, 2.2);
    ENV.emissioni = ENV.energia * (0.55 + 0.45 * EC.quotaIndustria) + (T.autoMille / 600) * 0.35;
    ENV.consumoSuolo += 0;
  }

  // ————— SOCIETÀ —————
  function stepSociale(S) {
    const SOC = S.systems.sociale, T = S.systems.trasporti, ENV = S.systems.ambiente;
    const D = S.systems.demografia, EC = S.systems.economia;

    let target = 52
      + 10 * (SOCservizi(S) - 0.45)
      - 20 * (ENV.inquinamento / 100 - 0.42)
      + 6 * clamp((ENV.verdePerCapita - 6) / 8, -1, 1.4)
      - 16 * Math.max(0, T.congestione - 0.55)
      - 1.2 * Math.max(0, T.tempiMin - 24)
      - 24 * Math.max(0, EC.disoccupazione - 0.05)
      + 8 * Math.max(0, 1 - SOC.disuguaglianza / 55)
      + 6 * Math.max(0, (T.accessibilita - 0.45) * 4)
      + (SOC.abitazioniAdeguate < 0.95 ? (SOC.abitazioniAdeguate - 0.95) * 60 : 2);
    target = clamp(target, 10, 92);

    SOC.qol += (target - SOC.qol) * 0.25 + E.modFactor(S, 'qolPerAnno', 0);
    SOC.qol = clamp(SOC.qol, 12, 95);

    SOC.disuguaglianza = clamp(
      SOC.disuguaglianza + (EC.disoccupazione - 0.05) * 30 - (SOC.servizi - 0.45) * 4 + E.modFactor(S, 'disuguaglianzaPerAnno', 0),
      14, 75
    );
    SOC.soddisfazione = clamp(0.25 + SOC.qol / 130 + (0.05 - EC.disoccupazione) * 1.5, 0, 1);
  }
  function SOCservizi(S) { return S.systems.sociale.servizi; }

  // ————— POLITICA —————
  function stepPolitica(S) {
    const P = S.systems.politica, SOC = S.systems.sociale, EC = S.systems.economia;
    const inCantiere = E.progettiInCorso(S).length;
    const saldo = S.finanza ? S.finanza.saldo : 0;
    const target = 50 + (SOC.qol - 58) * 0.55 + (0.05 - EC.disoccupazione) * 120 + (saldo < 0 ? -2 : 1.5) - inCantiere * 1.5;
    P.approvazione += (target - P.approvazione) * 0.25 + (PAR.rng() * 2 - 1) * 1.5;
    P.approvazione = clamp(P.approvazione, 8, 92);
    P.stabilita = clamp(P.stabilita + (P.approvazione - 50) / 500, 0.15, 1);
    Object.keys(P.stakeholders).forEach(k => { P.stakeholders[k] *= 0.97; });
  }

  // ————— FINANZA —————
  function stepFinanza(S) {
    const EC = S.systems.economia, D = S.systems.demografia;
    const speseF = E.modFactor(S, 'speseFattore', 1, 'prodotto');
    const ricavi = 0.0228 * EC.pil + 8 + D.popolazione * 0.000012;
    const speseBase = D.popolazione * 0.000052 * (1 + (D.fasce.anziani - 0.11)) * speseF;
    const welfare = EC.occupati * EC.disoccupazione * 0.00016;
    const mantiene = mantenimentiTotali(S);
    const speseProgetti = costoAnnuiInCorso(S);
    const interessi = S.debt * 0.05;
    const spese = speseBase + welfare + mantiene + speseProgetti + interessi;
    const saldo = ricavi - spese;

    S.finanza = { ricavi: ricavi, spese: spese, saldo: saldo, mantenimenti: mantiene, interessi: interessi, speseProgetti: speseProgetti, speseBase: speseBase, welfare: welfare };

    if (saldo > 0) {
      const rimborso = Math.min(S.debt, saldo * 0.5);
      S.treasury += saldo - rimborso;
      S.debt -= rimborso;
    } else {
      const buco = -saldo;
      const daCassa = Math.min(S.treasury, buco);
      S.treasury -= daCassa;
      S.debt += buco - daCassa;
    }
  }

  // ————— TRIGGER: decisioni ed eventi —————
  function stepTrigger(S) {
    E.decisioni.forEach(dec => {
      const giaPreso = S.decisionsTaken.filter(x => x === dec.id).length;
      const limite = dec.maxRipetizioni || 1;
      if (giaPreso >= limite) return;
      if (dec.anno > 0 && S.year < dec.anno) return;
      if (dec.minYear && S.year < dec.minYear) return;
      if (dec.maxYear && S.year > dec.maxYear) return;
      if (dec.condizione && !dec.condizione(S)) return;
      if (S.pendingDecisions.some(p => p.id === dec.id)) return;
      S.pendingDecisions.push({ id: dec.id, anno: S.year });
    });

    E.eventi.forEach(ev => {
      if (ev.soloOltre2000 && S.year <= S.endYear) return;
      if (S.eventCd[ev.id] !== undefined && S.year - S.eventCd[ev.id] < (ev.cooldownAnni || 5)) return;
      if (S.eventFired[ev.id] && !ev.annoFisso) return;
      let scatta = false;
      if (ev.annoFisso) scatta = S.year >= ev.annoFisso;
      else if (ev.condizione && ev.condizione(S)) scatta = PAR.rng() < 0.5;
      if (scatta && S.activeEvents.length + S.pendingEvents.length < 3) {
        S.eventFired[ev.id] = true;
        S.eventCd[ev.id] = S.year;
        S.pendingEvents.push(ev.id);
        S.yearReport.eventi.push({ titolo: ev.titolo, evento: ev.id });
      }
    });
  }

  // ————— MILESTONE STORICHE —————
  function stepMilestone(S) {
    E.scenario.milestone.forEach(m => {
      if (S.year < m.year || m.fired) return;
      if (m.soloOltre2000 && S.year <= S.endYear) return;
      m.fired = true;
      if (m.tag === 'EVENTO' && m.evento) {
        if (!S.decisionsTaken.includes(m.evento) && !S.pendingDecisions.some(p => p.id === m.evento)) {
          S.pendingDecisions.push({ id: m.evento, anno: S.year });
          S.decisionsTaken.push(m.evento);
        }
      } else {
        E.timelineAdd(S, { year: S.year, kind: 'storico', tag: 'STORICO', titolo: m.titolo, testo: m.testo });
        S.yearReport.milestone.push({ titolo: m.titolo, testo: m.testo, tag: 'STORICO' });
      }
    });
  }

  // ————— ANNO COMPLETO —————
  E.simulateYear = function (S) {
    E.ensure(S);
    S.year += 1;
    S.yearReport = { anno: S.year, completati: [], eventi: [], decisioni: [], milestone: [], noteEconomia: [], noteTerritorio: [], divergenze: 0 };

    stepProgetti(S);
    stepEconomia(S);
    stepDemografia(S);
    stepTerritorio(S);
    stepTrasporti(S);
    stepAmbiente(S);
    stepSociale(S);
    stepPolitica(S);
    stepFinanza(S);
    stepTrigger(S);
    stepMilestone(S);

    S.mods.forEach(m => {
      if (m.scadenza !== undefined && m.scadenza !== null && m.scadenza < S.year) m.effetti = {};
    });

    E.snapshot(S);
    S.rngState = PAR._rng.state();
    S.log.push('anno ' + S.year + ' simulato');
    return S.yearReport;
  };

  E.avanzaFinoAVerifica = function (S, nMax) {
    const report = [];
    for (let i = 0; i < nMax; i++) {
      if (S.year >= S.endYear) break;
      if (S.pendingDecisions.length || S.activeEvents.length) break;
      report.push(E.simulateYear(S));
      if (S.pendingEvents.length) {
        S.activeEvents = S.pendingEvents.slice();
        S.pendingEvents = [];
        break;
      }
      if (S.pendingDecisions.length) break;
    }
    return report;
  };

  // ————— DATI DERIVATI PER LA UI —————
  E.derived = function (S) {
    const D = S.systems.demografia, EC = S.systems.economia, T = S.systems.trasporti;
    const ENV = S.systems.ambiente, SOC = S.systems.sociale, P = S.systems.politica;
    return {
      popolazione: D.popolazione, areaMetropolitana: D.areaMetropolitana,
      densita: D.popolazione / 13000,
      pil: EC.pil, occupati: EC.occupati, disoccupazione: EC.disoccupazione,
      diverseEC: EC.diversificazione,
      autoMille: T.autoMille, shareAuto: T.shareAuto, shareTpubb: T.shareTpubb,
      shareAttivo: T.shareAttivo, congestione: T.congestione, tempiMin: T.tempiMin,
      qualita: T.qualita, accessibilita: T.accessibilita,
      metroKm: T.metroKm, tramKm: T.tramKm, railKm: T.railKm, capacitaPubblico: T.capacitaPubblico,
      inquinamento: ENV.inquinamento, verdePerCapita: ENV.verdePerCapita || 0,
      energia: ENV.energia, emissioni: ENV.emissioni, consumoSuolo: ENV.consumoSuolo,
      qol: SOC.qol, servizi: SOC.servizi, disuguaglianza: SOC.disuguaglianza,
      abitazioniAdeguate: SOC.abitazioniAdeguate,
      approvazione: P.approvazione, stabilita: P.stabilita,
      cassa: S.treasury, debito: S.debt, saldo: S.finanza ? S.finanza.saldo : 0
    };
  };

  E.snapshot = function (S) {
    const v = E.derived(S);
    S.history.push(Object.assign({ year: S.year }, v));
  };

  // ————— RAPPORTO FINALE —————
  E.classificaFinale = function (S) {
    const sc = E.scenario;
    const last = S.history[S.history.length - 1];
    const first = S.history[0];
    const baseY = S.year;
    const base = {
      pop: PAR.baseValue(sc.baseline.popolazione, baseY),
      auto: PAR.baseValue(sc.baseline.autoMille, baseY),
      tpubb: PAR.baseValue(sc.baseline.shareTpubb, baseY),
      poll: PAR.baseValue(sc.baseline.inquinamento, baseY),
      verde: PAR.baseValue(sc.baseline.verdePerCapita, baseY),
      disocc: PAR.baseValue(sc.baseline.disoccupazione, baseY)
    };
    const V = {
      autoDep: (last.autoMille / 600) * last.shareAuto,
      transitScore: last.shareTpubb,
      verde: clamp(last.verdePerCapita / 15, 0, 1.5),
      ecoBonus: last.pil / (3600),
      sociale: clamp((100 - last.disuguaglianza) / 100 + last.servizi * 0.6, 0, 1.4),
      industrial: last.metroKm === 0 ? 0.2 : 0.4,
      ideale3: 0
    };
    const dims = {
      economia: clamp(40 + (last.pil / first.pil - 2.2) * 25 + (base.eco ? 0 : 0), 5, 98),
      ambiente: clamp(18 + (130 - last.inquinamento) * 0.75 + last.verdePerCapita * 1.6 - last.energia * 8, 0, 98),
      accessibilita: clamp(30 + last.accessibilita * 60 - last.tempiMin * 1.2, 0, 98),
      equitaSociale: clamp(92 - last.disuguaglianza * 1.3 + last.servizi * 22, 0, 98),
      abitazione: clamp(45 + (last.abitazioniAdeguate - 0.85) * 140, 0, 98),
      tenutaFinanziaria: clamp(72 - last.cassa < 0 ? 40 : 72 - (last.debito / 400) * 45 + (last.saldo > 0 ? 6 : -6), 0, 98),
      tenutaFinanziaria2: 0,
      resilienza: clamp(30 + last.diverseEC * 65 - last.disoccupazione * 400, 0, 98)
    };
    delete dims.tenutaFinanziaria2;
    dims.tenutaFinanziaria = clamp(72 - (last.debito / 420) * 50 + (last.saldo > 0 ? 6 : -8) + (last.cassa > 40 ? 5 : 0), 0, 98);

    let best = sc.archetipi[0], bestScore = -1e9;
    const punteggi = {
      autoDep: (last.autoMille / 600) * last.shareAuto * 3,
      transitScore: (last.shareTpubb - 0.3) * 3,
      geens: clamp(last.verdePerCapita / 12, 0, 2),
      ecoBonus: last.pil / 4200,
      sociale: (1 - last.disuguaglianza / 75) + last.servizi * 0.25,
      policentrico: 0,
      industrial: last.quotaIndustria !== undefined ? 0 : 0
    };
    punteggi.policentrico = punteggi.transitScore * 0.25 + punteggi.sociale * 0.25 + punteggi.geens * 0.25 - (last.autoMille / 600) * 0.25;
    sc.archetipi.forEach(a => {
      let s = -1;
      if (a.id === 'auto') s = punteggi.autoDep * 2 - punteggi.transitScore - punteggi.geens;
      if (a.id === 'transit') s = punteggi.transitScore * 2.5 + punteggi.geens * 0.5 - punteggi.autoDep;
      if (a.id === 'ideale1') s = punteggi.geens * 1.4 + punteggi.transitScore + punteggi.sociale * 0.6 - punteggi.autoDep * 1.2;
      if (a.id === 'policentrica') s = punteggi.policentrico * 2.4;
      if (a.id === 'fabbrica') s = (last.quotaIndustria !== undefined ? 0 : 0) + ((S.systems.economia.quotaIndustria > 0.25 ? 1 : 0.4) * punteggi.ecoBonus * 2 - punteggi.transitScore * 0.3);
      if (a.id === 'ideale2') s = 2.2 - Math.abs(punteggi.ecoBonus - 1.1) * 2 - Math.abs(punteggi.autoDep - 0.7) - Math.abs(punteggi.transitScore);
      if (a.id === 'divisa') s = punteggi.ecoBonus * 2.4 - punteggi.sociale * 2.6;
      if (a.id === 'bruciata') s = -punteggi.ecoBonus * 2 - punteggi.transitScore * 0.5 + (last.disoccupazione > 0.1 ? 1 : 0);
      if (s > bestScore) { bestScore = s; best = a; }
    });

    return {
      archetipo: best, dims: dims,
      confronto: {
        pop: { giocatore: last.popolazione, base: base.pop },
        auto: { giocatore: Math.round(last.autoMille), base: Math.round(base.auto) },
        tpubb: { giocatore: Math.round(last.shareTpubb * 100), base: Math.round(base.tpubb) },
        poll: { giocatore: Math.round(last.inquinamento), base: Math.round(base.poll) },
        verde: { giocatore: +(last.verdePerCapita).toFixed(1), base: +base.verde.toFixed(1) },
        disocc: { giocatore: +(last.disoccupazione * 100).toFixed(1), base: +base.disocc.toFixed(1) }
      },
      anniSimulati: S.history.length
    };
  };
})();
