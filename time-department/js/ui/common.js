/* TIME DEPARTMENT — UI helpers */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c == null) return; el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function $(sel) { return document.querySelector(sel); }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  var toastRoot = null;
  function toast(msg, kind) {
    if (!toastRoot) { toastRoot = document.createElement("div"); toastRoot.id = "toast-root"; document.body.appendChild(toastRoot); }
    var t = h("div", { class: "toast" + (kind ? " " + kind : "") }, [msg]);
    toastRoot.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity 0.4s"; setTimeout(function () { t.remove(); }, 420); }, 3800);
  }

  var openModalEl = null;
  function openModal(contentEl, opts) {
    closeModal();
    var back = h("div", { class: "modal-backdrop" });
    var m = h("div", { class: "modal" + (opts && opts.wide ? " wide" : "") });
    var x = h("button", { class: "mclose", "aria-label": "Close", onclick: closeModal }, ["\u00d7"]);
    m.appendChild(x);
    if (opts && opts.title) m.appendChild(h("div", { class: "mono tiny dim upper", style: "margin-bottom:8px" }, [opts.title]));
    m.appendChild(contentEl);
    back.appendChild(m);
    back.addEventListener("mousedown", function (e) { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
    openModalEl = back;
    document.addEventListener("keydown", escClose);
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    if (openModalEl) { openModalEl.remove(); openModalEl = null; document.removeEventListener("keydown", escClose); }
  }

  /* clock in the topbar: real time + department date */
  var clockTimer = null;
  function deptDate(state) {
    var base = new Date(TD.META.deptEpoch.y, TD.META.deptEpoch.m - 1, TD.META.deptEpoch.d);
    base.setDate(base.getDate() + (state.deptDay || 0));
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return base.getDate() + " " + months[base.getMonth()] + " " + base.getFullYear();
  }
  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    var f = function () {
      var el = document.getElementById("td-clock");
      if (!el) return;
      var s = TD.STATE.get();
      var d = new Date();
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      el.innerHTML = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) +
        "<small>" + deptDate(s) + " \u00b7 LIVE</small>";
    };
    f();
    clockTimer = setInterval(f, 1000);
  }

  /* crest svg: institutional seal */
  function crest() {
    var wrap = h("div", { "class": "crest" });
    wrap.innerHTML =
      '<svg viewBox="0 0 40 40" width="34" height="34" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="16.5" fill="none" stroke="#d9a441" stroke-width="2"/>' +
      '<circle cx="20" cy="20" r="12" fill="none" stroke="#4fa08b" stroke-width="1" opacity="0.7"/>' +
      '<circle cx="20" cy="20" r="2.4" fill="#d9a441"/>' +
      '<line x1="20" y1="4" x2="20" y2="11" stroke="#d9a441" stroke-width="2"/>' +
      '<line x1="20" y1="29" x2="20" y2="36" stroke="#d9a441" stroke-width="2"/>' +
      '<line x1="4" y1="20" x2="11" y2="20" stroke="#4fa08b" stroke-width="1.4" opacity="0.8"/>' +
      '<line x1="29" y1="20" x2="36" y2="20" stroke="#4fa08b" stroke-width="1.4" opacity="0.8"/>' +
      '</svg>';
    return wrap;
  }

  /* classified lock check */
  function classifiedUnlocked(f, state) {
    if (f.reqCase) return TD.STATE.isComplete(TD.CASES[f.reqCase - 1].id);
    if (f.reqJanus) return state.janus >= f.reqJanus;
    return true;
  }

  TD.UI = {
    h: h, $: $, clear: clear, toast: toast, openModal: openModal, closeModal: closeModal,
    startClock: startClock, deptDate: deptDate, crest: crest, classifiedUnlocked: classifiedUnlocked
  };
})(typeof window !== "undefined" ? window : globalThis);
