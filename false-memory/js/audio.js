/* audio interamente sintetizzato con WebAudio: nessun asset esterno */
(function () {
  let ctx = null, master = null, musicGain = null, sfxGain = null, ambientNodes = null;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.connect(master);
      sfxGain = ctx.createGain(); sfxGain.connect(master);
      applyVolumes();
    } catch (e) { return false; }
    return true;
  }
  function applyVolumes() {
    if (!ctx) return;
    const s = window.FMState.st.settings;
    const on = s.audioOn ? 1 : 0;
    master.gain.value = on;
    musicGain.gain.value = s.music;
    sfxGain.gain.value = s.sfx;
  }
  function resume() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function noiseBuffer(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function startAmbient() {
    if (ensure() === false || ambientNodes) return;
    const t = ctx.currentTime;
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 48;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 48.9;
    const g = ctx.createGain(); g.gain.value = 0.0; g.gain.linearRampToValueAtTime(0.05, t + 4);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
    o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(musicGain);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lg = ctx.createGain(); lg.gain.value = 0.02;
    lfo.connect(lg); lg.connect(g.gain);

    const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer(4); noise.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 420; nf.Q.value = 0.6;
    const ng = ctx.createGain(); ng.gain.value = 0.012;
    noise.connect(nf); nf.connect(ng); ng.connect(musicGain);

    o1.start(); o2.start(); lfo.start(); noise.start();
    ambientNodes = { o1, o2, lfo, noise, g };
  }
  function stopAmbient() {
    if (!ambientNodes) return;
    try { ['o1','o2','lfo','noise'].forEach(k => ambientNodes[k].stop()); } catch (e) {}
    ambientNodes = null;
  }

  function blip(freq, dur, type, vol, when) {
    if (!ensure()) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(); o.type = type || 'square'; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.08));
    o.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + (dur || 0.08) + 0.05);
  }
  function noiseHit(dur, freq, vol, when) {
    if (!ensure()) return;
    const t = ctx.currentTime + (when || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur + 0.05);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 800; f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t); src.stop(t + dur + 0.1);
  }

  const SFX = {
    click() { blip(2200, 0.03, 'square', 0.04); },
    paper() { noiseHit(0.16, 900, 0.12); noiseHit(0.1, 500, 0.06, 0.08); },
    unlock() { blip(660, 0.09, 'sine', 0.07); blip(990, 0.12, 'sine', 0.07, 0.09); },
    camera() { noiseHit(0.05, 2400, 0.16); blip(180, 0.05, 'square', 0.05, 0.04); },
    type() { blip(1400 + Math.random() * 500, 0.015, 'square', 0.02); },
    contradiction() { blip(220, 0.14, 'sawtooth', 0.09); blip(207, 0.2, 'sawtooth', 0.07, 0.08); },
    phone() { for (let i = 0; i < 3; i++) noiseHit(0.08, 1400, 0.12, i * 0.25); },
    motif() { [392, 311, 233, 155].forEach((f, i) => blip(f, 0.5, 'triangle', 0.05, i * 0.45)); }
  };

  /* voce sintetica per le registrazioni: ronzio modulato, non parlato */
  function voice(freqBase, dur, vol) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freqBase;
    const vib = ctx.createOscillator(); vib.frequency.value = 6;
    const vg = ctx.createGain(); vg.gain.value = freqBase * 0.25;
    vib.connect(vg); vg.connect(o.frequency);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freqBase * 4; bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.15);
    g.gain.setValueAtTime(vol || 0.05, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(bp); bp.connect(g); g.connect(sfxGain);
    o.start(t); vib.start(t); o.stop(t + dur); vib.stop(t + dur);
  }

  window.FMAudio = {
    resume, applyVolumes, startAmbient, stopAmbient, sfx: SFX, voice,
    get ctx() { return ctx; }
  };
})();
