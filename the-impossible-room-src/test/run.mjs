/* test/run.mjs — headless integration test for THE IMPOSSIBLE ROOM.
   Boots the real game against stub DOM/GL/Audio, then:
     - sanity-checks physics (fall, walk, wall stop, jump)
     - save/settings round-trip through localStorage
     - solves all 8 levels through their real interaction graph
     - collects every recording
     - verifies the ending chain runs to completion
   Run: node test/run.mjs */

import { installStubs } from './stubs.mjs';

installStubs();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function ok(cond, msg) {
  if (cond) { console.log('  ok — ' + msg); return; }
  failures++;
  console.log('  FAIL — ' + msg);
}

const consoleErrs = [];
const origError = console.error;
console.error = (...a) => { consoleErrs.push(a.map(String).join(' ')); };

await import('../js/main.js');

const game = globalThis.window.__game;
ok(!!game, 'game boots and exposes __game');
ok(game.state === 'menu', 'starts in menu state');

/* ---------- drivers ---------- */
function kitNow() { return game.current && game.current.kit; }
const player = () => game.player;

async function pump(ms, dt = 1 / 60) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    game.update(dt);
    await sleep(4);
  }
}

async function drainRaf(n = 3) {
  for (let i = 0; i < n; i++) {
    const q = globalThis.__rafQ || [];
    globalThis.__rafQ = [];
    q.forEach((cb) => cb(performance.now()));
    await sleep(2);
  }
}

function findIt(id) {
  return (kitNow() ? kitNow().interactables : []).find((i) => i.id === id) || null;
}
function findDoor(id) {
  return (kitNow() ? kitNow().doors || [] : []).find((d) => d.spec && d.spec.id === id) || null;
}
function findTrigger(id) {
  return (kitNow() ? kitNow().triggers : []).find((t) => t.id === id) || null;
}
function fire(id) {
  const it = findIt(id);
  if (!it) throw new Error('interactable not found: ' + id);
  it.cb(it);
  return it;
}
function openDoor(id) {
  const d = findDoor(id);
  if (!d) throw new Error('door not found: ' + id);
  d.openNow();
  return d;
}
function playTapeHere(id) {
  const t = findIt('tape_' + id);
  if (!t) throw new Error('tape not found: ' + id);
  t.cb(t);
}
async function awaitLevelIndex(target, timeoutMs = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    await pump(150);
    if (game.current && game.current.index === target) return true;
  }
  return false;
}
function isInverted() { return game.gravity[1] > 0; }

/* ---------- save / settings round-trip ---------- */
console.log('\n[save & settings]');
game.audio.init();
ok(!!game.audio.ctx, 'audio.init builds a context after gesture');
game.save.settings.sensitivity = 1.4;
game.save.settings.sfx = 0.5;
game.save.persist();
const raw = JSON.parse(globalThis.localStorage.getItem('impossible-room-save-v1'));
ok(raw && raw.settings.sensitivity === 1.4 && raw.settings.sfx === 0.5, 'settings survive persist()');
ok(!('persist' in raw), 'persist function is stripped from the stored shape');
game.save.settings.master = 0.6; game.save.persist();
ok(JSON.parse(globalThis.localStorage.getItem('impossible-room-save-v1')).settings.master === 0.6, 'persist() keeps overwriting cleanly');

/* ---------- NEW GAME through the real menu ---------- */
console.log('\n[new game]');
game.input.clear();
document.getElementById('btn-new').dispatchEvent(new globalThis.Event('click'));
ok(!document.getElementById('screen-main').classList.contains('visible'),
  'NEW GAME hides the main menu (regression: menu used to stay on top)');
let introDone = false;
{
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    await pump(150);
    if (game.current && game.current.index === 0 && game.state === 'playing') { introDone = true; break; }
  }
}
ok(introDone, 'intro completes and the campaign starts on level 1');
ok(!document.getElementById('screen-main').classList.contains('visible'),
  'main menu stays hidden during play');
ok(document.getElementById('click-to-play').classList.contains('visible'),
  'click-to-play overlay shown while the pointer is unlocked');
await drainRaf(2);
ok(document.getElementById('hints').classList.contains('on'),
  'HUD control hints shown at level start');

/* ---------- physics sanity ---------- */
console.log('\n[physics]');
await pump(1200);
ok(Math.abs(game.player.pos[1] - 0.85) < 0.06,
  'spawn falls and settles on the floor (y≈0.85), got ' + game.player.pos[1].toFixed(2));

