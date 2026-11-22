/* kit.js — LevelKit: high-level builders used by all levels.
   Everything is built from batched boxes, dynamic meshes, canvas textures.
   No external assets; textures are generated procedurally. */

import { V, Q, M4 } from './engine/math3.js';
import { makeBox, makeQuad, makeCylinder } from './engine/geo.js';
import { texText, texPainting, texTape, texBlob } from './engine/textures.js';
import { AABB, castDown } from './physics.js';
import { Batcher } from './engine/batcher.js';

export { AABB };

/* ---------- palette ---------- */
export const PAL = {
  floorWarm: [0.66, 0.63, 0.58],
  floorGrey: [0.6, 0.59, 0.57],
  floorPale: [0.82, 0.8, 0.76],
  wallGrey: [0.72, 0.7, 0.67],
  wallOff: [0.88, 0.865, 0.83],
  wallBeige: [0.78, 0.735, 0.655],
  ceilDark: [0.5, 0.49, 0.47],
  ceilPale: [0.86, 0.845, 0.82],
  black: [0.09, 0.09, 0.1],
  char: [0.17, 0.16, 0.17],
  red: [0.56, 0.11, 0.12],
  redGlow: [0.85, 0.2, 0.2],
  blue: [0.16, 0.34, 0.5],
  blueGlow: [0.3, 0.6, 0.9],
  amber: [0.85, 0.6, 0.25],
  metal: [0.45, 0.44, 0.46],
  wood: [0.5, 0.4, 0.3],
  woodDark: [0.32, 0.25, 0.19],
  paper: [0.92, 0.9, 0.85],
  fabric: [0.6, 0.6, 0.58],
  white: [0.95, 0.94, 0.92],
  voidDeep: [0.04, 0.045, 0.06],
};

const D = Math.PI / 180;

function facingVec(facing) {
  if (Array.isArray(facing) || facing instanceof Float32Array) return V.norm(V.make(), facing);
  const map = {
    n: [0, 0, -1], s: [0, 0, 1], e: [1, 0, 0], w: [-1, 0, 0],
    up: [0, 1, 0], down: [0, -1, 0],
  };
  return V.norm(V.make(), map[facing] || [0, 0, 1]);
}

function quatFacing(f) {
  // orient a quad (local +Z normal) to face direction f
  const q = Q.ident();
  Q.fromTo(q, [0, 0, 1], f);
  return q;
}

/* ================= LevelKit ================= */
export class LevelKit {
  constructor(renderer, game) {
    this.renderer = renderer;
    this.game = game;
    this.player = game.player;
    this.batcher = new Batcher();
    this.colliders = [];
    this.interactables = [];
    this.triggers = [];
    this.updaters = [];
    this.points = [];
    this.meshList = [];
    this.doors = [];
    this.env = {
      background: [0.07, 0.07, 0.08],
      fogColor: [0.07, 0.07, 0.08],
      fogDensity: 0.012,
      ambient: [0.36, 0.35, 0.34],
      sunDir: V.norm(V.make(), V.make(0.4, -0.8, 0.2)),
      sunColor: [0.5, 0.47, 0.42],
      points: this.points,
    };
    this.mood = { root: 55, mood: 'grey', airAmt: 0.5 };
    this.state = {};
  }

  /* ---------- materials (shared by params -> batchable) ---------- */
  mat(name, opts = {}) {
    const def = {
      color: opts.color || PAL[name] || PAL.wallGrey,
      tex: opts.tex || null,
      emissive: opts.emissive || 0,
      unlit: !!opts.unlit,
      alpha: opts.alpha ?? 1,
      twoSided: !!opts.twoSided,
      uvScale: opts.uvScale || 1,
      tint: opts.tint || null,
      blend: !!opts.blend,
    };
    this._matCache = this._matCache || new Map();
    const key = JSON.stringify(def);
    if (!this._matCache.has(key)) this._matCache.set(key, def);
    return this._matCache.get(key);
  }

  /* ---------- static geometry ---------- */
  box(pos, size, matName, opts = {}) {
    const mat = this.mat(matName, opts);
    this.batcher.addBox(pos, size, mat);
    if (opts.collide !== false) {
      this.colliders.push(new AABB(pos[0], pos[1], pos[2], size[0] / 2, size[1] / 2, size[2] / 2));
    }
  }

