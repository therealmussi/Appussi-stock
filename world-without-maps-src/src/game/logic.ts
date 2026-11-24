import { clamp } from '../core/noise'
import { SEA_LEVEL, altitudeM, B, BIOMES, C } from '../gen/types'
import type { World, Feature } from '../gen/types'
import {
  X_UNKNOWN,
  X_OBSERVED,
  X_SURVEYED,
  TILE_KM,
  type GameState,
  type JournalEntry,
  type PlayerPos,
} from './state'

// Core exploration logic: perception, movement, survey, time and supplies.

export const EPS_H = 1e-6

export function inBounds(w: World, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < w.W && y < w.H
}

export function isPassable(w: World, i: number): boolean {
  if (!inBounds(w, i % w.W, (i / w.W) | 0)) return false
  const b = w.biome[i]
  if (w.elevation[i] <= SEA_LEVEL && w.lakeId[i] < 0) return false
  if (b === B.OCEAN || b === B.LAKE) return false
  return true
}

// --- sight ------------------------------------------------------------------

export function sightRadiusAt(w: World, i: number): number {
  const b = w.biome[i]
  const alt = altitudeM(w.elevation[i])
  let r = 5.5
  r += clamp((alt - 500) / 900, 0, 4.5) // high ground sees far
  if (b === B.TEMPERATE_FOREST || b === B.TROPICAL_RAINFOREST || b === B.BOREAL) r -= 2
  if (b === B.ROCK) r += 1
  const onPeak = w.mountains[i] && alt > 2600
  if (onPeak) r += 3
  return Math.max(3, Math.min(14, r))
}

// --- movement ---------------------------------------------------------------

export function moveCostHours(w: World, from: number, to: number, state: GameState): number {
  const b = w.biome[to]
  if (!isPassable(w, to)) return -1
  let h = BIOMES[b] ? BIOMES[b].moveCost * 1.5 : 2
  const dz = w.filled[to] - w.filled[from]
  if (dz > 0) h += dz * 2600 // climbing costs
  else if (dz < 0) h += -dz * 700
  if (w.riverMask[to] > 0) h += 1.2 // fording
  if (state.fatigue > 70) h *= 1.45
  else if (state.fatigue > 45) h *= 1.15
  return Math.max(0.6, h)
}

// --- time & supplies --------------------------------------------------------

function hash2(i: number, k: number): number {
  let x = Math.imul(i + 1, 2654435761) ^ Math.imul(k + 1, 40503)
  x ^= x >>> 15
  x = Math.imul(x, 2246822519)
  x ^= x >>> 13
  return (x >>> 0) / 4294967296
}

export interface WeatherNow {
  temp: number
  rain: boolean
  snow: boolean
  flooded: boolean
}

export function seasonFactorFor(w: World, i: number, day: number): number {
  const year = 360
  const doy = day % year
  const lat = ((i / w.W) / (w.H - 1)) * 2 - 1 // -1..1 north..south in world rows
  const hemi = lat >= 0 ? -1 : 1 // hemisphere of this tile (rows go N->S)
  // season: 0..3 from day; summer in a hemisphere when sin peaks
  const phase = Math.sin((doy / year) * Math.PI * 2) * hemi
  const zone = w.climateZone[i]
  if (zone === C.TROPICAL) return 0.85 + 0.3 * phase ** 2
  if (zone === C.MEDITERRANEAN) return 1.0 - 0.85 * phase // dry summer
  if (zone === C.ARID) return 0.7 + 0.4 * Math.max(0, phase)
  if (zone === C.POLAR || zone === C.SUBARCTIC) return 0.9 + 0.25 * phase
  return 0.85 + 0.4 * Math.max(0, phase)
}

export function weatherAt(w: World, i: number, day: number): WeatherNow {
  const seasonP = seasonFactorFor(w, i, day)
  const baseDaily = (w.precipitation[i] * seasonP) / 365
  const wetProb = clamp(baseDaily / 38, 0.01, 0.85)
  const h = hash2(i, Math.floor(day))
  const rain = h < wetProb
  const tempNow = w.temperature[i] + 8 * seasonP - 4
  const snow = rain && tempNow < -1
  const flooded =
    w.riverMask[i] > 0 &&
    w.flowAcc[i] > 60 &&
    seasonP > 1.15 &&
    hash2(i, Math.floor(day) * 7 + 3) < 0.5
  return { temp: tempNow, rain, snow, flooded }
}

export function advanceTime(state: GameState, w: World, hours: number, journal: JournalEntry[]): GameState {
  const s = { ...state }
  s.day += hours / 24
  // consumption
  const t = w.temperature[s.player.y * w.W + s.player.x]
  const heatFactor = t > 30 ? 1.5 : 1
  s.food = clamp(s.food - hours * 0.17, 0, 260)
  s.water = clamp(s.water - hours * (0.26 * heatFactor), 0, 200)
  // terrain water: rivers/lakes/wetlands refill water
  const pIdx = s.player.y * w.W + s.player.x
  if (w.riverMask[pIdx] > 0 || w.lakeId[pIdx] >= 0 || w.biome[pIdx] === B.WETLAND) {
    s.water = clamp(s.water + hours * 3, 0, 200)
    s.equipment = clamp(s.equipment - hours * 0.12, 0, 100)
  }
  s.equipment = clamp(s.equipment - hours * 0.03, 0, 100)
  if (journal.length > 0) s.journal = [...s.journal, ...journal].slice(-250)
  return s
}

