/* test/stubs.mjs — headless DOM / WebGL / WebAudio / localStorage stubs so the
   real game modules run under Node for integration testing. */

const GL_CONSTANTS = [
  'COMPILE_STATUS', 'LINK_STATUS', 'VERTEX_SHADER', 'FRAGMENT_SHADER',
  'DEPTH_TEST', 'LEQUAL', 'CULL_FACE', 'BACK', 'BLEND',
  'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'TEXTURE_2D', 'RGBA', 'UNSIGNED_BYTE',
  'LINEAR', 'REPEAT', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T',
  'TEXTURE_MIN_FILTER', 'TEXTURE_MAG_FILTER', 'UNPACK_FLIP_Y_WEBGL',
  'ARRAY_BUFFER', 'ELEMENT_ARRAY_BUFFER', 'STATIC_DRAW', 'FLOAT',
  'TRIANGLES', 'COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT',
];

function makeGL() {
  const gl = {};
  GL_CONSTANTS.forEach((n, i) => { gl[n] = i + 1; });
  const locs = new Map(); const attrs = new Map();
  let locN = 1;
  Object.assign(gl, {
    canvas: null,
    createShader: () => ({}),
    shaderSource() {}, compileShader() {},
    getShaderParameter: () => true,
    getShaderInfoLog: () => '',
    createProgram: () => ({}),
    attachShader() {}, linkProgram() {},
    getProgramParameter: () => true,
    getProgramInfoLog: () => '',
    useProgram() {},
    getUniformLocation: (p, n) => { if (!locs.has(n)) locs.set(n, { n, i: locN++ }); return locs.get(n); },
    getAttribLocation: (p, n) => { if (!attrs.has(n)) attrs.set(n, attrs.size); return attrs.get(n); },
    createBuffer: () => ({}), deleteBuffer() {},
    bindBuffer() {}, bufferData() {}, vertexAttribPointer() {}, enableVertexAttribArray() {},
    createTexture: () => ({}), deleteTexture() {},
    bindTexture() {}, texImage2D() {}, texParameteri() {}, pixelStorei() {},
    viewport() {}, clear() {}, clearColor() {},
    enable() {}, disable() {}, cullFace() {}, depthFunc() {}, blendFunc() {},
    drawElements() {},
    uniform1f() {}, uniform1i() {}, uniform3fv() {},
    uniformMatrix4fv() {}, uniformMatrix3fv() {},
  });
  return gl;
}

function make2d(canvas) {
  const state = {
    canvas, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
    textAlign: '', textBaseline: '', globalAlpha: 1, letterSpacing: 0,
    shadowColor: '', shadowBlur: 0,
  };
  return new Proxy(state, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'measureText') return (s) => ({ width: String(s).length * 11 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient') {
        return () => ({ addColorStop() {} });
      }
      if (p === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)) });
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}

let elCount = 0;
function makeEl(id) {
  const listeners = {};
  const cls = new Set();
  const el = {
    id, tagName: 'DIV',
    style: {}, value: '1', disabled: false, textContent: '', innerHTML: '',
    className: '',
    width: 300, height: 150, clientWidth: 1280, clientHeight: 720,
    children: [],
    classList: {
      add: (...cs) => cs.forEach((c) => cls.add(c)),
      remove: (...cs) => cs.forEach((c) => cls.delete(c)),
      toggle: (c, f) => {
        const on = f === undefined ? !cls.has(c) : !!f;
        if (on) cls.add(c); else cls.delete(c);
        return on;
      },
      contains: (c) => cls.has(c),
    },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    removeEventListener(type, fn) {
      const l = listeners[type];
      if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); }
    },
    dispatchEvent(ev) { (listeners[ev.type] || []).forEach((fn) => fn(ev)); return true; },
    appendChild(c) { el.children.push(c); return c; },
    removeChild(c) { const i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); return c; },
    setAttribute() {}, getAttribute() { return null; },
    focus() {}, click() {},
    requestPointerLock() { /* headless: no pointer lock */ },
    getContext(type) {
      if (type === '2d') { el._ctx2d = el._ctx2d || make2d(el); return el._ctx2d; }
      el._gl = el._gl || makeGL();
      el._gl.canvas = el;
      return el._gl;
    },
  };
  return el;
}

class FakeParam {
  constructor(v = 1) { this.value = v; }
  setValueAtTime() {} linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {} setTargetAtTime() {}
  cancelScheduledValues() {}
}

class FakeAudioNode {
  constructor() {
    this.gain = new FakeParam(1);
    this.frequency = new FakeParam(440);
    this.detune = new FakeParam(0);
    this.Q = new FakeParam(1);
    this.type = 'sine';
    this.buffer = null;
    this.loop = false;
  }
  connect(n) { return n; }
  disconnect() {}
  start() {} stop() {}
}

class FakeAudioContext {
  constructor() {
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
  }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  createGain() { return new FakeAudioNode(); }
  createOscillator() { return new FakeAudioNode(); }
  createBiquadFilter() { return new FakeAudioNode(); }
  createBufferSource() { return new FakeAudioNode(); }
  createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
}

export function installStubs() {
  if (globalThis.__stubsInstalled) return;
  globalThis.__stubsInstalled = true;

  const registry = new Map();
  globalThis.document = {
    body: makeEl('body'),
    documentElement: {
      requestFullscreen: () => Promise.resolve(),
      exitFullscreen: () => Promise.resolve(),
    },
    fullscreenElement: null,
    pointerLockElement: null,
    getElementById(id) {
      if (!registry.has(id)) registry.set(id, makeEl(id));
      return registry.get(id);
    },
    createElement() { return makeEl('el' + (elCount++)); },
    addEventListener(type, fn) {
      const l = (globalThis.document._l = globalThis.document._l || {});
      (l[type] = l[type] || []).push(fn);
    },
    removeEventListener() {},
    querySelector: () => null,
  };

  const winHandlers = {};
  globalThis.window = {
    addEventListener(type, fn) { (winHandlers[type] = winHandlers[type] || []).push(fn); },
    removeEventListener() {},
    dispatchEvent() {},
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 720,
    AudioContext: FakeAudioContext,
  };

  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  globalThis.Event = class Event { constructor(type) { this.type = type; } };
  globalThis.requestAnimationFrame = (cb) => { (globalThis.__rafQ = globalThis.__rafQ || []).push(cb); };
  globalThis.cancelAnimationFrame = () => {};
}
