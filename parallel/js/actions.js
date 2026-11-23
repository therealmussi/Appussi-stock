/* PARALLEL — azioni del giocatore su uno stato: approvare progetti, rispondere a decisioni ed eventi */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});

  const A = (PAR.Actions = {});

  A.defProgetto = function (S, id) { return PAR.Engine.progetti.find(x => x.id === id); };

  A.eseguiti = function (S, id) {
    return S.projects.filter(p => p.id === id && p.completato).length;
  };

  A.canApprove = function (S, id) {
    const def = A.defProgetto(S, id);
    if (!def) return { ok: false, motivo: 'Progetto inesistente' };
    const singoli = S.projects.filter(p => p.id === id && !p.completato).length;
    if (singoli > 0) return { ok: false, motivo: 'Già in cantiere' };
    const maxR = def.ripetibile || 1;
    if (A.eseguiti(S, id) >= maxR) return { ok: false, motivo: 'Programma già completato il numero massimo di volte' };
    if (def.req && A.eseguiti(S, def.req) === 0) {
      const reqDef = A.defProgetto(S, def.req);
      return { ok: false, motivo: 'Richiede prima: ' + (reqDef ? reqDef.nome : def.req) };
    }
    if (def.minYear && S.year < def.minYear) return { ok: false, motivo: 'Disponibile dal ' + def.minYear };
    const costoAnnuo = PAR.Engine.costoAnnuale(S, def);
    const inCantiere = PAR.Engine.progettiInCorso(S).length;
    if (inCantiere >= 4) return { ok: false, motivo: 'Troppi cantieri aperti (max 4)' };
    if (S.treasury + (S.finanza && S.finanza.saldo > 0 ? S.finanza.saldo : 0) < costoAnnuo * 0.6) {
      return { ok: false, motivo: 'Cassa insufficiente per il primo anno di lavori (' + PAR.fmt.money(costoAnnuo) + '/anno)' };
    }
    if (S.debt > 380) return { ok: false, motivo: 'Debito oltre ogni copertura: prima serve un piano di pareggio' };
    return { ok: true, nota: costoAnnuo };
  };

  A.approve = function (S, id) {
    const check = A.canApprove(S, id);
    if (!check.ok) return check;
    const def = A.defProgetto(S, id);
    const pro = { id: id, avvio: S.year, progresso: 0, completato: false, corridoio: def.corridoio, cat: def.cat };
    S.projects.push(pro);
    PAR.Engine.timelineAdd(S, {
      year: S.year, kind: 'progetto', tag: 'DECISO',
      titolo: 'Avviato cantiere: ' + def.nome,
      testo: 'Costo totale ' + PAR.fmt.money(PAR.Engine.costoTotale(S, def)) + ' (quota comunale), ' + def.durata + ' anni di lavori.'
    });
    return { ok: true };
  };

  function sosteniCosto(S, costo) {
    if (costo <= 0) return;
    const daCassa = Math.min(S.treasury, costo);
    S.treasury -= daCassa;
    S.debt += costo - daCassa;
  }

  A.defDecisione = function (S, id) { return PAR.Engine.decisioni.find(x => x.id === id); };
  A.defEvento = function (S, id) { return PAR.Engine.eventi.find(x => x.id === id); };

  A.resolveDecision = function (S, decId, optionIdx) {
    const dec = A.defDecisione(S, decId);
    if (!dec || !dec.opzioni[optionIdx]) return { ok: false };
    const opz = dec.opzioni[optionIdx];
    sosteniCosto(S, opz.costo || 0);
    opz.apply(S);
    PAR.Engine.mod && null;
    S.decisionsTaken.push(decId);
    S.pendingDecisions = S.pendingDecisions.filter(p => p.id !== decId);
    S.yearReport.decisioni.push({ titolo: dec.titolo, scelta: opz.label });
    PAR.Engine.timelineAdd(S, {
      year: S.year, kind: 'decisione', tag: 'DECISO',
      titolo: dec.titolo + ' — ' + opz.label,
      testo: opz.effettoDesc
    });
    if (decId === 'alluvione-po') S.flags.lastAlluvione = S.year;
    if (decId === 'alluvione-rischio') S.flags.lastAlluvione = S.year;
    return { ok: true };
  };

  A.resolveEvent = function (S, evId, optionIdx) {
    const ev = A.defEvento(S, evId);
    if (!ev || !ev.opzioni[optionIdx]) return { ok: false };
    const opz = ev.opzioni[optionIdx];
    sosteniCosto(S, opz.costo || 0);
    opz.apply(S);
    S.activeEvents = S.activeEvents.filter(x => x !== evId);
    PAR.Engine.timelineAdd(S, {
      year: S.year, kind: 'evento', tag: 'SIMULATO',
      titolo: ev.titolo + ' — ' + opz.label,
      testo: opz.effettoDesc
    });
    return { ok: true };
  };
})();