// --- perception -------------------------------------------------------------

export function observe(
  state: GameState,
  w: World,
  pos: PlayerPos,
  day: number,
  hoursPerTileHours: number,
): { state: GameState; discoveries: Feature[]; surveys: Feature[] } {
  const exp = state.exp.slice()
  const cx = pos.x
  const cy = pos.y
  const pi = cy * w.W + cx
  const radius = sightRadiusAt(w, pi)
  const discoveries: Feature[] = []
  const surveys: Feature[] = []
  let newObs = 0

  for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
    for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
      const x = cx + dx
      const y = cy + dy
      if (!inBounds(w, x, y)) continue
      const dist = Math.hypot(dx, dy)
      if (dist > radius) continue
      const i = y * w.W + x
      if (exp[i] === X_UNKNOWN) {
        exp[i] = X_OBSERVED
        newObs++
      }
    }
  }

  const ns: GameState = { ...state, exp, tilesObserved: state.tilesObserved + newObs }

  // feature observation + survey-based upgrading
  for (const f of w.features) {
    if (getProgress(ns, f.id).status >= 2) continue
    const sampled = sampledTiles(f)
    let seenObserved = false
    for (const t of sampled) {
      if (exp[t] !== X_UNKNOWN) {
        seenObserved = true
        break
      }
    }
    const keySeen = exp[f.keyTile] !== X_UNKNOWN
    if (seenObserved || keySeen) {
      if (getProgress(ns, f.id).status === 0) {
        setProgress(ns, f.id, 1, day, cx, cy)
        discoveries.push(f)
      }
    }
    // upgrade to surveyed if the key tile (or enough area) is surveyed
    if (getProgress(ns, f.id).status === 1) {
      const keySurveyed = exp[f.keyTile] === X_SURVEYED
      let frac = 0
      if (!keySurveyed && sampled.length > 3) {
        let cnt = 0
        for (const t of sampled) if (exp[t] === X_SURVEYED) cnt++
        frac = cnt / sampled.length
      }
      if (keySurveyed || frac >= 0.5) {
        setProgress(ns, f.id, 2, day, cx, cy)
        surveys.push(f)
      }
    }
  }

  void hoursPerTileHours
  return { state: ns, discoveries, surveys }
}

function sampledTiles(f: Feature): number[] {
  const n = f.tiles.length
  if (n <= 24) return f.tiles
  const stride = Math.max(1, Math.floor(n / 24))
  const out: number[] = []
  for (let k = 0; k < n; k += stride) out.push(f.tiles[k])
  return out
}

export function getProgress(state: GameState, fid: number) {
  return state.featureProgress[fid] ?? { status: 0 as const, day: -1, x: -1, y: -1 }
}

export function setProgress(state: GameState, fid: number, status: 0 | 1 | 2, day: number, x: number, y: number): void {
  state.featureProgress[fid] = { status, day, x, y }
}

// --- survey -----------------------------------------------------------------

export interface SurveyOutcome {
  state: GameState
  tilesDone: number
  hours: number
  discoveries: Feature[]
  surveys: Feature[]
  altitudeM: number
}

export function survey(state: GameState, w: World, pos: PlayerPos): SurveyOutcome {
  const exp = state.exp.slice()
  const base = { ...state, exp }
  const pi = pos.y * w.W + pos.x
  const radius = sightRadiusAt(w, pi)
  let tilesDone = 0

  for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
    for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
      const x = pos.x + dx
      const y = pos.y + dy
      if (!inBounds(w, x, y)) continue
      const dist = Math.hypot(dx, dy)
      if (dist > radius * 0.75) continue
      const i = y * w.W + x
      if (w.elevation[i] < SEA_LEVEL && w.biome[i] !== B.WETLAND) continue
      if (exp[i] !== X_SURVEYED) {
        if (exp[i] === X_UNKNOWN) base.tilesObserved++
        exp[i] = X_SURVEYED
        tilesDone++
        const zone = w.climateZone[i]
        base.zoneSurveyed[zone] = (base.zoneSurveyed[zone] ?? 0) + 1
        const bio = w.biome[i]
        base.biomeSurveyed[bio] = (base.biomeSurveyed[bio] ?? 0) + 1
      }
    }
  }

  const hours = 4 + radius * 1.3 + tilesDone * 0.05
  const alt = altitudeM(w.elevation[pi])
  const { state: after, discoveries, surveys } = observe(base, w, pos, state.day, hours)

  // survey points
  const points = tilesDone * 0.6 + discoveries.length * 12 + surveys.length * 25 + Math.round(alt / 500)
  const withPoints: GameState = { ...after, points: after.points + Math.round(points), tilesSurveyed: after.tilesSurveyed + tilesDone, fatigue: clamp(after.fatigue + hours * 0.25, 0, 100) }
  const { state: preTime, journal } = withSurveyJournal(withPoints, discoveries, surveys, tilesDone, hours, alt)
  const finalState = advanceTime(preTime, w, hours, journal)
  return { state: finalState, tilesDone, hours, discoveries, surveys, altitudeM: alt }
}

