import * as THREE from 'three';
import { VEHICLE_TYPES, MAP_LIMIT } from './config.js';
import { clamp, damp, angDiff, dist2d } from './utils.js';
import { spawnPed } from './vehicles.js';

export function initPlayer(G) {
  const g = new THREE.Group();

  const matSkin = new THREE.MeshLambertMaterial({ color: 0xd8a886 });
  const matShirt = new THREE.MeshLambertMaterial({ color: 0x2a4d69 });
  const matPants = new THREE.MeshLambertMaterial({ color: 0x42302a });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), matShirt);
  torso.position.y = 1.28;
  torso.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), matSkin);
  head.position.y = 1.82;
  head.castShadow = true;
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.16), matShirt);
  armL.position.set(-0.34, 1.25, 0);
  const armR = armL.clone();
  armR.position.x = 0.34;
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.78, 0.2), matPants);
  legL.position.set(-0.14, 0.42, 0);
  legL.castShadow = true;
  const legR = legL.clone();
  legR.position.x = 0.14;

  g.add(torso, head, armL, armR, legL, legR);
  g.position.set(8.5, 0.12, 76);
  G.scene.add(g);

  G.player = {
    mesh: g, pos: g.position,
    heading: Math.PI, moveSpeed: 0,
    vehicle: null, enterCd: 0, knock: 0, camYaw: Math.PI, camPitch: 0.32,
    camIdle: 0, baseY: 0.12, legs: [legL, legR], arms: [armL, armR],
    vy: 0, jumpY: 0,
    pos3: new THREE.Vector3()
  };

  // coppia di fari reali (solo per il veicolo del giocatore)
  const mkBeam = (sx) => {
    const s = new THREE.SpotLight(0xfff2cc, 0, 55, 0.6, 0.5, 1.2);
    s.position.set(sx, 0.8, 2);
    s.target.position.set(sx * 2, 0.2, 30);
    G.scene.add(s);
    G.scene.add(s.target);
    return s;
  };
  G.headlights = [mkBeam(-0.7), mkBeam(0.7)];
}

export function updatePlayer(G, dt) {
  const p = G.player;
  p.enterCd = Math.max(0, p.enterCd - dt);

  if (p.knock > 0) {
    p.knock -= dt;
    p.mesh.rotation.x = Math.min(Math.PI / 2, p.mesh.rotation.x + dt * 6);
    if (p.knock <= 0) p.mesh.rotation.x = 0;
  } else if (!p.vehicle && p.mesh.rotation.x > 0) {
    p.mesh.rotation.x = Math.max(0, p.mesh.rotation.x - dt * 4);
  }

  if (p.vehicle) {
    driveStep(G, dt);
  } else {
    footStep(G, dt);
  }

  updateCamera(G, dt);
  updateHeadlights(G);
}

