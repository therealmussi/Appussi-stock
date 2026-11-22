import * as THREE from 'three';
import * as C from './config.js';
import { buildWorld } from './world.js';
import { initVehicles, updateVehicles, spawnTrafficCar } from './vehicles.js';
import { initPlayer, updatePlayer, enterVehicle, exitVehicle } from './player.js';
import { initMissions, playerPos } from './missions.js';
import { initUI } from './ui.js';
import { AudioSystem } from './audio.js';
import { clamp } from './utils.js';

// ---------------------------------------------------------------------------
// Setup renderer / scena / luci
// ---------------------------------------------------------------------------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc3e8);
scene.fog = new THREE.Fog(0x8fc3e8, 130, 420);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 900);
camera.position.set(20, 8, 90);

const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x54503f, 0.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff2d8, 1.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
sun.shadow.camera.near = 10; sun.shadow.camera.far = 600;
sun.shadow.bias = -0.0004;
scene.add(sun);
scene.add(sun.target);

// stato condiviso del gioco
const G = {
  renderer, scene, camera,
  keys: {}, keysPressed: {},
  elapsed: 0, clockTime: 0.36, night: false,
  money: 500,
  wanted: { stars: 0, heat: 0, evadeT: 0, lock: false, lockStars: 0, lastSpawn: 0 },
  audio: new AudioSystem(),
  config: C,
  missions: null,
  running: false
};

buildWorld(G);
initPlayer(G);
initVehicles(G);
initMissions(G);
initUI(G);
G.ui.enablePlay();

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const canvas = renderer.domElement;

addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (!G.keys[k]) G.keysPressed[k] = true;
  G.keys[k] = true;
  if (!G.running) return;
  if (k === 'h' && G.player.vehicle) G.audio.horn();
  if (k === 'r' && G.player.vehicle) {
    const name = G.audio.nextRaceStation();
    G.ui.toast(name);
  }
});
addEventListener('keyup', (e) => { G.keys[e.key.toLowerCase()] = false; });

let clock = null;
const startGame = () => {
  if (G.running) return;
  G.audio.init();
  G.audio.resume();
  G.running = true;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  canvas.requestPointerLock();
  clock = new THREE.Clock();
  G.ui.toast('Benvenuto a Parigi! Entra nel cerchio azzurro per la prima missione.', 'money');
};

document.getElementById('playBtn').addEventListener('click', startGame);

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (G.running) {
    document.getElementById('pauseOverlay').classList.toggle('hidden', locked);
  }
});
canvas.addEventListener('click', () => {
  if (G.running && document.pointerLockElement !== canvas) canvas.requestPointerLock();
});

addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  G.player.camYaw -= e.movementX * 0.0026;
  G.player.camPitch = clamp(G.player.camPitch + e.movementY * 0.0022, -0.15, 1.05);
  G.player.camIdle = 0;
});

addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// Ciclo giorno / notte
// ---------------------------------------------------------------------------
const skyNight = new THREE.Color(0x0b1026);
const skyDay = new THREE.Color(0x8fc3e8);
const skySunset = new THREE.Color(0xe08a5a);
const tmpColor = new THREE.Color();

function updateDayNight(dt) {
  G.clockTime = (G.clockTime + dt / C.DAY_LENGTH) % 1;
  const a = (G.clockTime - 0.25) * Math.PI * 2;
  const elev = Math.sin(a);
  const px = playerPos(G);

  sun.position.set(px.x - Math.cos(a) * 220, Math.max(elev, 0.02) * 260 + 20, px.z + 90);
  sun.target.position.set(px.x, 0, px.z);
  const dayF = clamp((elev + 0.12) / 0.35, 0, 1);
  const sunsetF = clamp(1 - Math.abs(elev) / 0.22, 0, 1) * dayF;

  if (elev > 0) {
    sun.intensity = 0.35 + dayF * 0.85;
    sun.color.setHSL(0.12, 0.5 * (1 - dayF) + 0.08, 0.6 + dayF * 0.25);
  } else {
    sun.intensity = 0.14;
    sun.color.set(0x8ea2ff);
    sun.position.set(px.x + 100, 140, px.z - 120);
  }
  hemi.intensity = 0.22 + dayF * 0.6;

  tmpColor.copy(skyNight).lerp(skyDay, dayF);
  tmpColor.lerp(skySunset, sunsetF * 0.55);
  scene.background.copy(tmpColor);
  scene.fog.color.copy(tmpColor);
  scene.fog.near = 90 + dayF * 60;
  scene.fog.far = 260 + dayF * 220;

  G.night = dayF < 0.55;
  if (G.matLampHead) G.matLampHead.emissiveIntensity = G.night ? 1.6 : 0;
}

// ---------------------------------------------------------------------------
// Loop principale
// ---------------------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock ? clock.getDelta() : 0.016, 0.05);

  if (G.running) {
    G.elapsed += dt;
    G.player.camIdle += dt;

    updateDayNight(dt);
    updatePlayer(G, dt);
    updateVehicles(G, dt);
    G.missions.update(dt);

    // traffico che si rigenera per lontano dal giocatore
    G.trafficTimer = (G.trafficTimer || 0) + dt;
    if (G.trafficTimer > 3) {
      G.trafficTimer = 0;
      const traffic = G.vehicles.filter(v => v.role === 'traffic').length;
      if (traffic < G.trafficCount) spawnOne(G);
    }

    G.audio.update(G, dt);
    G.ui.update();
  }

  renderer.render(scene, camera);
}
animate();

function spawnOne(G) {
  spawnTrafficCar(G);
}
