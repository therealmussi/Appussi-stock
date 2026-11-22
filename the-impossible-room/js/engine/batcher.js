/* batcher.js — merges static geometry into per-material batches.
   Dynamic meshes (doors, props) are created individually via kit. */

import { M4, V, Q } from './math3.js';
import { STRIDE, makeBox, makeQuad, makeCylinder } from './geo.js';

export class Batcher {
  constructor() {
    this.groups = new Map(); // matKey -> {mat, verts:[], indices:[], base}
    this.geos = [];
  }

  _group(mat) {
    let g = this.groups.get(mat);
    if (!g) {
      g = { mat, verts: [], indices: [] };
      this.groups.set(mat, g);
    }
    return g;
  }

  /* Transform-space helper: bake a transform into raw vertex/normal data. */
  _bake(geo, pos, quat, scale, color) {
    const out = [];
    const n = geo.verts.length / STRIDE;
    const m = M4.fromTRS(M4.ident(), pos, quat, scale);
    const p = V.make(), nr = V.make();
    for (let i = 0; i < n; i++) {
      const o = i * STRIDE;
      p[0] = geo.verts[o]; p[1] = geo.verts[o + 1]; p[2] = geo.verts[o + 2];
      nr[0] = geo.verts[o + 3]; nr[1] = geo.verts[o + 4]; nr[2] = geo.verts[o + 5];
      const wp = _v0;
      // manual transform
      const px = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
      const py = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
      const pz = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
      const nx = m[0] * nr[0] + m[4] * nr[1] + m[8] * nr[2];
      const ny = m[1] * nr[0] + m[5] * nr[1] + m[9] * nr[2];
      const nz = m[2] * nr[0] + m[6] * nr[1] + m[10] * nr[2];
      out.push(px, py, pz, nx, ny, nz,
        geo.verts[o + 6], geo.verts[o + 7],
        color[0], color[1], color[2]);
    }
    return out;
  }

  addGeo(geo, pos, quat, scale, mat) {
    const g = this._group(mat);
    const base = g.verts.length / STRIDE;
    const baked = this._bake(geo, pos, quat, scale, mat.color);
    g.verts.push(...baked);
    for (let i = 0; i < geo.indices.length; i++) g.indices.push(base + geo.indices[i]);
  }

  addBox(pos, size, mat) {
    const quat = mat.rotQuat || Q.ident();
    this.addGeo(makeBox([1, 1, 1], mat.uvScale || 1), pos, quat, size, mat);
  }

  addQuad(pos, size, quat, mat) {
    this.addGeo(makeQuad([1, 1, 1], 1, 1), pos, quat, [size[0], size[1], 1], mat);
  }

  addCylinder(pos, radius, height, mat, seg = 20) {
    this.addGeo(makeCylinder([1, 1, 1], seg, true), pos, mat.rotQuat || Q.ident(), [radius * 2, height, radius * 2], mat);
  }

  finish(renderer) {
    const meshes = [];
    for (const g of this.groups.values()) {
      let start = 0;
      const total = g.verts.length / STRIDE;
      const MAXV = 60000;
      while (start < total) {
        // split on face boundary (each face is 4 verts, its 6 indices stay within)
        let end = Math.min(start + MAXV, total);
        end = start + Math.floor((end - start) / 4) * 4;
        if (end <= start) break;
        const verts = new Float32Array(g.verts.slice(start * STRIDE, end * STRIDE));
        const indices = [];
        for (let i = 0; i < g.indices.length; i += 3) {
          const a = g.indices[i], b = g.indices[i + 1], c = g.indices[i + 2];
          if (a >= start && a < end) indices.push(a - start, b - start, c - start);
        }
        meshes.push(renderer.addMesh({
          verts, indices: new Uint16Array(indices), mat: g.mat,
        }));
        start = end;
      }
    }
    return meshes;
  }
}
const _v0 = V.make();
