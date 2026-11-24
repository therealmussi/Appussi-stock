// ---------------------------------------------------------------------------
// World data model. All terrain layers are flat typed arrays of size W*H.
// ---------------------------------------------------------------------------

export interface GenParams {
  worldSize: number // grid width; height derived by ratio 3:2
  continents: number // tendency toward 1..3 landmasses
  mountainDensity: number // 0..1
  oceanCoverage: number // 0.4..0.75
  climateVariability: number // 0..1
  vegetationDensity: number // 0..1
  riverDensity: number // 0..1
  islandFrequency: number // 0..1
  geologicalActivity: number // 0..1 (volcanoes, faults)
}

export const DEFAULT_PARAMS: GenParams = {
  worldSize: 300,
  continents: 1,
  mountainDensity: 0.5,
  oceanCoverage: 0.62,
  climateVariability: 0.5,
  vegetationDensity: 0.5,
  riverDensity: 0.5,
  islandFrequency: 0.5,
  geologicalActivity: 0.5,
}

export const SEA_LEVEL = 0.5
export const MAX_ELEVATION_M = 5600 // at elevation = 1.0

export function altitudeM(e: number): number {
  return e >= SEA_LEVEL ? ((e - SEA_LEVEL) / (1 - SEA_LEVEL)) * MAX_ELEVATION_M : 0
}

export function depthM(e: number): number {
  return e < SEA_LEVEL ? ((SEA_LEVEL - e) / SEA_LEVEL) * 4200 : 0
}

// --- Biomes ----------------------------------------------------------------

export const B = {
  OCEAN: 0,
  LAKE: 1,
  ICE: 2,
  TUNDRA: 3,
  BOREAL: 4,
  TEMPERATE_RAINFOREST: 5,
  TEMPERATE_FOREST: 6,
  GRASSLAND: 7,
  SHRUBLAND: 8, // mediterranean-like
  SAVANNA: 9,
  TROPICAL_RAINFOREST: 10,
  DESERT: 11,
  ALPINE_MEADOW: 12,
  ROCK: 13,
  WETLAND: 14,
} as const
export type Biome = (typeof B)[keyof typeof B]

export interface BiomeInfo {
  key: number
  name: string
  color: string
  moveCost: number
}

export const BIOMES: Record<number, BiomeInfo> = {
  [B.OCEAN]: { key: B.OCEAN, name: 'Oceano', color: '#1d3a5f', moveCost: 999 },
  [B.LAKE]: { key: B.LAKE, name: 'Lago', color: '#2d5f8a', moveCost: 6 },
  [B.ICE]: { key: B.ICE, name: 'Ghiacciaio', color: '#e8f0f5', moveCost: 5 },
  [B.TUNDRA]: { key: B.TUNDRA, name: 'Tundra', color: '#b8bfa3', moveCost: 2.4 },
  [B.BOREAL]: { key: B.BOREAL, name: 'Foresta boreale', color: '#4d6b4a', moveCost: 2.6 },
  [B.TEMPERATE_RAINFOREST]: { key: B.TEMPERATE_RAINFOREST, name: 'Foresta temperata pluviale', color: '#2f6b3d', moveCost: 3.2 },
  [B.TEMPERATE_FOREST]: { key: B.TEMPERATE_FOREST, name: 'Foresta temperata', color: '#4d8b53', moveCost: 2.6 },
  [B.GRASSLAND]: { key: B.GRASSLAND, name: 'Prateria', color: '#a6c169', moveCost: 1.2 },
  [B.SHRUBLAND]: { key: B.SHRUBLAND, name: 'Macchia mediterranea', color: '#b5a95f', moveCost: 1.6 },
  [B.SAVANNA]: { key: B.SAVANNA, name: 'Savana', color: '#c9b35c', moveCost: 1.5 },
  [B.TROPICAL_RAINFOREST]: { key: B.TROPICAL_RAINFOREST, name: 'Foresta pluviale tropicale', color: '#1e5c30', moveCost: 3.4 },
  [B.DESERT]: { key: B.DESERT, name: 'Deserto', color: '#d8c08a', moveCost: 2.4 },
  [B.ALPINE_MEADOW]: { key: B.ALPINE_MEADOW, name: 'Prateria alpina', color: '#7ba86f', moveCost: 2.6 },
  [B.ROCK]: { key: B.ROCK, name: 'Roccia nuda', color: '#8d8578', moveCost: 4.2 },
  [B.WETLAND]: { key: B.WETLAND, name: 'Palude', color: '#5c7a63', moveCost: 3.6 },
}

// --- Climate zones ---------------------------------------------------------

export const C = {
  TROPICAL: 0,
  ARID: 1,
  MEDITERRANEAN: 2,
  TEMPERATE: 3,
  CONTINENTAL: 4,
  SUBARCTIC: 5,
  POLAR: 6,
  HIGHLAND: 7,
} as const

export const CLIMATE_ZONES: Record<number, { key: number; name: string; color: string }> = {
  [C.TROPICAL]: { key: C.TROPICAL, name: 'Tropicale', color: '#d95f5f' },
  [C.ARID]: { key: C.ARID, name: 'Arido', color: '#e0a83c' },
  [C.MEDITERRANEAN]: { key: C.MEDITERRANEAN, name: 'Mediterraneo', color: '#d9c94e' },
  [C.TEMPERATE]: { key: C.TEMPERATE, name: 'Temperato', color: '#59b06a' },
  [C.CONTINENTAL]: { key: C.CONTINENTAL, name: 'Continentale', color: '#4a8fb0' },
  [C.SUBARCTIC]: { key: C.SUBARCTIC, name: 'Subartico', color: '#7a7ab5' },
  [C.POLAR]: { key: C.POLAR, name: 'Polare', color: '#c9d9e8' },
  [C.HIGHLAND]: { key: C.HIGHLAND, name: 'Alpino', color: '#9a6fb8' },
}

