/* TIME DEPARTMENT — persistence, progression, derived state */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var META = TD.META || (function(){ var M = (typeof require !== "undefined") ? require("./data/meta.js") : null; return M ? M.META : {}; })();
  var RANKS = (typeof module !== "undefined" && module.exports) ? require("./data/meta.js").RANKS : (TD.META ? TD.RANKS : []);

  var KEY = META.saveKey || "td_save_v1";

  function freshState() {
    return {
      version: 1,
      profile: { id: "INV-" + String(1000 + Math.floor(Math.random() * 9000)), name: "" },
      created: Date.now(),
      lastPlayed: Date.now(),
      deptDay: 0,               /* fictional day counter, advances per case */
      globalStability: 84.0,
      settings: { master: 0.8, music: 0.5, ambient: 0.6, sfx: 0.7, tick: true, scanlines: true, reducedMotion: false },
      introSeen: false,
      cases: {},                /* per-case state */
      comms: [],                /* global comms log: {case, from, text, time} */
      hintsUsed: {},            /* caseId -> count */
      janus: 0,
      bestScore: {},            /* caseId -> best submitted score (survives replays) */
      completed: []            /* ordered case ids */
    };
  }

  function emptyCaseState() {
    return {
      startedAt: Date.now(),
      lastTab: "overview",
      opened: [],               /* evidence ids opened */
      reveals: [],              /* evidence detail indices free-viewed: "v1:0" */
      labs: [],                 /* lab run ids */
      marks: {},                /* eid -> mark */
      notes: {},                /* eid -> text */
      scans: [],                /* scanner target indexes performed */
      scanReports: [],          /* ids of generated scan evidence */
      timeline: null,           /* array of event ids in player order */
      causality: [],            /* {from,to,rel} */
      board: { cards: [], links: [] },
      chosenIntervention: null,
      submitted: null           /* report result object when complete */
    };
  }

  var state = null;

  function load() {
    try {
      var raw = root.localStorage ? root.localStorage.getItem(KEY) : null;
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || s.version !== 1) return null;
      s.settings = Object.assign({ master: 0.8, music: 0.5, ambient: 0.6, sfx: 0.7, tick: true, scanlines: true, reducedMotion: false }, s.settings || {});
      s.bestScore = s.bestScore || {};
      return s;
    } catch (e) { return null; }
  }

  function save() {
    if (!state) return;
    try {
      state.lastPlayed = Date.now();
      root.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* storage full or unavailable: play on */ }
  }

  function ensure(caseId) {
    if (!state.cases[caseId]) state.cases[caseId] = emptyCaseState();
    return state.cases[caseId];
  }

  /* ---------- progression ---------- */
  function completedCount() { return state.completed.length; }
  function bestOf(caseId) {
    var cs = state.cases[caseId];
    var sub = cs && cs.submitted ? cs.submitted.score : null;
    var best = state.bestScore[caseId] || 0;
    return Math.max(best, sub || 0) || sub || 0;
  }
  function avgScore() {
    var n = 0, t = 0;
    TD.CASES.forEach(function (c) {
      var cs = state.cases[c.id];
      if ((cs && cs.submitted) || state.bestScore[c.id] || isComplete(c.id)) { n++; t += bestOf(c.id); }
    });
    return n ? Math.round(t / n) : 0;
  }
  function rank() {
    var done = completedCount(), avg = avgScore();
    var r = 0;
    for (var i = 1; i < (TD.RANKS || RANKS).length; i++) {
      var rk = (TD.RANKS || RANKS)[i];
      if (rk.occupied) continue;
      if (done >= rk.need && (rk.minAvg ? avg >= rk.minAvg : true)) r = i;
    }
    return (TD.RANKS || RANKS)[r];
  }
  function nextRank() {
    var R = (TD.RANKS || RANKS), cur = rank(), idx = R.indexOf(cur);
    return idx + 1 < R.length ? R[idx + 1] : null;
  }
  function stabilityDeltaTotal() {
    var d = 0;
    TD.CASES.forEach(function (c) {
      var cs = state.cases[c.id];
      if (cs && cs.submitted && typeof cs.submitted.stabilityApplied === "number") d += cs.submitted.stabilityApplied;
    });
    return d;
  }

  /* ---------- decoding helpers ---------- */
  function caseUnlocked(caseData) {
    if (caseData.number === 1) return true;
    return state.completed.indexOf(TD.CASES[caseData.number - 2].id) !== -1;
  }
  function isComplete(caseId) { return state.completed.indexOf(caseId) !== -1; }
  function reopenCase(caseId) {
    var cs = state.cases[caseId];
    if (cs && cs.submitted) {
      var best = state.bestScore[caseId] || 0;
      state.bestScore[caseId] = Math.max(best, cs.submitted.score);
    }
    state.cases[caseId] = emptyCaseState();
    save();
  }
  function addJanus(n) { state.janus += n; }
  function logComm(caseId, fromId, text) {
    state.comms.push({ case: caseId, from: fromId, text: text, time: Date.now() });
    if (state.comms.length > 400) state.comms.splice(0, state.comms.length - 400);
    save();
  }

  TD.STATE = {
    get: function () { return state; },
    init: function () { state = load() || freshState(); return state; },
    save: save,
    hasSave: function () { return !!load(); },
    ensure: ensure,
    cs: ensure,
    reset: function () { state = freshState(); save(); },
    importSave: function (json) {
      var s = JSON.parse(json);
      if (!s || s.version !== 1) throw new Error("Invalid save format");
      if (!s.profile || !s.cases) throw new Error("Corrupt save payload");
      state = s; save();
    },
    exportSave: function () { return JSON.stringify(state); },
    completedCount: completedCount, avgScore: avgScore, rank: rank,
    nextRank: nextRank, caseUnlocked: caseUnlocked, isComplete: isComplete,
    bestOf: bestOf, reopenCase: reopenCase,
    addJanus: addJanus, logComm: logComm, stabilityDeltaTotal: stabilityDeltaTotal
  };
})(typeof window !== "undefined" ? window : globalThis);
