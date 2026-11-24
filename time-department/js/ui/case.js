/* TIME DEPARTMENT — investigation workspace: overview, evidence, comms */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };
  var closeModal = TD.UI.closeModal;
  var current = null; /* current case data */
  var currentTab = "overview";

  function render(caseData, tab) {
    current = caseData;
    if (tab) currentTab = tab;
    var cs = TD.STATE.cs(caseData.id);
    cs.lastTab = currentTab;
    TD.STATE.save();

    var app = document.getElementById("td-screen") || document.getElementById("app");
    TD.UI.clear(app);
    var scr = h("div", { class: "screen" }, [h("div", { class: "wrap-wide" })]);
    app.appendChild(scr);
    var wrap = scr.firstChild;

    wrap.appendChild(h("div", { class: "case-head" }, [
      h("span", { class: "mono amber", style: "font-size:17px" }, [caseData.id]),
      h("h2", null, [caseData.title]),
      h("div", { class: "case-meta" }, [caseData.location.toUpperCase()])
    ]));
    var meta = h("div", { class: "case-meta", style: "margin-bottom:4px" }, [
      "DATE OF ANOMALY: " + caseData.dateOfAnomaly.toUpperCase() + "   \u2502   CLASS " + caseData.severity + "   \u2502   DIFFICULTY " + "\u25c8".repeat(caseData.difficulty) + "\u25c7".repeat(5 - caseData.difficulty)
    ]);
    wrap.appendChild(meta);

    if (TD.STATE.isComplete(caseData.id) && cs.submitted) {
      wrap.appendChild(h("div", { class: "btn-row", style: "margin-top:0" }, [
        h("button", { class: "btn small teal", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("results", caseData); } }, ["VIEW CLOSED REPORT \u00b7 " + cs.submitted.score + "/100"]),
        h("button", { class: "btn small ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("hq"); } }, ["\u2190 CASE FILES"])
      ]));
    }

    var done = TD.STATE.isComplete(caseData.id) && cs.submitted;
    var tabs = h("div", { class: "tabs" });
    var tabDefs = [
      ["overview", "OVERVIEW"], ["evidence", "EVIDENCE"], ["scanner", "SCANNER"],
      ["timeline", "TIMELINE"], ["causality", "CAUSALITY"], ["board", "BOARD"], ["comms", "COMMS"]
    ];
    tabDefs.forEach(function (t) {
      var unread = t[0] === "comms" && hasUnread(caseData, cs);
      var b = h("button", { title: "Shortcut: " + (tabDefs.indexOf(t) + 1), class: t[0] === currentTab ? "on" : "", onclick: function () { TD.AUDIO.click(); currentTab = t[0]; render(current); } }, [t[1]]);
      if (unread) b.appendChild(h("span", { class: "dot" }));
      tabs.appendChild(b);
    });
    tabs.appendChild(h("span", { class: "tab-gap" }));
    var rb = h("button", { title: "Shortcut: 0", class: "tab-report" + (currentTab === "report" ? " on" : ""), onclick: function () { TD.AUDIO.click(); currentTab = "report"; render(current); } }, ["\u25b6 FINAL REPORT"]);
    tabs.appendChild(rb);
    wrap.appendChild(tabs);

    var bodyEl = h("div", { class: "tab-body" });
    wrap.appendChild(bodyEl);

    checkTriggers(caseData, cs, { type: "start" });
    ({ overview: renderOverview, evidence: renderEvidence, scanner: renderScannerTag, timeline: renderTool, causality: renderTool, board: renderTool, comms: renderComms, report: renderReport })[currentTab](bodyEl, caseData, cs);
  }

  /* comms unread detection: last comm for this case newer than lastSeen */
  function hasUnread(caseData, cs) {
    var mine = TD.STATE.get().comms.filter(function (c) { return c.case === caseData.id; });
    if (!mine.length) return false;
    var last = mine[mine.length - 1];
    if (!cs.commsSeen) return true;
    return last.time > cs.commsSeen;
  }

  /* ---------------- OVERVIEW ---------------- */
  function renderOverview(body, caseData, cs) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["CASE BRIEFING"])]);
    p.appendChild(h("div", { class: "ev-body" }, [caseData.brief]));
    body.appendChild(p);

    var ob = h("div", { class: "panel" }, [h("h3", null, ["OBJECTIVES"])]);
    caseData.objectives.forEach(function (o, i) {
      var done = TD.STATE.isComplete(caseData.id);
      ob.appendChild(h("div", { style: "display:flex;gap:10px;margin-bottom:6px" }, [
        h("span", { class: "mono " + (done ? "green" : "teal"), style: "font-size:12px" }, [(done ? "\u2611" : "\u2610") + " 0" + (i + 1)]),
        h("span", { style: "font-size:13.5px" }, [o])
      ]));
    });
    ob.appendChild(h("div", { class: "small", style: "margin-top:10px" }, ["The FINAL REPORT becomes available at any time \u2014 but it is graded, it closes the case, and it grades what you actually reconstructed. Take the time you need. The record is patient."]));
    body.appendChild(ob);

    var pr = h("div", { class: "panel" }, [h("h3", null, ["YOUR PROGRESS ON THIS CASE"])]);
    var t = TD.ENGINE.scoreTimeline(caseData, cs.timeline || CaseOrderFilled(caseData));
    var keyIds = caseData.evidence.filter(function (e) { return e.key; }).map(function (e) { return e.id; });
    var scansDone = cs.scans.length;
    var scansAll = caseData.scanner.length;
    var grid = h("div", { class: "grid-3" }, [
      h("div", { class: "kv" }, [h("b", null, [cs.opened.length + " / " + (caseData.evidence.length + cs.scanReports.length)]), "EVIDENCE EXAMINED"]),
      h("div", { class: "kv" }, [h("b", null, [(cs.timeline ? cs.timeline.length : 0) + " / " + caseData.timeline.length]), "EVENTS SEQUENCED"]),
      h("div", { class: "kv" }, [h("b", null, [cs.causality.length + " LINKS"]), "CAUSAL CONNECTIONS"]),
      h("div", { class: "kv" }, [h("b", null, [scansDone + " / " + scansAll]), "SCANNER TARGETS READ"]),
      h("div", { class: "kv" }, [h("b", null, [cs.labs.length + " ANALYSES"]), "LABORATORY"]),
      h("div", { class: "kv" }, [h("b", null, [(cs.board.cards.length) + " CARDS \u00b7 " + (cs.board.links.length) + " LINKS"]), "INVESTIGATION BOARD"])
    ]);
    pr.appendChild(grid);
    pr.appendChild(h("div", { class: "small", style: "margin-top:10px" }, ["The report also measures the ORDER you propose and the CAUSES you identified. Nothing here is graded by trick questions: every correct answer is written on the evidence."]));
    body.appendChild(pr);

    body.appendChild(h("div", { class: "btn-row" }, [
      h("button", { class: "btn teal", onclick: function () { TD.AUDIO.click(); currentTab = "evidence"; render(current); } }, ["OPEN EVIDENCE"]),
      h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("hq"); } }, ["RETURN TO HEADQUARTERS"])
    ]));
  }
  function CaseOrderFilled(caseData) { return caseData.timeline.map(function (e) { return e.id; }); }

  /* ---------------- EVIDENCE ---------------- */
  function renderEvidence(body, caseData, cs) {
    var allE = allEvidence(caseData, cs);
    var bar = h("div", { class: "ev-toolbar" }, [
      h("input", { type: "search", placeholder: "search exhibits\u2026", style: "max-width:260px", oninput: function (e) { filterList(e.target.value); } })
    ]);
    body.appendChild(bar);
    var list = h("div", { class: "ev-list" });
    body.appendChild(list);

    function filterList(q) {
      q = (q || "").toLowerCase();
      TD.UI.clear(list);
      allE.forEach(function (e) {
        var isNew = cs.opened.indexOf(e.id) === -1;
        if (q && (e.name + " " + e.summary).toLowerCase().indexOf(q) === -1) return;
        var mark = cs.marks[e.id];
        var it = h("div", {
          class: "ev-item" + (isNew ? " new" : ""),
          onclick: function () { TD.AUDIO.openDoc(); openEvidence(caseData, e, cs); }
        }, [
          h("span", { class: "ev-icon" }, [e.icon]),
          h("div", { class: "ev-name" }, [e.name]),
          h("div", { class: "ev-sum" }, [e.summary]),
          h("div", { class: "ev-tags" }, [
            cs.labs.indexOf(e.id) !== -1 ? "LAB \u2713 \u00b7 " : "",
            mark ? "MARKED: " + mark.toUpperCase() : "UNVERIFIED"
          ])
        ]);
        if (mark === "fact") it.style.borderLeft = "3px solid var(--teal)";
        else if (mark === "contradiction") it.style.borderLeft = "3px solid var(--red)";
        else if (mark === "suspicion") it.style.borderLeft = "3px solid var(--amber)";
        list.appendChild(it);
      });
    }
    filterList("");
  }

  function allEvidence(caseData, cs) {
    var list = caseData.evidence.slice();
    (cs.scanReports || []).forEach(function (id) {
      var t = caseData.scanner[parseInt(id.replace("sc", ""), 10) - 1];
      if (!t) return;
      list.push({
        id: id, name: "Scan report: " + t.target, type: "measurement", icon: "◈",
        summary: "Temporal signature: " + t.signature.toUpperCase(),
        body: "SCANNER TARGET: " + t.target + "\nSIGNATURE CLASS: " + t.signature.toUpperCase() + "\n\n" + t.note,
        details: [], generated: true
      });
    });
    return list;
  }

  function openEvidence(caseData, e, cs) {
    var firstOpen = cs.opened.indexOf(e.id) === -1;
    if (firstOpen) {
      cs.opened.push(e.id);
      if (e.janus) { TD.STATE.addJanus(1); TD.AUDIO.anomaly(); TD.UI.toast("JANUS pattern match incremented \u2014 J-" + TD.STATE.get().janus, "amber"); }
      TD.STATE.save();
    }
    var content = h("div", null, [
      h("div", { class: "ev-detail-head" }, [
        h("span", { style: "font-size:22px" }, [e.icon]),
        h("h4", null, [e.name])
      ]),
      h("div", { class: "ev-type-tag", style: "margin:6px 0" }, [e.type.toUpperCase() + (e.generated ? " \u00b7 LIVE SCAN" : "") + (e.janus ? "  \u2502  J\u2009PATTERN DETECTED" : "")]),
      h("div", { class: "ev-body" }, [e.body]),
      e.details && e.details.length ? h("div", { class: "ev-details" }, [h("div", { class: "mono tiny dim upper", style: "margin-bottom:6px" }, ["CLOSER READING \u2014 details on inspection"])].concat(e.details.map(function (d) { return h("li", { style: "margin-left:18px" }, [d]); }))) : null,
      e.lab && cs.labs.indexOf(e.id) === -1 ? h("div", { class: "btn-row" }, [h("button", { class: "btn small teal", onclick: function () { runLab(caseData, e); } }, ["\u25b6 " + e.lab.label])]) : null,
      e.lab && cs.labs.indexOf(e.id) !== -1 ? h("div", { class: "ev-lab-result" }, (function () {
        var a = [h("div", { class: "mono tiny teal upper", style: "margin-bottom:6px" }, ["LABORATORY RESULT \u2014 " + e.lab.label])];
        e.lab.result.forEach(function (r) { a.push(h("div", null, [r])); });
        return a;
      })()) : null,
      h("div", { class: "mark-status-row" }, TD.MARKS.map(function (m) {
        return h("button", { class: "btn small" + (cs.marks[e.id] === m ? " on" : ""), onclick: function () { cs.marks[e.id] = m; TD.STATE.save(); TD.AUDIO.click(); openEvidence(caseData, e, cs); } }, [m.toUpperCase()]);
      })),
      h("label", { class: "fld" }, ["personnel notes \u2014 " + e.id.toUpperCase()]),
      h("textarea", {
        placeholder: "your working notes\u2026 (saved automatically)",
        onchange: function (ev) { cs.notes[e.id] = ev.target.value; TD.STATE.save(); }
      }, [cs.notes[e.id] || ""]),
      h("div", { class: "btn-row" }, [
        h("button", { class: "btn small", onclick: function () {
          if (cs.board.cards.filter(function (cd) { return cd.id === e.id; }).length) { TD.UI.toast("Already pinned to the board."); return; }
          cs.board.cards.push({ id: e.id, kind: "evidence", x: 60 + (cs.board.cards.length % 4) * 210, y: 40 + Math.floor(cs.board.cards.length / 4) * 110 });
          TD.STATE.save(); TD.AUDIO.click(); TD.UI.toast("Pinned to investigation board.");
        } }, ["PIN TO BOARD"]),
        h("button", { class: "btn small ghost", onclick: function () { closeModal(); render(current, currentTab); } }, ["CLOSE EXHIBIT"])
      ])
    ]);
    TD.UI.openModal(content, { title: "EXHIBIT " + e.id.toUpperCase() + " \u00b7 " + caseData.id });
    /* fire comms triggers */
    checkTriggers(caseData, cs, { type: "examined", id: e.id });
    var ta = content.querySelector("textarea");
    if (ta) { ta.value = cs.notes[e.id] || ""; }
  }

  function runLab(c, e) {
    var cs = TD.STATE.cs(c.id);
    if (cs.labs.indexOf(e.id) === -1) cs.labs.push(e.id);
    TD.STATE.save();
    TD.AUDIO.chime();
    closeModal();
    openEvidence(c, e, cs);
    checkTriggers(c, cs, { type: "lab", id: e.id });
  }

  /* ---------------- COMMS ---------------- */
  function renderComms(body, caseData, cs) {
    TD.STATE.get().comms.filter(function (c) { return c.case === caseData.id; });
    var cs2 = TD.STATE.cs(caseData.id);
    cs2.commsSeen = Date.now();
    TD.STATE.save();
    var p = h("div", { class: "panel" }, [h("h3", null, ["INTERNAL COMMUNICATIONS \u2014 DESK LINE"])]);
    var mine = TD.STATE.get().comms.filter(function (c) { return c.case === caseData.id; });
    if (!mine.length) {
      p.appendChild(h("div", { class: "small" }, ["No traffic yet on this investigation. The Department will write when it has something it is willing to be seen writing."]));
    }
    mine.forEach(function (c) {
      var per = TD.PERSONNEL.filter(function (pp) { return pp.id === c.from; })[0] || { name: c.from, icon: "\u25cb" };
      p.appendChild(h("div", { class: "comm-msg" + (c.kind || "") }, [
        h("div", { class: "cfrom" }, [per.icon + "  " + per.name]),
        h("div", { class: "small", style: "margin-top:4px;white-space:pre-wrap" }, [c.text])
      ]));
    });
    p.appendChild(hr());
    var hintsLeft = 2 - (TD.STATE.get().hintsUsed[caseData.id] || 0);
    p.appendChild(h("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap" }, [
      h("span", { class: "small" }, ["OFFICIAL CONSULTATION: " + hintsLeft + " available (each reduces the final report by 4 points)."]),
      h("button", {
        class: "btn small",
        disabled: hintsLeft <= 0 || TD.STATE.isComplete(caseData.id) ? "disabled" : null,
        onclick: function () { requestHint(caseData); }
      }, ["REQUEST CONSULTATION"])
    ]));
    body.appendChild(p);
  }
  function hr() { return h("div", { class: "rule" }); }

  function requestHint(caseData) {
    var state = TD.STATE.get();
    var used = state.hintsUsed[caseData.id] || 0;
    if (used >= 2) return;
    var pendingComms = caseData.comms.filter(function (c) { return c.trigger.type === "hint" && (state.cases[caseData.id].fired || []).indexOf(c.id) === -1; });
    var entry;
    if (pendingComms.length) {
      entry = pendingComms[used % pendingComms.length];
    } else {
      var usedAny = caseData.comms.filter(function (c) { return c.trigger.type === "hint"; });
      entry = usedAny[used % usedAny.length];
    }
    state.hintsUsed[caseData.id] = used + 1;
    TD.STATE.logComm(caseData.id, entry.from, entry.text);
    TD.AUDIO.openDoc();
    render(current, "comms");
  }

  /* ---------------- TRIGGERED COMMS ---------------- */
  function checkTriggers(caseData, cs, trigger) {
    var fired = cs.fired || [];
    caseData.comms.forEach(function (c) {
      if (fired.indexOf(c.id) !== -1) return;
      var t = c.trigger;
      var hit = false;
      if (t.type === "start" && trigger.type === "start") hit = true;
      if (t.type === "examined" && trigger.type === "examined" && t.id === trigger.id) hit = true;
      if (t.type === "lab" && trigger.type === "lab" && t.id === trigger.id) hit = true;
      if (!hit) return;
      fired.push(c.id);
      cs.fired = fired;
      TD.STATE.logComm(caseData.id, c.from, c.text);
      TD.AUDIO.openDoc();
      TD.UI.toast("New message \u2014 " + (TD.PERSONNEL.filter(function (p) { return p.id === c.from; })[0] || {}).name);
    });
    TD.STATE.save();
  }

  /* ---------------- delegated to panels ---------------- */
  function renderScannerTag(body, caseData, cs) { TD.PANELS.scanner(body, caseData, cs, current, render); }
  function renderTool(body, caseData, cs) {
    if (currentTab === "timeline") TD.PANELS.timeline(body, caseData, cs, render, current);
    else if (currentTab === "causality") TD.PANELS.causality(body, caseData, cs, render, current);
    else TD.PANELS.board(body, caseData, cs, render, current);
  }
  function renderReport(body, caseData, cs) { TD.PANELS.report(body, caseData, cs, render, current); }

  TD.CASEVIEWS = {
    render: render, openEvidence: openEvidence, allEvidence: allEvidence, checkTriggers: checkTriggers, currentRef: function () { return current; },
    setTab: function (t) {
      if (!current || TD.STATE.isComplete(current.id) && TD.STATE.cs(current.id).submitted) return;
      currentTab = t; TD.AUDIO.click(); render(current);
    }
  };
  TD.SCREENS.replay = function (caseData) {
    if (!root.confirm("Reopen " + caseData.id + "? The current contents of the case file are cleared; your best filed score remains in the record.")) return;
    TD.STATE.reopenCase(caseData.id);
    TD.AUDIO.click();
    TD.SCREENS.go("case", caseData);
    TD.UI.toast("Case " + caseData.id + " reopened \u2014 the exhibits file in again, the truth stays put.");
  };
})(typeof window !== "undefined" ? window : globalThis);
