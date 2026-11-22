/* geo.js — procedural geometry generators. All return interleaved arrays:
   [pos(3), normal(3), uv(2), color(3)] = 11 floats per vertex, plus indices. */

export const STRIDE = 11;

function pushVert(a, pos, nrm, uv, col) {
  a.push(pos[0], pos[1], pos[2], nrm[0], nrm[1], nrm[2], uv[0], uv[1], col[0], col[1], col[2]);
}

export function makeBox(col, uvScale = 1) {
  // unit box centered at origin, size 1 (scale via transform)
  const v = [], idx = [];
  const hx = 0.5, hy = 0.5, hz = 0.5;
  const faces = [
    { n: [0, 0, 1], Quad: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
    { n: [0, 0, -1], Quad: [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]] },
    { n: [1, 0, 0], Quad: [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]] },
    { n: [-1, 0, 0], Quad: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] },
    { n: [0, 1, 0], Quad: [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]] },
    { n: [0, -1, 0], Quad: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] },
  ];
  const u = uvScale;
  for (const f of faces) {
    const base = v.length / STRIDE;
    const quadUV = [[0, 0], [u, 0], [u, u], [0, u]];
    for (let i = 0; i < 4; i++) pushVert(v, f.Quad[i], f.n, quadUV[i], col);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { verts: new Float32Array(v), indices: new Uint16Array(idx) };
}

/* Flat quad on XY plane facing +Z, centered, size w×h. */
export function makeQuad(col, w = 1, h = 1) {
  const v = [], idx = [];
  const hw = w / 2, hh = h / 2;
  pushVert(v, [-hw, -hh, 0], [0, 0, 1], [0, 1], col);
  pushVert(v, [hw, -hh, 0], [0, 0, 1], [1, 1], col);
  pushVert(v, [hw, hh, 0], [0, 0, 1], [1, 0], col);
  pushVert(v, [-hw, hh, 0], [0, 0, 1], [0, 0], col);
  idx.push(0, 1, 2, 0, 2, 3);
  return { verts: new Float32Array(v), indices: new Uint16Array(idx) };
}

export function makeCylinder(col, seg = 24, capped = true) {
  // unit radius 0.5, height 1 centered
  const v = [], idx = [];
  const r = 0.5;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
    const x0 = Math.cos(a0) * r, z0 = Math.sin(a0) * r;
    const x1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
    const n0 = [x0 * 2, 0, z0 * 2], n1 = [x1 * 2, 0, z1 * 2];
    const base = v.length / STRIDE;
    pushVert(v, [x0, -0.5, z0], n0, [i / seg, 1], col);
    pushVert(v, [x1, -0.5, z1], n1, [(i + 1) / seg, 1], col);
    pushVert(v, [x1, 0.5, z1], n1, [(i + 1) / seg, 0], col);
    pushVert(v, [x0, 0.5, z0], n0, [i / seg, 0], col);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  if (capped) {
    for (const [y, ny] of [[0.5, 1], [-0.5, -1]]) {
      const base = v.length / STRIDE;
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        pushVert(v, [Math.cos(a) * r, y, Math.sin(a) * r], [0, ny, 0],
          [0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5], col);
      }
      for (let i = 1; i < seg - 1; i++) {
        if (y > 0) idx.push(base, base + i + 1, base + i);
        else idx.push(base, base + i, base + i + 1);
      }
    }
  }
  return { verts: new Float32Array(v), indices: new Uint16Array(idx) };
}
