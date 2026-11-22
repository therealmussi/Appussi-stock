/* audio.js — fully procedural WebAudio sound design. Buses: master -> {music, sfx}. */

export class AudioSys {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volumes = { master: 0.8, music: 0.7, sfx: 0.9 };
    this.droneNodes = null;
    this.tapeNodes = null;
    this._noise = null;
  }

  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.music = this.ctx.createGain();
    this.sfx = this.ctx.createGain();
    this.music.connect(this.master);
    this.sfx.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.applyVolumes();
    // shared 2s noise buffer
    const len = this.ctx.sampleRate * 2;
    this._noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this._noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  resume() { this.ctx?.resume?.(); }
  suspend() { this.ctx?.suspend?.(); }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.volumes.master, t, 0.05);
    this.music.gain.setTargetAtTime(this.volumes.music, t, 0.05);
    this.sfx.gain.setTargetAtTime(this.volumes.sfx, t, 0.05);
  }

  _noiseSrc(loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = this._noise;
    s.loop = loop;
    return s;
  }

  /* ------- ambient drone per level ------- */
  startDrone({ root = 55, fifth = true, airAmt = 0.5, mood = 'grey' } = {}) {
    this.stopDrone(1.2);
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 3);
    g.connect(this.music);

    const o1 = this.ctx.createOscillator();
    o1.type = 'sine'; o1.frequency.value = root;
    const o2 = this.ctx.createOscillator();
    o2.type = 'triangle'; o2.frequency.value = root * (mood === 'blue' ? 1.5 : 1.498);
    const oG = this.ctx.createGain(); oG.gain.value = mood === 'blue' ? 0.35 : 0.55;
    o2.connect(oG); oG.connect(g); o1.connect(g);

    // slow shimmer LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07 + Math.random() * 0.05;
    const lfoG = this.ctx.createGain(); lfoG.gain.value = root * 0.01;
    lfo.connect(lfoG); lfoG.connect(o2.frequency);

    // airy noise bed
    const air = this._noiseSrc(true);
    const airF = this.ctx.createBiquadFilter();
    airF.type = 'bandpass'; airF.frequency.value = 420; airF.Q.value = 0.6;
    const airG = this.ctx.createGain(); airG.gain.value = 0.14 * airAmt;
    air.connect(airF); airF.connect(airG); airG.connect(g);

    o1.start(); o2.start(); lfo.start(); air.start();
    this.droneNodes = { g, stop: () => { try { o1.stop(); o2.stop(); lfo.stop(); air.stop(); } catch (e) { } } };
  }

  stopDrone(fade = 0.8) {
    if (!this.droneNodes) return;
    const { g, stop } = this.droneNodes;
    const t = this.ctx.currentTime;
    g.gain.setTargetAtTime(0, t, fade / 3);
    setTimeout(stop, fade * 1000 + 100);
    this.droneNodes = null;
  }

  /* ------- one-shots ------- */
  _one(fn) {
    if (!this.ctx) return;
    fn(this.ctx, this.ctx.currentTime);
  }

  footstep(run = false) {
    this._one((ctx, t) => {
      const s = this._noiseSrc();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 260 + Math.random() * 240;
      f.Q.value = 1.4;
      const g = ctx.createGain();
      const v = run ? 0.16 : 0.1;
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      s.connect(f); f.connect(g); g.connect(this.sfx);
      s.start(t); s.stop(t + 0.12);
    });
  }

  landing(force = 1) {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3 * Math.min(force, 1.4), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(this.sfx);
      o.start(t); o.stop(t + 0.25);
    });
  }

  door(open = true) {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(open ? 82 : 110, t);
      o.frequency.linearRampToValueAtTime(open ? 126 : 74, t + 0.42);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.06);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.5);
      o.connect(f); f.connect(g); g.connect(this.sfx);
      o.start(t); o.stop(t + 0.55);
      const n = this._noiseSrc();
      const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 900;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.05, t + 0.3);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      n.connect(nf); nf.connect(ng); ng.connect(this.sfx);
      n.start(t + 0.3); n.stop(t + 0.55);
    });
  }

  latch() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(1200, t);
      o.frequency.exponentialRampToValueAtTime(300, t + 0.03);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.08);
    });
  }

  switchSnd() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(220, t);
      o.frequency.linearRampToValueAtTime(160, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
      o.connect(f); f.connect(g); g.connect(this.sfx);
      o.start(t); o.stop(t + 0.32);
      this.latch();
    });
  }

  portal() {
    this._one((ctx, t) => {
      const n = this._noiseSrc();
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(2600, t + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.18);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.42);
      n.connect(f); f.connect(g); g.connect(this.sfx);
      n.start(t); n.stop(t + 0.45);
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.4);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.18, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      o.connect(og); og.connect(this.sfx);
      o.start(t); o.stop(t + 0.45);
    });
  }

  solved() {
    this._one((ctx, t) => {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((hz, i) => {
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = hz;
        const g = ctx.createGain();
        const st = t + i * 0.11;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(0.12, st + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.7);
        o.connect(g); g.connect(this.sfx);
        o.start(st); o.stop(st + 0.75);
      });
    });
  }

  gravityShift() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(28, t + 1.0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g); g.connect(this.sfx);
      o.start(t); o.stop(t + 1.25);
      const n = this._noiseSrc(true);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 200;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.12, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      n.connect(f); f.connect(ng); ng.connect(this.sfx);
      n.start(t); n.stop(t + 1.05);
    });
  }

  chime() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.value = 1318.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.42);
    });
  }

  denied() {
    this._one((ctx, t) => {
      [0, 0.14].forEach((dt) => {
        const o = ctx.createOscillator(); o.type = 'square';
        o.frequency.value = 130;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.07, t + dt);
        g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.1);
        o.connect(g); g.connect(this.sfx);
        o.start(t + dt); o.stop(t + dt + 0.12);
      });
    });
  }

  pickup() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(660, t);
      o.frequency.linearRampToValueAtTime(880, t + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.22);
    });
  }

  uiClick() {
    this._one((ctx, t) => {
      const o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.value = 720;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.1);
    });
  }

  /* ------- tape recorder ------- */
  tapeStart() {
    this.tapeStop();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = this._noiseSrc(true);
    const f = ctx2bp(this.ctx, 1800, 0.4);
    const g = ctx2gain(this.ctx, 0.035);
    n.connect(f); f.connect(g); g.connect(this.sfx);
    n.start();
    this.tapeNodes = { n, g };
  }

  tapeStop() {
    if (!this.tapeNodes) return;
    const { g, n } = this.tapeNodes;
    const t = this.ctx.currentTime;
    g.gain.setTargetAtTime(0, t, 0.15);
    setTimeout(() => { try { n.stop(); } catch (e) { } }, 500);
    this.tapeNodes = null;
  }

  /* ------- ending pad ------- */
  endingPad() {
    this._one((ctx, t) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.1, t + 4);
      g.gain.linearRampToValueAtTime(0.0001, t + 14);
      g.connect(this.music);
      [110, 164.81, 220, 277.18].forEach((hz, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? 'sine' : 'triangle';
        o.frequency.value = hz;
        o.detune.value = (Math.random() * 8 - 4);
        o.connect(g);
        o.start(t); o.stop(t + 14.5);
      });
    });
  }
}

function ctx2bp(ctx, freq, q) {
  const f = ctx.createBiquadFilter(); f.type = 'bandpass';
  f.frequency.value = freq; f.Q.value = q; return f;
}
function ctx2gain(ctx, v) {
  const g = ctx.createGain(); g.gain.value = v; return g;
}
