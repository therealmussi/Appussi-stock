/* renderer.js — WebGL renderer: single shader, material batches, point lights,
   exponential fog, two passes (opaque then cutout/transparent). */

import { M4, V, Q } from './math3.js';
import { STRIDE } from './geo.js';

const VERT = `
attribute vec3 aPos;
attribute vec3 aNrm;
attribute vec2 aUV;
attribute vec3 aCol;
uniform mat4 uProj, uView, uModel;
uniform mat3 uNormal;
varying vec3 vNrm, vCol, vWorld;
varying vec2 vUV;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz;
  gl_Position = uProj * uView * w;
  vNrm = uNormal * aNrm;
  vCol = aCol;
  vUV = aUV;
}`;

const FRAG = `
precision highp float;
varying vec3 vNrm, vCol, vWorld;
varying vec2 vUV;
uniform vec3 uAmbient, uSunDir, uSunColor, uFogColor, uCamPos, uTint, uRimColor;
uniform float uFogDensity, uEmissive, uAlpha, uTexOn, uUnlit, uRim;
uniform vec3 uPointPos[4];
uniform vec3 uPointColor[4];
uniform int uPointCount;
uniform sampler2D uTex;

void main() {
  vec3 albedo = vCol * uTint;
  if (uTexOn > 0.5) {
    vec4 t = texture2D(uTex, vUV);
    albedo *= t.rgb;
    if (t.a < 0.02) discard;
  }
  vec3 n = normalize(vNrm);
  vec3 col;
  if (uUnlit > 0.5) {
    col = albedo;
  } else {
    float lambert = max(dot(n, -uSunDir), 0.0);
    vec3 light = uAmbient + uSunColor * lambert;
    for (int i = 0; i < 4; i++) {
      if (i >= uPointCount) break;
      vec3 dp = uPointPos[i] - vWorld;
      float d2 = dot(dp, dp);
      float att = 1.0 / (1.0 + d2 * 0.09);
      vec3 L = dp * inversesqrt(max(d2, 0.0001));
      light += uPointColor[i] * max(dot(n, L), 0.0) * att;
    }
    // gentle occlusion by face normal (ceilings darker, floors lit)
    float ao = mix(0.82, 1.0, clamp(n.y * 0.5 + 0.5, 0.0, 1.0));
    col = albedo * light * ao;
    vec3 vDir = normalize(uCamPos - vWorld);
    float fres = pow(1.0 - clamp(dot(n, vDir), 0.0, 1.0), 3.0);
    col += fres * uRimColor * uRim;
  }
  col += uEmissive * albedo;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(lum), col, 1.14), 0.0, 1.0);
  float dist = length(vWorld - uCamPos);
  float fog = 1.0 - exp(-dist * uFogDensity);
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  gl_FragColor = vec4(col, uAlpha);
}`;

export class Renderer {
  constructor(canvas, quality = 'medium') {
    this.canvas = canvas;
    this.quality = quality;
    this._initGL();
    this.meshes = [];
    this.texSRGB = {};
  }

