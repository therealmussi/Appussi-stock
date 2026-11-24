'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const EN = E.Engine;
  const D = E.Core, DATA = E.DATA, P = E.People;

  /* ============================================================= */
  /* MENSILE: SOLDI, IMPRESE, GIORNALE                              */
  /* ============================================================= */
  EN.monthly = function (S) {
    let employed = 0, adults = 0;
    for (const c of Object.values(S.citizens)) {
      if (!c.alive || c.abroad) continue;
      const age = D.age(c, S.dayIndex * D.MPD);
      if (age >= 18 && !c.retired && c.eduStage !== 'studente') { adults++; if (c.job) employed++; }
      const inc = c.income || 0;
      const kidsAlive = c.children.filter(id => S.citizens[id] && S.citizens[id].alive).length;
      const cost = 900 + kidsAlive * 420;
      c.savings = Math.max(0, Math.round(c.savings + (inc - cost) * (1 + c.tend.riskTol / 500)));
    }
    S.stats.counters.unemploymentLast = adults ? 1 - employed / adults : 0;

    const G = 50 + 34 * Math.sin(S.dayIndex / 900) + S.rng.int(-5, 5);
    for (const b of S.buildings) {
      if (!b.business || b.business.closed) continue;
      const employees = b.jobs.filter(j => j.citizen !== null).length;
      let h = b.business.health + (G - b.business.health) * 0.13 + (S.rng.next() * 2 - 1) * 5;
      if (employees === 0) h -= 5;
      b.business.health = D.clamp(Math.round(h), 0, 100);
    }
    const struggling = S.buildings.filter(b => b.business && !b.business.closed && b.business.health < 14);
    if (struggling.length && S.rng.chance(0.45)) EN.closeBusiness(S, struggling[0]);
    for (const b of S.buildings) {
      if (!b.business || b.business.closed || b.business.health >= 25) continue;
      if (S.rng.chance(0.25)) {
        const busy = b.jobs.filter(j => j.citizen !== null);
        if (busy.length) {
          const j = busy[S.rng.int(0, busy.length - 1)];
          const c = S.citizens[j.citizen];
          if (c) EN.leaveJob(S, c, 'Licenziamento da ' + b.name + ': l’attività attraversa una crisi.');
        }
      }
    }
    const healthy = S.buildings.filter(b => b.business && !b.business.closed && b.business.health > 60).length;
    if (healthy >= 4 && S.rng.chance(0.35)) EN.openBusiness(S);
    const homes = EN.homes(S);
    const capUsed = homes.reduce((s, b) => s + b.residents.length, 0);
    const capTot = homes.reduce((s, b) => s + b.cap, 0);
    if (capTot - capUsed < 8 && S.rng.chance(0.5)) EN.buildHomes(S);

    EN.publishIssue(S);
    S.funds += 9000 + Math.round((1 - (S.stats.counters.unemploymentLast || 0)) * 4000);
    EN.relMaintenance(S);
  };

  EN.relMaintenance = function (S) {
    const day = S.dayIndex;
    for (const c of Object.values(S.citizens)) {
      if (!c.alive) continue;
      const act = new Set();
      for (const k in c.rels) {
        const r = c.rels[k];
        const o = S.citizens[k];
        if (!o || !r) continue;
        if (['Famiglia', 'Coniuge', 'Fratello/Sorella'].includes(r.type)) continue;
        if (day - r.last > 540 && r.aff < 36 && ['Amico', 'Amico stretto'].includes(r.type)) {
          r.type = 'Conosciuto';
          if (o.rels[c.id]) o.rels[c.id].type = 'Conosciuto';
        }
        if (day - r.last > 3650 && r.aff < 10 && !S.citizens[k].alive) delete c.rels[k];
        if ((day - r.last) <= 120 || ['Interesse romantico', 'Coppia', 'Fidanzati', 'Coniuge'].includes(r.type)) act.add(k);
      }
      c._active = act;
    }
  };

  EN.closeBusiness = function (S, b) {
    b.business.closed = S.dayIndex;
    S.history.closedB.push({ id: b.id, name: b.name, hood: b.hood, day: S.dayIndex, type: b.type });
    const laid = [];
    for (const j of b.jobs) {
      if (j.citizen !== null) {
        const c = S.citizens[j.citizen];
        if (c) { EN.leaveJob(S, c, b.name + ' chiude: resta senza lavoro.'); laid.push(c.id); }
        j.citizen = null;
      }
    }
    EN.rebuildPools(S);
    EN.logEvent(S, 'economia', '🏭 ' + b.name + ' (' + (DATA.BUILDING_LABELS[b.type] || b.type) + ') chiude definitivamente a ' + DATA.HOOD_BY_ID[b.hood].name + '.', laid, 8);
    for (const c of Object.values(S.citizens)) {
      if (!c.alive || c.abroad) continue;
      const h = S.buildingsById[c.homeId];
      if (h && h.hood === b.hood) EN.pushMemory(S, c, S.dayIndex, 'La chiusura di ' + b.name + ' nel mio quartiere.', 6);
    }
  };

  EN.openBusiness = function (S) {
    const rng = S.rng;
    const hood = rng.pick(['old-town', 'riverside', 'business', 'university', 'suburbs']);
    const type = rng.pick(['negozio', 'ristorante', 'bar', 'ufficio', 'laboratorio']);
    const names = DATA.BUSINESS_NAMES[type] || ['Nuova attività'];
    const existing = S.buildings.filter(b => b.hood === hood && b.type !== 'casa' && b.type !== 'parco');
    let x, y;
    if (existing.length) {
      const ref = rng.pick(existing);
      x = D.clamp(ref.x + ref.w + 14, 20, DATA.W - 100);
      y = D.clamp(ref.y + ref.h + 8, 60, DATA.H - 90);
    } else { x = rng.int(60, 600); y = rng.int(420, 700); }
    const b = {
      id: 'n' + S.dayIndex + '-' + S.nextEventId, type, hood,
      x, y, w: type === 'ufficio' ? 80 : 62, h: type === 'ufficio' ? 66 : 50,
      name: rng.pick(names), cap: 0, residents: [],
      jobs: (DATA.JOB_TABLE[type] || []).map(k => ({ title: k.t, edu: k.e, wage: k.w, citizen: null })),
      business: { health: rng.int(50, 72), founded: S.dayIndex, closed: null }
    };
    EN.attachBuilding(S, b);
    EN.logEvent(S, 'economia', '🎉 Apre ' + b.name + ' a ' + DATA.HOOD_BY_ID[hood].name + ': ' + b.jobs.length + ' nuovi posti di lavoro.', [], 7);
    const unemployed = Object.values(S.citizens).filter(c => c.alive && !c.abroad && !c.job && !c.retired && D.age(c, S.dayIndex * D.MPD) >= 18 && c.eduStage === 'adulto');
    for (const c of unemployed) {
      const ix = b.jobs.findIndex(j => j.citizen === null && j.edu <= c.edu.level);
      if (ix >= 0 && S.rng.chance(0.4)) {
        EN.hire(S, c, b, ix, S.rng);
        EN.logEvent(S, 'lavoro', '💼 ' + c.name + ' ' + c.surname + ' inizia a lavorare come ' + c.job.title + ' a ' + b.name + '.', [c.id], 5);
        E.Bio.record(S, c, 'Inizia a lavorare come ' + c.job.title + ' a ' + b.name + '.', '💼', 6, 'job');
      }
    }
    return b;
  };

  EN.buildHomes = function (S) {
    const rng = S.rng;
    const hood = rng.pick(['riverside', 'suburbs', 'old-town', 'university']);
    const n = 1 + rng.int(0, 1);
    for (let i = 0; i < n; i++) {
      const b = {
        id: 'n' + S.dayIndex + 'h' + i, type: 'casa', hood,
        x: rng.int(80, DATA.W - 140), y: rng.int(60, DATA.H - 120),
        w: 64, h: 46, name: 'Residenza ' + rng.pick(DATA.STREET_NAMES), cap: rng.int(3, 6),
        residents: [], jobs: [], business: null
      };
      EN.attachBuilding(S, b);
      EN.logCity(S, 'Nuova palazzina a ' + DATA.HOOD_BY_ID[hood].name + ': ' + b.name + '.', 6);
    }
  };

  /* ============================================================= */
  /* ANNO: migrazione e statistiche                                 */
  /* ============================================================= */
  EN.yearly = function (S) {
    const rng = S.rng;
    for (const c of Object.values(S.citizens)) {
      if (!c.alive || c.abroad) continue;
      const age = D.age(c, S.dayIndex * D.MPD);
      if (age < 19 || age > 42) continue;
      const p = (c.job ? 0.006 : 0.05) + (c.satisfaction < 40 ? 0.02 : 0) + ((S.stats.counters.unemploymentLast || 0) > 0.18 ? 0.03 : 0);
      if (rng.chance(p)) EN.emigrate(S, c, S.dayIndex);
    }
    const vac = EN.vacancies(S, 4).length;
    const freeHomes = EN.homesWithSpace(S).length;
    const inN = freeHomes >= 3 ? Math.min(12, Math.max(0, Math.round(vac * 0.25 + rng.int(0, 4)))) : 0;
    for (let i = 0; i < inN; i++) EN.migrateIn(S, rng);
    EN.commitYearStats(S, false);
  };

  EN.migrateIn = function (S, rng) {
    const free = EN.homesWithSpace(S);
    if (!free.length) return;
    const home = rng.pick(free);
    const c = P.newCitizen(rng, { sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(20 * 365, 48 * 365), surname: rng.pick(DATA.SURNAMES) });
    S.citizens[c.id] = c;
    c._plan = null;
    E.Bio.initTimeline(S, c);
    c.homeId = home.id; home.residents.push(c.id);
    c.originHood = home.hood;
    c.eduStage = 'adulto';
    EN.findJob(S, c, rng);
    EN.logEvent(S, 'città', '🚆 ' + c.name + ' ' + c.surname + ' si trasferisce a ' + DATA.CITY_NAME + ' (' + DATA.HOOD_BY_ID[home.hood].name + ')' + (c.job ? ', ' + c.job.title : '') + '.', [c.id], 5);
    E.Bio.record(S, c, 'Arriva a ' + DATA.CITY_NAME + ' da fuori città.', '🚆', 7, 'move');
    S.stats.counters.migrationIn = (S.stats.counters.migrationIn || 0) + 1;
    if (rng.chance(0.25)) {
      const p = P.newCitizen(rng, { sex: c.sex === 'M' ? 'F' : 'M', birthIdx: c.birthIdx + rng.int(-1500, 1500), surname: c.surname });
      S.citizens[p.id] = p;
      p._plan = null;
      E.Bio.initTimeline(S, p);
      p.homeId = home.id; home.residents.push(p.id);
      p.originHood = home.hood;
      p.eduStage = 'adulto';
      P.setRel(S, c, p, 'Coppia', 65 + rng.int(0, 20));
      c.partner = p.id; p.partner = c.id; c.coupleSince = p.coupleSince = S.dayIndex;
      EN.findJob(S, p, rng);
      EN.logEvent(S, 'città', '🚆 ' + p.name + ' ' + p.surname + ' arriva a ' + DATA.CITY_NAME + ' con ' + c.name + '.', [p.id], 5);
      E.Bio.record(S, p, 'Arriva a ' + DATA.CITY_NAME + ' con ' + c.name + ' ' + c.surname + '.', '🚆', 7, 'move');
      S.stats.counters.migrationIn = (S.stats.counters.migrationIn || 0) + 1;
    }
  };

  EN.commitYearStats = function (S, atStart) {
    const d = D.dateFromMinutes(Math.max(0, S.minutes - 1));
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);
    const employed = live.filter(c => c.job).length;
    const adults = live.filter(c => D.age(c, S.minutes) >= 18 && !c.retired && c.eduStage !== 'studente');
    const unemployment = adults.length ? 1 - adults.filter(c => c.job).length / adults.length : 0;
    let iso = 0;
    for (const c of live) if (EN.closeOnes(S, c, 1).length === 0) iso++;
    const hoodPop = {};
    for (const c of live) {
      const h = S.buildingsById[c.homeId];
      if (h) hoodPop[h.hood] = (hoodPop[h.hood] || 0) + 1;
    }
    const snap = {
      year: d.year, dayIndex: S.dayIndex, pop: live.length,
      births: S.stats.counters.births || 0,
      deaths: S.stats.counters.deaths || 0,
      marriages: S.stats.counters.marriages || 0,
      migrationIn: S.stats.counters.migrationIn || 0,
      migrationOut: S.stats.counters.migrationOut || 0,
      employed, unemployment,
      avgIncome: live.length ? Math.round(live.reduce((s, c) => s + (c.income || 0), 0) / live.length) : 0,
      avgSatisfaction: live.length ? +(live.reduce((s, c) => s + c.satisfaction, 0) / live.length).toFixed(1) : 0,
      avgSavings: live.length ? Math.round(live.reduce((s, c) => s + c.savings, 0) / live.length) : 0,
      isolated: iso, hoodPop,
      businessesOpen: S.buildings.filter(b => b.business && !b.business.closed).length,
      homesTotal: EN.homes(S).length
    };
    S.stats.yearly.push(snap);
    if (!atStart) {
      S.stats.counters.births = 0; S.stats.counters.deaths = 0;
      S.stats.counters.marriages = 0; S.stats.counters.migrationIn = 0;
      S.stats.counters.migrationOut = 0;
    }
    return snap;
  };

  /* ============================================================= */
  /* GIORNALE                                                       */
  /* ============================================================= */
  EN.publishIssue = function (S) {
    const since = S.news.length ? S.news[0].day : S.dayIndex - 40;
    const evs = S.events.filter(e => e.day > since && e.imp >= 6);
    const articles = [];
    const d = D.dateFromMinutes(S.minutes - 1);
    const deaths = evs.filter(e => e.txt.indexOf('🕯') === 0);
    if (deaths.length) articles.push({ h: 'In memoria', b: deaths.slice(0, 4).map(e => e.txt.replace(/🕯️?\s*/, '')).join(' '), k: 'città' });
    const weddings = evs.filter(e => e.txt.indexOf('💍 Matrimonio') === 0);
    if (weddings.length) articles.push({ h: 'Cuori a Northbridge', b: weddings.slice(0, 3).map(w => w.txt.replace('💍 ', '')).join(' '), k: 'amore' });
    const births = evs.filter(e => e.txt.indexOf('👶') === 0);
    if (births.length >= 2) articles.push({ h: 'Benvenuti al mondo', b: births.slice(0, 3).map(w => w.txt.replace('👶 ', '')).join(' ') + ' (' + births.length + ' nascite nel mese.)', k: 'famiglia' });
    for (const e of evs.filter(e => e.k === 'economia').slice(0, 2)) articles.push({ h: 'Economia locale', b: e.txt.replace(/^(🏭|🎉) /, ''), k: 'economia' });
    const jobs = evs.filter(e => e.k === 'lavoro');
    if (jobs.length >= 3) articles.push({ h: 'Lavoro', b: jobs.slice(0, 3).map(j => j.txt.replace(/^(📈|🔄|💼) /, '')).join(' '), k: 'lavoro' });
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);
    if (live.length) articles.push({
      h: 'La città in numeri',
      b: live.length + ' abitanti censiti. ' + live.filter(c => c.job).length + ' occupati. Soddisfazione media: ' + Math.round(live.reduce((s, c) => s + c.satisfaction, 0) / live.length) + '/100.'
    });
    let title = 'Cronache di Northbridge — ' + d.day + '/' + d.month + '/' + d.year;
    const biggest = evs.slice().sort((a, b) => b.imp - a.imp)[0];
    if (biggest) title = biggest.txt.replace(/^(🕯️|💍|👶|🏭|🎉|📈|🧳|🚆|💔|❤️|✨|🤝) /, '').slice(0, 90);
    S.news.unshift({ day: S.dayIndex, date: d.day + '/' + d.month + '/' + d.year, title, articles });
    if (S.news.length > 80) S.news.pop();
  };

  /* ============================================================= */
  /* INTERVENTI DELLA CITTÀ (opzionali)                             */
  /* ============================================================= */
  EN.intervene = function (S, id) {
    if (S.observerMode) return { ok: false, msg: 'Modalità osservatore: nessun intervento possibile.' };
    const def = DATA.INTERVENTIONS.find(i => i.id === id);
    if (!def) return { ok: false, msg: 'Intervento sconosciuto.' };
    const day = S.dayIndex;
    if (S.funds < 10000) return { ok: false, msg: 'Fondo civico insufficiente: aspetta le entrate mensili.' };
    S.interventions.push({ id, day, name: def.name });
    if (id === 'evento') {
      S.effects.push({ id, until: day + 90, happinessBoost: 5 });
      EN.logCity(S, 'Le feste di quartiere animano la città: contentezza in aumento.', 6);
    } else if (id === 'centro') {
      const b = {
        id: 'p' + day + '-cc', type: 'centro', hood: 'old-town',
        x: 660, y: 900, w: 90, h: 60,
        name: DATA.BUSINESS_NAMES.centro[day % 3], cap: 0, residents: [],
        jobs: [{ title: 'Coordinatore culturale', edu: 3, wage: 2400, citizen: null }, { title: 'Addetto', edu: 1, wage: 1600, citizen: null }],
        business: { health: 80, founded: day, closed: null }
      };
      EN.attachBuilding(S, b);
      S.effects.push({ id, until: day + 3650, happinessBoost: 3 });
      EN.logCity(S, b.name + ' apre nel Centro Storico: un nuovo luogo per la comunità.', 8);
    } else if (id === 'scuola') {
      S.effects.push({ id, until: day + 3650, eduBoost: true });
      EN.logCity(S, 'Le scuole di Northbridge ricevono nuovi fondi.', 6);
    } else if (id === 'trasporti') {
      S.effects.push({ id, until: day + 1825, happinessBoost: 3 });
      EN.logCity(S, 'La nuova linea di autobus collega meglio i quartieri.', 6);
    } else if (id === 'parco') {
      const hood = S.rng.pick(['suburbs', 'riverside']);
      const b = {
        id: 'p' + day + '-pk', type: 'parco', hood,
        x: 700, y: 915, w: 130, h: 60,
        name: DATA.BUSINESS_NAMES.parco[day % 3], cap: 0, residents: [],
        jobs: [], business: null
      };
      EN.attachBuilding(S, b);
      EN.logCity(S, b.name + ' apre a ' + DATA.HOOD_BY_ID[hood].name + '.', 7);
    } else if (id === 'aiuto') {
      const struggling = S.buildings.filter(b => b.business && !b.business.closed && b.business.health < 35);
      for (const b of struggling.slice(0, 4)) {
        b.business.health = D.clamp(b.business.health + 25, 0, 100);
        EN.logCity(S, 'Il fondo civico aiuta ' + b.name + ' a restare aperto.', 6);
      }
    }
    return { ok: true, msg: def.name + ' — fatto. ' + def.eff };
  };

  EN.attachBuilding = function (S, b) {
    S.buildings.push(b);
    S.buildingsById[b.id] = b;
    S.history.newB.push({ id: b.id, name: b.name, hood: b.hood, day: S.dayIndex, type: b.type });
    EN.rebuildPools(S);
  };

  EN.logEvent = function (S, k, txt, ids, imp) {
    S.events.push({ id: S.nextEventId++, day: S.dayIndex, k, txt, ids: ids || [], imp: imp || 4 });
  };
  EN.logCity = function (S, txt, imp) { EN.logEvent(S, 'città', txt, [], imp || 5); };

  /* Versione compatta per il salvataggio: taglia i dettagli meno importanti
     (eventi vecchi, conoscenze deboli, timeline stagionali) restando sotto il
     limite di localStorage anche dopo decenni simulati. */
  const STRONG_RELS = ['Coniuge', 'Coppia', 'Fidanzati', 'Interesse romantico', 'Famiglia', 'Fratello/Sorella', 'Amico', 'Amico stretto', 'Ex', 'Ex coniuge', 'Rivalità'];
  EN.compactForSave = function (S) {
    const out = D.stripEphemeral(S);
    if (out.events && out.events.length > 2000) out.events = out.events.slice(-2000);
    if (out.news && out.news.length > 40) out.news = out.news.slice(0, 40);
    for (const id in out.citizens) {
      const c = out.citizens[id];
      if (c.memories && c.memories.length > 20) {
        c.memories = c.memories.slice().sort((a, b) => b.imp - a.imp).slice(0, 20);
      }
      if (c.rels) {
        for (const oid in c.rels) {
          const r = c.rels[oid];
          const strong = STRONG_RELS.indexOf(r.type) !== -1;
          const last = r.last || r.met || 0;
          if (strong) {
            if (r.aff < 18 && last < S.dayIndex - 3650) delete c.rels[oid];
          } else {
            const warm = r.aff >= 48;
            const fresh = r.aff >= 30 && last >= S.dayIndex - 365;
            if (!warm && !fresh) delete c.rels[oid];
          }
        }
        let keys = Object.keys(c.rels);
        if (keys.length > 40) {
          keys.sort((a, b) => c.rels[b].aff - c.rels[a].aff);
          const keepSet = new Set(keys.slice(0, 70));
          for (const oid in c.rels) if (!keepSet.has(oid)) delete c.rels[oid];
        }
      }
      if (c.timeline) {
        const tCut = S.dayIndex - 730;
        c.timeline = c.timeline.filter(t => t.k !== 'evento' && t.k !== 'social' || t.d >= tCut || t.k === 'birth');
      }
    }
    if (out.effects) out.effects = out.effects.filter(e => e.until > S.dayIndex);
    return out;
  };

  EN.revive = function (raw) {
    const S = raw;
    S.rng = new D.RNG((S.seed + Math.imul(S.dayIndex + 1, 2654435761) + 7) >>> 0);
    S.buildingsById = {};
    for (const b of S.buildings) S.buildingsById[b.id] = b;
    for (const c of Object.values(S.citizens)) c._plan = null;
    EN.rebuildPools(S);
    EN.initActive(S);
    S.nextId = 1 + Object.values(S.citizens).reduce((m, c) => Math.max(m, c.id), 0);
    return S;
  };
})(window.EHL);
