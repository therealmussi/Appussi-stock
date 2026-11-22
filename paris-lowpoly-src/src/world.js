import * as THREE from 'three';
import {
  ROAD_X, ROAD_Z, ROAD_HALF, RIVER_HALF, QUAI_OUT, MAP_LIMIT, MAP_RANGE,
  BRIDGE_X, PARK, PLAZA, EIFFEL, ARC
} from './config.js';
import { rand, randi, pick } from './utils.js';

const ASPHALT = 0x34343c;
const SIDEWALK = 0x9a948c;
const CURB = 0x7e786f;

function facadeTexture(base, winCol) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  x.fillStyle = winCol;
  for (let r = 0; r < 5; r++) {
    for (let col = 0; col < 4; col++) {
      const wx = 18 + col * 62, wy = 20 + r * 48;
      x.fillStyle = winCol;
      x.fillRect(wx, wy, 26, 34);
      x.fillStyle = 'rgba(255,255,255,0.65)';
      x.fillRect(wx - 2, wy + 34, 30, 3);
      x.fillRect(wx - 4, wy + 37, 34, 2);
      x.fillStyle = 'rgba(0,0,0,0.15)';
      x.fillRect(wx, wy, 26, 4);
    }
  }
  x.fillStyle = 'rgba(0,0,0,0.12)';
  x.fillRect(0, 42, 256, 3);
  x.fillRect(0, 138, 256, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeMansardGeometry(w, d, h, color) {
  const g = new THREE.BoxGeometry(w, h, d);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > 0) {
      pos.setX(i, pos.getX(i) * 0.25);
      pos.setZ(i, pos.getZ(i) * 0.25);
    } else {
      pos.setY(i, y - h * 0.35);
    }
  }
  g.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ color });
  const m = new THREE.Mesh(g, mat);
  return m;
}

