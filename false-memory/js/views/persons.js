/* vista PERSONS + interrogatori condizionali */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;
  let current = null;

  V.persons = function (root) {
    const F = window.FM, S = window.FMState;
    root.appendChild(F.el('h1', 'pagetitle', 'PERSONS'));
    root.appendChild(F.el('div', 'pagesub', 'cinque persone collegate alla scomparsa \u2014 clicca per interrogare'));

    const daniel = F.el('div', 'card');
    daniel.innerHTML =
      '<div style="display:flex;gap:16px;align-items:center">' +
      '<div class="avatar" style="background:#2a1d1d;color:#d1554a">DM</div>' +
      '<div><div class="nm" style="font-size:15px">Daniel Moreau \u2014 il disperso</div>' +
      '<div class="ds small">' + F.esc(F.ch('daniel').desc) + '</div></div></div>' +
      F.ch('daniel').profile;
    root.appendChild(daniel);

    ['claire', 'thomas', 'elise', 'victor'].forEach(cid => {
      const c = F.ch(cid);
      const asked = Object.keys(S.st.talks).filter(k => k.indexOf(cid + ':') === 0).length;
      const row = F.el('div', 'person-row');
      row.innerHTML =
        '<div class="avatar" style="background:' + c.accent + '22;color:' + c.accent + '">' + F.esc(c.portrait) + '</div>' +
        '<div class="who" style="flex:1"><div class="nm">' + F.esc(c.name) + ' <span class="small">' + F.esc(c.role) + '</span></div>' +
        '<div class="ds">' + F.esc(c.relation) + '</div></div>' +
        '<span class="badge ' + (asked ? 'green' : 'grey') + '">' + asked + ' argomenti aperti</span>';
      row.addEventListener('click', () => { window.FMAudio.sfx.click(); current = cid; V.persons.renderInterview(root, cid); });
      root.appendChild(row);
    });
  };

  V.persons.renderInterview = function (root, cid) {
    const F = window.FM, S = window.FMState;
    const c = F.ch(cid);
    root.innerHTML = '';

    const back = F.el('button', 'btn', '\u2190 INDICE PERSONE');
    back.style.marginBottom = '14px';
    back.addEventListener('click', () => { FMAudio.sfx.click(); current = null; root.innerHTML = ''; V.persons(root); });
    root.appendChild(back);

    const head = F.el('div', 'card', '<h1 class="pagetitle" style="border:none;padding:0;margin:0 0 6px">' + F.esc(c.name) + '</h1>');
    head.innerHTML +=
      '<div class="pagesub">' + F.esc(c.role) + ' \u2014 ' + F.esc(c.relation) + '</div>' +
      '<p>' + F.esc(c.desc) + '</p>' + c.profile;
    root.appendChild(head);

    const grid = F.el('div', 'interview');

    /* colonna sinistra: dichiarazione scritta + argomenti */
    const left = F.el('div');
    const stmt = F.el('div', 'card');
    stmt.innerHTML = '<h3>' + F.esc(c.statement.title) + '</h3>' +
      '<div class="small mono" style="margin-bottom:6px">' + F.esc(c.statement.date) + '</div>' +
      c.statement.text;
    left.appendChild(stmt);

    const logKey = 'int_' + cid;
    const log = (S.st.read[logKey] = S.st.read[logKey] || []);
    const right = F.el('div');
    right.appendChild(F.el('h3', null, 'INTERROGATORIO'));

    /* log delle risposte */
    const logBox = F.el('div');
    const drawAnswers = () => {
      logBox.innerHTML = '';
      log.forEach(en => {
        const a = F.el('div', 'answer' + (en.tone ? ' tone-' + en.tone : ''));
        a.innerHTML = '<div class="who">' + F.esc(en.who) + '</div><q>' + en.text + '</q>' +
          (en.note ? '<div class="note">' + F.esc(en.note) + '</div>' : '');
        logBox.appendChild(a);
      });
      logBox.scrollTop = logBox.scrollHeight;
    };

    /* argomenti */
    const topicsBox = F.el('div');
    c.topics.forEach(t => {
      const met = F.allReqMet(t.requires ? [t.requires] : []);
      const key = cid + ':' + t.n;
      const b = F.el('button', 'qbtn' + (S.hasTalk(key) ? ' asked' : '') + (met ? '' : ' locked'));
      b.innerHTML = met ? F.esc(t.q) : F.esc(t.lockedHint || 'Linea di domanda non ancora accessibile.');
      b.addEventListener('click', () => {
        if (!met) { window.FMAudio.sfx.click(); return; }
        window.FMAudio.sfx.paper();
        const first = !S.hasTalk(key);
        S.markTalk(key);
        if (first) {
          log.push({ who: c.name, text: t.a, note: t.note || '', tone: t.tone || '' });
          S.save();
          F.applyEffects({ unlocks: t.unlocks, setsFlag: t.setsFlag });
          b.classList.add('asked');
          window.FM.updateNav();
        }
        drawAnswers();
      });
      topicsBox.appendChild(b);
    });

    root.appendChild(grid);
    grid.appendChild(left);
    grid.appendChild(right);
    right.appendChild(topicsBox);

    /* confronto con prove */
    const pres = F.el('button', 'btn primary', '\u25B6 PRESENTA UNA PROVA');
    pres.style.margin = '10px 0 14px';
    pres.addEventListener('click', () => openConfront(cid, () => drawAnswers()));
    right.appendChild(pres);
    right.appendChild(logBox);
    drawAnswers();
  };

  /* ---------- confronto con una prova ---------- */
  function openConfront(cid, onDone) {
    const F = window.FM, S = window.FMState;
    const disc = window.FM_EVIDENCE.filter(e => S.isDiscovered(e.id));
    const content = F.el('div');
    content.innerHTML = '<h2>Presenta una prova a ' + F.esc(F.ch(cid).name) + '</h2>' +
      '<div class="code-line">scegli un elemento già acquisito</div>';
    const grid = F.el('div', 'grid cols3');
    disc.forEach(e => {
      const card = F.el('div', 'evcard', '<div class="thumb">' + F.thumb(e) + '</div>' +
        '<div class="meta"><div class="code">' + F.esc(e.code) + '</div><div class="t">' + F.esc(e.title) + '</div></div>');
      card.addEventListener('click', () => {
        F.closeModal();
        FMAudio.sfx.paper();
        const key = 'con:' + cid + ':' + e.id;
        const fx = F.ch(cid).confronts[e.id];
        const generic = F.ch(cid).default;
        const resp = fx || generic;
        const log = S.st.read['int_' + cid] = S.st.read['int_' + cid] || [];
        const dup = S.hasCon(key) && !fx;
        log.push({
          who: F.ch(cid).name,
          text: resp.text,
          note: fx ? (fx.note || '') : 'reazione generica: nessun legame specifico con questa prova',
          tone: resp.tone || ''
        });
        S.markCon(key);
        if (fx && !dup) { F.applyEffects({ unlocks: fx.unlocks, flags: fx.flags, setsFlag: null }, { from: 'con:' + cid }); }
        S.save();
        FMAudio.sfx.contradiction();
        onDone();
      });
      grid.appendChild(card);
    });
    content.appendChild(grid);
    F.openModal(content);
  }
})();