game.input.setVirtual('KeyW', true);
await pump(600);
game.input.setVirtual('KeyW', false);
const moved = Math.hypot(game.player.pos[0] - 2.4, game.player.pos[2] - 3.2);
ok(moved > 0.8, 'W walks the player, displacement ' + moved.toFixed(2) + 'm');

game.player.teleport([0, 1.62, 2.0], Math.PI);
game.input.setVirtual('KeyW', true);
await pump(1600);
game.input.setVirtual('KeyW', false);
ok(game.player.pos[2] < 5.3, 'wall stops movement before leaving the room, z=' + game.player.pos[2].toFixed(2));

game.player.teleport([0, 1.62, 0], 0);
await pump(600);
const yGround = game.player.pos[1];
game.input.setVirtual('Space', true);
let apex = 0;
{
  const t0 = Date.now();
  while (Date.now() - t0 < 500 && apex < yGround + 0.4) {
    game.update(1 / 60);
    apex = Math.max(apex, game.player.pos[1]);
    await sleep(4);
  }
}
game.input.setVirtual('Space', false);
ok(apex > yGround + 0.4, 'space jumps, apex climbed to y=' + apex.toFixed(2));
await pump(1200);
ok(Math.abs(game.player.pos[1] - 0.85) < 0.06, 'lands again on the floor');

/* ---------- coyote & jump buffer ---------- */
console.log('\n[jump forgiveness]');
await pump(200);
game.player.vel[1] = 0;
await pump(30);
ok(Math.abs(game.player.pos[1] - 0.85) < 0.09, 'settled, y=' + game.player.pos[1].toFixed(2));
await pump(1200);
{
  game.player.teleport([0, 1.62, 0], 0);
  await pump(500);
  game.player.pos[1] = 0.95;
  game.player.vel[1] = -1.0;
  game.input.setVirtual('Space', true);
  let apex3 = 0.95;
  const t3 = Date.now();
  while (Date.now() - t3 < 1500) {
    game.update(1 / 60);
    apex3 = Math.max(apex3, game.player.pos[1]);
    if (apex3 > 1.3) break;
    await sleep(2);
  }
  game.input.setVirtual('Space', false);
  ok(apex3 > 1.3, 'jump still fires shortly after leaving the ground (coyote time), apex y=' + apex3.toFixed(2));
  await pump(1200);
}

/* ---------- pause & restart keys ---------- */
console.log('\n[pause & restart keys]');
game.input.clear();
globalThis.window.__fire('keydown', new globalThis.Event('keydown', { code: 'Escape' }));
ok(game.state === 'paused', 'ESC pauses the game');
ok(document.getElementById('pause-tapes').textContent.includes('CH. 01'),
  'pause screen shows chapter name + recordings (was an empty placeholder)');
globalThis.window.__fire('keydown', new globalThis.Event('keydown', { code: 'Escape' }));
ok(game.state === 'playing', 'ESC resumes the game');
{
  game.player.teleport([5, 1.62, 5], 0);
  globalThis.window.__fire('keydown', new globalThis.Event('keydown', { code: 'KeyR' }));
  ok(game.state === 'transition', 'R triggers a quick restart');
  let back = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 3000) {
    await pump(100);
    if (game.state === 'playing' && Math.hypot(game.player.pos[0] - 2.4, game.player.pos[2] - 3.2) < 1.5) { back = true; break; }
  }
  ok(back, 'quick restart respawns on the level start');
  await drainRaf(2);
  ok(document.getElementById('hints').classList.contains('on'), 'hints shown again after restart');
}

/* ---------- LEVEL 01 — THE BEGINNING ---------- */
console.log('\n[LEVEL 1 — THE BEGINNING]');
game.restartLevel();
await pump(300);
const wardrobe = findIt('wardrobe');
ok(!!wardrobe && /knock/i.test(wardrobe.label), 'wardrobe invites a knock');
playTapeHere('t1');
fire('wardrobe');
await pump(150);
ok(wardrobe.label.includes('Slide'), 'knock → label becomes "Slide the wardrobe aside"');
fire('wardrobe');
await pump(2200);
ok(!!findDoor('hidden_exit'), 'hidden door exists behind the wardrobe');
openDoor('hidden_exit');
ok(await awaitLevelIndex(1), 'level 1 completes → level 2 loads');