  /* Wall slab perpendicular to axis ('x'|'z'); fixed = coordinate on that axis;
     u0..u1 span along the wall; v0..v1 vertical extent. */
  slab(axis, fixed, u0, u1, v0, v1, matName, opts = {}) {
    const t = 0.26;
    const uC = (u0 + u1) / 2, vC = (v0 + v1) / 2;
    const su = u1 - u0, sv = v1 - v0;
    if (axis === 'z') this.box([uC, vC, fixed], [su, sv, t], matName, opts);
    else this.box([fixed, vC, uC], [t, sv, su], matName, opts);
  }

  wallHole(axis, fixed, u0, u1, v0, v1, hole, matName, opts = {}) {
    if (hole.u0 > u0) this.slab(axis, fixed, u0, hole.u0, v0, v1, matName, opts);
    if (u1 > hole.u1) this.slab(axis, fixed, hole.u1, u1, v0, v1, matName, opts);
    if (hole.v1 < v1) this.slab(axis, fixed, hole.u0, hole.u1, hole.v1, v1, matName, opts);
    if (hole.v0 > v0) this.slab(axis, fixed, hole.u0, hole.u1, v0, hole.v0, matName, opts);
  }

  /* Room with optional holed walls. walls: {n|s|e|w: {mat, opts, hole{u0,u1,v0,v1}}} */
  room(cx, cy, cz, w, h, d, opts = {}) {
    const wallMat = opts.wallMat || 'wallGrey';
    const floorMat = opts.floorMat || 'floorWarm';
    const ceilMat = ('ceilMat' in opts) ? opts.ceilMat : 'ceilDark';
    const hw = w / 2, hd = d / 2, T = 0.26;
    const x0 = cx - hw, x1 = cx + hw, z0 = cz - hd, z1 = cz + hd;
    const y0 = cy - h / 2, y1 = cy + h / 2;
    const holes = opts.holes || {};
    this._plate(cx, y0 - T / 2, cz, w, d, floorMat, holes.floor);
    if (ceilMat) this._plate(cx, y1 + T / 2, cz, w, d, ceilMat, holes.ceiling);
    const mk = (side) => {
      const spec = (opts.walls && opts.walls[side]) || {};
      const mat = spec.mat || wallMat;
      if (side === 'n' || side === 's') {
        const fixed = side === 'n' ? z0 - T / 2 : z1 + T / 2;
        if (spec.hole) this.wallHole('z', fixed, x0, x1, y0, y1, spec.hole, mat, spec.opts || {});
        else this.slab('z', fixed, x0, x1, y0, y1, mat, spec.opts || {});
      } else {
        const fixed = side === 'w' ? x0 - T / 2 : x1 + T / 2;
        if (spec.hole) this.wallHole('x', fixed, z0, z1, y0, y1, spec.hole, mat, spec.opts || {});
        else this.slab('x', fixed, z0, z1, y0, y1, mat, spec.opts || {});
      }
    };
    for (const s of ['n', 's', 'w', 'e']) mk(s);
    if (!opts.noTrim) {
      const bb = 0.05, bbH = 0.14, bm = 'char';
      this.box([cx, y0 + bbH / 2, z0 + bb], [w, bbH, bb * 2], bm, { collide: false });
      this.box([cx, y0 + bbH / 2, z1 - bb], [w, bbH, bb * 2], bm, { collide: false });
      this.box([x0 + bb, y0 + bbH / 2, cz], [bb * 2, bbH, d], bm, { collide: false });
      this.box([x1 - bb, y0 + bbH / 2, cz], [bb * 2, bbH, d], bm, { collide: false });
    }
  }

