/* LEVEL 05 — PERSPECTIVE
   A cube that keeps the size your eye gives it. Weight is a matter of placing. */

import { V, Q } from '../engine/math3.js';
import { texChecker } from '../engine/textures.js';
import { PAL, PerspectiveCube, AABB } from '../kit.js';
import { AABB as AABBp } from '../physics.js';

export default {
  title: 'ROOM 05 — PERSPECTIVE',
  subtitle: 'distance is an ingredient',
  spawn: { pos: [0, 1.62, 10.0], yaw: 0.0 },
  mood: { root: 36, mood: 'grey', airAmt: 0.3 },
  env: {
    background: [0.86, 0.845, 0.815],
    fogColor: [0.86, 0.845, 0.815],
    fogDensity: 0.012,
    ambient: [0.6, 0.59, 0.57],
    sunDir: V.norm(V.make(), V.make(0.2, -1.0, -0.1)),
    sunColor: [0.5, 0.48, 0.44],
  },
  build(kit) {
    const W = 20, H = 6, D = 26;
    const zFar = -D / 2, zNear = D / 2;

    // main hall: floor split by chasm at z in [-3.2, 0]
    // near floor (z 0..13)
    kit.box([0, -0.13, 6.5], [W, 0.26, 13], 'floorPale', {});
    // far floor (z -13..-3.2)
    kit.box([0, -0.13, -8.1], [W, 0.26, 9.8], 'floorPale', {});
    // chasm walls (sides of the pit)
    kit.box([0, -3.5, -0.13], [W, 6.8, 0.26], 'char', {});   // near wall of pit
    kit.box([0, -3.5, -3.33], [W, 6.8, 0.26], 'char', {});   // far wall of pit
    kit.box([-W / 2 - 0.13, -3.5, -1.6], [0.26, 6.8, 3.2], 'char', {});
    kit.box([W / 2 + 0.13, -3.5, -1.6], [0.26, 6.8, 3.2], 'char', {});
    // pit bottom
    kit.box([0, -6.9, -1.6], [W, 0.26, 3.2], 'voidDeep', {});

    // perimeter walls
    kit.slab('z', zNear, -W / 2, W / 2, 0, H, 'white', {});
    kit.slab('z', zFar, -W / 2, W / 2, 0, H, 'white', {});
    kit.slab('x', -W / 2 - 0.26, zFar, zNear, 0, H, 'white', {});
    kit.slab('x', W / 2 + 0.26, zFar, zNear, 0, H, 'white', {});

    // ceiling
    kit.box([0, H + 0.13, 0], [W + 0.52, 0.26, D + 0.52], 'white', {});

    // checkerboard backdrop wall (the "measuring" wall)
    const checker = kit.renderer.makeTexture(texChecker('#33342f', '#dcd7cb', 10, 256, 256));
    this._checkerTex = checker;
    kit.batcher.addQuad([-6, 3.0, zFar + 0.14], [5, 5], Q.fromTo(Q.ident(), [0, 0, 1], [0, 0, 1]),
      kit.mat('checker', { tex: checker, unlit: true, twoSided: true, color: [1, 1, 1] }));

    // pressure plate on the far floor
    const plate = kit.dynBox([4.5, 0.08, 2.4], 'metal', { color: [0.5, 0.5, 0.53] });
    V.set(plate.pos, 0, 0.04, -9.8);
    plate.update();

    const plateZone = new AABBp(0, 0.2, -9.8, 2.4, 0.5, 1.3);

    // bridge (hidden until the plate is pressed)
    const bridge = kit.dynBox([W - 2, 0.22, 3.2], 'metal', { color: [0.55, 0.54, 0.52] });
    V.set(bridge.pos, 0, -6.0, -1.6); // parked at pit bottom
    bridge.update();
    const bridgeCol = new AABBp(0, -6.0, -1.6, (W - 2) / 2, 0.11, 1.6);
    bridgeCol.disabled = true;
    kit.colliders.push(bridgeCol);

    // cube pedestal + cube
    kit.box([0, 0.3, 6.0], [0.9, 0.6, 0.9], 'ceilPale', {});
    const backdrops = [
      // far wall
      new AABBp(0, 3.0, zFar + 0.2, 12, 3.5, 0.3),
      // far floor
      new AABBp(0, -0.26, -8.1, 12, 0.3, 5.2),
    ];
    const cube = new PerspectiveCube(kit, { pos: [0, 0.88, 6.0], backdrops, name: 'white cube' });
    kit.state.cube = cube; kit.state.bridge = bridge; kit.state.bridgeCol = bridgeCol;

    // the chasm never keeps anyone: recover to the start side
    let pitBusy = false;
    kit.trigger([0, -6.0, -1.6], [18, 1.6, 2.9], () => {
      if (pitBusy) return;
      pitBusy = true;
      cube.reset([0, 0.88, 6.0]);
      kit.game.setGravity([0, -1, 0]);
      kit.game.fadeTeleport([0, 1.62, 10.0], 0, { alsoResetDoors: false });
      kit.game.msg('The chasm declines to keep you. Back to the chalk line.', 4);
      setTimeout(() => { pitBusy = false; }, 1500);
    }, { once: false, id: 'pit_recover' });

    // plate press detection
    let pressed = false;
    kit.updaters.push((dt) => {
      if (pressed || cube.held) return;
      if (!plateZone.overlaps(cube.collider)) return;
      if (cube.size < 1.4) return; // too small to register
      pressed = true;
      kit.game.audio.solved();
      plate.setMat(kit.mat('glow', { color: PAL.blueGlow, unlit: true, emissive: 0.7 }));
      kit.msg('The plate sinks a full hand-width. WEIGHT, as placed, was accepted.', 5);
      // bridge rises
      kit.updaters.push(function rise(dtr) {
        bridge.pos[1] += dtr * 2.4;
        bridge.update();
        if (bridge.pos[1] >= 0.11) {
          bridge.pos[1] = 0.11;
          bridgeCol.disabled = false;
          bridgeCol.c[1] = 0.11;
          kit.msg('A bridge surfaces across the chasm. Perspective, satisfied, holds the seam.', 5);
          const i = kit.updaters.indexOf(rise);
          if (i >= 0) kit.updaters.splice(i, 1);
        }
      });
    });

    // plaques
    kit.plaque([0, 2.2, 12.6], 's', ['THE CUBE KEEPS THE SIZE YOUR EYE GAVE IT.', 'GIVE IT A DISTANT LOOK BEFORE LETTING GO.'], { w: 4.6, h: 1.1 });
    kit.plaque([0, 1.1, 12.6], 's', ['THE PLATE ACROSS THE CHASM', 'FEELS NOTHING SMALL.'], { w: 3.2, h: 0.75 });
    kit.chalkLine([0, 0.012, 1.4], 'x', 3.2);

    // exit door on the east wall, far side
    kit.door({
      id: 'exit', pos: [W / 2 - 0.26, 0, -9.8], facing: 'w',
      label: 'Continue', afterOpen: () => kit.complete(),
    });

    // console tape
    kit.tape('t7', [-7.0, 0, 6.0], 'T-07', [
      'Recording 7. Weight is a decision the eye makes first.',
      'I dropped the cube into the plate zone from across the room.',
      'It kept its place in my eye. The plate believed it. So did the door.',
    ]);

    setTimeout(() => kit.msg('A small cube on a plinth. A plate that will not be impressed by it.', 5), 800);
    setTimeout(() => kit.msg('Stand on the chalk line. Carry the cube. Look far. Let go.', 5.5), 6100);
  },
  update(dt, kit) { },
};
