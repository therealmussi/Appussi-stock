'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const EN = E.Engine = {};
  const D = E.Core, DATA = E.DATA, P = E.People;

  EN.ACT_LABELS = {
    dorme: 'Dorme', casa: 'A casa', lavoro: 'Lavora', scuola: 'A lezione', uni: 'Studia',
    spesa: 'Fa la spesa', bar: 'È al bar', ristorante: 'È al ristorante', parco: 'Passeggia',
    piazza: 'Sta in piazza', sport: 'Si allena', amici: 'Sta con gli amici', famiglia: 'In famiglia',
    chiesa: 'Alla messa', biblioteca: 'In biblioteca', mercato: 'Al mercato', pranzo: 'Pranza fuori',
    volontariato: 'Volontariato', fuori: 'Girovaga per la città'
  };
  EN.SOCIAL_ACTS = ['bar', 'ristorante', 'parco', 'piazza', 'campo', 'chiesa', 'mercato', 'amici'];

  /* ============================================================= */
  /* NUOVA PARTITA                                                  */
  /* ============================================================= */
  EN.newState = function (seed) {
    const rng = new D.RNG(seed >>> 0);
    const S = {
      seed: seed >>> 0, rng,
      minutes: 0, dayIndex: 0,
      citizens: {},
      buildings: [], buildingsById: {},
      events: [], nextEventId: 1,
      news: [],
      history: { deceased: [], closedB: [], newB: [] },
      stats: { yearly: [], counters: {} },
      interventions: [], effects: [],
      observerMode: false, followId: null,
      funds: 400000,
      version: 1
    };
    P.resetId();
    S.buildings = DATA.layout(rng);
    S.buildingsById = {};
    for (const b of S.buildings) S.buildingsById[b.id] = b;
    EN.rebuildPools(S);

    P.seedPopulation(S, rng, 120);
    EN.initEducation(S);
    EN.assignInitialJobs(S, rng);
    P.seedSocial(S, rng);
    EN.initActive(S);
    EN.initRetired(S);
    for (const c of Object.values(S.citizens)) {
      BIO_INIT(S, c);
      c.income = EN.personalIncome(c);
    }
    EN.commitYearStats(S, true);
    EN.logCity(S, 'La simulazione ha inizio: ' + DATA.CITY_NAME + ', 1 gennaio ' + D.START_YEAR + '. ' + Object.keys(S.citizens).length + ' cittadini presi singolarmente in carico.', 8);
    return S;
  };
  function BIO_INIT(S, c) { E.Bio.initTimeline(S, c); }

  EN.rebuildPools = function (S) {
    const pools = { byType: {}, byHood: {} };
    for (const b of S.buildings) {
      if (b.business && b.business.closed) continue;
      (pools.byType[b.type] = pools.byType[b.type] || []).push(b.id);
      const h = (pools.byHood[b.hood] = pools.byHood[b.hood] || {});
      (h[b.type] = h[b.type] || []).push(b.id);
    }
    S._pools = pools;
    S._schools = null;
  };

  EN.homes = function (S) { return S.buildings.filter(b => b.type === 'casa'); };
  EN.homesWithSpace = function (S) { return EN.homes(S).filter(b => b.residents.length < b.cap); };

  /* ---- Impiego ---- */
  EN.assignInitialJobs = function (S, rng) {
    const adults = Object.values(S.citizens).filter(c => D.age(c, 0) >= 19);
    for (const c of rng.shuffle(adults)) {
      const age = D.age(c, 0);
      if (age >= 65) continue;
      const wantUni = P.stageForAge(age) === 'giovane adulto' && c.edu.level < 3 && c.tend.curiosity > 55 && rng.chance(0.5);
      if (wantUni) { c.eduStage = 'studente'; continue; }
      EN.findJob(S, c, rng);
    }
  };
  EN.initEducation = function (S) {
    for (const c of Object.values(S.citizens)) {
      const age = D.age(c, 0);
      if (age < 6) { c.eduStage = 'infanzia'; c.edu.level = 0; }
      else if (age < 14) { c.eduStage = 'scuola'; c.edu.level = 1; }
      else if (age < 19) { c.eduStage = 'istituto'; c.edu.level = 1; }
      else {
        const r = (c.seed % 100) / 100;
        c.edu.level = age >= 23 ? (r < 0.34 ? 3 : (r < 0.55 && age >= 30 ? 3 : 2)) : 2;
        c.eduStage = age < 24 && c.edu.level < 3 && c.tend.curiosity > 55 ? 'studente' : 'giovane adulto';
        if (c.edu.level >= 3) c.eduStage = 'giovane adulto';
      }
    }
  };
  EN.initRetired = function (S) {
    for (const c of Object.values(S.citizens)) {
      const age = D.age(c, 0);
      if (age >= 65) { c.retired = true; c.job = null; }
      if (!c.pension) c.pension = 1400;
      c.income = EN.personalIncome(c);
    }
  };

  EN.vacancies = function (S, maxEdu) {
    const out = [];
    for (const b of S.buildings) {
      if (b.business && b.business.closed) continue;
      for (let i = 0; i < b.jobs.length; i++) {
        const j = b.jobs[i];
        if (j.citizen === null && j.edu <= maxEdu) out.push({ b, i, j });
      }
    }
    return out;
  };

  EN.findJob = function (S, c, rng) {
    const vac = EN.vacancies(S, c.edu.level);
    if (!vac.length) return false;
    const pool = vac.length > 8 ? vac.slice(0, 8) : vac;
    const pref = pool[Math.floor(rng.next() * pool.length)];
    return EN.hire(S, c, pref.b, pref.i, rng);
  };
  EN.hire = function (S, c, building, jobIx, rng) {
    const j = building.jobs[jobIx];
    if (!j || j.citizen !== null) return false;
    const prev = c.job;
    j.citizen = c.id;
    c.job = { buildingId: building.id, ix: jobIx, title: j.title, wage: j.wage, since: S.dayIndex, level: 1 };
    c.retired = false;
    c.eduStage = 'adulto';
    c.income = EN.personalIncome(c);
    return true;
  };
  EN.leaveJob = function (S, c, reason) {
    if (!c.job) return null;
    const b = S.buildingsById[c.job.buildingId];
    if (b && b.jobs[c.job.ix] && b.jobs[c.job.ix].citizen === c.id) b.jobs[c.job.ix].citizen = null;
    const bName = b ? b.name : null;
    const oldTitle = c.job.title;
    c.job = null;
    c.income = EN.personalIncome(c);
    if (reason) {
      E.Bio.record(S, c, reason, '💼', 5, 'job');
      EN.logEvent(S, 'lavoro', c.name + ' ' + c.surname + ' non è più ' + oldTitle + (bName ? ' da ' + bName : '') + '.', [c.id], 5);
    }
    return bName;
  };

  EN.personalIncome = function (c) {
    if (c.job) return c.job.wage;
    if (c.retired) return c.pension || 1400;
    return 0;
  };

  /* ============================================================= */
  /* GIORNATA                                                       */
  /* ============================================================= */
  EN.stepDay = function (S) {
    S.minutes += D.MPD;
    S.dayIndex += 1;
    const day = S.dayIndex;
    EN.updateWeather(S, day);

    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);

    for (const c of live) EN.birthdays(S, c, day);
    for (const c of live) EN.planDay(S, c, day);
    EN.encounters(S, live, day);
    for (const c of alive2(S)) EN.lifeEvents(S, c, day);

    const d1 = D.dateFromMinutes(S.minutes - 1);
    if (d1.day === 1) EN.monthly(S);
    if (d1.month === 1 && d1.day === 1) EN.yearly(S);

    S.effects = S.effects.filter(eff => eff.until > day);
    if (S.events.length > 5000) S.events.splice(0, S.events.length - 5000);
    return S;
  };
  function alive2(S) { return Object.values(S.citizens).filter(c => c.alive && !c.abroad); }
  EN.stepDays = function (S, n) {
    for (let i = 0; i < n; i++) EN.stepDay(S);
    return S;
  };

  EN.birthdays = function (S, c, day) {
    const ageNow = D.age(c, day * D.MPD);
    if (ageNow <= 0) return;
    if ((day - c.birthIdx) % 365 !== 0) return;
    const age = ageNow;
    if (age === 6) {
      c.eduStage = 'scuola'; c.edu.level = Math.max(c.edu.level, 1);
      E.Bio.record(S, c, 'Inizia la scuola elementare.', '🎒', 7, 'edu');
      EN.logEvent(S, 'famiglia', c.name + ' ' + c.surname + ' inizia la scuola elementare.', [c.id], 5);
    } else if (age === 14) {
      c.eduStage = 'istituto';
      E.Bio.record(S, c, 'Comincia le scuole superiori.', '🎒', 6, 'edu');
    } else if (age === 19) {
      if (c.edu.level < 2) {
        c.edu.level = 2;
        E.Bio.record(S, c, 'Ottiene il diploma.', '🎓', 7, 'edu');
        EN.logEvent(S, 'famiglia', c.name + ' ' + c.surname + ' ottiene il diploma.', [c.id], 5);
      }
      const parentEdu = c.parents.length && S.citizens[c.parents[0]] ? S.citizens[c.parents[0]].edu.level : 1;
      const wantsUni = (c.tend.curiosity + c.tend.ambition) / 2 > 55 || (parentEdu >= 3 && c.tend.curiosity > 40);
      if (wantsUni) {
        c.eduStage = 'studente';
        E.Bio.record(S, c, 'Si iscrive all\u2019università di ' + DATA.CITY_NAME + '.', '🎓', 7, 'edu');
      } else {
        c.eduStage = 'giovane adulto';
        EN.moveOut(S, c);
      }
    } else if (age === 23 && c.eduStage === 'studente') {
      if (c.edu.level < 3) {
        c.edu.level = 3;
        E.Bio.record(S, c, 'Si laurea all\u2019università.', '🎓', 8, 'edu');
        EN.logEvent(S, 'famiglia', c.name + ' ' + c.surname + ' si laurea.', [c.id], 6);
      }
      c.eduStage = 'giovane adulto';
      EN.moveOut(S, c);
    } else if (age === 65) {
      c.retired = true;
      if (c.job) { c.pension = Math.round(c.job.wage * 0.62); EN.leaveJob(S, c); }
      c.income = EN.personalIncome(c);
      E.Bio.record(S, c, 'Va in pensione.', '🌅', 7, 'job');
    }
    if (age === 24 && !c.job && c.eduStage !== 'studente' && c.parents.length && EN.sameHome(S, c, c.parents[0])) {
      EN.moveOut(S, c);
    }
  };

  EN.sameHome = function (S, a, parentId) {
    const p = S.citizens[parentId];
    return !!(p && p.alive && !p.abroad && p.homeId === a.homeId);
  };

  EN.moveOut = function (S, c) {
    if (!c.homeId || c.spouse || c.partner) return;
    const parentsIn = c.parents.map(pid => S.citizens[pid]).filter(p => p && p.alive && !p.abroad && p.homeId === c.homeId);
    if (!parentsIn.length) return;
    if (EN.moveToHome(S, c, null)) {
      const hood = DATA.HOOD_BY_ID[S.buildingsById[c.homeId] ? S.buildingsById[c.homeId].hood : 'old-town'].name;
      E.Bio.record(S, c, 'Lascia la casa dei genitori: nuova vita a ' + hood + '.', '🏠', 6, 'move');
    }
  };

  EN.moveToHome = function (S, c, target) {
    let home = target;
    if (!home) {
      const free = EN.homesWithSpace(S);
      if (!free.length) return false;
      home = free[Math.floor(S.rng.next() * free.length)];
    }
    const old = S.buildingsById[c.homeId];
    if (old) {
      const ix = old.residents.indexOf(c.id);
      if (ix >= 0) old.residents.splice(ix, 1);
    }
    home.residents.push(c.id);
    c.homeId = home.id;
    return true;
  };

  /* ============================================================= */
  /* METEO                                                          */
  /* ============================================================= */
  EN.updateWeather = function (S, day) {
    if (!S._weather) S._weather = {};
    const season = D.dateFromMinutes(day * D.MPD).season;
    const r = new D.RNG((S.seed ^ Math.imul(day + 1, 2654435761)) >>> 0);
    const p = r.next();
    let w = 'Sole';
    if (season === 'Inverno') w = p < 0.45 ? 'Nuvoloso' : (p < 0.62 ? 'Pioggia' : (p < 0.70 ? 'Neve' : 'Sole'));
    else if (season === 'Primavera') w = p < 0.30 ? 'Nuvoloso' : (p < 0.42 ? 'Pioggia' : 'Sole');
    else if (season === 'Estate') w = p < 0.60 ? 'Sole' : (p < 0.75 ? 'Nuvoloso' : 'Pioggia');
    else w = p < 0.40 ? 'Nuvoloso' : (p < 0.55 ? 'Pioggia' : 'Sole');
    S._weather[day % 900] = w;
  };
  EN.weather = function (S, day) {
    if (!S._weather) S._weather = {};
    let w = S._weather[day % 900];
    if (!w) { EN.updateWeather(S, day); w = S._weather[day % 900]; }
    return w;
  };

  /* ============================================================= */
  /* ROUTINE GIORNALIERA                                            */
  /* ============================================================= */
  EN.planDay = function (S, c, day) {
    if (c._plan && c._plan.day === day) return c._plan;
    const rng = new D.RNG((c.seed ^ Math.imul(day + 1, 9176) ^ S.seed) >>> 0);
    const age = D.age(c, day * D.MPD);
    const dow = day % 7;
    const weekend = dow >= 5;
    const weather = EN.weather(S, day);
    const badWeather = weather === 'Pioggia' || weather === 'Neve';
    const home = c.homeId || (S.buildings[0] && S.buildings[0].id);
    const t = c.tend;
    const entries = [];
    const pools = (S._pools && S._pools.byType) || {};
    const near = (type) => {
      const list = pools[type] || [];
      if (!list.length) return home;
      const hb = S.buildingsById[home];
      const own = hb ? list.filter(id => S.buildingsById[id].hood === hb.hood) : [];
      const src = (own.length && rng.chance(0.65)) ? own : list;
      return src[Math.floor(rng.next() * src.length)];
    };
    const wake = 360 + rng.int(0, 75) + (age >= 65 ? rng.int(0, 60) : 0);
    const sleepStart = 22 * 60 + rng.int(0, 60);
    const add = (h0, h1, a, b) => { if (h1 > h0) entries.push({ s: h0, e: h1, a, b: b == null ? home : b }); };

    if (age < 6) {
      add(0, wake, 'dorme', home);
      add(wake, 720, 'casa', home);
      if (rng.chance(0.4) && !badWeather) add(600, 720, 'parco', near('parco'));
      add(720, sleepStart, 'casa', home);
      add(sleepStart, 1440, 'dorme', home);
    } else if (c.retired) {
      add(0, wake, 'dorme', home);
      add(wake, 570, 'casa', home);
      if (dow === 6 && rng.chance(0.35)) add(570, 660, 'chiesa', near('chiesa'));
      else if (rng.chance(0.55 + t.sociability / 300)) add(570, 645, 'bar', near('bar'));
      if (!badWeather && rng.chance(0.55)) add(645, 750, 'parco', near('parco'));
      add(750, 900, 'casa', home);
      if (rng.chance(0.35)) add(900, 990, 'piazza', near('piazza'));
      const kids = c.children.map(id => S.citizens[id]).filter(k => k && k.alive && !k.abroad && k.homeId);
      if (rng.chance(0.25) && kids.length) add(960, 1110, 'famiglia', rng.pick(kids).homeId);
      add(sleepStart, 1440, 'dorme', home);
    } else if (c.eduStage === 'scuola' || c.eduStage === 'istituto') {
      const school = EN.schoolFor(S, c);
      add(0, 410, 'dorme', home);
      add(410, 480, 'casa', home);
      if (!weekend) add(480, 840, 'scuola', school);
      else if (!badWeather) add(540, 720, rng.chance(0.5) ? 'parco' : 'sport', near(rng.chance(0.5) ? 'parco' : 'campo'));
      else add(540, 720, 'casa', home);
      add(840, 1080, 'casa', home);
      if (rng.chance(0.25 + c.pers.o / 300) && !badWeather) add(960, 1080, rng.chance(0.5) ? 'sport' : 'parco', near(rng.chance(0.5) ? 'campo' : 'parco'));
      add(sleepStart, 1440, 'dorme', home);
    } else if (c.eduStage === 'studente') {
      const uni = (pools.universita && pools.universita[0]) || home;
      add(0, 450, 'dorme', home);
      add(450, 510, 'casa', home);
      if (!weekend) add(510, 900, 'uni', uni);
      else if (rng.chance(0.4)) add(600, 780, 'amici', near('bar'));
      if (c.job) add(900, 1080, 'lavoro', c.job.buildingId);
      else if (rng.chance(0.25)) add(900, 1080, 'biblioteca', near('biblioteca'));
      if (rng.chance(0.45 + t.sociability / 250)) add(1140, 1350, weekend ? 'amici' : 'bar', near(weekend ? 'ristorante' : 'bar'));
      add(1350, 1440, 'dorme', home);
    } else {
      add(0, wake, 'dorme', home);
      add(wake, 510, 'casa', home);
      if (c.job && !weekend) {
        const startH = c.pers.c > 60 ? 480 : 510;
        const endH = 990 + rng.int(0, 2) * 30;
        add(startH, 720, 'lavoro', c.job.buildingId);
        if (rng.chance(0.3)) add(720, 810, 'pranzo', near(rng.chance(0.6) ? 'bar' : 'ristorante'));
        add(810, endH, 'lavoro', c.job.buildingId);
        add(endH, 1065, 'spesa', near('negozio'));
        const eveningP = 0.30 + t.sociability / 200 - (c.stress > 65 ? 0.12 : 0);
        if (rng.chance(eveningP)) {
          const kind = rng.next();
          if (kind < 0.20) add(1170, 1350, 'amici', near('bar'));
          else if (kind < 0.40) add(1170, 1320, 'ristorante', near('ristorante'));
          else if (kind < 0.55 && !badWeather) add(1080, 1200, 'sport', near('campo'));
          else if (kind < 0.70) add(1140, 1290, 'piazza', near('piazza'));
          else add(1200, 1350, 'bar', near('bar'));
        } else {
          add(1065, sleepStart, 'casa', home);
        }
      } else if (c.job && weekend) {
        if (rng.chance(0.4)) add(600, 720, 'spesa', near('mercato'));
        add(900, sleepStart, 'casa', home);
      } else {
        add(540, 690, (c.tend.curiosity > 55 && rng.chance(0.4)) ? 'biblioteca' : 'casa', near('biblioteca'));
        if (rng.chance(0.4)) add(840, 990, 'fuori', near('piazza'));
        add(1065, sleepStart, 'casa', home);
      }
    }
    entries.sort((a, b) => a.s - b.s);
    c._plan = { day, entries };
    EN.computeCtx(S, c);
    return c._plan;
  };

  EN.schoolFor = function (S, c) {
    if (!S._schools) S._schools = S.buildings.filter(b => b.type === 'scuola' && !(b.business && b.business.closed)).map(b => b.id);
    const h = S.buildingsById[c.homeId];
    const own = h ? S._schools.filter(id => S.buildingsById[id].hood === h.hood) : [];
    const list = own.length ? own : S._schools;
    if (!list.length) return c.homeId;
    return list[c.id % list.length];
  };

  EN.computeCtx = function (S, c) {
    const plan = c._plan;
    const ctx = { work: false, school: false, uni: false, social: [] };
    for (const e of plan.entries) {
      if (e.a === 'lavoro') ctx.work = true;
      else if (e.a === 'scuola') ctx.school = true;
      else if (e.a === 'uni') ctx.uni = true;
      else if (EN.SOCIAL_ACTS.includes(e.a)) ctx.social.push(e.b);
    }
    plan.ctx = ctx;
  };

  /* Posizione e attività a un certo minuto (per mappa e profilo) */
  EN.whereIs = function (S, c, minutes) {
    const plan = EN.planDay(S, c, Math.floor(minutes / D.MPD));
    const m = minutes % 1440;
    const es = plan.entries;
    let cur = null, prev = null;
    for (const e of es) { if (m >= e.s) { prev = cur; cur = e; } else break; }
    if (!cur) cur = es.length ? (es[0].s > m ? { s: es[0].s, e: es[0].e, a: 'casa', b: c.homeId } : es[es.length - 1]) : { s: 0, e: 1440, a: 'casa', b: c.homeId };
    const TRAVEL = 22;
    let fromB = cur.b, t = 1;
    if (prev && m < cur.s + TRAVEL) { fromB = prev.b; t = (m - cur.s) / TRAVEL; }
    /* fuori città */
    if (c.abroad) return { act: 'Lontano da Northbridge (' + (c.abroadCity || '?') + ', nel ' + E.Core.dateFromMinutes(minutes).year + ')', b: null };
    if (!c.alive) return { act: '—', b: null };
    return { act: EN.ACT_LABELS[cur.a] || cur.a, b: fromB, to: cur.b, t, actKey: cur.a };
  };
})
(window.EHL);