  /* Horizontal plate (floor/ceiling) with optional rectangular hole
     hole: {x, z, w, d} in room-local offsets from room center. */
  _plate(cx, y, cz, w, d, matName, hole) {
    const T = 0.26;
    if (!hole) {
      this.box([cx, y, cz], [w + T * 2, T, d + T * 2], matName, {});
      return;
    }
    const x0 = cx - w / 2 - T, x1 = cx + w / 2 + T;
    const z0 = cz - d / 2 - T, z1 = cz + d / 2 + T;
    const hx0 = cx + hole.x - hole.w / 2, hx1 = cx + hole.x + hole.w / 2;
    const hz0 = cz + hole.z - hole.d / 2, hz1 = cz + hole.z + hole.d / 2;
    // four strips around the hole
    this.box([cx, y, (z0 + hz0) / 2], [x1 - x0, T, hz0 - z0], matName, {});
    this.box([cx, y, (hz1 + z1) / 2], [x1 - x0, T, z1 - hz1], matName, {});
    this.box([(x0 + hx0) / 2, y, (hz0 + hz1) / 2], [hx0 - x0, T, hz1 - hz0], matName, {});
    this.box([(hx1 + x1) / 2, y, (hz0 + hz1) / 2], [x1 - hx1, T, hz1 - hz0], matName, {});
  }

  /* ---------- dynamic nodes ---------- */
  dynBox(size, matName, opts = {}) {
    const geo = makeBox([1, 1, 1], opts.uvScale || 1);
    const node = new DynNode(this.renderer, geo, this.mat(matName, opts));
    node.size = size.slice();
    return node;
  }

  dynQuad(w, h, matName, opts = {}) {
    const geo = makeQuad([1, 1, 1], 1, 1);
    const node = new DynNode(this.renderer, geo, this.mat(matName, { twoSided: true, ...opts }));
    node.quad = true;
    node.size = [w, h, 1];
    return node;
  }

  dynCyl(r, h, matName, opts = {}) {
    const geo = makeCylinder([1, 1, 1], 24, true);
    const node = new DynNode(this.renderer, geo, this.mat(matName, opts));
    node.size = [r * 2, h, r * 2];
    return node;
  }

  /* ---------- text ---------- */
  text(pos, facing, lines, opts = {}) {
    const pxBase = opts.px || 60;
    const charW = pxBase * 0.0075;
    const w = opts.w || Math.max(2, lines.reduce((m, l) => Math.max(m, l.length), 8) * charW * 1.6);
    const h = opts.h || (0.55 * lines.length + 0.3);
    const texN = this.renderer.makeTexture(texText(lines, {
      px: pxBase,
      fg: opts.fg || 'rgba(46,42,38,0.92)',
      bg: opts.bg || 'rgba(0,0,0,0)',
      lineHeight: 110,
      weight: opts.weight || 600,
    }));
    const f = facingVec(facing);
    const mat = this.mat('txt', {
      tex: texN, unlit: opts.unlit !== false, twoSided: true, color: [1, 1, 1],
      tint: opts.tint || null, emissive: opts.emissive || 0,
    });
    this.batcher.addQuad(pos, [w, h], quatFacing(f), mat);
    return { w, h, tex: texN };
  }

  /* framed sign plate (dark backing + light text) */
  plaque(pos, facing, lines, opts = {}) {
    const f = facingVec(facing);
    const w = opts.w || Math.max(1.4, lines.reduce((m, l) => Math.max(m, l.length), 8) * 0.115);
    const h = opts.h || (0.26 * lines.length + 0.34);
    const along = Math.abs(f[0]) > 0.5 ? 'x' : 'z';
    const thickness = 0.06;
    const size = along === 'x' ? [thickness, h, w] : [w, h, thickness];
    this.box([pos[0] - f[0] * thickness / 2, pos[1], pos[2] - f[2] * thickness / 2],
      size, opts.frameMat || 'char', { collide: false });
    this.text(pos, facing, lines, {
      w: w - 0.14, h: h - 0.14, px: opts.px || 60,
      fg: opts.fg || 'rgba(236,230,220,0.95)',
      lineHeight: 110, unlit: true,
    });
    return { w, h };
  }

  /* ---------- interactables & triggers ---------- */
  interact(pos, size, label, cb, opts = {}) {
    const aabb = new AABB(pos[0], pos[1], pos[2], size[0] / 2, size[1] / 2, size[2] / 2);
    const it = {
      id: opts.id || ('it' + this.interactables.length),
      aabb, label, cb,
      enabled: opts.enabled !== false,
      once: !!opts.once,
      used: false,
    };
    this.interactables.push(it);
    return it;
  }

