# Dream NHL 🏒

Single-page mobile-first web app: a fast turn-based/wheel-based NHL player career simulator, from Draft night to the Hall of Fame. English edition — the French version lives in `dream-lnh-src/` ([play Dream LNH](https://therealmussi.github.io/Appussi-stock/dream-lnh/)).

**Stack:** React 18 + Vite + Tailwind CSS 4, zero backend, auto-save in `localStorage` (key `dream-nhl-save-v1`).

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build to ../dream-nhl/ (committed, served by GitHub Pages)
npm run preview  # preview the build
```

The build uses `base: './'` with output in `../dream-nhl/`: the online version is at
[therealmussi.github.io/Appussi-stock/dream-nhl/](https://therealmussi.github.io/Appussi-stock/dream-nhl/).
After any source change re-run `npm run build` and commit the `dream-nhl/` folder too.

## Gameplay

1. **Create** — position (C/LW/RW/D), archetype (Sniper, Playmaker, Two-Way, Stay-at-Home), Draft debut at 19 with 72–76 OVR.
2. **Draft** — weighted 32-team wheel: high pick = bad team but guaranteed minutes.
3. **Season loop** (age 19 to ~40), 4 steps per season:
   - **Step A · Training:** weighted wheel (Breakout, Step Forward, Plateau, Decline, Injury) → ±OVR.
   - **Step B · Regular Season:** instant sim (PTS/G, AST/G, HIT/G, TOI), record, seed (Playoffs 1–8, Play-In 9–10, out) + story events (hat trick nights, viral clips, slumps, minor injuries, locker room tension).
   - **Step C · Awards & Playoffs:** Calder, All-Star, First All-Star Team, Art Ross, Selke, Norris, Hart; play-in, round-by-round post-season with team logos and **a Game 7 of the Stanley Cup Final decided by a dedicated wheel**; win = Stanley Cup + chance at the Conn Smythe.
   - **Step D · Free Agency** when the contract expires: uniform wheel with 4 franchise offers (every team same probability) plus "Re-sign".
4. **Retirement** — manual from 35 or automatic rising odds, up to 40.
5. **Trophy case** — card with Career Score, verdict (from *Bust* to *GOAT* 🐐), awards (Stanley Cup, Conn Smythe, Hart, Norris…), career totals and milestones, jersey number, season timeline.

## Architecture

```
src/
  data/
    teams.js              # franchises: id, names, colors, rating — the league data file
    events.js             # rules/params: archetypes, development table, awards, weights, verdicts
  engine/
    simulationEngine.js   # PURE simulation engine: no DOM, no React
  store/
    useGame.js            # reducer + localStorage persistence + screen state machine
  components/
    Wheel.jsx             # CSS fortune wheel with arbitrary weights
    Burst.jsx             # particles/flash for Cups, Hart, 1st overall pick
    ui.jsx                # shared widgets (crest with real logos, trophy, bars, chips)
    ProfilePanel.jsx      # player profile modal (attributes, jersey, teams worn)
  screens/                # one screen per flow step
  App.jsx                 # HUD + screen router
```

## Credits

- Team logos hotlinked from [ESPN CDN](https://www.espn.com).
- Stanley Cup image: original in-repo SVG (`src/assets/stanley-cup.svg`), public domain.

Developed by Matteo Mussillon.
