'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const EN = E.Engine; // estende il motore
  const D = E.Core, DATA = E.DATA, P = E.People;

  /* ============================================================= */
  /* INCONTRI E RELAZIONI                                           */
  /* ============================================================= */
  EN.encounters = function (S, live, day) {
    const bundles = {};
    for (const c of live) {
      const pl = c._plan;
      if (!pl || !pl.entries) continue;
      for (const e of pl.entries) {
        const key = e.b + '|' + e.a;
        (bundles[key] = bundles[key] || []).push(c.id);
      }
    }
    for (const key in bundles) {
      const arr = bundles[key];
      if (arr.length < 2) continue;
      const act = key.split('|')[1];
      if (act === 'dorme' || act === 'casa') continue;
      const kind = act === 'lavoro' ? 'collega' : (act === 'scuola' || act === 'uni') ? 'compagno' : 'sociale';
      const maxPairs = Math.min(arr.length, kind === 'sociale' ? 6 : 14);
      const done = new Set();
      for (let p = 0; p < maxPairs; p++) {
        const ia = arr[Math.floor(S.rng.next() * arr.length)];
        const ib = arr[Math.floor(S.rng.next() * arr.length)];
        if (ia === ib || done.has(ia + ':' + ib) || done.has(ib + ':' + ia)) continue;
        done.add(ia + ':' + ib);
        done.add(ib + ':' + ia);
        EN.meet(S, S.citizens[ia], S.citizens[ib], kind, day);
      }
    }
    for (const c of live) EN.stepRelationships(S, c, day);
  };

  EN.initActive = function (S) {
    const day = S.dayIndex;
    for (const c of Object.values(S.citizens)) {
      c._active = new Set();
      for (const k in c.rels) {
        const r = c.rels[k];
        if (r && ((day - (r.last || 0)) <= 120 || ['Interesse romantico', 'Coppia', 'Fidanzati', 'Coniuge'].includes(r.type))) c._active.add(k);
      }
    }
  };
  function touchActive(a, bId, b) {
    if (a._active) a._active.add(String(bId));
    if (b && b._active) b._active.add(String(a.id));
  }

  EN.meet = function (S, a, b, ctx, day) {
    if (!a || !b || a.id === b.id || !a.alive || !b.alive || a.abroad || b.abroad) return;
    if (ctx === 'collega' && a.rels[b.id] === undefined && a.job && b.job && a.job.buildingId !== b.job.buildingId) return;
    const baseType = ctx === 'collega' ? 'Collega' : ctx === 'compagno' ? 'Compagno' : 'Conosciuto';
    let ra = a.rels[b.id], rb = b.rels[a.id];
    if (!ra || !rb) {
      const compat = P.compatibility(a, b);
      const degree = ctx === 'sociale' ? 8 : 5;
      const aff0 = Math.round(D.clamp(6 + S.rng.next() * degree + compat * 0.12, 1, 24));
      ra = ra || { type: baseType, aff: aff0, trust: 8, conf: 0, met: day, last: day, n: 1 };
      rb = rb || { type: baseType, aff: aff0, trust: 8, conf: 0, met: day, last: day, n: 1 };
      a.rels[b.id] = ra; b.rels[a.id] = rb;
    }
    ra.last = rb.last = day;
    ra.n++; rb.n++;
    const compat = P.compatibility(a, b);
    const gain = (ctx === 'sociale' ? 2.4 : 1.6) + compat * 0.05 + (a.tend.sociability + b.tend.sociability) / 140;
    ra.aff = rb.aff = D.clamp(ra.aff + gain, 0, 100);
    ra.trust = rb.trust = D.clamp(ra.trust + 1.2, 0, 100);
    ra.conf = rb.conf = Math.max(0, ra.conf + (compat < 25 && S.rng.chance(0.05) ? 4 : -0.5));
    touchActive(a, b.id, b);
    EN.retypeRel(S, a, b, ra, rb, ctx, day, compat);
  };

  EN.retypeRel = function (S, a, b, ra, rb, ctx, day, compat) {
    if (['Famiglia', 'Coniuge', 'Fratello/Sorella', 'Rivalità', 'Ex', 'Ex coniuge'].includes(ra.type)) return;
    if (EN.inCouple(S, a, b)) return;
    if (a.parents.includes(b.id) || b.parents.includes(a.id) ||
      (a.parents.length && b.parents.some(p => a.parents.includes(p)))) {
      ra.type = rb.type = 'Famiglia';
      return;
    }
    if (ctx !== 'collega' && ctx !== 'compagno' &&
      EN.freeForLove(S, a) && EN.freeForLove(S, b) && ra.aff > 46 && compat > 44) {
      const ageA = D.age(a, day * D.MPD), ageB = D.age(b, day * D.MPD);
      if (Math.abs(ageA - ageB) < 16 && !ra.rom && S.rng.chance(0.10)) {
        ra.type = rb.type = 'Interesse romantico';
        ra.rom = rb.rom = day;
        EN.logEvent(S, 'amore', '✨ Prima scintilla tra ' + a.name + ' ' + a.surname + ' e ' + b.name + ' ' + b.surname + '.', [a.id, b.id], 6);
        E.Bio.record(S, a, 'Un incontro che conta: ' + b.name + ' ' + b.surname + '.', '✨', 6, 'love');
        E.Bio.record(S, b, 'Un incontro che conta: ' + a.name + ' ' + a.surname + '.', '✨', 6, 'love');
        return;
      }
    }
    const before = ra.type;
    if (ra.aff >= 68 && ra.n > 8) { ra.type = rb.type = 'Amico stretto'; }
    else if (ra.aff >= 42 && ra.n > 4 && ra.type !== 'Amico stretto') { ra.type = rb.type = 'Amico'; }
    if (before !== ra.type && ['Amico', 'Amico stretto'].includes(ra.type)) {
      const imp = ra.type === 'Amico stretto' ? 6 : 5;
      EN.logEvent(S, 'sociale', '🤝 ' + a.name + ' ' + a.surname + ' e ' + b.name + ' ' + b.surname + ' diventano' + (ra.type === 'Amico stretto' ? ' grandi amici.' : ' amici.'), [a.id, b.id], imp);
      E.Bio.record(S, a, (ra.type === 'Amico stretto' ? 'Grande amicizia con ' : 'Nuova amicizia: ') + b.name + ' ' + b.surname + '.', '🤝', imp, 'social');
      E.Bio.record(S, b, (ra.type === 'Amico stretto' ? 'Grande amicizia con ' : 'Nuova amicizia: ') + a.name + ' ' + a.surname + '.', '🤝', imp, 'social');
    }
  };

  EN.freeForLove = function (S, c) {
    const age = D.age(c, S.dayIndex * D.MPD);
    if (age < 18 || age > 85 || !c.alive || c.abroad) return false;
    if (c.spouse || c.partner) return false;
    for (const k in c.rels) {
      const r = c.rels[k];
      if (r && (r.type === 'Interesse romantico' || r.type === 'Coppia' || r.type === 'Fidanzati')) return false;
    }
    return true;
  };

  EN.inCouple = function (S, a, b) {
    return a.spouse === b.id || b.spouse === a.id || a.partner === b.id || b.partner === a.id ||
      !!(a.rels[b.id] && ['Interesse romantico', 'Coppia', 'Fidanzati', 'Coniuge'].includes(a.rels[b.id].type));
  };

  EN.stepRelationships = function (S, c, day) {
    const act = c._active;
    if (!act) { EN.initActive(S); return; }
    for (const k of act) {
      const o = S.citizens[k];
      const r = c.rels[k];
      if (!o || !o.alive || o.abroad || !r) continue;
      const ro = o.rels[c.id];
      if (!ro) continue;
      if (r.type === 'Interesse romantico' && r.rom && day - r.rom > 60) {
        r.type = ro.type = 'Coppia';
        c.partner = o.id; o.partner = c.id;
        c.coupleSince = o.coupleSince = day;
        EN.logEvent(S, 'amore', '❤️ ' + c.name + ' ' + c.surname + ' e ' + o.name + ' ' + o.surname + ' ufficializzano la loro storia.', [c.id, o.id], 7);
        E.Bio.record(S, c, 'Si mette in coppia con ' + o.name + ' ' + o.surname + '.', '❤️', 7, 'love');
        E.Bio.record(S, o, 'Si mette in coppia con ' + c.name + ' ' + c.surname + '.', '❤️', 7, 'love');
      } else if (r.type === 'Coppia') {
        const age = D.age(c, day * D.MPD);
        const prob = 0.0025 * (0.5 + c.tend.riskTol / 100 + (r.aff - 55) / 100);
        if (age >= 20 && age <= 75 && r.rom && day - r.rom > 200 && S.rng.chance(Math.max(0, prob))) {
          r.type = ro.type = 'Fidanzati';
          EN.logEvent(S, 'amore', '💍 ' + c.name + ' ' + c.surname + ' chiede ' + o.name + ' ' + o.surname + ' di sposarlo/a.', [c.id, o.id], 7);
        }
      } else if (r.type === 'Fidanzati') {
        if (S.rng.chance(0.004 * (0.6 + c.tend.riskTol / 120))) EN.marry(S, c, o, day);
      }
      if (['Coppia', 'Fidanzati', 'Interesse romantico'].includes(r.type)) {
        const inTrouble = r.conf > 55 || r.aff < 28 || (c.stress > 75 && o.stress > 75);
        if (inTrouble && S.rng.chance(0.02)) EN.breakup(S, c, o, day);
      } else if ((r.type === 'Amico' || r.type === 'Amico stretto') && day - r.last > 540 && r.aff < 36 && S.rng.chance(0.25)) {
        r.type = ro.type = 'Conosciuto';
      }
    }
  };

  EN.marry = function (S, a, b, day) {
    if (a.spouse || b.spouse) return;
    a.spouse = b.id; b.spouse = a.id;
    a.partner = null; b.partner = null;
    const ra = a.rels[b.id], rb = b.rels[a.id];
    ra.type = rb.type = 'Coniuge';
    ra.aff = rb.aff = D.clamp(Math.max(ra.aff, 66), 0, 95);
    a.coupleSince = b.coupleSince = day;
    S.stats.counters.marriages = (S.stats.counters.marriages || 0) + 1;
    EN.logEvent(S, 'amore', '💍 Matrimonio: ' + a.name + ' ' + a.surname + ' e ' + b.name + ' ' + b.surname + '.', [a.id, b.id], 9);
    E.Bio.record(S, a, 'Sposa ' + b.name + ' ' + b.surname + '.', '💍', 9, 'love');
    E.Bio.record(S, b, 'Sposa ' + a.name + ' ' + a.surname + '.', '💍', 9, 'love');
    for (const cc of [a, b]) {
      for (const rid of EN.closeOnes(S, cc, 4)) {
        const q = S.citizens[rid];
        if (q && q !== a && q !== b) EN.pushMemory(S, q, day, 'Il matrimonio di ' + a.name + ' e ' + b.name + '.', 6);
      }
    }
    EN.mergeHomes(S, a, b);
    a.happiness = D.clamp(a.happiness + 12, 5, 95);
    b.happiness = D.clamp(b.happiness + 12, 5, 95);
  };

  EN.mergeHomes = function (S, a, b) {
    const ha = S.buildingsById[a.homeId], hb = S.buildingsById[b.homeId];
    if (!ha || !hb || ha.id === hb.id) return;
    const t1 = (ha.cap - ha.residents.length) >= 1 ? (ha.cap - ha.residents.length) : -1;
    const t2 = (hb.cap - hb.residents.length) >= 1 ? (hb.cap - hb.residents.length) : -1;
    if (t1 < 0 && t2 < 0) return;
    const target = t2 > t1 ? hb : ha;
    const mover = target.residents.includes(a.id) ? b : a;
    const other = mover === a ? b : a;
    if (EN.moveToHome(S, mover, target)) {
      EN.logEvent(S, 'casa', '🏠 ' + mover.name + ' ' + mover.surname + ' va a vivere con ' + other.name + ' a ' + DATA.HOOD_BY_ID[target.hood].name + '.', [mover.id], 6);
      E.Bio.record(S, mover, 'Va a vivere con ' + other.name + ' a ' + DATA.HOOD_BY_ID[target.hood].name + '.', '🏠', 6, 'move');
    }
  };

  EN.breakup = function (S, a, b, day) {
    const ra = a.rels[b.id], rb = b.rels[a.id];
    if (!ra || !rb) return;
    const wasMarried = a.spouse === b.id;
    ra.rom = rb.rom = null;
    a.partner = null; b.partner = null; a.spouse = null; b.spouse = null;
    const hostility = ra.conf > 55 || S.rng.chance(0.25);
    ra.type = rb.type = wasMarried ? 'Ex coniuge' : (hostility ? 'Rivalità' : 'Ex');
    if (hostility) {
      ra.aff = rb.aff = D.clamp(ra.aff - 25, 0, 100);
      ra.conf = rb.conf = Math.max(ra.conf, 60);
    }
    EN.logEvent(S, 'amore', '💔 ' + (wasMarried ? 'Divorzio: ' : '') + a.name + ' ' + a.surname + ' e ' + b.name + ' ' + b.surname + ' si lasciano.', [a.id, b.id], wasMarried ? 8 : 6);
    E.Bio.record(S, a, (wasMarried ? 'Divorzio da ' : 'Si lascia con ') + b.name + ' ' + b.surname + '.', '💔', wasMarried ? 8 : 6, 'love');
    E.Bio.record(S, b, (wasMarried ? 'Divorzio da ' : 'Si lascia con ') + a.name + ' ' + a.surname + '.', '💔', wasMarried ? 8 : 6, 'love');
    a.happiness = D.clamp(a.happiness - (wasMarried ? 18 : 10), 5, 95);
    b.happiness = D.clamp(b.happiness - (wasMarried ? 18 : 10), 5, 95);
    if (wasMarried && a.homeId === b.homeId) {
      EN.moveToHome(S, a.savings > b.savings ? b : a, null);
    }
  };

  EN.closeOnesCached = function (S, c, day, n) {
    if (!c._close || c._closeDay === undefined || day - c._closeDay >= 30 + (c.id % 9)) {
      c._closeDay = day;
      const list = [];
      for (const k in c.rels) {
        const o = S.citizens[k];
        if (!o || !o.alive || o.abroad) continue;
        const r = c.rels[k];
        if (['Coniuge', 'Famiglia', 'Fratello/Sorella', 'Amico stretto'].includes(r.type) || r.aff > 55) list.push([+k, r.aff]);
      }
      list.sort((a, b) => b[1] - a[1]);
      c._close = list.slice(0, 6).map(x => x[0]);
    }
    return c._close.slice(0, n);
  };

  EN.closeOnes = function (S, c, n) {
    return Object.keys(c.rels)
      .filter(k => S.citizens[k] && S.citizens[k].alive && !S.citizens[k].abroad)
      .filter(k => ['Coniuge', 'Famiglia', 'Fratello/Sorella', 'Amico stretto'].includes(c.rels[k].type) || c.rels[k].aff > 55)
      .sort((k1, k2) => c.rels[k2].aff - c.rels[k1].aff)
      .slice(0, n).map(k => +k);
  };

  EN.pushMemory = function (S, c, day, text, imp) {
    c.memories.push({ d: day, t: text, imp });
    if (c.memories.length > 45) {
      let lowest = 0;
      for (let i = 1; i < c.memories.length; i++) if (c.memories[i].imp < c.memories[lowest].imp) lowest = i;
      c.memories.splice(lowest, 1);
    }
  };

  /* ============================================================= */
  /* EVENTI DI VITA                                                 */
  /* ============================================================= */
  EN.lifeEvents = function (S, c, day) {
    const age = D.age(c, day * D.MPD);
    if (!c.job && !c.retired && age >= 18 && ['adulto', 'giovane adulto'].includes(c.eduStage)) {
      if (S.rng.chance(0.05 + c.tend.ambition / 500)) {
        const got = EN.findJob(S, c, S.rng);
        if (got) {
          const b = S.buildingsById[c.job.buildingId];
          EN.logEvent(S, 'lavoro', '💼 ' + c.name + ' ' + c.surname + ' inizia a lavorare come ' + c.job.title + (b ? ' a ' + b.name : '') + '.', [c.id], 5);
          E.Bio.record(S, c, 'Inizia a lavorare come ' + c.job.title + (b ? ' a ' + b.name : '') + '.', '💼', 6, 'job');
        } else if (c.satisfaction < 42 && S.rng.chance(0.002)) {
          EN.emigrate(S, c, day);
        }
      }
    }
    if (c.job) {
      const b = S.buildingsById[c.job.buildingId];
      if (!b || (b.business && b.business.closed)) {
        EN.leaveJob(S, c, 'L\u2019attività presso cui lavorava ha chiuso.');
      } else {
        const p = 0.0009 * (0.4 + c.tend.ambition / 80) * (c.happiness > 45 ? 1 : 1.6);
        if (S.rng.chance(p)) {
          for (let i = c.job.ix + 1; i < b.jobs.length; i++) {
            if (b.jobs[i].citizen === null && b.jobs[i].edu <= c.edu.level) {
              b.jobs[c.job.ix].citizen = null;
              b.jobs[i].citizen = c.id;
              c.job.ix = i; c.job.title = b.jobs[i].title; c.job.wage = b.jobs[i].wage; c.job.level++;
              c.income = EN.personalIncome(c);
              EN.logEvent(S, 'lavoro', '📈 ' + c.name + ' ' + c.surname + ' viene promosso/a ' + c.job.title + ' presso ' + b.name + '.', [c.id], 6);
              E.Bio.record(S, c, 'Promozione: ' + c.job.title + ' a ' + b.name + '.', '📈', 6, 'job');
              break;
            }
          }
        }
        if (c.tend.ambition > 70 && S.rng.chance(0.0005)) {
          const better = EN.vacancies(S, c.edu.level).filter(v => v.j.wage > c.job.wage * 1.15);
          if (better.length && S.rng.chance(0.4)) {
            const choice = better[Math.floor(S.rng.next() * better.length)];
            const oldName = b.name;
            if (EN.hire(S, c, choice.b, choice.i, S.rng)) {
              EN.logEvent(S, 'lavoro', '🔄 ' + c.name + ' ' + c.surname + ' lascia ' + oldName + ': nuovo lavoro come ' + c.job.title + ' da ' + choice.b.name + '.', [c.id], 5);
              E.Bio.record(S, c, 'Cambia lavoro: ' + c.job.title + ' a ' + choice.b.name + '.', '🔄', 5, 'job');
            }
          }
        }
      }
    }
    if (c.sex === 'F' && (c.spouse || c.partner) && age >= 18 && age <= 45) {
      const partner = S.citizens[c.spouse || c.partner];
      if (partner && partner.alive && !partner.abroad && partner.homeId === c.homeId) {
        const kids = c.children.filter(id => S.citizens[id] && S.citizens[id].alive && !S.citizens[id].abroad).length;
        const yearly = 0.13 * Math.max(0.15, 1 - kids / 3) * (age > 38 ? 0.55 : 1);
        if (S.rng.chance(yearly / 365)) EN.birth(S, c, partner, day);
      }
    }
    EN.deathCheck(S, c, day);
    if (c.alive) EN.wellbeingDrift(S, c, day);
  };

  EN.birth = function (S, mother, father, day) {
    const rng = S.rng;
    const c = P.newCitizen(rng, { sex: rng.chance(0.5) ? 'M' : 'F', birthIdx: day, surname: rng.chance(0.7) ? father.surname : mother.surname });
    S.citizens[c.id] = c;
    c._plan = null;
    const home = S.buildingsById[mother.homeId];
    if (home) { c.homeId = home.id; home.residents.push(c.id); c.originHood = home.hood; }
    c.eduStage = 'infanzia'; c.edu.level = 0;
    c.parents = [mother.id, father.id];
    mother.children.push(c.id); father.children.push(c.id);
    P.setRel(S, mother, c, 'Famiglia', 85);
    P.setRel(S, father, c, 'Famiglia', 82);
    for (const sid of mother.children.concat(father.children)) {
      if (sid !== c.id && S.citizens[sid] && !c.rels[sid]) {
        P.setRel(S, S.citizens[sid], c, 'Fratello/Sorella', 40 + rng.int(0, 35));
      }
    }
    for (const k of ['o', 'c', 'e', 'a', 's']) {
      const mid = (mother.pers[k] + father.pers[k]) / 2;
      c.pers[k] = D.clamp(Math.round(mid + rng.gauss(0, 13)), 5, 95);
    }
    P.rederiveTend(c, rng);
    const name = c.name + ' ' + c.surname;
    EN.logEvent(S, 'famiglia', '👶 Nasce ' + name + ', figlio/a di ' + mother.name + ' e ' + father.name + ' ' + father.surname + '.', [c.id, mother.id, father.id], 9);
    E.Bio.record(S, c, 'Nasce a ' + DATA.CITY_NAME + (home ? ', quartiere ' + DATA.HOOD_BY_ID[home.hood].name : '') + '.', '👶', 9, 'birth');
    E.Bio.record(S, mother, 'Nasce ' + name + '.', '👶', 9, 'family');
    E.Bio.record(S, father, 'Nasce ' + name + '.', '👶', 9, 'family');
    EN.pushMemory(S, mother, day, 'La nascita di ' + name + '.', 9);
    EN.pushMemory(S, father, day, 'La nascita di ' + name + '.', 9);
    mother.happiness = D.clamp(mother.happiness + 10, 5, 95);
    father.happiness = D.clamp(father.happiness + 8, 5, 95);
    S.stats.counters.births = (S.stats.counters.births || 0) + 1;
    return c;
  };

  EN.deathCheck = function (S, c, day) {
    const age = D.age(c, day * D.MPD);
    let m;
    if (age <= 0) m = 0.004;
    else if (age < 5) m = 0.0008;
    else if (age < 15) m = 0.0002;
    else if (age < 35) m = 0.0008;
    else if (age < 55) m = 0.0022;
    else if (age < 65) m = 0.006;
    else if (age < 75) m = 0.016;
    else if (age < 85) m = 0.05;
    else if (age < 95) m = 0.13;
    else m = 0.28;
    const p = (m / 365) * (1 + Math.max(0, 55 - c.health) / 45);
    if (!S.rng.chance(p)) {
      c.health = D.clamp(c.health - (age > 55 ? 0.004 : 0.001) - (c.stress > 70 ? 0.002 : 0), 20, 98);
      return;
    }
    EN.die(S, c, day, age >= 80 ? 'vecchiaia' : (age > 40 ? 'malattia' : 'incidente'));
  };

  EN.die = function (S, c, day, cause) {
    c.alive = false;
    c.cause = cause;
    S.history.deceased.push({ id: c.id, day, cause });
    S.stats.counters.deaths = (S.stats.counters.deaths || 0) + 1;
    if (c.job) EN.leaveJob(S, c);
    const home = S.buildingsById[c.homeId];
    if (home) {
      const ix = home.residents.indexOf(c.id);
      if (ix >= 0) home.residents.splice(ix, 1);
    }
    EN.logEvent(S, 'città', '🕯️ Muore ' + c.name + ' ' + c.surname + ', ' + D.age(c, day * D.MPD) + ' anni' + (home ? ', abitante a ' + DATA.HOOD_BY_ID[home.hood].name : '') + '.', [c.id], 9);
    E.Bio.record(S, c, 'Muore a ' + DATA.CITY_NAME + ' a ' + D.age(c, day * D.MPD) + ' anni.', '🕯️', 9, 'death');
    for (const rid of EN.closeOnes(S, c, 6)) {
      const r = S.citizens[rid];
      if (!r || !r.alive || r.abroad) continue;
      const k = r.rels[c.id];
      const big = k && ['Coniuge', 'Famiglia', 'Fratello/Sorella'].includes(k.type);
      EN.pushMemory(S, r, day, 'La scomparsa di ' + c.name + ' ' + c.surname + '.', big ? 9 : 7);
      r.happiness = D.clamp(r.happiness - (big ? 22 : 12), 5, 95);
      if (big) r.stress = D.clamp(r.stress + 12, 0, 92);
    }
  };

  EN.wellbeingDrift = function (S, c, day) {
    const age = D.age(c, day * D.MPD);
    let target = 55 + c.pers.s * 0.18 + c.tend.ambition * 0.05;
    if (c.job) target += 8 + Math.min(10, c.job.wage / 600);
    else if (c.retired) target += 4;
    else if (age >= 19 && c.eduStage !== 'studente') target -= 9;
    if (c.spouse || c.partner) target += 8;
    target += Math.min(9, EN.closeOnesCached(S, c, day, 5).length * 1.6);
    if (c.stress > 70) target -= 10;
    for (const eff of S.effects) if (eff.happinessBoost) target += eff.happinessBoost;
    target -= Math.max(0, age - 78) * 0.25;
    c.happiness = D.lerp(c.happiness, D.clamp(target, 10, 95), 0.02);
    c.satisfaction = D.lerp(c.satisfaction, c.happiness, 0.01);
    const jobStress = (c.job && /Dirigente|Direttore|Manager|Preside|Redattore/.test(c.job.title)) ? 0.03 : 0.005;
    c.stress = D.clamp(c.stress + (S.rng.next() * 2 - 1) * 0.4 + jobStress - (c.happiness > 60 ? 0.05 : 0), 5, 92);
  };

  EN.emigrate = function (S, c, day) {
    if (!c.alive || c.abroad) return;
    c.abroad = true;
    c.abroadCity = S.rng.pick(DATA.FOREIGN_CITIES);
    c.abroadSince = day;
    if (c.job) EN.leaveJob(S, c);
    const home = S.buildingsById[c.homeId];
    if (home) {
      const ix = home.residents.indexOf(c.id);
      if (ix >= 0) home.residents.splice(ix, 1);
    }
    EN.logEvent(S, 'città', '🧳 ' + c.name + ' ' + c.surname + ' lascia ' + DATA.CITY_NAME + ' per ' + c.abroadCity + '.', [c.id], 6);
    E.Bio.record(S, c, 'Si trasferisce a ' + c.abroadCity + '.', '🧳', 7, 'move');
    S.stats.counters.migrationOut = (S.stats.counters.migrationOut || 0) + 1;
  };
})(window.EHL);
