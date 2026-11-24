# WORLD WITHOUT MAPS — Asteria

Browser-based exploration and cartography game. You arrive in Asteria, a world
with no maps: every mountain range, river system, climate zone and coastline
must be discovered, surveyed and charted by the player through exploration and
field science.

The world is geographically coherent by construction, not decorated:

- Layered deterministic generation from the seed: continental masses →
  elevation → tectonic mountain belts → volcanoes → climate (zonal winds,
  orographic lift, rain shadows, Köppen zones) → priority-flood hydrology
  (Barnes) → D8 accumulation with 100% guaranteed drainage → Whittaker biomes
  → geology and resources → feature recognition (ranges, peaks with
  prominence, minimax passes, river networks with tributaries and discharge,
  lakes, deserts, forests, islands, canyons, natural harbors, ruins, ancient
  roads).
- The same seed always regenerates an identical world cell by cell; saves
  store only deltas.
- Three exploration states (unknown / observed / surveyed), fog that widens
  from summits, river-following as a core discovery mechanic.
- Cartography system with thematic layers, contours, grid, survey accuracy,
  renameable toponyms and an Atlas that grows into the player's real
  achievement.
- Environmental simulation: seasons, weather, river floods, snowy passes.
- Expedition management: supplies, fatigue, camps with caches, terrain-based
  travel costs. Missions emerge from the generated geography.
- Saves in localStorage, multiple worlds, headless validation tools.

## Run

```bash
cd world-without-maps-src
npm install
npm run dev       # http://localhost:5173
npm run build     # production build (base './')

# headless validation
npx tsx tools/geo-test.mts        # drainage, determinism, biomes, climate
npx tsx tools/gameplay-test.mts   # travel/observe/survey/missions loop
```

The static build served by GitHub Pages lives in [`../world-without-maps/`](../world-without-maps/).
Do not edit it by hand: regenerate with `npm install && npm run build` from
this folder and copy `dist/` into `../world-without-maps/`.
