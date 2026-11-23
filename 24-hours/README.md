# 24 HOURS

*A time-driven narrative simulation game.* Part of a three-game collection by the same author:

- **The Impossible Room** — solving spatial problems.
- **False Memory** — telling truth from perception.
- **24 Hours** — managing *time, opportunity and consequence*.

> Every action takes time. Every minute changes the situation. Every decision means giving
> up another possibility. **You cannot do everything. And you will often find out too late
> what you should have done.**

---

## The premise

Vespera, a fictional European city. You are 22. At **08:00** your close friend Alex calls:

> *"We need to talk. Something happened last night. I can't explain it over the phone.
> Meet me before midnight."*

Then the line goes dead. You have **16 in-game hours (08:00 → 00:00)** to work out what
happened — and to be where Alex needs you when the day runs out.

There is one predefined, coherent truth behind the mystery. The game never invents
arbitrary explanations: endings are computed from the *actual state* of the simulation —
clues found, flags set, relationships, and where you chose not to be.

## What makes it different

1. **The city is independent.** Nine characters live by their own schedules. Miss a
   15:00 appointment and showing up at 15:30 does not bend the world to you — Viktor's
   train leaves at 14:15 whether or not you are on the platform.
2. **Time is the resource.** Reading a document costs minutes. A phone call costs five.
   Crossing Vespera costs up to 35. Every action button shows its price *before* you pay it.
3. **Replayability through knowledge.** Your first run is a map of everything you missed
   (the DAY ARCHIVE records it). **NEW DAY+** restarts the same day keeping your journal
   knowledge — not your objects, not your relationships. You know what happens at the
   station; you now have to *use* it.

## Running the game

**Option A — plain files.** Open `index.html` in any modern desktop browser. No server,
no dependencies, no build step.

**Option B — single-file build.** Open `dist/24-hours-standalone.html` — CSS and JS are
inlined into one portable file (share it, archive it, play it offline). Rebuild it after
editing sources with:

```bash
node tools/build.js   # writes dist/24-hours-standalone.html
```

Read-only persistence uses `localStorage` keys `24h_save` (autosave, updated after every
action) and `24h_archive` (end-of-day records that also feed NEW DAY+ memories). Clearing
site data resets the game.

## How to play

- **Main menu** — NEW GAME · CONTINUE · DAY ARCHIVE · NEW DAY+ · CREDITS.
- **Main screen** — three panels: the city map (top-down, phase-tinted, THRONE markers
  for characters you know), the location action list (each with a time-cost chip and any
  person it involves), and the day feed + objectives.
- **Phone** (`P`) — contacts, message threads, call history; people answer, refuse, or
  call back on their own time.
- **Journal** (`J`) — clues (with source), character profiles (schedule + relationship),
  and memories carried over from previous runs.
- **Pause / settings** (`Esc`) — resume, restart, return to menu.
- Time advances **only** through actions — a discrete engine, no real-time pressure while
  you think; all pressure lives in the schedule itself. In the last hour an explicit
  *"Wait until midnight"* action appears so the night is never a dead end.

## The city

Six locations with morning / afternoon / evening / night descriptions:

**The Apartment** (Venskaya Hill) · **Central Station** (transit hub) · **The Old Town**
(Café Halcyon, shops, squares) · **The Business District** (Meridian Partners, Kessler
Logistics) · **The Riverside** (swan bench on the Vodna quay) · **The Industrial
District** (Kessler yard, pawnshop, depot).

## Characters (9)

| Name | Role |
|---|---|
| Alex Renaud (23) | Warehouse clerk, Kessler Logistics — the friend who called |
| Jonas Renaud (28) | Alex's brother; financial analyst, Meridian Partners; owes someone |
| Mara Voss (21) | Barista at Café Halcyon; sees everything on the square |
| Sofia Lark (23) | Nursing student, Vespera Clinic; knows a quiet place |
| Elio Marchetti (57) | Station information & lost property; knows every timetable |
| Viktor Sera (49) | Pawnshop of curiosities; sells quiet |
| Tomas Brandt (52) | Director, Kessler Logistics |
| Devin Kray (33) | "Waiting, professionally"; does Brandt's errands |
| Nadia Petrov (35) | Investigative writer, Vespera Herald |

