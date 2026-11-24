/* TIME DEPARTMENT — investigation board: draggable cards + relationship lines */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var h = function (t, a, c) { return TD.UI.h(t, a, c); };
  function renderBoard(body, caseData, cs, rerender, caseRef) {
    var toolbar = h("div", { class: "board-toolbar" });
    var addSel = h("select", { style: "width:auto;min-width:220px" });
    var evidence = TD.CASEVIEWS.allEvidence(caseData, cs);
    evidence.forEach(function (e, i) { var o = document.createElement("option"); o.value = e.id; o.textContent = e.id.toUpperCase() + " \u00b7 " + e.name; addSel.appendChild(o); });
    var addBtn = h("button", { class: "btn small teal", onclick: function () {
      var id = addSel.value;
      if (cs.board.cards.filter(function (cd) { return cd.id === id; }).length) { TD.UI.toast("Exhibit already on the board."); return; }
      cs.board.cards.push({ id: id, kind: "evidence", x: 40 + (cs.board.cards.length % 4) * 210, y: 30 + Math.floor(cs.board.cards.length / 4) * 120 });
      TD.STATE.save(); TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "board");
    } }, ["PIN EVIDENCE"]);
    var noteBtn = h("button", { class: "btn small", onclick: function () {
      cs.board.cards.push({ id: "n" + Date.now(), kind: "note", x: 60 + Math.random() * 300, y: 60 + Math.random() * 200, text: "" });
      TD.STATE.save(); TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "board");
    } }, ["ADD NOTE"]);
    var rmLinkBtn = h("button", { class: "btn small ghost", style: "display:none", onclick: function () {
      cs.board.links.splice(selectedLink, 1); selectedLink = null; TD.STATE.save(); TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "board");
    } }, ["REMOVE SELECTED LINK"]);
    var counter = h("span", { class: "board-counter" }, [cs.board.cards.length + " cards \u00b7 " + cs.board.links.length + " relations"]);
    toolbar.appendChild(addSel); toolbar.appendChild(addBtn); toolbar.appendChild(noteBtn); toolbar.appendChild(rmLinkBtn); toolbar.appendChild(counter);
    body.appendChild(toolbar);

    var wrap = h("div", { class: "board-wrap", ondblclick: function (e) {
      if (e.target !== wrap) return;
      cs.board.cards.push({ id: "n" + Date.now(), kind: "note", x: e.offsetX, y: e.offsetY, text: "" });
      TD.STATE.save(); TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "board");
    } });
    body.appendChild(wrap);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "board-svg");
    wrap.appendChild(svg);
    wrap.appendChild(h("div", { class: "board-empty" }, [cs.board.cards.length ? "" : "PIN EVIDENCE FROM THE PANEL ABOVE \u2014 OR DOUBLE-CLICK THE BOARD TO LEAVE A NOTE"]));

    var linking = null; /* card id starting a link */
    var selectedLink = null;
    var rmLinkBtn2 = rmLinkBtn;

    function evById(id) { return evidence.filter(function (e) { return e.id === id; })[0]; }
    function cardById(id) { return cs.board.cards.filter(function (c) { return c.id === id; })[0]; }

    /* draw links first (under cards) */
    function drawLinks() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      cs.board.links.forEach(function (l, i) {
        var a = cardById(l.a), b = cardById(l.b);
        if (!a || !b) return;
        var x1 = a.x + 95, y1 = a.y + 30, x2 = b.x + 95, y2 = b.y + 30;
        var p = document.createElementNS(svgNS(), "path");
        p.setAttribute("d", "M" + x1 + "," + y1 + " C" + x1 + "," + (y1 + 60) + " " + x2 + "," + (y2 - 60) + " " + x2 + "," + y2);
        p.setAttribute("class", "rel-" + l.rel + (selectedLink === i ? " selected" : ""));
        p.setAttribute("stroke-opacity", selectedLink === i ? "1" : "0.75");
        p.style.strokeWidth = selectedLink === i ? "3.5" : "2";
        p.addEventListener("click", function (e) { e.stopPropagation(); selectedLink = (selectedLink === i ? null : i); rmLinkBtn2.style.display = selectedLink !== null ? "inline-block" : "none"; drawLinks(); });
        svg.appendChild(p);
        var t = document.createElementNS(svgNS(), "text");
        t.setAttribute("x", (x1 + x2) / 2); t.setAttribute("y", (y1 + y2) / 2 - 4); t.setAttribute("text-anchor", "middle");
        t.textContent = TD.RELATION_LABELS[l.rel] || l.rel;
        t.addEventListener("click", function (e) { e.stopPropagation(); selectedLink = (selectedLink === i ? null : i); rmLinkBtn2.style.display = selectedLink !== null ? "inline-block" : "none"; drawLinks(); });
        svg.appendChild(t);
      });
    }
    function svgNS() { return "http://www.w3.org/2000/svg"; }

    function drawCards() {
      [].slice.call(wrap.querySelectorAll(".bcard")).forEach(function (n) { n.remove(); });
      cs.board.cards.forEach(function (card) {
        var isNote = card.kind === "note";
        var ev = isNote ? null : (cardById(card.id) && evById(card.id));
        if (!isNote && !ev && cardById(card.id) && card.id) { /* pin before scan generation */ ev = cardById(card.id); ev = ev ? { name: card.id.toUpperCase(), summary: "exhibit" } : ev; }
        var c = h("div", { class: "bcard" + (isNote ? " bnote" : "") + (linking === card.id ? " linking" : ""), style: "left:" + card.x + "px;top:" + card.y + "px" }, [
          h("span", { class: "bx", title: "remove", onclick: function (e) { e.stopPropagation(); cs.board.cards = cs.board.cards.filter(function (x) { return x.id !== card.id; }); cs.board.links = cs.board.links.filter(function (l) { return l.a !== card.id && l.b !== card.id; }); TD.STATE.save(); TD.AUDIO.click(); TD.SCREENS.go("case", caseData, "board"); } }, ["\u00d7"]),
          h("span", { class: "bp", title: "connect\u2026", onclick: function (e) { e.stopPropagation(); e.preventDefault(); startLink(card.id); } }, ["\u27f3"]),
          isNote ? h("div", null, [h("textarea", {
            value: card.text || "", placeholder: "note\u2026", style: "min-height:44px;font-size:12px",
            oninput: function (ev2) { card.text = ev2.target.value; TD.STATE.save(); }
          })]) : h("div", null, [h("div", { class: "bn", onclick: function (e) { if (evById(card.id)) { e.stopPropagation(); var evFull = evById(card.id); TD.AUDIO.openDoc(); TD.CASEVIEWS.openEvidence(caseData, evFull, cs); } } }, [evFullName(card)]), h("div", { class: "bs" }, [evSummary(card)])])
        ]);
        makeDraggable(c, card);
        c.addEventListener("click", function (e) {
          if (linking && linking !== card.id) {
            var dup = cs.board.links.filter(function (l) { return (l.a === linking && l.b === card.id); }).length;
            if (!dup) openRelMenu(e.clientX, e.clientY, { a: linking, b: card.id });
            linking = null; TD.SCREENS.go("case", caseData, "board");
          }
        });
        wrap.appendChild(c);
      });
    }
    function evFullName(card) {
      var ev = evById(card.id);
      return ev ? ev.name : (card.id || "").toUpperCase();
    }
    function evSummary(card) {
      var ev = evById(card.id);
      return ev ? ev.summary : "";
    }
    function startLink(id) {
      linking = id; TD.AUDIO.click();
      TD.UI.toast("Connection started \u2014 now click the target card.", "amber");
    }
    function openRelMenu(cx, cy, pair) {
      var menu = h("div", { class: "connect-menu" });
      TD.RELATIONS.forEach(function (r) {
        menu.appendChild(h("button", { onclick: function () {
          cs.board.links.push({ a: pair.a, b: pair.b, rel: r });
          TD.STATE.save(); TD.AUDIO.click(); menu.remove();
          TD.SCREENS.go("case", caseData, "board");
        } }, [(TD.RELATION_LABELS[r])]));
      });
      document.body.appendChild(menu);
      var r = wrap.getBoundingClientRect();
      menu.style.left = Math.min(cx - r.left + window.scrollX, r.width - 190) + "px";
      menu.style.top = (cy - r.top + window.scrollY) + "px";
      setTimeout(function () {
        document.addEventListener("mousedown", function closeIt(e) { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("mousedown", closeIt); } });
      }, 10);
    }
    function makeDraggable(node, card) {
      var sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
      node.addEventListener("pointerdown", function (e) {
        if (e.target.tagName === "TEXTAREA" || e.target.classList.contains("bx") || e.target.classList.contains("bp")) return;
        dragging = true; sx = e.clientX; sy = e.clientY; ox = card.x; oy = card.y;
        node.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      node.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        card.x = Math.max(0, Math.min(wrap.clientWidth - 190, ox + e.clientX - sx));
        card.y = Math.max(0, Math.min(wrap.clientHeight - 60, oy + e.clientY - sy));
        node.style.left = card.x + "px"; node.style.top = card.y + "px";
        drawLinks();
      });
      node.addEventListener("pointerup", function () { if (dragging) { dragging = false; TD.STATE.save(); } });
    }

    drawLinks();
    drawCards();
  }

  TD.PANELS = TD.PANELS || {};
  TD.PANELS.board = renderBoard;
})(typeof window !== "undefined" ? window : globalThis);
