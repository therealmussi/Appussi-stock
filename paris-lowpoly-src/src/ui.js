import * as THREE from 'three';

export function initUI(G) {
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $('hud'), minimap: $('minimap'), mapLabel: $('mapLabel'),
    moneyVal: $('moneyVal'), starsBox: $('starsBox'),
    speedo: $('speedo'), speedVal: $('speedVal'), gearLabel: $('gearLabel'),
    clockVal: $('clockVal'),
    missionPanel: $('missionPanel'), missionTitle: $('missionTitle'),
    missionObjective: $('missionObjective'), missionTimer: $('missionTimer'),
    hint: $('hint'), toasts: $('toasts'), wantedFlash: $('wantedFlash'),
    startScreen: $('startScreen'), playBtn: $('playBtn'), pauseOverlay: $('pauseOverlay')
  };
  const mm = el.minimap.getContext('2d');

  // prerender della mappa statica
  const S = 0.7; // px per metro
  const staticCanvas = document.createElement('canvas');
  staticCanvas.width = staticCanvas.height = Math.ceil(500 * S);
  buildStaticMap(G, staticCanvas, S);

  G.ui = {
    starsDirty: true,
    toast(msg, cls = '') {
      const t = document.createElement('div');
      t.className = 'toast ' + cls;
      t.innerHTML = msg;
      el.toasts.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .5s'; }, 2600);
      setTimeout(() => t.remove(), 3200);
      while (el.toasts.children.length > 4) el.toasts.firstChild.remove();
    },
    wantedFlash() {
      el.wantedFlash.classList.add('hot');
      setTimeout(() => el.wantedFlash.classList.remove('hot'), 700);
    },
    missionPanel(show, title, objective, timer, okColor) {
      if (!show) { el.missionPanel.classList.add('hidden'); return; }
      el.missionPanel.classList.remove('hidden');
      el.missionTitle.textContent = title || '';
      el.missionObjective.textContent = objective || '';
      if (timer !== undefined && timer !== null && !Number.isNaN(timer)) {
        el.missionTimer.classList.remove('hidden');
        el.missionTimer.textContent = String(Math.ceil(timer)) + 's';
        el.missionTimer.classList.toggle('ok', !!okColor);
      } else {
        el.missionTimer.classList.add('hidden');
      }
    },
    setHint(html) {
      if (html) { el.hint.innerHTML = html; el.hint.classList.remove('hidden'); }
      else el.hint.classList.add('hidden');
    }
  };

  let starsHtmlCache = '';

  G.ui.update = () => {
    el.moneyVal.textContent = Math.round(G.money);

    const starsHtml = '★★★★★'.split('').map((c, i) =>
      `<span class="star ${i < G.wanted.stars ? 'on' : ''}">${c}</span>`).join('');
    if (starsHtml !== starsHtmlCache) {
      starsHtmlCache = starsHtml;
      el.starsBox.innerHTML = starsHtml;
    }

    const p = G.player;
    if (p.vehicle) {
      el.speedo.classList.remove('hidden');
      const kmh = Math.round(Math.abs(p.vehicle.vF) * 3.6);
      el.speedVal.textContent = kmh;
      el.gearLabel.textContent = p.vehicle.vF < -0.5 ? 'RETRO' :
        (G.keys[' '] ? 'FRENO A MANO' : p.vehicle.stats.name.toUpperCase());
    } else {
      el.speedo.classList.add('hidden');
    }

    const t24 = G.clockTime % 1;
    const hh = Math.floor(t24 * 24), mmn = Math.floor((t24 * 24 % 1) * 60);
    el.clockVal.textContent = `${String(hh).padStart(2, '0')}:${String(mmn).padStart(2, '0')}`;
    el.mapLabel.textContent = nearLandmarkName(G);

    G.ui.setHint(G.hintText);

    drawMinimap(G, mm, staticCanvas, S);
  };

  el.playBtn.disabled = true;
  G.ui.enablePlay = () => {
    el.playBtn.disabled = false;
    $('loadingNote').textContent = 'Pronto!';
  };

  return { el };
}

function nearLandmarkName(G) {
  const p = G.player ? (G.player.vehicle ? G.player.vehicle.pos : G.player.pos) : { x: 0, z: 0 };
  let best = 'Parigi', bd = 1e9;
  for (const m of G.mapMarkers) {
    const d = Math.hypot(p.x - m.x, p.z - m.z);
    if (d < bd) { bd = d; best = m.label; }
  }
  if (Math.hypot(p.x, p.z) > 230) best = 'Boulevard Périphérique';
  return bd < 110 ? best : 'Parigi';
}

