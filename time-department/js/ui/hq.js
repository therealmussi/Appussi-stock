/* TIME DEPARTMENT — headquarters screens */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };
  var currentSection = "ops";

  function render(section) {
    if (section) currentSection = section;
    var app = document.getElementById("td-screen") || document.getElementById("app");
    TD.UI.clear(app);
    var state = TD.STATE.get();
    var scr = h("div", { class: "screen" }, [h("div", { class: "wrap" })]);
    app.appendChild(scr);
    var wrap = scr.firstChild;

    wrap.appendChild(h("div", { style: "display:flex;align-items:baseline;gap:14px;margin-bottom:14px" }, [
      h("h2", { style: "font-family:var(--head);letter-spacing:0.2em;margin:0;color:var(--ink-bright);font-size:18px" }, ["DEPARTMENT HEADQUARTERS"]),
      h("span", { class: "mono tiny dim" }, ["OPERATIONS FLOOR \u00b7 LEVEL 2 \u00b7 ROOM 214-C ASSIGNED TO " + state.profile.id]),
      h("div", { style: "flex:1" }),
      h("button", { class: "btn small ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("menu"); } }, ["\u2190 MAIN MENU"])
    ]));

    var nav = h("div", { class: "hq-nav" });
    [["ops", "OPERATIONS ROOM"], ["files", "CASE FILES"], ["archive", "TEMPORAL ARCHIVE"], ["lab", "LABORATORY"], ["personnel", "PERSONNEL"], ["classified", "CLASSIFIED FILES"]].forEach(function (p) {
      var b = h("button", { class: "btn small" + (p[0] === currentSection ? " on" : ""), onclick: function () { TD.AUDIO.click(); currentSection = p[0]; render(); } }, [p[1]]);
      if (p[0] === "classified") {
        b.appendChild(h("span", { class: "locked-note", style: "margin-left:8px" }, ["RESTRICTED"]));
      }
      nav.appendChild(b);
    });
    wrap.appendChild(nav);

    var body = h("div");
    wrap.appendChild(body);
    ({ ops: renderOps, files: renderFiles, archive: renderArchive, lab: renderLab, personnel: renderPersonnel, classified: renderClassified })[currentSection](body, state);
  }

  /* ---------- OPS ---------- */
  function renderOps(body, state) {
    var stab = state.globalStability;
    var cls = stab >= 80 ? "" : stab >= 60 ? " warn" : " crit";
    var openCase = firstOpenCase(state);
    var alerts = recentComms(state, 6);

    var gaugePanel = h("div", { class: "panel" }, [h("h3", null, ["TEMPORAL STABILITY INDEX", h("span", { class: "hr-right" }, ["DIVISION-WIDE"])])]);
    gaugePanel.appendChild(h("div", { class: "stability-row" }, [
      h("div", { class: "gauge-num" + cls }, [stab.toFixed(1)]),
      h("div", { class: "gauge" + cls }, [h("div", { style: "width:" + Math.max(4, stab) + "%" })]),
      h("div", { class: "kv", style: "flex:1;min-width:220px" }, [
        h("b", null, [stab >= 80 ? "NOMINAL" : stab >= 60 ? "STRAINED" : "CRITICAL"]),
        "Certified coherence of monitored records. Measured against the 1957 baseline. Manufactured coherence reads identically \u2014 see ARCH-02, then see it again."
      ])
    ]));

    var kv = h("div", { class: "panel" }, [h("h3", null, ["YOUR DESK"])]);
    kv.appendChild(h("div", { class: "grid-3" }, [
      h("div", { class: "kv" }, [h("b", null, [TD.STATE.rank().name]), "CURRENT RANK"]),
      h("div", { class: "kv" }, [h("b", null, [state.completed.length + " / " + TD.CASES.length]), "CASES CLOSED"]),
      h("div", { class: "kv" }, [h("b", null, [TD.STATE.avgScore() + " / 100"]), "AVERAGE REPORT SCORE"]),
      h("div", { class: "kv" }, [h("b", null, [openCase ? openCase.id : "\u2014"]), "CURRENT ASSIGNMENT"]),
      h("div", { class: "kv" }, [h("b", null, ["J-" + state.janus]), "JANUS PATTERN MATCHES"]),
      h("div", { class: "kv" }, [h("b", null, [TD.UI.deptDate(state)]), "OPERATIONAL DATE"])
    ]));
    if (TD.STATE.nextRank() && !TD.STATE.nextRank().occupied) kv.appendChild(h("div", { class: "small", style: "margin-top:10px" }, ["Promotion review on completion of " + TD.STATE.nextRank().need + " case(s)" + (TD.STATE.nextRank().minAvg ? " with average score \u2265 " + TD.STATE.nextRank().minAvg : "") + "."]));

    var al = h("div", { class: "panel" }, [h("h3", null, ["DEPARTMENT ALERTS"])]);
    var ul = h("ul", { class: "op-alerts", style: "padding:0;margin:0" });
    alerts.forEach(function (c) {
      var from = (TD.PERSONNEL.filter(function (p) { return p.id === c.from; })[0] || { name: c.from });
      ul.appendChild(h("li", { class: c.kind || "alert-teal" }, [TD.UI.h("span", { class: "dim" }, ["[" + new Date(c.time).toLocaleTimeString() + "] "]), TD.UI.h("b", null, [from.name.split(" ").pop() + ": "]), c.text]));
    });
    if (!alerts.length) ul.appendChild(h("li", { class: "alert-red" }, ["NO PENDING TRAFFIC. IF YOU ARE READING THIS AND THE DESK BELOW IS QUIET, CONSIDER GETTING ONE."]));
    al.appendChild(ul);

    body.appendChild(gaugePanel);
    body.appendChild(kv);
    body.appendChild(al);
  }

  function firstOpenCase(state) {
    for (var i = 0; i < TD.CASES.length; i++) {
      var c = TD.CASES[i];
      if (!TD.STATE.isComplete(c.id) && TD.STATE.caseUnlocked(c)) return c;
    }
    return null;
  }
  function recentComms(state, n) { return state.comms.slice(-n).reverse(); }

  /* ---------- CASE FILES ---------- */
  function renderFiles(body, state) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["ACTIVE & COMPLETED INVESTIGATIONS"])]);
    TD.CASES.forEach(function (c) {
      var cs = state.cases[c.id];
      var done = TD.STATE.isComplete(c.id);
      var unlocked = TD.STATE.caseUnlocked(c);
      var row = h("button", {
        class: "case-row" + (unlocked ? "" : " locked"),
        onclick: function () {
          if (!unlocked) { TD.UI.toast("Case seal: closes with " + TD.CASES[c.number - 2].id + ".", "amber"); return; }
          TD.AUDIO.click();
          if (done && cs && cs.submitted) { TD.SCREENS.go("results", c); return; }
          TD.SCREENS.go("case", c);
        }
      }, [
        h("span", { class: "cn" }, [c.id]),
        h("span", { class: "ct" }, [
          h("span", { html: c.title.toUpperCase() }),
          h("small", null, [c.location + " \u00b7 " + c.dateOfAnomaly + " \u00b7 Severity CLASS " + c.severity + " \u00b7 Difficulty " + "\u25c8".repeat(c.difficulty)])
        ]),
        done && cs && cs.submitted ? h("span", { class: "done-mark" }, ["CLOSED \u00b7 " + cs.submitted.score + "/100 \u00b7 " + cs.submitted.grade]) :
          (unlocked ? h("span", { class: "mono tiny amber" }, ["OPEN \u2014 INVESTIGATE"]) : h("span", { class: "locked-note" }, ["SEALED"]))
      ]);
      p.appendChild(row);
    });
    p.appendChild(h("div", { class: "small", style: "margin-top:8px" }, ["The Division accepts only monotony as proof of good paperwork. Each case, once closed, may be reopened from the ARCHIVE at the cost of its current state."]));
    body.appendChild(p);
  }

  /* ---------- ARCHIVE ---------- */
  function renderArchive(body, state) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["TEMPORAL ARCHIVE \u2014 OPEN RECORDS"])]);
    var q = "";
    var search = h("input", { type: "search", placeholder: "search records\u2026", oninput: function (e) { q = e.target.value.toLowerCase(); TD.AUDIO.click(); list(); } });
    p.appendChild(search);
    var listEl = h("div", { style: "margin-top:12px" });
    p.appendChild(listEl);
    function list() {
      TD.UI.clear(listEl);
      TD.ARCHIVE.forEach(function (doc) {
        var locked = doc.janus && state.janus < doc.janus;
        if (q && (doc.title + " " + doc.body).toLowerCase().indexOf(q) === -1) return;
        var unmet = locked ? (doc.janus - state.janus) + " MATCHES TO DECLASSIFY" : null;
        var row = h("button", {
          class: "doc-row" + (locked ? " locked" : ""),
          onclick: function () {
            if (locked) { TD.UI.toast("Record " + doc.ref + " requires further JANUS pattern matches (" + unmet + ").", "amber"); return; }
            TD.AUDIO.openDoc();
            TD.UI.openModal(h("div", null, [
              h("div", { class: "ev-detail-head" }, [h("h4", null, [doc.title])]),
              h("div", { class: "mono tiny dim", style: "margin:6px 0 12px" }, [doc.ref + " \u00b7 DEPARTMENT ARCHIVE \u00b7 " + doc.date]),
              h("div", { class: "ev-body" }, [doc.body])
            ]), { title: "ARCHIVE RECORD", wide: true });
          }
        }, [h("span", { class: "dn" }, [doc.ref]), doc.title, unmet ? h("span", { class: "req" }, [unmet]) : null]);
        listEl.appendChild(row);
      });
    }
    list();
    body.appendChild(p);
  }

  /* ---------- LABORATORY ---------- */
  function renderLab(body, state) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["LABORATORY \u2014 EVIDENCE ANALYSIS"])]);
    p.appendChild(h("div", { class: "small", style: "margin-bottom:12px" }, ["Exhibits in active investigations that carry laboratory markings can be analysed here. Analyses are recorded against the case file and unlock additional detail in the exhibit itself."]));
    var any = false;
    var activeCase = currentActiveCase(state);
    if (!activeCase) {
      p.appendChild(h("div", { class: "lab-drop" }, ["NO ACTIVE INVESTIGATION. The laboratory has shipped all its beakers to a case that has not started yet."]));
    } else {
      activeCase.evidence.forEach(function (e) {
        if (!e.lab) return;
        var cs = TD.STATE.cs(activeCase.id);
        var done = cs.labs.indexOf(e.id) !== -1;
        any = true;
        var row = h("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--panel-2);border:1px solid var(--line-soft);border-radius:4px;margin-bottom:8px" }, [
          h("span", { class: "mono teal", style: "font-size:12px" }, [e.id.toUpperCase()]),
          h("div", { style: "flex:1" }, [h("div", { class: "upper", style: "font-size:12.5px" }, [e.name]), h("div", { class: "tiny dim" }, [e.lab.label])]),
          done ? h("span", { class: "badge bg-teal" }, ["ANALYSED"]) :
            h("button", { class: "btn small teal", onclick: function () { runLab(activeCase, e); } }, ["RUN ANALYSIS"])
        ]);
        p.appendChild(row);
      });
    }
    body.appendChild(p);
  }
  function currentActiveCase(state) {
    for (var i = 0; i < TD.CASES.length; i++) {
      var c = TD.CASES[i];
      if (TD.STATE.caseUnlocked(c) && !TD.STATE.isComplete(c.id)) return c;
    }
    return null;
  }
  function runLab(c, e) {
    var cs = TD.STATE.cs(c.id);
    if (cs.labs.indexOf(e.id) === -1) cs.labs.push(e.id);
    TD.STATE.save();
    TD.AUDIO.chime();
    TD.UI.toast("Laboratory analysis complete \u2014 " + e.name, "amber");
    TD.SCREENS.go("case", c, "evidence");
  }

  /* ---------- PERSONNEL ---------- */
  function renderPersonnel(body, state) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["PERSONNEL \u2014 CLEARANCE: YOUR OWN"])]);
    TD.PERSONNEL.forEach(function (per) {
      var hidden = (per.hidden || []).filter(function (hh) { return TD.STATE.isComplete(TD.CASES[hh.afterCase - 1].id); });
      var card = h("div", { class: "person-card" }, [
        h("div", { class: "person-avatar" }, [per.icon]),
        h("div", { style: "flex:1" }, [
          h("h4", null, [per.name]),
          h("div", { class: "person-role" }, [per.role]),
          h("div", { class: "small", style: "margin-top:6px" }, [per.bio]),
          h("p", { class: "person-quote" }, ["\u201c" + per.quote + "\u201d"])
        ].concat(hidden.map(function (hh) { return h("div", { class: "person-hidden" }, ["\u25b8 " + hh.text]); })))
      ]);
      p.appendChild(card);
    });
    body.appendChild(p);
  }

  /* ---------- CLASSIFIED ---------- */
  function renderClassified(body, state) {
    var p = h("div", { class: "panel classified-doc" }, [h("h3", null, ["CLASSIFIED FILES \u2014 CLEARANCE PENDING"])]);
    var unlockedAny = false;
    TD.CLASSIFIED.forEach(function (f) {
      var un = TD.UI.classifiedUnlocked(f, state);
      if (un) unlockedAny = true;
      var row = h("button", {
        class: "doc-row" + (un ? "" : " locked"),
        style: un ? "background:#1c1216;border-color:#4a2a26" : "",
        onclick: function () {
          if (!un) {
            TD.AUDIO.alert();
            TD.UI.toast("ACCESS DENIED \u2014 clearance requirement not met. Requirements: " + (f.reqCase ? ("close " + TD.CASES[f.reqCase - 1].id) : ("JANUS pattern matches \u2265 " + f.reqJanus + " (currently " + state.janus + ")")), "red");
            return;
          }
          TD.AUDIO.anomaly();
          TD.UI.openModal(h("div", null, [
            h("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:10px" }, [
              h("span", { class: "janus-glyph" }),
              h("h4", { style: "margin:0;font-family:var(--head);letter-spacing:0.15em;color:var(--red-hi)" }, [f.ref + " \u00b7 " + f.title])
            ]),
            h("div", { class: "cbody" }, [f.body])
          ]), { title: "CLASSIFIED \u2014 CLEARANCE VERIFIED", wide: true });
        }
      }, [
        h("span", { class: "dn", style: "color:#e3796b" }, [f.ref]), f.title,
        un ? h("span", { class: "req", style: "color:#8a5a52" }, ["DECLASSIFIED"]) : h("span", { class: "req" }, [f.reqCase ? ("CLOSE " + TD.CASES[f.reqCase - 1].id) : ("JANUS MATCHES \u2265\u2009" + f.reqJanus)])
      ]);
      p.appendChild(row);
    });
    if (!unlockedAny) p.appendChild(h("div", { class: "classified-prompt" }, ["NO CLEARANCE RECORD ON FILE.\n\nDocuments in this section may be declassified by demonstrating knowledge of the pattern referred to internally as J.\u2009P. Examine what the office leaves in plain sight."]));
    body.appendChild(p);
  }

  TD.SCREENS = TD.SCREENS || {};
  TD.SCREENS.hq = render;
  TD.SCREENS.archive = function () { render("files"); };
  TD.SCREENS.personnel = function () { render("personnel"); };
  TD.SCREENS.classified = function () { render("classified"); };
  TD.SCREENS.lab = function () { render("lab"); };
  TD.SCREENS.ops = function () { render("ops"); };
})(typeof window !== "undefined" ? window : globalThis);
