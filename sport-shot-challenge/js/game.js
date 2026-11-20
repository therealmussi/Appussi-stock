const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WORLD_W = 1200;
const WORLD_H = 675;
const GROUND_Y = 600;
const GRAVITY = 1300;
const PX_PER_M = 10;
const SX = 130;
const SY_BASE = 586;
const POWER_K = 7.2;
const MAX_SPEED = 1500;
const TOTAL_ROUNDS = 10;

const OBJECTIVES = [
  { id: 'canestro', name: 'Canestro', icon: '🏀' },
  { id: 'goal', name: 'Goal', icon: '⚽' },
  { id: 'dist', name: 'Lancio di distanza', icon: '📏' }
];

const BALLS = [
  { id: 'basket', name: 'Pallone da basket', emoji: '🏀', r: 24, mass: 1.15, rest: 0.62, drag: 0.25, draw: drawBasketball },
  { id: 'calcio', name: 'Pallone da calcio', emoji: '⚽', r: 21, mass: 0.9, rest: 0.58, drag: 0.28, draw: drawSoccerBall },
  { id: 'volley', name: 'Pallone da pallavolo', emoji: '🏐', r: 22, mass: 0.7, rest: 0.7, drag: 0.35, draw: drawVolleyball },
  { id: 'tennis', name: 'Pallina da tennis', emoji: '🎾', r: 12, mass: 0.35, rest: 0.75, drag: 0.45, draw: drawTennisBall },
  { id: 'golf', name: 'Pallina da golf', emoji: '⚪', r: 9, mass: 0.28, rest: 0.6, drag: 0.12, draw: drawGolfBall },
  { id: 'baseball', name: 'Palla da baseball', emoji: '⚾', r: 13, mass: 0.5, rest: 0.5, drag: 0.3, draw: drawBaseball },
  { id: 'rugby', name: 'Pallone da rugby', emoji: '🏉', r: 19, mass: 1.0, rest: 0.42, drag: 0.22, draw: drawRugbyBall },
  { id: 'football', name: 'Pallone da football', emoji: '🏈', r: 18, mass: 0.95, rest: 0.4, drag: 0.22, draw: drawFootball },
  { id: 'bowling', name: 'Palla da bowling', emoji: '🎳', r: 25, mass: 3.2, rest: 0.15, drag: 0.05, draw: drawBowlingBall },
  { id: 'handball', name: 'Pallone da pallamano', emoji: '🔵', r: 20, mass: 0.8, rest: 0.65, drag: 0.28, draw: drawHandball }
];

const CLOUDS = [
  { x: 180, y: 90, s: 1.0 },
  { x: 520, y: 60, s: 0.7 },
  { x: 880, y: 110, s: 1.2 },
  { x: 1080, y: 55, s: 0.8 }
];

let vw = 0, vh = 0, dpr = 1, scale = 1, offX = 0, offY = 0;
let gameState = 'menu';
let round = null;
let flight = null;
let aim = null;
let score = 0;
let streak = 0;
let best = 0;
let results = [];
let ballBag = [];
let toastTimer = null;

const elRound = document.getElementById('chip-round');
const elObjective = document.getElementById('chip-objective');
const elWind = document.getElementById('chip-wind');
const elScore = document.getElementById('chip-score');
const elBall = document.getElementById('chip-ball');
const elToast = document.getElementById('toast');
const elOverlay = document.getElementById('overlay');
const elPanelStart = document.getElementById('panel-start');
const elPanelEnd = document.getElementById('panel-end');
const elFinalScore = document.getElementById('final-score');
const elBestLine = document.getElementById('best-line');
const elRoundChips = document.getElementById('round-chips');

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  vw = window.innerWidth;
  vh = window.innerHeight;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  scale = Math.min(vw / WORLD_W, vh / WORLD_H);
  offX = (vw - WORLD_W * scale) / 2;
  offY = (vh - WORLD_H * scale) / 2;
}

