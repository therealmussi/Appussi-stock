import { SEA_LEVEL, B } from '../gen/types'
import type { World } from '../gen/types'
import { X_OBSERVED, X_SURVEYED, TILE_KM, type GameState, type Mission } from './state'
import { getProgress } from './logic'

// Exploration missions generated from the actual geography of this world.
// No two worlds offer the same set of objectives.

export function generateMissions(w: World): Mission[] {
  const missions: Mission[] = []
  const add = (m: Omit<Mission, 'done' | 'progress' | 'revealed'>) => {
    missions.push({ ...m, done: false, progress: 0, revealed: m.kind === 'start' })
  }

  // HIGHEST POINT
  if (w.stats.highestPeakTile >= 0) {
    const peak = w.features.find((f) => f.keyTile === w.stats.highestPeakTile && (f.kind === 'peak' || f.kind === 'volcano'))
    add({
      id: 'highest-point',
      title: 'IL PUNTO PIÙ ALTO',
      desc: 'Trova la montagna più alta di Asteria e misurane la quota con il barometro. La vetta principale del mondo resta da nominare.',
      reward: 220,
      target: w.stats.highestPeakTile,
      targetLabel: peak ? peak.name : 'vetta maggiore',
      kind: 'summit',
    })
  }

  // SOURCE OF THE LONGEST RIVER
  const rivers = w.features.filter((f) => f.kind === 'river')
  rivers.sort((a, b) => Number(b.meta.lengthKm) - Number(a.meta.lengthKm))
  if (rivers.length > 0 && Number(rivers[0].meta.lengthKm) > 150) {
    add({
      id: 'river-source',
      title: 'LA SORGENTE DEL FIUME',
      desc: `Risali il fiume più lungo del mondo conosciuto fino alla sorgente e mappa il suo bacino. Lunghezza stimata: ${Number(rivers[0].meta.lengthKm)} km.`,
      reward: 200,
      target: Number(rivers[0].meta.sourceTile),
      targetLabel: 'sorgente principale',
      kind: 'source',
    })
  }

  // UNKNOWN PASS
  const passes = w.features.filter((f) => f.kind === 'pass')
  if (passes.length > 0) {
    const pass = passes[0]
    const rangeF = w.features.find((f) => f.id === Number(pass.meta.rangeId))
    add({
      id: 'unknown-pass',
      title: 'IL PASSO SCONOSCIUTO',
      desc: `Scopri un valico attraversabile nella regione montuosa maggiore e documentane la quota (${Number(pass.meta.alt)} m circa, da confermare).`,
      reward: 160,
      target: pass.keyTile,
      targetLabel: rangeF ? ` Passo attraverso ${rangeF.name}` : 'passo di montagna',
      kind: 'pass',
    })
  }

  // GREAT WATERSHED: boundary between the two largest basins
  const boundary = findWatershedBoundary(w)
  if (boundary >= 0) {
    add({
      id: 'watershed',
      title: 'IL GRANDE SPLIT ACQUEO',
      desc: 'Identifica lo spartiacque che separa i due maggiori bacini idrografici di Asteria e mappalo con un rilievo.',
      reward: 180,
      target: boundary,
      targetLabel: 'spartiacque principale',
      kind: 'watershed',
    })
  }

  // DESERT EDGE
  const deserts = w.features.filter((f) => f.kind === 'desert').sort((a, b) => Number(b.meta.area) - Number(a.meta.area))
  if (deserts.length > 0) {
    const edge = findEcotone(w, deserts[0].tiles, B.DESERT, [B.GRASSLAND, B.SHRUBLAND, B.SAVANNA, B.TEMPERATE_FOREST])
    if (edge >= 0) {
      add({
        id: 'desert-edge',
        title: 'IL CONFINE DEL DESERTO',
        desc: `Mappa la transizione tra ${deserts[0].name} e gli ecosistemi temperati confinanti.`,
        reward: 140,
        target: edge,
        targetLabel: 'margine arido',
        kind: 'ecotone',
      })
    }
  }

  // LOST ISLAND
  const islands = w.features
    .filter((f) => f.kind === 'island')
    .sort((a, b) => Number(b.meta.area) - Number(a.meta.area))
  if (islands.length > 0) {
    add({
      id: 'lost-island',
      title: "L'ISOLA DIMENTICATA",
      desc: `Un'emergenza terrestre è stata segnalata al largo. Localizza e indaga la geografia di ${islands[0].name} (stima: ${Math.round(Number(islands[0].meta.area) * TILE_KM * TILE_KM)} km²).`,
      reward: 170,
      target: islands[0].keyTile,
      targetLabel: 'isola maggiore',
      kind: 'island',
    })
  }

  // COASTAL SURVEY: a cape far from spawn
  const cape = findRemoteCape(w)
  if (cape >= 0) {
    add({
      id: 'coast-survey',
      title: 'RILEVAMENTO COSTIERO',
      desc: 'Prodotto una mappa affidabile di una linea di costa remota: completa il rilievo attorno al capo individuato.',
      reward: 150,
      target: cape,
      targetLabel: 'capo remoto',
      kind: 'coast',
    })
  }

  // ANCIENT ROUTE
  const ruinF = w.features.filter((f) => f.kind === 'ruin')
  if (ruinF.length >= 2) {
    add({
      id: 'ancient-route',
      title: 'LA VIA ANTICA',
      desc: 'Il continente custodisce tracce di chi ci è vissuto prima. Scopri due insediamenti abbandonati collegati e mappa la via che li unisce.',
      reward: 190,
      target: ruinF[0].keyTile,
      targetLabel: 'traccia antica',
      kind: 'ancient',
    })
  }

  return missions
}