  trigger(pos, size, cb, opts = {}) {
    const aabb = new AABB(pos[0], pos[1], pos[2], size[0] / 2, size[1] / 2, size[2] / 2);
    const tr = { aabb, cb, enabled: opts.enabled !== false, once: !!opts.once, used: false, id: opts.id || null };
    this.triggers.push(tr);
    return tr;
  }

  /* ---------- doors ---------- */
  door(spec) { return new Door(this, spec); }

  /* ---------- gravity pads ---------- */
  gravityPad(pos, targetG, opts = {}) {
    const w = opts.w || 1.2;
    this.box(pos, [w, 0.06, w], opts.mat || 'metal', { collide: false });
    this.box([pos[0], pos[1] + 0.05, pos[2]], [w * 0.25, 0.02, w * 0.25], 'redGlow', { collide: false, unlit: true });
    return this.interact(pos, [w + 0.3, 1.5, w + 0.3], opts.label || 'Engage gravity anchor', () => {
      this.game.setGravity(targetG);
      this.game.audio.gravityShift();
      if (opts.msg) this.game.msg(opts.msg, 4);
      if (opts.onUse) opts.onUse();
    }, { id: opts.id });
  }

  /* ---------- props ---------- */
  tape(id, pos, num, lines) {
    const node = this.dynBox([0.3, 0.12, 0.34], 'char', { color: [0.14, 0.13, 0.12] });
    V.set(node.pos, pos[0], pos[1] + 0.06, pos[2]);
    Q.setAxisAngle(node.quat, [0, 1, 0], 0.4);
    node.update();
    const it = this.interact([pos[0], pos[1] + 0.3, pos[2]], [1.0, 1.4, 1.0],
      'Play recording ' + num, () => {
        if (!it.used) { it.used = true; this.game.collectTape(id); }
        this.game.playTape(num, lines);
      }, { id: 'tape_' + id });
    return it;
  }

  lamp(pos, color = [1, 0.88, 0.7], intensity = 1.0) {
    const shade = this.dynCyl(0.28, 0.34, 'white', { unlit: true, emissive: 0.85, color: [1, 0.95, 0.85] });
    V.set(shade.pos, pos[0], pos[1], pos[2]);
    shade.update();
    this.batcher.addGeo(makeCylinder([1, 1, 1], 8, false), [pos[0], pos[1] + 0.8, pos[2]], Q.ident(), [0.03, 1.6, 0.03], this.mat('char', { color: PAL.char }));
    this.points.push({ pos: V.copy(V.make(), pos), color: V.scale(V.make(), color, intensity) });
  }

  painting(pos, facing, subject) {
    const texN = this.renderer.makeTexture(texPainting(subject));
    const f = facingVec(facing);
    this.batcher.addQuad(pos, [1.0, 1.25], quatFacing(f),
      this.mat('paint', { tex: texN, unlit: true, twoSided: true, color: [1, 1, 1] }));
  }

  paintingDyn(pos, facing, w, h) {
    const f = facingVec(facing);
    const node = this.dynQuad(w, h, 'paint', { unlit: true, color: [1, 1, 1] });
    V.set(node.pos, pos[0], pos[1], pos[2]);
    node.quat = quatFacing(f);
    node.update();
    return node;
  }

  setPainting(node, subject) {
    const texN = this.renderer.makeTexture(texPainting(subject));
    node.setMat(this.mat('paint', { tex: texN, unlit: true, twoSided: true, color: [1, 1, 1] }));
  }

  bed(pos, rotY = 0) {
    const along = Math.abs(Math.cos(rotY)) > 0.5 ? 'x' : 'z';
    const hx = along === 'x' ? 1.05 : 0.55;
    const hz = along === 'x' ? 0.55 : 1.05;
    this.batcher.addBox([pos[0], pos[1] + 0.3, pos[2]],
      along === 'x' ? [2.1, 0.5, 1.1] : [1.1, 0.5, 2.1],
      this.mat('fabric', { color: PAL.fabric }));
    this.colliders.push(new AABB(pos[0], pos[1] + 0.3, pos[2], hx, 0.25, hz));
    this.batcher.addBox([pos[0], pos[1] + 0.62, pos[2] + (along === 'x' ? -0.7 : 0)],
      along === 'x' ? [2.0, 0.14, 0.55] : [0.55, 0.14, 2.0],
      this.mat('paper', { color: [0.86, 0.84, 0.8] }));
  }

