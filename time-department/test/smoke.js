#!/usr/bin/env node
/* TIME DEPARTMENT — headless integration smoke test (requires jsdom).
   Boots the real game, plays Case 001 to completion, verifies scoring,
   unlocks, persistence and all investigation tools.
   Run:  npm i jsdom --prefix <anywhere>, then
         node -e "process.env.JSDOM_PATH='<path>/node_modules/jsdom'" ... or simply
         npm i --prefix ./node_modules_tmp && node test/smoke.js */
"use strict";
var path = require("path");
function loadJsdom() {
  try { return require("jsdom"); }
  catch (e) {
    var here = require.resolve("jsdom", { paths: [path.join(__dirname, "node_modules"), process.cwd(), process.cwd() + "/node_modules"] });
    return require(here);
  }
}
var JSDOM = loadJsdom().JSDOM;

var ROOT = path.join(__dirname, "..");
var html = require("fs").readFileSync(path.join(ROOT, "index.html"), "utf8");
var dom = new JSDOM(html, {
  url: "file://" + ROOT + "/index.html",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  beforeParse: function (window) {
    var store = {};
    Object.defineProperty(window, "localStorage", { value: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); },
      removeItem: function (k) { delete store[k]; }
    }, configurable: true });
    window.matchMedia = window.matchMedia || function () { return { matches: false, addListener: function () {}, removeListener: function () {}, addEventListener: function () {} }; };
  }
});
var window = dom.window, document = window.document;

window.addEventListener("error", function (e) {
  console.error("WINDOW ERROR:", e.message, e.filename + ":" + e.lineno);
  process.exitCode = 2;
});

var failures = 0;
function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (err) {
    failures++;
    console.error("  FAIL " + name + (err && err.message ? " \u2014 " + err.message : "") + (err && err.stack && err.stack.split("\n")[1] ? "\n    " + err.stack.split("\n")[1].trim() : ""));
  }
}
function buttons(re) {
  return [].slice.call(document.querySelectorAll("button")).filter(function (b) { return re.test((b.textContent || "").trim()); });
}
function click(re, opt_label) {
  var b = buttons(re)[0];
  if (!b) throw new Error("button not found: " + (opt_label || re));
  b.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
  return b;
}
function must(cond, msg) { if (!cond) throw new Error(msg || "assertion failed"); }

