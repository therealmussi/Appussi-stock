/* bootstrap: shell, nav, avvio */
(function () {
  const F = window.FM, S = window.FMState;

  document.addEventListener('DOMContentLoaded', () => {
    S.load();
    const app = document.getElementById('app');
    app.innerHTML = '';

    /* topbar */
    const top = F.el('div', 'topbar');
    top.innerHTML = '<div class="logo"><b>F</b>ALSE MEMORY</div>' +
      '<div class="caseid">CASE 001 · THE DISAPPEARANCE · SAINT-AUREL · BUILD v6</div>' +
      '<div class="spacer"></div>' +
      '<span class="chip chapter" id="chip-chapter"></span>' +
      '<span class="chip proof" id="chip-proof"></span>' +
      '<button class="iconbtn" id="btn-help" title="come si gioca (?)">?</button>' +
      '<button class="iconbtn" id="btn-menu" title="menu">\u2630</button>';
    app.appendChild(top);

    const main = F.el('div', 'mainrow');

    const side = F.el('div', 'sidebar');
    const NAV = [
      ['casew', 'CASE FILE'],
      ['persons', 'PERSONS'],
      ['testimonies', 'TESTIMONIES'],
      ['evidence', 'EVIDENCE'],
      ['timeline', 'TIMELINE'],
      ['board', 'BOARD'],
      ['conclusions', 'CONCLUSIONS']
    ];
    NAV.forEach(([v, label]) => {
      const b = F.el('button', 'navbtn');
      b.dataset.view = v;
      b.innerHTML = '<span class="dot"></span>' + label + '<span class="cnt"></span>';
      b.addEventListener('click', () => window.FMUI.navigate(v));
      side.appendChild(b);
    });
    const foot = F.el('div', 'foot');
    side.appendChild(foot);
    main.appendChild(side);

    const view = F.el('div');
    view.id = 'view';
    main.appendChild(view);

    const toasts = F.el('div');
    toasts.id = 'toasts';
    app.appendChild(toasts);

    app.appendChild(main);

    document.getElementById('btn-menu').addEventListener('click', () => {
      window.FMAudio.resume();
      window.FMMenu.show();
    });
    document.getElementById('btn-help').addEventListener('click', () => {
      window.FMAudio.sfx.click();
      if (window.FMMenu.showHelp) window.FMMenu.showHelp();
    });

    /* scorciatoie da tastiera: 1-7 viste, ESC chiude modal/menu, ? guida */
    const ORDER = ['casew', 'persons', 'testimonies', 'evidence', 'timeline', 'board', 'conclusions'];
    document.addEventListener('keydown', ev => {
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (document.querySelector('.chaptercard')) return;
      if (ev.key === 'Escape') {
        const ov = document.querySelector('.overlay');
        if (ov) { window.FM.closeModal(); return; }
        if (window.FMMenu.isOpen()) {
          if (window.FMState.st.started) { window.FMMenu.hide(); window.FMUI.navigate('casew'); }
          return;
        }
        return;
      }
      if (ev.key === '?') { window.FMMenu.show(); window.FMMenu.showHelp && window.FMMenu.showHelp(); return; }
      const i = ['1', '2', '3', '4', '5', '6', '7'].indexOf(ev.key);
      if (i >= 0 && window.FMState.st.started) {
        ev.preventDefault();
        window.FMUI.navigate(ORDER[i]);
      }
    });

    /* impostazioni estetiche */
    document.documentElement.style.setProperty('--text-scale', S.st.settings.textSize || 1);
    document.body.classList.toggle('no-anim', !S.st.settings.animate);

    S.save();

    try { window.FMMenu.show(); } catch (e) {
      /* se il menu non parte (storage bloccato, browser vecchio): il caso si apre comunque */
      window.FMUI.navigate('casew');
    }
    updateTopbar();
    setInterval(updateTopbar, 4000);

    function updateTopbar() {
      const st = S.st;
      const n = S.chapter();
      const cch = document.getElementById('chip-chapter');
      if (cch) cch.textContent = 'CAP. 0' + n + ' \u2014 ' + ((window.FM_CHAPTERS[n - 1] || {}).title || '').toUpperCase();
      const goal = S.chapterGoal();
      const f = document.querySelector('.sidebar .foot');
      if (f) {
        f.innerHTML = goal.next
          ? '<b style="color:#6b7683">OBIETTIVO</b><br>' + goal.need + ' prove al capitolo 0' + goal.next +
            '<br>contraddizioni segnalate:<br><b style="color:#d1554a">' + S.contradictionCount() + '</b>' +
            '<br><br><b style="color:#6b7683">salvataggio:</b> automatico'
          : '<b style="color:#6b7683">OBIETTIVO</b><br>consegna in CONCLUSIONS' +
            '<br><br><b style="color:#6b7683">salvataggio:</b> automatico';
      }
      F.updateNav();
    }
    /* prima inizializzazione della barra delle prove */
    F.updateNav();
  });
})();