  _initGL() {
    const opts = {
      antialias: this.quality !== 'low',
      alpha: false,
      depth: true,
      powerPreference: 'high-performance',
    };
    const gl = this.canvas.getContext('webgl', opts) || this.canvas.getContext('experimental-webgl', opts);
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error('shader: ' + gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('link: ' + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);
    this.prog = prog;

    this.u = {};
    for (const name of ['uProj', 'uView', 'uModel', 'uNormal', 'uAmbient', 'uSunDir',
      'uSunColor', 'uFogColor', 'uCamPos', 'uTint', 'uFogDensity', 'uEmissive',
      'uAlpha', 'uTexOn', 'uUnlit', 'uPointPos', 'uPointColor', 'uPointCount', 'uTex',
      'uRim', 'uRimColor']) {
      this.u[name] = gl.getUniformLocation(prog, name);
    }
    this.a = {
      pos: gl.getAttribLocation(prog, 'aPos'),
      nrm: gl.getAttribLocation(prog, 'aNrm'),
      uv: gl.getAttribLocation(prog, 'aUV'),
      col: gl.getAttribLocation(prog, 'aCol'),
    };
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(this.u.uTex, 0);

    this.identity = M4.ident();
    this.normal3 = new Float32Array(9);
    this.proj = M4.ident();
    this.view = M4.ident();
    this.resize();
  }

  resize() {
    const q = this.quality === 'low' ? 0.66 : this.quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * q));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * q));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
    this.w = w; this.h = h;
    return { w, h };
  }

  recreate() {
    // quality change: rebuild context (AA is fixed at creation)
    for (const m of this.meshes) this._freeMesh(m);
    this.meshes.length = 0;
    this._recreateTextures();
    this._initGL();
  }

  _recreateTextures() {
    for (const t of this._texList || []) {
      if (t.glTex) { this.gl.deleteTexture(t.glTex); t.glTex = null; this._uploadTex(t); }
    }
  }

  makeTexture(img) {
    const t = { source: img.source || img, width: img.width, height: img.height, glTex: null };
    (this._texList = this._texList || []).push(t);
    if (this.gl) this._uploadTex(t);
    return t;
  }

  _uploadTex(t) {
    const gl = this.gl;
    t.glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t.glTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const isPOT = (v) => (v & (v - 1)) === 0;
    if (isPOT(t.width) && isPOT(t.height) && typeof gl.generateMipmap === 'function') {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const ext = typeof gl.getExtension === 'function'
        && (gl.getExtension('EXT_texture_filter_anisotropic')
          || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));
      if (ext && typeof gl.getParameter === 'function') {
        const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
      }
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }

  _bindTex(t) {
    if (!t.glTex) this._uploadTex(t);
    this.gl.bindTexture(this.gl.TEXTURE_2D, t.glTex);
  }

  /* mesh: { verts, indices, mat } — uploads and registers for drawing. */
  addMesh(geo) {
    const gl = this.gl;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, geo.verts, gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
    const mesh = {
      vbo, ibo,
      count: geo.indices.length,
      mat: geo.mat,
      model: geo.model || M4.ident(),
      alpha: geo.mat.alpha ?? 1,
      transparent: (geo.mat.alpha ?? 1) < 1 || !!geo.mat.blend,
    };
    this.meshes.push(mesh);
    return mesh;
  }

  removeMesh(mesh) {
    const i = this.meshes.indexOf(mesh);
    if (i >= 0) this.meshes.splice(i, 1);
    this._freeMesh(mesh);
  }

  _freeMesh(m) {
    const gl = this.gl;
    if (m.vbo) gl.deleteBuffer(m.vbo);
    if (m.ibo) gl.deleteBuffer(m.ibo);
  }

  _bindAttribs() {
    const gl = this.gl, a = this.a;
    gl.enableVertexAttribArray(a.pos);
    gl.enableVertexAttribArray(a.nrm);
    gl.enableVertexAttribArray(a.uv);
    gl.enableVertexAttribArray(a.col);
    const S = STRIDE * 4;
    gl.vertexAttribPointer(a.pos, 3, gl.FLOAT, false, S, 0);
    gl.vertexAttribPointer(a.nrm, 3, gl.FLOAT, false, S, 12);
    gl.vertexAttribPointer(a.uv, 2, gl.FLOAT, false, S, 24);
    gl.vertexAttribPointer(a.col, 3, gl.FLOAT, false, S, 32);
  }

  draw(env) {
    const gl = this.gl;
    gl.clearColor(env.background[0], env.background[1], env.background[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(this.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(this.u.uView, false, this.view);
    gl.uniform3fv(this.u.uCamPos, env.camPos);
    gl.uniform3fv(this.u.uAmbient, env.ambient);
    gl.uniform3fv(this.u.uSunDir, env.sunDir);
    gl.uniform3fv(this.u.uSunColor, env.sunColor);
    gl.uniform3fv(this.u.uFogColor, env.fogColor);
    gl.uniform1f(this.u.uFogDensity, env.fogDensity);
    const pc = Math.min(4, (env.points || []).length);
    const paddedPos = new Float32Array(12), paddedCol = new Float32Array(12);
    for (let i = 0; i < pc; i++) {
      paddedPos.set(env.points[i].pos, i * 3);
      paddedCol.set(env.points[i].color, i * 3);
    }
    gl.uniform3fv(this.u.uPointPos, paddedPos);
    gl.uniform3fv(this.u.uPointColor, paddedCol);
    gl.uniform1i(this.u.uPointCount, env.glowAll ? 4 : pc);
    gl.uniform1f(this.u.uRim, env.rim ? env.rim.strength : 0.16);
    gl.uniform3fv(this.u.uRimColor, env.rim ? env.rim.color : [0.5, 0.52, 0.58]);

    this.meshes.sort((m1, m2) => (m1.transparent ? 1 : 0) - (m2.transparent ? 1 : 0));

    let curTexOn = -1;
    for (const m of this.meshes) {
      const mat = m.mat;
      gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
      this._bindAttribs();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
      gl.uniformMatrix4fv(this.u.uModel, false, m.model || this.identity);
      M4.normalFromMat4(this.normal3, m.model || this.identity);
      gl.uniformMatrix3fv(this.u.uNormal, false, this.normal3);
      gl.uniform3fv(this.u.uTint, mat.tint || [1, 1, 1]);
      gl.uniform1f(this.u.uEmissive, mat.emissive || 0);
      gl.uniform1f(this.u.uAlpha, mat.alpha ?? 1);
      gl.uniform1f(this.u.uUnlit, mat.unlit ? 1 : 0);
      const texOn = mat.tex ? 1 : 0;
      if (texOn !== curTexOn) {
        gl.uniform1f(this.u.uTexOn, texOn);
        if (texOn) this._bindTex(mat.tex);
        curTexOn = texOn;
      }
      if (mat.twoSided) gl.disable(gl.CULL_FACE); else gl.enable(gl.CULL_FACE);
      gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
    }
    gl.enable(gl.CULL_FACE);
  }
}
