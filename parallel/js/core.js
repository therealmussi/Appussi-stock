/* PARALLEL — core: RNG deterministico, utilità matematiche, stato, serializzazione */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});
  PAR.VERSION = '0.9.0';

  PAR.createRng = function (seed) {
    let s = (seed >>> 0) || 1;
    const rng = function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.state = () => s;
    rng.setState = (v) => { s = v >>> 0; };
    return rng;
  };

  PAR.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  PAR.lerp = (a, b, t) => a + (b - a) * t;
  PAR.logistic = (x, k, x0) => 1 / (1 + Math.exp(-k * (x - x0)));
  PAR.sum = (arr, fn) => arr.reduce((a, x) => a + (fn ? fn(x) : x), 0);
  PAR.avg = (arr) => (arr.length ? PAR.sum(arr) / arr.length : 0);

  PAR.fmt = {
    num(v, d = 0) {
      return v.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });
    },
    pop(n) {
      if (n >= 1e6) return (n / 1e6).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mln';
      return PAR.fmt.num(Math.round(n / 1000)) + ' mila';
    },
    money(v) {
      return (v >= 0 ? '' : '−') + Math.abs(v).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mld L';
    },
    pct(v, d = 1) { return (v * 100).toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%'; },
    idx(v, d = 0) { return v.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  };

  PAR.store = {
    key(slot) { return 'parallel.save.' + slot; },
    write(slot, data) {
      try { localStorage.setItem(this.key(slot), JSON.stringify(data)); return true; }
      catch (e) { console.warn('scrittura fallita', e); return false; }
    },
    read(slot) {
      try {
        const raw = localStorage.getItem(this.key(slot));
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    remove(slot) { try { localStorage.removeItem(this.key(slot)); } catch (e) { /* noop */ } },
    list() {
      const out = [];
      for (let i = 1; i <= 3; i++) {
        const d = this.read('slot' + i);
        out.push({
          slot: 'slot' + i,
          meta: d ? { year: d.state.year, pop: d.state.systems.demografia.popolazione, saved: d.meta?.saved } : null
        });
      }
      return out;
    }
  };

  PAR.newState = function (scenarioId, seed) {
    const sc = PAR.SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) throw new Error('scenario inesistente: ' + scenarioId);
    const S = {
      version: PAR.VERSION,
      scenario: scenarioId,
      rngSeed: seed || (Date.now() % 1e9),
      rngState: (seed || (Date.now() % 1e9)) >>> 0 || 1,
      year: sc.start.year,
      endYear: sc.start.endYear,
      overstay: 0,
      treasury: (sc.finanzaBase && sc.finanzaBase.cassaIniziale) || 0,
      debt: 0,
      maxDebtEventFired: false,
      pendingEvents: [],
      pendingDecisions: [],
      activeDecisions: [],
      activeEvents: [],
      eventCd: {},
      eventFired: {},
      projects: [],
      decisionsTaken: [],
      mods: [],
      timeline: [],
      log: [],
      history: [],
      systems: {
        demografia: {},
        economia: {},
        trasporti: {},
        territorio: {},
        ambiente: {},
        sociale: {},
        politica: {}
      },
      territorio: sc.territorioInit(),
      yearReport: null,
      finished: false,
      finalReport: null,
      flags: {}
    };
    PAR._rng = PAR.createRng(S.rngSeed);
    sc.initSystems(S);
    PAR.Engine.snapshot(S);
    PAR.Engine.timelineAdd(S, {
      year: S.year, kind: 'inizio', tag: 'STORICO',
      title: 'Partenza della campagne: Torino, ' + sc.start.year,
      text: sc.start.introText
    });
    return S;
  };

  PAR._rng = null;
  PAR.rng = function () { return PAR._rng ? PAR._rng() : 0.5; };

  PAR.serialize = function (S) {
    const copy = JSON.parse(JSON.stringify(S));
    copy.rngState = PAR._rng ? PAR._rng.state() : S.rngState;
    return { meta: { version: PAR.VERSION, saved: new Date().toISOString() }, state: copy };
  };

  PAR.deserialize = function (bundle) {
    const S = bundle.state;
    const sc = PAR.SCENARIOS.find(s => s.id === S.scenario);
    if (!sc) throw new Error('scenario non trovato nel salvataggio');
    S.rngState = bundle.state.rngState || 1;
    PAR._rng = PAR.createRng(S.rngSeed || 1);
    PAR._rng.setState(S.rngState);
    PAR._rng.setState(S.rngState);
    PAR.Engine.rebindScenario(sc);
    return S;
  };
})();