function loadBest() {
  try {
    best = Number(localStorage.getItem('ssc-best') || 0) || 0;
  } catch (e) {
    best = 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem('ssc-best', String(best));
  } catch (e) {}
}

let actx = null;

function beep(f0, f1, dur, type, gain) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator();
    const g = actx.createGain();
    const t = actx.currentTime;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(gain || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}

const sfxShoot = () => beep(320, 90, 0.22, 'triangle', 0.18);
const sfxBounce = () => beep(150, 60, 0.09, 'square', 0.07);
const sfxScore = () => {
  beep(523, 523, 0.12, 'sine', 0.16);
  setTimeout(() => beep(784, 784, 0.2, 'sine', 0.16), 110);
};
const sfxFail = () => beep(280, 130, 0.3, 'sawtooth', 0.07);

function shuffleBag() {
  ballBag = BALLS.map((_, i) => i);
  for (let i = ballBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ballBag[i], ballBag[j]] = [ballBag[j], ballBag[i]];
  }
}

function getBall() {
  if (!ballBag.length) shuffleBag();
  return BALLS[ballBag.pop()];
}

function startGame() {
  score = 0;
  streak = 0;
  results = [];
  ballBag = [];
  startRound();
}

function startRound() {
  const ball = getBall();
  const objective = OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)];
  const r = Math.random() * 2 - 1;
  const wind = Math.sign(r) * Math.pow(Math.abs(r), 1.6) * 170;

  round = { num: results.length + 1, ball, objective, wind };

  if (objective.id === 'canestro') {
    round.boardX = 800 + Math.random() * 140;
    round.rimY = 320 + Math.random() * 50;
    round.rimLen = 64;
  } else if (objective.id === 'goal') {
    round.gx = 830 + Math.random() * 90;
    round.barY = 465;
    round.netDepth = 90;
  }

  flight = null;
  aim = null;
  gameState = 'aim';
  updateHUD();
}

function ballStart() {
  return { x: SX, y: SY_BASE - round.ball.r };
}

function updateHUD() {
  const ob = round.objective;
  elRound.innerHTML = 'Round <strong>' + round.num + '/' + TOTAL_ROUNDS + '</strong>';
  elObjective.textContent = ob.icon + ' ' + ob.name;
  elScore.innerHTML = 'Punti <strong>' + score + '</strong>';
  elBall.textContent = round.ball.emoji + ' ' + round.ball.name;

  const w = round.wind / 100;
  if (Math.abs(w) < 0.15) {
    elWind.textContent = 'Vento: calmo';
  } else {
    elWind.textContent = 'Vento: ' + w.toFixed(1) + ' m/s ' + (w > 0 ? '→' : '←');
  }
}

function showToast(text, good) {
  elToast.textContent = text;
  elToast.className = good ? 'good show' : 'bad show';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elToast.classList.remove('show'), 1500);
}

function launch(vx, vy) {
  const p = ballStart();
  flight = {
    x: p.x,
    y: p.y,
    vx,
    vy,
    prevX: p.x,
    prevY: p.y,
    rot: 0,
    groundHits: 0,
    firstGroundX: null,
    scored: false,
    t: 0,
    trail: []
  };
  gameState = 'fly';
  sfxShoot();
}

function stepPhysics(h) {
  const f = flight;
  const b = round.ball;
  f.prevX = f.x;
  f.prevY = f.y;

  const ax = round.wind - b.drag * f.vx;
  const ay = GRAVITY - b.drag * f.vy;

  f.vx += ax * h;
  f.vy += ay * h;
  f.x += f.vx * h;
  f.y += f.vy * h;
  f.rot += (f.vx / b.r) * h;

  if (f.y > GROUND_Y - b.r) {
    f.y = GROUND_Y - b.r;
    if (f.firstGroundX === null) f.firstGroundX = f.x;
    if (Math.abs(f.vy) > 60) {
      f.vy = -f.vy * b.rest;
      sfxBounce();
    } else {
      f.vy = 0;
    }
    f.vx *= 0.985;
  }

  if (round.objective.id === 'canestro') collideHoop(f, b, h);
  if (round.objective.id === 'goal') collideGoal(f, b, h);
}