/* ---------- LEVEL 02 — THE WRONG DOOR ---------- */
console.log('\n[LEVEL 2 — THE WRONG DOOR]');
game.input.clear();
function orbShown(color) {
  const o = kitNow().state.orbs && kitNow().state.orbs[color];
  return !!(o && o.it.enabled);
}
openDoor('door_red');
await pump(2200);
ok(orbShown('amber'), 'entering via red shows the AMBER orb');
fire('orb_amber');
playTapeHere('t3');
openDoor('vest_exit');
await pump(1800);
fire('plinth_amber');
await pump(250);
openDoor('door_blue');
await pump(2200);
ok(orbShown('red'), 'next visit shows the RED orb');
fire('orb_red');
openDoor('vest_exit');
await pump(1800);
fire('plinth_red');
openDoor('door_amber');
await pump(2200);
ok(orbShown('blue'), 'third visit shows the BLUE orb');
fire('orb_blue');
openDoor('vest_exit');
await pump(1800);
fire('plinth_blue');
await pump(1500);
const eg = findDoor('exit_gate');
ok(eg && !eg.locked, 'all three plinths fed → exit gate unlocked');
openDoor('exit_gate');
ok(await awaitLevelIndex(2), 'level 2 completes → level 3 loads');

/* ---------- LEVEL 03 — UPSIDE DOWN ---------- */
console.log('\n[LEVEL 3 — UPSIDE DOWN]');
game.input.clear();
fire('lever_hatch');
await pump(900);
fire('pad_up');
game.player.teleport([0.4, 1.62, 0.6], Math.PI / 2);
await pump(3500);
ok(isInverted(), 'gravity is inverted after pad_up');
ok(Math.abs(player().pos[1] - 12.55) < 0.4,
  'player crossed the gap and hangs on room B ceiling, y=' + player().pos[1].toFixed(2));
fire('pad_down');
game.player.teleport([2.6, 12.2, 2.2], 0);
await pump(2500);
ok(!isInverted(), 'gravity restored');
ok(Math.abs(player().pos[1] - 11.11) < 0.4, 'player stands on room B floor, y=' + player().pos[1].toFixed(2));
playTapeHere('t4');
openDoor('exit_b');
ok(await awaitLevelIndex(3), 'level 3 completes → level 4 loads');

/* ---------- LEVEL 04 — THE SMALLER WORLD ---------- */
console.log('\n[LEVEL 4 — THE SMALLER WORLD]');
game.input.clear();
fire('enter_model');
await pump(1800);
fire('take_crystal');
playTapeHere('t5');
ok(game.inventory.has('crystal'), 'crystal taken into inventory');
fire('enter_smaller');
await pump(1500);
playTapeHere('t6');
openDoor('r1_exit');
await pump(1800);
fire('place_crystal');
const gg = findDoor('gallery_gate');
ok(gg && !gg.locked, 'crystal placed → gallery gate unlocked');
openDoor('gallery_gate');
ok(await awaitLevelIndex(4), 'level 4 completes → level 5 loads');

/* ---------- LEVEL 05 — PERSPECTIVE ---------- */
console.log('\n[LEVEL 5 — PERSPECTIVE]');
game.input.clear();
playTapeHere('t7');
game.player.teleport([0, -4.5, -1.6], 0);
await pump(1600);
ok(game.player.pos[1] > 0 && Math.abs(game.player.pos[2] - 10) < 1.5,
  'chasm recovers the player to the near side, z=' + game.player.pos[2].toFixed(2));

const cube = kitNow().state.cube;
const bridge = kitNow().state.bridge;
cube.reset([0, 1.1, -9.8]);
cube.size = 0.9;
await pump(500);
ok(bridge.pos[1] < -5, 'small cube does not impress the plate');
cube.size = 2.0;
await pump(700);
ok(bridge.pos[1] > -5, 'big cube presses the plate — bridge begins to rise');
await pump(3200);
const bridgeCol = kitNow().state.bridgeCol;
ok(bridgeCol && !bridgeCol.disabled, 'bridge collider enabled after rising');
game.player.teleport([5, 1.62, -9.8], Math.PI / 2);
await pump(900);
openDoor('exit');
ok(await awaitLevelIndex(5), 'level 5 completes → level 6 loads');