function withSurveyJournal(
  s: GameState,
  discoveries: Feature[],
  surveys: Feature[],
  tilesDone: number,
  hours: number,
  alt: number,
): { state: GameState; journal: JournalEntry[] } {
  const journal: JournalEntry[] = []
  journal.push({ day: s.day, kind: 'survey', text: `Rilievo completato: ${tilesDone} celle cartograficate, ${Math.round(alt)} m s.l.m.` })
  for (const d of discoveries) journal.push({ day: s.day, kind: 'discover', text: `Avvistato: ${KIND_LABELS[d.kind] ?? d.kind} — ${d.name}` })
  for (const d of surveys) journal.push({ day: s.day, kind: 'discover', text: `Confermato e documentato: ${d.name}` })
  void hours
  return { state: s, journal }
}

export const KIND_LABELS: Record<string, string> = {
  range: 'Catena montuosa',
  peak: 'Montagna',
  volcano: 'Vulcano',
  river: 'Fiume',
  lake: 'Lago',
  desert: 'Deserto',
  forest: 'Foresta',
  island: 'Isola',
  coast: 'Linea costiera',
  pass: 'Passo montano',
  harbor: 'Porto naturale',
  ruin: 'Insediamento abbandonato',
  wetland: 'Zona umida',
  canyon: 'Canyon',
  seabasin: 'Bacino oceanico',
  hayland: 'Regioni erbose',
}

// --- pathfinding ------------------------------------------------------------

export function findPath(w: World, state: GameState, from: number, to: number, maxNodes = 60000): number[] | null {
  if (!isPassable(w, to)) return null
  const N = w.W * w.H
  const dist = new Float64Array(N).fill(Infinity)
  const parent = new Int32Array(N).fill(-1)
  const visited = new Uint8Array(N)
  // small binary heap
  const heapI: number[] = []
  const heapD: number[] = []
  const push = (d: number, i: number) => {
    heapI.push(i)
    heapD.push(d)
    let c = heapI.length - 1
    while (c > 0) {
      const p = (c - 1) >> 1
      if (heapD[p] <= heapD[c]) break
      ;[heapD[p], heapD[c]] = [heapD[c], heapD[p]]
      ;[heapI[p], heapI[c]] = [heapI[c], heapI[p]]
      c = p
    }
  }
  const pop = (): [number, number] | null => {
    if (heapI.length === 0) return null
    const d = heapD[0]
    const i = heapI[0]
    const ld = heapD.pop() as number
    const li = heapI.pop() as number
    if (heapI.length > 0) {
      heapD[0] = ld
      heapI[0] = li
      let c = 0
      for (;;) {
        const l = 2 * c + 1
        const r = l + 1
        let m = c
        if (l < heapD.length && heapD[l] < heapD[m]) m = l
        if (r < heapD.length && heapD[r] < heapD[m]) m = r
        if (m === c) break
        ;[heapD[m], heapD[c]] = [heapD[c], heapD[m]]
        ;[heapI[m], heapI[c]] = [heapI[c], heapI[m]]
        c = m
      }
    }
    return [d, i]
  }
  let nodes = 0
  dist[from] = 0
  push(0, from)
  while (nodes < maxNodes) {
    const top = pop()
    if (!top) break
    const [d, c] = top
    if (visited[c]) continue
    visited[c] = 1
    nodes++
    if (c === to) break
    const x = c % w.W
    const y = (c / w.W) | 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx
        const ny = y + dy
        if (!inBounds(w, nx, ny)) continue
        const j = ny * w.W + nx
        if (visited[j] || !isPassable(w, j)) continue
        const stepH = moveCostHours(w, c, j, state)
        if (stepH < 0) continue
        const step = stepH + Math.hypot(dx, dy) * 0.01
        if (d + step < dist[j]) {
          dist[j] = d + step
          parent[j] = c
          push(dist[j], j)
        }
      }
    }
  }
  if (!visited[to]) return null
  const path: number[] = []
  let c = to
  while (c >= 0) {
    path.push(c)
    if (c === from) break
    c = parent[c]
  }
  path.reverse()
  return path.length > 1 ? path : null
}

export function pathHours(w: World, state: GameState, path: number[]): number {
  let h = 0
  for (let k = 1; k < path.length; k++) {
    const c = moveCostHours(w, path[k - 1], path[k], state)
    if (c < 0) return -1
    h += c
  }
  return h
}

export function pathKm(path: number[]): number {
  return (path.length - 1) * TILE_KM
}

export function climbTiles(w: World, from: number, to: number): number {
  return Math.round((w.filled[to] - w.filled[from]) * 11200)
}
