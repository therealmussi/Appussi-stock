/* LEVEL 02 — THE WRONG DOOR
   Four doors. One vestibule. The room you enter is never the room you left. */

import { V, Q } from '../engine/math3.js';
import { PAL } from '../kit.js';

const COLORS = {
  red: PAL.redGlow, blue: PAL.blueGlow, amber: PAL.amber,
};
// door color -> orb you find in the shared vestibule
const ORB_BY_DOOR = { door_red: 'amber', door_blue: 'red', door_amber: 'blue' };
// door you come back out of (the room reconnects rotated)
const EXIT_BY_DOOR = { door_red: 'door_amber', door_amber: 'door_blue', door_blue: 'door_red' };

const DOOR_POS = {
  door_red: [-3.6, 0, 5.32],   // south wall, west side
  door_amber: [3.6, 0, 5.32],  // south wall, east side
  door_blue: [5.32, 0, -1.5],  // east wall
};

export default {
  title: 'ROOM 02 — THE WRONG DOOR',
  subtitle: 'the connections do not hold',
  spawn: { pos: [0, 1.62, 2.8], yaw: 0.15 },
  mood: { root: 46, mood: 'grey', airAmt: 0.5 },
  env: {
    background: [0.06, 0.06, 0.065],
    fogColor: [0.06, 0.06, 0.065],
    fogDensity: 0.03,
    ambient: [0.36, 0.355, 0.34],
    sunDir: V.norm(V.make(), V.make(0.2, -0.9, 0.1)),
    sunColor: [0.36, 0.34, 0.31],
  },
  build(kit) {
    kit.room(0, 1.8, 0, 11, 3.6, 11, {
      wallMat: 'wallGrey', floorMat: 'floorGrey', ceilMat: 'ceilDark',
    });
    kit.lamp([0, 3.5, 0], [0.95, 0.9, 0.8], 0.9);

    // central compass plaque
    kit.plaque([0, 1.7, -5.2], 's', ['THE SAME ROOM', 'DOES NOT KEEP ITS SECRETS', ' '], { w: 2.6, h: 1.1 });

    let collected = { red: false, blue: false, amber: false };
    let entryDoor = null;

    // ---- three impossible doors ----
    const entered = (id) => {
      entryDoor = id;
      const orbCol = ORB_BY_DOOR[id];
      // show only this visit's orb
      for (const c of ['red', 'blue', 'amber']) {
        const o = kit.state.orbs[c];
        const show = c === orbCol;
        o.node.visible = show;
        o.node.update();
        o.it.enabled = show;
        o.it.used = false;
      }
      kit.msg('The same room again — arranged for ' + orbCol.toUpperCase() + ' this time.', 4.5);
    };

    const mkImpossible = (id) => kit.door({
      id,
      pos: DOOR_POS[id], facing: DOOR_POS[id][2] > 0 ? 'n' : (DOOR_POS[id][0] > 0 ? 'w' : 's'),
      label: 'A door marked ' + id.split('_')[1].toUpperCase(),
      afterOpen: () => {
        if (kit.state.inVestibule) return; // vestibule has its own doors
        kit.fadeTeleport([60, 1.62, 1.4], Math.PI, { alsoResetDoors: true });
        setTimeout(() => entered(id), 500);
      },
    });
    const dRed = mkImpossible('door_red');
    const dBlue = mkImpossible('door_blue');
    const dAmber = mkImpossible('door_amber');

    // ---- vestibule (one room, many arrivals) ----
    kit.room(60, 1.7, 0, 5, 3.4, 5, { wallMat: 'wallOff', floorMat: 'floorPale', ceilMat: 'ceilPale' });
    kit.lamp([60, 3.3, 0], [0.95, 0.9, 0.8], 0.8);
    kit.plaque([60, 1.7, -2.2], 's', ['WHAT YOU CARRY INSIDE,', 'CARRY OUT.'], { w: 2.0, h: 0.9 });
    kit.tape('t3', [61.6, 0, -1.4], 'T-03', [
      'Recording 3. The vestibule repeats. Same dust, different inventory.',
      'Whatever I leave inside changes what I find the next time.',
      'Or the room is lying. Both readings fit the tape.',
    ]);
    kit.state.inVestibule = false;

    const orbs = {};
    for (const c of ['red', 'blue', 'amber']) {
      const node = kit.dynCyl(0.17, 0.34, c + 'Glow', { color: PAL[c + 'Glow'], unlit: true, emissive: 0.5 });
      node.visible = false;
      node.update();
      const it = kit.interact([60, 1.5, 0], [0.9, 1.4, 0.9], 'Take the ' + c + ' orb', () => {
        it.enabled = false;
        node.visible = false;
        node.update();
        kit.game.inventory.add(c);
        kit.game.audio.pickup();
        kit.game.msg('You carry the ' + c + ' orb. (Return through the far door.)', 4);
      }, { id: 'orb_' + c });
      orbs[c] = { node, it, visible: false };
    }
    kit.state.orbs = orbs;
    kit.state.orbParentPos = kit.pedestal([60, 0, 0], 1.0);

    // vestibule exit — deposits you at a different lobby door than you entered
    kit.door({
      id: 'vest_exit', pos: [58.4, 0, -0.4], facing: 'e',
      label: 'The way back (allegedly)',
      afterOpen: () => {
        const target = EXIT_BY_DOOR[entryDoor || 'door_red'];
        const p = DOOR_POS[target];
        const yaw = target === 'door_blue' ? -Math.PI / 2 : Math.PI;
        kit.fadeTeleport([p[0] - 1.2, 1.62, p[2] - 1.2], yaw, { alsoResetDoors: true });
        kit.state.inVestibule = false;
        kit.msg('You emerge from a door you did not enter.', 4);
      },
    });

    // lobby plinths for the orbs
    const plinth = (key, pos) => {
      const top = kit.pedestal(pos, 0.9, 'ceilPale');
      const slab = kit.dynBox([0.42, 0.05, 0.42], 'metal', { color: PAL[key] });
      V.set(slab.pos, pos[0], pos[1] + 0.93, pos[2]);
      slab.update();
      const it = kit.interact([pos[0], pos[1] + 1.0, pos[2]], [1.0, 1.4, 1.0],
        'Place an orb', () => {
          if (collected[key]) { kit.msg('The ' + key + ' plinth remembers being fed.'); return; }
          if (kit.game.inventory.has(key)) {
            collected[key] = true;
            kit.game.inventory.delete(key);
            slab.setMat(kit.mat('glow', { color: COLORS[key], unlit: true, emissive: 0.8 }));
            kit.game.audio.chime();
            kit.msg('The ' + key + ' orb settles with a soft, expensive click.', 3.6);
            if (collected.red && collected.blue && collected.amber) {
              setTimeout(() => {
                kit.game.audio.solved();
                kit.msg('All three plinths exhale. The dark door unlocks.', 4.5);
                exitGate.unlock();
              }, 700);
            }
          } else {
            kit.msg('This plinth wants the ' + key.toUpperCase() + ' orb. You are not carrying it.', 3.6);
            kit.game.audio.denied();
          }
        }, { id: 'plinth_' + key });
      return it;
    };
    plinth('red', [-2.6, 0, -2.6]);
    plinth('blue', [2.6, 0, -2.6]);
    plinth('amber', [0, 0, 2.2]);

    // exit gate (north)
    const exitGate = kit.door({
      id: 'exit_gate', pos: [0, 0, -5.32], facing: 's',
      locked: true,
      label: 'THE DOOR OF DOORS', lockLabel: 'The dark door — sealed. Three unlit plinths.',
      hint: 'three plinths still empty',
      panelMat: 'char', color: [0.12, 0.12, 0.13],
      afterOpen: () => kit.complete(),
    });

    setTimeout(() => kit.msg('Three doors. All of them say the same thing: THROUGH.', 4.5), 800);
    setTimeout(() => kit.msg('Notice which door you use to leave. The vestibule keeps score.', 5), 5600);
  },
};