function buildStaticMap(G, canvas, S) {
  const c = canvas.getContext('2d');
  c.fillStyle = '#20242c';
  c.fillRect(0, 0, canvas.width, canvas.height);
  const T = (x, z) => [250 + x * S, 250 + z * S];

  // Senna
  c.fillStyle = '#2a5c78';
  const [wx, wz] = T(0, -24);
  c.fillRect(0, wz, canvas.width, 48 * S);
  // Champ-de-Mars
  c.fillStyle = '#3f6f31';
  const [px, pz] = T(G.mapStatic.park.x1, G.mapStatic.park.z1);
  c.fillRect(px, pz, (G.mapStatic.park.x2 - G.mapStatic.park.x1) * S, (G.mapStatic.park.z2 - G.mapStatic.park.z1) * S);
  // Place de l'Étoile
  c.fillStyle = '#6b5f55';
  const [ax, az] = T(G.mapStatic.plaza.cx, G.mapStatic.plaza.cz);
  c.beginPath(); c.arc(ax, az, (G.mapStatic.plaza.r + 8) * S, 0, Math.PI * 2); c.fill();
  // strade
  c.strokeStyle = '#3d4048';
  c.lineWidth = 14 * S;
  for (const rx of G.config.ROAD_X) {
    const [x1, z1] = T(rx, -235), [x2, z2] = T(rx, 235);
    c.beginPath(); c.moveTo(x1, z1); c.lineTo(x2, z2); c.stroke();
  }
  for (const rz of [-180, -135, -90, -45, 45, 90, 135, 180]) {
    const [x1, z1] = T(-235, rz), [x2, z2] = T(235, rz);
    c.beginPath(); c.moveTo(x1, z1); c.lineTo(x2, z2); c.stroke();
  }
}

function drawMinimap(G, mm, staticCanvas, S) {
  const cv = mm.canvas;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const p = G.player ? (G.player.vehicle ? G.player.vehicle.pos : G.player.pos) : { x: 0, z: 0 };
  const range = 150; // metri visibili (raggio)

  ctx.save();
  ctx.clearRect(0, 0, W, W);
  ctx.beginPath();
  ctx.arc(W / 2, W / 2, W / 2 - 1, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = '#1a1e26';
  ctx.fillRect(0, 0, W, W);
  // porzione statica centrata sul giocatore
  const sc = S; // px/m nella mappa statica
  const sx = 250 + p.x * sc, sz = 250 + p.z * sc;
  const destScale = (W / 2) / range;
  ctx.drawImage(staticCanvas,
    sx - range * sc, sz - range * sc, range * 2 * sc, range * 2 * sc,
    0, 0, W, W);

  const worldToMap = (x, z) => [W / 2 + (x - p.x) * destScale, W / 2 + (z - p.z) * destScale];

  // pedoni (puntini tenui)
  ctx.fillStyle = 'rgba(220,220,220,0.35)';
  for (const ped of G.peds) {
    const [mx, my] = worldToMap(ped.mesh.position.x, ped.mesh.position.z);
    ctx.fillRect(mx - 1, my - 1, 2, 2);
  }
  // auto del traffico
  ctx.fillStyle = '#b9c0cc';
  for (const v of G.vehicles) {
    if (v.role === 'player') continue;
    const [mx, my] = worldToMap(v.pos.x, v.pos.z);
    const rDist = Math.hypot(mx - W / 2, my - W / 2);
    if (rDist > W / 2 - 4) continue;
    if (v.role === 'police') {
      ctx.fillStyle = Math.floor(G.elapsed * 6) % 2 ? '#ff4040' : '#4090ff';
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b9c0cc';
    } else {
      ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // monumenti
  for (const m of G.mapMarkers) {
    const [mx, my] = worldToMap(m.x, m.z);
    ctx.fillStyle = m.icon === 'eiffel' ? '#ffd977' : '#c8b28a';
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.4, -3.4, 6.8, 6.8);
    ctx.restore();
  }

  // marker delle missioni
  for (const sp of (G.missions ? G.missions.spots : [])) {
    if (sp.cooldown > 0 || (G.missions.active && G.missions.active.type !== sp.type)) continue;
    const [mx, my] = worldToMap(sp.x, sp.z);
    const ccol = sp.type === 'courier' ? '#35d0ff' : sp.type === 'race' ? '#ffd23f' : '#ff5548';
    ctx.fillStyle = ccol;
    if (!G.missions.active || G.missions.active.type === sp.type) {
      drawEdgeDot(ctx, mx, my, W, ccol);
    }
  }
  // obiettivo attivo
  if (G.missions && G.missions.active && G.missions.active.target) {
    const t = G.missions.active.target;
    const [mx, my] = worldToMap(t.x, t.z);
    drawEdgeDot(ctx, mx, my, W, '#7be08a');
  }

  // giocatore (freccia)
  const ang = G.player.vehicle ? G.player.vehicle.heading : G.player.heading;
  ctx.save();
  ctx.translate(W / 2, W / 2);
  ctx.rotate(-ang);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawEdgeDot(ctx, mx, my, W, color) {
  const cx = W / 2, cy = W / 2, rMax = W / 2 - 8;
  let dx = mx - cx, dy = my - cy;
  const d = Math.hypot(dx, dy);
  if (d <= rMax + 6) {
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, 6.5, 0, Math.PI * 2); ctx.stroke();
  } else {
    dx = dx / d * rMax; dy = dy / d * rMax;
    ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2); ctx.fill();
  }
}
