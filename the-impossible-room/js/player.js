/* player.js — first-person controller with gravity direction support,
   head-bob, sprint, jump, collision via physics.moveCollide. */

import { V, Q, M4 } from './engine/math3.js';
import { moveCollide, isGrounded, upAxis } from './physics.js';

const EYE = 1.62;
const RADIUS = 0.32;
const HALF_H = 0.85; // center is EYE - HALF_H below eye when standing on normal gravity... defined relative to feet
const SPEED = 4.1;
const SPRINT = 1.62;
const ACCEL = 26;
const AIR_ACCEL = 6;
const FRICTION = 11;
const JUMP = 7.2;
const GRAV_ACC = 21;
const COYOTE = 0.09;
const JUMP_BUFFER = 0.14;

export class Player {
  constructor() {
    this.pos = V.make(0, 2, 0);       // eye position
    this.vel = V.make(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.g = V.make(0, -1, 0);        // gravity dir (world axis)
    this.up = V.make(0, 1, 0);        // = -g (instant, for physics)
    this.visUp = V.make(0, 1, 0);     // smoothed, for camera roll transition
    this.visUpTarget = V.make(0, 1, 0);
    this.grounded = false;
    this.bobT = 0;
    this.stepDist = 0;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.landKick = 0;
    this.speed2d = 0;
    this.sprinting = false;
    this.onStepCB = null;
    this.onLandCB = null;
    this.wasGrounded = true;
    this.camPos = V.make();
    this.camQuat = Q.ident();
    this.fwd = V.make(0, 0, -1);
    this.right = V.make(1, 0, 0);
    this.camUp = V.make(0, 1, 0);
    this.view = M4.ident();
    this.frozen = false;
    this.upQuat = Q.ident();
  }

  teleport(pos, yaw = this.yaw) {
    V.copy(this.pos, pos);
    V.copy(this.vel, [0, 0, 0]);
    this.yaw = yaw;
    this.pitch = 0;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.landKick = 0;
    this.speed2d = 0;
  }

  setGravity(g) {
    V.copy(this.g, g);
    V.copy(this.up, V.make(-g[0], -g[1], -g[2]));
    V.norm(this.up, this.up);
    V.copy(this.visUpTarget, this.up);
    // keep yaw meaningful: preserve current forward projected
  }

  look(dx, dy) {
    this.yaw -= dx * 0.0022;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * 0.0022));
  }

  update(dt, input, colliders) {
    // mouse look
    if (!this.frozen) {
      const [dx, dy] = input.takeMouse();
      this.look(dx, dy);
    } else {
      input.takeMouse();
    }

    // smooth visual up (camera roll during gravity shifts)
    const t = Math.min(1, dt * 3.2);
    V.lerp(_vu, this.visUp, this.visUpTarget, t);
    V.norm(this.visUp, _vu);

    // movement basis from yaw + physics up
    const qUp = _q0;
    Q.fromTo(qUp, _Y, this.up);
    const qYaw = _q1;
    Q.setAxisAngle(qYaw, this.up, this.yaw);
    Q.mul(camQ2, qUp, qYaw);
    Q.setAxisAngle(_qtmp, [1, 0, 0], this.pitch);
    Q.mul(camQ2, camQ2, _qtmp);
    Q.rotate(this.fwd, camQ2, _F);
    Q.rotate(this.right, camQ2, _R);
    Q.rotate(this.camUp, camQ2, _U);

    if (this.frozen) {
      this._computeCam(0, dt);
      return;
    }

    this.coyote = Math.max(0, this.coyote - dt);
    this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    if (input.down('Space')) this.jumpBuf = JUMP_BUFFER;

    const sprint = input.down('ShiftLeft') || input.down('ShiftRight');
    let ix = 0, iz = 0;
    if (input.down('KeyW') || input.down('ArrowUp')) iz -= 1;
    if (input.down('KeyS') || input.down('ArrowDown')) iz += 1;
    if (input.down('KeyA') || input.down('ArrowLeft')) ix -= 1;
    if (input.down('KeyD') || input.down('ArrowRight')) ix += 1;
    const moving = ix !== 0 || iz !== 0;
    const speed = SPEED * (sprint ? SPRINT : 1);

    // decompose velocity into up / plane
    const up = this.up;
    const vUp = V.dot(this.vel, up);
    _vp[0] = this.vel[0] - up[0] * vUp;
    _vp[1] = this.vel[1] - up[1] * vUp;
    _vp[2] = this.vel[2] - up[2] * vUp;

    // desired plane velocity
    V.cross(_r, this.fwd, up); // right in plane
    if (V.lenSq(_r) < 1e-6) V.copy(_r, this.right);
    V.norm(_r, _r);
    _f[0] = this.fwd[0] - up[0] * V.dot(this.fwd, up);
    _f[1] = this.fwd[1] - up[1] * V.dot(this.fwd, up);
    _f[2] = this.fwd[2] - up[2] * V.dot(this.fwd, up);
    V.norm(_f, _f);
    _wish[0] = _f[0] * (-iz) + _r[0] * ix;
    _wish[1] = _f[1] * (-iz) + _r[1] * ix;
    _wish[2] = _f[2] * (-iz) + _r[2] * ix;
    if (moving) V.norm(_wish, _wish); else V.set(_wish, 0, 0, 0);

    const accel = (this.grounded ? ACCEL : AIR_ACCEL) * dt;
    _target[0] = _wish[0] * speed; _target[1] = _wish[1] * speed; _target[2] = _wish[2] * speed;
    if (moving) {
      _vp[0] = _approach(_vp[0], _target[0], accel);
      _vp[1] = _approach(_vp[1], _target[1], accel);
      _vp[2] = _approach(_vp[2], _target[2], accel);
    } else if (this.grounded) {
      const f = Math.max(0, 1 - FRICTION * dt);
      _vp[0] *= f; _vp[1] *= f; _vp[2] *= f;
    }

    // gravity along g
    let nvUp = vUp - GRAV_ACC * dt; // up component along player's up is dot(v,up); gravity is -up dir
    if (this.jumpBuf > 0 && this.coyote > 0) {
      nvUp = JUMP;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuf = 0;
    }

    // recompose
    this.vel[0] = _vp[0] + up[0] * nvUp;
    this.vel[1] = _vp[1] + up[1] * nvUp;
    this.vel[2] = _vp[2] + up[2] * nvUp;

    // integrate with collisions
    const delta = _d;
    V.scale(delta, this.vel, dt);
    const wasG = this.grounded;
    const res = moveCollide(this.pos, delta, up, colliders, wasG, RADIUS, HALF_H);
    if (res.hitX) this.vel[0] = 0;
    if (res.hitY) this.vel[1] = 0;
    if (res.hitZ) this.vel[2] = 0;

    this.grounded = isGrounded(this.pos, up, colliders, RADIUS, HALF_H);
    if (this.grounded) {
      this.coyote = COYOTE;
      // cancel velocity into ground
      const vu2 = V.dot(this.vel, up);
      if (vu2 < 0) {
        this.vel[0] -= up[0] * vu2; this.vel[1] -= up[1] * vu2; this.vel[2] -= up[2] * vu2;
      }
      if (!wasG && this.onLandCB) {
        const impact = Math.min(1.5, Math.abs(nvUp) / 8);
        this.landKick = Math.min(0.085, impact * 0.05);
        this.onLandCB(impact);
      }
    }

    // footsteps
    const hs = Math.hypot(_vp[0], _vp[1], _vp[2]);
    this.speed2d = hs;
    this.sprinting = !!sprint && hs > 2.0;
    if (this.grounded && hs > 0.5) {
      this.stepDist += hs * dt;
      const stride = sprint ? 2.6 : 2.0;
      if (this.stepDist > stride) { this.stepDist = 0; if (this.onStepCB) this.onStepCB(sprint); }
      this.bobT += hs * dt * (sprint ? 1.5 : 1.15);
    } else {
      this.bobT += dt * 0.4;
    }

    this._computeCam(hs, dt);
  }

  _computeCam(hs, dt) {
    this.landKick = Math.max(0, this.landKick - this.landKick * dt * 9 - dt * 0.004);
    // head bob offset along visUp
    const bob = Math.min(0.045, hs * 0.004);
    const off = Math.sin(this.bobT * 2.1) * bob * (this.grounded ? 1 : 0.2) - this.landKick;
    V.copy(this.camPos, this.pos);
    this.camPos[0] += this.visUp[0] * off;
    this.camPos[1] += this.visUp[1] * off;
    this.camPos[2] += this.visUp[2] * off;

    // camera basis from yaw/pitch around visUp
    const qUp = _q0;
    Q.fromTo(qUp, _Y, this.visUp);
    const qYaw = _q1;
    Q.setAxisAngle(qYaw, this.visUp, this.yaw);
    Q.mul(camQ2, qUp, qYaw);
    Q.setAxisAngle(_qtmp, [1, 0, 0], this.pitch);
    Q.mul(camQ2, camQ2, _qtmp);
    Q.copy(this.camQuat, camQ2);
    Q.rotate(this.fwd, camQ2, _F);
    Q.rotate(this.right, camQ2, _R);
    Q.rotate(this.camUp, camQ2, _U);
    V.copy(_back, this.fwd);
    V.scale(_back, _back, -1);
    M4.fromBasis(this.view, this.camPos, this.right, this.camUp, _back);
  }
}

/* scratch vectors */
const _vu = V.make(), _vp = V.make(), _r = V.make(), _f = V.make(), _wish = V.make();
const _target = V.make(), _d = V.make(), _F = V.make(0, 0, -1), _R = V.make(1, 0, 0), _U = V.make(0, 1, 0);
const _back = V.make();
const _Y = V.make(0, 1, 0);
const _tmpv = V.make();
const _q0 = Q.ident(), _q1 = Q.ident(), _q2 = Q.ident(), _q3 = Q.ident(), _q4 = Q.ident();
const _qtmp = Q.ident();
const camQ2 = Q.ident();

function _approach(cur, target, maxDelta) {
  const d = target - cur;
  if (Math.abs(d) <= maxDelta) return target;
  return cur + Math.sign(d) * maxDelta;
}
