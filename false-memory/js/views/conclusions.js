/* vista CONCLUSIONS: ricostruzione finale, valutazione, finali */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;
  let draft = null;

  function joinSet(a) { return (a || []).slice().sort().join(','); }
  function persistDraft() {
    window.FMState.st.conclusions = JSON.parse(JSON.stringify(currentDraft()));
    window.FMState.save();
  }

  function currentDraft() {
    if (!draft) {
      const c = window.FMState.st.conclusions;
      draft = c ? JSON.parse(JSON.stringify(c)) : { answers: {}, attached: [] };
    }
    return draft;
  }

  V.conclusions = function (root) {
    const F = window.FM, S = window.FMState;
    draft = null;
    const d = currentDraft();
    root.appendChild(F.el('h1', 'pagetitle', 'CONCLUSIONS'));
    root.appendChild(F.el('div', 'pagesub', 'ricostruzione finale del caso \u2014 consegnala solo con prove adeguate'));

    window.FM_QUESTIONS.forEach(qk => {
      const b = F.el('div', 'qblock');
      b.innerHTML = '<div class="qq">' + F.esc(qk.q) + (qk.essential ? ' <span class="badge red">essenziale</span>' : '') + '</div>';
      const optGrid = F.el('div');
      qk.options.forEach(op => {
        const row = F.el('label', 'radio-row');
        const inp = document.createElement('input');
        inp.type = qk.multi ? 'checkbox' : 'radio';
        inp.name = 'q_' + qk.id;
        inp.value = op.key;
        inp.checked = qk.multi ? (d.answers[qk.id] || []).indexOf(op.key) !== -1 : d.answers[qk.id] === op.key;
        inp.addEventListener('change', () => {
          const S2 = window.FMState, dd = currentDraft();
          if (qk.multi) {
            const arr = dd.answers[qk.id] = dd.answers[qk.id] || [];
            const at = arr.indexOf(op.key);
            if (at === -1) arr.push(op.key); else arr.splice(at, 1);
          } else dd.answers[qk.id] = inp.checked ? op.key : null;
          S2.st.conclusions = JSON.parse(JSON.stringify(dd));
          S2.save();
          [...optGrid.querySelectorAll('.radio-row')].forEach(r => r.classList.remove('picked'));
          if (inp.checked) row.classList.add('picked');
          window.FMAudio.sfx.click();
        });
        row.appendChild(inp);
        row.appendChild(F.el('span', null, F.esc(op.label)));
        if (inp.checked) row.classList.add('picked');
        optGrid.appendChild(row);
      });
      b.appendChild(optGrid);
      root.appendChild(b);
    });

    /* prove allegate */
    const evBlock = F.el('div', 'card');
    evBlock.innerHTML = '<h3>Prove allegate alla ricostruzione (' + d.attached.length + ')</h3>' +
      '<p class="small">Allega gli elementi che sostengono la tua versione. Con meno di 4 prove la consegna viene respinta come incompleta.</p>';
    const chiplist = F.el('div');
    chiplist.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
    const drawChips = () => {
      chiplist.innerHTML = '';
      d.attached.map(id => F.ev(id)).filter(Boolean).forEach(e => {
        const chip = F.el('button', 'badge green', F.esc(e.code) + ' \u00d7');
        chip.style.cursor = 'pointer';
        chip.addEventListener('click', () => {
          d.attached = d.attached.filter(x => x !== e.id); persistDraft(); FMAudio.sfx.paper(); drawChips();
        });
        chiplist.appendChild(chip);
      });
      if (!d.attached.length) chiplist.appendChild(F.el('span', 'small', 'nessuna prova allegata'));
    };
    drawChips();
    const addB = F.el('button', 'btn', '+ ALLEGA PROVA');
    addB.style.marginTop = '10px';
    addB.addEventListener('click', () => {
      const g = F.el('div');
      g.innerHTML = '<h2>Alleghi una prova</h2>';
      window.FM_EVIDENCE.filter(e => S.isDiscovered(e.id)).forEach(e => {
        const b = F.el('button', 'btn', F.esc(e.code + ' \u00b7 ' + e.title));
        b.style.cssText = 'display:block;width:100%;margin-bottom:6px;text-align:left' + (d.attached.indexOf(e.id) !== -1 ? ';opacity:.4' : '');
        b.addEventListener('click', () => {
          if (d.attached.indexOf(e.id) === -1) { d.attached.push(e.id); persistDraft(); FMAudio.sfx.paper(); drawChips(); }
          F.closeModal();
        });
        g.appendChild(b);
      });
      F.openModal(g);
    });
    evBlock.appendChild(chiplist);
    evBlock.appendChild(addB);
    root.appendChild(evBlock);

    const go = F.el('button', 'btn primary', 'CONSEGNA LA RICOSTRUZIONE');
    go.style.cssText = 'margin:10px 0 40px';
    go.addEventListener('click', () => {
      if (!d.answers.whatHappened) { F.toast('Rispondi almeno alla domanda essenziale: che cosa e successo.'); return; }
      if (d.attached.length < 4) { judge('incomplete'); return; }
      judge();
    });
    root.appendChild(go);

    if (S.st.endings && S.st.endings.length) {
      const past = F.el('div', 'card');
      past.innerHTML = '<h3>Consegne precedenti</h3>' + S.st.endings.map(e =>
        '<p class="small mono">' + F.esc(e.date + ' \u2014 ' + e.label) + '</p>').join('');
      root.appendChild(past);
    }

    function answerOf(q, A) { return A[q.id]; }

    function judge(force) {
      const T = window.FM_TRUTH, d2 = currentDraft(), A = d2.answers;
      const attachedEss = (T.essential || []).filter(id => d2.attached.indexOf(id) !== -1);
      let endingKey;
      if (force) endingKey = 'incomplete';
      else if (A.whatHappened === 'violence' || A.whatHappened === 'coerced' ||
        (A.liars || []).some(x => x === 'claire' || x === 'elise')) endingKey = 'wrong';
      else if (A.whatHappened === 'voluntary' && A.lastInside === T.lastInside &&
        A.whyLeft === T.whyLeft && A.watch === T.watch &&
        joinSet(A.liars) === joinSet(T.liars) && attachedEss.length >= 4) endingKey = 'correct';
      else if (A.whatHappened === 'voluntary') endingKey = 'plausible';
      else endingKey = 'unresolved';

      const E = window.FM_ENDINGS[endingKey];
      persistDraft();
      S.st.endings.push({ date: 'ore ' + new Date().toTimeString().slice(0, 5), label: E.label });
      S.st.finished = true;
      S.save();
      FMAudio.sfx.motif();
      renderEnding(root, endingKey, E, d2, attachedEss);
    }
  };

  function renderEnding(root, key, E, d, attachedEss) {
    const F = window.FM, T = window.FM_TRUTH, S = window.FMState, A = d.answers;
    root.innerHTML = '';
    const box = F.el('div', 'ending ' + (E.tone || 'ok'));
    box.innerHTML = '<div class="e-key">CASE 001 \u2014 VERDETTO</div><h1>' + F.esc(E.label) + '</h1>' +
      '<div class="etext">' + F.esc(E.text) + '</div>';

    const tb = F.el('div', 'truthbox card');
    tb.innerHTML = '<h3>Che cosa e successo davvero</h3><p>' + F.esc(T.summary) + '</p>' +
      '<h3 style="margin-top:14px">Lettura delle persone</h3>' +
      '<ul style="padding-left:18px;margin:6px 0">' +
      '<li class="verdict-no">Hanno mentito deliberatamente: <b>' +
      T.liars.map(x => F.ch(x) ? F.ch(x).name : x).join(', ') + '</b>.</li>' +
      '<li class="verdict-partial">Ricordi falsi in buona fede: <b>' +
      T.falseMemory.map(x => F.ch(x) ? F.ch(x).name : x).join(', ') + '</b>.</li>' +
      '<li class="verdict-partial">Prove fuorvianti: <b>' +
      T.misleading.join(', ') + '</b> \u2014 orologio fermo (21:47), telefono crepato, chiavi sul gancio: tutti indizi apparsi dopo, senza collegamento con la notte.</li>' +
      '</ul>' +
      '<h3 style="margin-top:14px">Prove essenziali (' + attachedEss.length + '/' + T.essential.length + ')</h3>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      T.essential.map(id => {
        const e = F.ev(id);
        const had = attachedEss.indexOf(id) !== -1;
        return '<span class="badge ' + (had ? 'green' : 'red') + '">' + F.esc(e.code + ' \u00b7 ' + e.title) + (had ? '' : ' \u2014 non allegata') + '</span>';
      }).join('') + '</div>';

    const vd = F.el('div', 'truthbox card');
    vd.innerHTML = '<h3>Le tue risposte</h3>' + window.FM_QUESTIONS.map(q => {
      const given = A[q.id];
      const right = T[q.id];
      let ok;
      if (q.multi) {
        ok = (joinSet(given) === joinSet(right)) ? 'ok' : (given && given.length ? 'partial' : 'null');
      } else {
        ok = given == null ? 'null' : (given === right ? 'ok' : 'no');
      }
      const cls = { ok: 'verdict-ok', no: 'verdict-no', partial: 'verdict-partial', null: 'small' }[ok];
      const lab = q.multi
        ? ((given && given.length ? given.map(k => (window.FM_QUESTIONS.find(x => x.id === q.id).options.find(o => o.key === k) || {}).label).filter(Boolean).join(', ') : 'nessuna scelta'))
        : ((q.options.find(o => o.key === given) || {}).label || 'nessuna risposta');
      return '<div style="display:flex;gap:10px;margin:6px 0"><span class="' + cls + '" style="font-family:var(--mono);font-size:11px;width:110px;flex:none">' +
        ({ ok: 'CORRETTO', no: 'ERRATO', partial: 'PARZIALE', null: 'IN USCITA' })[ok] + '</span><span class="small">' + F.esc(lab) + '</span></div>';
    }).join('');

    const bar = F.el(null);
    bar.style.cssText = 'text-align:center;margin-top:10px';
    const again = F.el('button', 'btn', 'RIPRENDI L\u2019INDAGINE');
    again.addEventListener('click', () => {
      FMAudio.sfx.click(); S.st.finished = false; S.save(); window.FMUI.navigate('casew');
    });
    const restart = F.el('button', 'btn danger', 'NUOVA INDAGINE');
    restart.style.marginLeft = '10px';
    restart.addEventListener('click', () => {
      FMAudio.sfx.click(); window.FMState.reset(); draft = null; window.FMUI.navigate('casew');
    });
    bar.appendChild(again); bar.appendChild(restart);

    box.appendChild(tb); box.appendChild(vd); box.appendChild(bar);
    root.appendChild(box);
  }
})();