export function buildWorld(G) {
  const scene = G.scene;
  G.colliders = [];
  G.lamps = [];
  G.mapMarkers = [];
  G.mapStatic = { park: PARK, plaza: PLAZA, eiffel: EIFFEL, arc: ARC };

  const addCollider = (x1, z1, x2, z2, h = 10) => {
    G.colliders.push({ x1: Math.min(x1, x2), z1: Math.min(z1, z2), x2: Math.max(x1, x2), z2: Math.max(z1, z2), h });
  };

  // Materiali di base
  const matAsphalt = new THREE.MeshLambertMaterial({ color: ASPHALT });
  const matSidewalk = new THREE.MeshLambertMaterial({ color: SIDEWALK });
  const matGrass = new THREE.MeshLambertMaterial({ color: 0x679a4e });
  const matWater = new THREE.MeshLambertMaterial({ color: 0x2a5c78, transparent: true, opacity: 0.92 });
  const matStone = new THREE.MeshLambertMaterial({ color: 0x8d8a80 });
  const matBase = new THREE.MeshLambertMaterial({ color: 0x55575e });

  // Facciate haussmanniane (texture canvas)
  const tints = [
    ['#ddd2c0', '#233243'], ['#d4c4b0', '#2a3644'],
    ['#e2d8c8', '#1f2d3d'], ['#cfc0ae', '#26303e']
  ];
  G.facadeMats = new Map();
  const facadeMat = (w, h, ti) => {
    const k = `${Math.round(w)}x${Math.round(h)}x${ti}`;
    if (G.facadeMats.has(k)) return G.facadeMats.get(k);
    const tex = facadeTexture(tints[ti][0], tints[ti][1]);
    tex.repeat.set(Math.max(1, Math.round(w / 14)), Math.max(1, Math.round(h / 5)));
    const m = new THREE.MeshLambertMaterial({ map: tex });
    G.facadeMats.set(k, m);
    return m;
  };
  const matRoof = new THREE.MeshLambertMaterial({ color: 0x6b7785 });

  // ---------- terreno ----------
  const mkPlane = (w, d, mat, y, x = 0, z = 0) => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(x, y, z);
    g.receiveShadow = true;
    scene.add(g);
    return g;
  };
  mkPlane(MAP_RANGE * 2, MAP_RANGE - QUAI_OUT, matBase, 0, 0, (QUAI_OUT + MAP_RANGE) / 2);
  mkPlane(MAP_RANGE * 2, MAP_RANGE - QUAI_OUT, matBase, 0, 0, -(QUAI_OUT + MAP_RANGE) / 2);

  // ---------- strade ----------
  const roadTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#34343c';
    x.fillRect(0, 0, 64, 256);
    x.fillStyle = '#c9c9c9';
    x.fillRect(30, 60, 4, 110);
    x.fillStyle = '#8a8a90';
    x.fillRect(0, 0, 3, 256); x.fillRect(61, 0, 3, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();

  const mkRoad = (len, rotY, x, z, alongZ) => {
    const tex = roadTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(1, len / 8);
    const m = new THREE.MeshLambertMaterial({ map: tex });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, len), m);
    g.rotation.set(-Math.PI / 2, 0, alongZ ? rotY : rotY + Math.PI / 2);
    g.position.set(x, 0.02, z);
    g.receiveShadow = true;
    scene.add(g);
  };
  for (const rx of ROAD_X) mkRoad(MAP_RANGE * 2, 0, rx, 0, true);
  for (const rz of ROAD_Z) mkRoad(MAP_RANGE * 2, 0, 0, rz, false);

  // Intersezioni: piazza d'asfalto che copre le strisce
  for (const rx of ROAD_X) for (const rz of ROAD_Z) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, ROAD_HALF * 2), matAsphalt);
    g.rotation.x = -Math.PI / 2;
    g.position.set(rx, 0.035, rz);
    scene.add(g);
  }

  // ---------- Senna, quai, ponti ----------
  mkPlane(MAP_RANGE * 2, RIVER_HALF * 2, matWater, -1.4, 0, 0);
  mkPlane(MAP_RANGE * 2, RIVER_HALF * 2 + 6, new THREE.MeshLambertMaterial({ color: 0x1a3a50 }), -2.2, 0, 0);
  mkPlane(480, QUAI_OUT - RIVER_HALF, matSidewalk, 0.12, 0, (RIVER_HALF + QUAI_OUT) / 2);
  mkPlane(480, QUAI_OUT - RIVER_HALF, matSidewalk, 0.12, 0, -(RIVER_HALF + QUAI_OUT) / 2);

  // balauarde lungo il fiume (collider ogni 10 m, gap ai ponti)
  for (const side of [-1, 1]) {
    let segments = [];
    let start = -MAP_RANGE * 0.96;
    const sorted = [...BRIDGE_X].sort((a, b) => a - b);
    for (const bx of sorted) {
      segments.push([start, bx - 6.2]);
      start = bx + 6.2;
    }
    segments.push([start, MAP_RANGE * 0.96]);
    for (const [s1, s2] of segments) {
      if (s2 - s1 < 1) continue;
      const g = new THREE.Mesh(new THREE.BoxGeometry(s2 - s1, 1.0, 0.5), matStone);
      g.position.set((s1 + s2) / 2, 0.6, side * (RIVER_HALF + 0.3));
      g.castShadow = true;
      scene.add(g);
      addCollider(s1, side * (RIVER_HALF + 0.4) - 0.5, s2, side * (RIVER_HALF + 0.4) + 0.5, 1.4);
    }
  }

  // ponti
  for (const bx of BRIDGE_X) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.3, 76), matStone);
    deck.position.set(bx, -0.0, 0);
    deck.receiveShadow = true;
    scene.add(deck);
    const asph = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 74), matAsphalt);
    asph.rotation.x = -Math.PI / 2;
    asph.position.set(bx, 0.16, 0);
    scene.add(asph);
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 75), matStone);
      rail.position.set(bx + s * 6.7, 0.7, 0);
      rail.castShadow = true;
      scene.add(rail);
      addCollider(bx + s * 6.7 - 0.4, -37, bx + s * 6.7 + 0.4, 37, 1.5);
    }
    for (const s of [-1, 1]) {
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 12, 12, 1, true, 0, Math.PI), matStone);
      arch.rotation.set(0, 0, Math.PI / 2);
      arch.rotation.x = 0;
      arch.position.set(bx, -1.9, s * 12);
      scene.add(arch);
    }
  }

  // ---------- isolati e palazzi ----------
  const xPairs = [];
  for (let i = 0; i < ROAD_X.length - 1; i++) xPairs.push([ROAD_X[i] + ROAD_HALF, ROAD_X[i + 1] - ROAD_HALF]);
  const zPairs = [];
  for (let i = 0; i < ROAD_Z.length; i++) {
    const a = ROAD_Z[i], b = ROAD_Z[i + 1];
    if (b === undefined) continue;
    if (a === -45 && b === 45) continue;
    zPairs.push([a + ROAD_HALF, b - ROAD_HALF]);
  }
  // ultimo punto oltre la strada più esterna? no: i blocchi sono solo tra le strade.

  G.blocks = [];
  G.pedPaths = [];

  const specialBlocks = [
    { x1: PARK.x1, z1: PARK.z1, x2: PARK.x2, z2: PARK.z2, kind: 'park' },
    { x1: 97, z1: -83, x2: 173, z2: -52, kind: 'plaza' }
  ];
  const isSpecial = (bx1, bz1, bx2, bz2, kind) =>
    specialBlocks.some(sp => sp.kind === kind &&
      Math.abs(bx1 - sp.x1) < 3 && Math.abs(bx2 - sp.x2) < 3 &&
      Math.abs(bz1 - sp.z1) < 3 && Math.abs(bz2 - sp.z2) < 3);

  for (const [bx1, bx2] of xPairs) {
    for (let zi = 0; zi < ROAD_Z.length; zi++) {
      const a = ROAD_Z[zi];
      const b = ROAD_Z[zi + 1];
      if (b === undefined) continue;
      if (a === -45 && b === 45) continue;
      const bz1 = a + ROAD_HALF, bz2 = b - ROAD_HALF;
      const block = { x1: bx1, z1: bz1, x2: bx2, z2: bz2, kind: 'houses' };
      if (isSpecial(bx1, bz1, bx2, bz2, 'park')) block.kind = 'park';
      else if (isSpecial(bx1, bz1, bx2, bz2, 'plaza')) block.kind = 'plaza';
      G.blocks.push(block);
    }
  }

  const buildingMansards = [];
  for (const block of G.blocks) {
    const bw = block.x2 - block.x1;
    const bd = block.z2 - block.z1;
    const cx = (block.x1 + block.x2) / 2;
    const cz = (block.z1 + block.z2) / 2;

    if (block.kind === 'houses') {
      // lastrico marciapiede
      const slab = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.24, bd), matSidewalk);
      slab.position.set(cx, 0.0, cz);
      slab.receiveShadow = true;
      scene.add(slab);

      // perimetro pedonale
      G.pedPaths.push({
        x1: block.x1 + 2.5, z1: block.z1 + 2.5,
        x2: block.x2 - 2.5, z2: block.z2 - 2.5, cx, cz
      });

      // due file di palazzi con cortile interno
      const ncols = 3;
      const colW = (bw - 6) / ncols;
      let caféDone = false;
      for (const side of [-1, 1]) {
        const zc = cz + side * (bd / 2 - 9);
        for (let i = 0; i < ncols; i++) {
          const w = colW * rand(0.82, 1.0);
          const hgt = pick([15, 15, 18, 18, 22]);
          const bxc = block.x1 + 3 + colW * (i + 0.5);
          const ti = randi(0, 3);
          const bm = new THREE.Mesh(
            new THREE.BoxGeometry(w, hgt, 14),
            facadeMat(w, hgt, ti)
          );
          bm.position.set(bxc, hgt / 2 + 0.12, zc);
          bm.castShadow = true; bm.receiveShadow = true;
          scene.add(bm);
          const roof = makeMansardGeometry(w, 14, hgt * 0.22, [0x6b7785, 0x77808d, 0x5f6d7c][randi(0, 2)]);
          roof.position.set(bxc, hgt + 0.12, zc);
          roof.castShadow = true;
          scene.add(roof);
          buildingMansards.push(roof);
          addCollider(bxc - w / 2, zc - 7, bxc + w / 2, zc + 7, hgt);

          // un caffè per isolato
          if (!caféDone && side === -1 && i === randi(0, 2)) {
            caféDone = true;
            buildCafe(scene, addCollider, bxc, zc - 7, side, ti);
          }
        }
      }
    } else if (block.kind === 'plaza') {
      // Place de l'Étoile
      const circ = new THREE.Mesh(new THREE.CircleGeometry(PLAZA.r + 8, 40), new THREE.MeshLambertMaterial({ color: 0x6b5f55 }));
      circ.rotation.x = -Math.PI / 2;
      circ.position.set(PLAZA.cx, 0.03, PLAZA.cz);
      circ.receiveShadow = true;
      scene.add(circ);
      const ring = new THREE.Mesh(new THREE.RingGeometry(PLAZA.r + 8, PLAZA.r + 15, 40), matAsphalt);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(PLAZA.cx, 0.04, PLAZA.cz);
      scene.add(ring);
      for (const ang of [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4]) {
        const stub = new THREE.Mesh(new THREE.PlaneGeometry(7, 60), matAsphalt);
        stub.rotation.set(-Math.PI / 2, 0, ang + Math.PI / 2);
        const sx = PLAZA.cx + Math.cos(ang) * (PLAZA.r + 30);
        const sz = PLAZA.cz + Math.sin(ang) * (PLAZA.r + 30);
        stub.position.set(sx, 0.035, sz);
        scene.add(stub);
      }
      G.pedPaths.push({ x1: PLAZA.cx - 36, z1: PLAZA.cz - 36, x2: PLAZA.cx + 36, z2: PLAZA.cz + 36, cx: PLAZA.cx, cz: PLAZA.cz });
      buildArcTriomphe(scene, matStone, addCollider);
      G.mapMarkers.push({ x: ARC.x, z: ARC.z, icon: 'arc', label: 'Place de l\'Étoile' });
    } else if (block.kind === 'park') {
      const lawn = mkPlane(bw, bd, matGrass, 0.14, cx, cz);
      lawn.receiveShadow = true;
      G.pedPaths.push({ x1: block.x1 + 2.5, z1: block.z1 + 2.5, x2: block.x2 - 2.5, z2: block.z2 - 2.5, cx, cz, park: true });
      // vialetti
      const path1 = mkPlane(6, bd, matSidewalk, 0.15, cx, cz);
      path1.receiveShadow = true;
      const path2 = mkPlane(bw, 6, matSidewalk, 0.15, cx, cz);
      path2.receiveShadow = true;
      // siepi
      for (const sx of [-26, 26]) {
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(4, 1.4, bd * 0.55), new THREE.MeshLambertMaterial({ color: 0x2d5a2a }));
        hedge.position.set(cx + sx, 0.8, cz);
        hedge.castShadow = true;
        scene.add(hedge);
        addCollider(cx + sx - 2, cz - bd * 0.27, cx + sx + 2, cz + bd * 0.27, 1.5);
      }
      buildEiffelTower(scene, matStone, addCollider);
      G.mapMarkers.push({ x: EIFFEL.x, z: EIFFEL.z, icon: 'eiffel', label: 'Torre Eiffel' });
      // alberi del parco
      for (let i = 0; i < 26; i++) {
        const tx = cx + rand(-bw / 2 + 6, bw / 2 - 6);
        const tz = cz + rand(-bd / 2 + 6, bd / 2 - 6);
        if (Math.hypot(tx - EIFFEL.x, tz - EIFFEL.z) < 22) continue;
        if (Math.abs(tx - cx) < 4 || Math.abs(tz - cz) < 4) continue;
        G.treeSpots = G.treeSpots || [];
        G.treeSpots.push([tx, tz, rand(0.9, 1.5)]);
      }
    }
  }

  // ---------- lampioni ----------
  const lampPositions = [];
  for (const rx of ROAD_X) {
    for (let z = -215; z <= 215; z += 43) {
      if (Math.abs(z) < QUAI_OUT || Math.abs(z) > MAP_LIMIT) continue;
      lampPositions.push([rx - 8.4, z], [rx + 8.4, z]);
    }
  }
  for (const rz of ROUTE_Z_SAFE()) {
    for (let x = -215; x <= 215; x += 43) {
      if (Math.abs(x) > MAP_LIMIT) continue;
      lampPositions.push([x, rz - 8.4], [x, rz + 8.4]);
    }
  }
  for (const bx of BRIDGE_X) {
    for (let z = -28; z <= 28; z += 19) {
      if (Math.abs(z) < 5) continue;
      lampPositions.push([bx - 5.1, z], [bx + 5.1, z]);
    }
  }

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 5.6, 6);
  const headGeo = new THREE.SphereGeometry(0.35, 8, 6);
  const matPole = new THREE.MeshLambertMaterial({ color: 0x2c3038 });
  G.matLampHead = new THREE.MeshLambertMaterial({ color: 0xfff2c0, emissive: 0xffdd88, emissiveIntensity: 0 });
  const poleIM = new THREE.InstancedMesh(poleGeo, matPole, lampPositions.length);
  const headIM = new THREE.InstancedMesh(headGeo, G.matLampHead, lampPositions.length);
  const dummy = new THREE.Object3D();
  lampPositions.forEach(([lx, lz], i) => {
    dummy.position.set(lx, 2.9, lz);
    dummy.updateMatrix();
    poleIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(lx, 5.75, lz);
    dummy.updateMatrix();
    headIM.setMatrixAt(i, dummy.matrix);
    G.lamps.push({ x: lx, z: lz });
  });
  scene.add(poleIM, headIM);

  // ---------- alberi (marciapiedi + quai) ----------
  G.treeSpots = G.treeSpots || [];
  for (const block of G.blocks) {
    if (block.kind !== 'houses') continue;
    for (const tx of [block.x1 + 2.5, block.x2 - 2.5]) {
      for (let tz = block.z1 + 8; tz < block.z2 - 4; tz += 16) {
        G.treeSpots.push([tx, tz, rand(0.8, 1.2)]);
      }
    }
  }
  for (let x = -230; x < 230; x += 15) {
    if (BRIDGE_X.some(bx => Math.abs(x - bx) < 8)) continue;
    G.treeSpots.push([x, RIVER_HALF + 3.2, rand(0.7, 1.1)]);
    G.treeSpots.push([x, -(RIVER_HALF + 3.2), rand(0.7, 1.1)]);
  }

  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6);
  const canGeo = new THREE.IcosahedronGeometry(2.4, 0);
  const matTrunk = new THREE.MeshLambertMaterial({ color: 0x4a3423 });
  const matCan = new THREE.MeshLambertMaterial({ color: 0x3f7d33, flatShading: true });
  const trunkIM = new THREE.InstancedMesh(trunkGeo, matTrunk, G.treeSpots.length);
  const canIM = new THREE.InstancedMesh(canGeo, matCan, G.treeSpots.length);
  G.treeSpots.forEach(([tx, tz, sc], i) => {
    dummy.position.set(tx, 1.1 * sc, tz);
    dummy.scale.setScalar(sc);
    dummy.rotation.y = rand(0, 6);
    dummy.updateMatrix();
    trunkIM.setMatrixAt(i, dummy.matrix);
    dummy.position.set(tx, 2.6 * sc, tz);
    dummy.scale.set(sc * rand(0.9, 1.2), sc * rand(0.9, 1.3), sc * rand(0.9, 1.2));
    dummy.updateMatrix();
    canIM.setMatrixAt(i, dummy.matrix);
  });
  trunkIM.castShadow = canIM.castShadow = true;
  scene.add(trunkIM, canIM);

  // ---------- bouquiniste lungo la Senna ----------
  const matGreen = new THREE.MeshLambertMaterial({ color: 0x2d5a3a });
  for (let x = -220; x < 220; x += 26) {
    if (BRIDGE_X.some(bx => Math.abs(x - bx) < 8)) continue;
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.8), matGreen);
      b.position.set(x, 0.7, s * (RIVER_HALF + 5));
      b.castShadow = true;
      scene.add(b);
    }
  }

  // barche
  for (let i = 0; i < 3; i++) {
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 3), new THREE.MeshLambertMaterial({ color: 0xd42a2a }));
    cab.position.set(-2, 1.8, 0);
    boat.add(hull, cab);
    boat.position.set(rand(-180, 180), -0.9, rand(-18, 18));
    scene.add(boat);
  }

  // ---------- limiti mappa ----------
  const L = MAP_LIMIT + 2;
  addCollider(-L - 4, -L - 4, -L, L + 4, 30);
  addCollider(L, -L - 4, L + 4, L + 4, 30);
  addCollider(-L - 4, -L - 4, L + 4, -L, 30);
  addCollider(-L - 4, L, L + 4, L + 4, 30);

  buildNavGraph(G);
}

