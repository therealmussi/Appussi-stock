# Dream NFL 🏈

Single-page mobile-first web app: a fast turn-based/wheel-based NFL player career simulator, from Draft night to the Hall of Fame. Same engine family as Dream NBA, Dream NHL and Dream MLB.

**Stack:** React 18 + Vite + Tailwind CSS 4, zero backend, auto-save in `localStorage` (key `dream-nfl-save-v1`).

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build to ../dream-nfl/ (committed, served by GitHub Pages)
npm run preview  # preview the build
```

The build uses `base: './'` with output in `../dream-nfl/`: the online version is at
[therealmussi.github.io/Appussi-stock/dream-nfl/](https://therealmussi.github.io/Appussi-stock/dream-nfl/).
After any source change re-run `npm run build` and commit the `dream-nfl/` folder too.

## Gameplay

1. **Create** — position (QB/RB/WR/TE), archetype (Deep Threat, Chain Mover, Triple Threat, Short-Yardage Anchor), Draft debut at 19 with 72–76 OVR.
2. **Draft** — weighted 32-team wheel: high pick = bad team but guaranteed snaps.
3. **Season loop** (age 19 to ~40), 4 steps per season:
   - **Step A · Training:** weighted wheel (Breakout, Step Forward, Plateau, Decline, Injury) → ±OVR.
   - **Step B · Regular Season:** instant sim over 17 games (YPG, TD, GP), record (0–16 wins), standing (Playoffs 1–8, Wild Card race, out) + story events (four-touchdown Sundays, viral hurdles, cold stretches, minor injuries, locker room tension).
   - **Step C · Awards & Playoffs:** Offensive Rookie of the Year, Pro Bowl, First-Team All-Pro, Offensive Player of the Year, Special Teams Ace, League MVP; single-elimination post-season (Wild Card, Divisional, Conference Championship) with team logos and **the Super Bowl decided by a dedicated wheel**; win = Super Bowl ring + chance at the Super Bowl MVP with the Lombardi Trophy (original in-repo SVG).
   - **Step D · Free Agency** when the contract expires: uniform wheel with 4 franchise offers (every team same probability) plus "Re-sign".
4. **Retirement** — manual from 35 or automatic rising odds, up to 40.
5. **Trophy case** — card with Career Score, verdict (from *Bust* to *GOAT* 🐐), awards (Super Bowls, Super Bowl MVP, League MVP, All-Pro…), career totals (30,000/50,000 scrimmage yards, 100+ touchdowns, 200 games), jersey number, season timeline.

## Architecture

```
src/
  data/
    teams.js              # franchises: id, names, colors, rating — the league data file (32 NFL clubs, AFC/NFC)
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
- Lombardi Trophy image: original in-repo SVG (`src/assets/lombardi-trophy.svg`), public domain.

Developed by Matteo Mussillon.
