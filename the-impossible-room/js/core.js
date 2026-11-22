/* core.js — Game orchestrator: levels, gravity, interactions, transitions,
   tape playback, completion & ending flow. */

import { V, Q, M4 } from './engine/math3.js';
import { Player } from './player.js';
import { LevelKit } from './kit.js';
import { rayAABB, AABB } from './physics.js';

const INTERACT_DIST = 2.9;

export class Game {
  constructor({ renderer, ui, audio, input, save, levels }) {
    this.renderer = renderer;
    this.ui = ui;
    this.audio = audio;
    this.input = input;
    this.save = save;
    this.levels = levels; // array of level modules
    this.player = new Player();
    this.player.onStepCB = (run) => audio.footstep(run);
    this.player.onLandCB = (f) => audio.landing(f);
    this.state = 'menu';   // menu | playing | paused | transition | ending
    this.current = null;   // { index, def, kit }
    this.inventory = new Set();
    this.gravity = V.make(0, -1, 0);
    this.tapeTimer = 0;
    this.fade = { a: 1, target: 0, speed: 2.2, color: [0, 0, 0] };
    this._pendingTeleport = null;
    this.debug = false;
  }

  /* ---------- level lifecycle ---------- */
  startLevel(i, { silent = false } = {}) {
    const def = this.levels[i];
    if (!def) return;
    if (this.current) { this.current.kit.dispose(); }
    this.audio.stopDrone(0.5);
    this.current = null;
    this.inventory.clear();
    this.current = { index: i, def, kit: null };
    this.completed = false;
    const kit = new LevelKit(this.renderer, this);
    this.current.kit = kit;
    def.build(kit);
    kit.finish();

    // environment
    if (def.env) Object.assign(kit.env, def.env);
    kit.env.points = this.current ? kit.points : kit.points;

    this.gravity = V.make(...((def.gravity) || [0, -1, 0]));
    this.player.setGravity(this.gravity);
    this.player.frozen = false;
    const spawn = def.spawn || { pos: [0, 1.62, 0], yaw: 0 };
    this.player.teleport(spawn.pos, spawn.yaw);
    this.player.visUp = V.copy(V.make(), this.player.up);
    this.player.visUpTarget = V.copy(V.make(), this.player.up);
    this.player.bobT = 0;

    this.save.chapter = i;
    this.save.maxUnlocked = Math.max(this.save.maxUnlocked, i + 1);
    this.save.persist();

    this.audio.startDrone(def.mood || kit.mood);
    if (!silent) this.ui.titleCard(def.title, def.subtitle);
    this.state = 'playing';
    this.fade.target = 0;
    this.fade.a = 1;
  }

  gotoLevel(i) {
    if (this.current) this.current.kit.dispose();
    this.current = null;
    this.ui.fadeTo(1, 250);
    this.audio.stopDrone(0.4);
    setTimeout(() => {
      this.state = 'playing';
      this.startLevel(i);
      this.ui.fadeTo(0, 700);
    }, 280);
    this.state = 'transition';
  }

  restartLevel() {
    if (this.current) this.startLevel(this.current.index, { silent: true });
  }

  completeLevel() {
    if (!this.current || this.completed) return;
    const i = this.current.index;
    this.completed = true;
    this.save.completed[i] = true;
    this.save.maxUnlocked = Math.max(this.save.maxUnlocked, Math.min(8, i + 2));
    this.save.persist();
    this.audio.solved();
    if (i >= this.levels.length - 1) {
      this.runEnding();
    } else {
      this.ui.titleCard('—', 'Chapter ' + pad(i + 1) + ' complete');
      setTimeout(() => this.gotoLevel(i + 1), 1400);
      this.state = 'transition';
    }
  }

  /* ---------- gravity ---------- */
  setGravity(dir) {
    V.copy(this.gravity, dir);
    this.player.setGravity(dir);
  }

  /* ---------- interaction ---------- */
  updateInteraction() {
    const p = this.player;
    _ro[0] = p.camPos[0]; _ro[1] = p.camPos[1]; _ro[2] = p.camPos[2];
    _rd[0] = p.fwd[0]; _rd[1] = p.fwd[1]; _rd[2] = p.fwd[2];
    let best = null, bestT = INTERACT_DIST;
    for (const it of this.current.kit.interactables) {
      if (it.enabled === false) continue;
      const box = it.dynamic ? it.dynamic() : it.aabb;
      if (!box) continue;
      const t = rayAABB(_ro, _rd, box, bestT);
      if (t !== null && t < bestT) { bestT = t; best = it; }
    }
    this.hover = best;
    this.ui.prompt(best ? (best.label || '') : null);
  }