## Endings

| # | Title | Reached when… |
|---|---|---|
| 01 | **THE TRUTH** | Full fraud + debt chain reconstructed, and you meet Alex with the story whole (or push it to the press) |
| 02 | **TOO LATE** | You understood the day — but the meeting slips away |
| 03 | **THE WRONG PERSON** | You trusted the wrong lead: the folder is sold, or Brandt is tipped off |
| 04 | **THE ALTERNATIVE** | You found another lever and pull it |
| 05 | **THE SACRIFICE** | You spent the decisive hours on someone else's crisis |
| 06 | **THE UNKNOWN** | Midnight arrives before the picture does |

Every ending carries dynamic character fates (who testifies, who flees, who gets
promoted) shaped by your day.

## Architecture

Vanilla HTML5 / CSS3 / JavaScript. No frameworks, no external dependencies, no build
requirements. Plain `<script>` globals (works from `file://`), data layer separated from
rendering:

| File | Responsibility |
|---|---|
| `js/data.js` | `DATA` — travel matrix, 6 locations × 4 phases, 27 clues, character schedules & contact list |
| `js/story.js` | `STORY` helpers (`has`, `giveClue`, `relAdj`, feed/messages) + 8 dialogue trees |
| `js/actions.js` | Location action menus + 11 scheduled city events (`run(active)` with time windows) |
| `js/meeting.js` | Objective tracker, quiet-place deduction, locker & vault scenes, final meeting (bench / plan-B hall / ambush) and final choices |
| `js/endings.js` | `evaluateEnding()` + the six ending texts with epilogues |
| `js/engine.js` | `Engine` — state `S`, new game / NEW DAY+ / save / load, discrete time (`advance` → `fireEvents`), travel, phone, waiting, safe codes, ending resolution, archive |
| `js/ui.js` | All rendering only — HUD, SVG map, action list, scene overlay, phone, journal, pause, archive, end screen |
| `js/tests.js` | `TestRunner` — 14 data/simulation integrity checks, spawnable in-browser with `?test=1` |
| `js/main.js` | Boot, menu wiring, hotkeys |

**State model.** One object `S = { time (minutes since 00:00), loc, flags{}, clues{},
rel{}, msgs{}, callLog[], feed[], missed[], fired{}, codeTries, metAlex, ending, plus,
memories[] }`. Time advances exclusively via `Engine.advance(cost)`; scheduled events
fire when their minute is reached and expose an `active` window — missing the window
pushes a record into `S.missed` instead of quietly forgiving you. `has()` treats clues as
permanent flags, so information once genuinely found never silently un-finds itself.

**Time windows are honest:** the engine never clamps or delays the world for the player.
Consequences are delayed but always logically traceable to a decision.

## Testing

- `js/tests.js` → load the game and add `?test=1` to the URL for the in-browser suite,
  or run headless:

  ```bash
  cat js/data.js js/story.js js/actions.js js/meeting.js js/endings.js \
      js/engine.js js/ui.js js/tests.js js/main.js > /tmp/all.js
  node -e "global.window={addEventListener(){},location:{search:''}}; eval(require('fs').readFileSync('/tmp/all.js','utf8')+';process.exit(TestRunner.run()?0:1)')"
  ```

  Covered: travel-matrix symmetry, schedule validity, event windows, dialogue/action
  integrity, reachability of all six endings, full-day passive simulation, action costs,
  lockbox attempt limits, and the 23:45→00:00 gap.
- `node --check` on every source file.
- jsdom end-to-end smoke tests: menu → intro → actions → travel → phone → journal →
  midnight, a scripted **gold path** ending in ENDING 01, a **passive day** ending in the
  UNKNOWN, and a save/CONTINUE round-trip verifying `localStorage` autosave.
- Tooling: `npm`/`node` are used only for testing and the optional `tools/build.js`;
  the game itself has zero dependencies.

## Credits

A game by **Matteo Mussillon** — design, writing, code, procedural art and typography.
Vespera is fictional; its timetables are not negotiable.
