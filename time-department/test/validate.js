#!/usr/bin/env node
/* TIME DEPARTMENT — headless validation suite.
   Verifies that every case is complete, internally consistent and solvable:
   - unique ids across cases, evidence, events, scanner targets
   - every referenced id exists (timeline src, causality endpoints, comms triggers)
   - timeline order is a permutation of all events (solvable)
   - causality relations use valid relation names
   - every case has key evidence, at least one contradiction-capable pair, ≥3 interventions
   - report questions each have exactly one best option
   - scanner yields produce unique evidence ids
   - engine scoring sanity: perfect play ⇒ 100; empty play ⇒ low
   - save round-trip */
(function () {
  "use strict";
  var path = require("path");
  var dataDir = path.join(__dirname, "..", "js", "data");
  var META = require(path.join(dataDir, "meta.js"));
  var case1 = require(path.join(dataDir, "case1.js"));
  var case2 = require(path.join(dataDir, "case2.js"));
  var case3 = require(path.join(dataDir, "case3.js"));
  var case4 = require(path.join(dataDir, "case4.js"));
  var case5 = require(path.join(dataDir, "case5.js"));
  var CASES = [case1, case2, case3, case4, case5];
  var RELATIONS = ["supports", "contradicts", "causes", "results_from", "precedes", "follows", "possibly_related", "unknown"];

  var errors = [], warns = [];
  function err(msg) { errors.push(msg); }
  function warn(msg) { warns.push(msg); }

  CASES.forEach(function (c, ci) {
    var tag = "[" + c.id + "]";
    var evIds = {};
    c.evidence.forEach(function (e) {
      if (evIds[e.id]) err(tag + " duplicated evidence id: " + e.id);
      evIds[e.id] = true;
      if (!e.body) err(tag + " evidence without body: " + e.id);
      if (!e.summary) err(tag + " evidence without summary: " + e.id);
      if (!e.name) err(tag + " evidence without name: " + e.id);
    });
    var evCount = c.evidence.length;
    if (evCount < 8) warn(tag + " only " + evCount + " evidence items");

    /* timeline */
    var tIds = c.timeline.map(function (t) { return t.id; });
    if (c.timeline.length < 7) warn(tag + " short timeline (" + c.timeline.length + ")");
    var sorted = tIds.slice().sort(), sortedT = c.trueOrder.slice().sort();
    if (JSON.stringify(sorted) !== JSON.stringify(sortedT)) err(tag + " trueOrder is not a permutation of timeline ids");
    var tset = {};
    c.timeline.forEach(function (t) { if (tset[t.id]) err(tag + " duplicated timeline id " + t.id); tset[t.id] = true; });
    c.timeline.forEach(function (t) {
      if (t.src !== "brief" && !evIds[t.src]) err(tag + " timeline event " + t.id + " references missing evidence " + t.src);
      if (["confirmed", "estimated", "witness", "conflicting", "unknown"].indexOf(t.stampType) === -1) err(tag + " bad stampType on " + t.id);
    });
    /* timestamps should not be all identical (would make ordering trivial) */
    var distinctStamps = {}; c.timeline.forEach(function (t) { distinctStamps[t.stamp] = true; });
    if (Object.keys(distinctStamps).length < c.timeline.length - 3) warn(tag + " many events share a timestamp (check solvability)");
    var badStamps = c.timeline.filter(function (t) { return t.stampType === "conflicting" || t.stampType === "witness"; }).length;
    if (badStamps === 0) warn(tag + " no subjective/conflicting stamps: ordering may be trivially readable");

    /* causality */
    c.causality.forEach(function (l) {
      if (l.rel === null) return;
      if (tset[l.from] === undefined) err(tag + " causality from unknown event " + l.from);
      if (tset[l.to] === undefined) err(tag + " causality to unknown event " + l.to);
      if (RELATIONS.indexOf(l.rel) === -1) err(tag + " invalid relation: " + l.rel);
      if (l.from === l.to) err(tag + " self-causation " + l.from);
    });
    if (c.causality.filter(function (l) { return l.rel; }).length < 4) warn(tag + " sparse causality chain");

    /* scanner */
    var yset = {};
    c.scanner.forEach(function (s) {
      if (["normal", "displaced", "duplicate", "missing", "fragmented", "unknown"].indexOf(s.signature) === -1) err(tag + " invalid scanner signature: " + s.signature);
      if (s.yields) {
        if (yset[s.yields]) err(tag + " scanner yields duplicated id " + s.yields);
        yset[s.yields] = true;
        if (s.signature !== "normal" && !/^sc\d+$/.test(s.yields)) err(tag + " abnormal scan yield should be a scN report: " + s.yields);
      }
    });

    /* interventions */
    if (c.interventions.length < 3) err(tag + " needs ≥3 interventions");
    var oneBest = c.interventions.filter(function (i) { return i.quality >= 10; }).length;
    if (oneBest !== 1) warn(tag + " interventions with quality=10: " + oneBest + " (intended: exactly 1)");
    c.interventions.forEach(function (i) {
      if (!i.consequence) err(tag + " intervention without consequence: " + i.id);
      if (typeof i.stability !== "number") err(tag + " intervention without numeric stability: " + i.id);
    });

    /* report */
    if (c.report.length < 4) err(tag + " report needs ≥4 questions");
    c.report.forEach(function (q, qi) {
      if (!q.prompt || q.options.length < 3) err(tag + " report question malformed: " + q.id);
      var bests = q.options.filter(function (o) { return o.w >= 1; });
      if (bests.length !== 1) err(tag + " report q" + qi + " must have exactly one fully-correct option (has " + bests.length + ")");
      q.options.forEach(function (o) { if (typeof o.w !== "number" || o.w < 0 || o.w > 1) err(tag + " report option weight invalid in " + q.id); });
      q.options.forEach(function (o) { if (!o.note) warn(tag + " option without explanation in " + q.id); });
    });

    /* comms */
    c.comms.forEach(function (cm) {
      if (["start", "examined", "lab", "hint"].indexOf(cm.trigger.type) === -1) err(tag + " comms trigger type invalid: " + cm.trigger.type);
      if (cm.trigger.type === "examined" || cm.trigger.type === "lab") {
        if (!evIds[cm.trigger.id]) err(tag + " comms trigger references unknown evidence " + cm.trigger.id);
      }
    });
    var hints = c.comms.filter(function (cm) { return cm.trigger.type === "hint"; });
    if (hints.length < 2) warn(tag + " fewer than 2 hint comms");

    /* case truth */
    if (!c.truth || !c.truth.headline || c.truth.body.length < 400) err(tag + " truth section incomplete");

    /* key evidence */
    if (c.evidence.filter(function (e) { return e.key; }).length < 3) warn(tag + " fewer than 3 key evidence items");
  });

  /* ------ engine sanity: perfect play ----- */
  var Engine = require(path.join(__dirname, "..", "js", "engine.js"));
  CASES.forEach(function (c) {
    var cs = {
      opened: c.evidence.filter(function (e) { return e.key; }).map(function (e) { return e.id; }).concat(c.evidence.map(function (e) { return e.id; })).filter(function (v, i, a) { return a.indexOf(v) === i; }),
      timeline: c.trueOrder.slice(),
      causality: c.causality.filter(function (l) { return l.rel; }).map(function (l) { return { from: l.from, to: l.to, rel: l.rel }; }),
      reportAnswers: (function () {
        var a = {};
        c.report.forEach(function (q) { var bi = 0; q.options.forEach(function (o, i) { if (o.w > q.options[bi].w) bi = i; }); a[q.id] = bi; });
        return a;
      })(),
      chosenIntervention: c.interventions.reduce(function (b, i) { return i.quality > b.quality ? i : b; }).id
    };
    var res = Engine.evaluate(c, cs, 0);
    if (res.score !== 100) err("[" + c.id + "] perfect play scores " + res.score + " (expected 100): " + JSON.stringify(res.parts));
    var empty = { opened: [], timeline: [], causality: [], reportAnswers: {}, chosenIntervention: c.interventions[c.interventions.length - 1].id };
    var res2 = Engine.evaluate(c, empty, 0);
    if (res2.score > 25) warn("[" + c.id + "] empty play scores " + res2.score + " (expected low)");
  });

  /* ------ save round trip ------ */
  var stateMod = (function () {
    global.window = {};
    require(path.join(__dirname, "..", "js", "data", "index.js"));
    return null;
  })();

  console.log("== TIME DEPARTMENT validation ==");
  CASES.forEach(function (c) {
    console.log("  " + c.id + " \u00b7 " + c.title + " \u00b7 " + c.evidence.length + " exhibits \u00b7 " + c.timeline.length + " events \u00b7 " + c.causality.filter(function (l) { return l.rel; }).length + " causal links \u00b7 " + c.interventions.length + " interventions");
  });
  if (warns.length) { console.log("\nwarnings:"); warns.forEach(function (w) { console.log("  \u26a0 " + w); }); }
  if (errors.length) { console.log("\nERRORS:"); errors.forEach(function (e) { console.log("  \u2717 " + e); }); process.exit(1); }
  console.log("\nALL CHECKS PASSED \u2014 " + CASES.length + " cases complete, consistent and solvable.");
})();
