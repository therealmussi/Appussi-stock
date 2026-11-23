/* PARALLEL — interfaccia core: navigazione, flusso di gioco, modali, mappa, progetti */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});
  const el = id => document.getElementById(id);
  const F = PAR.fmt;

  const U = (PAR.UI = { S: null, tab: 'mappa', selDistretto: null, layer: 'uso-suolo', showReport: true });

  const NAV = [
    ['mappa', 'Mappa'], ['progetti', 'Progetti'], ['economia', 'Economia'],
    ['popolazione', 'Popolazione'], ['trasporti', 'Trasporti'], ['ambiente', 'Ambiente'],
    ['politica', 'Politica'], ['timeline', 'Timeline'], ['analisi', 'Analisi'],
    ['parallele', 'Timeline Parallele'], ['sistema', 'Sistema']
  ];

  PAR.UIU = {
    esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); },
    card(titolo, valore, sub, classe) {
      return `<div class="card ${classe || ''}"><div class="card-titolo">${titolo}</div><div class="card-valore">${valore}</div>${sub ? `<div class="card-sub">${sub}</div>` : ''}</div>`;
    },
    gauge(perc, colore) {
      const p = Math.round(Math.max(0, Math.min(100, perc)));
      return `<div class="barra"><div class="barra-fill" style="width:${p}%;background:${colore}"></div></div>`;
    },
    colorePer(v) {
      if (v < 20) return '#b0503f';
      if (v < 45) return '#c2853f';
      if (v < 70) return '#8a9a6b';
      return '#5f8763';
    },
    barreMini(pairs) {
      let html = '<div class="barreMini">';
      pairs.forEach(p => {
        html += `<div class="barreMini-riga"><span class="barreMini-label">${this.esc(p[0])}</span>${this.gauge(p[1], this.colorePer(p[1]))}<span class="barreMini-val">${p[2]}</span></div>`;
      });
      return html + '</div>';
    },
    riga(k, v) { return `<tr><td>${this.esc(k)}</td><td><strong>${v}</strong></td></tr>`; },
    ultimaSerie(h, chiave, f) {
      return h.map(x => [x.year, f ? f(x[chiave]) : x[chiave]]);
    },
    serieBase(sc, chiave, da, a, f) {
      const sez = sc.baseline[chiave];
      if (!sez) return [];
      const out = [];
      for (let y = da; y <= a; y++) out.push([y, f ? f(PAR.baseValue(sez, y)) : PAR.baseValue(sez, y)]);
      return out;
    }
  };

  function chiudiModal() { el('modal-root').innerHTML = ''; }
  U.chiudiModal = chiudiModal;
  U.gauge = PAR.UIU.gauge;
  U.colorePer = PAR.UIU.colorePer;

  function modal(html, dismissible) {
    const root = el('modal-root');
    root.innerHTML = `<div class="modal-overlay${dismissible ? ' dismissible' : ''}"><div class="modal-card">${html}</div></div>`;
    if (dismissible) {
      root.querySelector('.modal-overlay').addEventListener('click', ev => {
        if (ev.target === ev.currentTarget) root.innerHTML = '';
      });
    }
    return root.querySelector('.modal-card');
  }

  // ————— init —————
  U.init = function () {
    NAV.forEach(n => {
      const b = document.createElement('button');
      b.textContent = n[1];
      b.className = 'nav-btn';
      b.dataset.tab = n[0];
      b.addEventListener('click', () => { U.tab = n[0]; renderView(); });
      el('mainnav').appendChild(b);
    });
    el('btn-advance').addEventListener('click', avanza);
    el('btn-menu').addEventListener('click', () => { if (U.S) { U.tab = 'sistema'; renderView(); } });
    document.addEventListener('keydown', ev => {
      if (ev.key.toLowerCase() === 't' && !ev.target.matches('input,textarea')) avanza();
    });
    U.menu();
  };

  U.menu = function () {
    U.S = null;
    el('top-stats').innerHTML = '';
    el('status-right').textContent = '';
    el('btn-advance').disabled = true;
    const autos = PAR.store.read('autosave');
    const scList = PAR.SCENARIOS.map(sc => {
      const attivo = sc.id === 'torino1962';
      let blocco = '';
      if (attivo) {
        blocco = `<button class="btn btn-primary" id="btn-nuova">Inizia la campagna</button>`;
      } else {
        blocco = `<span class="sc-lock">in preparazione</span>`;
      }
      return `<div class="scenario-card ${attivo ? '' : 'scenario-locked'}">
        <h3>${sc.titolo}</h3><p class="sc-sub">${sc.sottotitolo}</p>
        <p class="sc-desc">${attivo
          ? 'Il primo scenario giocabile: la scelta di mobilità e forma urbana del dopoguerra, dal boom fino al nuovo secolo. Ogni decisione cambia i decenni che vengono.'
          : 'Scenario pianificato come modulo indipendente: non ancora giocabile in questa versione.'}</p>
        ${blocco}</div>`;
    }).join('');
    el('mainview').innerHTML = `
      <div class="home">
        <div class="home-hero">
          <h2 class="home-titolo">Che cosa sarebbe successo, se…</h2>
          <p class="home-testo">PARALLEL è una simulazione di storia alternativa con una componente di gestione
          territoriale. Puoi partire da un momento reale della storia, introdurre divergenze credibili e
          osservare come economia, demografia, mobilità, ambiente e società interagiscono nel tempo.</p>
          <p class="home-avvertenza">Le serie storiche mostrate dal gioco sono stime illustrative su base
          documentaria, non dati ufficiali: i risultati della simulazione sono ipotesi, non previsioni.</p>
          ${autos && autos.state && autos.state.systems
            ? `<div class="home-retake"><button class="btn" id="btn-continue">Riprendi la campagna dal ${autos.state.year}</button> <span class="nota">popolazione ${PAR.fmt.pop(autos.state.systems.demografia.popolazione)}</span></div>`
            : ''}
        </div>
        <div class="scenario-grid">${scList}</div>
        <div class="home-see">
          <label class="nota" for="input-seed">Seme di riproducibilità della simulazione:</label>
          <input id="input-seed" class="input" style="width:230px" value="84543">
        </div>
      </div>`;
    const start = el('btn-nuova');
    if (start) start.addEventListener('click', () => {
      const seed = parseInt(el('input-seed').value, 10) || 84543;
      U.S = PAR.newState('torino1962', seed);
      el('btn-advance').disabled = false;
      U.tab = 'mappa';
      renderView();
      U.intro();
    });
    const cont = el('btn-continue');
    if (cont) cont.addEventListener('click', () => {
      U.S = PAR.deserialize(autos);
      el('btn-advance').disabled = false;
      U.tab = 'mappa';
      renderView();
    });
  };

  U.intro = function () {
    const sc = PAR.Engine.scenario;
    const m = modal(`
      <h2 class="modal-titolo">${sc.titolo} — ${sc.sottotitolo}</h2>
      <p class="ruolo">Il tuo ruolo: <strong>${sc.ruolo}</strong></p>
      <p class="modal-testo">${sc.start.introText}</p>
      <p class="modal-hint">Non sarai mai perfettamente informato: le conseguenze vere le scoprirai decenni più tardi, come nella vita delle città.</p>
      <div class="modal-foot"><button class="btn btn-primary" id="btn-intro-ok">Cominciamo</button></div>`, false);
    m.querySelector('#btn-intro-ok').addEventListener('click', () => {
      chiudiModal();
      avanza();
    });
  };

  // ————— avanzamento —————
  function avanza() {
    const S = U.S;
    if (!S) return;
    flushEventi(S);
    if (S.activeEvents.length) { mostraEvento(); return; }
    if (S.pendingDecisions.length) { mostraDecisione(); return; }

    if (S.year >= S.endYear) {
      if (!S.finaleMostrato) { S.finaleMostrato = true; U.mostraRapporto(); }
      return;
    }

    const report = PAR.Engine.simulateYear(S);
    flushEventi(S);
    salva();

    if (S.activeEvents.length) { renderView(); mostraEvento(); return; }
    if (S.pendingDecisions.length) { renderView(); mostraDecisione(); return; }

    renderView();
    if (S.year >= S.endYear && !S.finaleMostrato) { S.finaleMostrato = true; U.mostraRapporto(); }
    else if (U.showReport) mostraResoconto(report);
  }
  U.avanza = avanza;

  function flushEventi(S) {
    if (S.pendingEvents.length) {
      S.activeEvents = S.activeEvents.concat(S.pendingEvents);
      S.pendingEvents = [];
    }
  }

  function salva() {
    if (U.S) PAR.store.write('autosave', PAR.serialize(U.S));
  }

  function mostraResoconto(report) {
    let righe = '';
    report.completati.forEach(c => { righe += `<li class="ok">Completato: <strong>${PAR.UIU.esc(c.nome)}</strong> — ${PAR.UIU.esc(c.effetto)}</li>`; });
    report.decisioni.forEach(d => { righe += `<li class="dec">Decisione: ${PAR.UIU.esc(d.titolo)} — ${PAR.UIU.esc(d.scelta)}</li>`; });
    report.milestone.forEach(m => { righe += `<li class="st">${PAR.UIU.esc(m.titolo)} — ${PAR.UIU.esc(m.testo)}</li>`; });
    report.noteEconomia.forEach(n => { righe += `<li class="eco">${PAR.UIU.esc(n)}</li>`; });
    (report.noteTerritorio || []).forEach(n => { righe += `<li class="eco">${PAR.UIU.esc(n)}</li>`; });
    if (!righe) righe = '<li class="eco">Anno tranquillo, nessun cambio rilevante.</li>';
    const m = modal(`
      <h3 class="modal-titolo">Anno ${report.anno} — che cosa è successo</h3>
      <ul class="resoconto">${righe}</ul>
      <div class="modal-foot">
        <button class="btn" id="m-chiudi">Chiudi</button>
        <button class="btn btn-primary" id="m-avanti">Avanza ancora ▸</button>
      </div>
      <label class="mini-check"><input type="checkbox" id="m-noreport" ${U.showReport ? '' : 'checked'}> non mostrare più il resoconto automaticamente</label>`, true);
    m.querySelector('#m-chiudi').addEventListener('click', chiudiModal);
    m.querySelector('#m-avanti').addEventListener('click', () => { chiudiModal(); avanza(); });
    m.querySelector('#m-noreport').addEventListener('change', ev => { U.showReport = !ev.target.checked; });
  }

  // ————— decisioni —————
  function mostraDecisione() {
    const S = U.S;
    const pend = S.pendingDecisions[0];
    const dec = PAR.Engine.decisioni.find(d => d.id === pend.id);
    if (!dec) { S.pendingDecisions.shift(); return; }
    const opzioni = dec.opzioni.map((o, i) => {
      const abbordabile = !o.costo || (o.costo <= S.treasury + Math.max(0, S.finanza ? S.finanza.saldo : 0));
      return `<div class="opzione">
        <div class="opzione-testa">
          <button class="btn opzione-btn" data-i="${i}">${o.label}</button>
          <span class="costo ${abbordabile ? '' : 'no'}">${o.costo ? o.costo + ' Mld L' : 'gratuita'}</span>
        </div>
        <div class="opzione-desc">${o.effettoDesc}</div>
      </div>`;
    }).join('');
    modal(`
      <div class="chips"><span class="chip chip-anno">${pend.anno}</span><span class="chip">decisione storica</span></div>
      <h2 class="modal-titolo">${dec.titolo}</h2>
      <p class="modal-testo">${dec.testo}</p>
      ${opzioni}`, false);
    el('modal-root').querySelectorAll('.opzione-btn').forEach(b => {
      b.addEventListener('click', () => {
        PAR.Actions.resolveDecision(S, pend.id, parseInt(b.dataset.i, 10));
        S.pendingDecisions.shift();
        el('modal-root').innerHTML = '';
        renderView();
        if (S.pendingDecisions.length) mostraDecisione();
        else if (S.activeEvents.length) mostraEvento();
        else salva();
      });
    });
  }

  // ————— eventi —————
  function mostraEvento() {
    const S = U.S;
    const evId = S.activeEvents[0];
    const ev = PAR.Engine.eventi.find(x => x.id === evId);
    if (!ev) { S.activeEvents.shift(); return; }
    const opzioni = ev.opzioni.map((o, i) => {
      const abbordabile = !o.costo || (o.costo <= S.treasury && S.debt < 380);
      return `<div class="opzione">
        <div class="opzione-testa">
          <button class="btn opzione-btn" data-i="${i}">${o.label}</button>
          <span class="costo ${abbordabile ? '' : 'no'}">${o.costo ? o.costo + ' Mld L' : 'gratuita'}</span>
        </div>
        <div class="opzione-desc">${o.effettoDesc}</div></div>`;
    }).join('');
    modal(`
      <div class="chips"><span class="chip chip-anno">${S.year}</span><span class="chip">evento</span></div>
      <h2 class="modal-titolo">${ev.titolo}</h2>
      <p class="modal-testo">${ev.testo}</p>${opzioni}`, false);
    el('modal-root').querySelectorAll('.opzione-btn').forEach(b => {
      b.addEventListener('click', () => {
        PAR.Actions.resolveEvent(S, evId, parseInt(b.dataset.i, 10));
        S.activeEvents.shift();
        el('modal-root').innerHTML = '';
        renderView();
        if (S.activeEvents.length) mostraEvento();
        else salva();
      });
    });
  }

  // ————— rapporto finale —————
  U.mostraRapporto = function () {
    const S = U.S;
    const rep = PAR.Engine.classificaFinale(S);
    const d = rep.dims;
    const nomi = {
      economia: 'Economia', ambiente: 'Ambiente', accessibilita: 'Accessibilità',
      equitaSociale: 'Equità sociale', abitazione: 'Abitare',
      tenutaFinanziaria: 'Finanza pubblica', resilienza: 'Resilienza'
    };
    let dimHtml = '';
    Object.keys(d).forEach(k => {
      dimHtml += `<div class="dim"><span>${nomi[k]}</span>${U.gauge(d[k], U.colorePer(d[k]))}<span>${Math.round(d[k])}</span></div>`;
    });
    let confronto = `<table class="tabella"><thead><tr><th>indicatore (${rep.anniSimulati} anni simulati)</th><th>la tua Torino</th><th>storica (stima)</th></tr></thead><tbody>`;
    const C = rep.confronto;
    const righeC = [
      ['pop', 'popolazione', x => PAR.fmt.pop(x * 1000)],
      ['auto', 'auto per 1.000 ab.', x => PAR.fmt.num(x)],
      ['tpubb', 'quota trasporto pubblico', x => x + '%'],
      ['poll', 'inquinamento (indice)', x => PAR.fmt.num(x)],
      ['verde', 'verde per abitante', x => x + ' m²'],
      ['disocc', 'disoccupazione', x => x + '%']
    ];
    righeC.forEach(r => {
      confronto += `<tr><td>${r[1]}</td><td><strong>${r[2](C[r[0]].giocatore)}</strong></td><td>${r[2](C[r[0]].base)}</td></tr>`;
    });
    confronto += '</tbody></table>';

    S.finalReport = rep;
    const m = modal(`
      <div class="chips"><span class="chip chip-anno">${S.year}</span><span class="chip">rapporto finale</span></div>
      <h2 class="modal-titolo">${rep.archetipo.nome}</h2>
      <p class="modal-testo modal-heavy">${rep.archetipo.descr}</p>
      <h4>Le dimensioni della città</h4>${dimHtml}
      <h4>Confronto con la storia reale (${S.year}, stime)</h4>${confronto}
      <p class="modal-hint">Non esiste un punteggio universale: questo è il tipo di città emerso dalle tue scelte.
      La simulazione è un ipotesi, non una ricostruzione esaustiva. Il divertimento vero è ripartire e chiedersi:
      «E se avessi scelto diversamente?»</p>
      <div class="modal-foot">
        <button class="btn" id="f-chiudi">Guarda la città</button>
        <button class="btn btn-primary" id="f-prosegui">Prosegui fino al ${PAR.Engine.scenario.start.maxYear}</button>
      </div>`, true);
    m.querySelector('#f-chiudi').addEventListener('click', chiudiModal);
    m.querySelector('#f-prosegui').addEventListener('click', () => {
      S.endYear = PAR.Engine.scenario.start.maxYear;
      S.finaleMostrato = true;
      chiudiModal();
      renderView();
    });
  };

  // ————— top bar e nav —————
  function renderTop() {
    const S = U.S;
    if (!S) { el('top-stats').innerHTML = ''; return; }
    const v = PAR.Engine.derived(S);
    const pend = S.pendingDecisions.length + S.activeEvents.length;
    el('top-stats').innerHTML =
      topStat('anno', S.year) +
      topStat('saldo', F.money(v.saldo), v.saldo < 0 ? 'warn' : 'ok') +
      topStat('debito', F.money(S.debt), S.debt > 320 ? 'warn' : '') +
      topStat('abitanti', F.pop(v.popolazione)) +
      topStat('qualità vita', Math.round(v.qol), v.qol < 40 ? 'warn' : '') +
      topStat('approvazione', Math.round(v.approvazione), v.approvazione < 35 ? 'warn' : '');
    el('btn-advance').textContent = S.year >= S.endYear ? 'Prosegui ▸' : 'Avanza un anno ▸';
    let st = 'seed ' + S.rngSeed + ' · ' + S.decisionsTaken.length + ' decisioni';
    if (pend) st = 'in attesa di scelta: ' + pend + ' — ' + st;
    el('status-right').textContent = st;
  }
  function topStat(label, valore, tone) {
    return `<div class="top-stat ${tone || ''}"><span class="ts-label">${label}</span><span class="ts-val">${valore}</span></div>`;
  }

  function renderNav() {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('attivo', b.dataset.tab === U.tab);
    });
  }

  // ————— render vista corrente —————
  function renderView() {
    renderTop();
    renderNav();
    if (!U.S) return;
    const ids = { mappa: 'vista_mappa', progetti: 'vista_progetti', economia: 'vista_economia',
      popolazione: 'vista_popolazione', trasporti: 'vista_trasporti', ambiente: 'vista_ambiente',
      politica: 'vista_politica', timeline: 'vista_timeline', analisi: 'vista_analisi',
      parallele: 'vista_parallele', sistema: 'vista_sistema' };
    const fn = U[ids[U.tab]];
    if (!fn) { el('mainview').innerHTML = '<p class="pan-nota">Vista non disponibile.</p>'; return; }
    fn(el('mainview'));
  }
  U.renderView = renderView;

  // ————— VISTA MAPPA —————
  U.vista_mappa = function (root) {
    const S = U.S;
    let tb = '<div class="toolbar">';
    PAR.Map.layers.forEach(l => {
      tb += `<button class="btn layer-btn ${U.layer === l.id ? 'attivo' : ''}" data-l="${l.id}">${l.nome}</button>`;
    });
    tb += '</div>';
    root.innerHTML = `<div class="grid-mappa">
      <div class="mappa-frame">${tb}<div id="mappa-svg" class="mappa-box"></div><div id="mappa-legenda" class="mappa-legenda"></div></div>
      <div class="mappa-side" id="mappa-side"></div></div>`;
    drawMappa();
    root.querySelectorAll('.layer-btn').forEach(b => b.addEventListener('click', () => {
      U.layer = b.dataset.l;
      U.vista_mappa(root);
    }));
    mostraDistretto();
  };

  function drawMappa() {
    const box = el('mappa-svg');
    if (!box) return;
    PAR.Map.render(box, U.S, U.layer, U.selDistretto, {
      onSelect: function (id) { U.selDistretto = id; drawMappa(); mostraDistretto(); }
    });
    const leg = PAR.Map.legenda(U.S, U.layer);
    const box2 = el('mappa-legenda');
    const nomeLayer = PAR.Map.layers.find(l => l.id === U.layer).nome;
    if (leg.stops) {
      box2.innerHTML = `<span class="leg-titolo">${nomeLayer}</span>` +
        leg.stops.map(st => `<span class="leg-stop"><span class="leg-c" style="background:${st.c}"></span>${st.v}</span>`).join('') +
        '<span class="leg-note">corridoi: blu=metro · ambra=tranvia · viola=ferrovia · scuro=strade · tratteggio=in corso</span>';
    } else {
      box2.innerHTML = `<span class="leg-titolo">${nomeLayer}</span><span class="leg-note">corridoi: blu=metro · ambra=tranvia · viola=ferrovia · scuro=strade · tratteggio=in corso</span>`;
    }
  }

  function mostraDistretto() {
    const side = el('mappa-side');
    const S = U.S;
    if (!side) return;
    const d = U.selDistretto ? S.territorio.distretti.find(x => x.id === U.selDistretto) : S.territorio.distretti[0];
    if (!d) { side.innerHTML = ''; return; }
    const esp = (d.costruitoHa - (d.costruito0 || d.costruitoHa)).toFixed(1);
    side.innerHTML = `<h3>${d.nome}</h3>
      <table class="tabella"><tbody>
      ${PAR.UIU.riga('residenti', PAR.fmt.num(Math.round(d.residenti)))}
      ${PAR.UIU.riga('abitazioni', PAR.fmt.num(Math.round(d.abitazioni)))}
      ${PAR.UIU.riga('occupati', PAR.fmt.num(Math.round(d.occupati)))}
      ${PAR.UIU.riga('di cui in industria', PAR.fmt.num(Math.round(d.industrie)))}
      ${PAR.UIU.riga('densità', (d.residenti / d.supHa).toFixed(1) + ' ab/ha')}
      ${PAR.UIU.riga('accessibilità', Math.round(d.accessibilita * 100) + '/100')}
      ${PAR.UIU.riga('verde', PAR.fmt.num(Math.round(d.verdeHa)) + ' ha')}
      ${PAR.UIU.riga('frazione costruita', Math.round(d.costruitoHa / d.supHa * 100) + '%')}
      ${PAR.UIU.riga('edificato dal 1962', '+' + esp + ' ha')}
      </tbody></table>
      <p class="nota">Il dettaglio è una ripartizione interna della simulazione: i totali di riferimento sono nei pannelli analitici.</p>`;
  }

  // ————— VISTA PROGETTI —————
  U.vista_progetti = function (root) {
    const S = U.S;
    const cats = [['trasporti', 'Trasporti'], ['urbanistica', 'Urbanistica'], ['economia', 'Economia'], ['ambiente', 'Ambiente e riqualificazione']];
    let html = '<h2 class="pan-titolo">Programmi e cantieri</h2>' +
      '<p class="pan-nota">Ogni progetto ha un costo comunale (dopo cofinanziamento stato/regione), durata dei lavori, manutenzione annuale ed effetti che maturano nel tempo. Massimo 4 cantieri contemporanei: scegliere è rinunciare.</p>';
    cats.forEach(c => {
      html += `<h3 class="cat-titolo">${c[1]}</h3><div class="progetti-grid">`;
      PAR.Engine.progetti.filter(p => p.cat === c[0]).forEach(def => {
        const corsi = S.projects.filter(p => p.id === def.id && !p.completato);
        const fatti = PAR.Actions.eseguiti(S, def.id);
        const maxR = def.ripetibile || 1;
        const check = PAR.Actions.canApprove(S, def.id);
        const costoComunale = PAR.Engine.costoTotale(S, def) * (1 - def.cofin);
        const stato = corsi.length
          ? `<span class="chip chip-cantiere">in cantiere ${Math.round(corsi[0].progresso)}%</span>`
          : fatti >= maxR ? '<span class="chip chip-fatto">completato</span>' : '';
        html += `<div class="progetto-card ${stato.includes('cantiere') ? 'in-corso' : ''}">
          <div class="pr-head"><strong>${def.nome}</strong>${stato}</div>
          <div class="pr-meta"><span>comunale <strong>${F.money(costoComunale)}</strong></span>
          <span>${F.money(costoComunale / def.durata)}/anno × ${def.durata}</span>
          <span>cofin. ${Math.round(def.cofin * 100)}%</span>
          <span>manut. ${F.money(def.mantenimento)}/anno</span></div>
          <p class="pr-effetto">${def.effettoDesc}</p>
          ${corsi.length
            ? `<div class="barra"><div class="barra-fill" style="width:${Math.round(corsi[0].progresso)}%;background:#8a9a6b"></div></div>`
            : `<div class="pr-foot"><button class="btn btn-approva" data-id="${def.id}" ${check.ok ? '' : 'disabled'}>${check.ok ? 'Approva' : PAR.UIU.esc(check.motivo)}</button></div>`}
        </div>`;
      });
      html += '</div>';
    });
    root.innerHTML = html;
    root.querySelectorAll('.btn-approva').forEach(b => b.addEventListener('click', () => {
      const res = PAR.Actions.approve(U.S, b.dataset.id);
      if (!res.ok) alert('Impossibile avviare: ' + res.motivo);
      else renderView();
    }));
  };
})();