function ROUTE_Z_SAFE() { return [ -180, -135, -90, -45, 45, 90, 135, 180 ]; }

function buildCafe(scene, addCollider, bx, facadeZ, side, ti) {
  const awMat = new THREE.MeshLambertMaterial({ color: pick([0xa03030, 0x2a50a0, 0x307a50]) });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 2.2), awMat);
  awning.position.set(bx, 3.4, facadeZ + side * 1.2);
  awning.rotation.x = side * 0.25;
  awning.castShadow = true;
  scene.add(awning);
  const matWood = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  const matTable = new THREE.MeshLambertMaterial({ color: 0xd8d0c0 });
  for (let i = -1; i <= 1; i++) {
    const tx = bx + i * 3;
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 8), matTable);
    table.position.set(tx, 1.1, facadeZ + side * 3.2);
    scene.add(table);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), matWood);
    leg.position.set(tx, 0.55, facadeZ + side * 3.2);
    scene.add(leg);
    for (const s of [-1, 1]) {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), matWood);
      chair.position.set(tx + s * 1.3, 0.6, facadeZ + side * 3.2);
      scene.add(chair);
    }
  }
}

function buildEiffelTower(scene, matStone, addCollider) {
  const t = new THREE.Group();
  const matIron = new THREE.MeshLambertMaterial({ color: 0x4a4438 });
  const leg = (sx, sz, h1, h2, w, tilt) => {
    const g = new THREE.BoxGeometry(w, h1, w);
    const m = new THREE.Mesh(g, matIron);
    m.position.set(sx, (h1 + h2) / 2, sz);
    m.rotation.z = -sx * tilt / 10;
    m.rotation.x = sz * tilt / 10;
    m.castShadow = true;
    t.add(m);
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) leg(sx * 8, sz * 8, 40, 0, 2.2, 0.6);
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(21, 2, 21), matIron);
  p1.position.y = 40; p1.castShadow = true; t.add(p1);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) leg(sx * 5.2, sz * 5.2, 30, 41, 1.7, 0.6);
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.6, 13.5), matIron);
  p2.position.y = 71; p2.castShadow = true; t.add(p2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) leg(sx * 2.6, sz * 2.6, 24, 72, 1.3, 0.5);
  const p3 = new THREE.Mesh(new THREE.BoxGeometry(7, 1.4, 7), matIron);
  p3.position.y = 96; p3.castShadow = true; t.add(p3);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.6, 22, 6), matIron);
  ant.position.y = 108; t.add(ant);
  t.position.set(EIFFEL.x, 0, EIFFEL.z);
  scene.add(t);
  addCollider(EIFFEL.x - 6.5, EIFFEL.z - 6.5, EIFFEL.x + 6.5, EIFFEL.z + 6.5, 20);
  // collinetta del parco visivamente
  const base = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 20), matStone);
  base.position.set(EIFFEL.x, 0.6, EIFFEL.z);
  scene.add(base);
}

