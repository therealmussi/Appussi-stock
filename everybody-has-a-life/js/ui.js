'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const UI = E.UI = {};
  const D = E.Core, DATA = E.DATA, P = E.People, BIO = E.Bio, EN = E.Engine;
  let S = null;

  UI.state = function (st) { S = st; };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function $(id) { return document.getElementById(id); }
  UI.el = el;

  /* ---- avatar ---- */
  UI.drawAvatar = function (canvas, c, size) {
    size = size || 44;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    const x = canvas.getContext('2d'); x.scale(2, 2);
    const pal = P.avatarPalette(c);
    x.fillStyle = '#efe6d4'; x.fillRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2 + 2, r = size * 0.30;
    x.fillStyle = pal.shirt; x.fillRect(0, size * 0.68, size, size * 0.32);
    x.fillStyle = pal.skin;
    x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.fillStyle = pal.hair;
    x.beginPath(); x.arc(cx, cy - r * 0.25, r * 0.98, Math.PI, 2 * Math.PI); x.fill();
    if (pal.hairStyle === 1) x.fillRect(cx - r, cy - r * 0.25, r * 2, r * 0.5);
    if (!c.alive) { x.fillStyle = 'rgba(240,235,220,.75)'; x.fillRect(0, 0, size, size); }
    if (c.sex === 'F') { x.fillStyle = pal.hair; x.fillRect(cx - r * 1.05, cy - r * 0.2, r * 0.35, r * 1.5); x.fillRect(cx + r * 0.7, cy - r * 0.2, r * 0.35, r * 1.5); }
  };

  function personRow(S, c, extra) {
    const row = el('div', 'personrow');
    const av = document.createElement('canvas'); av.className = 'avatar';
    UI.drawAvatar(av, c, 34);
    row.appendChild(av);
    const txt = el('div');
    const nm = el('b', null, c.name + ' ' + c.surname + (c.abroad ? ' 🧳' : (!c.alive ? ' 🕯️' : '')));
    txt.appendChild(nm);
    txt.appendChild(el('div', 'muted', extra || UI.jobLine(S, c)));
    row.appendChild(txt);
    row.addEventListener('click', () => UI.openCitizen(c.id));
    return row;
  }
  UI.personRow = personRow;
  UI.jobLine = function (S, c) {
    const age = D.age(c, S.minutes);
    let t = age + ' anni';
    if (c.retired) t += ' · pensionato/a';
    else if (c.job) t += ' · ' + c.job.title;
    else if (age >= 19) t += ' · senza lavoro';
    else if (age >= 6) t += ' · studente';
    if (c.abroad) t += ' · a ' + (c.abroadCity || 'estero');
    return t;
  };

  /* ---- wiring topbar / viste ---- */
  const VIEWS = ['citta', 'cittadini', 'famiglie', 'relazioni', 'economia', 'statistiche', 'giornale', 'storia'];
  const VIEW_LABEL = { citta: 'Città', cittadini: 'Cittadini', famiglie: 'Famiglie', relazioni: 'Relazioni', economia: 'Economia', statistiche: 'Statistiche', giornale: 'Giornale', storia: 'Storia' };

  UI.showView = function (id) {
    for (const v of VIEWS) {
      const b = $('nav-' + v); if (b) b.classList.toggle('on', v === id);
    }
    const panel = $('panel');
    if (id === 'citta') { panel.classList.remove('on'); return; }
    panel.classList.add('on');
    panel.innerHTML = '';
    const wrap = el('div', 'wrap');
    panel.appendChild(wrap);
    const fn = E.Views && E.Views[id];
    if (fn) {
      const head = fn(wrap, S, panel);
      if (head && head.title) {
        wrap.insertBefore(el('div', 'subline', head.sub || ''), wrap.firstChild);
        wrap.insertBefore(el('h2', null, head.title), wrap.firstChild);
      }
    }
  };
  UI.closeView = function () { $('panel').classList.remove('on'); for (const v of VIEWS) { const b = $('nav-' + v); if (b) b.classList.remove('on'); } };

  UI.initShell = function (st) {
    S = st;
    for (const v of VIEWS) {
      const b = $('nav-' + v);
      if (b) b.addEventListener('click', () => UI.showView(v));
    }
    document.querySelectorAll('[data-int]').forEach(btn => {
      btn.addEventListener('click', () => UI.doIntervene(btn.getAttribute('data-int')));
    });
    $('interventionsbtn').addEventListener('click', () => {
      $('interventions').style.display = $('interventions').style.display === 'block' ? 'none' : 'block';
    });
    $('modal').addEventListener('click', e => { if (e.target.id === 'modal') UI.closeModal(); });
  };

  UI.doIntervene = function (id) {
    const r = EN.intervene(S, id);
    const def = DATA.INTERVENTIONS.find(i => i.id === id);
    const box = $('intervresult');
    if (!box) return;
    if (r) {
      box.textContent = '✅ ' + def.name + ' realizzata. ' + (r.note || '');
      box.style.color = 'var(--sage)';
    } else {
      box.textContent = '⚠️ Intervento non possibile: fondi insufficienti o modalità osservatore attiva.';
      box.style.color = 'var(--accent)';
    }
    UI.refreshInterventions();
  };

  UI.refreshInterventions = function () {
    const box = $('interventions'); if (!box) return;
    box.innerHTML = '';
    box.appendChild(el('div', 'muted', 'Fondi comunali: €' + (S.funds || 0).toLocaleString('it-IT')));
    for (const iv of DATA.INTERVENTIONS) {
      const row = el('div', 'cardline');
      row.appendChild(el('b', null, iv.name + ' — ' + iv.cost));
      row.appendChild(el('div', 'muted', iv.eff));
      const done = S.interventions.some(x => x.id === iv.id);
      const btn = el('button', done ? null : 'primary', done ? 'Già realizzato' : 'Realizza');
      btn.disabled = done || S.observerMode;
      btn.addEventListener('click', () => UI.doIntervene(iv.id));
      row.appendChild(btn);
      box.appendChild(row);
    }
    const res = $('intervresult'); if (res) box.appendChild(res);
  };

  /* ---- seguimi ---- */
  UI.setFollow = function (id) {
    S.followId = id;
    const bn = $('followbanner');
    if (!id) { bn.classList.remove('on'); UI.refreshTopbar(); return; }
    const c = S.citizens[id];
    if (!c) { bn.classList.remove('on'); return; }
    bn.classList.add('on');
    bn.innerHTML = '';
    bn.appendChild(el('b', null, '👀 ' + c.name + ' ' + c.surname));
    bn.appendChild(el('div', 'muted', UI.jobLine(S, c)));
    const act = el('div', null, '—');
    act.id = 'followact';
    bn.appendChild(act);
    const rowline = el('div', 'rowline');
    rowline.style.marginTop = '6px';
    const openB = el('button', null, 'Profilo');
    openB.addEventListener('click', () => UI.openCitizen(id));
    const unf = el('button', null, 'Smetti di seguire');
    unf.addEventListener('click', () => UI.setFollow(null));
    rowline.appendChild(openB); rowline.appendChild(unf);
    bn.appendChild(rowline);
    UI.refreshTopbar();
  };

  /* ---- modali ---- */
  UI.closeModal = function () { $('modal').classList.remove('on'); };

  UI.openCitizen = function (id) {
    UI.closeView();
    const c = S.citizens[id];
    if (!c) return;
    const box = $('modalbox');
    box.innerHTML = '';
    const close = el('button', 'close', '✕'); close.id = 'modalclose2';
    close.addEventListener('click', () => UI.closeModal());
    box.appendChild(close);
    const head = el('div', 'rowline');
    const av = document.createElement('canvas'); av.className = 'avatar';
    UI.drawAvatar(av, c, 64);
    head.appendChild(av);
    const info = el('div');
    info.appendChild(el('h2', null, c.name + ' ' + c.surname + (c.abroad ? ' 🧳' : (!c.alive ? ' 🕯️' : ''))));
    const birthYear = D.dateFromMinutes(S.minutes).year - D.age(c, S.minutes);
    info.appendChild(el('div', 'muted',
      (c.sex === 'F' ? 'Donna' : 'Uomo') + ' · nato/a nel ' + birthYear + ' · ' + UI.jobLine(S, c)));
    const home = S.buildingsById[c.homeId];
    if (home) info.appendChild(el('div', 'muted', 'Abita a ' + home.name + ' (' + DATA.HOOD_BY_ID[home.hood].name + ')'));
    if (!c.alive && c.cause) info.appendChild(el('div', 'muted', '† ' + c.cause));
    head.appendChild(info);
    const followBtn = el('button', c.id === S.followId ? 'primary' : null, c.id === S.followId ? 'Seguito ✓' : '👀 Segui questa vita');
    followBtn.addEventListener('click', () => {
      UI.setFollow(c.id === S.followId ? null : c.id);
      UI.openCitizen(c.id);
    });
    followBtn.style.marginLeft = 'auto';
    head.appendChild(followBtn);
    box.appendChild(head);

    const tabs = el('div', 'tabs');
    const body = el('div');
    const TABS = [['bio', 'Biografia'], ['tl', 'Linea della vita'], ['rel', 'Relazioni'], ['pers', 'Carattere'], ['fam', 'Famiglia'], ['mem', 'Memorie']];
    let cur = 'bio';
    function setTab(k) {
      cur = k;
      tabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', TABS[i][0] === k));
      body.innerHTML = '';
      if (k === 'bio') for (const p of BIO.buildBio(S, c)) body.appendChild(el('p', 'bio-par', p));
      else if (k === 'tl') {
        const list = el('ul', 'tl');
        for (const t of BIO.timelineFor(S, c).slice(-60)) {
          const li = el('li');
          li.appendChild(el('span', 'when', t.when + ' (' + t.age + ' a)'));
          li.appendChild(el('span', null, (t.i || '') + ' ' + t.t));
          list.appendChild(li);
        }
        body.appendChild(list);
      } else if (k === 'rel') {
        const list = el('div', 'scrolly');
        const rels = Object.entries(c.rels)
          .map(([oid, r]) => ({ r, o: S.citizens[oid] }))
          .filter(x => x.o)
          .sort((a, b) => b.r.aff - a.r.aff);
        if (!rels.length) list.appendChild(el('div', 'muted', 'Nessun legame ancora formato.'));
        for (const x of rels.slice(0, 28)) {
          const line = el('div', 'rel-line');
          const lbl = el('span', 'tagpill', x.r.type);
          line.appendChild(lbl);
          const nm = el('b', null, x.o.name + ' ' + x.o.surname);
          nm.style.cursor = 'pointer';
          nm.addEventListener('click', () => UI.openCitizen(x.o.id));
          line.appendChild(nm);
          const bar = el('div', 'bar'); const i2 = el('i'); i2.style.width = x.r.aff + '%'; bar.appendChild(i2);
          line.appendChild(bar);
          line.appendChild(el('span', 'muted', x.r.aff));
          list.appendChild(line);
        }
        body.appendChild(list);
      } else if (k === 'pers') {
        body.appendChild(barBlock('Soddisfazione', c.satisfaction));
        body.appendChild(barBlock('Felicità', c.happiness));
        body.appendChild(barBlock('Salute', c.health));
        body.appendChild(barBlock('Stress', c.stress));
        const defs = { ambition: 'Ambizione', sociability: 'Socievolezza', curiosity: 'Curiosità', riskTol: 'Tolleranza al rischio', generosity: 'Generosità', independence: 'Indipendenza' };
        body.appendChild(el('h3', null, 'Tendenze'));
        for (const k in defs) body.appendChild(barBlock(defs[k], c.tend[k]));
      } else if (k === 'fam') {
        const dyn = BIO.dynasty(S, c, 6);
        body.appendChild(el('div', 'muted', 'Capostipite: ' + dyn.root.name + ' ' + dyn.root.surname));
        dyn.generations.forEach((gen, gi) => {
          const blk = el('div', 'gen-block');
          blk.appendChild(el('div', 'hl', 'Generazione ' + (gi + 1)));
          for (const m of gen) {
            const orig = S.citizens[m.id];
            if (!orig) continue;
            blk.appendChild(personRow(S, orig, m.years + (m.abroad ? ' · ' + m.abroad : '') + (m.job ? ' · ' + m.job : '')));
          }
          body.appendChild(blk);
        });
      } else if (k === 'mem') {
        const list = el('div');
        const mems = c.memories.slice().sort((a, b) => b.d - a.d);
        if (!mems.length) list.appendChild(el('div', 'muted', 'Nessun ricordo importante ancora.'));
        for (const m of mems.slice(0, 40)) {
          const d = D.dateFromMinutes(m.d * D.MPD);
          list.appendChild(el('div', 'mem', '[' + d.year + '] ' + m.t));
        }
        body.appendChild(list);
      }
    }
    for (const [k, lbl] of TABS) {
      const b = el('button', null, lbl);
      b.addEventListener('click', () => setTab(k));
      tabs.appendChild(b);
    }
    box.appendChild(tabs); box.appendChild(body);
    setTab('bio');
    $('modal').classList.add('on');
  };

  function barBlock(label, v, color) {
    const w = el('div', 'rel-line');
    w.appendChild(el('span', 'muted', label, ));
    const bar = el('div', 'bar'); const i = el('i');
    i.style.width = D.clamp(v, 0, 100) + '%';
    if (color) i.style.background = color;
    bar.appendChild(i); w.appendChild(bar); w.appendChild(el('span', 'muted', Math.round(v)));
    return w;
  }
  UI.barBlock = barBlock;

  UI.openBuilding = function (id) {
    UI.closeView();
    const b = S.buildingsById[id];
    if (!b) return;
    const box = $('modalbox');
    box.innerHTML = '';
    const close = el('button', 'close', '✕');
    close.addEventListener('click', () => UI.closeModal());
    box.appendChild(close);
    box.appendChild(el('h2', null, b.name || DATA.BUILDING_LABELS[b.type] || b.type));
    box.appendChild(el('div', 'muted', DATA.BUILDING_LABELS[b.type] + ' · ' + DATA.HOOD_BY_ID[b.hood].name + ' · costruito nel ' + (b.founded != null ? D.dateFromMinutes(Math.max(0, b.founded) * D.MPD).year : 'inizi') +
      (b.business ? (b.business.closed ? ' · CHIUSO' : ' · attività in salute ' + Math.round(b.business.health) + '/100') : '')));
    if (b.residents.length) {
      box.appendChild(el('h3', null, 'Residenti (' + b.residents.length + '/' + b.cap + ')'));
      const list = el('div');
      for (const rid of b.residents) { const c = S.citizens[rid]; if (c) list.appendChild(personRow(S, c)); }
      box.appendChild(list);
    }
    const staff = (b.jobs || []).filter(j => j.citizen);
    if (staff.length) {
      box.appendChild(el('h3', null, 'Dipendenti'));
      const list = el('div');
      for (const j of staff) { const c = S.citizens[j.citizen]; if (c) list.appendChild(personRow(S, c, j.title)); }
      box.appendChild(list);
    }
    if (b.business) {
      box.appendChild(el('h3', null, 'Storia'));
      const open = S.history.newB.filter(x => x.id === b.id || x.name === b.name);
      const clsd = S.history.closedB.filter(x => x.id === b.id || x.name === b.name);
      if (open.length) box.appendChild(el('div', 'mem', '📝 ' + open[open.length - 1].txt));
      if (clsd.length) box.appendChild(el('div', 'mem', '🔻 ' + clsd[clsd.length - 1].txt));
      if (!open.length && !clsd.length) box.appendChild(el('div', 'mem', 'Attività avviata prima dell\u2019inizio della simulazione.'));
    }
    $('modal').classList.add('on');
  };

  /* ---- feed eventi ---- */
  const FEED_K = [['tutti', 'Tutti'], ['personale', 'Personale'], ['sociale', 'Sociale'], ['amore', 'Cuori'], ['famiglia', 'Famiglia'], ['lavoro', 'Lavoro'], ['economia', 'Economia'], ['città', 'Città']];
  let feedFilter = 'tutti';

  UI.initFeed = function () {
    const f = $('feedfilters');
    f.innerHTML = '';
    for (const [k, lbl] of FEED_K) {
      const b = el('button', k === feedFilter ? 'on' : null, lbl);
      b.addEventListener('click', () => { feedFilter = k; UI.initFeed(); UI.renderFeed(); });
      f.appendChild(b);
    }
  };
  UI.renderFeed = function () {
    const f = $('feed'); if (!f) return;
    const ids = feedFilter === 'tutti' ? null : feedFilter;
    const evs = S.events.filter(e => !ids || e.k === ids).slice(-120).reverse();
    f.innerHTML = '';
    if (!evs.length) { f.appendChild(el('div', 'muted', 'Nessun evento in questa categoria.')); }
    for (const e of evs) {
      const d = D.dateFromMinutes(e.day * D.MPD);
      const row = el('div', 'ev' + (e.imp >= 8 ? ' imp8' : ''));
      row.appendChild(el('div', 'd', d.day + '/' + d.month + '/' + d.year + ' · ' + (e.k === 'città' ? 'citt\u00e0' : e.k)));
      const txt = el('div');
      let htmlish = e.txt;
      const linked = e.ids.filter(i => S.citizens[i]);
      if (linked.length && htmlish.indexOf(linked[0] ? (S.citizens[linked[0]].name) : '') !== -1) {
        txt.textContent = htmlish;
        let pos = 0;
        txt.innerHTML = '';
        const parts = htmlish.split(new RegExp('(' + linked.map(i => S.citizens[i].name + ' ' + S.citizens[i].surname).join('|') + ')'));
        for (const p of parts) {
          const owner = linked.map(i => S.citizens[i]).find(cc => p === cc.name + ' ' + cc.surname);
          if (owner) {
            const b = el('b', null, p); b.addEventListener('click', () => UI.openCitizen(owner.id));
            txt.appendChild(b);
          } else txt.appendChild(document.createTextNode(p));
        }
      } else txt.textContent = htmlish;
      row.appendChild(txt);
      f.appendChild(row);
    }
  };

  /* ---- topbar ---- */
  UI.refreshTopbar = function () {
    const date = D.dateFromMinutes(S.minutes);
    $('clock').textContent = D.fmtTime(date.hour, date.minute);
    $('datefull').textContent = D.fmtDate(date);
    const live = Object.values(S.citizens).filter(c => c.alive && !c.abroad).length;
    $('metainfo').textContent =
      'Anno ' + date.year + ' · ' + date.season + ' · ' + EN.weather(S, date.dayIndex) +
      ' · 👥 ' + live + ' abitanti';
    const fb = $('followbanner');
    if (fb && S.followId) {
      const c = S.citizens[S.followId];
      const a = fb.querySelector('#followact');
      if (c && a) {
        const wi = EN.whereIs(S, c, S.minutes);
        a.textContent = 'Ora: ' + wi.act + (wi.actKey === 'dorme' ? '' : ' · ' + (S.buildingsById[wi.b] ? S.buildingsById[wi.b].name : ''));
      } else if (!c) UI.setFollow(null);
    }
  };
})(window.EHL);