function findWatershedBoundary(w: World): number {
  const sizes = new Map<number, number>()
  for (let i = 0; i < w.W * w.H; i++) {
    const b = w.watershedId[i]
    if (b >= 0) sizes.set(b, (sizes.get(b) ?? 0) + 1)
  }
  const sorted = [...sizes.entries()].sort((a, b) => b[1] - a[1])
  if (sorted.length < 2) return -1
  const [aB, bB] = [sorted[0][0], sorted[1][0]]
  for (let y = 1; y < w.H - 1; y++) {
    for (let x = 1; x < w.W - 1; x++) {
      const i = y * w.W + x
      if (w.watershedId[i] !== aB) continue
      if (w.elevation[i] <= SEA_LEVEL) continue
      for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
        const j = (y + dy) * w.W + (x + dx)
        if (w.watershedId[j] === bB && w.elevation[j] > SEA_LEVEL) return i
      }
    }
  }
  return -1
}

function findEcotone(w: World, tiles: number[], from: number, to: number[]): number {
  for (const t of tiles) {
    const x = t % w.W
    const y = (t / w.W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const j = (y + dy) * w.W + (x + dx)
      if (x + dx < 0 || y + dy < 0 || x + dx >= w.W || y + dy >= w.H) continue
      if (to.includes(w.biome[j])) return t
    }
  }
  return -1
}

function findRemoteCape(w: World): number {
  const sx = w.spawn.x
  const sy = w.spawn.y
  let best = -1
  let bestScore = -Infinity
  for (let y = 8; y < w.H - 8; y++) {
    for (let x = 8; x < w.W - 8; x++) {
      const i = y * w.W + x
      const e = w.elevation[i]
      if (e <= SEA_LEVEL || e > SEA_LEVEL + 0.03) continue
      let ocean = 0
      let land = 0
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const j = (y + dy) * w.W + (x + dx)
        if (w.elevation[j] <= SEA_LEVEL) ocean++
        else land++
      }
      if (ocean < 3 || land < 1) continue
      const d = Math.hypot(x - sx, y - sy)
      const score = d / 40 + ocean
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    }
  }
  return best
}

// --- progress tracking ------------------------------------------------------

export interface MissionUpdate {
  missions: Mission[]
  completed: Mission[]
  journal: string[]
}

const SURVEY_RADIUS = 9

