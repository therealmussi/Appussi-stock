/* TIME DEPARTMENT — investigation engines: timeline, causality, scoring */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});

  /* ---------- TIMELINE ----------
     Pairwise order accuracy between the player's arrangement and canonical order.
     Returns {accuracy:0..1, correctPairs, totalPairs, mistakes:[...]} */
  function scoreTimeline(CASE, playerOrder) {
    var trueOrder = CASE.trueOrder;
    var n = playerOrder.length;
    if (!n) return { accuracy: 0, correctPairs: 0, totalPairs: 1, mistakes: [] };
    var pos = {}; trueOrder.forEach(function (id, i) { pos[id] = i; });
    var total = 0, ok = 0;
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var a = playerOrder[i], b = playerOrder[j];
        if (pos[a] == null || pos[b] == null) continue;
        total++;
        if (pos[a] < pos[b]) ok++;
      }
    }
    var mistakes = [];
    for (var k = 1; k < n; k++) {
      var prev = playerOrder[k - 1], cur = playerOrder[k];
      if (pos[prev] != null && pos[cur] != null && pos[prev] > pos[cur]) {
        mistakes.push({ a: prev, b: cur });
      }
    }
    return { accuracy: total ? ok / total : 0, correctPairs: ok, totalPairs: total, mistakes: mistakes };
  }

  /* ---------- CAUSALITY ----------
     Player links: {from,to,rel}. Canonical: CASE.causality (rel non-null).
     Full credit for exact pair+relation; half for right pair wrong relation. */
  function scoreCausality(CASE, links) {
    var canon = CASE.causality.filter(function (l) { return l.rel; });
    var canonKey = canon.map(function (l) { return l.from + ">" + l.to; });
    var gotFull = 0, gotHalf = 0;
    links.forEach(function (l) {
      var k = l.from + ">" + l.to;
      var idx = canonKey.indexOf(k);
      if (idx === -1) { gotHalf -= 0.15; }         /* spurious links cost */
      else if (canon[idx].rel === l.rel) { gotFull++; }
      else { gotHalf += 0.5; }
    });
    gotHalf = Math.max(0, gotHalf);
    var accuracy = (gotFull + gotHalf) / canon.length;
    return { accuracy: Math.max(0, Math.min(1, accuracy)), full: gotFull, half: gotHalf, of: canon.length };
  }

  /* ---------- REPORT ----------
     Answers: {qid: optionIndex}. Returns per-question verdicts + weighted total. */
  function scoreReport(CASE, answers) {
    var verdicts = [];
    var total = 0;
    CASE.report.forEach(function (q) {
      var ai = answers ? answers[q.id] : null;
      if (ai == null || !q.options[ai]) {
        verdicts.push({ qid: q.id, prompt: q.prompt, w: 0, chosen: null, best: bestOf(q) });
        return;
      }
      var w = q.options[ai].w;
      total += w * 8; /* 5 questions x 8 pts */
      verdicts.push({ qid: q.id, prompt: q.prompt, w: w, chosen: ai, chosenNote: q.options[ai].note, best: bestOf(q) });
    });
    return { verdicts: verdicts, points: total, maxPoints: 40 };
  }
  function bestOf(q) {
    var best = q.options[0], bi = 0;
    q.options.forEach(function (o, i) { if (o.w > best.w) { best = o; bi = i; } });
    return { index: bi, text: best.text, note: best.note };
  }

  /* ---------- FULL CASE EVALUATION ---------- */
  function evaluate(CASE, cs, hintsUsed) {
    var tl = scoreTimeline(CASE, cs.timeline || []);
    var ca = scoreCausality(CASE, cs.causality || []);
    var rep = scoreReport(CASE, cs.reportAnswers || {});

    var keyIds = CASE.evidence.filter(function (e) { return e.key; }).map(function (e) { return e.id; });
    var seenKey = keyIds.filter(function (id) { return cs.opened.indexOf(id) !== -1; }).length;
    var evidenceAcc = keyIds.length ? seenKey / keyIds.length : 0;

    var iv = null, ivQuality = 0, ivStability = 0;
    if (cs.chosenIntervention) {
      iv = CASE.interventions.filter(function (i) { return i.id === cs.chosenIntervention; })[0] || null;
      if (iv) { ivQuality = iv.quality; ivStability = iv.stability; }
    }

    var score = rep.points
      + tl.accuracy * 20
      + ca.accuracy * 20
      + evidenceAcc * 10
      + ivQuality;
    score = Math.round(score - (hintsUsed || 0) * 4);
    score = Math.max(0, Math.min(100, score));

    var grade = score >= 92 ? "S" : score >= 80 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D";

    return {
      score: score, grade: grade,
      parts: {
        report: { pct: rep.maxPoints ? Math.round(rep.points / rep.maxPoints * 100) : 0, pts: rep.points, max: rep.maxPoints },
        timeline: { pct: Math.round(tl.accuracy * 100) },
        causality: { pct: Math.round(ca.accuracy * 100), full: ca.full, half: ca.half, of: ca.of },
        evidence: { pct: Math.round(evidenceAcc * 100), seen: seenKey, of: keyIds.length },
        intervention: { pct: ivQuality * 10, chosen: iv }
      },
      reportVerdicts: rep.verdicts,
      timelineMistakes: tl.mistakes,
      stabilityApplied: ivStability,
      hintsUsed: hintsUsed || 0
    };
  }

  TD.ENGINE = {
    scoreTimeline: scoreTimeline, scoreCausality: scoreCausality, scoreReport: scoreReport, evaluate: evaluate
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = TD.ENGINE; }
})(typeof window !== "undefined" ? window : globalThis);
