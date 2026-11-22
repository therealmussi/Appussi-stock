/* math3.js — minimal vec3 / mat4 / quaternion math (column-major mat4). */

export const V = {
  make: (x = 0, y = 0, z = 0) => new Float32Array([x, y, z]),
  set: (o, x, y, z) => { o[0] = x; o[1] = y; o[2] = z; return o; },
  copy: (o, a) => { o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; return o; },
  add: (o, a, b) => { o[0] = a[0] + b[0]; o[1] = a[1] + b[1]; o[2] = a[2] + b[2]; return o; },
  sub: (o, a, b) => { o[0] = a[0] - b[0]; o[1] = a[1] - b[1]; o[2] = a[2] - b[2]; return o; },
  scale: (o, a, s) => { o[0] = a[0] * s; o[1] = a[1] * s; o[2] = a[2] * s; return o; },
  addScaled: (o, a, b, s) => { o[0] = a[0] + b[0] * s; o[1] = a[1] + b[1] * s; o[2] = a[2] + b[2] * s; return o; },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (o, a, b) => {
    const x = a[1] * b[2] - a[2] * b[1];
    const y = a[2] * b[0] - a[0] * b[2];
    const z = a[0] * b[1] - a[1] * b[0];
    o[0] = x; o[1] = y; o[2] = z; return o;
  },
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  lenSq: (a) => a[0] * a[0] + a[1] * a[1] + a[2] * a[2],
  norm: (o, a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    o[0] = a[0] / l; o[1] = a[1] / l; o[2] = a[2] / l; return o;
  },
  lerp: (o, a, b, t) => {
    o[0] = a[0] + (b[0] - a[0]) * t;
    o[1] = a[1] + (b[1] - a[1]) * t;
    o[2] = a[2] + (b[2] - a[2]) * t; return o;
  },
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
};