// --- Geology ---------------------------------------------------------------

export const G = {
  SEDIMENTARY: 0,
  IGNEOUS: 1,
  METAMORPHIC: 2,
  VOLCANIC: 3,
} as const

export const GEOLOGIES: Record<number, { key: number; name: string; color: string; pattern: string }> = {
  [G.SEDIMENTARY]: { key: G.SEDIMENTARY, name: 'Sedimentaria', color: '#c9b389', pattern: 'stratificata' },
  [G.IGNEOUS]: { key: G.IGNEOUS, name: 'Igneous (plutonica)', color: '#a5768a', pattern: 'cristallina' },
  [G.METAMORPHIC]: { key: G.METAMORPHIC, name: 'Metamorfica', color: '#7a8ba3', pattern: 'scistosa' },
  [G.VOLCANIC]: { key: G.VOLCANIC, name: 'Vulcanica', color: '#8a4a3a', pattern: 'effusiva' },
}

// --- Resources -------------------------------------------------------------

export const R = {
  NONE: 0,
  IRON: 1,
  COPPER: 2,
  GOLD: 3,
  COAL: 4,
  SALT: 5,
  TIMBER: 6,
  FERTILE_SOIL: 7,
  FRESHWATER: 8,
  STONE: 9,
  RARE_MINERALS: 10,
} as const

export const RESOURCES: Record<number, { key: number; name: string; color: string }> = {
  [R.IRON]: { key: R.IRON, name: 'Ferro', color: '#7d6b60' },
  [R.COPPER]: { key: R.COPPER, name: 'Rame', color: '#b8743a' },
  [R.GOLD]: { key: R.GOLD, name: 'Oro', color: '#d4a017' },
  [R.COAL]: { key: R.COAL, name: 'Carbone', color: '#3a3a3a' },
  [R.SALT]: { key: R.SALT, name: 'Sale', color: '#e8e8e0' },
  [R.TIMBER]: { key: R.TIMBER, name: 'Legname', color: '#5c8a4a' },
  [R.FERTILE_SOIL]: { key: R.FERTILE_SOIL, name: 'Suolo fertile', color: '#7a5c3a' },
  [R.FRESHWATER]: { key: R.FRESHWATER, name: 'Acqua dolce', color: '#4a8ab5' },
  [R.STONE]: { key: R.STONE, name: 'Pietra', color: '#9a9a8a' },
  [R.RARE_MINERALS]: { key: R.RARE_MINERALS, name: 'Minerali rari', color: '#b05aa0' },
}

// --- World schema ----------------------------------------------------------

export interface FeatureKindInfo {
  kind: string
  name: string // per il catalogo
}

export const KIND_NAMES: Record<string, string> = {
  range: 'Catena montuosa',
  peak: 'Montagna',
  volcano: 'Vulcano',
  river: 'Fiume',
  lake: 'Lago',
  desert: 'Deserto',
  forest: 'Foresta',
  island: 'Isola',
  hayland: 'Regioni erbose',
  coast: 'Linea costiera',
  pass: 'Passo montano',
  harbor: 'Porto naturale',
  ruin: 'Insediamento abbandonato',
  wetland: 'Zona umida',
  canyon: 'Canyon',
  seabasin: 'Bacino oceanico',
}

export interface Feature {
  id: number
  kind: string
  name: string
  keyTile: number // tile che rappresenta la feature
  tiles: number[] // significative (per discover check usiamo keyTile + tiles sample)
  meta: Record<string, number | string>
  // cartografia: precisione di quanto ne sappiamo
  status: 0 | 1 | 2 // 0 sconosciuta, 1 avvistata (estimated), 2 rilevata (surveyed/confirmed)
  discoveredDay: number
  discoveredX: number
  discoveredY: number
}

export interface World {
  seedStr: string
  seedNum: number
  params: GenParams
  W: number
  H: number
  elevation: Float32Array
  filled: Float32Array // depression-filled elevation (hydrology surface)
  flowDir: Int32Array // index of downhill neighbour or -1
  flowAcc: Float32Array
  riverMask: Uint8Array // 0 none, 1 river, 2 major
  lakeId: Int32Array // -1 none, else lake body index
  lakeWater: Float32Array // lake surface level per lake (invalid where lakeId<0)
  temperature: Float32Array // °C annual mean
  precipitation: Float32Array // mm/year
  climateZone: Uint8Array
  biome: Uint8Array
  geology: Uint8Array
  resource: Uint8Array // main resource
  resourceRich: Uint8Array // 0..2 richness
  watershedId: Int32Array // -1 ocean, else basin page
  landBodyId: Int32Array // continent/island body
  landDist: Int16Array // tiles from the sea
  mountains: Uint8Array // mountain belt mask (core+foreland)
  volcanic: Uint8Array
  features: Feature[]
  spawn: { x: number; y: number }
  riverId: Int32Array // feature id of river network per river tile, -1
  ancientRoads: { from: number; to: number; path: number[] }[]
  stats: WorldStats
}

export interface WorldStats {
  landTiles: number
  oceanTiles: number
  riverTiles: number
  lakeTiles: number
  highestPeakAlt: number
  highestPeakTile: number
  longRiverLength: number
  basins: number
  volcanoes: number
}

export interface SavedWorldMeta {
  id: string
  name: string
  seedStr: string
  params: GenParams
  createdAt: number
  lastPlayed: number
}

// index helpers
export function idx(x: number, y: number, W: number): number {
  return y * W + x
}
