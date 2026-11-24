/* TIME DEPARTMENT — application shell: router, topbar, settings */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };

  TD.STABILITY_DELTA_TEXT = function (d) {
    if (d > 2) return "STRONG IMPROVEMENT +\u2009" + d.toFixed(1);
    if (d > 0) return "MARGINAL IMPROVEMENT +\u2009" + d.toFixed(1);
    if (d === 0) return "NO CHANGE";
    if (d > -2) return "MARGINAL DEGRADATION " + d.toFixed(1);
    return "MAJOR DEGRADATION " + d.toFixed(1);
  };

  var currentScreen = "menu";
  var currentArg = null;

  function buildShell() {
    var app = document.getElementById("app");
    TD.UI.clear(app);
    var state = TD.STATE.get();

    var topbar = h("div", { class: "topbar" }, [
      TD.UI.crest(),
      h("div", null, [
        h("div", { class: "tb-title" }, ["TIME DEPARTMENT"]),
        h("div", { class: "tb-sub" }, ["TEMPORAL STABILITY DIVISION"])
      ]),
      h("div", { class: "tb-spacer" }),
      h("div", { class: "tb-clock", id: "td-clock" }, ["--:--:--"]),
      h("div", { class: "tb-user" }, [
        h("div", { class: "tb-rank", id: "tb-rank" }, [TD.STATE.rank().name]),
        h("div", null, [state.profile.id, state.profile.name ? " \u00b7 " + state.profile.name : ""])
      ]),
      h("span", { class: "save-dot on", id: "save-dot", title: "progress auto-saved to this device" }),
      h("button", { class: "save-btn", onclick: manualSave }, ["SAVE"])
    ]);

    var screen = h("div", { id: "td-screen", style: "flex:1 1 auto;overflow:auto;position:relative;display:flex;flex-direction:column" });
    app.appendChild(topbar);
    app.appendChild(screen);

    TD.UI.startClock();
  }

  function manualSave() {
    TD.STATE.save();
    var dot = document.getElementById("save-dot");
    if (dot) { dot.classList.add("on"); }
    TD.UI.toast("Progress saved to this device.");
    TD.AUDIO.click();
  }

  function go(name, arg, tabArg) {
    currentScreen = name;
    currentArg = arg || null;
    buildShell();
    var host = document.getElementById("td-screen");
    TD.UI.clear(host);

    var renderer = {
      menu: TD.SCREENS.menu,
      intro: TD.SCREENS.intro,
      hq: function () { TD.SCREENS.hq(); },
      archive: function () { TD.SCREENS.archive(); },
      personnel: function () { TD.SCREENS.personnel(); },
      classified: function () { TD.SCREENS.classified(); },
      lab: function () { TD.SCREENS.lab(); },
      ops: function () { TD.SCREENS.ops(); },
      case: function () { TD.CASEVIEWS.render(currentArg, tabArg || "overview"); },
      results: function () { TD.SCREENS.results(currentArg); },
      settings: function () { renderSettings(); }
    }[name];
    if (renderer) renderer();
  }

  /* ---------- SETTINGS ---------- */
  function renderSettings() {
    var host = document.getElementById("td-screen");
    TD.UI.clear(host);
    var st = TD.STATE.get();
    var wrap = h("div", { class: "wrap", style: "max-width:760px" });

    wrap.appendChild(h("div", { style: "display:flex;align-items:baseline;gap:14px;margin-bottom:14px" }, [
      h("h2", { style: "font-family:var(--head);letter-spacing:0.2em;margin:0;color:var(--ink-bright);font-size:18px" }, ["SETTINGS"]),
      h("div", { style: "flex:1" }),
      h("button", { class: "btn small ghost", onclick: function () { TD.AUDIO.click(); TD.SCREENS.go("menu"); } }, ["\u2190 MAIN MENU"])
    ]));

    var audioPanel = h("div", { class: "panel" }, [h("h3", null, ["AUDIO (all sound is synthesised in the browser)"])]);
    function slider(key, label) {
      var row = h("div", { class: "slider-row" });
      var inp = h("input", { type: "range", min: "0", max: "100", value: String(Math.round(st.settings[key] * 100)) });
      var out = h("output", null, [Math.round(st.settings[key] * 100) + "%"]);
      inp.addEventListener("input", function () {
        st.settings[key] = parseInt(inp.value, 10) / 100;
        out.textContent = inp.value + "%";
        TD.AUDIO.applyVolumes(st.settings);
        TD.STATE.save();
      });
      row.appendChild(h("label", null, [label]));
      row.appendChild(inp); row.appendChild(out);
      return row;
    }
    audioPanel.appendChild(slider("master", "Master volume"));
    audioPanel.appendChild(slider("music", "Music"));
    audioPanel.appendChild(slider("ambient", "Ambient / office"));
    audioPanel.appendChild(slider("sfx", "Interface effects"));
    var tickRow = h("div", { class: "check-row" });
    var tk = h("input", { type: "checkbox" }); tk.checked = !!st.settings.tick;
    tk.addEventListener("change", function () { st.settings.tick = tk.checked; TD.AUDIO.setTick(tk.checked); TD.STATE.save(); });
    tickRow.appendChild(tk);
    tickRow.appendChild(h("span", null, ["Mechanical clock ticking (ambient)"]));
    audioPanel.appendChild(tickRow);
    wrap.appendChild(audioPanel);

    var dispPanel = h("div", { class: "panel" }, [h("h3", null, ["DISPLAY"])]);
    function checkRow(key, label) {
      var row = h("div", { class: "check-row" });
      var cb = h("input", { type: "checkbox" }); cb.checked = !!st.settings[key];
      cb.addEventListener("change", function () { st.settings[key] = cb.checked; applyDisplay(st.settings); TD.STATE.save(); });
      row.appendChild(cb); row.appendChild(h("span", null, [label]));
      return row;
    }
    dispPanel.appendChild(checkRow("scanlines", "CRT scanline overlay"));
    dispPanel.appendChild(checkRow("reducedMotion", "Reduced motion (accessibility)"));
    wrap.appendChild(dispPanel);

    var savePanel = h("div", { class: "panel" }, [h("h3", null, ["SAVE DATA"])]);
    savePanel.appendChild(h("div", { class: "small", style: "margin-bottom:10px" }, ["Progress auto-saves to this browser. Export gives you a portable JSON copy; import restores one."]));
    var ta = h("textarea", { style: "min-height:110px", placeholder: "paste a TIME DEPARTMENT save code here to import\u2026" });
    var row2 = h("div", { class: "btn-row" }, [
      h("button", { class: "btn small", onclick: function () { ta.value = TD.STATE.exportSave(); TD.UI.toast("Save code ready \u2014 copy it somewhere safe."); } }, ["EXPORT"]),
      h("button", { class: "btn small teal", onclick: function () {
        try { TD.STATE.importSave(ta.value.trim()); TD.UI.toast("Save imported."); buildShell(); renderSettings(); }
        catch (err) { TD.UI.toast("Import failed: " + err.message, "red"); }
      } }, ["IMPORT"]),
      h("button", { class: "btn small danger", onclick: function () {
        if (root.confirm("Erase ALL progress permanently? This cannot be undone.")) { TD.STATE.reset(); TD.UI.toast("Progress erased. A fresh ID awaits."); TD.SCREENS.go("menu"); }
      } }, ["RESET PROGRESS"])
    ]);
    savePanel.appendChild(ta); savePanel.appendChild(row2);
    wrap.appendChild(savePanel);

    host.appendChild(wrap);
  }

  function applyDisplay(s) {
    var layers = document.querySelector(".crt-layers");
    if (layers && layers.children) {
      layers.children[0].style.display = s.scanlines ? "" : "none";
    }
    document.body.classList.toggle("reduced-motion", !!s.reducedMotion);
  }

  /* ---------- BOOT ---------- */
  function boot() {
    TD.STATE.init();

    /* crt layers */
    var layers = h("div", { class: "crt-layers" }, [
      h("div", { class: "crt-scanlines" }), h("div", { class: "crt-vignette" }), h("div", { class: "crt-noise" })
    ]);
    document.body.appendChild(layers);

    /* audio unlock on first interaction */
    var unlock = function () {
      TD.AUDIO.unlock();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);

    TD.SCREENS.go = go;
    applyDisplay(TD.STATE.get().settings);
    go("menu");

    /* autosave heartbeat */
    setInterval(function () { TD.STATE.save(); }, 15000);

    var TAB_KEYS = { "1": "overview", "2": "evidence", "3": "scanner", "4": "timeline", "5": "causality", "6": "board", "7": "comms", "0": "report" };
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !document.querySelector(".modal-backdrop") && currentScreen !== "menu") { go("menu"); return; }
      if (currentScreen !== "case" || e.ctrlKey || e.metaKey || e.altKey || document.querySelector(".modal-backdrop")) return;
      var tn = e.target && e.target.tagName;
      if (tn === "INPUT" || tn === "TEXTAREA" || tn === "SELECT") return;
      var tab = TAB_KEYS[e.key];
      if (tab && TD.CASEVIEWS.setTab) { TD.CASEVIEWS.setTab(tab); if (e.key !== "0") e.preventDefault(); }
    });

    window.addEventListener("beforeunload", function () { TD.STATE.save(); });
  }

  if (typeof document !== "undefined") {
    (document.readyState === "loading") ? document.addEventListener("DOMContentLoaded", boot) : boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