/* ---------- LEVEL 06 — THE LOOP ---------- */
console.log('\n[LEVEL 6 — THE LOOP]');
game.input.clear();
openDoor('loop_door');
await pump(2400);
playTapeHere('t8a');
openDoor('loop_door');
await pump(2400);
playTapeHere('t8b');
openDoor('loop_door');
await pump(2400);
ok(kitNow().state.passes === 3, 'three passes counted');
const le = findDoor('loop_exit');
ok(le && !le.locked, 'exit revealed after pass 3');
openDoor('loop_exit');
ok(await awaitLevelIndex(6), 'level 6 completes → level 7 loads');

/* ---------- LEVEL 07 — THE ARCHITECT ---------- */
console.log('\n[LEVEL 7 — THE ARCHITECT]');
game.input.clear();
fire('padA1');
game.player.teleport([-8, 1.62, 4.6], 0);
await pump(3000);
ok(isInverted(), 'hall gravity inverted for lock A');
fire('leverA');
fire('padA3');
await pump(2500);
ok(!isInverted(), 'gravity restored on the far side');
playTapeHere('t9');
openDoor('closet1');
await pump(2200);
ok(kitNow().state.closetEntry === 'first', 'first visit — closet has the lever');
fire('leverB');
openDoor('closet_exit');
await pump(2000);
openDoor('closet2');
await pump(2200);
ok(kitNow().state.closetEntry === 'second', 'second visit — same closet, different history');
openDoor('closet_exit');
await pump(2000);
fire('enter_model_hall');
await pump(1500);
fire('leverC');
openDoor('replica_exit');
await pump(2000);
await pump(1200);
const mg = findDoor('main_gate');
ok(mg && !mg.locked, 'all three locks satisfied → main gate unlocked');
openDoor('main_gate');
ok(await awaitLevelIndex(7), 'level 7 completes → level 8 loads');

/* ---------- LEVEL 08 — THE IMPOSSIBLE ROOM ---------- */
console.log('\n[LEVEL 8 — THE IMPOSSIBLE ROOM]');
game.input.clear();
playTapeHere('t10');
fire('wall_east');
await pump(900);
fire('wall_east');
await pump(2800);
ok(!!findIt('wall_east') && !findIt('wall_east').enabled, 'hollow wall knocked, pushed, and slid open');
game.player.teleport([7, 1.62, 0], Math.PI / 2);
await pump(700);
fire('pad_gal_up');
await pump(3200);
ok(isInverted(), 'gallery gravity inverted on the ceiling catwalk');
ok(player().pos[1] > 10.5, 'player hangs above the gap, y=' + player().pos[1].toFixed(2));
fire('pad_gal_down');
await pump(3000);
ok(!isInverted(), 'gravity restored over the far walkway');
ok(player().pos[1] > 0 && player().pos[1] < 1.4,
  'player lands on the far walkway, y=' + player().pos[1].toFixed(2));
ok(!!findTrigger('rec_floor') && !!findTrigger('rec_ceiling'), 'gallery recovery triggers armed');
openDoor('frame1');
await pump(2200);
playTapeHere('t2');
openDoor('final_door');
await pump(2400);
ok(game.state === 'ending', 'finishing the last level starts the ending sequence');
await pump(24000, 1 / 30);
globalThis.document.getElementById('btn-credits-back').dispatchEvent(new globalThis.Event('click'));
await pump(300);
ok(game.save.endingSeen === true, 'ending sequence completes and sets endingSeen');
ok(game.state === 'menu', 'returns to the main menu after the ending');

/* ---------- final save state ---------- */
console.log('\n[final save]');
const fin = JSON.parse(globalThis.localStorage.getItem('impossible-room-save-v1'));
ok(fin && fin.completed.filter(Boolean).length === 8, 'all 8 chapters marked complete in storage');
ok(fin.maxUnlocked >= 8, 'all chapters unlocked');
ok(game.save.tapes.length === 11, 'all 11 recordings collected on this run');
ok(document.getElementById('btn-continue').textContent.includes('CH. 08'),
  'CONTINUE button shows the current chapter after the campaign: ' + document.getElementById('btn-continue').textContent);
ok(!document.getElementById('btn-continue').classList.contains('disabled'), 'CONTINUE is enabled');
await drainRaf(3);
ok(consoleErrs.filter((e) => !/favicon/.test(e)).length === 0,
  'no console errors during the entire run' + (consoleErrs.length ? ' — got: ' + consoleErrs.slice(0, 3).join(' | ') : ''));

console.log('\n================================');
console.log(failures === 0 ? 'ALL TESTS PASSED' : failures + ' TEST(S) FAILED');
console.error = origError;
process.exit(failures === 0 ? 0 : 1);
