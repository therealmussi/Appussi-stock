import * as THREE from 'three';
import { VEHICLE_TYPES, LANE, ROAD_X, ROAD_Z, PED_COLORS } from './config.js';
import { clamp, angMoveTowards, angDiff, rand, randi, pick, dist2d } from './utils.js';

// ---------------------------------------------------------------------------
// Mesh low-poly delle auto (fronte verso +Z)
// ---------------------------------------------------------------------------
const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 10);
wheelGeo.rotateZ(Math.PI / 2);
const matWheel = new THREE.MeshLambertMaterial({ color: 0x151517 });
const matGlass = new THREE.MeshLambertMaterial({ color: 0x223344 });
const matHead = new THREE.MeshLambertMaterial({ color: 0xfff6cc, emissive: 0xfff1b0, emissiveIntensity: 0 });
const matTail = new THREE.MeshLambertMaterial({ color: 0x5a0f0f, emissive: 0xff2222, emissiveIntensity: 0 });

function buildCarMesh(type, color) {
  const st = VEHICLE_TYPES[type];
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color });

  const body = new THREE.Mesh(new THREE.BoxGeometry(st.width, st.height, st.length), bodyMat);
  body.position.y = 0.35 + st.height / 2;
  body.castShadow = true;
  g.add(body);

  if (type === 'van') {
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(st.width, st.height * 0.9, st.length * 0.55), bodyMat);
    cargo.position.set(0, 0.35 + st.height + 0.4, -st.length * 0.16);
    cargo.castShadow = true;
    g.add(cargo);
    const wind = new THREE.Mesh(new THREE.BoxGeometry(st.width * 0.86, 0.7, 0.1), matGlass);
    wind.position.set(0, 0.35 + st.height + 0.42, st.length * 0.27);
    g.add(wind);
  } else {
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(st.width * 0.82, st.height * 0.75, st.length * (type === 'sport' ? 0.42 : 0.5)),
      matGlass
    );
    cab.position.set(0, 0.35 + st.height + st.height * 0.25, st.length * st.cabPos - 0.2);
    cab.castShadow = true;
    g.add(cab);
  }

  const wheels = [];
  const wz = st.length * 0.32;
  for (const sx of [-1, 1]) for (const sz of [1, -1]) {
    const w = new THREE.Mesh(wheelGeo, matWheel);
    w.position.set(sx * (st.width / 2 - 0.02), 0.34, sz * wz);
    w.castShadow = true;
    g.add(w);
    wheels.push(w);
  }

  const lights = { heads: [], tails: [], sirens: [] };
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.08), matHead);
    h.position.set(sx * st.width * 0.3, 0.35 + st.height * 0.55, st.length / 2 + 0.02);
    g.add(h);
    lights.heads.push(h);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), matTail);
    t.position.set(sx * st.width * 0.3, 0.35 + st.height * 0.55, -st.length / 2 - 0.02);
    g.add(t);
    lights.tails.push(t);
  }

  if (type === 'police') {
    const yTop = 0.35 + st.height + st.height * 0.25 + 0.42;
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.34),
      new THREE.MeshLambertMaterial({ color: 0x2233ff, emissive: 0x2233ff, emissiveIntensity: 0 }));
    blue.position.set(-0.35, yTop, 0.2);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.34),
      new THREE.MeshLambertMaterial({ color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 0 }));
    red.position.set(0.35, yTop, 0.2);
    g.add(blue, red);
    lights.sirens.push(blue, red);
  }

  g.userData = { wheels, lights };
  return g;
}

// ---------------------------------------------------------------------------
// Vehicle
// ---------------------------------------------------------------------------
export class Vehicle {
  constructor(G, type, x, z, heading, color) {
    this.type = type;
    this.stats = VEHICLE_TYPES[type];
    this.pos = new THREE.Vector3(x, 0, z);
    this.heading = heading;
    this.vF = 0;
    this.vL = 0;
    this.speed = 0;
    this.push = { x: 0, z: 0 };
    this.role = 'parked';
    this.edge = null;
    this.s = 0;
    this.targetSpeed = rand(10.5, 14.5);
    this.stuckT = 0;
    this.spin = 0;
    this.color = color;
    this.mesh = buildCarMesh(type, color);
    G.scene.add(this.mesh);
  }

