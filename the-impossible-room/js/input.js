/* input.js — keyboard + mouse, pointer lock, virtual overrides for tests. */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.virtual = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.locked = false;
    this.onLockChange = null;
    this.sensitivity = 1;

    this._kd = (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    };
    this._ku = (e) => this.keys.delete(e.code);
    this._mm = (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.mouseDX += e.movementX || 0;
        this.mouseDY += e.movementY || 0;
      }
    };
    this._plc = () => {
      this.locked = document.pointerLockElement === this.canvas;
      if (this.onLockChange) this.onLockChange(this.locked);
    };
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    window.addEventListener('mousemove', this._mm);
    document.addEventListener('pointerlockchange', this._plc);
  }

  requestLock() {
    if (document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock?.();
    }
  }

  exitLock() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock?.();
  }

  down(code) { return this.virtual.size > 0 ? this.virtual.has(code) : this.keys.has(code); }

  setVirtual(code, down) {
    if (down) this.virtual.add(code); else this.virtual.delete(code);
  }

  takeMouse() {
    const dx = this.mouseDX * this.sensitivity, dy = this.mouseDY * this.sensitivity;
    this.mouseDX = 0; this.mouseDY = 0;
    return [dx, dy];
  }

  clear() { this.keys.clear(); this.virtual.clear(); this.mouseDX = this.mouseDY = 0; }

  dispose() {
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
    window.removeEventListener('mousemove', this._mm);
    document.removeEventListener('pointerlockchange', this._plc);
  }
}
