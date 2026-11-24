'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const BIO = E.Bio = {};
  const D = E.Core, DATA = E.DATA, P = E.People;

  /* Registra un evento nella timeline (e memoria se rilevante) */
  BIO.record = function (S, c, text, ico, imp, cat) {
    c.timeline.push({ d: S.dayIndex, t: text, i: ico || '•', k: cat || 'evento' });
    if (imp >= 7 && text) {
      ENMem(S, c, text, imp);
    }
  };
  function ENMem(S, c, text, imp) {
    c.memories.push({ d: S.dayIndex, t: text.replace(/^(💍|👶|🕯️|🏠|🧳|🚆|🎓|❤️|✨) /, ''), imp });
    if (c.memories.length > 45) {
      let lowest = 0;
      for (let i = 1; i < c.memories.length; i++) if (c.memories[i].imp < c.memories[lowest].imp) lowest = i;
      c.memories.splice(lowest, 1);
    }
  }

  const CAT_LABEL = {
    birth: 'Origini', edu: 'Formazione', job: 'Lavoro', love: 'Amore', family: 'Famiglia',
    move: 'Case e città', social: 'Amicizie', death: 'Ultimo capitolo', evento: 'Vita'
  };
  BIO.CAT_LABEL = CAT_LABEL;

  /* Prima voce della timeline */
  BIO.initTimeline = function (S, c) {
    if (c.timeline.length) return;
    const ageAtStart = Math.floor((-c.birthIdx) / 365);
    if (c.birthIdx < 0) {
      const hood = c.originHood && DATA.HOOD_BY_ID[c.originHood] ? DATA.HOOD_BY_ID[c.originHood].name : DATA.CITY_NAME;
      const bornIn = D.START_YEAR + Math.floor(c.birthIdx / 365);
      c.timeline.push({
        d: c.birthIdx,
        t: ageAtStart > 0
          ? 'Nasce a ' + hood + ' nel ' + bornIn + ' (' + ageAtStart + ' anni prima dell\u2019inizio della simulazione).'
          : 'Nasce a ' + hood + ' nel ' + bornIn + '.',
        i: '👶', k: 'birth'
      });
      if (c.edu.level >= 1) {
        c.timeline.push({ d: Math.min(-1, c.birthIdx + 6 * 365), t: 'Cresce e studia: ' + P.eduLabel(c.edu.level) + '.', i: '🎓', k: 'edu' });
      }
    }
  };

  /* Stato attuale in una frase */
  BIO.currentLine = function (S, c) {
    const age = D.age(c, S.minutes);
    const d = D.dateFromMinutes(S.minutes);
    const home = S.buildingsById[c.homeId];
    const hood = home ? DATA.HOOD_BY_ID[home.hood].name : '—';
    if (!c.alive) {
      const dd = D.dateFromMinutes((S.history.deceased.find(x => x.id === c.id) || {}).day ? (S.history.deceased.find(x => x.id === c.id).day * D.MPD) : S.minutes);
      return 'È vissuto/a dal ' + (1900 + Math.floor(c.birthIdx / 365)) + ' fino al ' + dd.year + '. Cause: ' + (c.cause || '—') + '.';
    }
    if (c.abroad) {
      return 'Oggi ha ' + age + ' anni e vive a ' + (c.abroadCity || 'fuori città') + ', lontano da ' + DATA.CITY_NAME + '.';
    }
    let who;
    if (c.retired) who = 'pensionato/a';
    else if (c.eduStage === 'studente') who = 'studente/universitaria';
    else if (c.eduStage === 'scuola' || c.eduStage === 'istituto') who = 'studente, passa le giornate tra scuola e cortile';
    else if (c.eduStage === 'infanzia') who = 'bimbo/a curioso/a';
    else if (c.job) who = c.job.title + ' a ' + (S.buildingsById[c.job.buildingId] ? S.buildingsById[c.job.buildingId].name : '—');
    else who = 'in cerca di lavoro';
    const fam = c.spouse ? (' Vive con ' + ((S.citizens[c.spouse] || {}).name || 'il/la coniuge') + '.') : (c.partner ? (' In coppia con ' + ((S.citizens[c.partner] || {}).name || '') + '.') : (c.children.length ? ' Ha ' + c.children.length + ' figli.' : ''));
    return 'Ha ' + age + ' anni, vive a ' + hood + ' e oggi è ' + who + '.' + fam;
  };

  /* Biografia discorsiva generata dagli eventi veri */
  BIO.buildBio = function (S, c) {
    const par = [];
    const first = c.timeline.find(t => t.k === 'birth');
    if (first) {
      const hood = c.originHood && DATA.HOOD_BY_ID[c.originHood] ? DATA.HOOD_BY_ID[c.originHood].name : DATA.CITY_NAME;
      const ageAtStart = Math.floor(Math.abs(Math.min(0, c.birthIdx)) / 365);
      par.push((c.name + ' ' + c.surname) + ' nasce' + (c.sex === 'F' ? '' : '') + ' a ' + hood + (c.birthIdx < 0 ? (' nel ' + (D.START_YEAR + Math.floor(c.birthIdx / 365))) : ' durante la simulazione nel ' + D.dateFromMinutes(c.birthIdx * D.MPD).year) + '. La famiglia: ' + familyLine(S, c) + '.');
    }
    const eduT = c.timeline.filter(t => t.k === 'edu');
    if (eduT.length) {
      par.push('Studi: ' + eduT.map(t => t.t.replace(/\.$/, '')).join('; ') + '. È arrivato/a al livello «' + P.eduLabel(c.edu.level) + '».');
    }
    const jobT = c.timeline.filter(t => t.k === 'job');
    if (jobT.length || c.job) {
      const nowJob = c.job ? ('Oggi lavora come ' + c.job.title + ' a ' + jobName(S, c) + (c.retired ? ' (ora in pensione).' : '.')) : (c.retired ? 'Ora è in pensione.' : 'In questo periodo è senza lavoro.');
      const hist = jobT.slice(0, 4).map(t => t.t).join(' ');
      par.push((hist ? hist + ' ' : '') + nowJob);
    }
    const loveT = c.timeline.filter(t => t.k === 'love');
    if (loveT.length) {
      par.push('Cuore: ' + loveT.slice(0, 5).map(t => t.t.replace(/\.$/, '')).join('; ') + '.');
    }
    const famT = c.timeline.filter(t => t.k === 'family');
    if (famT.length) par.push('Famiglia: ' + famT.slice(0, 4).map(t => t.t.replace(/\.$/, '')).join('; ') + '.');
    const moveT = c.timeline.filter(t => t.k === 'move');
    if (moveT.length) par.push('Case e città: ' + moveT.slice(0, 4).map(t => t.t.replace(/\.$/, '')).join('; ') + '.');
    par.push(BIO.currentLine(S, c));
    return par;
  };

  function familyLine(S, c) {
    const parts = [];
    for (const pid of c.parents) {
      const p = S.citizens[pid];
      if (p) parts.push((p.sex === 'F' ? 'madre ' : 'padre ') + p.name + ' ' + p.surname);
    }
    if (c.spouse) { const s = S.citizens[c.spouse]; if (s) parts.push('coniuge ' + s.name); }
    if (!parts.length) parts.push(c.children.length ? 'genitore di ' + c.children.length + ' figli' : 'di origini lontane');
    return parts.join(', ');
  }
  function jobName(S, c) {
    const b = S.buildingsById[c.job.buildingId];
    return b ? b.name : '—';
  }

  /* Timeline leggibile con età */
  BIO.timelineFor = function (S, c) {
    return c.timeline.map(t => {
      const d = D.dateFromMinutes(t.d * D.MPD);
      const age = D.age(c, t.d * D.MPD);
      return { ...t, when: d.day + '/' + d.month + '/' + d.year, age };
    }).sort((a, b) => a.d - b.d);
  };

  /* Albero familiare: generazioni da un capostipite */
  BIO.dynasty = function (S, c, maxGen) {
    /* risale ai capi */
    let root = c;
    let guard = 0;
    while (root.parents.length && S.citizens[root.parents[0]] && guard++ < 20) root = S.citizens[root.parents[0]];
    const gen0 = [root];
    const seen = new Set([root.id]);
    const generations = [];
    let current = gen0;
    generations.push(current.map(m => node(S, m, 0)));
    for (let g = 1; g < (maxGen || 6); g++) {
      const next = [];
      for (const m of current) {
        for (const kidId of m.children) {
          if (seen.has(kidId)) continue;
          const kid = S.citizens[kidId];
          if (kid) { seen.add(kidId); next.push(kid); }
        }
      }
      if (!next.length) break;
      generations.push(next.map(m => node(S, m, g)));
      current = next;
    }
    return { root, generations };
  };
  function node(S, m, g) {
    const home = S.buildingsById[m.homeId];
    return {
      id: m.id, name: m.name, surname: m.surname, gen: g,
      years: (m.birthIdx < 0 ? (D.START_YEAR + Math.floor(m.birthIdx / 365)) : D.dateFromMinutes(m.birthIdx * D.MPD).year) + '–' + (m.alive ? 'oggi' : (S.history.deceased.find(x => x.id === m.id) ? D.dateFromMinutes(S.history.deceased.find(x => x.id === m.id).day * D.MPD).year : '?')),
      alive: m.alive, abroad: m.abroad ? (m.abroadCity || 'fuori città') : null,
      job: m.job ? m.job.title : (m.retired ? 'pensionato/a' : null),
      hood: home ? DATA.HOOD_BY_ID[home.hood].name : null,
      sex: m.sex
    };
  }
})(window.EHL);
