import type { GenParams } from '../gen/types'
import { DEFAULT_PARAMS } from '../gen/types'
import type { World } from '../gen/types'
import { generateWorld } from '../gen/generate'
import {
  DEFAULT_LAYERS,
  X_UNKNOWN,
  START_FOOD,
  START_WATER,
  type GameState,
  type LayerToggles,
} from './state'
import { generateMissions } from './missions'

export function newGameState(world: World, seedStr: string, params: GenParams): GameState {
  const exp = new Uint8Array(world.W * world.H).fill(X_UNKNOWN)
  const s: GameState = {
    seedStr,
    worldName: 'Asteria',
    params,
    createdAt: Date.now(),
    day: 180, // mid year, spring equinox at start of the expedition
    player: { ...world.spawn },
    exp,
    food: START_FOOD,
    water: START_WATER,
    fatigue: 0,
    equipment: 100,
    points: 0,
    camps: [],
    samples: [],
    annotations: [],
    routes: [],
    journal: [],
    featureProgress: {},
    missions: generateMissions(world),
    distanceKm: 0,
    tilesSurveyed: 0,
    tilesObserved: 0,
    nextCampId: 1,
    nextAnnId: 1,
    nextRouteId: 1,
    zoneSurveyed: {},
    biomeSurveyed: {},
    geoSampled: {},
    renames: {},
  }
  return s
}

export function regenerateWorld(seedStr: string, params: GenParams): World {
  return generateWorld(seedStr, params)
}

export const DEFAULTS: GenParams = { ...DEFAULT_PARAMS }

export function sanitizeLayers(l?: Partial<LayerToggles>): LayerToggles {
  return { ...DEFAULT_LAYERS, ...(l ?? {}) }
}