function footStep(G, dt) {
  const p = G.player;
  const run = G.keys['shift'] ? 1.75 : 1;
  let mx = 0, mz = 0;
  if (G.keys['w'] || G.keys['arrowup']) mz += 1;
  if (G.keys['s'] || G.keys['arrowdown']) mz -= 1;
  if (G.keys['a'] || G.keys['arrowleft']) mx -= 1;
  if (G.keys['d'] || G.keys['arrowright']) mx += 1;
  const moving = mx !== 0 || mz !== 0;

  // salto (Spazio quando sei a piedi)
  if (G.keysPressed[' '] && p.jumpY <= 0.01 && p.knock <= 0) p.vy = 5.2;
  if (p.jumpY > 0 || p.vy !== 0) {
    p.vy -= 11 * dt;
    p.jumpY = Math.max(0, p.jumpY + p.vy * dt);
    if (p.jumpY === 0) p.vy = 0;
  }

  if (moving && p.knock <= 0) {
    const camYaw = p.camYaw;
    const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
    const rx = -fz, rz = fx;
    const dirx = fx * mz + rx * mx;
    const dirz = fz * mz + rz * mx;
    const l = Math.hypot(dirx, dirz) || 1;
    const speed = 4.2 * run;
    p.pos.x += (dirx / l) * speed * dt;
    p.pos.z += (dirz / l) * speed * dt;
    p.moveSpeed = speed;
    const targetHeading = Math.atan2(dirx / l, dirz / l);
    p.heading += angDiff(p.heading, targetHeading) * Math.min(1, dt * 12);
  } else {
    p.moveSpeed = 0;
  }

  p.pos.x = clamp(p.pos.x, -MAP_LIMIT, MAP_LIMIT);
  p.pos.z = clamp(p.pos.z, -MAP_LIMIT, MAP_LIMIT);

  // collisione con edifici / monumenti
  resolveCircleColliders(G, p.pos, 0.45);

  // urto con veicoli veloci
  for (const v of G.vehicles) {
    if (Math.abs(v.vF) < 7) continue;
    const d = dist2d(v.pos.x, v.pos.z, p.pos.x, p.pos.z);
    if (d < v.stats.radius + 0.4) {
      if (p.knock <= 0) {
        p.knock = 1.6;
        G.audio.crash(0.6);
        const f = v.forward();
        p.pos.x += f.x * 2.2; p.pos.z += f.z * 2.2;
      }
    }
  }

  // entrata/uscita veicolo
  const nearest = nearestEnterable(G);
  G.hintText = nearest ? `Premi <b>E</b> per salire sulla ${nearest.stats.name}` : null;
  if ((G.keysPressed['e'] || G.keysPressed['f']) && nearest && p.enterCd <= 0) {
    enterVehicle(G, nearest);
  }

  if (p.pos.y < -1) { p.pos.set(8.5, 0.12, 76); }

  // animazione
  const sw = Math.sin(G.elapsed * (p.moveSpeed > 6 ? 13 : 9)) * (p.moveSpeed > 0 ? 0.55 : 0);
  p.legs[0].rotation.x = sw;
  p.legs[1].rotation.x = -sw;
  p.arms[0].rotation.x = -sw * 0.7;
  p.arms[1].rotation.x = sw * 0.7;

  p.mesh.position.set(p.pos.x, 0.12 + p.jumpY, p.pos.z);
  p.mesh.rotation.y = p.heading;
}

function driveStep(G, dt) {
  const p = G.player;
  G.hintText = null;
  if ((G.keysPressed['e'] || G.keysPressed['f']) && p.enterCd <= 0) exitVehicle(G);
}

function nearestEnterable(G) {
  const p = G.player;
  let best = null, bd = 4.5;
  for (const v of G.vehicles) {
    if (v.role !== 'parked' && v.role !== 'traffic') continue;
    const d = dist2d(v.pos.x, v.pos.z, p.pos.x, p.pos.z);
    if (d < bd) { bd = d; best = v; }
  }
  return best;
}

export function enterVehicle(G, v) {
  const p = G.player;
  if (v.role === 'traffic') {
    const ped = spawnPed(G);
    ped.mesh.position.set(v.pos.x, 0.12, v.pos.z);
    ped.rect = { x1: v.pos.x - 20, z1: v.pos.z - 20, x2: v.pos.x + 20, z2: v.pos.z + 20 };
    ped.s = 0;
    G.ui.toast("Hai rubato un'auto! Il conducente scappa.", 'bad');
    G.missions.onCarjack(G);
  }
  v.role = 'player';
  v.push.x = 0; v.push.z = 0;
  v.vL *= 0.5;
  p.vehicle = v;
  p.mesh.visible = false;
  p.enterCd = 0.6;
  G.audio.pedalChime();
  G.camIdle = 99;
}

export function exitVehicle(G) {
  const p = G.player;
  const v = p.vehicle;
  if (!v) return;
  const r = v.rightV();
  for (const s of [1, -1]) {
    const nx = v.pos.x + r.x * 2.4 * s;
    const nz = v.pos.z + r.z * 2.4 * s;
    let hit = false;
    for (const c of G.colliders) {
      if (nx > c.x1 - 0.5 && nx < c.x2 + 0.5 && nz > c.z1 - 0.5 && nz < c.z2 + 0.5) { hit = true; break; }
    }
    if (!hit) {
      p.pos.set(nx, 0.12, nz);
      break;
    }
  }
  v.role = 'parked';
  v.vF = 0; v.vL = 0;
  p.vehicle = null;
  p.mesh.visible = true;
  p.mesh.position.set(p.pos.x, 0.12, p.pos.z);
  p.enterCd = 0.6;
}

