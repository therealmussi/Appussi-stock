/* menu principale, impostazioni, crediti */
(function () {
  const F = window.FM;

  function show() {
    const S = window.FMState, st = S.st;
    closeExisting();
    const o = F.el('div', 'menu-overlay');
    o.id = 'menu';
    const box = F.el('div', 'menu-box');
    const sub = F.el('div', 'menu-sub');
    sub.innerHTML = 'CASE 001 \u00b7 THE DISAPPEARANCE' +
      ((st.endings && st.endings.length) ? '<br>consegne archiviate: ' + st.endings.length + '/5' : '');
    box.innerHTML = '<div class="menu-title"><b>F</b>ALSE MEMORY</div>';
    box.appendChild(sub);
    box.id = 'menu-box';

    const go = (label, fn, dis, subt) => {
      const b = F.el('button', 'menu-btn');
      b.innerHTML = label + (subt ? '<span class="menu-btn-sub">' + subt + '</span>' : '');
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
      const busy = st.started && (st.discovered.length || st.board.nodes.length || st.timeline.custom.length);
      if (busy) {
        const c = F.el('div');
        c.innerHTML = '<h2>Inizi una nuova indagine?</h2><div class="code-line">l\u2019indagine in corso (CAP. 0' + st.chapter +
          ', ' + st.discovered.length + ' prove acquisite) sar\u00e0 cancellata</div>' +
          '<p class="small">Le consegne archiviate e le impostazioni restano.</p>';
        const bar = F.el('div', 'closebar');
        const no = F.el('button', 'btn', 'ANNULLA');
        no.addEventListener('click', () => { window.FMAudio.sfx.click(); F.closeModal(); });
        const yes = F.el('button', 'btn danger', 'CONFERMA: NUOVA INDAGINE');
        yes.addEventListener('click', () => {
          F.closeModal();
          startFresh();
        });
        bar.appendChild(no); bar.appendChild(yes);
        c.appendChild(bar);
        F.openModal(c);
      } else startFresh();

      function startFresh() {
        S.reset();
        hide();
        window.FM.markSeen();
        runIntro(() => window.FMUI.navigate('casew'));
      }
    }, false);

    go('CONTINUE', () => { hide(); window.FMUI.navigate('casew'); }, !S.hasSave(),
      S.hasSave() && st.started ? 'CAP. 0' + st.chapter + ' \u00b7 ' + st.discovered.length + '/30 prove' : '');

    go('CASE ARCHIVE', () => showArchive());

    go('HOW TO PLAY', () => showHelp());

    go('SETTINGS', () => showSettings());

    go('CREDITS', () => showCredits());

    const foot = F.el('div', 'menu-foot');
    foot.innerHTML = 'un gioco di MATTEO MUSSILLON &middot; tutto in locale, nessun server<br><span class=\"code-line\" style=\"font-size:9px;color:#4c5661\">BUILD v5</span>';
    box.appendChild(foot);
    o.appendChild(box);
    document.body.appendChild(o);

    function showArchive() {
      const st2 = S.st;
      const done = (st2.endings || []).length;
      F.openModal('<h2>CASE ARCHIVE</h2><div class="code-line">consegne archiviate: ' + done + '/5 per il CASE 001</div>' +
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
        '<p>Un gioco di <b>Matteo Mussillon</b> (therealmussi).</p>' +
        '<p class="small">Caso, testo, interfaccia e musica: linea creativa e disegno del gioco di <b>Matteo Mussillon</b>; implementazione tecnica nella piattaforma Appussi-stock.</p>' +
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

  function showHelp() {
    F.openModal('<h2>COME SI GIOCA</h2><div class="code-line">FALSE MEMORY \u2014 guida rapida</div>' +
      '<p class="small"><b>Il caso esiste. Ci\u00f2 che ti viene raccontato, quasi mai.</b> Il tuo compito: capire cosa \u00e8 successo davvero, separando bugie, ricordi sbagliati e prove fuorvianti.</p>' +
      '<table class="mono small" style="border-spacing:0 8px">' +
      '<tr><td style="padding-right:14px;color:var(--amber);vertical-align:top">PERSONS</td><td>Interroga i quattro contatti. Ogni argomento pu\u00f2 sbloccare qualcosa; confronta le risposte con le prove con \u00abPRESENTA UNA PROVA\u00bb.</td></tr>' +
      '<tr><td style="padding-right:14px;color:var(--amber);vertical-align:top">EVIDENCE</td><td>Apri ogni prova: gli <b>esami</b> svelano dettagli invisibili al primo sguardo, e sbloccano nuove piste. Assegna un livello di affidabilit\u00e0 a ogni fonte.</td></tr>' +
      '<tr><td style="padding-right:14px;color:var(--amber);vertical-align:top">TIMELINE</td><td>Ricostruisci la notte del 17/10. Aggiungi eventi con + EVENTO e marca le incoerenze: gli orari dei testimoni non sempre sono veri.</td></tr>' +
      '<tr><td style="padding-right:14px;color:var(--amber);vertical-align:top">BOARD</td><td>Trascina prove e dichiarazioni sulla bacheca e collegali (CONFERMA, CONTRADDICE...). \u00c8 il tuo ragionamento: il gioco non la risolve mai al posto tuo.</td></tr>' +
      '<tr><td style="padding-right:14px;color:var(--amber);vertical-align:top">CONCLUSIONS</td><td>Quando la ricostruzione regge, consegnala. Una consegna insufficiente chiude il caso male \u2014 resta in CASE ARCHIVE e potrai riprovare.</td></tr>' +
      '</table>' +
      '<p class="small mono" style="margin-top:14px;color:#5f6975">scorciatoie: tasti 1-7 per le viste \u00b7 ESC chiude le finestre e il menu \u00b7 ? apre questa guida</p>');
  }

  /* ---------- intro narrativa (nuova indagine) ---------- */
  function runIntro(done) {
    const pages = [
      { k: 'SAINT-AUREL \u00b7 OTTOBRE 2024',
        p: ['Le Sablon, diciotto appartamenti, un inserviente di notte.',
            'Alle 08:52 del 18 ottobre Claire Moreau denuncia la scomparsa del fratello Daniel: non risponde da ieri sera.'] },
      { k: 'QUATTRO PERSONE \u00b7 QUATTRO VERSIONI',
        p: ['Una sorella, un amico, una ex partner, un inserviente.',
            'Ognuno ricorda la notte a modo suo. Alcuni mentono. Altri credono davvero a ci\u00f2 che raccontano.'] },
      { k: 'FALSE MEMORY',
        p: ['La verit\u00e0 esiste.',
            'Quasi tutto ci\u00f2 che ti diranno su di lei \u00e8 sbagliato.'],
        cta: 'clicca per aprire il fascicolo' }
    ];
    let i = 0;
    const o = F.el('div', 'chaptercard intro');
    document.body.appendChild(o);
    window.FMAudio.sfx.motif();
    function render() {
      const pg = pages[i];
      o.innerHTML = '<div class="inner"><div class="c-n">' + pg.k + '</div>' +
        pg.p.map(l => '<p>' + F.esc(l) + '</p>').join('') +
        '<p class="small mono">' + (pg.cta || 'clic per continuare') + '</p></div>';
    }
    function advance() {
      i++;
      window.FMAudio.sfx.paper();
      if (i >= pages.length) { o.remove(); done(); return; }
      render();
    }
    o.addEventListener('click', advance);
    render();
  }

  window.FMMenu = {
    show, runIntro, showHelp,
    hide() { const m = document.getElementById('menu'); if (m) m.remove(); },
    isOpen() { return !!document.getElementById('menu'); }
  };
})();
