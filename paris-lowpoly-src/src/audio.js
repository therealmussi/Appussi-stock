import { VEHICLE_TYPES } from './config.js';

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.station = 0;
    this.nextStepTime = 0;
    this.stepIndex = 0;
    this.started = false;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);

    // --- Motore ---
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 50;
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 400;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineOsc.connect(this.engineFilter).connect(this.engineGain).connect(this.master);
    this.engineOsc.start();

    // --- Rumore bianco condiviso (derapate / crash) ---
    const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noiseBuffer = noiseBuf;

    this.skidSrc = this.ctx.createBufferSource();
    this.skidSrc.buffer = noiseBuf;
    this.skidSrc.loop = true;
    this.skidFilter = this.ctx.createBiquadFilter();
    this.skidFilter.type = 'bandpass';
    this.skidFilter.frequency.value = 900;
    this.skidGain = this.ctx.createGain();
    this.skidGain.gain.value = 0;
    this.skidSrc.connect(this.skidFilter).connect(this.skidGain).connect(this.master);
    this.skidSrc.start();

    // --- Sirena ---
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = 'triangle';
    this.sirenOsc.frequency.value = 720;
    this.sirenLfo = this.ctx.createOscillator();
    this.sirenLfo.type = 'sine';
    this.sirenLfo.frequency.value = 1.4;
    this.sirenLfoGain = this.ctx.createGain();
    this.sirenLfoGain.gain.value = 180;
    this.sirenLfo.connect(this.sirenLfoGain).connect(this.sirenOsc.frequency);
    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.value = 0;
    this.sirenOsc.connect(this.sirenGain).connect(this.master);
    this.sirenOsc.start();
    this.sirenLfo.start();

    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.started = true;
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  // ---------- update per frame ----------
  update(G, dt) {
    if (!this.started) return;
    const t = this.ctx.currentTime;
    const p = G.player;
    const car = p.vehicle;

    if (car) {
      const st = VEHICLE_TYPES[car.type];
      const sp = Math.abs(car.vF);
      const throttle = Math.abs(G.keys['w'] || G.keys['s'] ? 1 : 0.35);
      const f = st.engineBase + sp * st.engineGain * (1 + (G.keys['w'] ? 0.35 : 0));
      this.engineOsc.frequency.setTargetAtTime(f, t, 0.05);
      this.engineFilter.frequency.setTargetAtTime(300 + sp * 30, t, 0.05);
      this.engineGain.gain.setTargetAtTime(0.045 + 0.03 * throttle, t, 0.08);
      const handbrake = G.keys[' '] && sp > 4;
      this.skidGain.gain.setTargetAtTime(handbrake ? 0.12 : 0, t, 0.05);
    } else {
      this.engineGain.gain.setTargetAtTime(0, t, 0.2);
      this.skidGain.gain.setTargetAtTime(0, t, 0.1);
    }

    // Sirena in base alla distanza dalla polizia più vicina
    let nearest = Infinity;
    for (const v of G.vehicles) {
      if (v.role === 'police') {
        const d = Math.hypot(v.pos.x - p.pos.x, v.pos.z - p.pos.z);
        if (d < nearest) nearest = d;
      }
    }
    const sirena = (nearest < 90 && G.wanted.stars > 0)
      ? Math.max(0, 0.14 * (1 - nearest / 90)) : 0;
    this.sirenGain.gain.setTargetAtTime(sirena, t, 0.2);

    if (this.station !== 0) this.scheduleRadio();
  }

  // ---------- effetti puntuali ----------
  blip(freq, dur, type = 'square', gain = 0.08, slideTo = null) {
    if (!this.started) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  horn() {
    this.blip(370, 0.35, 'square', 0.07);
    this.blip(466, 0.35, 'square', 0.07);
  }

  crash(intensity = 1) {
    if (!this.started) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 500;
    const g = this.ctx.createGain();
    const v = Math.min(0.3, 0.08 * intensity);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.4);
    this.blip(80, 0.2, 'sine', 0.1, 40);
  }

  pedalChime() {
    this.blip(660, 0.15, 'sine', 0.1);
    setTimeout(() => this.blip(880, 0.25, 'sine', 0.1), 140);
  }

  sirenTimes() { /* inline */ }

  nextRaceStation() {
    this.station = (this.station + 1) % 3;
    if (this.station !== 0) this.nextStepTime = this.ctx.currentTime + 0.1;
    this.stepIndex = 0;
    return ['Radio spenta', '📻 French Touch Electro', '🎻 Classica Parigina'][this.station];
  }

  note(start, freq, dur, type, gain, attack = 0.005) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(this.master);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  kick(start) {
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, start);
    o.frequency.exponentialRampToValueAtTime(42, start + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.24, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    o.connect(g).connect(this.master);
    o.start(start);
    o.stop(start + 0.2);
  }

  hat(start, open = false) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 2;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6500;
    const g = this.ctx.createGain();
    const dur = open ? 0.14 : 0.045;
    g.gain.setValueAtTime(open ? 0.055 : 0.04, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  scheduleRadio() {
    const lookahead = 0.35;
    while (this.nextStepTime < this.ctx.currentTime + lookahead) {
      if (this.station === 1) this.electroStep(this.nextStepTime);
      else if (this.station === 2) this.classicStep(this.nextStepTime);
      this.nextStepTime += 60 / (this.station === 1 ? 124 : 84) / 4;
      this.stepIndex++;
    }
  }

  electroStep(t) {
    const s = this.stepIndex % 16;
    if (s % 4 === 0) this.kick(t);
    if (s % 4 === 2) this.hat(t, s === 14);
    const bassPat = [55, 55, 0, 55, 0, 55, 65.4, 55, 55, 55, 0, 73.4, 0, 65.4, 0, 61.7];
    const b = bassPat[s];
    if (b) {
      const o = this.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = b;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 420;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(f).connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.2);
    }
    if (s === 0 || s === 10) {
      const scale = [440, 494, 587, 659, 880];
      this.note(t, scale[Math.floor(Math.random() * scale.length)], 0.5, 'square', 0.03, 0.01);
    }
  }

  classicStep(t) {
    const chords = [
      [220.0, 261.6, 329.6],
      [174.6, 220.0, 261.6],
      [261.6, 329.6, 392.0],
      [196.0, 246.9, 293.7]
    ];
    const bar = Math.floor(this.stepIndex / 16) % 4;
    const s = this.stepIndex % 16;
    if (s === 0) {
      for (const f of chords[bar]) this.note(t, f / 2, 2.2, 'triangle', 0.035, 0.4);
    }
    const arp = chords[bar][s % 3] * 2;
    this.note(t, arp, 0.5, 'sine', 0.05, 0.01);
    if (s % 8 === 4) this.note(t, arp * 1.5, 0.8, 'triangle', 0.025, 0.2);
  }
}
