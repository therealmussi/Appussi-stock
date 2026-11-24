'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const D = E.Core, EN = E.Engine, UI = E.UI, MAP = E.Map, DATA = E.DATA;
  const SAVE_KEY = 'ehl-save-v1';
  const SPEEDS = [
    { id: 'pause', label: '⏸', cps: 0 },
    { id: 'play', label: '▶', cps: 30 },
    { id: 'fast', label: '⏩', cps: 6 * 60 },
    { id: 'vfast', label: '⏭', cps: 2 * 1440 }
  ];
  const state = { S: null, speed: 1, carry: 0, map: null, jumping: false, lastFrame: 0 };
  E.state = null;

  function $(id) { return document.getElementById(id); }

  /* ---------- splash ---------- */
  function initSplash() {
    const hasSave = !!D.load(SAVE_KEY);
    const continueBtn = $('btn-continue');
    continueBtn.disabled = !hasSave;
    continueBtn.textContent = hasSave ? 'Continua la simulazione salvata' : 'Continua (nessun salvataggio)';
    if (hasSave) continueBtn.classList.add('primary');
    $('btn-new').addEventListener('click', function () {
      const seedTxt = $('seed').value.trim();
      const seed = seedTxt ? hashSeed(seedTxt) : (Math.random() * 0xffffffff) >>> 0;
      start(EN.newState(seed));
    });
    continueBtn.addEventListener('click', function () {
      const raw = D.load(SAVE_KEY);
      if (!raw) return;
      const revived = EN.revive(raw);
      start(revived);
    });
    $('seed').value = 'northbridge';
  }
  function hashSeed(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ---------- avvio ---------- */
  function start(S) {
    state.S = S;
    E.state = S;
    UI.state(S);
    $('splash').style.display = 'none';
    $('app').style.display = 'flex';
    UI.initShell(S);
    UI.initFeed();
    UI.setFollow(null);
    UI.refreshInterventions();

    state.map = MAP.init($('map'), {
      getState: () => E.state,
      onPickBuilding: id => UI.openBuilding(id),
      onPickCitizen: id => UI.openCitizen(id)
    });
    MAP.homeView(state.map);
    $('zoom-in').addEventListener('click', () => MAP.zoom(state.map, 1.25));
    $('zoom-out').addEventListener('click', () => MAP.zoom(state.map, 1 / 1.25));
    $('zoom-home').addEventListener('click', () => { MAP.homeView(state.map); state.map.followOn = false; });
    $('followcam').addEventListener('click', function () {
      state.map.followOn = !state.map.followOn;
      this.classList.toggle('primary', state.map.followOn);
      this.textContent = state.map.followOn ? '🎥 segue citt. ON' : '🎥 segue citt.';
    });

    for (let i = 0; i < SPEEDS.length; i++) {
      const b = $('speed-' + i);
      b.textContent = SPEEDS[i].label;
      b.title = ['Pausa', 'Velocità normale (30 min/s)', 'Veloce (6 ore/s)', 'Molto veloce (2 giorni/s)'][i];
      b.addEventListener('click', () => setSpeed(i));
    }
    setSpeed(1);
    const jumps = [['jump-h', 60, 'Salta 1 ora'], ['jump-d', 1440, 'Salta 1 giorno'], ['jump-w', 7 * 1440, 'Salta 1 settimana'], ['jump-m', 'mese', 'Salta 1 mese'], ['jump-y', 'anno', 'Salta 1 anno']];
    for (const [id, amt] of jumps) $(id).addEventListener('click', () => jump(amt));
    $('savebtn').addEventListener('click', doSave);
    $('observer').addEventListener('click', function () {
      state.S.observerMode = !state.S.observerMode;
      this.classList.toggle('primary', state.S.observerMode);
      this.textContent = state.S.observerMode ? '🔬 Osservatore MODO PURO: ON' : '🔬 Modalità osservatore pura';
      UI.refreshInterventions();
    });
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && !e.target.matches('input,textarea,select')) { e.preventDefault(); setSpeed(state.speed === 0 ? 1 : 0); }
    });

    UI.renderFeed();
    refresh();
    requestAnimationFrame(loop);
  }

  function setSpeed(i) {
    state.speed = i;
    SPEEDS.forEach((s, k) => {
      const b = $('speed-' + k);
      if (b) b.classList.toggle('on', k === i);
    });
  }

  /* ---------- cronologia / loop ---------- */
  function daysInMonth(y, m) { return D.DPM[(m - 1) % 12]; }

  function jump(amt) {
    if (state.jumping) return;
    if (amt === 'mese') {
      const d = D.dateFromMinutes(state.S.dayIndex * D.MPD);
      amt = daysInMonth(d.year, d.month) * 1440;
    } else if (amt === 'anno') amt = 365 * 1440;
    const minutes = amt; let left = amt;
    state.jumping = true;
    setSpeed(0);
    const label = $('jumpbar'); label.style.display = 'block';
    function step() {
      const t0 = performance.now();
      while (left > 0 && performance.now() - t0 < 12) {
        const dminutes = Math.min(left, 15 * 1440);
        const days = Math.round(dminutes / 1440);
        state.S.minutes = state.S.dayIndex * D.MPD;
        EN.stepDays(state.S, days);
        left -= days * 1440;
      }
      label.textContent = '⏳ Salto in corso… ' + Math.round((1 - left / minutes) * 100) + '%';
      afterSim();
      if (left > 0) requestAnimationFrame(step);
      else { state.jumping = false; label.style.display = 'none'; }
    }
    requestAnimationFrame(step);
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, (ts - (state.lastFrame || ts)) / 1000);
    state.lastFrame = ts;
    const S = state.S;
    if (!S || state.jumping) return;
    const cps = SPEEDS[state.speed].cps;
    if (cps > 0) {
      state.carry += cps * dt;
      const days = Math.floor(state.carry / 1440);
      if (days > 0) {
        state.carry -= days * 1440;
        S.minutes = S.dayIndex * D.MPD;
        EN.stepDays(S, Math.min(days, 30));
      }
      S.minutes = S.dayIndex * D.MPD + Math.floor(state.carry);
      afterSim();
    }
  }

  function afterSim() {
    UI.refreshTopbar();
    UI.renderFeedThrottled();
    const d = D.dateFromMinutes(state.S.minutes);
    if (d.day === 1 && d.hour === 0 && !state._savedMonth) {
      state._savedMonth = true;
      doSave(true);
    } else if (d.day !== 1) state._savedMonth = false;
  }

  function doSave(quiet) {
    const S = state.S;
    const raw = E.Engine.compactForSave(S);
    const r = D.save(SAVE_KEY, raw);
    if (!quiet) {
      const b = $('savebtn');
      b.textContent = r === 'ok' ? '✓ Salvato' : r === 'too-big' ? '⚠ Troppo grande per localStorage' : '⚠ Salvataggio non riuscito';
      setTimeout(() => { b.textContent = '💾 Salva'; }, 2200);
    }
  }

  /* ---- refresh periodico pannelli leggeri ---- */
  let feedT = 0;
  UI.renderFeedThrottled = function () {
    const now = Date.now();
    if (now - feedT < 1400) return;
    feedT = now;
    UI.renderFeed();
    UI.refreshInterventions();
    if ($('panel').classList.contains('on')) UI.showView(currentView());
  };
  function currentView() {
    for (const v of ['cittadini', 'famiglie', 'relazioni', 'economia', 'statistiche', 'giornale', 'storia'])
      if ($('nav-' + v).classList.contains('on')) return v;
    return 'citta';
  }
  UI.refreshTopbarThrottled = UI.refreshTopbar;

  function refresh() { UI.refreshTopbar(); }
})(window.EHL);
