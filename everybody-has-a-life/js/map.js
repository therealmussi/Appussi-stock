'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const MAP = E.Map = {};
  const D = E.Core, DATA = E.DATA, P = E.People;

  const TYPE_COLORS = {
    casa: '#d8b98a', negozio: '#c98a3a', ristorante: '#b8574a', ufficio: '#8fa3b8',
    fabbrica: '#8a7f92', scuola: '#d4a44c', universita: '#6a93c3', clinica: '#e0e6e4',
    stazione: '#7a6a58', parco: '#7fb069', bar: '#a86f4a', biblioteca: '#b0895a',
    campo: '#8fbf7a', chiesa: '#c9c3b0', mercato: '#c9a86b', giornale: '#9a9a8a',
    banca: '#a8b8a0', hotel: '#baa0c0', laboratorio: '#88a8a8', officina: '#9a8a6a',
    magazzino: '#a09a88', administrative: '#b0a088', piazza: '#d9cfae', centro: '#c96f5a'
  };

  function M(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 0.8; this.tx = 40; this.ty = 30;
    this.minS = 0.35; this.maxS = 3.2;
    this.drag = null; this.hoverB = null;
    this.getState = null; this.onPickBuilding = null; this.onPickCitizen = null;
    this._frame = 0;
    this._bind(canvas);
  }

  MAP.init = function (canvas, opts) {
    opts = opts || {};
    const m = new M(canvas);
    m.getState = opts.getState;
    m.onPickBuilding = opts.onPickBuilding || null;
    m.onPickCitizen = opts.onPickCitizen || null;
    m.resize();
    (function loop() {
      requestAnimationFrame(loop);
      if (!m.canvas.isConnected) return;
      m.frame();
    })();
    return m;
  };

  MAP.homeView = function (m) {
    const cw = m.canvas.clientWidth, ch = m.canvas.clientHeight;
    m.scale = Math.min(cw / (DATA.W + 80), ch / (DATA.H + 80));
    m.tx = (cw - DATA.W * m.scale) / 2; m.ty = (ch - DATA.H * m.scale) / 2;
  };

  MAP.follow = function (m, xy) { m.follow = xy; };

  M.prototype.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || 800, h = this.canvas.clientHeight || 500;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr; this.vw = w; this.vh = h;
  };
  M.prototype.toWorld = function (px, py) {
    return { x: (px - this.tx) / this.scale, y: (py - this.ty) / this.scale };
  };
  M.prototype.zoomAt = function (px, py, factor) {
    const ns = D.clamp(this.scale * factor, this.minS, this.maxS);
    this.tx = px - (px - this.tx) * (ns / this.scale);
    this.ty = py - (py - this.ty) * (ns / this.scale);
    this.scale = ns;
  };

  M.prototype._bind = function (canvas) {
    const self = this;
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      self.zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15);
      self.follow = null;
    }, { passive: false });
    canvas.addEventListener('mousedown', function (e) {
      const r = canvas.getBoundingClientRect();
      self.drag = { x0: e.clientX - r.left, y0: e.clientY - r.top, tx: self.tx, ty: self.ty, moved: false };
    });
    window.addEventListener('mousemove', function (e) {
      if (self.drag) {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (Math.abs(x - self.drag.x0) + Math.abs(y - self.drag.y0) > 4) self.drag.moved = true;
        self.tx = self.drag.tx + (x - self.drag.x0);
        self.ty = self.drag.ty + (y - self.drag.y0);
        self.follow = null;
      }
    });
    window.addEventListener('mouseup', function () { self.drag = null; });
    canvas.addEventListener('click', function (e) {
      if (self.drag && self.drag.moved) return;
      const r = canvas.getBoundingClientRect();
      const w = self.toWorld(e.clientX - r.left, e.clientY - r.top);
      const S = self.getState(); if (!S) return;
      let hitCit = null;
      for (const c of aliveLocal(S)) {
        const q = self.loc(S, c); if (!q) continue;
        if (Math.hypot(q.x - w.x, q.y - w.y) < 7 / self.scale + 2) { hitCit = c; break; }
      }
      if (hitCit) { if (self.onPickCitizen) self.onPickCitizen(hitCit.id); return; }
      let hitB = null;
      for (const b of S.buildings) {
        if (b.business && b.business.closed) continue;
        if (w.x >= b.x - 2 && w.x <= b.x + b.w + 2 && w.y >= b.y - 2 && w.y <= b.y + b.h + 2) { hitB = b; break; }
      }
      if (hitB && self.onPickBuilding) self.onPickBuilding(hitB.id);
    });
  };

  MAP.zoom = function (m, factor) { m.zoomAt(m.vw / 2, m.vh / 2, factor); };

  function aliveLocal(S) {
    return S._mapCache && S._mapCacheDay === S.dayIndex ? S._mapCache : (S._mapCache = Object.values(S.citizens).filter(c => c.alive && !c.abroad && S.buildingsById[c.homeId]), S._mapCacheDay = S.dayIndex, S._mapCache);
  }

  M.prototype.loc = function (S, c) {
    const home = S.buildingsById[c.homeId];
    if (!home) return null;
    const w = EN_(S).whereIs(S, c, S.minutes);
    const from = S.buildingsById[w.b], to = S.buildingsById[w.to != null ? w.to : w.b];
    const a = from || to || home, z = to || from || home;
    if (!a || !z) return { x: home.x + home.w / 2, y: home.y + home.h / 2 };
    return { x: D.lerp(a.x + a.w / 2, z.x + z.w / 2, w.t || 0), y: D.lerp(a.y + a.h / 2, z.y + z.h / 2, w.t || 0) };
  };
  function EN_(S) { return E.Engine; }

  M.prototype.frame = function () {
    const S = this.getState ? this.getState() : null;
    if (!S) return;
    if (this.vw !== this.canvas.clientWidth || this.vh !== this.canvas.clientHeight) this.resize();
    if (this.followId !== E.state.followId) this.followId = E.state.followId;
    const ctx = this.ctx, dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, S, this);
  };

  function draw(ctx, S, m) {
    const date = D.dateFromMinutes(S.minutes);
    const nightF = nightFactor(date.hour + date.minute / 60);
    const season = date.season;
    const w = EN_(S).weather(S, date.dayIndex);

    /* sfondo stagionale */
    const bg = season === 'Estate' ? '#e8e0c8' : season === 'Inverno' ? '#e6e6ea' : season === 'Autunno' ? '#e8ddd0' : '#e2e8d8';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, m.vw, m.vh);

    ctx.save();
    ctx.translate(m.tx, m.ty); ctx.scale(m.scale, m.scale);

    /* quartieri */
    for (const h of DATA.NEIGHBORHOODS) {
      ctx.fillStyle = h.tone; ctx.globalAlpha = 0.30;
      ctx.fillRect(h.rect.x, h.rect.y, h.rect.w, h.rect.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(90,80,60,.18)'; ctx.setLineDash([6, 5]);
      ctx.strokeRect(h.rect.x, h.rect.y, h.rect.w, h.rect.h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(70,60,45,.55)';
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.fillText(h.name.toUpperCase(), h.rect.x + 12, h.rect.y + 18);
    }

    /* fiume */
    ctx.beginPath();
    ctx.moveTo(DATA.RIVER[0].x, DATA.RIVER[0].y);
    for (const p of DATA.RIVER.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#79a8c9'; ctx.lineWidth = 26; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 4; ctx.stroke();

    /* strade */
    ctx.strokeStyle = '#c8bfa8'; ctx.lineWidth = 14;
    for (const r of DATA.ROADS) {
      ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.stroke();
    }

    /* edifici */
    const vx0 = -m.tx / m.scale, vy0 = -m.ty / m.scale, vw = m.vw / m.scale, vh = m.vh / m.scale;
    m.hoverB = null;
    for (const b of S.buildings) {
      if (b.x + b.w < vx0 - 30 || b.x > vx0 + vw + 30 || b.y + b.h < vy0 - 30 || b.y > vy0 + vh) continue;
      const closed = b.business && b.business.closed;
      let col = TYPE_COLORS[b.type] || '#c8b590';
      if (nightF > 0) col = tint(col, nightF * 0.45);
      if (closed) col = '#b5aca4';
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = 'rgba(60,50,35,1)';
      ctx.fillRect(b.x + 4, b.y + 5, b.w, b.h);
      ctx.globalAlpha = closed ? 0.55 : 1;
      ctx.fillStyle = col;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = 'rgba(70,55,35,.5)'; ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      if (b.type === 'parco' || b.type === 'campo' || b.type === 'casa' && b.w < 46) drawTrees(ctx, S, b);
      if (nightF > 0.25 && b.type !== 'parco' && !closed) {
        ctx.fillStyle = 'rgba(255,220,140,' + (0.55 * nightF).toFixed(2) + ')';
        ctx.fillRect(b.x + 3, b.y + 3, Math.max(2, b.w / 4), Math.max(2, b.h / 4));
        ctx.fillRect(b.x + b.w - 3 - b.w / 4, b.y + b.h - 3 - b.h / 4, Math.max(2, b.w / 4), Math.max(2, b.h / 4));
      }
      ctx.globalAlpha = 1;
      if (m.scale > 1.05) {
        ctx.fillStyle = nightF > 0.4 ? 'rgba(240,235,220,.8)' : 'rgba(60,50,35,.75)';
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillText(b.name || DATA.BUILDING_LABELS[b.type] || b.type, b.x + 2, b.y - 3);
      }
    }

    /* cittadini */
    for (const c of aliveLocal(S)) {
      const home = S.buildingsById[c.homeId];
      const q = m.loc(S, c);
      if (!q) continue;
      if (q.x < vx0 - 20 || q.x > vx0 + vw + 20 || q.y < vy0 - 20 || q.y > vy0 + vh) continue;
      const pal = P.avatarPalette(c);
      if (E.state && E.state.followId === c.id) { ctx.fillStyle = 'rgba(201,111,90,.35)'; ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, 7); ctx.fill(); }
      ctx.fillStyle = pal.shirt;
      ctx.beginPath(); ctx.arc(q.x, q.y, 3.1, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(50,40,30,.65)'; ctx.lineWidth = 1; ctx.stroke();
      if (E.state && E.state.followId === c.id && m.followOn) {
        m.tx = m.vw * 0.5 - q.x * m.scale;
        m.ty = m.vh * 0.25 - q.y * m.scale;
      }
    }

    ctx.restore();

    /* notte + meteo (overlay a schermo) */
    if (nightF > 0) { ctx.fillStyle = 'rgba(20,25,60,' + (nightF * 0.25).toFixed(3) + ')'; ctx.fillRect(0, 0, m.vw, m.vh); }
    if (season === 'Inverno' || w === 'Pioggia' || w === 'Neve') drawPrecip(ctx, m, w);
    if (m.scale < 0.55) {
      ctx.fillStyle = 'rgba(70,60,45,.8)'; ctx.font = '600 20px system-ui, sans-serif';
      ctx.fillText(DATA.CITY_NAME, 24, 44);
      const live = (S._mapCache || aliveLocal(S)).length;
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(live + ' abitanti · ' + date.year, 24, 62);
    }
  }

  function drawTrees(ctx, S, b) {
    if (b._trees) { for (const t of b._trees) { ctx.fillStyle = '#5f8f4a'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill(); } return; }
    const rng = new D.RNG((b.founded || 1) ^ 0x9e37);
    b._trees = [];
    const n = b.type === 'parco' ? Math.min(14, Math.floor((b.w * b.h) / 3000)) : 3;
    for (let i = 0; i < n; i++) {
      b._trees.push({ x: b.x + 6 + rng.next() * (b.w - 12), y: b.y + 6 + rng.next() * (b.h - 12), r: 2 + rng.next() * 3 });
    }
    return drawTrees(ctx, S, b);
  }

  function drawPrecip(ctx, m, w) {
    ctx.fillStyle = w === 'Neve' ? 'rgba(255,255,255,.8)' : 'rgba(90,110,150,.35)';
    const t = Date.now() / 1000;
    const n = w === 'Neve' ? 60 : 90;
    for (let i = 0; i < n; i++) {
      const sx = (i * 97 % m.vw), sy = ((i * 53 + t * (w === 'Neve' ? 40 : 260)) % m.vh);
      if (w === 'Neve') { ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, 7); ctx.fill(); }
      else ctx.fillRect(sx, sy, 1, 9);
    }
  }

  function nightFactor(h) {
    if (h < 6) return 1; if (h < 8) return 1 - (h - 6) / 2;
    if (h < 18) return 0; if (h < 21) return (h - 18) / 3; return 1;
  }
  function tint(hex, f) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 'rgb(' + Math.round(r * (1 - f) + 24 * f) + ',' + Math.round(g * (1 - f) + 30 * f) + ',' + Math.round(b * (1 - f) + 52 * f) + ')';
  }
})(window.EHL);
