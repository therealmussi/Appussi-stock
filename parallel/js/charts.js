/* PARALLEL — grafici canvas minimi, senza dipendenze: linee (anche baseline tratteggiata) e barre */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});

  function prep(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 260;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function niceScale(minV, maxV) {
    if (Math.abs(maxV - minV) < 1e-9) { minV -= 1; maxV += 1; }
    const span = maxV - minV;
    const raw = span / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm >= 5 ? 10 : norm >= 2.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
    return { min: Math.floor(minV / step) * step, max: Math.ceil(maxV / step) * step, step: step };
  }

  PAR.Charts = {
    line(canvas, cfg) {
      const { ctx, w, h } = prep(canvas);
      ctx.clearRect(0, 0, w, h);
      const padL = 46, padR = 10, padT = 18, padB = 26;
      const series = cfg.series || [];
      let xs = [], ys = [];
      series.forEach(s => s.data.forEach(p => { xs.push(p[0]); ys.push(p[1]); }));
      if (!xs.length) { ctx.fillStyle = '#8a8577'; ctx.fillText('nessun dato', padL + 10, 40); return; }
      const xMin = cfg.xMin !== undefined ? cfg.xMin : Math.min.apply(null, xs);
      const xMax = cfg.xMax !== undefined ? cfg.xMax : Math.max.apply(null, xs);
      let yMin = cfg.yMin !== undefined ? cfg.yMin : Math.min.apply(null, ys);
      let yMax = cfg.yMax !== undefined ? cfg.yMax : Math.max.apply(null, ys);
      if (cfg.zeroBase && yMin > 0) yMin = 0;
      const sc = niceScale(yMin, yMax);
      yMin = sc.min; yMax = sc.max;

      const X = x => padL + (x - xMin) / Math.max(1e-9, xMax - xMin) * (w - padL - padR);
      const Y = y => padT + (1 - (y - yMin) / Math.max(1e-9, yMax - yMin)) * (h - padT - padB);

      ctx.strokeStyle = '#d8d3c4'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let v = yMin; v <= yMax + 1e-9; v += sc.step) { ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); }
      ctx.stroke();

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#8a8577'; ctx.textAlign = 'right';
      for (let v = yMin; v <= yMax + 1e-9; v += sc.step) ctx.fillText(fmtTick(v), padL - 5, Y(v) + 3);

      // linea dell'anno corrente
      if (cfg.yearMark !== undefined) {
        ctx.strokeStyle = '#b5ad99'; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(X(cfg.yearMark), padT); ctx.lineTo(X(cfg.yearMark), h - padB); ctx.stroke();
        ctx.setLineDash([]);
      }

      series.forEach(s => {
        if (!s.data.length) return;
        ctx.strokeStyle = s.color || '#4a5d6b';
        ctx.lineWidth = s.width || 2;
        ctx.setLineDash(s.dash ? [5, 4] : []);
        ctx.beginPath();
        s.data.forEach((p, i) => { if (i === 0) ctx.moveTo(X(p[0]), Y(p[1])); else ctx.lineTo(X(p[0]), Y(p[1])); });
        if (s.fill) {
          ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(yMin));
          ctx.lineTo(X(s.data[0][0]), Y(yMin));
          ctx.closePath();
          ctx.fillStyle = (s.color || '#4a5d6b') + '18';
          ctx.fill();
          ctx.beginPath();
          s.data.forEach((p, i) => { if (i === 0) ctx.moveTo(X(p[0]), Y(p[1])); else ctx.lineTo(X(p[0]), Y(p[1])); });
        }
        ctx.stroke();
        ctx.setLineDash([]);
        if (s.dot && s.data.length) {
          const p = s.data[s.data.length - 1];
          ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3, 0, Math.PI * 2);
          ctx.fillStyle = s.color || '#4a5d6b'; ctx.fill();
        }
      });

      // etichette anni
      ctx.fillStyle = '#8a8577'; ctx.textAlign = 'center';
      const stepY = Math.max(1, Math.round((xMax - xMin) / 6 / 5) * 5);
      for (let yr = Math.ceil(xMin / stepY) * stepY; yr <= xMax; yr += stepY) ctx.fillText('’' + String(yr % 100).padStart(2, '0'), X(yr), h - 8);

      // legenda
      if (cfg.legend && series.length) {
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        let lx = padL + 6, ly = padT - 6;
        series.forEach(s => {
          if (!s.label) return;
          ctx.fillStyle = s.color || '#4a5d6b';
          ctx.fillRect(lx, ly - 7, 14, 3);
          ctx.fillStyle = '#5a564b';
          const txt = s.label + (s.dash ? ' (storico)' : '');
          ctx.fillText(txt, lx + 18, ly - 2);
          lx += ctx.measureText(txt).width + 34;
        });
      }
    },

    bars(canvas, cfg) {
      const { ctx, w, h } = prep(canvas);
      ctx.clearRect(0, 0, w, h);
      const padL = 8, padR = 8, padT = 16, padB = 20;
      const labels = cfg.labels || [], values = cfg.values || [];
      const maxV = cfg.max || Math.max(10, Math.max.apply(null, values.map(v => Math.max(0, v))));
      const minV = cfg.min || Math.min(0, Math.min.apply(null, values));
      const bw = (w - padL - padR) / Math.max(1, values.length);
      const zeroY = padT + (1 - (0 - minV) / Math.max(1e-9, maxV - minV)) * (h - padT - padB);
      values.forEach((v, i) => {
        const y0 = v >= 0 ? zeroY : padT + (1 - (0 - minV) / Math.max(1e-9, maxV - minV)) * (h - padT - padB);
        const y1 = padT + (1 - (v - minV) / Math.max(1e-9, maxV - minV)) * (h - padT - padB);
        ctx.fillStyle = cfg.colors ? cfg.colors[i] : (v >= 0 ? '#7a9a7e' : '#c07058');
        ctx.fillRect(padL + i * bw + bw * 0.15, Math.min(y0, y1), bw * 0.7, Math.max(2, Math.abs(y1 - y0)));
        if (cfg.showValues && values.length <= 9) {
          ctx.font = '10px sans-serif'; ctx.fillStyle = '#5a564b'; ctx.textAlign = 'center';
          ctx.fillText(String(Math.round(v)), padL + i * bw + bw / 2, Math.min(y0, y1) - 4);
        }
        if (labels[i]) {
          ctx.font = '10px sans-serif'; ctx.fillStyle = '#5a564b'; ctx.textAlign = 'center';
          ctx.fillText(labels[i], padL + i * bw + bw / 2, h - 6);
        }
      });
      ctx.strokeStyle = '#d8d3c4';
      ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(w - padR, zeroY); ctx.stroke();
    }
  };

  function fmtTick(v) {
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
    if (Math.abs(v) >= 10 || Number.isInteger(v)) return String(Math.round(v));
    return v.toFixed(2);
  }
})();
