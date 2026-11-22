/* LEVEL 03 — UPSIDE DOWN
   A room, a bolted hatch, and gravity that answers to you. */

import { V } from '../engine/math3.js';
import { PAL } from '../kit.js';
import { AABB } from '../physics.js';

export default {
  title: 'ROOM 03 — UPSIDE DOWN',
  subtitle: 'down is a rumor you can revoke',
  spawn: { pos: [2.6, 1.62, 3.2], yaw: 2.2 },
  mood: { root: 42, mood: 'blue', airAmt: 0.7 },
  env: {
    background: [0.05, 0.055, 0.06],
    fogColor: [0.05, 0.055, 0.06],
    fogDensity: 0.024,
    ambient: [0.3, 0.31, 0.34],
    sunDir: V.norm(V.make(), V.make(0.15, -0.9, 0.15)),
    sunColor: [0.3, 0.3, 0.34],
  },
  build(kit) {
    const G_DOWN = [0, -1, 0], G_UP = [0, 1, 0];

    /* ---------- Room A (terrestrial) ---------- */
    kit.room(0, 1.7, 0, 9, 3.4, 8, {
      wallMat: 'wallGrey', floorMat: 'floorGrey', ceilMat: 'ceilPale',
      holes: { ceiling: { x: 0, z: 0, w: 2.4, d: 2.4 } },
    });
    kit.lamp([0, 3.26, 2.6], [0.9, 0.88, 0.8], 0.95);
    kit.bed([3.0, 0, 1.8]);
    kit.desk([3.2, 0, -2.6], Math.PI * 0.5);

    // hatch plug over the ceiling hole — bolted shut
    const hatch = kit.dynBox([2.4, 0.16, 2.4], 'metal', { color: [0.52, 0.52, 0.55] });
    V.set(hatch.pos, 0, 3.42, 0);
    hatch.update();
    const hatchCollider = new AABB(0, 3.42, 0, 1.2, 0.22, 1.2);
    kit.colliders.push(hatchCollider);

    kit.interact([3.2, 1.1, -2.6], [1.2, 1.4, 1.2], 'Pull the bolt release', () => {
      if (kit.state.released) { kit.msg('The bolts are already gone. The hatch below drafts faintly.', 3.5); return; }
      kit.state.released = true;
      hatchCollider.disabled = true;
      kit.game.audio.switchSnd();
      setTimeout(() => kit.game.audio.solved(), 500);
      kit.msg('Bolts retract somewhere above you. The hatch is loose now.', 4.5);
      kit.updaters.push(function drop(dt) {
        hatch.pos[1] -= dt * 1.4;
        hatch.update();
        if (hatch.pos[1] < 0.2) {
          hatch.visible = false;
          hatch.update();
          const i = kit.updaters.indexOf(drop);
          if (i >= 0) kit.updaters.splice(i, 1);
        }
      });
    }, { id: 'lever_hatch' });

    kit.plaque([-4.2, 1.7, 3.9], 's', ['THE HATCH ABOVE IS BOLTED.', 'PULL ITS RELEASE.', 'THE CEILING IS A FLOOR THAT HAS NOT DECIDED.'], { w: 2.5, h: 1.2 });
    kit.text([4.34, 1.9, 1.5], 'w', ['UP IS ALSO', 'A DECISION'], { px: 70, fg: 'rgba(40,40,45,0.6)' });

    kit.gravityPad([0, 0.03, 0.6], G_UP, {
      id: 'pad_up', label: 'Invert gravity',
      msg: 'Down lets go. You rise like a note released.',
    });

    /* ---------- Room B (above; you will arrive hanging) ---------- */
    const B = { base: 10.0, h: 3.4, w: 9, d: 8 };
    kit.room(0, B.base + B.h / 2, 0, B.w, B.h, B.d, {
      wallMat: 'wallBeige', floorMat: 'floorPale', ceilMat: 'ceilDark',
      holes: { floor: { x: 0, z: 0, w: 2.4, d: 2.4 } },
    });
    kit.lamp([0, B.base + 3.3, 2.6], [0.85, 0.9, 1.0], 0.95);
    kit.desk([-3.0, B.base, -2.2], 0);
    kit.bed([2.8, B.base, -2.0]);
    kit.tape('t4', [0.6, B.base, 1.8], 'T-04', [
      'Recording 4. I have stopped asking which way is down.',
      'The building does not have a down. It has a POLICY.',
      'Today the floor is where I say. The building can cope.',
    ]);
    kit.plaque([-4.2, B.base + 1.9, 3.9], 's', ['THIS ROOM WAS NEVER TURNED.', 'ONLY YOU WERE.'], { w: 2.5, h: 0.9 });

    // arriving at B's ceiling; restore from there, or from B's floor
    kit.gravityPad([2.6, B.base + B.h - 0.05, 2.2], G_DOWN, {
      id: 'pad_down', label: 'Restore gravity',
      msg: 'The room remembers which way down was. You fall into it.',
    });
    kit.gravityPad([-2.6, B.base + 0.05, 2.2], G_UP, {
      id: 'pad_up_b', label: 'Invert gravity (again)',
      msg: 'Up again. The ceiling furniture, as advertised, works.',
    });

    kit.door({
      id: 'exit_b', pos: [0, B.base, -3.94], facing: 's',
      label: 'Continue',
      afterOpen: () => kit.complete(),
    });

    setTimeout(() => kit.msg('A hatch overhead, bolted shut. A lever on the desk. Gravity is a lever too.', 5), 800);
  },
};