  forward() { return { x: Math.sin(this.heading), z: Math.cos(this.heading) }; }
  rightV() { return { x: -Math.cos(this.heading), z: Math.sin(this.heading) }; }

  drivePlayer(input, dt) {
    const st = this.stats;
    const hb = input.handbrake;
    let acc = 0;
    if (input.up) acc = st.accel;
    if (input.down) {
      if (this.vF > 0.6) acc = -st.brake;
      else acc = -st.accel * 0.5;
    }
    if (!input.up && !input.down) {
      this.vF -= Math.sign(this.vF) * Math.min(Math.abs(this.vF), 2.2 * dt);
    }
    if (hb) this.vF -= Math.sign(this.vF) * Math.min(Math.abs(this.vF), st.brake * 1.05 * dt);
    this.vF = clamp(this.vF + acc * dt, -st.reverseMax, st.maxSpeed);
    this.vF *= 1 - 0.05 * dt;

    const tf = clamp(Math.abs(this.vF) / 6, 0, 1) * (1.18 - 0.55 * clamp(Math.abs(this.vF) / st.maxSpeed, 0, 1));
    const dth = input.steer * st.steer * tf * dt * (this.vF < -0.5 ? -1 : 1);
    this.heading += dth;
    const transfer = hb ? 0.55 : 0.16;
    this.vL += dth * this.vF * transfer;
    const gripRate = hb ? st.handbrakeGrip : st.grip;
    this.vL *= Math.exp(-gripRate * dt);
    this.integrate(dt);
  }

  integrate(dt) {
    const f = this.forward(), r = this.rightV();
    const vx = f.x * this.vF + r.x * this.vL;
    const vz = f.z * this.vF + r.z * this.vL;
    this.pos.x += (vx + this.push.x) * dt;
    this.pos.z += (vz + this.push.z) * dt;
    this.push.x *= Math.exp(-5 * dt);
    this.push.z *= Math.exp(-5 * dt);
  }

  worldCollide(G) {
    const r = this.stats.radius;
    let impact = 0;
    for (const c of G.colliders) {
      const cx = clamp(this.pos.x, c.x1, c.x2);
      const cz = clamp(this.pos.z, c.z1, c.z2);
      const dx = this.pos.x - cx, dz = this.pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      let nx, nz, depth;
      if (d2 < 1e-6) {
        const toCx = this.pos.x - (c.x1 + c.x2) / 2;
        const toCz = this.pos.z - (c.z1 + c.z2) / 2;
        if (Math.abs(toCx) > Math.abs(toCz)) { nx = Math.sign(toCx) || 1; nz = 0; depth = (c.x2 - c.x1) / 2 + r - Math.abs(toCx); }
        else { nx = 0; nz = Math.sign(toCz) || 1; depth = (c.z2 - c.z1) / 2 + r - Math.abs(toCz); }
        depth = Math.max(depth, 0.01);
      } else {
        const d = Math.sqrt(d2);
        nx = dx / d; nz = dz / d; depth = r - d;
      }
      this.pos.x += nx * depth; this.pos.z += nz * depth;
      const f = this.forward(), rt = this.rightV();
      const vw = (this.vF * f.x + this.vL * rt.x) * nx + (this.vF * f.z + this.vL * rt.z) * nz;
      if (vw < 0) {
        impact = Math.max(impact, -vw);
        this.vF -= (f.x * nx + f.z * nz) * vw * 1.35;
        this.vL -= (rt.x * nx + rt.z * nz) * vw * 1.35;
      }
    }
    return impact;
  }
}

