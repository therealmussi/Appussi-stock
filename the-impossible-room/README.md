# THE IMPOSSIBLE ROOM

A surreal first-person puzzle/exploration game for the desktop browser. You wake
inside an apparently ordinary room in a building where geometry, gravity and
spatial logic do not behave. Learn to read the architecture — it is the only way
out, if "out" is even the right word.

Eight chapters, five interlocking spatial mechanics, one observation building
that may not be a building at all.

## Run it

```bash
python3 serve.py            # then open http://localhost:8000
# or: python3 serve.py 9000
```

Any static file server with correct ES-module MIME types works
(`npx serve`, `caddy file-server`, most hosts' static deploy). There are no
external assets, no build step, and no network dependencies — everything
(geometry, textures, sounds) is generated procedurally at runtime.

## Rendering notes

Single-shard WebGL 1 renderer (one GLSL program, interleaved vertex stream,
material batching). Surfaces carry procedural plaster textures with world-scale
UV density, per-face tonal jitter, mipmapped + anisotropically filtered
textures, a soft fresnel rim light, gently flickering lamp lights and
distance fog. High quality renders up to 2× device pixel ratio.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrows | Move |
| Mouse | Look (click the canvas to capture the pointer) |
| `Space` | Jump (where the room permits it; short late jumps still register) |
| `E` | Interact — doors, levers, objects, walls |
| `Shift` | Sprint |
| `R` | Restart the current level |
| `Esc` | Pause / resume |

A crosshair plus a contextual prompt shows exactly what is interactable; the
game never hides a solution behind an unlabeled object.

## The campaign

| # | Chapter | Introduces |
| --- | --- | --- |
| 01 | THE BEGINNING | Movement, interaction; the exit is not where it should be |
| 02 | THE WRONG DOOR | Impossible doors — rooms connected out of order |
| 03 | UPSIDE DOWN | Gravity manipulation — the ceiling becomes the floor |
| 04 | THE SMALLER WORLD | Recursive rooms and rescaled spaces |
| 05 | PERSPECTIVE | Objects sized by observation — Superliminal-style drop puzzles |
| 06 | THE LOOP | A corridor that repeats; what changes between passes |
| 07 | THE ARCHITECT | All mechanics combined in one sequence of locks |
| 08 | THE IMPOSSIBLE ROOM | Geometry, gravity, perspective and recursion in one final room — and an answer you have to knock for |

Every level is solvable by observation and reasoning; falling into a void is
never fatal — recovery systems return you to a sensible spot (and the game
explains that the room "declines to keep you").

Progress auto-checkpoints to `localStorage`; CONTINUE resumes the furthest
unlocked chapter and completed chapters can be replayed from CHAPTERS.
Recordings (small tapes hidden in each level, 11 in total) piece together who
built this place and why you were invited.

## The five mechanics

- **A — Impossible doors** connect positions that cannot be adjacent; the
  campaign's doors open onto rooms with no shared wall.
- **B — Gravity manipulation**: gravity pads and levers set per-room gravity;
  the player capsule, camera and movement re-orient (walk on ceilings).
- **C — Perspective puzzles**: a grabbable cube rendered held at a fixed
  angular size; drop it far and it physically *is* far-sized. Size is the
  solution currency of chapter 05.
- **D — Recursive rooms**: spaces nested inside themselves; the interior of a
  small model is a full-size elsewhere.
- **E — Spatial reconfiguration**: sliding panels, rising bridges and wall
  modes rebuild rooms while you watch.

## Architecture

```
index.html            entry point + UI screens
css/style.css         HUD, menus, title cards
js/
  main.js             bootstrap: renderer, game, UI wiring, menu buttons
  core.js             Game: state machine, level flow, interaction, saves, ending
  kit.js              LevelKit — every tool a level needs (rooms, doors, props,
                      interactables, triggers, gravity pads, tapes, perspective cube)
  levels/
    index.js          level registry (8 entries)
    level1.js…level8.js   one module per chapter
  physics.js          static-AABB world, per-axis collide, step-up, gravity axes
  player.js           capsule controller, quaternion camera, footsteps, landing
  save.js             localStorage persistence (settings + progression + tapes)
  audio.js            procedural WebAudio: drone, footsteps, doors, mechanisms, cues
  engine/
    math3.js          vectors, quaternions
    renderer.js       WebGL1 forward renderer, fog, 4 point lights, quality tiers
    batcher.js        texture-batched geometry submission
    geo.js            procedural mesh generators (boxes, cylinders, …)
    textures.js       canvas-generated textures (concrete, travertine, carpet,
                    paintings, text plates, stars…)
test/
  stubs.mjs           headless DOM/WebGL/WebAudio/localStorage stubs
  run.mjs             integration harness: boots the real game, solves all 8
                      levels through their real interaction graphs, verifies
                      physics, saves, tapes and the ending chain
serve.py              static dev server with correct module MIME types
```

Rendering is a single-program WebGL 1 renderer (interleaved position/normal/uv/
color stream) with texture-batched static geometry and dynamic nodes for
animated props — chosen deliberately over a large engine so the whole game is
auditable, dependency-free and fast on ordinary laptops.

## Testing

```bash
npm test                # = node test/run.mjs
```

The harness boots the real game against stubbed DOM/WebGL/Audio, then plays it:
settles physics, walks into a wall, jumps, and beats every chapter by firing the
same interactables a player would — ending with the final-room door, the ending
sequence, and a check that all 8 chapters, all 11 recordings and zero console
errors are recorded in storage.

## Notes

- Desktop-first (mouse+keyboard). Quality settings adjust render resolution.
- Save data lives under the key `impossible-room-save-v1`.
- All sound is generated (WebAudio oscillators/noise); music and SFX volumes are
  independent sliders in Settings.
