/* TIME DEPARTMENT — analysis tools: scanner, timeline reconstruction, causality */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };

  var PANELS = {};

  /* ================= TEMPORAL SCANNER ================= */
  PANELS.scanner = function (body, caseData, cs, rerender, caseRef) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["TEMPORAL SCANNER \u2014 SIGNATURE READINGS"])]);
    p.appendChild(h("div", { class: "small", style: "margin-bottom:12px" }, ["Select a target and read its signature. Abnormal signatures are filed as scan reports in your EVIDENCE tab \u2014 where they can be pinned, marked and connected like any other exhibit. A scanner reading is evidence, not a verdict."]));

    var legend = h("div", { class: "small", style: "margin-bottom:12px" }, [
      h("span", { class: "badge bg-green" }, ["NORMAL"]), " \u2502 ",
      h("span", { class: "badge bg-amber" }, ["DISPLACED"]), " \u2502 ",
      h("span", { class: "badge bg-teal" }, ["DUPLICATE"]), " \u2502 ",
      h("span", { class: "badge bg-red" }, ["MISSING"]), " \u2502 ",
      h("span", { class: "badge bg-grey" }, ["FRAGMENTED"]), " \u2502 ",
      h("span", { class: "badge bg-amber" }, ["UNKNOWN"])
    ]);
    p.appendChild(legend);

    caseData.scanner.forEach(function (t, i) {
      var done = cs.scans.indexOf(i) !== -1;
      var sigBadge = { normal: "bg-green", displaced: "bg-amber", duplicate: "bg-teal", missing: "bg-red", fragmented: "bg-grey", unknown: "bg-amber" }[t.signature] || "bg-grey";
      var row = h("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--panel-2);border:1px solid var(--line-soft);border-radius:4px;margin-bottom:8px" }, [
        h("span", { class: "mono teal", style: "font-size:12px;min-width:34px" }, ["T-" + (i + 1)]),
        h("div", { style: "flex:1" }, [
          h("div", { style: "font-size:13px" }, [t.target]),
          done ? h("div", { class: "tiny", style: "margin-top:3px" }, [h("span", { class: "badge " + sigBadge }, [t.signature.toUpperCase()]), h("span", { class: "dim" }, [t.note])]) : h("div", { class: "tiny dim", style: "margin-top:3px" }, ["awaiting reading"])
        ]),
        done ? h("button", { class: "btn small ghost", onclick: function () {
          var ev = TD.CASEVIEWS.allEvidence(caseData, cs).filter(function (e) { return e.id === t.yields; })[0];
          if (ev) { TD.AUDIO.openDoc(); TD.CASEVIEWS.openEvidence(caseData, ev, cs); }
        } }, ["OPEN REPORT"]) :
          h("button", { class: "btn small teal", onclick: function () { doScan(i); } }, ["SCAN"])
      ]);
      p.appendChild(row);
    });
    body.appendChild(p);

    function doScan(i) {
      if (cs.scans.indexOf(i) !== -1) return;
      cs.scans.push(i);
      var t = caseData.scanner[i];
      if (t.yields && cs.scanReports.indexOf(t.yields) === -1) cs.scanReports.push(t.yields);
      TD.STATE.save();
      if (t.signature !== "normal") TD.AUDIO.anomaly();
      else TD.AUDIO.click();
      if (t.signature !== "normal") TD.UI.toast("Scanner: " + t.target + " \u2192 " + t.signature.toUpperCase() + ". Report filed to evidence.", t.signature === "missing" ? "red" : "amber");
      else TD.UI.toast("Scanner: " + t.target + " \u2192 NORMAL.");
      TD.CASEVIEWS.render(caseData, "scanner");
    }
  };

  /* ================= TIMELINE RECONSTRUCTION ================= */
  PANELS.timeline = function (body, caseData, cs, rerender, caseRef) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["CHRONOLOGICAL RECONSTRUCTION"])]);
    p.appendChild(h("div", { class: "small", style: "margin-bottom:12px" }, ["Build your proposed sequence: click an event, then click a numbered slot (or use the arrows to reorder). Stamps are colour-coded: CONFIRMED (teal) is instrument-graded, ESTIMATED (amber) is a judgement, WITNESS (violet) is testimony, CONFLICTING (red) means the sources themselves fight. Not every stamp tells the truth \u2014 that is what investigation is for."]));
    body.appendChild(p);

    var layout = h("div", { class: "tl-layout" });
    body.appendChild(layout);

    var placed = cs.timeline ? cs.timeline.slice() : [];
    var pool = h("div", { class: "tl-pool" }, [h("div", { class: "mono tiny dim upper", style: "margin-bottom:4px" }, ["UNPLACED EVENTS"])]);
    var seqWrap = h("div", { class: "tl-seq" }, [h("div", { class: "mono tiny dim upper", style: "margin-bottom:4px" }, ["PROPOSED ORDER \u2014 earliest first"])]);
    var slotWrap = h("div", { class: "tl-seq" });
    seqWrap.appendChild(slotWrap);
    layout.appendChild(pool); layout.appendChild(seqWrap);

    var selected = { id: null };

    function chip(ev) {
      var stampCls = "stamp-" + ev.stampType;
      return h("div", {
        class: "tl-chip" + (selected.id === ev.id ? " dragging" : ""),
        onclick: function (e) {
          e.stopPropagation();
          if (selected.id === ev.id) { selected.id = null; } else { selected.id = ev.id; }
          TD.AUDIO.click();
          draw();
        }
      }, [h("div", null, [ev.label]), h("div", { class: "t" }, [h("span", { class: "stamp " + stampCls }, [ev.stampType.toUpperCase() + " \u00b7 " + ev.stamp])])]);
    }

    function draw() {
      TD.UI.clear(pool);
      TD.UI.clear(slotWrap);
      caseData.timeline.forEach(function (ev) {
        if (placed.indexOf(ev.id) === -1) pool.appendChild(chip(ev));
      });
      if (!pool.querySelector(".tl-chip")) pool.appendChild(h("div", { class: "tiny dim", style: "padding:8px" }, ["all events placed"]));

      for (var i = 0; i < caseData.timeline.length; i++) {
        (function (idx) {
          var slot = h("div", { class: "tl-slot", onclick: function (e) {
            e.stopPropagation();
            if (selected.id && placed.indexOf(selected.id) === -1) {
              if (idx < placed.length) {
                placed[idx] = selected.id;
              } else if (idx === placed.length) {
                placed.push(selected.id);
              }
              selected.id = null; TD.AUDIO.click(); commit(); draw();
            }
          } }, [h("span", { class: "slot-num" }, [String(idx + 1).padStart(2, "0")])]);
          var evId = placed[idx];
          if (evId) {
            var ev = caseData.timeline.filter(function (x) { return x.id === evId; })[0];
            var c = chip(ev);
            c.classList.add("inseq");
            var up = h("span", { class: "mono", style: "float:right;cursor:pointer;color:var(--faint);padding:0 4px", onclick: function (e) { e.stopPropagation(); if (idx > 0) { var tmp = placed[idx - 1]; placed[idx - 1] = placed[idx]; placed[idx] = tmp; TD.AUDIO.click(); commit(); draw(); } } }, ["\u2191"]);
            var dn = h("span", { class: "mono", style: "float:right;cursor:pointer;color:var(--faint);padding:0 4px", onclick: function (e) { e.stopPropagation(); if (idx < placed.length - 1) { var tmp = placed[idx + 1]; placed[idx + 1] = placed[idx]; placed[idx] = tmp; TD.AUDIO.click(); commit(); draw(); } } }, ["\u2193"]);
            var rm = h("span", { class: "mono", style: "float:right;cursor:pointer;color:var(--faint);padding:0 4px", onclick: function (e) { e.stopPropagation(); placed.splice(idx, 1); TD.AUDIO.click(); commit(); draw(); } }, ["\u00d7"]);
            c.appendChild(rm); c.appendChild(dn); c.appendChild(up);
            slot.appendChild(c);
          }
          slotWrap.appendChild(slot);
        })(i);
      }
    }
    function commit() { cs.timeline = placed.slice(); TD.STATE.save(); }

    draw();

    var verdict = h("div", { class: "tl-verdict" }, [
      h("button", { class: "btn small teal", style: "margin-right:10px", onclick: function () {
        placed = caseData.timeline.map(function (e) { return e.id; });
        commit(); draw(); TD.AUDIO.click();
      } }, ["AUTO-FILL TIMESTAMPS"]),
      h("button", { class: "btn small ghost", onclick: function () {
        placed = []; selected.id = null; commit(); draw(); TD.AUDIO.click();
      } }, ["CLEAR"]),
      h("span", { class: "small", style: "margin-left:12px" }, ["The auto-fill follows printed stamps and will be wrong wherever the stamps are. Four of the stamps in this case lie, shrink, or describe someone's breakfast."])
    ]);
    p.appendChild(verdict);
  };

  /* ================= CAUSALITY ANALYSIS ================= */
  PANELS.causality = function (body, caseData, cs, rerender, caseRef) {
    var p = h("div", { class: "panel" }, [h("h3", null, ["CAUSALITY ANALYSIS \u2014 RELATION BUILDER"])]);
    p.appendChild(h("div", { class: "small", style: "margin-bottom:12px", html: "Propose relationships between events. Relation meanings: <b class='teal'>CAUSES</b> \u2014 A brings B about. <b class='teal'>RESULTS FROM</b> \u2014 A is the consequence of B. <b class='amber'>CONTRADICTS</b> \u2014 A and B cannot both be true as stated. <b>SUPPORTS</b> \u2014 A corroborates B. PRECEDES / FOLLOWS \u2014 pure ordering. POSSIBLY RELATED / UNKNOWN \u2014 speculative. <span class='dim'>The engine validates your web only when the report is filed \u2014 wrong links cost accuracy, so build with intent.</span>" }));
    body.appendChild(p);

    var evs = caseData.timeline;
    function opt(v, label) { var o = document.createElement("option"); o.value = v; o.textContent = label; return o; }
    var selA = h("select");
    var selB = h("select");
    var selR = h("select");
    evs.forEach(function (e, i) { selA.appendChild(opt(e.id, (i + 1) + ". " + e.label.slice(0, 42) + "\u2026")); selB.appendChild(opt(e.id, (i + 1) + ". " + e.label.slice(0, 42) + "\u2026")); });
    TD.RELATIONS.forEach(function (r) { selR.appendChild(opt(r, TD.RELATION_LABELS[r])); });
    selA.selectedIndex = 0; selB.selectedIndex = evs.length > 1 ? 1 : 0;

    var addBtn = h("button", { class: "btn small teal", onclick: addLink }, ["ADD LINK"]);
    p.appendChild(h("div", { class: "caus-form" }, [selA, selR, selB, addBtn]));

    var listEl = h("div", { class: "caus-list" });
    p.appendChild(listEl);
    var countEl = h("div", { class: "caus-hintscore" });
    p.appendChild(countEl);

    function draw() {
      TD.UI.clear(listEl);
      cs.causality.forEach(function (l, i) {
        var a = evs.filter(function (e) { return e.id === l.from; })[0];
        var b = evs.filter(function (e) { return e.id === l.to; })[0];
        listEl.appendChild(h("div", null, [
          h("span", { style: "color:var(--dim)" }, [(i + 1) + ". "]),
          a ? a.label : l.from,
          h("span", { class: "rel" }, [" \u2014 " + (TD.RELATION_LABELS[l.rel] || "?") + " \u2192 "]),
          b ? b.label : l.to,
          h("span", { class: "cx", title: "remove", onclick: function () { cs.causality.splice(i, 1); TD.STATE.save(); TD.AUDIO.click(); draw(); } }, ["\u00d7"])
        ]));
      });
      countEl.textContent = cs.causality.length + " causal connection(s) proposed. " + (cs.causality.length ? "They will be validated only against the final report." : "An unlinked timeline is a list, not a reconstruction.");
    }
    function addLink() {
      if (selA.value === selB.value) { TD.UI.toast("An event cannot cause itself. The Department tried.", "amber"); return; }
      var dup = cs.causality.filter(function (l) { return l.from === selA.value && l.to === selB.value; }).length;
      if (dup) { TD.UI.toast("That link already exists."); return; }
      cs.causality.push({ from: selA.value, to: selB.value, rel: selR.value });
      TD.STATE.save();
      TD.AUDIO.click();
      draw();
    }
    draw();
  };

  TD.PANELS = PANELS;
})(typeof window !== "undefined" ? window : globalThis);