// ---------------------------------------------------------------------------
// Init: auto iniziali, parcheggiate, traffico, pedoni
// ---------------------------------------------------------------------------
export function initVehicles(G) {
  G.vehicles = [];
  G.peds = [];
  G.trafficCount = 26;

  const starter = new Vehicle(G, 'compact', 5.4, 76, Math.PI, 0xc0392b);
  G.vehicles.push(starter);
  const starter2 = new Vehicle(G, 'sport', -5.4, 89, 0, 0xd42a2a);
  G.vehicles.push(starter2);

  let tries = 0, parked = 0;
  while (parked < 14 && tries < 250) {
    tries++;
    const vertical = Math.random() < 0.5;
    const rx = pick(ROAD_X), rz = pick(ROAD_Z);
    const t = rand(-165, 165);
    let x, z, heading;
    if (vertical) {
      if (Math.abs(t) < 42) continue;
      const side = Math.random() < 0.5 ? 5.4 : -5.4;
      x = rx + side; z = t; heading = side < 0 ? 0 : Math.PI;
    } else {
      if (Math.abs(rx) > 165) continue;
      const side = Math.random() < 0.5 ? 5.4 : -5.4;
      z = rz + side; x = t; heading = side < 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    if (G.vehicles.some(v => dist2d(v.pos.x, v.pos.z, x, z) < 12)) continue;
    if (dist2d(x, z, 5.4, 76) < 18 && dist2d(x, z, -5.4, 89) < 18) continue;
    const type = pick(['compact', 'compact', 'sport', 'van']);
    G.vehicles.push(new Vehicle(G, type, x, z, heading, pick(VEHICLE_TYPES[type].colors)));
    parked++;
  }

  for (let i = 0; i < G.trafficCount; i++) spawnTrafficCar(G);
  if (G.player) for (let i = 0; i < 60; i++) spawnPed(G);
}

export function spawnTrafficCar(G) {
  const nodes = G.nav.nodes;
  const px = G.player ? (G.player.vehicle ? G.player.vehicle.pos.x : G.player.pos.x) : 0;
  const pz = G.player ? (G.player.vehicle ? G.player.vehicle.pos.z : G.player.pos.z) : 0;
  let a = 0, b = 0, ok = false;
  for (let i = 0; i < 30; i++) {
    a = randi(0, nodes.length - 1);
    const node = nodes[a];
    if (!node.links.length) continue;
    b = pick(node.links).n;
    if (dist2d(nodes[a].x, nodes[a].z, px, pz) > 55) { ok = true; break; }
  }
  if (!ok) return;
  const type = pick(['compact', 'compact', 'compact', 'van', 'sport']);
  const v = new Vehicle(G, type, nodes[a].x, nodes[a].z, 0, pick(VEHICLE_TYPES[type].colors));
  v.role = 'traffic';
  v.edge = { a, b };
  const dir = { x: nodes[b].x - nodes[a].x, z: nodes[b].z - nodes[a].z };
  const l = Math.hypot(dir.x, dir.z) || 1;
  v.heading = Math.atan2(dir.x / l, dir.z / l);
  v.speed = v.targetSpeed;
  G.vehicles.push(v);
  return v;
}

// ---------------------------------------------------------------------------
// Pedoni
// ---------------------------------------------------------------------------
const pedGeoBody = new THREE.BoxGeometry(0.42, 0.75, 0.26);
const pedGeoHead = new THREE.SphereGeometry(0.16, 8, 6);
const pedGeoLegs = new THREE.BoxGeometry(0.36, 0.7, 0.24);

export function spawnPed(G) {
  const g = new THREE.Group();
  const col = pick(PED_COLORS);
  const body = new THREE.Mesh(pedGeoBody, new THREE.MeshLambertMaterial({ color: col }));
  body.position.y = 1.05;
  body.castShadow = true;
  const head = new THREE.Mesh(pedGeoHead, new THREE.MeshLambertMaterial({ color: 0xd8a886 }));
  head.position.y = 1.6;
  const legs = new THREE.Mesh(pedGeoLegs, new THREE.MeshLambertMaterial({ color: 0x2c2c34 }));
  legs.position.y = 0.35;
  g.add(body, head, legs);
  const r = pick(G.pedPaths);
  const per = perimeterLen(r);
  const p0 = rectPoint(r, rand(0, per));
  g.position.set(p0.x, 0.12, p0.z);
  G.scene.add(g);
  const ped = {
    mesh: g, rect: r, s: rand(0, per), dir: Math.random() < 0.5 ? 1 : -1,
    speed: rand(1.1, 1.7), state: 'walk', knock: 0, baseY: 0.12, wob: rand(0, 9)
  };
  G.peds.push(ped);
  return ped;
}

function perimeterLen(r) { return 2 * ((r.x2 - r.x1) + (r.z2 - r.z1)); }

function rectPoint(r, s) {
  const w = r.x2 - r.x1, h = r.z2 - r.z1;
  const per = 2 * (w + h);
  s = ((s % per) + per) % per;
  if (s < w) return { x: r.x1 + s, z: r.z1 };
  s -= w;
  if (s < h) return { x: r.x2, z: r.z1 + s };
  s -= h;
  if (s < w) return { x: r.x2 - s, z: r.z2 };
  s -= w;
  return { x: r.x1, z: r.z2 - s };
}

// ---------------------------------------------------------------------------
// Update veicoli
// ---------------------------------------------------------------------------
export function updateVehicles(G, dt) {
  for (const v of G.vehicles) {
    if (v.role === 'player') {
      const input = {
        up: G.keys['w'] || G.keys['arrowup'],
        down: G.keys['s'] || G.keys['arrowdown'],
        steer: (G.keys['a'] || G.keys['arrowleft'] ? 1 : 0) - (G.keys['d'] || G.keys['arrowright'] ? 1 : 0),
        handbrake: !!G.keys[' ']
      };
      v.drivePlayer(input, dt);
    } else if (v.role === 'traffic') {
      aiTraffic(G, v, dt);
    } else if (v.role === 'police') {
      aiPolice(G, v, dt);
    } else if (v.role === 'race') {
      aiRace(G, v, dt);
    } else {
      v.vF *= Math.exp(-3 * dt);
      v.vL *= Math.exp(-6 * dt);
      v.integrate(dt);
    }
    if (v.role !== 'race') {
      const imp = v.worldCollide(G);
      if (imp > 6 && v.role === 'player') {
        G.audio.crash(imp / 8);
        addHeat(G, imp > 14 ? 14 : 8);
      }
    }
  }

  vehicleCollisions(G);
  pedUpdate(G, dt);

  const night = G.night;
  for (const v of G.vehicles) {
    v.mesh.position.set(v.pos.x, 0, v.pos.z);
    v.mesh.rotation.y = v.heading;
    v.spin += v.vF * dt / 0.34;
    for (const w of v.mesh.userData.wheels) w.rotation.x = v.spin;
    for (const h of v.mesh.userData.lights.heads) h.material.emissiveIntensity = night ? 1.5 : 0;
    for (const t of v.mesh.userData.lights.tails) t.material.emissiveIntensity = (night || v.vF < -0.5) ? 1.3 : 0;
    if (v.role === 'police') {
      const phase = Math.floor(G.elapsed * 6) % 2;
      v.mesh.userData.lights.sirens[0].material.emissiveIntensity = phase ? 2.4 : 0;
      v.mesh.userData.lights.sirens[1].material.emissiveIntensity = phase ? 0 : 2.4;
    }
  }

  updateWanted(G, dt);
}

function aiTraffic(G, v, dt) {
  const nodes = G.nav.nodes;
  const e = v.edge;
  const a = nodes[e.a], b = nodes[e.b];
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  const dirx = dx / len, dirz = dz / len;
  const fwd = v.forward();
  const rgt = { x: -dirz * -1, z: dirx * -1 }; // destra rispetto alla direzione

  const proj = (v.pos.x - a.x) * dirx + (v.pos.z - a.z) * dirz;
  v.s = clamp(proj, -2, len);

  if (v.s >= len - 2) {
    const opts = b.links.filter(l => l.n !== e.a);
    const pool = opts.length ? opts : b.links;
    let next = pick(pool);
    const straight = pool.find(l => isStraight(e, l, nodes));
    if (straight && Math.random() < 0.55) next = straight;
    v.edge = { a: e.b, b: next.n };
    v.s = 0;
  }

  const look = Math.min(v.s + 7, len);
  const tx = a.x + dirx * look - dirz * LANE;
  const tz = a.z + dirz * look + dirx * LANE;
  const desired = Math.atan2(tx - v.pos.x, tz - v.pos.z);
  v.heading = angMoveTowards(v.heading, desired, 2.6 * dt);

  let limit = v.targetSpeed;
  const p = G.player;
  const px = p.vehicle ? p.vehicle.pos.x : p.pos.x;
  const pz = p.vehicle ? p.vehicle.pos.z : p.pos.z;
  limit = Math.min(limit, obstacleLimit(G, v, px, pz, p.vehicle ? p.vehicle.vF : 0, fwd));
  for (const o of G.vehicles) {
    if (o === v || o.role === 'parked') continue;
    limit = Math.min(limit, obstacleLimit(G, v, o.pos.x, o.pos.z, o.role === 'player' ? o.vF : (o.vF || o.speed || 0), fwd, o));
  }

  if (v.speed < limit) v.speed = Math.min(limit, v.speed + 7 * dt);
  else v.speed = Math.max(limit, v.speed - 16 * dt);

  v.pos.x += fwd.x * v.speed * dt + v.push.x * dt;
  v.pos.z += fwd.z * v.speed * dt + v.push.z * dt;
  v.vF = v.speed;
  v.push.x *= Math.exp(-5 * dt);
  v.push.z *= Math.exp(-5 * dt);
}

function isStraight(e, l, nodes) {
  const a = nodes[e.a], b = nodes[e.b], c = nodes[l.n];
  const d1x = b.x - a.x, d1z = b.z - a.z;
  const d2x = c.x - b.x, d2z = c.z - b.z;
  const dot = (d1x * d2x + d1z * d2z) / ((Math.hypot(d1x, d1z) || 1) * (Math.hypot(d2x, d2z) || 1));
  return dot > 0.99;
}

function obstacleLimit(G, v, ox, oz, oSpeed, fwd, other) {
  const dx = ox - v.pos.x, dz = oz - v.pos.z;
  const dfwd = dx * fwd.x + dz * fwd.z;
  if (dfwd <= 0.5 || dfwd > 12) return Infinity;
  const rx = -fwd.z, rz = fwd.x;
  const dlat = Math.abs(dx * rx + dz * rz);
  const maxLat = other ? (v.stats.radius + other.stats.radius) * 0.75 : 2.4;
  if (dlat > maxLat) return Infinity;
  if (dfwd < 4.5) return 0;
  return Math.max(0, oSpeed || 0);
}

function aiPolice(G, v, dt) {
  const p = G.player;
  const tx = p.vehicle ? p.vehicle.pos.x : p.pos.x;
  const tz = p.vehicle ? p.vehicle.pos.z : p.pos.z;
  let desired = Math.atan2(tx - v.pos.x, tz - v.pos.z);

  const f = v.forward();
  const probeX = v.pos.x + f.x * (6 + Math.abs(v.vF) * 0.4);
  const probeZ = v.pos.z + f.z * (6 + Math.abs(v.vF) * 0.4);
  for (const c of G.colliders) {
    if (probeX > c.x1 - 2.5 && probeX < c.x2 + 2.5 && probeZ > c.z1 - 2.5 && probeZ < c.z2 + 2.5 && c.h > 2.5) {
      desired += (Math.sin(v.heading) * ((c.x1 + c.x2) / 2) + Math.cos(v.heading) * ((c.z1 + c.z2) / 2) > 0) ? -1.0 : 1.0;
      break;
    }
  }

  const st = v.stats;
  const tf = clamp(Math.abs(v.vF) / 5, 0.3, 1) * 1.1;
  v.heading = angMoveTowards(v.heading, desired, 2.5 * tf * dt);
  const targetSpeed = st.maxSpeed * (0.72 + 0.06 * G.wanted.stars);
  if (v.vF < targetSpeed) v.vF = Math.min(targetSpeed, v.vF + st.accel * dt);
  else v.vF = Math.max(targetSpeed, v.vF - st.brake * 0.25 * dt);
  const grip = Math.abs(angDiff(v.heading, desired)) > 0.8 ? 2.8 : st.grip;
  v.vL *= Math.exp(-grip * dt);
  v.integrate(dt);

  if (Math.abs(v.vF) < 1.2) {
    v.stuckT += dt;
    if (v.stuckT > 2.2) {
      v.stuckT = 0;
      relocatePolice(G, v);
    }
  } else v.stuckT = 0;
}

function relocatePolice(G, v) {
  const nodes = G.nav.nodes;
  const p = G.player;
  const px = p.vehicle ? p.vehicle.pos.x : p.pos.x;
  const pz = p.vehicle ? p.vehicle.pos.z : p.pos.z;
  for (let i = 0; i < 40; i++) {
    const n = pick(nodes);
    const d = dist2d(n.x, n.z, px, pz);
    if (d > 60 && d < 150) {
      v.pos.set(n.x, 0, n.z);
      v.vF = 0; v.vL = 0; v.speed = 0;
      v.heading = Math.atan2(px - n.x, pz - n.z);
      return;
    }
  }
}

function aiRace(G, v, dt) {
  const t = v.raceWp;
  const desired = Math.atan2(t.x - v.pos.x, t.z - v.pos.z);
  const tf = clamp(Math.abs(v.vF) / 5, 0.3, 1) * 1.1;
  v.heading = angMoveTowards(v.heading, desired, 2.2 * tf * dt);
  const cap = v.raceSpeed * (Math.abs(angDiff(v.heading, desired)) > 0.7 ? 0.65 : 1);
  if (v.vF < cap) v.vF = Math.min(cap, v.vF + v.stats.accel * 0.7 * dt);
  v.vL *= Math.exp(-6 * dt);
  v.integrate(dt);
  v.worldCollide(G);
  if (dist2d(v.pos.x, v.pos.z, t.x, t.z) < 13) {
    v.raceIdx++;
    if (v.raceIdx < v.raceCps.length) v.raceWp = v.raceCps[v.raceIdx];
  }
}

// ---------------------------------------------------------------------------
// Collisioni veicolo-veicolo
// ---------------------------------------------------------------------------
let lastCrashSnd = 0;
function vehicleCollisions(G) {
  const list = G.vehicles;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const A = list[i], B = list[j];
      const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z;
      const rr = A.stats.radius + B.stats.radius;
      const d2 = dx * dx + dz * dz;
      if (d2 >= rr * rr || d2 < 1e-8) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d, nz = dz / d;
      const overlap = rr - d;
      const aStatic = A.role === 'parked';
      const bStatic = B.role === 'parked';
      if (!aStatic) { A.pos.x -= nx * overlap * (aStatic || bStatic ? 1 : 0.5); A.pos.z -= nz * overlap * (aStatic || bStatic ? 1 : 0.5); }
      if (!bStatic) { B.pos.x += nx * overlap * (aStatic || bStatic ? 1 : 0.5); B.pos.z += nz * overlap * (aStatic || bStatic ? 1 : 0.5); }
      if (aStatic && bStatic) continue;

      const fa = A.forward(), ra = A.rightV(), fb = B.forward(), rb = B.rightV();
      const vAn = (A.vF * fa.x + A.vL * ra.x) * nx + (A.vF * fa.z + A.vL * ra.z) * nz;
      const vBn = (B.vF * fb.x + B.vL * rb.x) * nx + (B.vF * fb.z + B.vL * rb.z) * nz;
      const jimp = vAn - vBn;
      if (Math.abs(jimp) < 1) continue;

      const pInv = A.role === 'player' || B.role === 'player';
      if (pInv) {
        const player = A.role === 'player' ? A : B;
        const other = A.role === 'player' ? B : A;
        const towards = A.role === 'player' ? jimp > 0 : jimp < 0;
        const k = jimp * 0.25;
        if (player.role === 'player') {
          player.vF -= (fa.x * nx + fa.z * nz) * k;
          player.vL -= (ra.x * nx + ra.z * nz) * k;
        }
        if (other.role === 'traffic') {
          other.push.x += nx * Math.sign(jimp) * Math.min(10, Math.abs(jimp));
          other.push.z += nz * Math.sign(jimp) * Math.min(10, Math.abs(jimp));
          other.speed = Math.max(0, other.speed - Math.abs(jimp) * 0.6);
        }
        if (Math.abs(jimp) > 4.5 && G.elapsed - lastCrashSnd > 0.25) {
          lastCrashSnd = G.elapsed;
          G.audio.crash(Math.abs(jimp) / 6);
          if (towards && other.role !== 'police' && other.role !== 'race') {
            addHeat(G, Math.abs(jimp) > 10 ? 13 : 7);
          }
        }
      } else {
        A.push.x -= nx * 3; A.push.z -= nz * 3;
        B.push.x += nx * 3; B.push.z += nz * 3;
        A.vF *= 0.7; B.vF *= 0.7;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pedoni update
// ---------------------------------------------------------------------------
function pedUpdate(G, dt) {
  for (const ped of G.peds) {
    const m = ped.mesh.position;
    if (ped.state === 'down') {
      ped.knock -= dt;
      ped.mesh.rotation.x = Math.min(Math.PI / 2, ped.mesh.rotation.x + dt * 6);
      if (ped.knock <= 0) { ped.state = 'walk'; ped.mesh.rotation.x = 0; }
      continue;
    }

    const p = G.player;
    let scx = 0, scz = 0, scare = 0;
    if (p.vehicle && Math.abs(p.vehicle.vF) > 3) {
      const d = dist2d(p.vehicle.pos.x, p.vehicle.pos.z, m.x, m.z);
      if (d < 9 && d > 0.01) { scare = 1; scx += (m.x - p.vehicle.pos.x) / d; scz += (m.z - p.vehicle.pos.z) / d; }
    }
    for (const v of G.vehicles) {
      if (v.role !== 'traffic' || v.speed < 4) continue;
      const d = dist2d(v.pos.x, v.pos.z, m.x, m.z);
      if (d < 7 && d > 0.01) { scare = 1; scx += (m.x - v.pos.x) / d; scz += (m.z - v.pos.z) / d; }
    }

    if (scare) {
      m.x += scx * 2.8 * dt;
      m.z += scz * 2.8 * dt;
      m.x = clamp(m.x, -236, 236);
      m.z = clamp(m.z, -236, 236);
      if (Math.abs(m.z) < 25.5 && Math.abs(m.x) > 20) m.z = Math.sign(m.z || 1) * 26.5;
    } else {
      ped.s += ped.speed * dt * ped.dir;
      const q = rectPoint(ped.rect, ped.s);
      m.x = q.x; m.z = q.z;
      ped.mesh.rotation.y = ped.dir > 0 ? 0 : Math.PI;
    }
    ped.wob += dt * 8;
    m.y = ped.baseY + Math.abs(Math.sin(ped.wob)) * 0.05;
  }
}

export function checkPedHits(G) {
  const pv = G.player.vehicle;
  if (!pv || Math.abs(pv.vF) < 5) return;
  for (const ped of G.peds) {
    if (ped.state === 'down') continue;
    const m = ped.mesh.position;
    const d = dist2d(pv.pos.x, pv.pos.z, m.x, m.z);
    if (d < 2.1) {
      ped.state = 'down';
      ped.knock = 3.5;
      const f = pv.forward();
      m.x = pv.pos.x + f.x * 1.8 + rand(-1, 1);
      m.z = pv.pos.z + f.z * 1.8 + rand(-1, 1);
      G.audio.crash(0.8);
      addHeat(G, 20, 'Pedone investito!');
    }
  }
}

// ---------------------------------------------------------------------------
// Livello di sospetto (stelle)
// ---------------------------------------------------------------------------
export function addHeat(G, amount, label) {
  const w = G.wanted;
  w.heat = clamp(w.heat + amount, 0, 200);
  w.evadeT = 0;
  const stars = heatToStars(w.heat);
  if (stars !== w.stars) {
    w.stars = stars;
    if (stars > 0) G.ui.wantedFlash();
  }
  if (label && amount > 0) G.ui.toast(`⚠ ${label} — Sospetto ${heatToStars(w.heat)}★`, 'bad');
  G.ui.starsDirty = true;
}

function heatToStars(heat) {
  let s = 0;
  if (heat > 0) s = 1;
  if (heat >= 32) s = 2;
  if (heat >= 58) s = 3;
  if (heat >= 88) s = 4;
  if (heat >= 125) s = 5;
  return s;
}

export function setWanted(G, stars) {
  const heatMap = [0, 12, 32, 58, 88, 125];
  G.wanted.heat = heatMap[stars] || 0;
  G.wanted.stars = stars;
}

export function setWantedLock(G, stars, value) {
  if (value) {
    G.wanted.lock = true;
    G.wanted.lockStars = stars;
    setWanted(G, stars);
    G.wanted.stars = stars;
  } else {
    G.wanted.lock = false;
    G.wanted.lockStars = 0;
  }
}

function updateWanted(G, dt) {
  const w = G.wanted;
  const px = G.player.vehicle ? G.player.vehicle.pos.x : G.player.pos.x;
  const pz = G.player.vehicle ? G.player.vehicle.pos.z : G.player.pos.z;
  const police = G.vehicles.filter(v => v.role === 'police');
  const desired = Math.min(w.stars, 4);

  if (w.stars > 0) {
    if (police.length < desired && G.elapsed - (w.lastSpawn || 0) > 2.5) {
      w.lastSpawn = G.elapsed;
      spawnPoliceCar(G, px, pz);
    }
  } else {
    for (const v of [...police]) removeVehicle(G, v);
  }

  if (w.stars > 0) {
    if (police.length > desired) {
      let far = police[0];
      for (const v of police) if (dist2d(v.pos.x, v.pos.z, px, pz) > dist2d(far.pos.x, far.pos.z, px, pz)) far = v;
      removeVehicle(G, far);
    }

    if (!w.lock) {
      let minD = Infinity;
      for (const v of police) minD = Math.min(minD, dist2d(v.pos.x, v.pos.z, px, pz));
      if (minD > 75 || police.length === 0) {
        w.evadeT += dt;
        if (w.evadeT > 6) {
          w.heat = 0; w.stars = 0; w.evadeT = 0;
          G.ui.toast('Hai seminato la polizia! Stelle azzerate.', 'money');
          for (const v of [...police]) removeVehicle(G, v);
        }
      } else w.evadeT = 0;
    }
  } else if (!w.lock) {
    w.heat = Math.max(0, w.heat - 3 * dt);
  }

  if (!G.player.vehicle) {
    for (const v of police) {
      if (w.stars > 0 && dist2d(v.pos.x, v.pos.z, G.player.pos.x, G.player.pos.z) < 3.6 && Math.abs(v.vF) < 8) {
        G.money = Math.max(0, G.money - 100);
        G.ui.toast('🚨 Fermato dalla Gendarmerie! Multa: −100 €', 'bad');
        setWanted(G, 0);
        for (const pv of [...G.vehicles.filter(x => x.role === 'police')]) removeVehicle(G, pv);
        break;
      }
    }
  }
  checkPedHits(G);
}

export function removeVehicle(G, v) {
  const i = G.vehicles.indexOf(v);
  if (i >= 0) G.vehicles.splice(i, 1);
  G.scene.remove(v.mesh);
}

function spawnPoliceCar(G, px, pz) {
  const nodes = G.nav.nodes;
  for (let i = 0; i < 50; i++) {
    const n = pick(nodes);
    const d = dist2d(n.x, n.z, px, pz);
    if (d > 80 && d < 165) {
      const v = new Vehicle(G, 'police', n.x, n.z, Math.atan2(px - n.x, pz - n.z), 0x10135a);
      v.role = 'police';
      G.vehicles.push(v);
      return v;
    }
  }
  const n = pick(nodes);
  const v = new Vehicle(G, 'police', n.x, n.z, 0, 0x10135a);
  v.role = 'police';
  G.vehicles.push(v);
  return v;
}