  desk(pos, rotY = 0) {
    const along = Math.abs(Math.cos(rotY)) > 0.5 ? 'x' : 'z';
    const m = this.mat('wood', {});
    this.batcher.addBox([pos[0], pos[1] + 0.74, pos[2]],
      along === 'x' ? [1.6, 0.06, 0.8] : [0.8, 0.06, 1.6], m);
    const legs = this.mat('woodDark', {});
    const hw = along === 'x' ? 0.72 : 0.32;
    const hdz = along === 'x' ? 0.32 : 0.72;
    for (const [dx, dz] of [[-hw, -hdz], [hw, -hdz], [-hw, hdz], [hw, hdz]]) {
      this.batcher.addBox([pos[0] + dx, pos[1] + 0.36, pos[2] + dz], [0.08, 0.68, 0.08], legs, { collide: false });
    }
    this.colliders.push(new AABB(pos[0], pos[1] + 0.42, pos[2], along === 'x' ? 0.8 : 0.4, 0.42, along === 'x' ? 0.4 : 0.8));
  }

  chair(pos, rotY = 0) {
    const m = this.mat('woodDark', {});
    this.batcher.addBox([pos[0], pos[1] + 0.44, pos[2]], [0.44, 0.05, 0.44], m, { collide: false });
    this.batcher.addBox([pos[0], pos[1] + 0.8, pos[2] + 0.2], [0.44, 0.7, 0.05], m, { collide: false });
    for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      this.batcher.addBox([pos[0] + dx, pos[1] + 0.21, pos[2] + dz], [0.05, 0.42, 0.05], m, { collide: false });
    }
    this.colliders.push(new AABB(pos[0], pos[1] + 0.42, pos[2], 0.22, 0.42, 0.22));
  }

  wardrobe(pos, rotY = 0, w = 1.4, h = 2.3, d = 0.6) {
    const along = Math.abs(Math.cos(rotY)) > 0.5 ? 'x' : 'z';
    const node = this.dynBox(along === 'x' ? [w, h, d] : [d, h, w], 'woodDark', {});
    V.set(node.pos, pos[0], pos[1] + h / 2, pos[2]);
    node.update();
    const col = new AABB(pos[0], pos[1] + h / 2, pos[2], node.size[0] / 2, h / 2, node.size[2] / 2);
    this.colliders.push(col);
    const it = this.interact([pos[0], pos[1] + h / 2, pos[2]],
      [along === 'x' ? w + 0.5 : d + 0.8, h + 0.4, along === 'x' ? d + 0.8 : w + 0.5],
      'Open wardrobe', () => {}, { id: 'wardrobe' });
    return { node, it, along, collider: col };
  }

  pedestal(pos, height = 1.0, matName = 'ceilPale') {
    this.box([pos[0], pos[1] + height / 2, pos[2]], [0.4, height, 0.4], matName, { collide: false });
    this.box([pos[0], pos[1] + height + 0.03, pos[2]], [0.5, 0.06, 0.5], matName, { collide: false });
    return V.make(pos[0], pos[1] + height + 0.08, pos[2]);
  }

  glowPanel(pos, facing, w, h, color = [0.3, 0.6, 0.9], intensity = 0.6) {
    const f = facingVec(facing);
    this.batcher.addQuad(pos, [w, h], quatFacing(f), this.mat('glow', { color, unlit: true, twoSided: true, emissive: 0.6 }));
    this.points.push({ pos: V.copy(V.make(), pos), color: V.scale(V.make(), color, intensity) });
  }

  chalkLine(pos, axis, len) {
    this.box(pos, axis === 'x' ? [len, 0.012, 0.14] : [0.14, 0.012, len], 'red', { collide: false, unlit: true });
  }

  /* ---------- blob shadows ---------- */
  blob(getPos, scale = 1) {
    const texN = this.renderer.makeTexture(texBlob());
    const node = this.dynQuad(1, 1, 'blob', { tex: texN, unlit: true, color: [1, 1, 1], alpha: 0.8, blend: true });
    node.getPos = getPos;
    node.blobScale = scale;
    this.updaters.push(() => {
      const p = node.getPos();
      if (!p) { node.visible = false; node.update(); return; }
      node.visible = true;
      const up = this.player.up;
      _v0[0] = -up[0]; _v0[1] = -up[1]; _v0[2] = -up[2];
      const hit = castDown(p, _v0, this.colliders, 30);
      if (!hit) return;
      V.set(node.pos,
        p[0] + _v0[0] * (hit.dist - 0.02),
        p[1] + _v0[1] * (hit.dist - 0.02),
        p[2] + _v0[2] * (hit.dist - 0.02));
      Q.fromTo(node.quat, [0, 0, 1], up);
      node.size = [node.blobScale, node.blobScale, 1];
      node.update();
    });
    return node;
  }

  /* ---------- misc ---------- */
  msg(t, d = 3.5) { this.game.msg(t, d); }
  complete() { this.game.completeLevel(); }
  fadeTeleport(pos, yaw, opts) { this.game.fadeTeleport(pos, yaw, opts || {}); }

  finish() {
    const ms = this.batcher.finish(this.renderer);
    for (const m of ms) this.meshList.push(m);
  }

  dispose() {
    for (const m of this.meshList) this.renderer.removeMesh(m);
    this.meshList.length = 0;
  }
}

