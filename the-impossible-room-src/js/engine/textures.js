/* textures.js — procedural canvas-generated textures (no external assets). */

function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d') };
}

export function texNoise(g, w = 256, h = 256, base = [0.72, 0.7, 0.67], variance = 0.05, blotches = 24) {
  const { c, g: x } = canvas2d(w, h);
  x.fillStyle = `rgb(${base.map(v => Math.round(v * 255)).join(',')})`;
  x.fillRect(0, 0, w, h);
  const img = x.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = 1 + (Math.random() * 2 - 1) * variance;
    d[i] *= n; d[i + 1] *= n; d[i + 2] *= n;
  }
  x.putImageData(img, 0, 0);
  for (let i = 0; i < blotches; i++) {
    const r = 8 + Math.random() * 40;
    const a = 0.02 + Math.random() * 0.05;
    x.fillStyle = Math.random() < 0.5
      ? `rgba(0,0,0,${a})`
      : `rgba(255,255,255,${a})`;
    x.beginPath();
    x.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
    x.fill();
  }
  return bind(c);
}

export function texChecker(c1 = '#2a2a2e', c2 = '#e8e4da', n = 8, w = 256, h = 256) {
  const { c, g: x } = canvas2d(w, h);
  const s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    x.fillStyle = (i + j) % 2 ? c1 : c2;
    x.fillRect(i * s, j * s, s + 1, s + 1);
  }
  return bind(c);
}

export function texGrid(g, bg = '#dedad2', line = 'rgba(60,56,52,0.18)', n = 4, w = 256, h = 256) {
  const { c, g: x } = canvas2d(w, h);
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = line; x.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n, h); x.stroke();
    x.beginPath(); x.moveTo(0, i * h / n); x.lineTo(w, i * h / n); x.stroke();
  }
  return bind(c);
}

/* Big architectural lettering. lines: array of strings; opts for sizing. */
export function texText(lines, opts = {}) {
  const w = opts.w || 512, h = opts.h || 512;
  const { c, g: x } = canvas2d(w, h);
  x.fillStyle = opts.bg || 'rgba(0,0,0,0)';
  x.fillRect(0, 0, w, h);
  x.textAlign = opts.align || 'center';
  x.textBaseline = 'middle';
  const px = opts.px || 60;
  x.font = `${opts.weight || 600} ${px}px Georgia, 'Times New Roman', serif`;
  x.fillStyle = opts.fg || 'rgba(40,38,36,0.85)';
  if (opts.spacing) x.letterSpacing = opts.spacing + 'px'; // supported in modern browsers
  const lh = opts.lineHeight || px * 1.5;
  const total = lines.length * lh;
  let y = h / 2 - total / 2 + lh / 2;
  for (const ln of lines) { x.fillText(ln, w / 2, y); y += lh; }
  if (opts.tape) x.letterSpacing = '0px';
  return bind(c);
}

/* Radial blob shadow. */
export function texBlob(inner = 'rgba(10,10,12,0.55)', w = 128) {
  const { c, g: x } = canvas2d(w, w);
  const grad = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.7, 'rgba(10,10,12,0.22)');
  grad.addColorStop(1, 'rgba(10,10,12,0)');
  x.fillStyle = grad;
  x.fillRect(0, 0, w, w);
  return bind(c);
}

/* Small framed painting: a procedural "subject" (sun / moon / eye / door / spiral). */
export function texPainting(subject, frame = '#1c1a18', paper = '#d8d2c4', accent = '#8f1d22') {
  const w = 256, h = 320;
  const { c, g: x } = canvas2d(w, h);
  x.fillStyle = frame; x.fillRect(0, 0, w, h);
  x.fillStyle = paper; x.fillRect(18, 18, w - 36, h - 36);
  x.strokeStyle = accent; x.lineWidth = 3;
  const cx = w / 2, cy = h / 2;
  if (subject === 'sun') {
    x.beginPath(); x.arc(cx, cy, 52, 0, Math.PI * 2); x.fillStyle = accent; x.fill();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      x.beginPath();
      x.moveTo(cx + Math.cos(a) * 62, cy + Math.sin(a) * 62);
      x.lineTo(cx + Math.cos(a) * 84, cy + Math.sin(a) * 84);
      x.stroke();
    }
  } else if (subject === 'moon') {
    x.beginPath(); x.arc(cx, cy, 52, 0, Math.PI * 2); x.fillStyle = accent; x.fill();
    x.fillStyle = paper; x.beginPath(); x.arc(cx - 26, cy - 14, 44, 0, Math.PI * 2); x.fill();
  } else if (subject === 'eye') {
    x.beginPath(); x.ellipse(cx, cy, 74, 40, 0, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(cx, cy, 18, 0, Math.PI * 2); x.fillStyle = accent; x.fill();
  } else if (subject === 'door') {
    x.strokeRect(cx - 34, cy - 60, 68, 120);
    x.fillStyle = accent;
    x.beginPath(); x.arc(cx + 16, cy, 4, 0, Math.PI * 2); x.fill();
  } else if (subject === 'spiral') {
    x.beginPath();
    for (let t = 0; t < Math.PI * 12; t += 0.05) {
      const r = 2 + t * 5.2;
      const px = cx + Math.cos(t) * r, py = cy + Math.sin(t) * r;
      if (t === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
  }
  x.strokeStyle = 'rgba(40,38,36,0.35)';
  x.strokeRect(18.5, 18.5, w - 37, h - 37);
  return bind(c);
}

/* Tape reel label / cassette face. */
export function texTape(label = 'FIELD RECORDING', num = '—') {
  const w = 256, h = 160;
  const { c, g: x } = canvas2d(w, h);
  x.fillStyle = '#191715'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#d8d2c4'; x.fillRect(14, 14, w - 28, h - 28);
  x.fillStyle = '#191715';
  x.font = "700 20px Georgia, serif"; x.textAlign = 'center';
  x.fillText(label, w / 2, 52);
  x.font = "600 30px Georgia, serif";
  x.fillText(num, w / 2, 100);
  x.fillStyle = '#8f1d22';
  x.fillRect(14, 120, w - 28, 10);
  return bind(c);
}

function bind(c) {
  return { source: c, width: c.width, height: c.height };
}
