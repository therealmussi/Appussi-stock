/* LEVEL 08 — THE IMPOSSIBLE ROOM
   A sealed study cube, a gallery of void, one gravity crossing, and a room
   you realise you already know by heart. */

import { V } from '../engine/math3.js';
import { PAL } from '../kit.js';
import { AABB } from '../physics.js';

export default {
  title: 'ROOM 08 — THE IMPOSSIBLE ROOM',
  subtitle: 'six surfaces. one is listening.',
  spawn: { pos: [0, 1.62, 2.4], yaw: 0.0 },
  mood: { root: 29, mood: 'blue', airAmt: 0.5 },
  env: {
    background: [0.03, 0.035, 0.045],
    fogColor: [0.03, 0.035, 0.045],
    fogDensity: 0.026,
    ambient: [0.24, 0.235, 0.24],
    sunDir: V.norm(V.make(), V.make(0.1, -1.0, 0)),
    sunColor: [0.16, 0.17, 0.2],
  },
  build(kit) {
    /* ================= the sealed cube ================= */
    kit.room(0, 4, 0, 8, 8, 8, {
      wallMat: 'wallOff', floorMat: 'floorPale', ceilMat: 'ceilPale', noTrim: true,
      walls: { e: { mat: 'wallOff', hole: { u0: -1.5, u1: 1.5, v0: 0, v1: 2.6 } } },
    });
    kit.lamp([0, 7.7, 0], [0.95, 0.9, 0.8], 0.9);

    // hint, painted where a person waking up would see it last
    kit.text([0, 1.75, 3.85], 'n', ['KNOCK. LISTEN', 'FOR THE LATE ANSWER.'], { px: 50 });

    // the east wall is a sliding panel, recessed 2cm so it reads as a seam
    const panel = kit.dynBox([0.2, 2.6, 3.0], 'wallOff', { color: PAL.wallOff });
    V.set(panel.pos, 3.95, 1.3, 0);
    panel.update();
    const panelCol = new AABB(3.95, 1.3, 0, 0.1, 1.3, 1.5);
    kit.colliders.push(panelCol);

    const solidKnock = (pos, w) =>
      kit.interact(pos, [w, 1.7, w], 'Knock', () => {
        kit.game.audio.latch();
        kit.msg('Solid. A steady, boring sound.', 2.8);
      }, { once: false });
    solidKnock([0, 1.3, -3.85], 2.4);
    solidKnock([-3.85, 1.3, 0], 2.4);
    solidKnock([0, 1.3, 3.85], 2.4);
    kit.interact([0, 0.3, -2.2], [2.2, 0.6, 2.2], 'Knock: floor', () => {
      kit.game.audio.latch();
      kit.msg('Solid. It has never once moved.', 2.8);
    }, { once: false });

    let opened = false;
    const eastIt = kit.interact([3.9, 1.3, 0], [0.5, 1.7, 2.2], 'Knock: east wall', () => {
      if (opened) return;
      if (!kit.state.examined) {
        kit.state.examined = true;
        kit.game.audio.latch();
        setTimeout(() => {
          kit.game.msg('...the answer comes back late. Far too late. Hollow.', 4.5);
        }, 500);
        eastIt.label = 'Push the east wall';
        return;
      }
      opened = true;
      eastIt.enabled = false;
      kit.game.audio.switchSnd();
      kit.msg('The wall accepts the push. It was never load-bearing. It was a lid.', 5);
      let t = 0;
      kit.updaters.push(function slide(dt) {
        t += dt;
        panel.pos[1] = Math.min(4.3, panel.pos[1] + dt * 1.9);
        panel.update();
        if (panel.pos[1] >= 3.2) panelCol.disabled = true;
        if (panel.pos[1] >= 4.3) {
          const i = kit.updaters.indexOf(slide);
          if (i >= 0) kit.updaters.splice(i, 1);
        }
      });
    }, { id: 'wall_east' });

    /* ================= the gallery of void ================= */
    const ZC = 0;
    // west wall of the gallery shares the cube's opening
    kit.wallHole('x', 4.39, -13, 13, -10, 14, { u0: -1.5, u1: 1.5, v0: 0, v1: 2.6 }, 'char', {});
    kit.slab('z', -13.13, 4.26, 46.4, -10, 14, 'char', {});
    kit.slab('z', 13.13, 4.26, 46.4, -10, 14, 'char', {});
    kit.slab('x', 46.53, -13, 13, -10, 14, 'char', {});
    kit.box([25.4, 14.15, 0], [52.4, 0.3, 27.3], 'ceilDark', {});
    kit.box([25.4, -10.15, 0], [52.4, 0.3, 27.3], 'voidDeep', {});

    // the cube seen from outside: a monolith in a dark gallery
    kit.box([0, 8.4, 0], [8.6, 0.3, 8.6], 'wallOff', {});
    kit.box([0, 4, 4.3], [8.6, 8.6, 0.3], 'wallOff', {});
    kit.box([0, 4, -4.3], [8.6, 8.6, 0.3], 'wallOff', {});
    kit.box([-4.3, 4, 0], [0.3, 8.6, 8.6], 'wallOff', {});

    // a second, purposeless monolith hangs in the drop (do not ask it questions)
    kit.box([25.4, -5.5, 6.5], [7, 7, 7], 'black', {});

    // lamps: cold blue, kept minimal
    kit.lamp([10, 2.2, -6], [0.3, 0.5, 0.78], 0.7);
    kit.lamp([36, 2.2, -6], [0.3, 0.5, 0.78], 0.7);
    kit.lamp([24, 9.5, 7], [0.3, 0.5, 0.78], 0.6);

    kit.text([46.3, 7.5, 0], 'w', ['THE ROOM IS LOOKING BACK.'], {
      px: 130, fg: 'rgba(210,206,196,0.5)', w: 16, h: 2.4,
    });

    /* ---------- walkways & the gravity crossing ---------- */
    // west catwalk from the cube's opening, z-railed both sides
    kit.box([14, -0.08, 0], [20, 0.16, 3], 'metal', {});
    kit.box([14, 0.15, 1.62], [20, 0.4, 0.12], 'char', {});
    kit.box([14, 0.15, -1.62], [20, 0.4, 0.12], 'char', {});

    // ceiling catwalk over the gap (its underside is the path)
    kit.box([27, 12.85, 0], [14, 0.3, 5], 'metal', {});
    kit.box([27, 12.4, 2.5], [14, 0.3, 0.12], 'red', {});
    kit.box([27, 12.4, -2.5], [14, 0.3, 0.12], 'red', {});

    // far walkway + platform
    kit.box([37, -0.08, 0], [14, 0.16, 3], 'metal', {});
    kit.box([42.5, -0.08, 0], [5, 0.16, 7], 'metal', {});

    kit.tape('t10', [8, 0.02, 1.1], 'T-10', [
      'Recording 10. Last one I left in working order.',
      'The gallery is not storage. It is the actual interior.',
      'Every room you walked was an instrument being tuned. You were the note.',
    ]);

    kit.plaque([19.5, 1.4, -1.4], 's', ['THE GAP IS NOT A GAP.'], { w: 2.2, h: 0.6 });
    kit.gravityPad([22, 0.04, 0], [0, 1, 0], {
      id: 'pad_gal_up', label: 'Invert gravity',
      msg: 'Up is a direction you can spend. Walk the underside.',
    });
    kit.gravityPad([33, 12.67, 0], [0, -1, 0], {
      id: 'pad_gal_down', label: 'Restore gravity', w: 1.2,
      msg: 'Down, without ceremony.',
    });

    // recoveries — the gallery must never keep anyone
    let recBusy = false;
    const recover = (toPos, toYaw, tell) => {
      if (recBusy) return;
      recBusy = true;
      kit.game.setGravity([0, -1, 0]);
      kit.game.fadeTeleport(toPos, toYaw, { alsoResetDoors: false });
      kit.game.msg(tell, 4);
      setTimeout(() => { recBusy = false; }, 1500);
    };
    kit.trigger([25, -9.2, 0], [42, 1.4, 24], () =>
      recover([14, 1.62, 0], 0, 'The gallery declines to keep you.'), { once: false, id: 'rec_floor' });
    kit.trigger([25, 14.6, 0], [42, 1.0, 24], () => {
      const gp = kit.game.player;
      if (!gp.grounded || kit.game.gravity[1] <= 0) return;
      recover([14, 1.62, 0], 0, 'You drifted too far from the underside. Again, then.');
    }, { once: false, id: 'rec_ceiling' });

    /* ---------- the freestanding door ---------- */
    kit.door({
      id: 'frame1', pos: [44.8, 0, 0], facing: 'e',
      label: 'A DOOR. NO WALL AROUND IT.',
      hint: 'it opens onto something, anyway',
      width: 1.2, height: 2.4,
      afterOpen: () => {
        kit.game.fadeTeleport([72, 1.62, 3.9], 0, { alsoResetDoors: true });
        setTimeout(() => kit.msg('This room is exactly nine by eleven. You measured nothing, yet you know.', 5), 1400);
      },
    });

    /* ================= the room you already know ================= */
    kit.room(72, 1.6, 0, 9, 3.2, 11, {
      wallMat: 'wallOff', floorMat: 'floorWarm', ceilMat: 'ceilPale',
    });
    kit.bed([74.6, 0, -2.2], 0);
    kit.desk([74.8, 0, 2.2], Math.PI / 2);
    kit.chair([73.4, 0, 1.6], Math.PI);
    kit.lamp([72, 3.05, 0], [0.95, 0.9, 0.78], 0.9);
    kit.painting([67.63, 1.9, -1.5], 'e', 'spiral');
    kit.text([67.63, 2.1, 1.8], 'e', ['YOU MEASURED NOTHING.', 'YET YOU KNOW THESE DIMENSIONS.'], { px: 46 });
    kit.tape('t2', [74.7, 0.8, 2.0], '02', [
      'Recording two. Dated first. Found last.',
      'If you are hearing this after everything: the order you walked is not the order it was built.',
      'Key in the north wall. Thank you for looking back.',
    ]);
    kit.door({
      id: 'final_door', pos: [72, 0, -5.37], facing: 's',
      label: 'The last door',
      width: 1.2, height: 2.4,
      afterOpen: () => {
        kit.msg('It was never a building. It was an observation.', 4);
        setTimeout(() => kit.complete(), 600);
      },
    });

    setTimeout(() => kit.msg('Waking, again. Six surfaces. Knock on all of them.', 5), 900);
  },
  update(dt, kit) { },
};