/* ================= DynNode ================= */
export class DynNode {
  constructor(renderer, geo, mat) {
    this.renderer = renderer;
    this.mesh = renderer.addMesh({ verts: geo.verts, indices: geo.indices, mat, model: M4.ident() });
    this.pos = V.make();
    this.quat = Q.ident();
    this.scale = new Float32Array([1, 1, 1]);
    this.quad = false;
    this.size = [1, 1, 1];
    this.visible = true;
  }
  update() {
    if (this.quad) {
      M4.fromTRS(this.mesh.model, this.pos, this.quat,
        this.visible ? [this.size[0], this.size[1], 1] : [0, 0, 0]);
    } else {
      M4.fromTRS(this.mesh.model, this.pos, this.quat,
        this.visible ? this.scale : [0, 0, 0]);
    }
  }
  setMat(mat) { this.mesh.mat = mat; }
}

/* ================= Door ================= */
class Door {
  constructor(kit, spec) {
    this.kit = kit;
    this.spec = spec;
    const { pos, facing, width = 1.15, height = 2.25 } = spec;
    this.width = width; this.height = height;
    this.f = facingVec(facing);
    this.t = V.norm(V.make(), [this.f[2], 0, -this.f[0]]);
    this.angle = 0;
    this.isOpen = false;
    this.opened = false;
    this.locked = !!spec.locked;

    const fm = spec.mat || 'ceilPale';
    // fixture: hinge at +tangent edge, panel spans toward -tangent
    this.pivot = V.make(
      pos[0] + this.t[0] * width / 2,
      pos[1],
      pos[2] + this.t[2] * width / 2
    );

    const jw = 0.14;
    const jamb = (sign) => {
      const p = V.make(
        pos[0] + this.t[0] * sign * (width / 2 + jw / 2),
        pos[1] + (height + jw) / 2,
        pos[2] + this.t[2] * sign * (width / 2 + jw / 2));
      const size = Math.abs(this.f[0]) > 0.5 ? [0.3, height + jw, jw] : [jw, height + jw, 0.3];
      kit.batcher.addBox(p, size, kit.mat(fm, {}));
    };
    jamb(1); jamb(-1);
    kit.batcher.addBox(
      V.make(pos[0], pos[1] + height + jw / 2, pos[2]),
      Math.abs(this.f[0]) > 0.5 ? [0.3, jw, width + jw * 2] : [width + jw * 2, jw, 0.3],
      kit.mat(fm, {})
    );
    kit.batcher.addBox(
      V.make(pos[0], pos[1] + 0.01, pos[2]),
      Math.abs(this.f[0]) > 0.5 ? [0.26, 0.02, width + jw * 2] : [width + jw * 2, 0.02, 0.26],
      kit.mat('char', {})
    );

    // panel: base orientation aligns box local X with tangent
    const baseYaw = Math.abs(this.t[0]) > 0.5 ? (this.t[0] > 0 ? 0 : Math.PI) : (this.t[2] < 0 ? -Math.PI / 2 : Math.PI / 2);
    this.baseQuat = Q.setAxisAngle(Q.ident(), [0, 1, 0], baseYaw);
    this.swingSign = spec.swing ?? 1;
    this.panel = kit.dynBox([width - 0.05, height - 0.02, 0.09], spec.panelMat || 'metal', { color: spec.color || PAL.metal });
    this.handle = kit.dynBox([0.07, 0.07, 0.22], 'char', { color: [0.85, 0.7, 0.4] });

    this.collider = new AABB(pos[0], pos[1] + height / 2, pos[2],
      Math.abs(this.f[0]) > 0.5 ? 0.16 : width / 2, height / 2, Math.abs(this.f[0]) > 0.5 ? width / 2 : 0.16);
    kit.colliders.push(this.collider);

    kit.doors.push(this);
    this.it = kit.interact(
      [pos[0], pos[1] + height / 2, pos[2]],
      Math.abs(this.f[0]) > 0.5 ? [0.7, height + 0.4, width + 0.9] : [width + 0.9, height + 0.4, 0.7],
      this.labelText(), () => this.tryOpen(), { id: spec.id }
    );
    this._label = this.labelText();
    kit.updaters.push((dt) => this.update(dt));
  }