function collideCircle(f, cx, cy, cr, rest) {
  const b = round.ball;
  const dx = f.x - cx;
  const dy = f.y - cy;
  const d = Math.hypot(dx, dy);
  const minD = b.r + cr;
  if (d < minD && d > 0.0001) {
    const nx = dx / d;
    const ny = dy / d;
    f.x = cx + nx * minD;
    f.y = cy + ny * minD;
    const vn = f.vx * nx + f.vy * ny;
    if (vn < 0) {
      f.vx -= (1 + rest) * vn * nx;
      f.vy -= (1 + rest) * vn * ny;
      sfxBounce();
    }
  }
}

function collideHoop(f, b, h) {
  collideCircle(f, round.boardX - round.rimLen, round.rimY, 5, 0.55);

  if (f.vx > 0 && f.y > round.rimY - 130 && f.y < round.rimY - 6 && f.x + b.r * 0.7 > round.boardX && f.x < round.boardX) {
    f.x = round.boardX - b.r * 0.72;
    f.vx = -f.vx * 0.5;
    sfxBounce();
  }
}

function collideGoal(f, b, h) {
  collideCircle(f, round.gx, round.barY, 7, 0.5);

  if (f.x > round.gx && f.y > round.barY) {
    f.vx *= Math.pow(0.004, h);
    f.vy *= Math.pow(0.02, h);
    if (f.x + b.r > round.gx + round.netDepth - 6) {
      f.x = round.gx + round.netDepth - 6 - b.r;
      f.vx = -Math.abs(f.vx) * 0.25;
    }
  }
}

function checkScore() {
  const f = flight;
  if (f.scored) return;
  const ob = round.objective.id;

  if (ob === 'canestro') {
    if (f.prevY < round.rimY && f.y >= round.rimY && f.vy > 0 && f.x > round.boardX - round.rimLen + 8 && f.x < round.boardX - 8) {
      f.scored = true;
      sfxScore();
    }
  } else if (ob === 'goal') {
    if (f.prevX < round.gx + 4 && f.x >= round.gx + 4 && f.y > round.barY + 10 && f.y < GROUND_Y - 4 && f.vx > 0) {
      f.scored = true;
      sfxScore();
    }
  }
}

function flightSpeed() {
  return Math.hypot(flight.vx, flight.vy);
}

function checkEnd(dt) {
  const f = flight;
  f.t += dt;

  const sp = flightSpeed();
  if (sp < 25) f.slowT = (f.slowT || 0) + dt;
  else f.slowT = 0;

  const settled = f.scored
    ? sp < 90 && f.t > 1.2
    : f.groundHits >= 2 && sp < 55;
  const outOfWorld = f.x > WORLD_W + 150 || f.x < -150;

  if (f.t > 8 || outOfWorld || f.slowT > 0.9 || settled || (f.groundHits >= 1 && sp < 30)) {
    finishThrow();
  }
}

function finishThrow() {
  const f = flight;
  const ob = round.objective;
  let success = false;
  let pts = 0;
  let label = '';

  if (ob.id === 'dist') {
    const m = f.firstGroundX !== null ? Math.max(0, Math.round((f.firstGroundX - SX) / PX_PER_M)) : 0;
    success = m >= 8;
    pts = m >= 8 ? Math.floor(m / 8) : 0;
    label = m + ' m';
  } else {
    success = f.scored;
    pts = success ? 3 : 0;
    label = success ? 'CANESTRO!' : 'Ritenta!';
    if (ob.id === 'goal' && success) label = 'GOAL!';
  }

  let bonus = 0;
  if (success) {
    streak++;
    bonus = Math.min(streak - 1, 3);
  } else {
    streak = 0;
  }
  pts += bonus;
  if (pts > 0) {
    score += pts;
    elScore.innerHTML = 'Punti <strong>' + score + '</strong>';
  }

  results.push({ success, pts, objective: ob });

  if (success) {
    showToast(label + '  +' + pts + (bonus ? ' (bonus ' + bonus + ')' : ''), true);
  } else {
    showToast(label, false);
    sfxFail();
  }

  gameState = 'over';

  setTimeout(() => {
    if (results.length >= TOTAL_ROUNDS) endGame();
    else startRound();
  }, 1600);
}

