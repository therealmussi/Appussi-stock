/* main.js — bootstrap: renderer, input, audio, UI, game loop. */

import { Renderer } from './engine/renderer.js';
import { Input } from './input.js';
import { AudioSys } from './audio.js';
import { Game } from './core.js';
import { UI } from './ui.js';
import { loadSave, writeSave } from './save.js';
import { LEVELS } from './levels/index.js';

const canvas = document.getElementById('game-canvas');

let saveData = loadSave();
if (!saveData) {
  saveData = {
    v: 1, chapter: 0, maxUnlocked: 1,
    completed: [false, false, false, false, false, false, false, false],
    tapes: [], endingSeen: false,
    settings: { sensitivity: 1.0, master: 0.8, music: 0.7, sfx: 0.9, quality: 'medium', fullscreen: false },
  };
}
// persist proxy
saveData.persist = () => {
  const copy = { ...saveData };
  delete copy.persist;
  writeSave(copy);
};

const renderer = new Renderer(canvas, saveData.settings.quality);
const input = new Input(canvas);
const audio = new AudioSys();
audio.volumes = { master: saveData.settings.master, music: saveData.settings.music, sfx: saveData.settings.sfx };
input.sensitivity = saveData.settings.sensitivity;

const game = new Game({ renderer, ui: null, audio, input, save: saveData, levels: LEVELS });
const ui = new UI(game);
game.ui = ui;
window.__game = game; // debug / testing

ui.showScreen('main');
const hasSave = localStorage.getItem('impossible-room-save-v1') && (saveData.maxUnlocked > 1 || saveData.completed.some(Boolean));
document.getElementById('btn-continue').classList.toggle('disabled', !hasSave);
if (saveData.endingSeen) {
  document.body.classList.add('void-mode');
  document.getElementById('main-subtitle').textContent = 'it is still measuring';
}

ui.syncSettings();
ui.setTapeCount(saveData.tapes.length, game.totalTapes);

input.onLockChange = (locked) => {
  if (!locked && game.state === 'playing') {
    game.pause();
  }
  ui.hud(game.state === 'playing');
};

/* ---------- resize ---------- */
const onResize = () => renderer.resize();
window.addEventListener('resize', onResize);

/* ---------- pause key (ESC handled by pointerlockchange; support ESC without lock) ---------- */
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && game.state === 'playing' && !input.locked) {
    game.pause();
  }
});

/* ---------- main loop ---------- */
let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  try {
    if (game.state !== 'menu') game.update(dt);
    if (game.current) game.render();
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
