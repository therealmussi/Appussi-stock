'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const CH = E.Charts = {};

  function prep(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  function niceMax(v) {
    if (v <= 0) return 10;
    const pow = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
      if (m * pow >= v) return m * pow;
    }
    return 10 * pow;
  }

  /* linee multiple: series = [{label, color, data:[{x,value}|n]}] oppure data arrays allineati a xLabels */
  CH.line = function (canvas, series, opts) {
    opts = opts || {};
    const { ctx, w, h } = prep(canvas);
    const padL = 48, padR = 12, padT = 16, padB = 26;
    const iw = w - padL - padR, ih = h - padT - padB;
    if (iw <= 10 || ih <= 10 || !series.length) return;
    const xLabels = opts.xLabels || [];
    const n = Math.max.apply(null, series.map(s => s.data.length).concat([xLabels.length, 2]));

    let min = opts.min != null ? opts.min : Infinity;
    let max = opts.max != null ? opts.max : -Infinity;
    if (opts.max == null) {
      for (const s of series) for (const v of s.data) if (v != null && isFinite(v) && v > max) max = v;
      for (const s of series) for (const v of s.data) if (v != null && isFinite(v) && v < min) min = v;
      if (!isFinite(min)) { min = 0; max = 10; }
      if (max === min) { max = min + 1; }
      if (min > 0 && min < max * 0.6) min = 0;
      max = niceMax(max * 1.05);
    }
    const X = i => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
    const Y = v => padT + ih - ((v - min) / (max - min)) * ih;

    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#8a7f72';
    ctx.strokeStyle = '#e7dfd2';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const v = min + ((max - min) * g) / 4;
      const y = Math.round(Y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.abs(v) >= 10000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v * 10) / 10, padL - 6, y);
    }
    if (xLabels.length) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const step = Math.ceil(xLabels.length / Math.max(2, Math.floor(iw / 46)));
      for (let i = 0; i < xLabels.length; i++) {
        if (i % step !== 0 && i !== xLabels.length - 1) continue;
        ctx.fillText(xLabels[i], X(i), padT + ih + 6);
      }
    }
    for (const s of series) {
      ctx.strokeStyle = s.color || '#c96f5a';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < s.data.length; i++) {
        const v = s.data[i];
        if (v == null || !isFinite(v)) { started = false; continue; }
        const x = X(i), y = Y(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    /* legenda */
    let lx = padL + 4;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (const s of series) {
      ctx.fillStyle = s.color || '#c96f5a';
      ctx.fillRect(lx, padT + 2, 9, 4);
      ctx.fillStyle = '#5a5348';
      const label = s.label != null ? String(s.label) : '';
      ctx.fillText(label, lx + 13, padT);
      lx += 20 + ctx.measureText(label).width;
    }
  };

  /* barre verticali con etichette */
  CH.bars = function (canvas, labels, values, opts) {
    opts = opts || {};
    const { ctx, w, h } = prep(canvas);
    const padL = 44, padR = 10, padT = 18, padB = 26;
    const iw = w - padL - padR, ih = h - padT - padB;
    if (iw <= 10 || ih <= 10 || !values.length) return;
    const max = opts.max != null ? opts.max : niceMax(Math.max.apply(null, values.map(v => isFinite(v) ? v : 0)) || 10);
    const col = iw / values.length;
    const colW = Math.min(col * 0.72, col - 3);
    const Y = v => padT + ih - (v / max) * ih;
    ctx.font = '10px system-ui, sans-serif';
    ctx.strokeStyle = '#e7dfd2'; ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const v = (max * g) / 4;
      const y = Math.round(Y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#8a7f72'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.abs(v) >= 10000 ? (v / 1000).toFixed(0) + 'k' : String(Math.round(v * 10) / 10), padL - 6, y);
    }
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (!isFinite(v)) continue;
      const x = padL + i * col + (col - colW) / 2;
      const y = Y(Math.max(0, v));
      ctx.fillStyle = opts.color || '#c96f5a';
      ctx.fillRect(x, y, Math.max(1, colW), padT + ih - y);
      if (labels && labels[i]) {
        ctx.fillStyle = '#8a7f72';
        if (values.length > 12) {
          ctx.save();
          ctx.translate(padL + i * col + col / 2, padT + ih + 4);
          ctx.rotate(-Math.PI / 5);
          ctx.textAlign = 'right'; ctx.textBaseline = 'top';
          ctx.fillText(String(labels[i]), 0, 0);
          ctx.restore();
        } else {
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(String(labels[i]), padL + i * col + col / 2, padT + ih + 4);
        }
      }
    }
  };

  /* istogramma da distribuzione (label verticale sempre) */
  CH.donut = function (canvas, pairs) {
    const { ctx, w, h } = prep(canvas);
    const total = pairs.reduce((s, p) => s + p.v, 0);
    if (!total) return;
    const cx = Math.min(w, h) / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8;
    let a0 = -Math.PI / 2, lx = 14, ly = 12;
    ctx.font = '10px system-ui, sans-serif';
    for (const p of pairs) {
      if (!p.v) continue;
      const a1 = a0 + (p.v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
      ctx.fillStyle = p.color; ctx.fill();
      ctx.fillStyle = '#5a5348'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(p.label + ' · ' + p.v, lx, ly); ly += 14;
      a0 = a1;
    }
  };
})(window.EHL);