function endGame() {
  gameState = 'end';
  let newBest = false;
  if (score > best) {
    best = score;
    newBest = true;
    saveBest();
  }
  elFinalScore.textContent = score;
  elBestLine.textContent = newBest ? 'Nuovo record personale!' : 'Record: ' + best + ' punti';

  elRoundChips.innerHTML = '';
  results.forEach((r, i) => {
    const c = document.createElement('span');
    c.className = 'rchip ' + (r.success ? 'ok' : 'ko');
    c.textContent = (r.success ? '✓' : '✗') + ' R' + (i + 1) + (r.success ? ' +' + r.pts : '');
    elRoundChips.appendChild(c);
  });

  elPanelStart.classList.add('hidden');
  elPanelEnd.classList.remove('hidden');
  elOverlay.classList.remove('hidden');
}

function simulatePreview(vx, vy) {
  const b = round.ball;
  const p = ballStart();
  let x = p.x;
  let y = p.y;
  const pts = [];
  const h = 1 / 60;
  for (let i = 0; i < 46; i++) {
    const ax = round.wind - b.drag * vx;
    const ay = GRAVITY - b.drag * vy;
    vx += ax * h;
    vy += ay * h;
    x += vx * h;
    y += vy * h;
    if (y > GROUND_Y - b.r || x > WORLD_W - b.r) break;
    if (i % 4 === 0) pts.push({ x, y });
  }
  return pts;
}

function withCircleClip(c, r, fn) {
  c.save();
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  fn();
  c.restore();
}

function drawBall(ref, x, y, rot, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ref.draw(ctx, radius || ref.r, 0);
  ctx.restore();
}

function drawBasketball(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#e8710a';
  c.fill();
  c.strokeStyle = '#5c2d00';
  c.lineWidth = Math.max(1.4, r * 0.07);
  c.stroke();
  withCircleClip(c, r, () => {
    c.strokeStyle = '#5c2d00';
    c.lineWidth = Math.max(1.5, r * 0.09);
    c.beginPath();
    c.moveTo(0, -r);
    c.lineTo(0, r);
    c.stroke();
    c.beginPath();
    c.moveTo(-r, 0);
    c.lineTo(r, 0);
    c.stroke();
    c.beginPath();
    c.arc(-r * 1.35, 0, r * 1.05, -0.8, 0.8);
    c.stroke();
    c.beginPath();
    c.arc(r * 1.35, 0, r * 1.05, Math.PI - 0.8, Math.PI + 0.8);
    c.stroke();
  });
}

function drawSoccerBall(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = Math.max(1.2, r * 0.06);
  c.stroke();
  withCircleClip(c, r, () => {
    c.fillStyle = '#1e293b';
    c.strokeStyle = '#1e293b';
    c.lineWidth = Math.max(1.2, r * 0.1);
    const pr = r * 0.42;
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const px = Math.cos(a) * pr;
      const py = Math.sin(a) * pr;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      c.beginPath();
      c.moveTo(Math.cos(a) * pr, Math.sin(a) * pr);
      c.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05);
      c.stroke();
    }
  });
}

function drawVolleyball(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#94a3b8';
  c.lineWidth = Math.max(1.2, r * 0.06);
  c.stroke();
  withCircleClip(c, r, () => {
    const bands = [['#2563eb', -1], ['#f59e0b', 0], ['#1f2937', 1]];
    bands.forEach(([col, off]) => {
      c.strokeStyle = col;
      c.lineWidth = r * 0.28;
      c.beginPath();
      c.arc(0, off * r * 0.75, r, 0, Math.PI * 2);
      c.stroke();
    });
  });
}

