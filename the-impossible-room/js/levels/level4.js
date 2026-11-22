/* LEVEL 04 — THE SMALLER WORLD
   A model of the room, containing the room, containing the answer. */

import { V, Q } from '../engine/math3.js';
import { texTape } from '../engine/textures.js';
import { PAL } from '../kit.js';
import { AABB } from '../physics.js';

/* Builds one copy of the "study room" at arbitrary scale/offset.
   Returns refs needed for puzzle wiring. */
function buildRoom(kit, cx, scale, opts = {}) {
  const s = scale;
  const h = 3.2 * s;
  const yBase = opts.yBase ?? 0;
  const cy = yBase + h / 2;
  const w = 6.4 * s, d = 7.2 * s;
  kit.room(cx, cy, 0, w, h, d, {
    wallMat: 'wallOff', floorMat: 'floorWarm', ceilMat: opts.ceil !== false ? 'ceilPale' : null,
  });
  const refs = { s, cx, cy, yBase, w, d, h };

  // desk against north wall
  kit.batcher.addBox([cx - 1.8 * s, yBase + 0.39 * s, -2.5 * s], [1.6 * s, 0.78 * s, 0.8 * s], kit.mat('wood', {}));
  // plinth at center with crystal cap
  const ph = 1.0 * s;
  kit.box([cx + 0.9 * s, yBase + ph / 2, 0.6 * s], [0.4 * s, ph, 0.4 * s], 'ceilPale', { collide: s >= 1 });
  const crystal = kit.dynBox([0.3 * s, 0.44 * s, 0.3 * s], 'red', { color: PAL.redGlow, emissive: 0.75, unlit: true });
  V.set(crystal.pos, cx + 0.9 * s, yBase + ph + 0.3 * s, 0.6 * s);
  crystal.update();
  refs.crystalNode = crystal;
  refs.plinthPos = [cx + 0.9 * s, yBase, 0.6 * s];

  // wall text
  kit.text([cx - 3.2 * s + 0.14, yBase + 1.9 * s, 0.6 * s], 'e', opts.lines || ['STUDY, SURVEYED'], { px: opts.tpx || 60 });
  return refs;
}

