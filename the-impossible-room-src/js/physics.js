/* physics.js — world = list of static AABBs. Player is an AABB whose "up" axis
   depends on the current gravity direction (always a world axis in this game).
   Supports per-axis resolution, step-up, ground detection. */

import { V } from './engine/math3.js';

export const GRAV = {
  down: V.make(0, -1, 0),
  up: V.make(0, 1, 0),
  plusX: V.make(1, 0, 0),
  minusX: V.make(-1, 0, 0),
  plusZ: V.make(0, 0, 1),
  minusZ: V.make(0, 0, -1),
};

export function upFromGravity(g) {
  return V.make(-g[0], -g[1], -g[2]);
}

/* Which world axis is the up axis, and its sign. */
export function upAxis(up) {
  const ax = Math.abs(up[0]) > 0.5 ? 0 : (Math.abs(up[1]) > 0.5 ? 1 : 2);
  return { axis: ax, sign: Math.sign(up[ax]) };
}

export class AABB {
  constructor(cx, cy, cz, hx, hy, hz) {
    this.c = V.make(cx, cy, cz);
    this.h = V.make(hx, hy, hz);
  }
  contains(p, pad = 0) {
    return Math.abs(p[0] - this.c[0]) <= this.h[0] + pad &&
      Math.abs(p[1] - this.c[1]) <= this.h[1] + pad &&
      Math.abs(p[2] - this.c[2]) <= this.h[2] + pad;
  }
  overlaps(o) {
    return Math.abs(this.c[0] - o.c[0]) < this.h[0] + o.h[0] &&
      Math.abs(this.c[1] - o.c[1]) < this.h[1] + o.h[1] &&
      Math.abs(this.c[2] - o.c[2]) < this.h[2] + o.h[2];
  }
}

export function playerAABB(pos, up, radius = 0.32, halfHeight = 0.85) {
  const { axis } = upAxis(up);
  const h = [radius, radius, radius];
  h[axis] = halfHeight;
  return new AABB(pos[0], pos[1], pos[2], h[0], h[1], h[2]);
}

export function rayAABB(ro, rd, box, maxT) {
  // slab test; returns t of entry or null
  let tmin = 0, tmax = maxT;
  for (let i = 0; i < 3; i++) {
    const d = rd[i];
    if (Math.abs(d) < 1e-9) {
      if (Math.abs(ro[i] - box.c[i]) > box.h[i]) return null;
    } else {
      let t1 = (box.c[i] - box.h[i] - ro[i]) / d;
      let t2 = (box.c[i] + box.h[i] - ro[i]) / d;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}

const _box = new AABB(0, 0, 0, 1, 1, 1);
const _res = { hit: null, axis: 0, sign: 0 };

function overlapsAny(pos, up, colliders, radius, hh) {
  _box.c[0] = pos[0]; _box.c[1] = pos[1]; _box.c[2] = pos[2];
  const { axis } = upAxis(up);
  _box.h[0] = _box.h[1] = _box.h[2] = radius;
  _box.h[axis] = hh;
  for (const c of colliders) {
    if (c.disabled) continue;
    if (c.overlaps(_box)) return c;
  }
  return null;
}

/* Move `pos` in place by `delta` with collision resolution.
   `up` is the player up vector (world axis aligned).
   grounded tells whether step-up is allowed.
   Returns {hitX,hitY,hitZ,ground} booleans. */
export function moveCollide(pos, delta, up, colliders, grounded = false, radius = 0.32, halfHeight = 0.85, step = 0.55) {
  const { axis, sign } = upAxis(up);
  const out = { hitX: false, hitY: false, hitZ: false, ground: false, hit: null };
  const order = [0, 2, 1]; // x, z, then up-axis last
  const liftVec = up[axis] >= 0 ? step : -step;

  const tryLift = grounded && step > 0;
  let lifted = false;
  const restH = pos[axis];

  for (const a of order) {
    let d = delta[a];
    if (tryLift && !lifted && a !== axis && d !== 0) {
      pos[axis] = restH + liftVec;
      if (overlapsAny(pos, up, colliders, radius, halfHeight)) {
        pos[axis] = restH; // no headroom to step
      } else {
        lifted = true;
      }
    }
    if (d === 0) continue;
    pos[a] += d;
    const col = overlapsAny(pos, up, colliders, radius, halfHeight);
    if (col) {
      pos[a] -= d;
      const half = (a === axis) ? halfHeight : radius;
      _box.c[a] = pos[a];
      if (!col.overlaps(_box)) {
        pos[a] = d > 0 ? col.c[a] - (col.h[a] + half) : col.c[a] + (col.h[a] + half);
      }
      out['hit' + 'XYZ'[a]] = true;
      out.hit = col;
    }
  }

  if (lifted) {
    pos[axis] = restH;
    const col = overlapsAny(pos, up, colliders, radius, halfHeight);
    if (col) {
      const restS = restH * sign;
      const colTopS = col.c[axis] * sign + col.h[axis];
      if (colTopS - (restS - halfHeight) > -0.01 && colTopS - (restS - halfHeight) <= step + 0.01) {
        pos[axis] = sign * (colTopS + halfHeight);
        out.ground = true;
      }
    }
  }
  return out;
}

/* Ground check: is there support within eps along -up? */
export function isGrounded(pos, up, colliders, radius = 0.32, halfHeight = 0.85, eps = 0.08) {
  const t = V.copy(_p0, pos);
  t[0] -= up[0] * eps; t[1] -= up[1] * eps; t[2] -= up[2] * eps;
  return !!overlapsAny(t, up, colliders, radius, halfHeight) ||
    !!overlapsAny(pos, up, colliders, radius, halfHeight);
}

/* Cast a point down from pos along dir, return hit AABB or null (used for blob shadows &
   perspective drops). */
export function castDown(pos, dir, colliders, maxDist = 60, skip = null) {
  _box.c[0] = pos[0]; _box.c[1] = pos[1]; _box.c[2] = pos[2];
  _box.h[0] = _box.h[1] = _box.h[2] = 0.05;
  let best = null, bestT = maxDist;
  for (const c of colliders) {
    if (c === skip || c.disabled) continue;
    // crude ray vs aabb from pos toward dir
    let tmin = 0, tmax = bestT, ok = true;
    for (let i = 0; i < 3; i++) {
      const d = dir[i];
      if (Math.abs(d) < 1e-9) {
        if (Math.abs(pos[i] - c.c[i]) > c.h[i] + 0.05) { ok = false; break; }
      } else {
        let t1 = (c.c[i] - c.h[i] - 0.05 - pos[i]) / d;
        let t2 = (c.c[i] + c.h[i] + 0.05 - pos[i]) / d;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) { ok = false; break; }
      }
    }
    if (ok && tmin > 0.001 && tmin < bestT) { bestT = tmin; best = c; }
  }
  return best ? { dist: bestT, box: best } : null;
}
const _p0 = V.make();
