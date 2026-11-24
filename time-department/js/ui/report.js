/* TIME DEPARTMENT — final report + results screens */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };

  /* ================= FINAL REPORT ================= */
  function renderReport(body, caseData, cs, rerender, caseRef) {
    TD.UI.clear(body);
    var p = h("div", { class: "panel" }, [h("h3", null, ["OFFICIAL INVESTIGATION REPORT \u2014 " + caseData.id])]);
    p.appendChild(h("div", { class: "small", style: "margin-bottom:14px" }, ["The report is graded across six measures: anomaly identification, chronological accuracy, causal reconstruction, evidence utilization, intervention choice, and the stability of what you leave behind. Filing closes the case. Every grading decision is explained afterwards \u2014 wrong answers are a resource, not a punishment."]));
    body.appendChild(p);

    var qWrap = h("div", { class: "panel" }, [h("h3", null, ["RECONSTRUCTION"])]);
    cs.reportAnswers = cs.reportAnswers || {};
    caseData.report.forEach(function (q, qi) {
      var box = h("div", { class: "report-q" });
      box.appendChild(h("div", { class: "q-prompt" }, ["0" + (qi + 1) + " \u00b7 " + q.prompt]));
      q.options.forEach(function (o, oi) {
        box.appendChild(h("div", {
          class: "opt-row" + (cs.reportAnswers[q.id] === oi ? " sel" : ""),
          onclick: function () {
            cs.reportAnswers[q.id] = oi; TD.STATE.save(); TD.AUDIO.click();
            TD.PANELS.report(body, caseData, cs, rerender, caseRef);
          }
        }, [o.text]));
      });
      qWrap.appendChild(box);
    });
    qWrap.appendChild(h("label", { class: "fld" }, ["INVESTIGATOR'S FREE NOTE (saved, not graded)"]));
    qWrap.appendChild(h("textarea", { placeholder: "anything the form does not ask\u2026", onchange: function (e) { cs.reportNotes = e.target.value; TD.STATE.save(); } }, []));
    var ta = qWrap.querySelector("textarea");
    ta.value = cs.reportNotes || "";
    body.appendChild(qWrap);

    var iw = h("div", { class: "panel" }, [h("h3", null, ["PROPOSED INTERVENTION"])]);
    iw.appendChild(h("div", { class: "small", style: "margin-bottom:12px" }, ["You may file your report without opening every exhibit \u2014 the Division prefers a committed reconstruction to a decorated desk \u2014 but the intervention decides what your work actually leaves behind."]));
    cs.chosenIntervention = cs.chosenIntervention || null;
    caseData.interventions.forEach(function (iv) {
      iw.appendChild(h("div", {
        class: "opt-row int-opt" + (cs.chosenIntervention === iv.id ? " sel" : ""),
        onclick: function () {
          cs.chosenIntervention = iv.id; TD.STATE.save(); TD.AUDIO.click();
          TD.PANELS.report(body, caseData, cs, rerender, caseRef);
        }
      }, [
        h("div", { class: "upper", style: "font-size:12.5px", html: iv.label }),
        h("div", { class: "small", style: "margin-top:4px" }, [iv.desc]),
        h("div", { class: "int-stability", style: "margin-top:4px" }, ["PROJECTED STABILITY: " + (iv.stability >= 0 ? "+\u2009" : "\u2212\u2009\u2009") + Math.abs(iv.stability).toFixed(1)])
      ]));
    });
    body.appendChild(iw);

    var btns = h("div", { class: "btn-row" }, [
      h("button", { class: "btn teal", style: "font-size:14px;padding:12px 26px", onclick: function () { submit(caseData, cs); } }, ["\u25b6 FILE OFFICIAL REPORT"]),
      h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "overview"); } }, ["BACK TO OVERVIEW"])
    ]);
    body.appendChild(btns);
  }

  function submit(caseData, cs) {
    var missing = 0;
    caseData.report.forEach(function (q) { if (cs.reportAnswers[q.id] == null) missing++; });
    if (!cs.chosenIntervention) { TD.UI.toast("Select a proposed intervention before filing.", "amber"); TD.AUDIO.alert(); return; }
    if (missing > 0) {
      var ok = root.confirm(missing + " question(s) unanswered. Unanswered questions score zero but can still be reviewed in the results. File anyway?");
      if (!ok) return;
    }
    var hints = TD.STATE.get().hintsUsed[caseData.id] || 0;
    var res = TD.ENGINE.evaluate(caseData, cs, hints);
    cs.submitted = {
      score: res.score, grade: res.grade, parts: res.parts, reportVerdicts: res.reportVerdicts,
      stabilityApplied: res.stabilityApplied, hintsUsed: res.hintsUsed,
      chosenIntervention: cs.chosenIntervention,
      notes: cs.reportNotes || "",
      timelineOrder: cs.timeline ? cs.timeline.slice() : [],
      causalityLinks: cs.causality.map(function (l) { return { from: l.from, to: l.to, rel: l.rel }; }),
      date: Date.now()
    };
    if (TD.STATE.get().completed.indexOf(caseData.id) === -1) TD.STATE.get().completed.push(caseData.id);
    var before = TD.STATE.get().globalStability;
    TD.STATE.get().globalStability = Math.max(0, Math.min(100, before + res.stabilityApplied));
    TD.STATE.get().deptDay = (TD.STATE.get().deptDay || 0) + 1;
    TD.STATE.save();
    TD.AUDIO.chime();
    TD.SCREENS.go("results", caseData);
  }

  /* ================= RESULTS ================= */
  function renderResults(caseData) {
    var app = document.getElementById("td-screen") || document.getElementById("app");
    TD.UI.clear(app);
    var cs = TD.STATE.cs(caseData.id);
    var sub = cs.submitted;
    var state = TD.STATE.get();
    var scr = h("div", { class: "screen" }, [h("div", { class: "results-wrap" })]);
    app.appendChild(scr);
    var wrap = scr.firstChild;

    wrap.appendChild(h("div", { class: "mono tiny dim upper", style: "margin-bottom:6px" }, [caseData.id + " \u00b7 REPORT PROCESSED \u00b7 DIVISION OF TEMPORAL STABILITY"]));
    wrap.appendChild(h("h2", { style: "font-family:var(--head);letter-spacing:0.16em;color:var(--ink-bright);text-transform:uppercase;margin:0 0 18px" }, ["CASE CLOSED: " + caseData.title]));

    var gclass = sub.grade === "S" ? " s" : sub.grade === "D" ? " d" : "";
    var grade = h("div", { class: "grade-box" }, [
      h("div", { class: "grade-letter" + gclass }, [sub.grade]),
      h("div", { class: "score-bars", style: "flex:1;min-width:260px" }, function () {
        var bars = [];
        [["Anomaly identification", sub.parts.report.pct], ["Chronological accuracy", sub.parts.timeline.pct], ["Causal reconstruction", sub.parts.causality.pct], ["Evidence utilization", sub.parts.evidence.pct], ["Intervention choice", sub.parts.intervention.pct], ["Final score", sub.score]].forEach(function (b) {
          bars.push(h("div", { class: "sb" }, [
            h("label", null, [b[0], h("span", null, [b[1] + "%"])]),
            h("div", { class: "bar" }, [h("div", { style: "width:" + b[1] + "%" })])
          ]));
        });
        return bars;
      }())
    ]);
    wrap.appendChild(grade);

    if (sub.hintsUsed) wrap.appendChild(h("div", { class: "small", style: "margin-bottom:12px" }, ["Official consultations used: " + sub.hintsUsed + " (\u2212" + (sub.hintsUsed * 4) + " points). The Department pretends not to mind."]));

    var vd = h("div", { class: "panel" }, [h("h3", null, ["REPORT ASSESSMENT \u2014 QUESTION BY QUESTION"])]);
    sub.reportVerdicts.forEach(function (v, i) {
      var cls = v.w === 1 ? " good" : v.w >= 0.4 ? " part" : " bad";
      var box = h("div", { class: "q-verdict" + cls });
      box.appendChild(h("div", { class: "mono tiny upper", style: "margin-bottom:4px" }, ["Q" + (i + 1) + " \u00b7 " + (v.w === 1 ? "CORRECT" : v.w >= 0.4 ? "PARTIALLY SUPPORTED" : "NOT SUPPORTED") + " (" + Math.round(v.w * 100) + "%)"]));
      box.appendChild(h("div", { style: "margin-bottom:4px" }, [v.prompt]));
      if (v.chosenNote && v.w < 1) box.appendChild(h("div", { class: "small" }, [v.chosenNote]));
      box.appendChild(h("div", { class: "small teal" }, ["Best available reading: " + v.best.text]));
      vd.appendChild(box);
    });
    wrap.appendChild(vd);

    var tr = h("div", { class: "panel" }, [h("h3", null, ["STABILITY OUTCOME"])]);
    var chosen = caseData.interventions.filter(function (iv) { return iv.id === sub.chosenIntervention; })[0];
    tr.appendChild(h("div", { class: "mono", style: "font-size:12px" }, ["INTERVENTION FILED: " + chosen.label.toUpperCase() + " (" + TD.STABILITY_DELTA_TEXT(sub.stabilityApplied) + ")"]));
    tr.appendChild(h("div", { style: "margin-top:8px" }, [chosen.consequence]));
    tr.appendChild(h("div", { class: "stability-delta" }, ["DIVISION INDEX: 84.0 \u2192 " + state.globalStability.toFixed(1)]));
    var nr = TD.STATE.nextRank();
    if (nr && state.completed.length >= nr.need && (nr.minAvg ? TD.STATE.avgScore() >= nr.minAvg : true)) {
      tr.appendChild(h("div", { class: "rankup-note" }, ["\u25b2 PROMOTION: " + TD.STATE.rank().name + " \u2192 " + nr.name + ". The Director's office has noted it awake."]));
    }
    wrap.appendChild(tr);

    var tb = h("div", { class: "truth-block" }, [
      h("h4", null, ["CASE TRUTH \u2014 WHAT ACTUALLY HAPPENED"]),
      h("div", { class: "small", style: "font-size:13px" }, [caseData.truth.headline]),
      h("div", { class: "ev-body", style: "margin-top:10px" }, [caseData.truth.body])
    ]);
    wrap.appendChild(tb);

    if (caseData.number < TD.CASES.length) {
      wrap.appendChild(h("div", { class: "btn-row" }, [
        h("button", { class: "btn teal", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("case", TD.CASES[caseData.number]); } }, ["PROCEED TO " + TD.CASES[caseData.number].id]),
        h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("hq"); } }, ["RETURN TO HEADQUARTERS"]),
        h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("archive"); } }, ["CASE ARCHIVE"]),
        h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.replay(caseData); } }, ["REOPEN INVESTIGATION"])
      ]));
    } else {
      wrap.appendChild(h("div", { class: "rankup-note", style: "margin-top:20px" }, [
        "ALL FIVE CASES CLOSED. The Division's work is, of course, never closed: the Office of Continuity still files, the vault still ticks 6% fast, and a second program predating JANUS now has a name on a redaction that is scheduled to expire. CAMPAIGN COMPLETE \u2014 rank: " + TD.STATE.rank().name + ". Reopen any case from the archive; the anomalies keep, the spreads don't."
      ]));
      wrap.appendChild(h("div", { class: "btn-row" }, [
        h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("hq"); } }, ["RETURN TO HEADQUARTERS"]),
        h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("archive"); } }, ["CASE ARCHIVE"]),
        h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.replay(caseData); } }, ["REOPEN INVESTIGATION"]),
        h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("menu"); } }, ["MAIN MENU"])
      ]));
    }
  }

  TD.PANELS = TD.PANELS || {};
  TD.PANELS.report = renderReport;
  TD.SCREENS = TD.SCREENS || {};
  TD.SCREENS.results = function (caseData) { renderResults(caseData); };
})(typeof window !== "undefined" ? window : globalThis);
