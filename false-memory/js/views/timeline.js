/* vista TIMELINE: eventi derivati dalle prove + eventi custom del giocatore */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;

  /* eventi ricostruiti dalle prove: visibili solo con la prova acquisita.
     sort. Composizione: data formata 'GG/10 HH:MM' -> ordinamento lessicografico sicuro */
  const SOURCE = [
    { sort: '09/10 00:00', time: '09/10', type: 'confirmed', text: 'Manutenzione alle telecamere: l’orologio della camera A viene regolato con +7 min 10 s di anticipo.', ev: 'D11' },
    { sort: '10/10 11:20', time: '10/10 11:20', type: 'confirmed', text: 'Visita dal dr. Renard, neurologia: Daniel riceve una diagnosi degenerativa, la stessa malattia della madre.', ev: 'D03' },
    { sort: '13/10 00:00', time: '13/10', type: 'confirmed', text: 'Festa nel cortile del Le Sablon: compleanno di Daniel (verbale condominiale).', ev: 'D02x' },
    { sort: '15/10 05:48', time: '15/10 ~10:02', type: 'estimated', text: 'L’orologio di Daniel si ferma (13–15/10): la finestra temporale arriva dall’ultima esaminazione di foto/documenti (garanzia 15/10, foto di festa).', ev: 'D08' },
    { sort: '15/10 05:48', time: '15/10, mattina', type: 'estimated', text: 'Il telefono cade e si crepa: il reclamo di garanzia parte la stessa mattina, ore 10:02.', ev: 'D08' },
    { sort: '15/10 22:10', time: '15/10 ~22:10', type: 'estimated', text: 'Daniel scrive sul calendario: «21 - M. 8:30» in matita, con un asterisco.', ev: 'D06' },
    { sort: '16/10 00:00', time: '16/10', type: 'reported', text: 'Thomas dichiara un bonifico da 12.000 euro a Daniel (09/02): un prestito, dice.', ev: 'D10' },
    { sort: '16/10 00:00', time: '16/10 21:31', type: 'confirmed', text: 'Segreteria di Daniel a Claire: 42 secondi, tono distaccato. Scivola in una contraddizione con la dichiarazione di Claire.', ev: 'R04' },
    { sort: '16/10 23:05', time: '16/10 ~23:05', type: 'reported', text: 'Memo del dictafono di Daniel: parli della malattia come di un conto alla rovescia.', ev: 'R01' },
    { sort: '17/10 19:58', time: '17/10 19:58', type: 'reported', text: 'Elise dice di arrivare da Daniel: dice 19:58, il registro indica ingresso alle 20:05.', ev: 'D01' },
    { sort: '17/10 20:35', time: '17/10 20:35', type: 'reported', text: 'Fine della visita di Elise, stimata dal registro/uscita.', ev: 'D01' },
    { sort: '17/10 21:07', time: '17/10 21:07', type: 'confirmed', text: 'Ultima attività del telefono di Daniel: la linea resta muta da qui in poi (nessuna chiamata, nessun testo).', ev: 'D07' },
    { sort: '17/10 21:48', time: '17/10 21:48', type: 'reported', text: 'Citofono: arrivo di Thomas Keller. La conversazione con Daniel dura fino alle 22:04.', ev: 'R05' },
    { sort: '17/10 21:55', time: '17/10 21:55', type: 'reported', text: 'Tonfo e stridore nel buffer audio: qualcosa tra due persone che si conoscono.', ev: 'R05' },
    { sort: '17/10 22:04', time: '17/10 22:04', type: 'reported', text: 'Chiusura «normale» della porta dal citofono: nessun grido, nessuna richiesta d’aiuto.', ev: 'R05' },
    { sort: '17/10 22:12', time: '17/10 22:12', type: 'confirmed', text: 'Claire entra nell’edificio (registro + telecamera A).', ev: 'P05' },
    { sort: '17/10 22:26', time: '17/10 22:26', type: 'reported', text: 'Claire esce, 14 minuti dopo: la busta delle lettere della madre e il mandato restano (dichiarazione Claire).', ev: 'P05' },
    { sort: '17/10 22:28', time: '17/10 22:28', type: 'confirmed', text: 'Telecamera A: un uomo con un borsone e una cartella esce dal portone da solo. Ora sovraimpressa 22:35 — orologio A avanti di 7 min 10 s.', ev: 'P07' },
    { sort: '17/10 22:35', time: '17/10 22:35', type: 'confirmed', text: 'Telecamera A: il portone è già vuoto (nessun secondo passaggio, nessuna trascinamento).', ev: 'P06' },
    { sort: '17/10 22:41', time: '17/10 22:41', type: 'confirmed', text: 'N. Okafor fotografa l’ingresso della stazione: tra i passanti, Daniel.', ev: 'P08' },
    { sort: '18/10 06:12', time: '18/10 06:12', type: 'confirmed', text: 'Treno #4417 Saint-Aurel → Marsiglia: biglietto a nome D. MORAN.', ev: 'D05' },
    { sort: '18/10 08:52', time: '18/10 08:52', type: 'confirmed', text: 'Claire denuncia la scomparsa; la questura apre il fascicolo.', ev: null },
    { sort: '18/10 11:30', time: '18/10 11:30', type: 'reported', text: 'Dichiarazione scritta di Victor: «colonna delle uscite non composta», orologio trovato al pianterreno 3.', ev: 'D01' }
  ];
  /* evento trabocchetto: l'orologio fermo non e' un evento della notte */
  const TRAP = { sort: '17/10 21:47', time: '17/10 21:47', type: 'unknown', text: 'Che cosa farebbe un’orologio fermo alle 21:47 sul pianerottolo? (da verificare: quando si e fermato davvero?)', ev: 'O02' };

  V.timeline = function (root) {
    const F = window.FM, S = window.FMState, st = S.st;
    root.appendChild(F.el('h1', 'pagetitle', 'TIMELINE'));
    root.appendChild(F.el('div', 'pagesub', '17 ottobre 2024 e dintorni \u2014 verde: confermato, ambra: stimato, azzurro: riferito da testimone, grigio: sconosciuto'));
    F.hintOnce(root, 'timeline',
      'Gli eventi compaiono man mano che acquisisci prove. Con <b>+ EVENTO PERSONALE</b> aggiungi le tue ricostruzioni, con <b>segna incoerenza</b> marca gli orari impossibili: contano alla consegna.');

    const add = F.el('button', 'btn primary', '+ EVENTO PERSONALE');
    add.style.cssText = 'margin-bottom:16px';
    add.addEventListener('click', () => openCustom(null));
    root.appendChild(add);

    const items = [];
    SOURCE.concat(TRAP).forEach(x => {
      if (x.ev && !F.reqMet('ev:' + x.ev)) return;
      items.push(Object.assign({ custom: false }, x));
    });
    (st.timeline.custom || []).forEach((c, i) => {
      items.push(Object.assign({ custom: true, idx: i }, c));
    });
    items.sort((a, b) => (a.sort || '').localeCompare(b.sort || ''));

    const tl = F.el('div', 'tl');
    items.forEach(x => {
      const flagged = (st.timeline.flagged || []).indexOf(stampOf(x)) !== -1;
      const it = F.el('div', 'tl-item ' + x.type + (flagged ? ' flagged' : ''));
      it.innerHTML = '<div class="tl-time">' + F.esc(x.time) +
        '<span class="ttype">' + ({ confirmed: 'confermato', estimated: 'stimato', reported: 'riferito', unknown: 'da verificare' })[x.type] + '</span></div>' +
        '<div>' + F.esc(x.text) + '</div>' +
        (x.ev ? '<div class="src">fonte: ' + F.esc(F.ev(x.ev).code + ' \u00b7 ' + F.ev(x.ev).title) + '</div>' : '');
      const fb = F.el('button', 'flagbtn' + (flagged ? ' on' : ''), flagged ? 'INCOERENZA SEGNALATA' : 'segna incoerenza');
      fb.addEventListener('click', () => {
        const fl = st.timeline.flagged = st.timeline.flagged || [];
        const k = stampOf(x);
        const at = fl.indexOf(k);
        if (at === -1) { fl.push(k); FMAudio.sfx.contradiction(); } else fl.splice(at, 1);
        S.save();
        V.timeline(root);
      });
      it.appendChild(fb);
      if (x.custom) {
        const ed = F.el('button', 'x', '\u270e');
        ed.title = 'modifica';
        ed.addEventListener('click', () => openCustom(x));
        const rm = F.el('button', 'x', '\u00d7');
        rm.style.right = '32px';
        rm.addEventListener('click', () => {
          st.timeline.custom.splice(x.idx, 1);
          S.save(); FMAudio.sfx.paper(); V.timeline(root);
        });
        it.appendChild(ed); it.appendChild(rm);
      }
      tl.appendChild(it);
    });
    root.appendChild(tl);

    function stampOf(x) { return (x.ev ? 'ev:' + x.ev : 'cu:' + (x.time + x.text).slice(0, 40)); }

    function openCustom(existing) {
      const c = F.el('div');
      c.innerHTML = '<h2>' + (existing ? 'Modifica evento' : 'Nuovo evento della ricostruzione') + '</h2>' +
        '<div class="code-line">esempi: \u00ab17/10 22:15\u00bb \u00ab17/10 22:00-22:30\u00bb \u00ab? (ora indeterminata)\u00bb</div>';
      const mk = (lbl, val, options) => {
        const lab = document.createElement('label'); lab.className = 'field';
        lab.innerHTML = '<span class="lbl">' + lbl + '</span>';
        const inp = options ? document.createElement('select') : document.createElement('input');
        inp.type = options ? '' : 'text';
        if (options) {
          options.forEach(o => { const op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; inp.appendChild(op); });
          inp.value = val || options[0][0];
        } else inp.value = val || '';
        lab.appendChild(inp);
        c.appendChild(lab);
        return inp;
      };
      const tSort = mk('DATA/ORA (per l’ordine)', existing ? existing.sort : '', null);
      const tVis = mk('ETICHETTA VISIBILE', existing ? existing.time : '', null);
      const tType = mk('TIPO DI TEMPO', existing ? existing.type : '', [
        ['confirmed', 'Confermato'], ['estimated', 'Stimato'], ['reported', 'Riferito da testimone'], ['unknown', 'Sconosciuto']
      ]);
      const ta = document.createElement('textarea');
      ta.value = existing ? existing.text : '';
      ta.style.minHeight = '80px';
      const lab2 = document.createElement('label'); lab2.className = 'field';
      lab2.innerHTML = '<span class="lbl">DESCRIZIONE</span>';
      lab2.appendChild(ta); c.appendChild(lab2);
      const evSel = mk('COLLEGA A UNA PROVA', existing ? (existing.ev || '') : '',
        [['', 'nessuna']].concat(window.FM_EVIDENCE.filter(e => S.isDiscovered(e.id)).map(e => [e.id, e.code + ' \u00b7 ' + e.title])));
      const bar2 = F.el('div', 'closebar');
      const rms = F.el('button', 'btn', 'ANNULLA');
      rms.addEventListener('click', () => F.closeModal());
      const ok = F.el('button', 'btn primary', 'SALVA');
      ok.addEventListener('click', () => {
        const rec = {
          sort: tSort.value || '', time: tVis.value || tSort.value, type: tType.value,
          text: ta.value || '(senza descrizione)', ev: evSel.value || null
        };
        if (!rec.sort) { F.toast('LA DATA/ORA SERVE PER ORDINARE L’EVENTO'); return; }
        if (!existing) st.timeline.custom.push(rec);
        else Object.assign(existing, rec, { custom: true, idx: st.timeline.custom.indexOf(existing) });
        S.save(); FMAudio.sfx.paper(); F.closeModal(); V.timeline(root);
      });
      bar2.appendChild(rms); bar2.appendChild(ok);
      c.appendChild(bar2);
      F.openModal(c);
    }
  };
})();