  labelText() {
    return this.locked
      ? (this.spec.lockLabel || 'Locked — ' + (this.spec.hint || 'it will not move'))
      : (this.spec.label || 'Open the door');
  }

  tryOpen() {
    if (this.isOpen || this.opened) return;
    if (this.locked) {
      this.kit.game.audio.denied();
      if (this.spec.onLocked) this.spec.onLocked();
      return;
    }
    this.openNow();
  }

  openNow() {
    if (this.isOpen || this.opened) return;
    this.isOpen = true;
    this.kit.game.audio.door(true);
    this.it.label = this.spec.openLabel || null;
    if (this.spec.onOpen) this.spec.onOpen();
  }

  closeNow() {
    this.isOpen = false; this.opened = false; this.angle = 0;
    this.collider.disabled = false;
  }

  reset() { this.closeNow(); }

  unlock() {
    this.locked = false;
    this.kit.game.audio.chime();
  }

  update(dt) {
    if (this.isOpen && this.angle < Math.PI * 0.93) {
      this.angle = Math.min(Math.PI * 0.93, this.angle + dt * 2.6);
      if (this.angle > 0.8) this.collider.disabled = true;
    }
    Q.setAxisAngle(_q0, [0, 1, 0], this.angle * this.swingSign);
    // panel center = pivot + rotate(-t * W/2) + up H/2
    _v0[0] = -this.t[0] * this.width / 2;
    _v0[1] = 0;
    _v0[2] = -this.t[2] * this.width / 2;
    Q.rotate(_v1, _q0, _v0);
    V.set(this.panel.pos,
      this.pivot[0] + _v1[0],
      this.spec.pos[1] + this.height / 2,
      this.pivot[2] + _v1[2]);
    Q.mul(this.panel.quat, _q0, this.baseQuat);
    this.panel.update();
    // handle near free edge
    _v2[0] = -(this.width / 2 - 0.14);
    _v2[1] = 0.12;
    _v2[2] = Math.abs(this.f[0]) > 0.5 ? this.f[0] * 0.09 : this.f[2] * 0.09;
    Q.rotate(_v1, this.panel.quat, _v2);
    V.set(this.handle.pos,
      this.panel.pos[0] + _v1[0],
      this.panel.pos[1] + _v1[1],
      this.panel.pos[2] + _v1[2]);
    Q.copy(this.handle.quat, this.panel.quat);
    this.handle.update();
    // fire afterOpen when swung wide
    if (this.isOpen && !this.opened && this.angle > 1.2) {
      this.opened = true;
      if (this.spec.afterOpen) {
        const delay = this.spec.teleDelay ?? 420;
        if (delay <= 0) this.spec.afterOpen();
        else setTimeout(() => this.spec.afterOpen(), delay);
      }
    }
  }
}

