import type { GenParams } from '../gen/types'
import type { World } from '../gen/types'

// Exploration states per tile
export const X_UNKNOWN = 0
export const X_OBSERVED = 1
export const X_SURVEYED = 2

export interface PlayerPos {
  x: number
  y: number
}

export interface Camp {
  id: number
  x: number
  y: number
  food: number
  water: number
  day: number
}

export interface Sample {
  tile: number
  biome: number
  geology: number
  zone: number
  day: number
}

export interface Annotation {
  id: number
  x: number
  y: number
  text: string
  kind: 'label' | 'note'
}

export interface Route {
  id: number
  name: string
  points: PlayerPos[]
}

export interface JournalEntry {
  day: number
  kind: 'discover' | 'survey' | 'info' | 'science' | 'mission' | 'expedition'
  text: string
}

export interface FeatureProgress {
  status: 0 | 1 | 2
  day: number
  x: number
  y: number
}

export interface Mission {
  id: string
  title: string
  desc: string
  reward: number
  target: number // tile di riferimento (-1 se n/d)
  targetLabel: string
  kind: string
  done: boolean
  progress: number // 0..1
  revealed: boolean // il bersaglio è noto al giocatore?
}

export interface GameState {
  seedStr: string
  worldName: string
  params: GenParams
  createdAt: number
  day: number
  player: PlayerPos
  exp: Uint8Array
  food: number
  water: number
  fatigue: number
  equipment: number
  points: number
  camps: Camp[]
  samples: Sample[]
  annotations: Annotation[]
  routes: Route[]
  journal: JournalEntry[]
  featureProgress: Record<number, FeatureProgress>
  missions: Mission[]
  distanceKm: number
  tilesSurveyed: number
  tilesObserved: number
  nextCampId: number
  nextAnnId: number
  nextRouteId: number
  zoneSurveyed: Record<number, number>
  biomeSurveyed: Record<number, number>
  geoSampled: Record<number, number>
  renames: Record<number, string>
}

export const START_FOOD = 100
export const START_WATER = 100
export const YEAR_DAYS = 360

export function seasonOf(day: number): 0 | 1 | 2 | 3 {
  const s = Math.floor((day % YEAR_DAYS) / 90)
  return (s === 0 ? 0 : s === 1 ? 1 : s === 2 ? 2 : 3) as 0 | 1 | 2 | 3
}

export const SEASON_NAMES = ['Primavera', 'Estate', 'Autunno', 'Inverno']

export interface LayerToggles {
  vegetation: boolean
  climate: boolean
  geology: boolean
  resources: boolean
  watershed: boolean
  contours: boolean
  grid: boolean
  annotations: boolean
  routes: boolean
  labels: boolean
  fog: boolean
  weather: boolean
  hillshade: boolean
}

export const DEFAULT_LAYERS: LayerToggles = {
  vegetation: true,
  climate: false,
  geology: false,
  resources: false,
  watershed: false,
  contours: true,
  grid: false,
  annotations: true,
  routes: true,
  labels: true,
  fog: true,
  weather: true,
  hillshade: true,
}

export const TILE_KM = 12

export function worldRef(world: World): string {
  return world.seedStr
}
