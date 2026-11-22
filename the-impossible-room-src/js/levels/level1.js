/* LEVEL 01 — THE BEGINNING
   An ordinary room. The exit is not where it should be. */

import { V, Q } from '../engine/math3.js';
import { texTape } from '../engine/textures.js';
import { PAL } from '../kit.js';

export default {
  title: 'ROOM 01 — THE BEGINNING',
  subtitle: 'an apparently ordinary room',
  spawn: { pos: [2.4, 1.62, 3.2], yaw: 2.5 },
  mood: { root: 49, mood: 'grey', airAmt: 0.4 },
  env: {
    background: [0.075, 0.073, 0.07],
    fogColor: [0.075, 0.073, 0.07],
    fogDensity: 0.022,
    ambient: [0.42, 0.4, 0.38],
    sunDir: V.norm(V.make(), V.make(0.3, -0.9, 0.2)),
    sunColor: [0.42, 0.4, 0.36],
  },
  build(kit) {
    kit.room(0, 1.6, 0, 9, 3.2, 11, {
      wallMat: 'wallOff',
      floorMat: 'floorWarm',
      ceilMat: 'ceilPale',
    });

    // furniture
    kit.bed([3.1, 0, 1.4]);
    kit.desk([-2.9, 0, -4.2]);
    kit.chair([-2.3, 0, -3.3], 0.4);
    kit.lamp([0, 3.0, 0], [1, 0.88, 0.7], 1.0);

    // wall lettering over the bed (east wall)
    kit.text([4.34, 2.2, 1.4], 'w', ['NOT EVERY WALL', 'IS A WALL'], { px: 78, fg: 'rgba(50,45,40,0.55)' });

    // painting on the west wall
    kit.painting([-4.34, 1.9, -0.4], 'e', 'spiral');

    // wardrobe against the south wall
    const w = kit.wardrobe([2.4, 0, 4.9], 0);
    let wardrobeState = 0; // 0 = knockable, 1 = slid
    w.it.label = 'Knock on the wardrobe';
    w.it.cb = () => {
      if (wardrobeState === 0) {
        wardrobeState = 0.5;
        kit.game.audio.latch();
        kit.msg('…hollow. The wood swings aside when pulled, not pushed.', 4.2);
        w.it.label = 'Slide the wardrobe aside';
      } else if (wardrobeState === 0.5) {
        wardrobeState = 1;
        kit.game.audio.door(true);
        const startX = w.node.pos[0];
        kit.updaters.push(function slide(dt) {
          w.node.pos[0] += dt * 1.1;
          if (w.node.pos[0] > startX + 1.5) {
            w.node.pos[0] = startX + 1.5;
            w.collider.disabled = true;
            w.it.enabled = false;
            kit.msg('Behind it: a door. Your knees remember falling asleep.', 4.5);
            const idx = kit.updaters.indexOf(slide);
            if (idx >= 0) kit.updaters.splice(idx, 1);
          }
          w.node.update();
        });
      }
    };

    // knocks on solid walls (flavor)
    const knock = (pos, msg) => {
      kit.interact(pos, [1.6, 2.4, 1.2], 'Knock on the wall', () => {
        kit.game.audio.latch();
        kit.msg(msg);
      });
    };
    knock([-4.2, 1.4, 3.4], 'Solid.');
    knock([-3.6, 1.4, -5.2], 'Solid. A steady, boring sound.');
    knock([4.2, 1.4, -2.2], 'Solid.');

    // desk note
    kit.interact([-2.9, 0.9, -4.2], [1.0, 1.0, 0.8], 'Read the note', () => {
      kit.msg('“They told me a room is measured from the inside.” — the rest is burnt off.', 5);
      setTimeout(() => kit.msg('Knock on things. The building answers some knocks.', 4.5), 5200);
    });

    // fake locked exit on the north wall
    kit.door({
      id: 'fake_exit', pos: [0, 0, -5.3], facing: 's',
      locked: true,
      label: 'EXIT', lockLabel: 'Try the exit door',
      hint: 'painted on a flat wall',
      onLocked: () => kit.msg('It is painted. A flat joke in an otherwise serious room.', 4),
    });

    // hidden real door behind the wardrobe (south wall)
    kit.door({
      id: 'hidden_exit', pos: [2.4, 0, 5.32], facing: 'n',
      label: 'A door where a wall was', label2: null,
      openLabel: 'Step through',
      afterOpen: () => kit.complete(),
    });

    // recording 1
    kit.tape('t1', [-1.8, 0, 2.2], 'T-01', [
      'Recording 1, surveyor’s notes. Subject wakes in a furnished room.',
      'Standard bed, standard desk. No exit… correction: the exit is a rumor.',
      'Begin measurement of the walls. Log the knocks.',
    ]);

    // welcome
    kit.game.__t1 = () => kit.msg('You wake on cold floor. The lamp was already on.', 4);
    setTimeout(() => kit.msg('You wake on cold floor. The lamp was already on.', 4.2), 600);
    setTimeout(() => kit.msg('W · A · S · D to move. · E to touch things. The room permits it.', 5), 5400);
  },
};