/* ================= PerspectiveCube (perspective-growth object) ================= */
export class PerspectiveCube {
  constructor(kit, { pos, backdrops, name = 'cube' }) {
    this.kit = kit;
    this.name = name;
    this.backdrops = backdrops;
    this.size = 0.5;
    this.pos = V.make(pos[0], pos[1], pos[2]);
    this.vel = V.make();
    this.held = false;
    this.holdDist = 1.4;
    this.baseSize = 0.5;
    this.node = kit.dynBox([1, 1, 1], 'white', { color: [0.93, 0.92, 0.89] });
    this.collider = new AABB(this.pos[0], this.pos[1], this.pos[2], 0.25, 0.25, 0.25);
    kit.colliders.push(this.collider);
    this.it = kit.interact(this.pos, [1.5, 1.5, 1.5], 'Take the ' + name, () => this.grab(), { id: 'cube_' + name });
    this.it.dynamic = () => this.collider;
    this.blobNode = kit.blob(() => this.held ? null : this.pos, 1);
    kit.updaters.push((dt) => this.update(dt));
  }

  grab() {
    if (this.held) return;
    this.held = true;
    this.collider.disabled = true;
    this.size = this.baseSize;
    this.kit.game.audio.pickup();
    this.it.label = 'Drop the ' + this.name;
  }

  release() {
    if (!this.held) return;
    this.held = false;
    const p = this.kit.player;
    const cam = p.camPos;
    _v3[0] = this.pos[0] - cam[0];
    _v3[1] = this.pos[1] - cam[1];
    _v3[2] = this.pos[2] - cam[2];
    V.norm(_v3, _v3);
    let bestT = 2.5;
    if (this.backdrops) {
      for (const b of this.backdrops) {
        const t = _rayAABB(cam, _v3, b, 120);
        if (t !== null && t > 0.1 && t < bestT) bestT = t;
      }
    }
    const heldAngular = this.baseSize / this.holdDist;
    this.size = Math.max(0.4, Math.min(34, heldAngular * bestT));
    V.set(this.pos, cam[0] + _v3[0] * bestT, cam[1] + _v3[1] * bestT, cam[2] + _v3[2] * bestT);
    V.set(this.vel, 0, 0, 0);
    this.collider.disabled = false;
    this.kit.game.audio.landing(0.7);
    this.it.label = 'Take the ' + this.name;
  }

  update(dt) {
    const g = this.kit.game;
    if (this.held) {
      const p = this.kit.player, fwd = p.fwd;
      V.set(this.pos,
        p.camPos[0] + fwd[0] * this.holdDist,
        p.camPos[1] + fwd[1] * this.holdDist,
        p.camPos[2] + fwd[2] * this.holdDist);
    } else {
      this.vel[1] -= 21 * dt;
      const delta = _v4;
      delta[0] = this.vel[0] * dt; delta[1] = this.vel[1] * dt; delta[2] = this.vel[2] * dt;
      for (const a of [0, 2, 1]) {
        this.pos[a] += delta[a];
        for (const c of this.kit.colliders) {
          if (c.disabled || c === this.collider) continue;
          if (this.collider.overlaps(c)) {
            this.pos[a] -= delta[a];
            if (a === 1) {
              if (this.vel[1] < -4) g.audio.landing(Math.min(1, -this.vel[1] / 12));
              this.vel[1] = 0;
            } else this.vel[a] = 0;
            break;
          }
        }
      }
    }
    const hs = this.size / 2;
    this.collider.c[0] = this.pos[0]; this.collider.c[1] = this.pos[1]; this.collider.c[2] = this.pos[2];
    this.collider.h[0] = hs; this.collider.h[1] = hs; this.collider.h[2] = hs;
    V.set(this.node.scale, this.size, this.size, this.size);
    V.set(this.node.pos, this.pos[0], this.pos[1], this.pos[2]);
    this.node.update();
  }

  reset(pos) {
    this.held = false;
    this.size = this.baseSize;
    V.copy(this.pos, pos);
    V.set(this.vel, 0, 0, 0);
    this.collider.disabled = false;
    this.it.label = 'Take the ' + this.name;
  }
}

/* ================= helpers ================= */
function _rayAABB(ro, rd, box, maxT) {
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

/* scratch */
const _v0 = V.make(), _v1 = V.make(), _v2 = V.make(), _v3 = V.make(), _v4 = V.make();
const _q0 = new Float32Array([0, 0, 0, 1]);
const _q1 = new Float32Array([0, 0, 0, 1]);