function resolveCircleColliders(G, pos, r) {
  for (const c of G.colliders) {
    if (pos.y > c.h) continue;
    const cx = clamp(pos.x, c.x1, c.x2);
    const cz = clamp(pos.z, c.z1, c.z2);
    const dx = pos.x - cx, dz = pos.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    let nx, nz, depth;
    if (d2 < 1e-6) {
      const toCx = pos.x - (c.x1 + c.x2) / 2;
      const toCz = pos.z - (c.z1 + c.z2) / 2;
      if (Math.abs(toCx) > Math.abs(toCz)) { nx = Math.sign(toCx) || 1; nz = 0; depth = (c.x2 - c.x1) / 2 + r - Math.abs(toCx); }
      else { nx = 0; nz = Math.sign(toCz) || 1; depth = (c.z2 - c.z1) / 2 + r - Math.abs(toCz); }
    } else {
      const d = Math.sqrt(d2);
      nx = dx / d; nz = dz / d; depth = r - d;
    }
    pos.x += nx * Math.max(depth, 0.01);
    pos.z += nz * Math.max(depth, 0.01);
  }
}

// ---------------------------------------------------------------------------
// Telecamera in terza persona
// ---------------------------------------------------------------------------
const camTarget = new THREE.Vector3();
const camPos = new THREE.Vector3();

function updateCamera(G, dt) {
  const p = G.player;
  const cam = G.camera;

  if (p.vehicle) {
    camTarget.set(p.vehicle.pos.x, 1.4, p.vehicle.pos.z);
  } else {
    camTarget.set(p.pos.x, 1.7, p.pos.z);
  }

  // ricentra la camera dietro l'auto se il mouse è fermo
  if (p.vehicle && p.camIdle > 1.2 && Math.abs(p.vehicle.vF) > 4) {
    const targetYaw = p.vF >= 0 ? p.vehicle.heading : p.vehicle.heading + Math.PI;
    p.camYaw += angDiff(p.camYaw, targetYaw) * Math.min(1, dt * 1.8);
  }

  const st = p.vehicle ? p.vehicle.stats : null;
  const dist = st ? st.camDist + Math.abs(p.vehicle.vF) * 0.06 : 6.2;
  const height = (st ? st.camHeight : 2.4) + p.camPitch * 6;

  const cx = camTarget.x - Math.sin(p.camYaw) * Math.cos(p.camPitch) * dist;
  const cz = camTarget.z - Math.cos(p.camYaw) * Math.cos(p.camPitch) * dist;
  const cy = camTarget.y + height;

  camPos.set(cx, cy, cz);
  const rate = p.vehicle ? 6 : 9;
  cam.position.x = damp(cam.position.x, camPos.x, rate, dt);
  cam.position.y = damp(cam.position.y, camPos.y, rate, dt);
  cam.position.z = damp(cam.position.z, camPos.z, rate, dt);
  cam.lookAt(camTarget);

  const spd = p.vehicle ? Math.abs(p.vehicle.vF) : 0;
  const targetFov = 58 + clamp(spd / 38, 0, 1) * 14;
  if (Math.abs(cam.fov - targetFov) > 0.2) {
    cam.fov = damp(cam.fov, targetFov, 3, dt);
    cam.updateProjectionMatrix();
  }
}

function updateHeadlights(G) {
  const p = G.player;
  const on = G.night && p.vehicle;
  for (let i = 0; i < G.headlights.length; i++) {
    const s = G.headlights[i];
    if (on) {
      const v = p.vehicle;
      const f = v.forward();
      const r = v.rightV();
      const sx = i === 0 ? -0.7 : 0.7;
      s.intensity = 2.4;
      s.position.set(v.pos.x + f.x * 1.8 + r.x * sx, 0.9, v.pos.z + f.z * 1.8 + r.z * sx);
      s.target.position.set(v.pos.x + f.x * 30 + r.x * sx * 2, 0.3, v.pos.z + f.z * 30 + r.z * sx * 2);
    } else {
      s.intensity = 0;
    }
  }
}