export function updateMissions(w: World, state: GameState): MissionUpdate {
  const completed: Mission[] = []
  const journal: string[] = []
  const missions = state.missions.map((m) => {
    if (m.done) return m
    const next = { ...m }
    const p = state.player.y * w.W + state.player.x
    const distToTarget = m.target >= 0 ? Math.hypot((m.target % w.W) - state.player.x, ((m.target / w.W) | 0) - state.player.y) : 999
    next.revealed = next.revealed || isMissionRevealed(m, w, state)

    switch (m.kind) {
      case 'summit': {
        const fp = getProgress(state, featureAt(w, m.target))
        next.progress = fp.status === 2 ? 1 : fp.status === 1 ? 0.5 : 0
        if (fp.status === 2 && distToTarget < 5) {
          next.done = true
        }
        break
      }
      case 'source': {
        const fp = getProgress(state, featureAt(w, m.target))
        next.progress = fp.status === 2 ? 1 : fp.status === 1 ? 0.5 : 0
        if (fp.status === 2 && distToTarget < 5) next.done = true
        break
      }
      case 'pass': {
        const fp = getProgress(state, featureAt(w, m.target))
        next.progress = fp.status === 2 ? 1 : fp.status === 1 ? 0.5 : 0
        if (fp.status === 2 && distToTarget < 3) next.done = true
        break
      }
      case 'watershed': {
        const surveyed = countSurveyedNear(state, w, m.target, SURVEY_RADIUS, (i) => w.elevation[i] > SEA_LEVEL)
        next.progress = clamp(surveyed / 40)
        if (surveyed >= 40 && distToTarget < 10) next.done = true
        break
      }
      case 'ecotone': {
        const surveyed = countSurveyedNear(state, w, m.target, SURVEY_RADIUS, (i) => {
          const b = w.biome[i]
          return b === B.DESERT || b === B.GRASSLAND || b === B.SHRUBLAND || b === B.SAVANNA
        })
        next.progress = clamp(surveyed / 40)
        if (surveyed >= 40) next.done = true
        break
      }
      case 'island': {
        const fp = getProgress(state, featureAt(w, m.target))
        next.progress = fp.status === 2 ? 1 : fp.status === 1 ? 0.5 : 0
        if (fp.status === 2) next.done = true
        break
      }
      case 'coast': {
        const surveyed = countSurveyedNear(state, w, m.target, SURVEY_RADIUS * 1.5, (i) => w.landDist[i] <= 2)
        next.progress = clamp(surveyed / 50)
        if (surveyed >= 50) next.done = true
        break
      }
      case 'ancient': {
        const ruins = w.features.filter((f) => f.kind === 'ruin')
        const found = ruins.filter((f) => getProgress(state, f.id).status >= 2).length
        next.progress = clamp(found / Math.min(2, ruins.length))
        if (found >= 2) next.done = true
        if (found >= 1 && !m.revealed) next.revealed = true
        break
      }
    }
    if (next.done && !m.done) {
      completed.push(next)
      journal.push(`${next.title} — obiettivo completato (+${next.reward} pt)`)
    }
    return next
  })
  return { missions, completed, journal }
}

function isMissionRevealed(m: Mission, w: World, state: GameState): boolean {
  if (m.target < 0) return false
  const t = m.target
  const fid = featureAt(w, t)
  if (fid >= 0 && getProgress(state, fid).status >= 1) return true
  return state.exp[t] === X_OBSERVED || state.exp[t] === X_SURVEYED
}

function featureAt(w: World, tile: number): number {
  for (const f of w.features) {
    if (f.keyTile === tile) return f.id
    if (f.kind === 'river' && (Number(f.meta.sourceTile) === tile || Number(f.meta.mouthTile) === tile)) return f.id
    if (f.tiles.length <= 40 && f.tiles.includes(tile)) return f.id
  }
  return -1
}

function countSurveyedNear(state: GameState, w: World, tile: number, radius: number, pred: (i: number) => boolean): number {
  const cx = tile % w.W
  const cy = (tile / w.W) | 0
  let c = 0
  for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
    for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
      const x = cx + dx
      const y = cy + dy
      if (x < 0 || y < 0 || x >= w.W || y >= w.H) continue
      if (Math.hypot(dx, dy) > radius) continue
      const i = y * w.W + x
      if (pred(i) && state.exp[i] === X_SURVEYED) c++
    }
  }
  return c
}

function clamp(v: number, lo = 0, hi = 1): number {
  return v < lo ? lo : v > hi ? hi : v
}

// atlas completion
export function atlasCompletion(w: World, state: GameState): number {
  let land = 0
  for (let i = 0; i < w.W * w.H; i++) if (w.elevation[i] > SEA_LEVEL) land++
  const surveyed = Math.min(1, state.tilesSurveyed / Math.max(1, land))
  const zones = Object.keys(state.zoneSurveyed).length / 8
  const biomes = new Set<number>().size
  void biomes
  const featureCount = w.features.length
  let disc = 0
  for (const f of w.features) if (getProgress(state, f.id).status >= 1) disc++
  return clamp(surveyed * 0.5 + (disc / Math.max(1, featureCount)) * 0.25 + zones * 0.25)
}

