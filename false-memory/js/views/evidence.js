/* vista EVIDENCE: griglia, dettaglio, esami, player registrazioni */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;
  let filter = 'all';
  let searchText = '';

  function stripTags(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ');
  }

  V.evidence = function (root) {
    const F = window.FM, S = window.FMState;
    root.appendChild(F.el('h1', 'pagetitle', 'EVIDENCE'));
    root.appendChild(F.el('div', 'pagesub', window.FM_EVIDENCE.length + ' elementi catalogati \u2014 ' + S.st.discovered.length + ' acquisiti'));
    F.hintOnce(root, 'evidence',
      'Apri una prova e usa le <b>ANALISI disponibili</b>: molti dettagli escono solo al secondo sguardo, e sbloccano nuove prove. Assegna anche un livello di affidabilit\u00e0 \u2014 ti servir\u00e0 alla consegna.');

    const bar = F.el('div', 'btoolbar');
    bar.innerHTML = '<span class="small mono" style="margin-right:6px">FILTRO:</span>';
    ['all', 'photo', 'document', 'recording', 'object'].forEach(k => {
      const b = F.el('button', 'modebtn' + (filter === k ? ' on' : ''),
        k === 'all' ? 'TUTTE' : (F.catLabel[k].toUpperCase() + 'S'));
      b.addEventListener('click', () => { window.FMAudio.sfx.click(); filter = k; render(); });
      bar.appendChild(b);
    });
    const search = F.el('input', 'searchbox');
    search.type = 'text';
    search.placeholder = 'cerca...';
    search.value = searchText;
    search.addEventListener('input', () => {
      searchText = search.value.toLowerCase();
      render();
    });
    bar.appendChild(search);
    root.appendChild(bar);

    const grid = F.el('div', 'grid cols3');
    root.appendChild(grid);

    const disc = window.FM_EVIDENCE.filter(e => S.isDiscovered(e.id));

    function matches(e) {
      if (filter !== 'all' && e.cat !== filter) return false;
      if (!searchText) return true;
      const hay = (e.code + ' ' + e.title + ' ' + (e.short || '') + ' ' + stripTags(e.body)).toLowerCase();
      return hay.indexOf(searchText) !== -1;
    }

    function render() {
      grid.innerHTML = '';
      const vis = disc.filter(matches);
      vis.forEach(e => {
        const card = F.el('div', 'evcard');
        const isNew = !S.st.seen['e_' + e.id];
        card.innerHTML = '<div class="thumb">' + F.thumb(e) + '</div>' +
          '<div class="meta"><div class="code">' + F.esc(e.code) + ' \u00b7 ' + F.catBadge(e.cat) + (isNew ? ' <span class="badge amber">nuovo</span>' : '') + '</div>' +
          '<div class="t">' + F.esc(e.title) + '</div><div class="s">' + F.esc(e.short || '') + '</div></div>';
        card.addEventListener('click', () => window.FMUI.openEvidence(e.id));
        grid.appendChild(card);
      });
      if (!vis.length) grid.appendChild(F.el('p', 'small', 'Nessun risultato: prova un altro filtro o parola chiave.'));
    }

    render();
    if (!disc.length) root.appendChild(F.el('p', 'small', 'Nessuna prova acquisita: inizia dal CASE FILE e dagli interrogatori.'));
  };

  /* ---------- dettaglio prova ---------- */
  function openEvidence(id) {
    const F = window.FM, S = window.FMState;
    const e = F.ev(id);
    if (!e) return;
    if (!S.st.seen['e_' + id]) { S.st.seen['e_' + id] = 1; S.save(); }
    const content = F.el('div');
    content.innerHTML =
      '<h2>' + F.esc(e.title) + '</h2>' +
      '<div class="code-line">' + F.esc(e.code) + ' \u00b7 ' + F.catLabel[e.cat] + '</div>';

    const ph = F.el('div', 'evdetail-photo', F.thumb(e, true));
    content.appendChild(ph);

    const body = F.el('div');
    body.innerHTML = e.body;
    content.appendChild(body);

    /* affidabilita corrente + controllo */
    const relRow = F.el('div', null,
      '<div style="margin:12px 0 6px" class="small mono">AFFIDABILITA: </div>');
    const relBox = F.el('div');
    const drawRel = () => {
      relBox.innerHTML = '';
      ['unknown', 'uncertain', 'verified', 'certain', 'misleading'].forEach(lv => {
        const b = F.el('button', 'badge ' + (S.getReliability(e) === lv ? (lv === 'misleading' ? 'red' : lv === 'certain' || lv === 'verified' ? 'green' : lv === 'uncertain' ? 'amber' : 'grey') : 'grey'));
        b.style.marginRight = '6px';
        b.style.cursor = 'pointer';
        b.textContent = ({ unknown: 'da valutare', uncertain: 'dubbia', verified: 'verificata', certa: 'certa', certain: 'certa', misleading: 'fuorviante' })[lv];
        b.addEventListener('click', () => {
          S.setReliability(e.id, lv);
          FMAudio.sfx.click();
          drawRel();
        });
        relBox.appendChild(b);
      });
    };
    drawRel();
    relRow.appendChild(relBox);
    content.appendChild(relRow);

    /* esami approfonditi */
    if ((e.examines || []).length) {
      const ex = F.el('div', null, '<div class="small mono" style="margin:16px 0 8px">ANALISI DISPONIBILI</div>');
      e.examines.forEach(x => {
        if (S.st.read['ex_' + x.id]) {
          const done = F.el('div', 'card', '<h3>' + F.esc(x.title) + '</h3>' + x.text);
          ex.appendChild(done);
          return;
        }
        const met = F.reqMet(x.requires);
        const b = F.el('button', 'btn' + (met ? ' primary' : ''), met ? F.esc(x.label) : F.esc(x.label) + ' \u2014 prerequisito mancante');
        b.style.marginBottom = '8px';
        b.addEventListener('click', () => {
          if (!met || S.st.read['ex_' + x.id]) { window.FMAudio.sfx.click(); return; }
          S.markExam(e.id);
          S.st.read['ex_' + x.id] = true;
          S.save();
          FMAudio.sfx.camera();
          if (x.reliability) S.setReliability(e.id, x.reliability);
          F.applyEffects({ unlocks: x.unlocks, setsFlag: x.setsFlag }, { from: 'ex:' + e.id });
          F.toast('ANALISI COMPLETATA \u2014 ' + x.title);
          openEvidence(id); /* re-render del modal */
          window.FMUI.refresh();
        });
        const wrap = F.el('div');
        wrap.appendChild(b);
        if (!met) wrap.appendChild(F.el('div', 'small', 'Serve prima un\u2019altra osservazione per questo esame.'));
        ex.appendChild(wrap);
      });
      content.appendChild(ex);
    }

    const bar = F.el('div', 'closebar');
    const close = F.el('button', 'btn', 'CHIUDI');
    close.addEventListener('click', () => F.closeModal());
    bar.appendChild(close);
    content.appendChild(bar);

    /* player per le registrazioni */
    if (e.cat === 'recording') content.insertBefore(V.player(e), body);

    F.openModal(content);
  }

  /* ---------- player audio simulato ---------- */
  V.player = function (e) {
    const F = window.FM;
    const plain = (e.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const chunks = plain.replace(/([.?!»])\s+/g, '$1\u0001').split('\u0001').filter(c => c.length > 2);
    const freq = 90 + (F.hash(e.id) % 70);
    const box = F.el('div', 'player');
    box.innerHTML = '<div class="row"><button class="play">\u25B6</button>' +
      '<div class="track"><i></i></div>' +
      '<span class="mono small" style="min-width:64px;text-align:right">0:00 / ' + Math.max(1, chunks.length * 3) + 's</span></div>' +
      '<div class="sub"><span class="stamp">[/]</span></div>';
    const btn = box.querySelector('.play'), fill = box.querySelector('.track i'),
      sub = box.querySelector('.sub'), time = box.querySelector('.mono.small');
    let timer = null, i = 0, elapsed = 0;
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
      btn.textContent = '\u25B6';
    };
    btn.addEventListener('click', () => {
      if (timer) { stop(); return; }
      window.FMAudio.resume();
      FMAudio.sfx.phone();
      btn.textContent = '\u2759\u2759';
      i = 0;
      timer = setInterval(() => {
        elapsed++;
        fill.style.width = (100 * (i % Math.max(1, chunks.length)) / chunks.length) + '%';
        time.textContent = '0:' + String(elapsed).padStart(2, '0') + ' / ' + Math.max(1, chunks.length * 3) + 's';
        if (elapsed % 3 === 1 && chunks.length) {
          const c = chunks[i % chunks.length];
          sub.innerHTML = '<span class="stamp">[' + String(i * 3).padStart(2, '0') + 's]</span> ' + F.esc(c);
          FMAudio.voice(freq, 1.4, 0.05);
          i++;
        }
      }, 1000);
    });
    return box;
  };

  window.FMUI.openEvidence = openEvidence;
})();
