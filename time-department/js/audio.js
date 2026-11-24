/* TIME DEPARTMENT — synthesized audio engine (Web Audio, zero assets) */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  var ctx = null, buses = null, humNodes = null, tickTimer = null, started = false;

  function ensureCtx() {
    if (!ctx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      var master = ctx.createGain(); master.connect(ctx.destination);
      buses = {
        master: master,
        music: mkBus(master), ambient: mkBus(master), sfx: mkBus(master)
      };
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function mkBus(dest) { var g = root.audioCtxCache = root.audioCtxCache || {}; var node = (ctx.createGain ? ctx.createGain() : null); node.connect(dest); return node; }

  function applyVolumes(s) {
    if (!ctx || !buses) return;
    buses.master.gain.value = s.master;
    buses.music.gain.value = s.music * 0.5;
    buses.ambient.gain.value = s.ambient * 0.5;
    buses.sfx.gain.value = s.sfx;
  }

  function startAmbient() {
    if (!ensureCtx() || started) return;
    started = true;
    /* low office hum: two detuned sines + filtered noise */
    var o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 55.7;
    var g = ctx.createGain(); g.gain.value = 0.05;
    o1.connect(g); o2.connect(g); g.connect(buses.ambient);
    o1.start(); o2.start();

    var bufferSize = 2 * ctx.sampleRate;
    var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    var last = 0;
    for (var i = 0; i < bufferSize; i++) { var white = Math.random() * 2 - 1; last = (last + 0.02 * white) / 1.02; data[i] = last * 3.2; }
    var noise = ctx.createBufferSource(); noise.buffer = noiseBuffer; noise.loop = true;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    var ng = ctx.createGain(); ng.gain.value = 0.05;
    noise.connect(lp); lp.connect(ng); ng.connect(buses.ambient);
    noise.start();
    humNodes = [o1, o2, noise];
  }

  function tick() {
    if (!ctx || !buses) return;
    var t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = "square"; o.frequency.value = 950;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.028, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 950; f.Q.value = 6;
    o.connect(f); f.connect(g); g.connect(buses.ambient);
    o.start(t); o.stop(t + 0.04);
  }
  function startTick() {
    stopTick();
    tickTimer = setInterval(function () { if (TD.STATE.get().settings.tick) tick(); }, 1000);
  }
  function stopTick() { if (tickTimer) clearInterval(tickTimer); tickTimer = null; }

  function blip(freq, dur, type, vol) {
    if (!ensureCtx() || !buses) return;
    var t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.value = freq || 620;
    var g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.09));
    o.connect(g); g.connect(buses.sfx);
    o.start(t); o.stop(t + (dur || 0.1) + 0.02);
  }
  var uiClick = function () { blip(660, 0.05, "square", 0.028); };
  var openDoc = function () { blip(520, 0.08, "sine", 0.05); setTimeout(function () { blip(780, 0.07, "sine", 0.04); }, 55); };
  var anomaly = function () {
    blip(220, 0.5, "sawtooth", 0.035);
    setTimeout(function () { blip(233, 0.6, "sawtooth", 0.03); }, 120);
  };
  var chime = function () {
    [523, 659, 784].forEach(function (f, i) { setTimeout(function () { blip(f, 0.34, "sine", 0.05); }, i * 140); });
  };
  var alert = function () { blip(440, 0.14, "square", 0.045); setTimeout(function () { blip(415, 0.14, "square", 0.045); }, 160); };

  TD.AUDIO = {
    unlock: function () { ensureCtx(); startAmbient(); if (TD.STATE.get()) { applyVolumes(TD.STATE.get().settings); startTick(); } },
    applyVolumes: function (s) { applyVolumes(s); },
    setTick: function (on) { if (on) startTick(); else stopTick(); },
    click: uiClick, openDoc: openDoc, anomaly: anomaly, chime: chime, alert: alert
  };
})(typeof window !== "undefined" ? window : globalThis);
