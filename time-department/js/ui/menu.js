/* TIME DEPARTMENT — main menu + intro sequence */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };

  function renderMenu() {
    var app = document.getElementById("td-screen") || document.getElementById("app");
    TD.UI.clear(app);
    TD.STATE.save();

    var frags = [];
    var texts = ["TC-004  SEALED \u2502 LOCKED  \u2502 LOCKED", "STABILITY INDEX 84.0", "ANOMALY LOG 1957\u2013NOW", "ANCHOR UNITS: SERIES J-7", "OFFICE OF CONTINUITY \u2502 [UNREGISTERED]", "MEMO: DO NOT ANCHOR", "E. VOSS  \u00b7  A. VALE  \u00b7  M. CROSS  \u00b7  T. REED  \u00b7  J. MERCER", "EXCISION-1: DEPLOYMENT RECORD", "FILE 9-JANUS  \u2502 VAULT B", "SIGNATURE CLASS: H", "PLATFORM 3 \u2502 89s"];
    for (var i = 0; i < 14; i++) {
      frags.push(h("div", {
        class: "menu-frag",
        style: "left:" + (Math.random() * 92) + "%;animation-duration:" + (26 + Math.random() * 40) + "s;animation-delay:" + (-Math.random() * 40) + "s"
      }, [texts[i % texts.length]]));
    }
    var clock = h("div", { class: "menu-clock", style: "width:420px;height:420px;right:-90px;top:-90px;" }, [
      h("div", { class: "hand h" }), h("div", { class: "hand m" }), h("div", { class: "hand s" })
    ]);
    var clock2 = h("div", { class: "menu-clock", style: "width:280px;height:280px;left:-70px;bottom:-70px;" }, [
      h("div", { class: "hand h" }), h("div", { class: "hand m", style: "animation-direction:reverse" })
    ]);

    var state = TD.STATE.get();
    var anyProgress = state.completed.length > 0 || Object.keys(state.cases).some(function (k) { var c = state.cases[k]; return c && !c.submitted; });
    var hasSave = TD.STATE.hasSave();

    var buttons = h("div", { class: "menu-buttons" }, [
      h("button", { class: "btn teal", onclick: function () { TD.AUDIO.click(); newInvestigation(); } }, ["NEW INVESTIGATION", h("span", { class: "k" }, [" assigns ID \u00b7 begins TC-001"])]),
      hasSave ? h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go(anyProgress ? "hq" : "intro"); } }, ["CONTINUE", h("span", { class: "k" }, [" resumes \u00b7 " + lastPlayLabel()])]) : null,
      h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("archive"); } }, ["CASE ARCHIVE", h("span", { class: "k" }, [" completed: " + state.completed.length + "/5"])]),
      h("button", { class: "btn", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("personnel"); } }, ["DEPARTMENT PERSONNEL", h("span", { class: "k" }, [" 5 dossiers"])]),
      h("button", { class: "btn ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("settings"); } }, ["SETTINGS", h("span", { class: "k" }, [" audio \u00b7 display \u00b7 save data"])])
    ]);

    var box = h("div", { class: "menu-box" }, [
      h("h1", { html: "TIME <span class='am'>DEPARTMENT</span>" }),
      h("div", { class: "menu-sub" }, ["TEMPORAL STABILITY DIVISION"]),
      buttons,
      h("div", { class: "menu-notice" }, ["EMPLOYEE NOTICE 88-C: ", h("span", { class: "red" }, ["IF YOU CAN READ THIS, IT IS CURRENTLY TODAY."])]),
      h("div", { class: "menu-stars" }, ["A VESPERA COUNTY INSTITUTION \u00b7 EST. 1957"])
    ]);

    app.appendChild(h("div", { class: "screen menu-bg" }, [clock, clock2].concat(frags).concat([
      h("div", { class: "menu-front" }, [box])
    ])));
  }

  function lastPlayLabel() {
    var s = TD.STATE.get();
    if (s.completed.length) { return s.completed.length + " case(s) closed"; }
    var open = Object.keys(s.cases || {})[0];
    if (open) { var c = TD.CASES.filter(function (x) { return x.id === open; })[0]; return c ? c.id + " open" : "in progress"; }
    return "in progress";
  }

  /* ---------- intro sequence: assignment papers ---------- */
  function newInvestigation() {
    var existing = TD.STATE.hasSave();
    if (existing) {
      var ok = root.confirm("A personnel file already exists on this terminal. Starting a NEW INVESTIGATION will archive it permanently. Continue?");
      if (!ok) return;
      TD.STATE.reset();
    }
    TD.SCREENS.go("intro");
  }

  function renderIntro() {
    var app = document.getElementById("td-screen") || document.getElementById("app");
    TD.UI.clear(app);
    var st = TD.STATE.get();
    var step = 0;

    function paper(inner, onNext, nextLabel) {
      var box = h("div", { class: "intro-card" }, [
        h("div", { class: "intro-paper", html: inner }),
        h("div", { class: "btn-row", style: "justify-content:center" }, [
          h("button", { class: "btn teal", onclick: onNext }, [nextLabel])
        ])
      ]);
      return box;
    }

    function step0() {
      app.appendChild(h("div", { class: "screen" }, [paper(
        "<h4>DEPARTMENT FOR TEMPORAL STABILITY<br>OFFICE OF PERSONNEL \u2014 FORM TS-11 ($ ASSIGNMENT)</h4>" +
        "<div class='stamp'>APPOINTMENT CONFIRMED</div>" +
        "<div class='stamp-fields'>" +
        "<div><span>EMPLOYEE:</span><b>" + (st.profile.name || "NEW RECRUIT") + " \u2014 " + st.profile.id + "</b></div>" +
        "<div><span>GRADE:</span><b>TEMPORAL INVESTIGATOR \u00b7 JUNIOR CLASS</b></div>" +
        "<div><span>SECTION:</span><b>FIELD INVESTIGATION DESK, ROOM 214-C</b></div>" +
        "<div><span>EFFECTIVE:</span><b>IMMEDIATELY (AND, WHERE MEASURED, SLIGHTLY EARLIER)</b></div>" +
        "<div><span>REPORT TO:</span><b>DIRECTOR E. VOSS, OPERATIONS FLOOR</b></div>" +
        "</div>" +
        "<p style='margin-bottom:0'>You are instructed to familiarise yourself with the Division's investigative stations, to treat every anomaly as a question rather than an event, and to remember, at all times, that the Department does not travel through time. It mops up after it.</p>",
        function () { TD.AUDIO.click(); next(1); }, "ACCEPT ASSIGNMENT"
      )]));
    }

    function next(n) {
      TD.UI.clear(app);
      if (n === 1) app.appendChild(h("div", { class: "screen" }, [paper(
        "<h4>FORM TS-4 \u2014 FIRST ASSIGNMENT (CASE INTAKE)</h4>" +
        "<div class='stamp red'>CASE TC-001 \u00b7 OPEN</div>" +
        "<div class='stamp-fields'>" +
        "<div><span>SUBJECT:</span><b>THE MAN WHO WAS BORN TOMORROW</b></div>" +
        "<div><span>LOCATION:</span><b>CENTRAL STATION \u2014 PLATFORM 4</b></div>" +
        "<div><span>SEVERITY:</span><b>CLASS II \u00b7 CONTAINED, DETERIORATING</b></div>" +
        "<div><span>NOTE:</span><b>EVERY IDENTITY DOCUMENT CONCERNING THE SUBJECT STATES THAT HE WILL BE BORN IN THREE DAYS. HIS MEDICAL RECORDS DISAGREE BY 34 YEARS. YOU WILL DECIDE WHICH OF THEM IS LATE.</b></div></div>" +
        "<p style='margin-bottom:0'>The Operations floor will brief you fully. Take the case, Investigator. And welcome to the Department. Mind the clocks. They notice new people.</p>",
        function () { TD.AUDIO.click(); TD.STATE.get().introSeen = true; TD.STATE.save(); TD.SCREENS.go("hq"); TD.UI.toast("Welcome to the Department, " + (TD.STATE.get().profile.name || "Investigator") + "."); }, "REPORT TO HEADQUARTERS"
      )]));
    }

    step0();
  }

  TD.SCREENS = TD.SCREENS || {};
  TD.SCREENS.menu = renderMenu;
  TD.SCREENS.intro = renderIntro;
})(typeof window !== "undefined" ? window : globalThis);
