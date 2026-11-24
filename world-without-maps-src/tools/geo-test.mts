// Geographical engine validation (run with: node --experimental-strip-types)
import { generateWorld } from '../src/gen/generate.ts'
import { DEFAULT_PARAMS, SEA_LEVEL, B, altitudeM } from '../src/gen/types.ts'

const seeds = [' Asteria-uno', 'asteria-uno', 'PROVA', 'martellina', 'orizzonte-99']
console.log('== WORLD WITHOUT MAPS :: engine test ==\n')

for (const seed of ['asteria-uno', 'PROVA', 'martellina', 'orizzonte-99']) {
  const w = generateWorld(seed, { ...DEFAULT_PARAMS })
  const { W, H, elevation, flowDir, filled, biome } = w
  const N = W * H

  // 1. determinism: same seed -> identical first 512 elevations
  const w2 = generateWorld(seed, { ...DEFAULT_PARAMS })
  let same = 0
  for (let i = 0; i < N; i++) if (w2.elevation[i] === elevation[i]) same++
  const deterministic = same === N

  // 2. drainage: every land cell with flow must reach the ocean downhill
  let landCells = 0
  let flowing = 0
  let stalled = 0
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) continue
    landCells++
    let c = i
    let guard = 0
    let reached = false
    while (guard++ < 5000) {
      const d = flowDir[c]
      if (d < 0) break
      if (filled[d] <= SEA_LEVEL || elevation[d] <= SEA_LEVEL) {
        reached = true
        break
      }
      if (!flowingCheck(filled[c], filled[d])) break
      c = d
    }
    if (reached) flowing++
    else if (w.lakeId[i] < 0) stalled++
  }

  // 3. downhill monotonicity on first 4000 river cells
  let uphill = 0
  let checked = 0
  for (let i = 0; i < N && checked < 4000; i++) {
    if (!w.riverMask[i]) continue
    checked++
    const d = flowDir[i]
    if (d >= 0 && filled[d] > filled[i] + 1e-9) uphill++
  }

  // 4. biome sanity counts
  const counts: Record<number, number> = {}
  for (let i = 0; i < N; i++) counts[biome[i]] = (counts[biome[i]] ?? 0) + 1
  const onLand = (m: (b: number) => boolean) => {
    let c = 0
    for (let i = 0; i < N; i++) if (elevation[i] > SEA_LEVEL && m(biome[i])) c++
    return c / Math.max(1, landCells)
  }

  const kinds: Record<string, number> = {}
  for (const f of w.features) kinds[f.kind] = (kinds[f.kind] ?? 0) + 1

  console.log(`seed "${seed}" | ${W}x${H}`)
  console.log(`  deterministic: ${deterministic ? 'OK' : 'FAIL'}`)
  console.log(`  land: ${w.stats.landTiles} tiles (${(100 * w.stats.landTiles / N).toFixed(1)}%), ocean coverage ${(100 * w.stats.oceanTiles / N).toFixed(1)}%`)
  console.log(`  drainage: ${flowing}/${landCells} land cells reach the ocean (${((100 * flowing) / landCells).toFixed(2)}%); stalled non-lake: ${stalled}`)
  console.log(`  rivers: uphill steps on filled surface: ${uphill}/${checked}`)
  console.log(`  highest peak: ${w.stats.highestPeakAlt} m | basins: ${w.stats.basins} | features kinds: ${JSON.stringify(kinds)}`)
  console.log(`  biome diversity on land: ${Object.keys(counts).length - 1} classes | desert ${(100 * onLand((b) => b === B.DESERT)).toFixed(1)}% forest ${(100 * onLand((b) => b === B.BOREAL || b === B.TEMPERATE_FOREST || b === B.TEMPERATE_RAINFOREST || b === B.TROPICAL_RAINFOREST)).toFixed(1)}%`)
  const zoneCount = new Set<number>()
  for (let i = 0; i < N; i++) if (elevation[i] > SEA_LEVEL) zoneCount.add(w.climateZone[i])
  console.log(`  climate zones present: ${zoneCount.size}/8 | spawn: (${w.spawn.x},${w.spawn.y}) biome=${w.biome[w.spawn.y * W + w.spawn.x]}`)
  console.log('')
}

function flowingCheck(a: number, b: number): boolean {
  return b <= a + 1e-9
}
void seeds
