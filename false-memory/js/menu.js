/* menu principale, impostazioni, crediti */
(function () {
  const F = window.FM;

  function show() {
    const S = window.FMState, st = S.st;
    closeExisting();
    const o = F.el('div', 'menu-overlay');
    o.id = 'menu';
    const box = F.el('div', 'menu-box');
    box.innerHTML = '<div class="menu-title"><b>F</b>ALSE MEMORY</div>' +
      '<div class="menu-sub">CASE 001 \u00b7 THE DISAPPEARANCE</div>';
    box.id = 'menu-box';

    const go = (label, fn, dis) => {
      const b = F.el('button', 'menu-btn', label);
      if (dis) b.disabled = true;
      else b.addEventListener('click', () => {
        window.FMAudio.resume();
        if (st.settings.audioOn) window.FMAudio.startAmbient();
        window.FMAudio.sfx.unlock();
        fn();
      });
      box.appendChild(b);
      return b;
    };

    go('NEW INVESTIGATION', () => {
      S.reset();
      hide();
      window.FM.markSeen();
      window.FMUI.navigate('casew');
    }, false);

    go('CONTINUE', () => { hide(); window.FMUI.navigate('casew'); }, !S.hasSave());

    go('CASE ARCHIVE', () => showArchive());

    go('SETTINGS', () => showSettings());

    go('CREDITS', () => showCredits());

    const foot = F.el('div', 'menu-foot');
    foot.textContent = 'un thriller investigativo \u00b7 tutto in locale, nessun server';
    box.appendChild(foot);
    o.appendChild(box);
    document.body.appendChild(o);

    function showArchive() {
      const st2 = S.st;
      F.openModal('<h2>CASE ARCHIVE</h2><div class="code-line">consegne archiviate per il CASE 001</div>' +
        ((st2.endings && st2.endings.length)
          ? st2.endings.map(e => '<p class="mono small" style="margin:6px 0">' + F.esc(e.date) + ' \u2014 ' + F.esc(e.label) + '</p>').join('')
          : '<p class="small">Nessuna consegna archiviata. Completa l\u2019indagine e consegna la tua ricostruzione.</p>') +
        '<p class="small mono" style="margin-top:12px;color:#4c5661">CASE 002 \u00b7 THE WITNESS \u2014 in preparazione<br>' +
        'CASE 003 \u00b7 THE PHOTOGRAPH \u2014 in preparazione<br>' +
        'CASE 004 \u00b7 THE LAST RECORDING \u2014 in preparazione</p>');
    }

    function showSettings() {
      const c = F.el('div');
      c.innerHTML = '<h2>SETTINGS</h2>';
      const mk = (label, key, lo, hi, step, fmt) => {
        const row = F.el('div', 'setrow');
        row.innerHTML = '<label>' + label + '</label>';
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = lo; inp.max = hi; inp.step = step;
        inp.value = st.settings[key];
        const val = F.el('span', 'small mono', fmt(st.settings[key]));
        inp.addEventListener('input', () => {
          st.settings[key] = parseFloat(inp.value);
          val.textContent = fmt(st.settings[key]);
          S.save();
          window.FMAudio.applyVolumes();
        });
        row.appendChild(inp); row.appendChild(val);
        c.appendChild(row);
      };
      mk('MUSICA', 'music', 0, 1, .05, v => Math.round(v * 100) + '%');
      mk('EFFETTI SONORI', 'sfx', 0, 1, .05, v => Math.round(v * 100) + '%');
      const row3 = F.el('div', 'setrow');
      row3.innerHTML = '<label>DIMENSIONE TESTO</label>';
      const sel = document.createElement('select');
      [[0.9, 'Piccolo'], [1, 'Normale'], [1.15, 'Grande'], [1.3, 'Molto grande']].forEach(p => {
        const op = document.createElement('option'); op.value = p[0]; op.textContent = p[1];
        sel.appendChild(op);
      });
      sel.value = String(st.settings.textSize);
      sel.addEventListener('change', () => {
        st.settings.textSize = parseFloat(sel.value);
        S.save();
        document.documentElement.style.setProperty('--text-scale', st.settings.textSize);
        window.FMAudio.sfx.click();
      });
      row3.appendChild(sel);
      c.appendChild(row3);
      const row4 = F.el('div', 'setrow');
      row4.innerHTML = '<label>ANIMAZIONI</label>';
      const an = document.createElement('select');
      [['1', 'Attive'], ['0', 'Ridotte']].forEach(p => { const op = document.createElement('option'); op.value = p[0]; op.textContent = p[1]; an.appendChild(op); });
      an.value = st.settings.animate ? '1' : '0';
      an.addEventListener('change', () => {
        st.settings.animate = an.value === '1';
        S.save();
        document.body.classList.toggle('no-anim', !st.settings.animate);
      });
      row4.appendChild(an);
      c.appendChild(row4);
      const row5 = F.el('div', 'setrow');
      row5.innerHTML = '<label>AUDIO AMBIENTE</label>';
      const aud = document.createElement('select');
      [['1', 'Attivo'], ['0', 'Silenzioso']].forEach(p => { const op = document.createElement('option'); op.value = p[0]; op.textContent = p[1]; aud.appendChild(op); });
      aud.value = st.settings.audioOn ? '1' : '0';
      aud.addEventListener('change', () => {
        st.settings.audioOn = aud.value === '1';
        S.save();
        if (st.settings.audioOn) window.FMAudio.startAmbient(); else window.FMAudio.stopAmbient();
      });
      row5.appendChild(aud);
      c.appendChild(row5);
      const bar = F.el('div', 'closebar');
      const rms = F.el('button', 'btn danger', 'CANCELLA LE IMPOSTAZIONI DI GIOCO');
      rms.addEventListener('click', () => {
        S.reset();
        F.toast('Progressi azzerati.');
        F.closeModal();
      });
      const ok = F.el('button', 'btn primary', 'CHIUDI');
      ok.addEventListener('click', () => F.closeModal());
      bar.appendChild(rms); bar.appendChild(ok);
      c.appendChild(bar);
      F.openModal(c);
    }

    function showCredits() {
      F.openModal('<h2>CREDITS</h2><div class="code-line">FALSE MEMORY \u2014 CASE 001 \u00b7 THE DISAPPEARANCE</div>' +
        '<p>Progetto, testi, interfaccia e musica: realizzato per <b>Appussi-stock</b>.</p>' +
        '<p class="small">Tutta la storia, i personaggi e gli eventi sono inventati. Qualsiasi somiglianza con persone o luoghi reali \u00e8 casuale.</p>' +
        '<p class="small">Audio interamente sintetizzato con Web Audio API \u2014 nessun asset esterno. Immagini generate proceduralmente in SVG.</p>' +
        '<p class="small mono" style="color:#4c5661">ispirazione: i luoghi in cui ci\u00f2 che ricordiamo non corrisponde a ci\u00f2 che \u00e8 successo.</p>');
    }

    function closeExisting() {
      const old = document.getElementById('menu');
      if (old) old.remove();
    }
    function hide() { closeExisting(); }
  }

  window.FMMenu = {
    show, hide() { const m = document.getElementById('menu'); if (m) m.remove(); },
    isOpen() { return !!document.getElementById('menu'); }
  };
})();