/* ---------- quaternions [x,y,z,w] ---------- */
export const Q = {
  ident: () => new Float32Array([0, 0, 0, 1]),
  copy: (o, a) => { o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; o[3] = a[3]; return o; },
  setAxisAngle: (o, ax, ang) => {
    const l = Math.hypot(ax[0], ax[1], ax[2]) || 1;
    const s = Math.sin(ang / 2) / l;
    o[0] = ax[0] * s; o[1] = ax[1] * s; o[2] = ax[2] * s;
    o[3] = Math.cos(ang / 2); return o;
  },
  mul: (o, a, b) => {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
    const bx = b[0], by = b[1], bz = b[2], bw = b[3];
    o[0] = aw * bx + ax * bw + ay * bz - az * by;
    o[1] = aw * by + ay * bw + az * bx - ax * bz;
    o[2] = aw * bz + az * bw + ax * by - ay * bx;
    o[3] = aw * bw - ax * bx - ay * by - az * bz;
    return o;
  },
  normalize: (o, a) => {
    const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1;
    o[0] = a[0] / l; o[1] = a[1] / l; o[2] = a[2] / l; o[3] = a[3] / l; return o;
  },
  rotate: (o, q, v) => {
    // o = v + 2*q.w*(q.xyz × v) + 2*(q.xyz × (q.xyz × v))
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    const tx = 2 * (qy * v[2] - qz * v[1]);
    const ty = 2 * (qz * v[0] - qx * v[2]);
    const tz = 2 * (qx * v[1] - qy * v[0]);
    o[0] = v[0] + qw * tx + (qy * tz - qz * ty);
    o[1] = v[1] + qw * ty + (qz * tx - qx * tz);
    o[2] = v[2] + qw * tz + (qx * ty - qy * tx);
    return o;
  },
  slerp: (o, a, b, t) => {
    let bx = b[0], by = b[1], bz = b[2], bw = b[3];
    let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
    if (cos < 0) { bx = -bx; by = -by; bz = -bz; bw = -bw; cos = -cos; }
    let s0, s1;
    if (cos > 0.9995) {
      s0 = 1 - t; s1 = t;
    } else {
      const th = Math.acos(cos);
      const sn = Math.sin(th);
      s0 = Math.sin((1 - t) * th) / sn;
      s1 = Math.sin(t * th) / sn;
    }
    o[0] = a[0] * s0 + bx * s1;
    o[1] = a[1] * s0 + by * s1;
    o[2] = a[2] * s0 + bz * s1;
    o[3] = a[3] * s0 + bw * s1;
    return Q.normalize(o, o);
  },
  /* Rotation taking unit vector 'from' to unit vector 'to' (shortest arc). */
  fromTo: (o, from, to) => {
    const d = V.dot(from, to);
    if (d > 0.99999) return Q.setAxisAngle(o, [0, 1, 0], 0);
    const cx = from[1] * to[2] - from[2] * to[1];
    const cy = from[2] * to[0] - from[0] * to[2];
    const cz = from[0] * to[1] - from[1] * to[0];
    if (Math.hypot(cx, cy, cz) < 1e-6) {
      // opposite: pick any perp axis
      let ax = Math.abs(from[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      V.cross(_tmp, from, ax);
      V.norm(_tmp, _tmp);
      return Q.setAxisAngle(o, _tmp, Math.PI);
    }
    return Q.setAxisAngle(o, [cx, cy, cz], Math.acos(Math.max(-1, Math.min(1, d))));
  },
};
const _tmp = V.make();

/* ---------- mat4 (column-major, Float32Array(16)) ---------- */
export const M4 = {
  ident: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  set: (o) => { o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o; },
  copy: (o, a) => { o.set(a); return o; },
  mul: (o, a, b) => {
    // o = a * b (b applied first)
    if (o === a || o === b) { M4.mul(_m0, a, b); return M4.copy(o, _m0); }
    for (let c = 0; c < 4; c++) {
      const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      o[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return o;
  },
  perspective: (o, fovy, aspect, near, far) => {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    o.fill(0);
    o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
    return o;
  },
  fromTRS: (o, pos, q, s) => {
    const x = q[0], y = q[1], z = q[2], w = q[3];
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const sx = s[0], sy = s[1], sz = s[2];
    o[0] = (1 - (yy + zz)) * sx; o[1] = (xy + wz) * sx; o[2] = (xz - wy) * sx; o[3] = 0;
    o[4] = (xy - wz) * sy; o[5] = (1 - (xx + zz)) * sy; o[6] = (yz + wx) * sy; o[7] = 0;
    o[8] = (xz + wy) * sz; o[9] = (yz - wx) * sz; o[10] = (1 - (xx + yy)) * sz; o[11] = 0;
    o[12] = pos[0]; o[13] = pos[1]; o[14] = pos[2]; o[15] = 1;
    return o;
  },
  /* Build camera view matrix directly from position + orthonormal basis. */
  fromBasis: (o, pos, right, up, back) => {
    o[0] = right[0]; o[4] = right[1]; o[8] = right[2];
    o[1] = up[0]; o[5] = up[1]; o[9] = up[2];
    o[2] = back[0]; o[6] = back[1]; o[10] = back[2];
    o[3] = 0; o[7] = 0; o[11] = 0;
    o[12] = -V.dot(right, pos);
    o[13] = -V.dot(up, pos);
    o[14] = -V.dot(back, pos);
    o[15] = 1;
    return o;
  },
  /* Normal matrix: inverse-transpose of upper 3x3 (assumes rotation+uniform scale ok). */
  normalFromMat4: (o3, m) => {
    // For rotation + positive uniform scale, transpose of 3x3 (unnormalized) works.
    o3[0] = m[0]; o3[1] = m[4]; o3[2] = m[8];
    o3[3] = m[1]; o3[4] = m[5]; o3[5] = m[9];
    o3[6] = m[2]; o3[7] = m[6]; o3[8] = m[10];
    return o3;
  },
};
const _m0 = new Float32Array(16);
