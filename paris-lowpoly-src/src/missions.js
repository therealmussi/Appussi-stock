import * as THREE from 'three';
import { COURIER_DEPOTS, RACE_CHECKPOINTS, RACE_GRID, REFUGE, MISSION_SPOTS } from './config.js';
import { dist2d, rand, pick } from './utils.js';
import { Vehicle, removeVehicle, setWantedLock, setWanted } from './vehicles.js';

export function initMissions(G) {
  G.missionMarkers = [];
  const matCache = {};

  const mkMarker = (x, z, color) => {
    const g = new THREE.Group();
    const c = matCache[color] || (matCache[color] = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false
    }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.25, 8, 28), c);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.5;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), c);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.15;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 40, 10, 1, true), c);
    beam.position.y = 20;
    g.add(ring, disc, beam);
    g.position.set(x, 0, z);
    G.scene.add(g);
    return { group: g, ring, disc, beam, mat: c };
  };

  G.missions = {
    spots: [],
    active: null,
    onCarjack: null,
    update: null
  };

  const colors = { courier: 0x35d0ff, race: 0xffd23f, getaway: 0xff5548, target: 0x7be08a };
  for (const spot of [
    { type: 'courier', label: 'Corriere Espresso' },
    { type: 'race', label: 'Corsa Clandestina' },
    { type: 'getaway', label: 'Fuga dalla Gendarmerie' }
  ]) {
    const cfg = MISSION_SPOTS.find(s => s.type === spot.type);
    const vis = mkMarker(cfg.x, cfg.z, colors[spot.type]);
    G.missions.spots.push({ ...cfg, ...spot, vis, cooldown: 0 });
  }

  let targetMarker = null;
  const getTargetMarker = () => {
    if (!targetMarker) targetMarker = mkMarker(0, 0, colors.target);
    return targetMarker;
  };

  const setTarget = (x, z, label) => {
    const m = getTargetMarker();
    m.group.visible = true;
    m.group.position.set(x, 0, z);
    G.missions.active && (G.missions.active.target = { x, z, label });
  };
  const clearTarget = () => {
    if (targetMarker) targetMarker.group.visible = false;
  };

  const mission = G.missions;

  // --------------------------- CORRIERE ---------------------------
  function startCourier(sp) {
    mission.active = {
      type: 'courier', title: '📦 Corriere Espresso',
      objective: 'Consegna il pacco al punto verde prima che scada il tempo!',
      time: 75, depot: pick(COURIER_DEPOTS)
    };
    setTarget(mission.active.depot.x, mission.active.depot.z, 'Consegna');
    G.ui.toast('Consegna il pacco entro 75 secondi!', 'money');
  }

  function courierTick(dt) {
    const a = mission.active;
    a.time -= dt;
    const p = playerPos(G);
    if (dist2d(p.x, p.z, a.depot.x, a.depot.z) < 6) {
      G.money += 150;
      G.ui.toast('+150 € — Pacco consegnato!', 'money');
      finishMission(true);
    } else if (a.time <= 0) {
      G.ui.toast('Tempo scaduto! Il pacco è andato perso.', 'bad');
      finishMission(false);
    }
  }

  // --------------------------- CORSA ---------------------------
  function startRace(sp) {
    const p = G.player;
    if (!p.vehicle) {
      G.ui.toast('Trova un\'auto per partecipare alla corsa!', 'bad');
      sp.cooldown = 3;
      mission.active = null;
      return;
    }
    mission.active = {
      type: 'race', title: '🏁 Corsa Clandestina',
      objective: 'Passa dai checkpoint luminosi e vinci i 3 rivali!',
      state: 'countdown', count: 3.8, cpIdx: 0,
      cps: RACE_CHECKPOINTS, rivals: [], grid: RACE_GRID
    };
    setTarget(RACE_CHECKPOINTS[0].x, RACE_CHECKPOINTS[0].z, 'Checkpoint');
    for (let i = 0; i < 3; i++) {
      const type = 'sport';
      const v = new Vehicle(G, type, RACE_GRID.x, RACE_GRID.z + 14 + i * 9, RACE_GRID.heading, [0x2c2c34, 0xffa500, 0xf6f6f6][i]);
      v.role = 'race';
      v.raceCps = RACE_CHECKPOINTS;
      v.raceIdx = 0;
      v.raceWp = RACE_CHECKPOINTS[0];
      v.raceSpeed = rand(16.5, 19.5);
      v.vF = 0;
      mission.active.rivals.push(v);
      G.vehicles.push(v);
    }
    G.ui.toast('Gara! Aspetta il via…', 'money');
  }

  function raceTick(dt) {
    const a = mission.active;
    if (a.state === 'countdown') {
      const prev = Math.ceil(a.count - 0.8);
      a.count -= dt;
      const now = Math.ceil(a.count - 0.8);
      if (now < prev && now > 0) G.audio.blip(440, 0.2, 'sine', 0.12);
      if (a.count <= 0.8) {
        a.state = 'racing';
        G.audio.pedalChime();
        G.ui.toast('VIA!', 'money');
      }
      return;
    }
    if (!G.player.vehicle) {
      G.ui.toast('Sei uscito dall\'auto: gara abbandonata.', 'bad');
      finishMission(false, true);
      return;
    }
    const p = playerPos(G);
    const cps = a.cps;
    if (a.state !== 'finish' && dist2d(p.x, p.z, cps[a.cpIdx].x, cps[a.cpIdx].z) < 12) {
      a.cpIdx++;
      G.audio.pedalChime();
      if (a.cpIdx < cps.length) {
        setTarget(cps[a.cpIdx].x, cps[a.cpIdx].z, 'Checkpoint');
      } else {
        // traguardo: torna alla griglia di partenza
        setTarget(a.grid.x, a.grid.z, 'Traguardo');
        a.state = 'finish';
      }
    }
    if (a.state === 'finish' && dist2d(p.x, p.z, a.grid.x, a.grid.z) < 12) {
      let rank = 1;
      for (const r of a.rivals) if (r.raceIdx >= cps.length) rank++;
      const prize = [300, 150, 80, 40][rank - 1];
      G.money += prize;
      G.ui.toast(`Arrivo ${rank}º! +${prize} €`, 'money');
      finishMission(true);
    }
  }

  // --------------------------- FUGA ---------------------------
  function startGetaway(sp) {
    mission.active = {
      type: 'getaway', title: '🚨 Fuga dalla Gendarmerie',
      objective: 'Sopravvivi 60 secondi con 3 stelle, poi corri al rifugio!',
      time: 60, phase: 'survive', bustT: 0
    };
    setWantedLock(G, 3, true);
    G.ui.wantedFlash();
    G.ui.toast('La Gendarmerie ti ha trovato! Sopravvivi 60 secondi.', 'bad');
  }

  function getawayTick(dt) {
    const a = mission.active;
    if (a.phase === 'survive') {
      a.time -= dt;
      G.wanted.evadeT = 0;
      // se finisci a piedi e vieni arrestato -> fallimento
      if (!G.player.vehicle) {
        const near = G.vehicles.find(v => v.role === 'police' &&
          dist2d(v.pos.x, v.pos.z, G.player.pos.x, G.player.pos.z) < 4);
        if (near) {
          G.ui.toast('Arrestato! Missione fallita.', 'bad');
          finishMission(false, true);
          return;
        }
      }
      a.bustT = 0;
      if (a.time <= 0) {
        a.phase = 'refuge';
        setWantedLock(G, 3, false);
        setTarget(REFUGE.x, REFUGE.z, 'Rifugio');
        G.ui.toast('Sei fuori pericolo! Corri al rifugio (luce verde al Champ-de-Mars).', 'money');
        a.time = 90;
      }
    } else {
      a.time -= dt;
      const p = playerPos(G);
      if (dist2d(p.x, p.z, REFUGE.x, REFUGE.z) < 7) {
        G.money += 250;
        setWanted(G, 0);
        G.ui.toast('+250 € — Sei salvo!', 'money');
        finishMission(true);
      } else if (a.time <= 0) {
        G.ui.toast('Tempo scaduto: la polizia ti ha aspettato.', 'bad');
        setWantedLock(G, 3, false);
        finishMission(false, true);
      }
    }
  }

  function finishMission(success, keepWanted = false) {
    const a = mission.active;
    if (!a) return;
    if (a.type === 'race') {
      for (const r of a.rivals) removeVehicle(G, r);
    }
    if (a.type === 'getaway' && !keepWanted) setWantedLock(G, 3, false);
    if (a.type === 'courier') clearTarget();
    for (const sp of mission.spots) {
      if (sp.type === a.type) sp.cooldown = 6;
    }
    clearTarget();
    mission.active = null;
    G.ui.missionPanel(false);
  }

  mission.onCarjack = () => {
    if (mission.active && mission.active.type === 'race') {
      G.ui.toast('Hai cambiato auto: gara abbandonata.', 'bad');
      finishMission(false, true);
    }
  };

  mission.update = (dt) => {
    for (const sp of mission.spots) {
      sp.cooldown = Math.max(0, sp.cooldown - dt);
      const pulse = 1 + Math.sin(G.elapsed * 4) * 0.12;
      sp.vis.group.scale.setScalar(pulse);
      if (sp.cooldown <= 0 && !mission.active) {
        sp.vis.group.visible = true;
        const p = playerPos(G);
        if (dist2d(p.x, p.z, sp.x, sp.z) < 4.5) {
          if (sp.type === 'courier') startCourier(sp);
          else if (sp.type === 'race') startRace(sp);
          else startGetaway(sp);
        }
      }
    }
    if (targetMarker && targetMarker.group.visible) {
      targetMarker.group.scale.setScalar(1 + Math.sin(G.elapsed * 6) * 0.25);
    }
    const a = mission.active;
    if (!a) return;
    if (a.type === 'courier') courierTick(dt);
    else if (a.type === 'race') raceTick(dt);
    else getawayTick(dt);
    let timerVal = null;
    if (a.type === 'courier') timerVal = a.time;
    else if (a.type === 'race' && a.state === 'countdown') timerVal = Math.max(0, Math.ceil(a.count - 0.8));
    else if (a.type === 'getaway') timerVal = a.time;
    G.ui.missionPanel(true, a.title, a.objective, timerVal, a.type === 'getaway' && a.phase === 'refuge');
  };

  // nasconde i marker target inizialmente
  getTargetMarker().group.visible = false;
}

export function playerPos(G) {
  const p = G.player;
  return p.vehicle ? p.vehicle.pos : p.pos;
}

export function onCarjack(G) {
  if (G.missions && G.missions.onCarjack) G.missions.onCarjack(G);
}
