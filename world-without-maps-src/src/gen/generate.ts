import { makeSeedRng, hashSeed } from '../core/rng'
import { Namer } from './labels'
import { generateTerrain } from './terrain'
import { generateClimate } from './climate'
import { generateHydrology } from './hydrology'
import { classifyBiomes } from './biomes'
import { generateGeology } from './geology'
import { buildFeatures } from './features'
import { SEA_LEVEL, B, type World, type GenParams } from './types'

// Orchestrator: layers are generated in dependency order and each layer uses
// only its predecessors, so the same seed always reproduces the same world.

export function generateWorld(seedStr: string, params: GenParams): World {
  const seedNum = hashSeed('ASTERIA::' + seedStr)
  const namer = new Namer(seedStr, 99)

  const terrain = generateTerrain(seedNum, params)

  // climate needs the stuffed surface for orographic lifting, but rivers
  // need precipitation: climate first (it only depends on elevation), then
  // hydrology, then biomes.
  const climate0 = generateClimate(terrain.W, terrain.H, terrain.elevation, terrain.elevation, null, params, seedNum)
  const hydro = generateHydrology(terrain.elevation, climate0.precipitation, terrain.W, terrain.H, params, seedNum)
  const climate = generateClimate(terrain.W, terrain.H, terrain.elevation, hydro.filled, null, params, seedNum)
  const biome = classifyBiomes(
    terrain.W,
    terrain.H,
    terrain.elevation,
    climate.temperature,
    climate.precipitation,
    hydro.riverMask,
    hydro.lakeId,
    params.vegetationDensity,
  )
  const geology = generateGeology(
    terrain.W,
    terrain.H,
    terrain.elevation,
    terrain.mountains,
    terrain.volcanic,
    hydro.filled,
    biome,
    climate.precipitation,
    seedNum,
  )
  const feats = buildFeatures({
    W: terrain.W,
    H: terrain.H,
    params,
    seedStr,
    seedNum,
    elevation: terrain.elevation,
    filled: hydro.filled,
    flowDir: hydro.flowDir,
    flowAcc: hydro.flowAcc,
    riverMask: hydro.riverMask,
    lakeId: hydro.lakeId,
    lakeLevel: hydro.lakeLevel,
    watershedId: hydro.watershedId,
    landDist: climate.landDist,
    temperature: climate.temperature,
    precipitation: climate.precipitation,
    biome,
    geology: geology.geology,
    mountains: terrain.mountains,
    volcanic: terrain.volcanic,
    namer,
    riverDensity: params.riverDensity,
  })

  const world: World = {
    seedStr,
    seedNum,
    params,
    W: terrain.W,
    H: terrain.H,
    elevation: terrain.elevation,
    filled: hydro.filled,
    flowDir: hydro.flowDir,
    flowAcc: hydro.flowAcc,
    riverMask: hydro.riverMask,
    lakeId: hydro.lakeId,
    lakeWater: hydro.lakeLevel,
    temperature: climate.temperature,
    precipitation: climate.precipitation,
    climateZone: climate.climateZone,
    biome,
    geology: geology.geology,
    resource: geology.resource,
    resourceRich: geology.resourceRich,
    watershedId: hydro.watershedId,
    landBodyId: feats.landBodyId,
    landDist: climate.landDist,
    mountains: terrain.mountains,
    volcanic: terrain.volcanic,
    features: feats.features,
    spawn: feats.spawn,
    riverId: feats.riverId,
    ancientRoads: feats.ancientRoads,
    stats: feats.stats,
  }
  void makeSeedRng
  return world
}

export function pickSpawnTile(w: World): number {
  return w.spawn.y * w.W + w.spawn.x
}

export function isHabitableLand(w: World, i: number): boolean {
  return w.elevation[i] > SEA_LEVEL && w.biome[i] !== B.ICE
}
