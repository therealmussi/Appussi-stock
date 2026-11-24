'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const P = E.People = {};
  const D = E.Core, DATA = E.DATA;

  let SEQ = { n: 0 };
  P.resetId = function () { SEQ.n = 0; };

  function firstName(rng, sex) {
    return sex === 'M' ? rng.pick(DATA.MALE_NAMES) : rng.pick(DATA.FEMALE_NAMES);
  }

  /* Creazione cittadino */
  P.newCitizen = function (rng, opts) {
    opts = opts || {};
    const id = (++SEQ.n);
    const sex = opts.sex || (rng.chance(0.5) ? 'M' : 'F');
    const c = {
      id, seed: (rng.next() * 1e9) >>> 0, name: firstName(rng, sex), surname: opts.surname || rng.pick(DATA.SURNAMES),
      sex, birthIdx: opts.birthIdx != null ? opts.birthIdx : 0,
      alive: true, abroad: false, abroadCity: null, movedFromHood: null,
      pers: {}, tend: {}, interests: [],
      edu: { level: 1, note: null }, eduStage: 'adulto',
      job: null, retired: false, pension: 0,
      homeId: null, originHood: null,
      parents: [], children: [], spouse: null, coupleSince: null, engaged: false,
      rels: {},
      happiness: 62, stress: 25, health: 90, satisfaction: 60, savings: 0, income: 0,
      memories: [], timeline: [],
      cause: null, funeral: null,
      _plan: null
    };
    P.rollPersonality(c, rng);
    P.rollWellbeing(c, rng, opts.age || 30);
    return c;
  };

  P.rollPersonality = function (c, rng) {
    c.pers = {
      o: D.clamp(Math.round(rng.gauss(52, 16)), 5, 95),
      c: D.clamp(Math.round(rng.gauss(52, 16)), 5, 95),
      e: D.clamp(Math.round(rng.gauss(52, 16)), 5, 95),
      a: D.clamp(Math.round(rng.gauss(52, 16)), 5, 95),
      s: D.clamp(Math.round(rng.gauss(52, 16)), 5, 95)
    };
    c.tend = {
      ambition: D.clamp(Math.round(0.5 * c.pers.c + 0.3 * c.pers.e + rng.int(-15, 25)), 5, 95),
      sociability: D.clamp(Math.round(0.6 * c.pers.e + 0.2 * c.pers.a + rng.int(-10, 20)), 5, 95),
      curiosity: D.clamp(Math.round(0.7 * c.pers.o + rng.int(-12, 18)), 5, 95),
      riskTol: D.clamp(Math.round(0.4 * c.pers.e + 0.3 * (100 - c.pers.c) + rng.int(-10, 25)), 5, 95),
      generosity: D.clamp(Math.round(0.6 * c.pers.a + rng.int(-12, 18)), 5, 95),
      independence: D.clamp(Math.round(0.5 * (100 - c.pers.a) + 0.2 * c.pers.o + rng.int(-12, 15)), 5, 95)
    };
    const pool = rng.shuffle(DATA.INTERESTS);
    const nInter = rng.int(2, 3);
    c.interests = [];
    for (let i = 0; i < nInter; i++) c.interests.push(pool[i]);
  };

  P.rederiveTend = function (c, rng) {
    c.tend = {
      ambition: D.clamp(Math.round(0.5 * c.pers.c + 0.3 * c.pers.e + rng.int(-15, 25)), 5, 95),
      sociability: D.clamp(Math.round(0.6 * c.pers.e + 0.2 * c.pers.a + rng.int(-10, 20)), 5, 95),
      curiosity: D.clamp(Math.round(0.7 * c.pers.o + rng.int(-12, 18)), 5, 95),
      riskTol: D.clamp(Math.round(0.4 * c.pers.e + 0.3 * (100 - c.pers.c) + rng.int(-10, 25)), 5, 95),
      generosity: D.clamp(Math.round(0.6 * c.pers.a + rng.int(-12, 18)), 5, 95),
      independence: D.clamp(Math.round(0.5 * (100 - c.pers.a) + 0.2 * c.pers.o + rng.int(-12, 15)), 5, 95)
    };
  };

  P.rollWellbeing = function (c, rng, age) {
    c.health = D.clamp(Math.round(rng.gauss(95 - Math.max(0, age - 40) * 0.25, 5)), 45, 98);
    c.happiness = D.clamp(Math.round(rng.gauss(60 + c.pers.s * 0.25, 8)), 25, 95);
    c.stress = D.clamp(Math.round(rng.gauss(28, 8)), 5, 90);
    c.satisfaction = D.clamp(Math.round(c.happiness - 3 + rng.int(-4, 4)), 15, 95);
    c.savings = Math.round(rng.int(0, 20) * 1000 * (1 + age / 25));
  };

  P.age = function (c, minutes) { return D.age(c, minutes); };
  P.birthday = function (c, dayIndex) { return (dayIndex - c.birthIdx) % 365 === 0 && dayIndex - c.birthIdx > 0; };
  P.bdayMonthDay = function (birthIdx) {
    const d = D.dateFromMinutes(birthIdx * D.MPD);
    return d.day + '/' + d.month;
  };

  P.eduLabel = function (level) {
    return ['Nessuna', 'Licenza media', 'Diploma', 'Laurea', 'Dottorato'][level] || '—';
  };
  P.stageForAge = function (age) {
    if (age < 6) return 'infanzia';
    if (age < 14) return 'scuola';
    if (age < 19) return 'istituto';
    if (age < 24) return 'giovane adulto';
    return 'adulto';
  };

  P.compatibility = function (a, b) {
    const dp = Math.abs(a.pers.o - b.pers.o) + Math.abs(a.pers.c - b.pers.c) +
      Math.abs(a.pers.e - b.pers.e) + Math.abs(a.pers.a - b.pers.a) +
      Math.abs(a.pers.s - b.pers.s);
    let shared = 0;
    for (const i of a.interests) if (b.interests.includes(i)) shared++;
    return Math.round(D.clamp(70 - dp / 5 + shared * 9, 0, 100));
  };

  /* Popola familiarmente i cittadini di casa */
  P.linkFamily = function (S, parent, child, kind) {
    if (kind === 'child') {
      parent.children.push(child.id);
      child.parents.push(parent.id);
      P.setRel(S, parent, child, 'Famiglia', 62 + Math.round(SEQ_R(S) % 30));
    } else if (kind === 'spouse') {
      parent.spouse = child.id; child.spouse = parent.id;
      P.setRel(S, parent, child, 'Coniuge', 70);
    } else if (kind === 'sibling') {
      P.setRel(S, parent, child, 'Fratello/Sorella', 45 + Math.round(SEQ_R(S) % 30));
    }
  };

  function SEQ_R(S) { return (S.seed + SEQ.n++) % 30; }

  P.setRel = function (S, a, b, type, aff) {
    const dayIdx = Math.floor(S.minutes / D.MPD);
    a.rels[b.id] = { type, aff: D.clamp(aff, 0, 100), trust: 40, conf: 0, met: dayIdx, last: dayIdx, n: 1 };
    b.rels[a.id] = { type, aff: D.clamp(aff, 0, 100), trust: 40, conf: 0, met: dayIdx, last: dayIdx, n: 1 };
  };
  P.rel = function (c, otherId) { return c.rels[otherId] || null; };

  /* Popolazione iniziale: nuclei familiari, pensionati e single */
  P.seedPopulation = function (S, rng, target) {
    const homes = S.buildings.filter(b => b.type === 'casa' && b.business === null);
    let placed = 0;
    const hay = rng.shuffle(homes.map(h => h.id));
    let hi = 0;

    function houseFor(capMin) {
      for (let i = 0; i < hay.length; i++) {
        const b = S.buildingsById[hay[(hi + i) % hay.length]];
        if (b.residents.length + capMin <= b.cap) { hi = (hi + i + 1) % hay.length; return b; }
      }
      return null;
    }
    function addPerson(o) {
      const c = P.newCitizen(rng, o);
      const ageNow = Math.floor((-c.birthIdx) / 365) || 30;
      P.rollWellbeing(c, rng, ageNow);
      c.savings = Math.round(c.savings * D.clamp(ageNow / 30, 0.2, 2.2));
      S.citizens[c.id] = c;
      if (o.home) {
        c.homeId = o.home.id; o.home.residents.push(c.id);
        c.originHood = o.home.hood;
      }
      return c;
    }

    while (placed < target && hi < hay.length) {
      const home = houseFor(4) || houseFor(2);
      if (!home) break;
      const r = rng.next();
      if (r < 0.55) {
        // nucleo classico: genitori (magari sposati) + figli
        const pAge = rng.int(27, 52);
        const p1 = addPerson({ sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(pAge * 365, (pAge + 1) * 365), home });
        const p2exists = rng.chance(0.82);
        let p2 = null;
        if (p2exists) {
          const p2Age = pAge + rng.int(-5, 5);
          p2 = addPerson({ sex: p1.sex === 'M' ? 'F' : 'M', birthIdx: -rng.int(p2Age * 365, (p2Age + 1) * 365), home });
          p1.surname = p1.surname === p2.surname ? p1.surname : (rng.chance(0.5) ? p1.surname : p2.surname);
          p2.surname = p1.surname;
          P.setRel(S, p1, p2, 'Coniuge', 72 + rng.int(0, 20));
          p1.spouse = p2.id; p2.spouse = p1.id;
        }
        const nKids = rng.int(0, 3);
        for (let k = 0; k < nKids && placed < target; k++) {
          const kAge = p2 ? rng.int(0, Math.min(17, pAge - 22)) : rng.int(0, 17);
          const kid = addPerson({ sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(kAge * 365, (kAge + 1) * 365), home, surname: p1.surname });
          P.setRel(S, p1, kid, 'Famiglia', 70 + rng.int(0, 25));
          p1.children.push(kid.id); kid.parents.push(p1.id);
          if (p2) {
            P.setRel(S, p2, kid, 'Famiglia', 70 + rng.int(0, 25));
            p2.children.push(kid.id); kid.parents.push(p2.id);
          }
          for (const sibId of p1.children) {
            if (sibId !== kid.id) P.setRel(S, S.citizens[sibId], kid, 'Fratello/Sorella', 40 + rng.int(0, 40));
          }
          p1.children.push(kid.id);
          placed++;
        }
        placed += p2 ? 2 : 1;
      } else if (r < 0.75) {
        // single giovane-adulto
        const a = addPerson({ sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(22 * 365, 40 * 365), home });
        placed++;
      } else if (r < 0.9) {
        // coppia non sposata
        const a = addPerson({ sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(24 * 365, 45 * 365), home });
        const b = addPerson({ sex: a.sex === 'M' ? 'F' : 'M', birthIdx: a.birthIdx + rng.int(-2000, 2000), home });
        P.setRel(S, a, b, 'Coppia', 65 + rng.int(0, 20));
        a.spouse = null; a.coupleSince = -rng.int(30, 3000);
        b.coupleSince = a.coupleSince; b.partner = a.id; a.partner = b.id;
        placed += 2;
      } else {
        // anziano/a solo o coppia di anziani
        const age = rng.int(66, 88);
        const a = addPerson({ sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: -rng.int(age * 365, (age + 1) * 365), home });
        placed++;
        if (rng.chance(0.45) && placed < target) {
          const b = addPerson({ sex: a.sex === 'M' ? 'F' : 'M', birthIdx: a.birthIdx + rng.int(-1500, 1500), home });
          P.setRel(S, a, b, 'Coniuge', 75 + rng.int(0, 20));
          a.spouse = b.id; b.spouse = a.id;
          placed++;
        }
      }
    }
    return placed;
  };

  /* Amicizie iniziali plausibili: vicini, colleghi, compagni */
  P.seedSocial = function (S, rng) {
    const groups = {};
    for (const c of Object.values(S.citizens)) {
      const home = S.buildingsById[c.homeId];
      const k = 'h' + home.id;
      (groups[k] = groups[k] || { ids: [], type: 'vicini' }).ids.push(c.id);
      if (c.job) {
        const wk = 'w' + c.job.buildingId;
        (groups[wk] = groups[wk] || { ids: [], type: 'colleghi' }).ids.push(c.id);
      }
    }
    for (const g of Object.values(groups)) {
      const n = g.ids.length;
      if (n < 2) continue;
      const maxPairs = Math.min(rng.int(1, 4), Math.floor(n * (n - 1) / 2));
      for (let p = 0; p < maxPairs; p++) {
        const i = rng.int(0, n - 1), j = rng.int(0, n - 1);
        if (i === j) continue;
        const a = S.citizens[g.ids[i]], b = S.citizens[g.ids[j]];
        if (a.rels[b.id]) continue;
        const aff = D.clamp(rng.int(20, 55), 0, 100);
        a.rels[b.id] = { type: aff > 45 ? 'Amico' : 'Conosciuto', aff, trust: rng.int(20, 55), conf: 0, met: 0, last: 0, n: rng.int(2, 30) };
        b.rels[a.id] = { type: a.rels[b.id].type, aff, trust: a.rels[b.id].trust, conf: 0, met: 0, last: 0, n: a.rels[b.id].n };
      }
    }
  };

  /* Avatar procedurale (colori) per ritratti e puntini mappa */
  P.avatarPalette = function (c) {
    const r = D.RNG; const rng = new r(c.seed * 31 + 7);
    const hairs = ['#2c2117', '#4a3320', '#6e4a24', '#9c7433', '#c9a86b', '#8a8a8a', '#d8d8d8', '#3a2a4a'];
    const skins = ['#f2d6b8', '#e8c39b', '#d2a679', '#b07d51', '#8a5a33', '#69432a'];
    const shirts = ['#c96f5a', '#5f8f6a', '#5577a8', '#a8a858', '#8a5a7a', '#c9a86b', '#6a6a7a', '#c98a3a'];
    return { hair: rng.pick(hairs), hairStyle: rng.int(0, 3), skin: rng.pick(skins), shirt: rng.pick(shirts) };
  };
})(window.EHL);