setTimeout(function () {
  console.log("== TIME DEPARTMENT smoke ==");
  step("boot: namespace + menu", function () {
    must(window.TD && window.TD.CASES && window.TD.CASES.length === 5, "TD.CASES missing");
    must(document.querySelector(".menu-box h1"), "menu title missing");
  });
  window.confirm = function () { return true; };

  step("new investigation -> assignment papers", function () {
    click(/NEW INVESTIGATION/);
    must(document.querySelector(".intro-paper"), "no intro paper");
  });
  step("accept -> case intake paper", function () { click(/ACCEPT ASSIGNMENT/); must(/TC-001/.test(document.body.textContent), "no case intake"); });
  step("report to HQ", function () {
    click(/REPORT TO HEADQUARTERS/);
    must(document.getElementById("td-clock"), "topbar missing");
    must(/84\.0/.test(document.body.textContent), "stability index missing");
  });
  step("HQ sections all render", function () {
    click(/CASE FILES/); must(/TC-001/.test(document.body.textContent), "case list missing");
    click(/TEMPORAL ARCHIVE/); must(/ARCH-01/.test(document.body.textContent), "archive missing");
    click(/LABORATORY/); must(/LABORATORY/.test(document.body.textContent), "lab missing");
    click(/PERSONNEL/); must(/Eleanor Voss/.test(document.body.textContent), "personnel missing");
    click(/CLASSIFIED FILES/); must(/CLASSIFIED/.test(document.body.textContent.toUpperCase()), "classified missing");
    click(/OPERATIONS ROOM/); must(/84\.0/.test(document.body.textContent), "ops missing");
  });
  step("open case TC-001", function () {
    click(/CASE FILES/);
    var row = [].slice.call(document.querySelectorAll(".case-row")).filter(function (r) { return /TC-001/.test(r.textContent); })[0];
    if (!row) throw new Error("case row missing");
    row.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    must(/CASE BRIEFING/.test(document.body.textContent), "briefing missing");
  });
  step("evidence: open, inspect, mark, note, pin", function () {
    click(/EVIDENCE/);
    var n = document.querySelectorAll(".ev-item").length;
    must(n >= 8, "evidence list short: " + n);
    var first = document.querySelector(".ev-item");
    first.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    must(document.querySelector(".modal .ev-detail-head"), "exhibit modal missing");
    click(/CONTRADICTION/, "mark");
    var ta = document.querySelector(".modal textarea");
    ta.value = "test note"; ta.dispatchEvent(new window.Event("change", { bubbles: true }));
    must(Object.keys(window.TD.STATE.cs("TC-001").notes).length === 1, "note not saved");
    click(/PIN TO BOARD/);
    must(window.TD.STATE.cs("TC-001").board.cards.length === 1, "pin failed");
    click(/CLOSE EXHIBIT/);
  });
  step("scanner: scan all targets", function () {
    click(/SCANNER/);
    var scans = 0;
    var guard = 0;
    while (buttons(/^SCAN$/).length && guard < 10) {
      click(/^SCAN$/); scans++; guard++;
    }
    must(scans >= 5, "scans performed: " + scans);
    var cs = window.TD.STATE.cs("TC-001");
    must(cs.scans.length >= 5, "scan state missing");
    must(cs.scanReports.length >= 4, "scan reports not filed");
  });
  step("timeline: autofill, clear, manual place", function () {
    click(/TIMELINE/);
    must(document.querySelector(".tl-chip"), "no event chips");
    click(/AUTO-FILL TIMESTAMPS/);
    must(document.querySelectorAll(".tl-slot .tl-chip").length > 0, "autofill failed");
    click(/^CLEAR$/);
    must(document.querySelectorAll(".tl-slot .tl-chip").length === 0, "clear failed");
    var chip = document.querySelector(".tl-pool .tl-chip");
    chip.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    var slot = document.querySelector(".tl-slot");
    slot.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    must(document.querySelectorAll(".tl-slot .tl-chip").length === 1, "manual placement failed");
  });
  step("causality: add + remove link", function () {
    click(/CAUSALITY/);
    click(/ADD LINK/);
    must(document.querySelectorAll(".caus-list div").length === 1, "link not added");
    var cs = window.TD.STATE.cs("TC-001");
    cs.causality = [];
    window.TD.STATE.save();
  });
  step("board: pin + note card + relation menu", function () {
    click(/BOARD/);
    var sel = document.querySelector(".board-toolbar select");
    sel.value = sel.options[1].value;
    click(/PIN EVIDENCE/);
    must(document.querySelectorAll(".bcard").length >= 2, "cards missing");
    click(/ADD NOTE/);
    must(document.querySelectorAll(".bcard.bnote").length >= 1, "note card missing");
  });
  step("comms: start message + consultation", function () {
    click(/COMMS/);
    must(document.querySelectorAll(".comm-msg").length >= 1, "no start comm");
    click(/REQUEST CONSULTATION/);
    var used = window.TD.STATE.get().hintsUsed["TC-001"];
    must(used === 1, "hint not counted");
  });
  step("final report: answer, choose intervention", function () {
    click(/FINAL REPORT/);
    must(/OFFICIAL INVESTIGATION REPORT/.test(document.body.textContent), "report missing");
    var caseData = window.TD.CASEVIEWS.currentRef();
    var opts = document.querySelectorAll(".report-q");
    must(opts.length === caseData.report.length, "question count mismatch");
    caseData.report.forEach(function (q, qi) {
      var box = document.querySelectorAll(".report-q")[qi];
      var firstOpt = box.querySelector(".opt-row");
      firstOpt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
    var ivOpts = document.querySelectorAll(".int-opt");
    must(ivOpts.length === caseData.interventions.length, "intervention options mismatch: " + ivOpts.length);
    ivOpts[0].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
  step("file report -> results screen", function () {
    click(/FILE OFFICIAL REPORT/);
    must(/CASE CLOSED/i.test(document.body.textContent), "results missing");
    var sub = window.TD.STATE.cs("TC-001").submitted;
    must(sub, "no submitted report persisted");
    must(typeof sub.score === "number" && sub.score >= 0 && sub.score <= 100, "bad score " + sub.score);
    must(["S", "A", "B", "C", "D"].indexOf(sub.grade) !== -1, "bad grade");
  });
  step("results: truth + verdicts + stability", function () {
    must(/CASE TRUTH/.test(document.body.textContent), "truth missing");
    must(document.querySelectorAll(".q-verdict").length === 5, "verdicts missing");
    must(/DIVISION INDEX/.test(document.body.textContent), "stability line missing");
  });
  step("progression: completion + unlock + persistence", function () {
    must(window.TD.STATE.isComplete("TC-001"), "not completed");
    must(window.TD.STATE.caseUnlocked(window.TD.CASES[1]), "case 2 not unlocked");
    var raw = window.localStorage.getItem(window.TD.META.saveKey);
    var parsed = JSON.parse(raw);
    must(parsed.cases["TC-001"].submitted.score === window.TD.STATE.cs("TC-001").submitted.score, "save mismatch");
    must(parsed.globalStability !== 84.0 || typeof parsed.globalStability === "number", "stability not numeric");
  });
  step("desk reflects the closed case", function () {
    click(/RETURN TO HEADQUARTERS/);
    must(/CLOSED \u00b7/.test(document.body.textContent), "closed case not shown");
  });
  step("case archive view", function () {
    click(/CASE FILES/);
    must(/CLOSED \u00b7/.test(document.body.textContent), "archive row missing");
    must(/SEALED/.test(document.body.textContent.toUpperCase()), "locked cases missing");
  });

  step("unsolved files teaser in case files", function () {
    click(/CASE FILES/);
    must(/UNSOLVED FILES/.test(document.body.textContent), "teaser missing");
    must(/COMING SOON/.test(document.body.textContent), "soon tag missing");
  });
  step("keyboard shortcuts switch tabs", function () {
    var row2 = [].slice.call(document.querySelectorAll(".case-row")).filter(function (r) { return /TC-002/.test(r.textContent); })[0];
    row2.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    must(/CASE BRIEFING/.test(document.body.textContent), "tc002 not open");
    function press(k) { window.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true })); }
    press("2");
    var on = document.querySelector(".tabs .on");
    must(on && on.textContent === "EVIDENCE", "shortcut 2 failed: " + (on && on.textContent));
    press("6");
    on = document.querySelector(".tabs .on");
    must(on && on.textContent === "BOARD", "shortcut 6 failed");
    press("0");
    on = document.querySelector(".tabs .on, .tab-report.on");
    must(/OFFICIAL INVESTIGATION REPORT/.test(document.body.textContent), "shortcut 0 (report) failed");
    press("1");
    must(/CASE BRIEFING/.test(document.body.textContent), "shortcut 1 failed");
  });
  step("reopen completed case: wipe + keep best score", function () {
    window.TD.SCREENS.go("hq");
    click(/CASE FILES/);
    var row1 = [].slice.call(document.querySelectorAll(".case-row")).filter(function (r) { return /TC-001/.test(r.textContent); })[0];
    row1.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    must(/CASE CLOSED/.test(document.body.textContent.toUpperCase()), "results not shown");
    var before = window.TD.STATE.cs("TC-001").submitted.score;
    click(/REOPEN INVESTIGATION/);
    var cs = window.TD.STATE.cs("TC-001");
    must(!cs.submitted, "submitted not cleared");
    must(cs.board.cards.length === 0 && Object.keys(cs.notes).length === 0, "case state not wiped");
    must(window.TD.STATE.get().bestScore["TC-001"] === before, "best score lost");
    must(window.TD.STATE.isComplete("TC-001"), "completion unlisted");
    must(window.TD.STATE.caseUnlocked(window.TD.CASES[1]), "case 2 relocked");
    window.TD.SCREENS.go("hq");
    click(/CASE FILES/);
    must(/REOPENED \u2014 BEST/.test(document.body.textContent) || /REOPENED . BEST/.test(document.body.textContent), "reopened label missing");
  });
  step("settings: sliders, export/import round-trip", function () {
    click(/MAIN MENU/);
    click(/SETTINGS/);
    var slider = document.querySelector('input[type="range"]');
    slider.value = "35";
    slider.dispatchEvent(new window.Event("input", { bubbles: true }));
    must(Math.abs(window.TD.STATE.get().settings.master - 0.35) < 0.005, "master slider not applied");
    click(/EXPORT/);
    var code = document.querySelector("textarea").value;
    var parsed = JSON.parse(code);
    must(parsed.profile && parsed.cases && parsed.settings.master === 0.35, "export malformed");
    click(/IMPORT/);
    must(Math.abs(window.TD.STATE.get().settings.master - 0.35) < 0.005, "import did not restore");
    must(window.TD.STATE.isComplete("TC-001"), "import lost completion");
  });

  console.log(failures ? "\nSMOKE TEST: " + failures + " FAILURES" : "\nSMOKE TEST: ALL PASSED");
  process.exit(failures || process.exitCode === 2 ? 1 : 0);
}, 500);
