/* LEVEL 07 — THE ARCHITECT
   Three gates, built from everything the building has taught so far. */

import { V, Q } from '../engine/math3.js';
import { PAL, AABB } from '../kit.js';

export default {
  title: 'ROOM 07 — THE ARCHITECT',
  subtitle: 'three locks, one habit of mind each',
  spawn: { pos: [0, 1.62, 7.0], yaw: 0.0 },
  mood: { root: 31, mood: 'grey', airAmt: 0.4 },
  env: {
    background: [0.06, 0.058, 0.058],
    fogColor: [0.06, 0.058, 0.058],
    fogDensity: 0.022,
    ambient: [0.34, 0.33, 0.32],
    sunDir: V.norm(V.make(), V.make(0.15, -1, 0)),
    sunColor: [0.36, 0.34, 0.31],
  },
  build(kit) {
    const G_DOWN = [0, -1, 0], G_UP = [0, 1, 0];
    const flags = { a: false, b: false, c: false };

    /* ---------- the hall ---------- */
    const W = 26, H = 8, D = 18;
    kit.room(0, H / 2, 0, W, H, D, {
      wallMat: 'wallGrey', floorMat: 'floorGrey', ceilMat: 'ceilDark',
      holes: { floor: { x: -8, z: 0, w: 6.4, d: 3.2 } },
    });
    kit.slab('z', 0, -13, 13, H / 2 - 1.2, H / 2 + 1.2, 'wallBeige', { collide: false }); // subtle datum band
    for (const x of [-12.4, 0, 6]) kit.lamp([x, 7.85, 0], [0.95, 0.88, 0.75], 1.0);

    // marker lights for the three gates (turn blue when satisfied)
    const lamps = {};
    const mkLamp = (key, x) => {
      const l = kit.dynBox([0.3, 0.3, 0.3], 'red', { color: PAL.redGlow, unlit: true, emissive: 0.6 });
      V.set(l.pos, x, 1.5, -8.5);
      l.update();
      lamps[key] = l;
    };
    mkLamp('a', -3); mkLamp('b', 0); mkLamp('c', 3);
    const satisfy = (key, l) => {
      flags[key] = true;
      l.setMat(kit.mat('glow', { color: PAL.blueGlow, unlit: true, emissive: 0.7 }));
      if (flags.a && flags.b && flags.c) {
        setTimeout(() => {
          kit.game.audio.solved();
          mainGate.unlock();
          kit.msg('All three locks. The far door unbuilt itself politely.', 5);
        }, 600);
      }
    };

    /* ---------- Lock A: gravity ceiling-walk over a real chasm (west wing) ---------- */
    // the hall floor carries a genuine hole; pit walls + bottom make it physical
    kit.box([-8, -3.45, -1.75], [7.0, 7.1, 0.3], 'char', {});
    kit.box([-8, -3.45, 1.75], [7.0, 7.1, 0.3], 'char', {});
    kit.box([-11.35, -3.45, 0], [0.3, 7.1, 3.8], 'char', {});
    kit.box([-4.65, -3.45, 0], [0.3, 7.1, 3.8], 'char', {});
    kit.box([-8, -7.05, 0], [7.4, 0.3, 4.0], 'voidDeep', {});
    kit.lamp([-12.2, 7.85, 0], [0.95, 0.88, 0.75], 0.8);

    kit.plaque([-8, 2.2, 8.75], 'n', ['LOCK A — NOTHING SPANS THE TRENCH.', 'BUT THE CEILING WILL HOLD YOU.'], { w: 3.6, h: 0.95 });
    kit.gravityPad([-8, 0.04, 4.6], G_UP, {
      id: 'padA1', label: 'Invert gravity',
      msg: 'The hall turns its back on down. The ceiling will carry you.',
    });
    // lever on the ceiling, directly above the trench
    kit.box([-8, 7.85, 0], [0.5, 0.6, 0.5], 'ceilPale', { collide: false });
    kit.interact([-8, 7.6, 0], [1.6, 1.4, 1.8], 'Pull the overhead lever', () => {
      if (flags.a) return;
      kit.game.audio.switchSnd();
      satisfy('a', lamps.a);
      kit.msg('A lock somewhere answers: one of three.', 3.5);
    }, { id: 'leverA' });
    // restore pads on the ceiling (this side and the far side)
    kit.gravityPad([-8, 7.94, 2.6], G_DOWN, { id: 'padA2', label: 'Restore gravity', w: 1.2, msg: 'Down again. The trench forgives you this time.' });
    kit.gravityPad([-8, 7.94, -2.6], G_DOWN, { id: 'padA3', label: 'Restore gravity (far side)', w: 1.2, msg: 'Down again. Land softly.' });
    kit.gravityPad([-8, 0.04, -4.6], G_UP, { id: 'padA4', label: 'Invert gravity (return)', msg: 'Up, to get home.' });

    // if the player drops into the pit, put them back (never a dead end)
    let pitBusy = false;
    kit.trigger([-8, -5.2, 0], [6.4, 3.0, 3.2], () => {
      if (pitBusy) return;
      pitBusy = true;
      kit.game.setGravity([0, -1, 0]);
      kit.game.fadeTeleport([-8, 1.62, 4.6], 0, { alsoResetDoors: false });
      kit.game.msg('The trench declines to keep you. It prefers the ceiling route.', 4);
      setTimeout(() => { pitBusy = false; }, 1500);
    }, { once: false, id: 'pit_recover' });

    /* ---------- Lock B: two doors, one closet (impossible connection) ---------- */
    kit.plaque([4.5, 2.2, 8.75], 'n', ['LOCK B — THE SAME CLOSET, TWICE', 'THE CLOSET DECIDES ITS OWN FURNITURE.'], { w: 3.2, h: 0.95 });
    const enterCloset = (which) => {
      kit.state.closetEntry = which;
      leverBNode.visible = which === 'first';
      leverBNode.update();
      leverBit.enabled = which === 'first';
      leverBit.used = false;
      kit.msg(which === 'first'
        ? 'The closet. It has a lever in it today.'
        : 'The SAME closet. No lever in it today. Note the difference.', 4.5);
    };
    kit.door({
      id: 'closet1', pos: [3.0, 0, 8.7], facing: 'n',
      label: 'THE FIRST CLOSET',
      afterOpen: () => {
        kit.fadeTeleport([40, 1.62, 0.8], Math.PI, { alsoResetDoors: true });
        setTimeout(() => enterCloset('first'), 500);
      },
    });
    kit.door({
      id: 'closet2', pos: [6.0, 0, 8.7], facing: 'n',
      label: 'THE SECOND CLOSET',
      afterOpen: () => {
        kit.fadeTeleport([40, 1.62, 0.8], Math.PI, { alsoResetDoors: true });
        setTimeout(() => enterCloset('second'), 500);
      },
    });

    // the closet (one physical room, two histories)
    kit.room(40, 1.6, 0, 3.2, 3.2, 3.2, { wallMat: 'wallOff', floorMat: 'floorPale', ceilMat: 'ceilPale' });
    kit.lamp([40, 3.1, 0], [0.9, 0.88, 0.8], 0.8);
    const leverBNode = kit.dynBox([0.5, 0.6, 0.2], 'metal', { color: [0.5, 0.5, 0.53] });
    V.set(leverBNode.pos, 41.1, 1.5, -1.4);
    leverBNode.update();
    const leverBit = kit.interact([41.1, 1.5, -1.1], [1.0, 1.4, 1.0], 'Pull the closet lever', () => {
      if (flags.b) return;
      leverBNode.visible = false; leverBNode.update();
      kit.game.audio.switchSnd();
      satisfy('b', lamps.b);
      kit.msg('The first closet yields. One of three.', 3.5);
    }, { id: 'leverB' });
    leverBNode.visible = false; // default (second visit) until door A sets it
    leverBNode.update();
    kit.tape('t9', [39.0, 0, -1.1], 'T-09', [
      'Recording 9. Same room, twice, different furniture each time.',
      'The building is not inconsistent. It is generous with variants.',
      'Rule of thumb: try the other door. Then the other other door.',
    ]);
    kit.door({
      id: 'closet_exit', pos: [40, 0, 1.5], facing: 's',
      label: 'Back to the hall',
      afterOpen: () => kit.fadeTeleport([4.5, 1.62, 6.4], Math.PI, { alsoResetDoors: true }),
    });

    /* ---------- Lock C: recursion ---------- */
    // diorama of this hall on a table (east wing)
    kit.box([8.5, 0.5, 0], [2.2, 1.0, 2.2], 'woodDark');
    const sc = 0.055;
    const hwD = D * sc, hhD = H * sc, hwW = W * sc;
    kit.batcher.addBox([8.5, 1.02 + hhD / 2, 0 - hwW / 2 + hwD / 2], [hwW, hhD, 0.012], kit.mat('wallGrey', {}));
    kit.batcher.addBox([8.5 - hwW / 2 + hwD / 2, 1.02 + hhD / 2, 0], [hwD, hhD, hwW + 0], kit.mat('wallGrey', {}));
    kit.batcher.addBox([8.5 - hwW / 2 + hwD / 2, 1.02, 0], [hwD, 0.012, hwW], kit.mat('floorGrey', {}));
    kit.interact([8.5, 1.1, 0], [1.6, 1.4, 1.6], 'Enter the model hall', () => {
      kit.fadeTeleport([60, 1.62, 2.2], Math.PI, { alsoResetDoors: false });
    }, { id: 'enter_model_hall' });

    // replica (real) room with the true lever
    kit.room(60, 2.0, 0, 4.0, 4.0, 4.0, { wallMat: 'wallGrey', floorMat: 'floorGrey', ceilMat: 'ceilPale' });
    kit.lamp([60, 3.9, 0], [0.9, 0.88, 0.8], 0.9);
    kit.plaque([60, 2.4, -1.9], 's', ['THE MODEL HALL, AT YOUR SCALE.', 'IT KEPT A LEVER FOR YOU.'], { w: 2.2, h: 0.85 });
    kit.interact([58.8, 1.7, -1.85], [1.1, 1.5, 1.1], 'Pull the replica lever', () => {
      if (flags.c) return;
      kit.game.audio.switchSnd();
      satisfy('c', lamps.c);
      kit.msg('The model hall nods. One of three.', 3.5);
    }, { id: 'leverC' });
    kit.door({
      id: 'replica_exit', pos: [60, 0, 1.9], facing: 's',
      label: 'Back to the real hall',
      afterOpen: () => kit.fadeTeleport([8.5, 1.62, 2.2], 0, { alsoResetDoors: true }),
    });

    /* ---------- the main gate ---------- */
    const mainGate = kit.door({
      id: 'main_gate', pos: [0, 0, -8.7], facing: 's',
      locked: true,
      label: 'THE IMPOSSIBLE ROOM DOOR', lockLabel: 'The far door. Three locks. Three rooms taught you each.',
      hint: 'three locks hold it',
      panelMat: 'char', color: [0.13, 0.13, 0.14], width: 1.5, height: 2.6,
      afterOpen: () => kit.complete(),
    });

    setTimeout(() => kit.msg('Three locks. TURN, VARIANT, SCALE — the building has taught all three.', 5.5), 800);
  },
};