function drawTennisBall(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#d9f44f';
  c.fill();
  c.strokeStyle = '#a3c93a';
  c.lineWidth = Math.max(1, r * 0.06);
  c.stroke();
  withCircleClip(c, r, () => {
    c.strokeStyle = '#ffffff';
    c.lineWidth = r * 0.2;
    c.beginPath();
    c.arc(-r * 1.35, 0, r * 1.35, -0.9, 0.9);
    c.stroke();
    c.beginPath();
    c.arc(r * 1.35, 0, r * 1.35, Math.PI - 0.9, Math.PI + 0.9);
    c.stroke();
  });
}

function drawGolfBall(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#ffffff';
  c.fill();
  c.strokeStyle = '#cbd5e1';
  c.lineWidth = 1;
  c.stroke();
  withCircleClip(c, r, () => {
    c.fillStyle = '#d3dae1';
    [[-0.4, -0.4], [0.3, -0.5], [-0.1, 0.2], [0.5, 0.2], [-0.55, 0.35], [0.1, -0.1], [-0.3, 0.6]].forEach(([dx, dy]) => {
      c.beginPath();
      c.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2);
      c.fill();
    });
  });
}

function drawBaseball(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#9ca3af';
  c.lineWidth = 1;
  c.stroke();
  withCircleClip(c, r, () => {
    c.strokeStyle = '#dc2626';
    c.lineWidth = r * 0.13;
    c.beginPath();
    c.arc(-r * 1.5, 0, r * 1.5, -0.7, 0.7);
    c.stroke();
    c.beginPath();
    c.arc(r * 1.5, 0, r * 1.5, Math.PI - 0.7, Math.PI + 0.7);
    c.stroke();
  });
}

function drawEllipseBall(c, r, fill, detail) {
  c.beginPath();
  c.ellipse(0, 0, r * 1.35, r * 0.85, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.3)';
  c.lineWidth = 1.5;
  c.stroke();
  c.save();
  c.clip();
  detail();
  c.restore();
}

function drawRugbyBall(c, r) {
  drawEllipseBall(c, r, '#b4571c', () => {
    c.strokeStyle = '#ffffff';
    c.lineWidth = r * 0.22;
    [-0.45, 0.45].forEach(fx => {
      c.beginPath();
      c.moveTo(fx * r * 1.35, -r);
      c.lineTo(fx * r * 1.35, r);
      c.stroke();
    });
  });
}

function drawFootball(c, r) {
  drawEllipseBall(c, r, '#8a4b22', () => {
    c.strokeStyle = '#ffffff';
    c.lineWidth = r * 0.12;
    c.beginPath();
    c.moveTo(-r * 0.5, 0);
    c.lineTo(r * 0.5, 0);
    c.stroke();
    c.lineWidth = r * 0.1;
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(i * r * 0.25, -r * 0.18);
      c.lineTo(i * r * 0.25, r * 0.18);
      c.stroke();
    }
  });
}

function drawBowlingBall(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#3f2a56';
  c.fill();
  c.strokeStyle = '#241734';
  c.lineWidth = 1.5;
  c.stroke();
  withCircleClip(c, r, () => {
    c.fillStyle = '#180f26';
    [[-0.35, -0.4], [0.35, -0.4], [0, 0.05]].forEach(([dx, dy]) => {
      c.beginPath();
      c.arc(dx * r, dy * r, r * 0.13, 0, Math.PI * 2);
      c.fill();
    });
  });
}