export default {
  title: 'ROOM 04 — THE SMALLER WORLD',
  subtitle: 'the model is complete except for one piece',
  spawn: { pos: [-4.6, 1.62, 4.6], yaw: 2.5 },
  mood: { root: 39, mood: 'grey', airAmt: 0.45 },
  env: {
    background: [0.07, 0.068, 0.066],
    fogColor: [0.07, 0.068, 0.066],
    fogDensity: 0.026,
    ambient: [0.38, 0.37, 0.36],
    sunDir: V.norm(V.make(), V.make(0.25, -0.9, 0.15)),
    sunColor: [0.4, 0.38, 0.34],
  },
  build(kit) {
    const GALLERY = { w: 14, h: 4.4, d: 14 };
    kit.room(0, GALLERY.h / 2, 0, GALLERY.w, GALLERY.h, GALLERY.d, {
      wallMat: 'wallGrey', floorMat: 'floorGrey', ceilMat: 'ceilDark',
    });
    kit.lamp([0, 4.25, 0], [0.95, 0.9, 0.78], 1.0);
    kit.text([0, 3.5, -6.94], 's', ['WHAT IS SMALL IS ONLY FAR', 'FROM YOUR HANDS.'], { px: 64 });

    // diorama table (non-model gallery display)
    kit.box([0, 0.5, 0], [2.6, 1.0, 2.6], 'woodDark');
    kit.box([0, 1.02, 0], [2.8, 0.05, 2.8], 'char', { collide: false });

    // 1:8 model of the study room on the table
    const modelScale = 0.125;
    // (walls only; sitting on the table at y=1.04)
    const mk = 0.125, mw = 6.4 * mk, md = 7.2 * mk, mh = 3.2 * mk;
    const ty = 1.06;
    const wall = kit.mat('wallOff', {});
    // four thin walls + tiny plinth + tiny crystal
    kit.batcher.addBox([0, ty + mh / 2, -md / 2], [mw, mh, 0.03], wall);
    kit.batcher.addBox([0, ty + mh / 2, md / 2], [mw, mh, 0.03], wall);
    kit.batcher.addBox([-mw / 2, ty + mh / 2, 0], [0.03, mh, md], wall);
    kit.batcher.addBox([mw / 2, ty + mh / 2, 0], [0.03, mh, md], wall);
    kit.batcher.addBox([0, ty, 0], [mw, 0.02, md], kit.mat('floorWarm', {}));
    kit.batcher.addBox([0 + 0.9 * mk, ty + 0.5 * mk, 0.6 * mk], [0.4 * mk, 1.0 * mk, 0.4 * mk], kit.mat('ceilPale', {}));
    const tinyCrystal = kit.dynBox([0.3 * mk, 0.44 * mk, 0.3 * mk], 'red', { color: PAL.redGlow, unlit: true, emissive: 0.9 });
    V.set(tinyCrystal.pos, 0.9 * mk, ty + 1.0 * mk + 0.22 * mk, 0.6 * mk);
    tinyCrystal.update();

    // the tiny door in the model's south wall (0.16m tall)
    const tinyIt = kit.interact([0, ty + mh / 2 - 0.3, md / 2 + 0.3], [1.6, 1.4, 1.0],
      'Enter the model room', () => {
        if (!kit.state.inMini) {
          kit.fadeTeleport([ROOM1.cx - 1.2, 1.62, 2.0], Math.PI, { alsoResetDoors: false });
          kit.state.inMini = true;
        }
      }, { id: 'enter_model' });

    const ROOM1 = { cx: 60 };
    const studying = buildRoom(kit, ROOM1.cx, 1.0, {
      lines: ['STUDY, SURVEY I', 'SCALE 1:1', 'OF A MODEL AT 1:8'],
      tpx: 74,
    });

    // crystal in full-size room: pickable
    const crystalIt = kit.interact(studying.plinthPos.map((p, i) => (i === 1 ? p + 0.8 : p)), [1.2, 2.0, 1.2],
      'Take the red crystal', () => {
        crystalIt.enabled = false;
        studying.crystalNode.visible = false;
        studying.crystalNode.update();
        kit.game.inventory.add('crystal');
        kit.game.audio.pickup();
        kit.msg('The right size at last. In at least one of you.', 4);
      }, { id: 'take_crystal' });

    // inside the full-size study, its own model + deeper recursion
    kit.box([ROOM1.cx + 2.2, 0.5, 2.2], [1.3, 1.0, 1.3], 'woodDark');
    kit.batcher.addBox([ROOM1.cx + 2.2, 1.02, 2.2], [1.35, 0.03, 1.35], kit.mat('char', {}));
    const mk2 = 0.05;
    const bw = 6.4 * mk2, bd = 7.2 * mk2, bh = 3.2 * mk2;
    kit.batcher.addBox([ROOM1.cx + 2.2, 1.02 + bh / 2, 2.2 - bd / 2], [bw, bh, 0.015], kit.mat('wallOff', {}));
    kit.batcher.addBox([ROOM1.cx + 2.2, 1.02 + bh / 2, 2.2 + bd / 2], [bw, bh, 0.015], kit.mat('wallOff', {}));
    kit.batcher.addBox([ROOM1.cx + 2.2 - bw / 2, 1.02 + bh / 2, 2.2], [0.015, bh, bd], kit.mat('wallOff', {}));
    kit.batcher.addBox([ROOM1.cx + 2.2 + bw / 2, 1.02 + bh / 2, 2.2], [0.015, bh, bd], kit.mat('wallOff', {}));
    kit.interact([ROOM1.cx + 2.2, 1.1, 2.2 + bd / 2 + 0.3], [1.0, 1.2, 0.8],
      'Enter the smaller world', () => {
        kit.fadeTeleport([ROOM2.cx - 4.0, 1.62, 2.0], -Math.PI / 2, { alsoResetDoors: false });
        kit.state.inMini = true;
      }, { id: 'enter_smaller' });

    const ROOM2 = { cx: 120 };
    kit.room(ROOM2.cx, 6.0, 0, 24, 12, 24, { wallMat: 'wallBeige', floorMat: 'floorPale', ceilMat: 'ceilDark' });
    kit.lamp([ROOM2.cx, 11.7, 0], [0.85, 0.9, 1.0], 1.2);
    kit.text([ROOM2.cx, 4.6, -11.9], 's', ['IT DOES NOT END.', 'TAKE WHAT YOU NEED.', 'THE REST STAYS.'], { px: 90 });
    kit.tape('t6', [ROOM2.cx + 3.0, 0, 4.0], 'T-06', [
      'Recording 6. Found a room inside the room inside the room.',
      'Weightless survey. I left a coin on the table. It is still falling.',
      'If you hear this you are probably standing in my notes.',
    ]);

    // return door in ROOM1 to gallery
    kit.door({
      id: 'r1_exit', pos: [ROOM1.cx, 0, -3.5], facing: 's',
      label: 'Return to the gallery',
      afterOpen: () => {
        if (kit.game.inventory.has('crystal')) {
          kit.fadeTeleport([0, 1.62, 4.6], 0, { alsoResetDoors: false });
          kit.state.inMini = false;
          kit.msg('[GALLERY] The plinth by the wall is waiting.', 4);
        } else {
          kit.fadeTeleport([0, 1.62, 4.6], 0, { alsoResetDoors: false });
          kit.state.inMini = false;
          kit.msg('You return empty-handed. The model remains unfinished.', 4);
        }
      },
    });

    // gallery plinth for the crystal
    const gPlinth = kit.pedestal([-4.8, 0, -4.8], 0.95);
    const placeIt = kit.interact(gPlinth, [1.2, 1.6, 1.2], 'Set down the red crystal', () => {
      if (kit.state.placed) { kit.msg('It is already home.'); return; }
      if (kit.game.inventory.has('crystal')) {
        kit.state.placed = true;
        kit.game.inventory.delete('crystal');
        const c2 = kit.dynBox([0.3, 0.44, 0.3], 'red', { color: PAL.redGlow, unlit: true, emissive: 0.85 });
        V.copy(c2.pos, gPlinth);
        c2.pos[1] += 0.24;
        c2.update();
        kit.game.audio.chime();
        setTimeout(() => kit.game.audio.solved(), 500);
        kit.msg('The model clicks shut. Every scale agrees.', 4.5);
        galleryGate.unlock();
      } else {
        kit.game.audio.denied();
        kit.msg('The plinth has the shape of a crystal. You have the shape of a visitor.', 4.2);
      }
    }, { id: 'place_crystal' });

    const galleryGate = kit.door({
      id: 'gallery_gate', pos: [0, 0, -6.94], facing: 's',
      locked: true,
      label: 'THE FAR GATE', lockLabel: 'The gate is missing its centerpiece.',
      hint: 'it wants what the model lacks',
      panelMat: 'char', color: [0.14, 0.14, 0.15],
      afterOpen: () => kit.complete(),
    });

    kit.tape('t5', [ROOM1.cx + 2.2, 0.2, -2.6], 'T-05', [
      'Recording 5. Surveyor 4 found a door in the model of my room.',
      'That is not possible. I went through it anyway.',
      'Note: whatever you carry through, comes back larger in meaning.',
    ]);

    setTimeout(() => kit.msg('A model of this very study sits on the table. One piece is missing.', 5), 800);
    setTimeout(() => kit.msg('The tiny door in the model does not consider itself tiny.', 5), 6200);
  },
  update(dt, kit) { },
};
