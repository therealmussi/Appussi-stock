'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const Views = E.Views = {};
  const D = E.Core, DATA = E.DATA, P = E.People, BIO = E.Bio, EN = E.Engine;
  const CH = E.Charts, UI = E.UI;
  let S = null;

  function el(tag, cls, text) { return UI.el(tag, cls, text); }
  function card(title) {
    const c = el('div', 'cardline');
    if (title) c.appendChild(el('h3', null, title));
    return c;
  }
  function kpi(v, l) {
    const k = el('div', 'kpi');
    k.appendChild(el('div', 'v', String(v)));
    k.appendChild(el('div', 'l', l));
    return k;
  }
  function kpis(list) {
    const g = el('div', 'kpis');
    for (const [v, l] of list) g.appendChild(kpi(v, l));
    return g;
  }

  /* ============ CITTADINI ============ */
  Views.cittadini = function (wrap) {
    S = E.state;
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);
    const deadOrAbroad = Object.values(S.citizens).filter(c => !c.alive || c.abroad);
    wrap.appendChild(kpis([
      [live.length, 'abitanti in città'],
      [live.filter(c => c.job).length, 'occupati'],
      [deadOrAbroad.filter(c => c.alive).length, 'all\u2019estero'],
      [deadOrAbroad.length - deadOrAbroad.filter(c => c.alive).length, 'defunti commemorati']
    ]));
    const bar = el('div', 'rowline');
    bar.style.marginBottom = '12px';
    const search = el('input');
    search.placeholder = 'Cerca per nome o cognome…';
    search.style.flex = '1';
    const sortSel = el('select');
    for (const [v, lbl] of [['eta', 'Età'], ['nome', 'Nome'], ['soddisfazione', 'Soddisfazione'], ['risparmi', 'Risparmi'], ['legami', 'Numero di legami']])
      sortSel.appendChild(new Option(lbl, v));
    bar.appendChild(search); bar.appendChild(sortSel);
    wrap.appendChild(bar);
    const list = el('div');
    list.className = 'cardline scrolly';
    wrap.appendChild(list);

    function render() {
      const q = search.value.trim().toLowerCase();
      let rows = live.filter(c => !q || (c.name + ' ' + c.surname).toLowerCase().indexOf(q) !== -1);
      const k = sortSel.value;
      rows.sort((a, b) =>
        k === 'nome' ? (a.surname + a.name).localeCompare(b.surname + b.name) :
        k === 'soddisfazione' ? b.satisfaction - a.satisfaction :
        k === 'risparmi' ? b.savings - a.savings :
        k === 'legami' ? Object.keys(b.rels).length - Object.keys(a.rels).length :
        D.age(b, S.minutes) - D.age(a, S.minutes));
      list.innerHTML = '';
      for (const c of rows.slice(0, 200)) list.appendChild(UI.personRow(S, c, D.age(c, S.minutes) + ' anni · ' + (c.job ? c.job.title : (c.retired ? 'pensione' : 'studente'))));
      if (rows.length > 200) list.appendChild(el('div', 'muted', '…e altri ' + (rows.length - 200) + '. Affina la ricerca.'));
    }
    search.addEventListener('input', render);
    sortSel.addEventListener('change', render);
    render();
    return { title: 'Cittadini di Northbridge', sub: 'Ogni riga apre la vita completa di una persona.' };
  };

  /* ============ FAMIGLIE ============ */
  Views.famiglie = function (wrap) {
    S = E.state;
    const roots = {};
    for (const c of Object.values(S.citizens)) {
      let top = c, guard = 0;
      while (top.parents.length && S.citizens[top.parents[0]] && guard++ < 20) top = S.citizens[top.parents[0]];
      roots[top.id] = (roots[top.id] || 0) + 1;
    }
    const sorted = Object.values(S.citizens).filter(c => roots[c.id])
      .sort((a, b) => roots[b.id] - roots[a.id] || (a.surname).localeCompare(b.surname));
    wrap.appendChild(kpis([[sorted.length, 'dinastie cittadine']]));
    const intro = el('div', 'cardline');
    intro.appendChild(el('p', 'bio-par', 'Ogni dinastia parte dal capostipite censito nel ' + D.START_YEAR + ' (o dal primo immigrato). Clicca un membro per aprire la sua vita; qui sotto trovi generazioni, anni di nascita e morte, mestieri e chi è emigrato.'));
    wrap.appendChild(intro);
    for (const root of sorted.slice(0, 40)) {
      const dyn = BIO.dynasty(S, root, 6);
      const nGen = dyn.generations.length;
      if (roots[root.id] < 2 && nGen < 3) continue;
      const c = card(root.surname + (root.surname !== dyn.root.surname ? ' (nati ' + dyn.root.surname + ')' : '') + ' — ' + (roots[root.id] + 1) + ' membri');
      dyn.generations.forEach((gen, gi) => {
        const blk = el('div', 'gen-block');
        blk.appendChild(el('div', 'hl', 'Generazione ' + (gi + 1)));
        for (const m of gen) {
          const orig = S.citizens[m.id];
          if (!orig) continue;
          blk.appendChild(UI.personRow(S, orig, m.years + (m.abroad ? ' · emigrato a ' + m.abroad : '') + (m.job ? ' · ' + m.job : '') + (m.hood ? ' · ' + m.hood : '')));
        }
        c.appendChild(blk);
      });
      wrap.appendChild(c);
    }
    return { title: 'Famiglie e dinastie', sub: 'Il titolo elegante della collezione: quattro o cinque generazioni, una storia sola.' };
  };

  /* ============ RELAZIONI ============ */
  Views.relazioni = function (wrap) {
    S = E.state;
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad).sort((a, b) => Object.keys(b.rels).length - Object.keys(a.rels).length);
    wrap.appendChild(el('h2', null, 'Rete sociale'));
    wrap.appendChild(el('div', 'subline', 'Scegli un abitante: il grafo mostra i suoi legami reali, spessore = affetto, colore = tipo di relazione.'));
    const selrow = el('div', 'rowline');
    selrow.style.marginBottom = '10px';
    const tabs = el('div', 'tabs');
    let cur = live[0];
    const cvs = document.createElement('canvas');
    cvs.style.width = '100%'; cvs.style.height = '480px';
    wrap.appendChild(selrow); wrap.appendChild(cvs);
    const legend = el('div', 'muted', 'Coniuge/Coppia in terracotta · Amicizie in verde · Famiglia in blu · lavoro in grigio · Ex e rivalità in rosso scuro.');
    wrap.appendChild(legend);

    function draw() {
      tabs.querySelectorAll('b').forEach(() => {});
      selrow.innerHTML = '';
      const names = live.slice(0, 300);
      const sel = el('select');
      sel.style.minWidth = '280px';
      for (const c of names) sel.appendChild(new Option(c.name + ' ' + c.surname + ' (' + Object.keys(c.rels).length + ' legami)', c.id));
      sel.value = cur.id;
      sel.addEventListener('change', () => { cur = S.citizens[+sel.value]; draw(); });
      selrow.appendChild(sel);
      drawGraph(cvs, cur);
    }
    draw();
    return { title: 'Relazioni', sub: 'La mappa dei legami che la città ha tessuto da sola.' };
  };

  const REL_COLORS = {
    'Coniuge': '#c96f5a', 'Coppia': '#c96f5a', 'Fidanzati': '#c96f5a', 'Interesse romantico': '#d4937f',
    'Famiglia': '#5577a8', 'Fratello/Sorella': '#5577a8',
    'Amico': '#5f8f6a', 'Amico stretto': '#3f7a4e',
    'Collega': '#8a8a8a', 'Compagno': '#8a8a8a', 'Conosciuto': '#b7ae9a',
    'Ex': '#8a4a3a', 'Ex coniuge': '#8a4a3a', 'Rivalità': '#a03030'
  };

  function drawGraph(canvas, cur) {
    canvas.width = canvas.clientWidth * 2; canvas.height = 480 * 2;
    const x = canvas.getContext('2d'); x.scale(2, 2);
    const W = canvas.clientWidth, H = 480, cx = W / 2, cy = H / 2;
    const rels = Object.entries(cur.rels).map(([oid, r]) => ({ r, o: S.citizens[oid] })).filter(z => z.o).sort((a, b) => b.r.aff - a.r.aff);
    const shown = rels.slice(0, 26);
    const pal = P.avatarPalette(cur);
    x.fillStyle = '#fbf7ec'; x.fillRect(0, 0, W, H);
    x.fillStyle = pal.shirt; x.beginPath(); x.arc(cx, cy, 15, 0, 7); x.fill();
    x.strokeStyle = '#3a3226'; x.stroke();
    x.fillStyle = '#3a3226'; x.font = '700 12px system-ui'; x.textAlign = 'center';
    x.fillText(cur.name, cx, cy + 32);
    const n = shown.length;
    canvas.__nodes = [];
    shown.forEach((z, i) => {
      const ang = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2 ;
      const rad = 120 + (n > 14 ? 60 : 0) + (i % 3) * 26;
      const px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
      canvas.__nodes.push({ x: px, y: py, id: z.o.id });
      x.strokeStyle = REL_COLORS[z.r.type] || '#b7ae9a';
      x.globalAlpha = 0.35 + (z.r.aff / 100) * 0.6;
      x.lineWidth = 1 + (z.r.aff / 100) * 3;
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke();
      x.globalAlpha = 1;
      const pp = P.avatarPalette(z.o);
      x.fillStyle = z.o.alive ? pp.shirt : '#b5aca4';
      x.beginPath(); x.arc(px, py, 7, 0, 7); x.fill();
      x.fillStyle = '#3a3226'; x.font = '11px system-ui';
      x.fillText(z.o.name.split(' ')[0], px, py - 11);
      x.fillStyle = '#8a7f72'; x.font = '10px system-ui';
      x.fillText(z.r.type, px, py + 18);
    });
    canvas.onclick = function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      for (const nd of (canvas.__nodes || [])) {
        if (Math.hypot(nd.x - mx, nd.y - my) < 12) { UI.openCitizen(nd.id); return; }
      }
    };
  }

  /* ============ ECONOMIA ============ */
  Views.economia = function (wrap) {
    S = E.state;
    const Y = S.stats.yearly;
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);
    const emp = live.filter(c => c.job).length;
    wrap.appendChild(kpis([
      ['€' + (S.funds || 0).toLocaleString('it-IT'), 'cassa comunale'],
      [emp, 'occupati oggi'],
      [Y.length ? Y[Y.length - 1].unemployment.toFixed(1) : '—', 'disoccupazione % (ultimo anno)'],
      [S.buildings.filter(b => b.business && !b.business.closed).length, 'attività aperte'],
      [S.history.closedB.length, 'attività chiuse dal ' + D.START_YEAR]
    ]));
    const labels = Y.map(y => y.year);
    const c1 = card('Disoccupazione (%)');
    const cv1 = document.createElement('canvas'); cv1.className = 'chart'; c1.appendChild(cv1); wrap.appendChild(c1);
    const c2 = card('Reddito medio e risparmi medi (€)');
    const cv2 = document.createElement('canvas'); cv2.className = 'chart'; c2.appendChild(cv2); wrap.appendChild(c2);
    const c3 = card('Attività: aperte vs chiuse per anno');
    const cv3 = document.createElement('canvas'); cv3.className = 'chart'; c3.appendChild(cv3); wrap.appendChild(c3);
    CH.line(cv1, [{ label: 'Disoccupazione %', color: '#c96f5a', data: Y.map(y => +(y.unemployment * 100).toFixed(1)) }], { xLabels: labels, min: 0, max: 25 });
    CH.line(cv2, [
      { label: 'Reddito medio', color: '#5f8f6a', data: Y.map(y => y.avgIncome) },
      { label: 'Risparmi medi', color: '#5577a8', data: Y.map(y => y.avgSavings) }
    ], { xLabels: labels });
    CH.line(cv3, [
      { label: 'Attività aperte', color: '#5f8f6a', data: Y.map(y => y.businessesOpen) },
      { label: 'Chiuse (cumulative)', color: '#8a4a3a', data: Y.map((y, i) => S.history.closedB.filter(x => x.day <= y.dayIndex).length) }
    ], { xLabels: labels, min: 0 });
    return { title: 'Economia di Northbridge', sub: 'Il ciclo aziendale, i salari, la cassa comunale: tutto ciò che spinge (o affoga) le vite.' };
  };

  /* ============ STATISTICHE ============ */
  Views.statistiche = function (wrap) {
    S = E.state;
    const Y = S.stats.yearly;
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad);
    const ageDist = {};
    for (const c of live) {
      const a = D.age(c, S.minutes);
      const bk = a < 14 ? '0–13' : a < 25 ? '14–24' : a < 40 ? '25–39' : a < 65 ? '40–64' : '65+';
      ageDist[bk] = (ageDist[bk] || 0) + 1;
    }
    wrap.appendChild(kpis([
      [live.length, 'popolazione'],
      [(live.reduce((s, c) => s + D.age(c, S.minutes), 0) / Math.max(1, live.length)).toFixed(1), 'età media'],
      [S.stats.counters.births, 'nati dall\u2019ultimo anno nuovo'],
      [Y.length ? Y[Y.length - 1].avgSatisfaction : '—', 'soddisfazione media /100'],
      [Y.length ? Y[Y.length - 1].isolated : '—', 'cittadini isolati (ultimo anno)']
    ]));
    const c1 = card('Popolazione per anno');
    const cv1 = document.createElement('canvas'); cv1.className = 'chart'; c1.appendChild(cv1);
    wrap.appendChild(c1);
    const c2 = card('Nascite e morti per anno');
    const cv2 = document.createElement('canvas'); cv2.className = 'chart'; c2.appendChild(cv2);
    wrap.appendChild(c2);
    const c3 = card('Distribuzione dell\u2019età (oggi)');
    const cv3 = document.createElement('canvas'); cv3.className = 'chart'; cv3.style.height = '180px'; c3.appendChild(cv3);
    wrap.appendChild(c3);
    const c4 = card('Soddisfazione e isolamento');
    const cv4 = document.createElement('canvas'); cv4.className = 'chart'; c4.appendChild(cv4);
    wrap.appendChild(c4);
    const c5 = card('Popolazione per quartiere');
    const tbl = el('table', 'tbl');
    const lastY = Y[Y.length - 1];
    if (lastY) {
      const hh = DATA.NEIGHBORHOODS.map(h => [h.name, (lastY.hoodPop[h.id] || 0)]).filter(r => r[1] > 0);
      tbl.innerHTML = '<tr><th>quartiere</th><th>abitanti</th></tr>' +
        hh.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('');
    }
    c5.appendChild(tbl);
    wrap.appendChild(c5);
    const labels = Y.map(y => y.year);
    CH.line(cv1, [{ label: 'Popolazione', color: '#5577a8', data: Y.map(y => y.pop) }], { xLabels: labels, min: 0 });
    CH.line(cv2, [
      { label: 'Nascite', color: '#5f8f6a', data: Y.map(y => y.births) },
      { label: 'Morti', color: '#8a4a3a', data: Y.map(y => y.deaths) }
    ], { xLabels: labels, min: 0 });
    CH.bars(cv3, Object.keys(ageDist), Object.values(ageDist));
    CH.line(cv4, [
      { label: 'Soddisfazione /100', color: '#c9a86b', data: Y.map(y => y.avgSatisfaction) },
      { label: 'Isolati', color: '#8a8a8a', data: Y.map(y => y.isolated) }
    ], { xLabels: labels, min: 0 });
    return { title: 'Statistiche', sub: 'Tutti i numeri nascono dalle vite realmente simulate.' };
  };

  /* ============ GIORNALE ============ */
  Views.giornale = function (wrap) {
    S = E.state;
    wrap.appendChild(el('h2', null, 'Cronache di Northbridge'));
    wrap.appendChild(el('div', 'subline', 'Il giornale riscrive ogni mese gli eventi realmente accaduti. Nessun articolo è inventato.'));
    if (!S.news.length) wrap.appendChild(el('div', 'muted', 'Il primo numero uscirà alla fine del primo mese simulato.'));
    for (const issue of S.news.slice(0, 40)) {
      const is = el('div', 'issue cardline');
      const head = el('div', 'mhead');
      head.appendChild(el('div', null, 'NORTHBRIDGE · ' + issue.date));
      head.appendChild(el('div', 't', issue.title));
      is.appendChild(head);
      for (const a of issue.articles) {
        const art = el('div', 'article');
        if (a.h) art.appendChild(el('h4', null, a.h));
        art.appendChild(el('p', null, a.b));
        is.appendChild(art);
      }
      wrap.appendChild(is);
    }
    return {};
  };

  /* ============ STORIA ============ */
  Views.storia = function (wrap) {
    S = E.state;
    const dec = {};
    for (const d of S.history.deceased) {
      const y = D.dateFromMinutes(d.day * D.MPD).year;
      dec[y] = (dec[y] || 0) + 1;
    }
    wrap.appendChild(kpis([
      [S.history.deceased.length, 'abitanti passati'],
      [S.history.closedB.length, 'attività chiuse'],
      [S.history.newB.length, 'attività nate'],
      [Object.keys(dec).length ? Math.max.apply(null, Object.keys(dec).map(Number)) : '—', 'anno con più perdite']
    ]));
    const c1 = card('In memoria — clicca un nome per il memoriale completo');
    const sc = el('div', 'scrolly');
    const order = S.history.deceased.slice().sort((a, b) => b.day - a.day);
    for (const d of order.slice(0, 300)) {
      const c = S.citizens[d.id];
      if (!c) continue;
      sc.appendChild(UI.personRow(S, c, D.dateFromMinutes(d.day * D.MPD).year + ' · ' + (d.cause || '†')));
    }
    if (!order.length) sc.appendChild(el('div', 'muted', 'Ancora nessuno ci ha lasciati.'));
    c1.appendChild(sc);
    wrap.appendChild(c1);
    const c2 = card('La città che cambia');
    for (const x of S.history.closedB.slice(-12).reverse()) c2.appendChild(el('div', 'mem', '🔻 ' + x.txt));
    for (const x of S.history.newB.slice(-12).reverse()) c2.appendChild(el('div', 'mem', '✨ ' + x.txt));
    wrap.appendChild(c2);
    const c3 = card('Eventi notevoli');
    for (const e of S.events.filter(e => e.imp >= 8).slice(-30).reverse())
      c3.appendChild(el('div', 'mem', '[' + D.dateFromMinutes(e.day * D.MPD).year + '] ' + e.txt));
    wrap.appendChild(c3);
    return { title: 'Archivio storico', sub: 'Chi non c\u2019è più resta qui: una vita intera è ancora leggibile.' };
  };
})(window.EHL);