function drawHandball(c, r) {
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = '#2563eb';
  c.fill();
  c.strokeStyle = '#1e40af';
  c.lineWidth = 1.4;
  c.stroke();
  withCircleClip(c, r, () => {
    c.strokeStyle = '#93c5fd';
    c.lineWidth = r * 0.18;
    c.beginPath();
    c.arc(0, -r * 0.6, r * 0.75, 0.5, Math.PI - 0.5);
    c.stroke();
    c.beginPath();
    c.arc(0, r * 0.6, r * 0.75, Math.PI + 0.5, -0.5);
    c.stroke();
  });
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#3d7cc9');
  sky.addColorStop(0.65, '#8ec9ea');
  sky.addColorStop(1, '#d9ecf7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_W, GROUND_Y);

  ctx.fillStyle = 'rgba(255, 236, 160, 0.9)';
  ctx.beginPath();
  ctx.arc(1060, 90, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  CLOUDS.forEach(c => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 52 * c.s, 17 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 34 * c.s, c.y - 10 * c.s, 34 * c.s, 14 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - 38 * c.s, c.y + 4 * c.s, 30 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#7fae6a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(0, GROUND_Y - 90);
  ctx.quadraticCurveTo(300, GROUND_Y - 170, 700, GROUND_Y - 95);
  ctx.quadraticCurveTo(1000, GROUND_Y - 50, WORLD_W, GROUND_Y - 95);
  ctx.lineTo(WORLD_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  const grass = ctx.createLinearGradient(0, GROUND_Y - 20, 0, WORLD_H);
  grass.addColorStop(0, '#5aa64b');
  grass.addColorStop(1, '#3d7a34');
  ctx.fillStyle = grass;
  ctx.fillRect(0, GROUND_Y - 20, WORLD_W, WORLD_H - GROUND_Y + 20);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 1; i <= 10; i++) {
    const x = SX + i * 10 * PX_PER_M;
    if (x > WORLD_W - 20) break;
    ctx.fillRect(x - 1, GROUND_Y - 2, 2, 10);
    if (i % 2 === 0) ctx.fillText(i * 10 + ' m', x, GROUND_Y + 26);
  }
  ctx.textAlign = 'left';
}

function drawTarget() {
  const wob = round.objective.id;

  if (wob === 'canestro') {
    const bx = round.boardX;
    const rimY = round.rimY;
    const rimLen = round.rimLen;

    ctx.fillStyle = '#9aa5b1';
    ctx.fillRect(bx + 4, rimY - 130, 12, GROUND_Y - rimY + 130);
    ctx.fillStyle = '#7d8894';
    ctx.fillRect(bx + 4, GROUND_Y - 16, 44, 16);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bx - 10, rimY - 130, 10, 126);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(bx - 10, rimY - 12, 10, 6);

    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    const netBottomY = rimY + 46;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bx - 10 - (rimLen * i) / 4, rimY);
      ctx.lineTo(bx - 10 - rimLen * 0.25 + (rimLen * 0.5 * i) / 4, netBottomY);
      ctx.stroke();
    }
  } else if (wob === 'goal') {
    const gx = round.gx;
    const barY = round.barY;
    const depth = round.netDepth;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    for (let nx2 = gx; nx2 <= gx + depth; nx2 += 14) {
      ctx.beginPath();
      ctx.moveTo(nx2, barY);
      ctx.lineTo(nx2, GROUND_Y);
      ctx.stroke();
    }
    for (let ny2 = barY; ny2 <= GROUND_Y; ny2 += 14) {
      ctx.beginPath();
      ctx.moveTo(gx, ny2);
      ctx.lineTo(gx + depth, ny2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(gx, barY);
    ctx.lineTo(gx + depth, barY);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(gx + depth, barY);
    ctx.lineTo(gx + depth, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(gx, barY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(gx - 2, GROUND_Y - 2, 4, 8);
  } else {
    const flagX = SX + 60 * PX_PER_M;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(flagX, GROUND_Y);
    ctx.lineTo(flagX, GROUND_Y - 90);
    ctx.stroke();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.moveTo(flagX, GROUND_Y - 90);
    ctx.lineTo(flagX + 46, GROUND_Y - 78);
    ctx.lineTo(flagX, GROUND_Y - 66);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTargetRimFront() {
  if (round.objective.id !== 'canestro') return;
  const bx = round.boardX;
  const rimY = round.rimY;
  const rimLen = round.rimLen;

  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx - 10, rimY);
  ctx.lineTo(bx - 10 - rimLen, rimY);
  ctx.stroke();
}

function drawLauncher() {
  ctx.fillStyle = '#47904a';
  ctx.beginPath();
  ctx.ellipse(SX, GROUND_Y + 6, 70, 22, 0, Math.PI, 0);
  ctx.fill();
}

function drawTrail() {
  if (!flight) return;
  flight.trail.forEach((p, i) => {
    const a = (i / flight.trail.length) * 0.35;
    ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAim() {
  if (!aim || gameState !== 'aim') return;

  const pull = { x: aim.x0 - aim.x, y: aim.y0 - aim.y };
  const len = Math.hypot(pull.x, pull.y);
  if (len < 8) return;

  let vx = pull.x * POWER_K;
  let vy = pull.y * POWER_K;
  const sp = Math.hypot(vx, vy);
  if (sp > MAX_SPEED) {
    vx = (vx / sp) * MAX_SPEED;
    vy = (vy / sp) * MAX_SPEED;
  }

  const p = ballStart();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - pull.x * 0.35, p.y - pull.y * 0.35);
  ctx.stroke();
  ctx.setLineDash([]);

  const pts = simulatePreview(vx, vy);
  pts.forEach((q, i) => {
    ctx.fillStyle = 'rgba(255, 209, 102,' + (0.75 - (i / pts.length) * 0.5).toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(q.x, q.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#0b0f16';
  ctx.fillRect(0, 0, vw, vh);

  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, WORLD_W, WORLD_H);
  ctx.clip();

  drawBackground();

  if (round && gameState !== 'menu') {
    drawTarget();
    drawLauncher();
    drawTrail();

    const b = round.ball;

    if (gameState === 'fly' && flight) {
      flight.trail.forEach(p => drawBall(b, p.x, p.y, flight.rot * 0.4, b.r * 0.25));
      drawBall(b, flight.x, flight.y, flight.rot);
    } else {
      const p = ballStart();
      drawBall(b, p.x, p.y, 0);
      drawAim();
    }

    drawTargetRimFront();
  }

  ctx.restore();
}

let lastT = 0;

function loop(t) {
  const dt = Math.min(((t - lastT) / 1000) || 0, 1 / 30);
  lastT = t;

  if (gameState === 'fly' && flight) {
    const steps = 3;
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      stepPhysics(h);
    }
    flight.trail.push({ x: flight.x, y: flight.y });
    if (flight.trail.length > 40) flight.trail.shift();
    checkScore();
    checkEnd(dt);
  }

  render();
  requestAnimationFrame(loop);
}

function toWorld(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - offX) / scale,
    y: (e.clientY - rect.top - offY) / scale
  };
}

canvas.addEventListener('pointerdown', e => {
  if (gameState !== 'aim') return;
  e.preventDefault();
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (err) {}
  const w = toWorld(e);
  aim = { x0: w.x, y0: w.y, x: w.x, y: w.y };
});

canvas.addEventListener('pointermove', e => {
  if (!aim || gameState !== 'aim') return;
  const w = toWorld(e);
  aim.x = w.x;
  aim.y = w.y;
});

canvas.addEventListener('pointerup', e => {
  if (!aim || gameState !== 'aim') return;
  const pull = { x: aim.x0 - aim.x, y: aim.y0 - aim.y };
  aim = null;
  if (Math.hypot(pull.x, pull.y) < 28) return;

  let vx = pull.x * POWER_K;
  let vy = pull.y * POWER_K;
  const sp = Math.hypot(vx, vy);
  if (sp > MAX_SPEED) {
    vx = (vx / sp) * MAX_SPEED;
    vy = (vy / sp) * MAX_SPEED;
  }
  elToast.classList.remove('show');
  launch(vx, vy);
});

canvas.addEventListener('pointercancel', () => { aim = null; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

document.getElementById('btn-start').addEventListener('click', () => {
  elOverlay.classList.add('hidden');
  startGame();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  elOverlay.classList.add('hidden');
  startGame();
});

window.addEventListener('resize', resize);

loadBest();
resize();
requestAnimationFrame(t => {
  lastT = t;
  requestAnimationFrame(loop);
});