  interact() {
    if (this.hover && this.hover.cb) {
      if (this.hover.once && this.hover.used) return;
      this.hover.used = true;
      this.audio.uiClick();
      this.hover.cb(this.hover);
    }
  }

  /* ---------- messages / tapes ---------- */
  msg(text, dur = 3.5) {
    this.ui.subtitle(text, dur);
  }

  playTape(num, lines) {
    this.audio.tapeStart();
    this.ui.tapeIndicator(true);
    let idx = 0;
    const next = () => {
      if (idx >= lines.length) {
        this.audio.tapeStop();
        this.ui.tapeIndicator(false);
        return;
      }
      this.ui.subtitle(lines[idx], lines[idx].length * 0.055 + 1.6, next);
      idx++;
    };
    next();
  }

  collectTape(id) {
    if (!this.save.tapes.includes(id)) this.save.tapes.push(id);
    this.save.persist();
    this.ui.setTapeCount(this.save.tapes.length, this.totalTapes);
  }

  get totalTapes() { return 11; }

  /* ---------- teleports ---------- */
  fadeTeleport(pos, yaw, { alsoResetDoors = true } = {}) {
    this.ui.fadeTo(1, 240);
    this.audio.portal();
    setTimeout(() => {
      this.player.teleport(pos, yaw);
      if (alsoResetDoors) {
        for (const d of _doorsOf(this.current.kit)) d.reset();
      }
      this.ui.fadeTo(0, 420);
    }, 260);
  }

  /* ---------- main update ---------- */
  update(dt) {
    if (this.state === 'playing' && this.current) {
      const p = this.player;
      p.update(dt, this.input, this.current.kit.colliders);
      this.updateInteraction();

      // triggers
      for (const tr of this.current.kit.triggers) {
        if (tr.enabled === false || (tr.once && tr.used)) continue;
        if (tr.aabb.contains(p.pos, 0.2)) {
          if (tr.once) tr.used = true;
          tr.cb(tr);
        }
      }
      // interact key (edge)
      if (this.input.down('KeyE') && !this._eHeld) {
        this._eHeld = true;
        this.interact();
      } else if (!this.input.down('KeyE')) {
        this._eHeld = false;
      }

      // level updaters
      for (const u of this.current.kit.updaters) u(dt, this);
      if (this.current.def.update) this.current.def.update(dt, this.current.kit);
    }
    // fade overlay
    if (this.fade.target !== this.fade.a) {
      const d = Math.sign(this.fade.target - this.fade.a) * dt * this.fade.speed;
      this.fade.a = Math.max(0, Math.min(1, this.fade.a + d));
      this.ui.setFade(this.fade.a, this.fade.color);
    }
  }

  render() {
    if (!this.current) return;
    const kit = this.current.kit;
    const p = this.player;
    this.renderer.view = p.view;
    const aspect = this.renderer.w / Math.max(1, this.renderer.h);
    M4.perspective(this.renderer.proj, 75 * Math.PI / 180, aspect, 0.05, 90);
    this.renderer.draw({
      ...kit.env,
      camPos: p.camPos,
      glowAll: false,
    });
  }

  /* ---------- pause / menu ---------- */
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.exitLock();
    this.ui.showScreen('pause');
  }

  resume() {
    if (this.state !== 'paused' && this.state !== 'playing') return;
    this.state = 'playing';
    this.ui.hideScreens();
    this.ui.hud(true);
    this.audio.resume();
    this.input.requestLock();
  }

  toMenu() {
    this.state = 'menu';
    this.player.frozen = true;
    this.audio.stopDrone(1.0);
    this.audio.tapeStop();
    this.ui.clearSubtitles();
    this.ui.tapeIndicator(false);
    this.input.exitLock();
    if (this.current) { this.current.kit.dispose(); this.current = null; }
    this.ui.showScreen('main');
  }

  /* ---------- ending ---------- */
  runEnding() {
    this.state = 'ending';
    this.player.frozen = true;
    this.audio.stopDrone(2);
    this.audio.endingPad();
    this.ui.runEnding(() => {
      this.save.endingSeen = true;
      this.save.persist();
      this.state = 'menu';
      this.ui.showScreen('main');
      this.ui.setTitleVoidMode(true);
    });
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

const _ro = V.make(), _rd = V.make();

function _doorsOf(kit) {
  return kit.doors || [];
}
