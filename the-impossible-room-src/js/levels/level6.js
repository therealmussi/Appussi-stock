/* LEVEL 06 — THE LOOP
   The same corridor, again. Something is different. Count. */

import { V, Q } from '../engine/math3.js';
import { texTape } from '../engine/textures.js';
import { texText } from '../engine/textures.js';
import { PAL } from '../kit.js';
import { AABB } from '../physics.js';

const PAINT_ORDER = ['sun', 'moon', 'eye', 'door', 'spiral'];

export default {
  title: 'ROOM 06 — THE LOOP',
  subtitle: 'the same corridor, again',
  spawn: { pos: [0, 1.62, 14.2], yaw: 0.0 },
  mood: { root: 33, mood: 'grey', airAmt: 0.25 },
  env: {
    background: [0.05, 0.05, 0.052],
    fogColor: [0.05, 0.05, 0.052],
    fogDensity: 0.03,
    ambient: [0.3, 0.295, 0.29],
    sunDir: V.norm(V.make(), V.make(0.1, -1, 0)),
    sunColor: [0.3, 0.29, 0.27],
  },
  build(kit) {
    const W = 3.4, H = 3.4, Z0 = -16, Z1 = 16;

    // the corridor shell (one long gallery)
    kit.slab('x', -W / 2 - 0.26, Z0, Z1, 0, H, 'wallBeige', {});
    kit.slab('x', W / 2 + 0.26, Z0, Z1, 0, H, 'wallBeige', {});
    kit.box([0, -0.13, 0], [W + 0.52, 0.26, Z1 - Z0], 'floorGrey', {});
    kit.box([0, H + 0.13, 0], [W + 0.52, 0.26, Z1 - Z0], 'ceilDark', {});
    kit.box([0, -0.26, 0], [W, 0.01, Z1 - Z0], 'char', { collide: false }); // subtle dark runner

    // lamps
    for (let i = 0; i < 5; i++) {
      kit.lamp([0, 3.28, 12 - i * 7], i % 2 ? [0.85, 0.8, 0.7] : [0.9, 0.88, 0.78], 0.8);
    }

    // paintings (east wall) — these change between loops
    const paintings = [];
    for (let i = 0; i < 3; i++) {
      const node = kit.paintingDyn([W / 2 - 0.02, 1.8, 8 - i * 8], 'w', 1.0, 1.25);
      paintings.push(node);
    }
    const setPass = (n) => {
      for (let i = 0; i < 3; i++) {
        kit.setPainting(paintings[i], PAINT_ORDER[(n + i) % PAINT_ORDER.length]);
      }
    };

    // door at the far end: opens, sends you back to the start (the loop)
    const loopDoor = kit.door({
      id: 'loop_door', pos: [0, 0, Z0 + 0.14], facing: 's',
      label: 'ONWARD', openLabel: null,
      afterOpen: () => {
        kit.state.passes = (kit.state.passes || 0) + 1;
        const n = kit.state.passes;
        setPass(n);
        kit.fadeTeleport([0, 1.62, 14.2], 0, { alsoResetDoors: true });
        if (n === 1) {
          kit.msg('The same corridor. Absolutely the same. Except the sun.', 5);
          tapeIt.enabled = true;
        } else if (n === 2) {
          tapeIt2.enabled = true;
          kit.msg('Again. The moon now. The corridor is counting WITH you.', 5);
        } else {
          kit.msg('Again. An eye this time. It has finished counting.', 5);
          revealExit();
        }
        counter.setMat(counterMat('PASS ' + (n + 1) + ' OF 3'));
      },
    });

    // counter quad near spawn
    const counter = kit.dynQuad(2.2, 0.6, 'cnt', { unlit: true, color: [1, 1, 1] });
    V.set(counter.pos, 0, 2.2, 15.8);
    Q.fromTo(counter.quat, [0, 0, 1], [0, 0, -1]);
    counter.update();
    function counterMat(text) {
      const t = kit.renderer.makeTexture(texText([text], { px: 90, fg: 'rgba(230,224,214,0.95)' }));
      return kit.mat('cnt', { tex: t, unlit: true, twoSided: true, color: [1, 1, 1] });
    }
    counter.setMat(counterMat('PASS 1 OF 3'));

    // wall plaque with the lesson
    kit.plaque([-(W / 2 + 0.14), 1.8, 6], 'e', ['THE WAY OUT IS THROUGH —', 'AND THE THROUGH IS WAY IN.', 'WALK IT UNTIL IT CHANGES ITS MIND.'], { w: 2.6, h: 1.2 });

    // tapes that only exist on later passes
    const tapeIt = kit.tape('t8a', [0.9, 0.2, 2.0], 'T-08A', [
      'Recording 8a. The corridor has a pulse. One loop, one beat.',
      'I drew arrows. The arrows arrived before I did.',
    ]);
    tapeIt.enabled = false;
    const tapeIt2 = kit.tape('t8b', [0.9, 0.2, -6.0], 'T-08B', [
      'Recording 8b. The corridor pre-echoes my footsteps now.',
      '(tape damaged) — it said: COUNT WHAT IS COUNTING YOU.',
    ]);
    tapeIt2.enabled = false;

    // sealed exit — revealed after pass 3
    const seal = kit.dynBox([W - 0.8, 2.6, 0.3], 'wallBeige', { color: PAL.wallBeige });
    V.set(seal.pos, 0, 1.3, Z0 + 0.42);
    seal.update();
    const sealCol = new AABB(0, 1.3, Z0 + 0.42, (W - 0.8) / 2, 1.3, 0.15);
    kit.colliders.push(sealCol);

    function revealExit() {
      kit.game.audio.solved();
      kit.updaters.push(function reveal(dt) {
        seal.pos[1] -= dt * 1.5;
        seal.update();
        if (seal.pos[1] < -1.0) {
          seal.visible = false;
          seal.update();
          sealCol.disabled = true;
          exitDoor.locked = false;
          exitDoor.it.label = 'THE STAIRS DOWN — finally a direction with an end';
          const i = kit.updaters.indexOf(reveal);
          if (i >= 0) kit.updaters.splice(i, 1);
        }
      });
      kit.msg('The end wall dissolves. Stairs. Actual stairs.', 4.5);
    }

    const exitDoor = kit.door({
      id: 'loop_exit', pos: [0, 0, Z0 + 0.42], facing: 's',
      locked: true,
      label: 'A door where a wall was', lockLabel: 'The end wall is stubborn. Keep walking the loop.',
      hint: 'it has not finished counting',
      afterOpen: () => kit.complete(),
    });

    // pit guards: outside walls are solid; no pits here.

    setTimeout(() => kit.msg('A straight corridor. A door at the end. Nothing about this is a trick yet.', 5), 800);
  },
};
