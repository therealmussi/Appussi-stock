# Dream MLB ⚾

Single-page mobile-first web app: a fast turn-based/wheel-based MLB player career simulator, from Draft night to the Hall of Fame.

**Stack:** React 18 + Vite + Tailwind CSS 4, zero backend, auto-save in `localStorage` (key `dream-mlb-save-v1`).

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build to ../dream-mlb/ (committed, served by GitHub Pages)
npm run preview  # preview the build
```

The build uses `base: './'` with output in `../dream-mlb/`: the online version is at
[therealmussi.github.io/Appussi-stock/dream-mlb/](https://therealmussi.github.io/Appussi-stock/dream-mlb/).
After any source change re-run `npm run build` and commit the `dream-mlb/` folder too.

## Gameplay

1. **Create** — position (C/IF/OF/DH), archetype (Slugger, Contact Hitter, Five-Tool, Defensive Anchor), Draft debut at 19 with 72–76 OVR.
2. **Draft** — weighted 30-team wheel: high pick = bad team but guaranteed at-bats.
3. **Season loop** (age 19 to ~40), 4 steps per season:
   - **Step A · Training:** weighted wheel (Breakout, Step Forward, Plateau, Decline, Injury) → ±OVR.
   - **Step B · Regular Season:** instant sim over 162 games (AVG, RBI/G, HR, GP), record (42–116 wins), seed (Playoffs 1–8, Play-In 9–10, out) + story events (three-homer nights, viral web gems, cold stretches, minor injuries, clubhouse tension).
   - **Step C · Awards & Playoffs:** Rookie of the Year, All-Star, Silver Slugger, Hank Aaron Award, Gold Glove, Platinum Glove, AL/NL MVP; play-in, round-by-round post-season (Wild Card, Division Series, LCS) with team logos and **a Game 7 of the World Series decided by a dedicated wheel**; win = World Series ring + chance at the World Series MVP.
   - **Step D · Free Agency** when the contract expires: uniform wheel with 4 franchise offers (every team same probability) plus "Re-sign".
4. **Retirement** — manual from 35 or automatic rising odds, up to 40.
5. **Trophy case** — card with Career Score, verdict (from *Bust* to *GOAT* 🐐), awards (World Series, World Series MVP, MVP, Silver Slugger, Gold Glove…), career totals (3,000-hit club, 2,000 RBI, 600 stolen bases), jersey number, season timeline.

## Architecture

```
src/
  data/
    teams.js              # franchises: id, names, colors, rating — the league data file (30 MLB clubs)
    events.js             # rules/params: archetypes, development table, awards, weights, verdicts
  engine/
    simulationEngine.js   # PURE simulation engine: no DOM, no React
  store/
    useGame.js            # reducer + localStorage persistence + screen state machine
  components/
    Wheel.jsx             # CSS fortune wheel with arbitrary weights
    Burst.jsx             # particles/flash for rings, MVP, 1st overall pick
    ui.jsx                # shared widgets (crest with real logos, trophy, bars, chips)
    ProfilePanel.jsx      # player profile modal (attributes, jersey, teams worn)
  screens/                # one screen per flow step
  App.jsx                 # HUD + screen router
```

## Credits

- Team logos hotlinked from [ESPN CDN](https://www.espn.com).
- World Series trophy image: original in-repo SVG (`src/assets/world-series-trophy.svg`), public domain.

Developed by Matteo Mussillon.
