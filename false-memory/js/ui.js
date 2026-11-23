/* ui: helper DOM, navigazione, modal, toast, thumbnail procedurali, sblocchi */
(function () {

  const EV = window.FM_EVIDENCE, CHARS = window.FM_CHARACTERS;
  const byId = {};
  EV.forEach(e => { byId[e.id] = e; });

  /* ---------- fantomi DOM ---------- */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
  function ev(id) { return byId[id]; }
  function ch(id) { return CHARS[id]; }

  const REL_LABEL = {
    unknown: 'affidabilita da valutare',
    uncertain: 'dubbia',
    verified: 'verificata',
    certain: 'certa',
    misleading: 'fuorviante'
  };
  const REL_BADGE = { unknown: 'grey', uncertain: 'amber', verified: 'green', certain: 'green', misleading: 'red' };

  function relBadge(level) {
    return '<span class="badge ' + (REL_BADGE[level] || 'grey') + '">' + (REL_LABEL[level] || level) + '</span>';
  }

  const CAT_LABEL = { photo: 'Fotografia', document: 'Documento', recording: 'Registrazione', object: 'Oggetto' };
  const CAT_BADGE = { photo: 'amber', document: 'grey', recording: 'green', object: 'red' };

  /* ---------- prerequisiti e sblocchi ---------- */
  function reqMet(req) {
    if (!req) return true;
    const i = req.indexOf(':');
    if (i < 0) return true;
    const k = req.slice(0, i), v = req.slice(i + 1);
    const S = window.FMState;
    switch (k) {
      case 'ev': return S.isDiscovered(v);
      case 'ex': return S.hasExam(v);
      case 'flag': return S.hasFlag(v);
      case 'talk': return S.hasTalk(v);
      case 'con': return S.hasCon(v);
    }
    return true;
  }
  function allReqMet(list) { return (list || []).every(reqMet); }

  /* applica gli effetti di una risposta / esame: flags + sblocchi prove */
  function applyEffects(fx, opts) {
    opts = opts || {};
    let unlocked = [];
    if (fx.flags) fx.flags.forEach(f => window.FMState.setFlag(f));
    if (fx.setsFlag) window.FMState.setFlag(fx.setsFlag);
    if (fx.unlocks && fx.unlocks.length) unlocked = discover(fx.unlocks, opts);
    if (opts.save !== false) window.FMState.save();
    return unlocked;
  }

  /* ---------- scoperta prove + capitoli ---------- */
  function discover(ids, opts) {
    opts = opts || {};
    const added = window.FMState.discover(ids);
    added.forEach(id => {
      const e = ev(id);
      if (!e) return;
      const from = opts.from || '';
      const contra = (from.indexOf('con:') === 0) || (e.prereqs || []).some(p => p.indexOf('con:') === 0);
      if (from === 'silent') return;
      (window.FMUI.toast)(
        (contra ? 'CONTRADDIZIONE EMERSA \u2014 ' : 'NUOVA PROVA ACQUISITA \u2014 ') + e.code + ' ' + e.title,
        contra
      );
      window.FMAudio.sfx.unlock();
    });
    if (added.length) {
      updateNav();
      const got = window.FMState.progressChapter();
      if (got) showChapter(got);
    }
    return added;
  }

  function showChapter(n) {
    const c = (window.FM_CHAPTERS || []).find(x => x.n === n);
    if (!c) return;
    window.FMAudio.sfx.motif();
    const o = el('div', 'chaptercard');
    o.innerHTML = '<div class="inner"><div class="c-n">CAPITOLO ' + (n < 10 ? '0' + n : n) + '</div>' +
      '<h2>' + esc(c.title) + '</h2>' +
      (c.subtitle ? '<p class="mono small">' + esc(c.subtitle) + '</p>' : '') +
      '<p>' + esc(c.text) + '</p>' +
      '<p class="small mono">clic per continuare</p></div>';
    o.addEventListener('click', () => {
      o.remove();
      window.FMAudio.sfx.click();
      window.FMUI.navigate('casew');
    });
    document.body.appendChild(o);
  }

  /* ---------- toast ---------- */
  function toast(msg, contra) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = el('div', 'toast' + (contra ? ' contra' : ''), esc(msg));
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 4200);
    setTimeout(() => t.remove(), 4800);
  }

  /* ---------- suggerimento contestuale (una sola volta per vista) ---------- */
  function hintOnce(root, key, html) {
    const st = window.FMState.st;
    st.seen = st.seen || {};
    if (st.seen['h_' + key]) return;
    const bar = el('div', 'viewhint');
    bar.innerHTML = '<span class="vh-tag">COME FUNZIONA</span><span class="vh-txt">' + html + '</span>';
    const x = el('button', 'vh-x', '\u00d7');
    x.title = 'chiudi';
    x.addEventListener('click', () => {
      st.seen['h_' + key] = 1;
      window.FMState.save();
      bar.remove();
      window.FMAudio.sfx.click();
    });
    bar.appendChild(x);
    root.insertBefore(bar, root.firstChild);
  }

  /* ---------- modal ---------- */
  let modalEl = null, modalCloseCb = null;
  function openModal(content, onClose) {
    closeModal();
    modalEl = el('div', 'overlay');
    const m = el('div', 'modal');
    if (typeof content === 'string') m.innerHTML = content; else m.appendChild(content);
    modalEl.appendChild(m);
    modalEl.addEventListener('mousedown', e => { if (e.target === modalEl) closeModal(); });
    document.body.appendChild(modalEl);
    modalCloseCb = onClose || null;
    return m;
  }
  function closeModal() {
    if (modalEl) { modalEl.remove(); modalEl = null; }
    if (modalCloseCb) { const cb = modalCloseCb; modalCloseCb = null; cb(); }
  }

  /* ---------- thumbnail svg procedurali ---------- */
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function thumb(e, big) {
    const seed = hash(e.id);
    const h1 = (seed % 60) + 10, h2 = ((seed >>> 6) % 60) + 170;
    const a = 'hsl(' + h1 + ',18%,' + (18 + (seed % 10)) + '%)';
    const b = 'hsl(' + h2 + ',22%,' + (30 + ((seed >>> 3) % 12)) + '%)';
    const w = big ? 760 : 190, hh = big ? 300 : 110;
    let inner = '';
    const g = (n, m) => (n + ((seed >>> m) % n));
    if (e.cat === 'photo') {
      const mx = 20 + g(90, 4), my = 30 + g(40, 8), mw = 60 + g(70, 12);
      inner = '<circle cx="' + (150 + (seed % 60)) + '" cy="26" r="9" fill="' + b + '" opacity=".7"/>' +
        '<polygon points="0,' + hh + ' ' + mx + ',' + (hh - my) + ' ' + (mx + mw) + ',' + hh + '" fill="' + b + '" opacity=".85"/>' +
        '<rect x="6" y="6" width="' + (w - 12) + '" height="' + (hh - 12) + '" fill="none" stroke="' + b + '" stroke-opacity=".5"/>';
    } else if (e.cat === 'document') {
      inner = '<rect x="40" y="14" width="110" height="' + (hh - 28) + '" fill="#d8d2c4" opacity=".14" transform="rotate(-2 95 55)"/>' +
        '<rect x="52" y="20" width="86" height="' + (hh - 40) + '" fill="#d8d2c4" opacity=".10"/>' +
        [0, 1, 2, 3, 4].map(i => '<rect x="62" y="' + (34 + i * 14) + '" width="' + (30 + ((seed >>> i) % 40)) + '" height="3" fill="' + b + '" opacity=".55"/>').join('');
    } else if (e.cat === 'recording') {
      inner = Array.apply(null, Array(22)).map((_, i) => {
        const bh = 6 + ((seed >>> (i % 12)) % 46);
        return '<rect x="' + (18 + i * 7) + '" y="' + ((hh - bh) / 2) + '" width="4" height="' + bh + '" rx="2" fill="' + b + '" opacity=".8"/>';
      }).join('');
    } else {
      inner = '<ellipse cx="95" cy="' + (hh - 34) + '" rx="44" ry="7" fill="' + b + '" opacity=".35"/>' +
        '<rect x="66" y="30" width="58" height="' + (hh - 70) + '" rx="10" fill="' + b + '" opacity=".85"/>' +
        '<circle cx="95" cy="44" r="10" fill="none" stroke="' + a + '" stroke-width="3"/>';
    }
    return '<svg viewBox="0 0 ' + w + ' ' + hh + '" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="' + w + '" height="' + hh + '" fill="' + a + '"/>' + inner + '</svg>';
  }

  /* ---------- drawer contatore badge nav ---------- */
  function updateNav() {
    const S = window.FMState, st = S.st;
    const counts = {
      casew: '', persons: Object.keys(CHARS).length,
      testimonies: '', evidence: st.discovered.length + '/' + EV.length,
      timeline: '', board: st.board.nodes.length ? st.board.nodes.length : '', conclusions: ''
    };
    document.querySelectorAll('.navbtn').forEach(b => {
      const v = b.dataset.view;
      if (counts[v] !== undefined) { const c = b.querySelector('.cnt'); if (c) c.textContent = counts[v]; }
    });
    /* new-dots: confronta con quanto "visto" */
    const seen = st.seen || (st.seen = {});
    const map = { evidence: 'evidence', persons: 'persons', testimonies: 'testimonies' };
    Object.keys(map).forEach(v => {
      const freshN = v === 'evidence' ? (st.discovered.length - (seen._evidence || 0))
        : v === 'persons' ? Object.keys(CHARS).filter(k => !seen['p_' + k]).length
        : EV.filter(e => e.cat === 'recording' && S.isDiscovered(e.id) && !seen['r_' + e.id]).length;
      const b = document.querySelector('.navbtn[data-view="' + v + '"]');
      if (b) b.classList.toggle('has-new', freshN > 0);
    });
    const chip = document.getElementById('chip-proof');
    if (chip) chip.textContent = st.discovered.length + ' / ' + EV.length + ' PROVE';
  }
  function markSeen() {
    const st = window.FMState.st;
    const v = FMUI.view;
    if (v === 'evidence') st.seen._evidence = st.discovered.length;
    if (v === 'persons') Object.keys(CHARS).forEach(k => { st.seen['p_' + k] = 1; });
    if (v === 'testimonies') EV.filter(e => e.cat === 'recording').forEach(e => { st.seen['r_' + e.id] = 1; });
    window.FMState.save();
    updateNav();
  }

  window.FM = {
    el, esc, ev, ch, byId,
    reqMet, allReqMet, applyEffects, discover, showChapter,
    toast, hintOnce, openModal, closeModal, thumb, hash,
    updateNav, markSeen, relBadge, catBadge: c => '<span class="badge ' + (CAT_BADGE[c] || 'grey') + '">' + (CAT_LABEL[c] || c) + '</span>',
    catLabel: CAT_LABEL
  };
  window.FMUI = {
    view: null,
    navigate(v) {
      FMUI.view = v;
      document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
      const root = document.getElementById('view');
      root.innerHTML = '';
      root.scrollTop = 0;
      const render = window.FMViews.views[v];
      if (render) render(root);
      window.FMAudio.sfx.click();
      window.FM.markSeen();
    },
    refresh() { if (FMUI.view) FMUI.navigate(FMUI.view); },
    toast, modal: openModal, closeModal, openEvidence: null /* definito in views/evidence.js */
  };
})();