function buildArcTriomphe(scene, matStone, addCollider) {
  const g = new THREE.Group();
  const matLime = new THREE.MeshLambertMaterial({ color: 0xcfc4ab });
  const mk = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matLime);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  };
  mk(7, 17, 10, -8.5, 8.5, 0);
  mk(7, 17, 10, 8.5, 8.5, 0);
  mk(24, 6, 10, 0, 20, 0);
  mk(20, 4, 8, 0, 25.5, 0);
  mk(25, 1, 11, 0, 28, 0);
  mk(10, 3.5, 2, 0, 31, 0);
  g.position.set(ARC.x, 0.2, ARC.z);
  scene.add(g);
  addCollider(ARC.x - 12, ARC.z - 5, ARC.x - 5, ARC.z + 5, 17);
  addCollider(ARC.x + 5, ARC.z - 5, ARC.x + 12, ARC.z + 5, 17);
}

export function buildNavGraph(G) {
  const nodes = [];
  const index = {};
  for (const rx of ROAD_X) for (const rz of ROAD_Z) {
    index[`${rx},${rz}`] = nodes.length;
    nodes.push({ x: rx, z: rz, links: [] });
  }
  const link = (i, j) => {
    const a = nodes[i], b = nodes[j];
    const len = Math.hypot(a.x - b.x, a.z - b.z);
    a.links.push({ n: j, len });
    b.links.push({ n: i, len });
  };
  for (const rx of ROAD_X) {
    for (let k = 0; k < ROAD_Z.length - 1; k++) {
      link(index[`${rx},${ROAD_Z[k]}`], index[`${rx},${ROAD_Z[k + 1]}`]);
    }
  }
  for (const rz of ROAD_Z) {
    for (let k = 0; k < ROAD_X.length - 1; k++) {
      link(index[`${ROAD_X[k]},${rz}`], index[`${ROAD_X[k + 1]},${rz}`]);
    }
  }
  G.nav = { nodes };
}
