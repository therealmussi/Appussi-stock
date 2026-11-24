import { makeSeedRng, randInt, type Rng } from '../core/rng'
import {
  SEA_LEVEL,
  altitudeM,
  B,
  type Feature,
  type GenParams,
  type World,
  type WorldStats,
} from './types'
import type { Namer } from './labels'

// Feature recognition: turns raw layers into named geographic features so the
// Atlas and the missions can work with real entities of the world.

export interface FeatureResult {
  features: Feature[]
  riverId: Int32Array
  landBodyId: Int32Array
  ancientRoads: { from: number; to: number; path: number[] }[]
  spawn: { x: number; y: number }
  stats: WorldStats
}

interface Comp {
  id: number
  tiles: number[]
}

const NB8 = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
]

export function componentsOf(mask: Uint8Array, W: number, H: number, minSize: number, conn8: boolean): Comp[] {
  const N = W * H
  const seen = new Uint8Array(N)
  const comps: Comp[] = []
  const nb = conn8 ? NB8 : [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (let i = 0; i < N; i++) {
    if (!mask[i] || seen[i]) continue
    const id = comps.length
    const tiles: number[] = []
    const stack = [i]
    seen[i] = 1
    while (stack.length > 0) {
      const c = stack.pop() as number
      tiles.push(c)
      const x = c % W
      const y = (c / W) | 0
      for (const [dx, dy] of nb) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const j = ny * W + nx
        if (mask[j] && !seen[j]) {
          seen[j] = 1
          stack.push(j)
        }
      }
    }
    if (tiles.length >= minSize) comps.push({ id: comps.length, tiles })
    else {
      // keep id counter consistent but drop small comp
    }
    void id
  }
  return comps
}

function landComponents(elev: Float32Array, W: number, H: number): Comp[] {
  const N = W * H
  const mask = new Uint8Array(N)
  for (let i = 0; i < N; i++) mask[i] = elev[i] > SEA_LEVEL ? 1 : 0
  return componentsOf(mask, W, H, 4, true)
}

export function buildFeatures(w: {
  W: number
  H: number
  params: GenParams
  seedStr: string
  seedNum: number
  elevation: Float32Array
  filled: Float32Array
  flowDir: Int32Array
  flowAcc: Float32Array
  riverMask: Uint8Array
  lakeId: Int32Array
  lakeLevel: Float32Array
  watershedId: Int32Array
  temperature: Float32Array
  precipitation: Float32Array
  biome: Uint8Array
  geology: Uint8Array
  mountains: Uint8Array
  volcanic: Uint8Array
  landDist: Int16Array
  namer: Namer
  riverDensity: number
}): FeatureResult {
  const { W, H, elevation, flowDir, flowAcc, riverMask } = w
  const N = W * H
  const features: Feature[] = []
  const riverId = new Int32Array(N).fill(-1)

  const add = (kind: string, name: string, keyTile: number, tiles: number[], meta: Record<string, number | string>): Feature => {
    const f: Feature = {
      id: features.length,
      kind,
      name,
      keyTile,
      tiles,
      meta,
      status: 0,
      discoveredDay: -1,
      discoveredX: -1,
      discoveredY: -1,
    }
    features.push(f)
    return f
  }

  // --- watersheds stats
  const basinSet = new Set<number>()
  for (let i = 0; i < N; i++) if (w.watershedId[i] >= 0) basinSet.add(w.watershedId[i])

  // --- mountain ranges + passes
  const rng = makeSeedRng(w.seedStr, 331)
  const rangeComps = componentsOf(w.mountains, W, H, 18, true)
  const passFeatureIds: number[] = []
  for (const comp of rangeComps) {
    let maxE = 0
    let maxI = comp.tiles[0]
    let sumAlt = 0
    for (const t of comp.tiles) {
      sumAlt += altitudeM(elevation[t])
      if (elevation[t] > maxE) {
        maxE = elevation[t]
        maxI = t
      }
    }
    const f = add('range', w.namer.range(), maxI, comp.tiles, {
      maxAlt: Math.round(altitudeM(maxE)),
      avgAlt: Math.round(sumAlt / comp.tiles.length),
      area: comp.tiles.length,
    })
    const pass = findPass(comp, elevation, W, H)
    if (pass >= 0) {
      const pf = add('pass', w.namer.pass(), pass, [pass], {
        alt: Math.round(altitudeM(elevation[pass])),
        rangeId: f.id,
      })
      passFeatureIds.push(pf.id)
    }
  }

  // --- peaks and volcanoes
  const peakRank: { i: number; e: number }[] = []
  for (let y = 3; y < H - 3; y++) {
    for (let x = 3; x < W - 3; x++) {
      const i = y * W + x
      if (elevation[i] <= SEA_LEVEL) continue
      let isMax = true
      for (let dy = -3; dy <= 3 && isMax; dy++)
        for (let dx = -3; dx <= 3 && isMax; dx++) {
          const j = (y + dy) * W + (x + dx)
          if (elevation[j] > elevation[i]) isMax = false
          else if (elevation[j] === elevation[i] && j < i) isMax = false
        }
      if (isMax && altitudeM(elevation[i]) > 1500) peakRank.push({ i, e: elevation[i] })
    }
  }
  peakRank.sort((a, b) => b.e - a.e)
  let peakCount = 0
  const chosen: number[] = []
  for (const p of peakRank) {
    if (peakCount >= 14) break
    let near = false
    for (const c of chosen) {
      if (Math.hypot((c % W) - (p.i % W), ((c / W) | 0) - ((p.i / W) | 0)) < 8) near = true
    }
    if (near) continue
    chosen.push(p.i)
    let inVolcano = w.volcanic[p.i] === 1
    if (!inVolcano) {
      for (const [dx, dy] of NB8) {
        if (w.volcanic[(p.i % W) + dx + (((p.i / W) | 0) + dy) * W]) inVolcano = true
      }
    }
    if (inVolcano) {
      add('volcano', w.namer.volcano(), p.i, [p.i], {
        alt: Math.round(altitudeM(elevation[p.i])),
        activity: randInt(rng, 0, 2) === 0 ? 'dormiente' : 'attivo',
      })
    } else {
      add('peak', w.namer.peak(), p.i, [p.i], { alt: Math.round(altitudeM(elevation[p.i])) })
    }
    peakCount++
  }

  // --- river systems from ocean mouths
  const upstream: number[][] = new Array(N)
  for (let i = 0; i < N; i++) upstream[i] = []
  for (let i = 0; i < N; i++) {
    if (riverMask[i] && flowDir[i] >= 0 && flowDir[i] < N) upstream[flowDir[i]].push(i)
  }
  // find mouths: river cells flowing into ocean
  const mouths: number[] = []
  for (let i = 0; i < N; i++) {
    if (!riverMask[i]) continue
    const d = flowDir[i]
    if (d >= 0 && elevation[d] <= SEA_LEVEL) mouths.push(i)
  }
  mouths.sort((a, b) => flowAcc[b] - flowAcc[a])
  for (const mouth of mouths) {
    // trace main stem upstream
    const stem: number[] = []
    let cur = mouth
    let guard = 0
    const minSourceAcc = 60 / Math.max(0.4, w.riverDensity)
    while (guard++ < 4000) {
      stem.push(cur)
      let best = -1
      let bestAcc = minSourceAcc
      for (const u of upstream[cur]) {
        if (riverMask[u] && w.flowAcc[u] > bestAcc) {
          bestAcc = w.flowAcc[u]
          best = u
        }
      }
      if (best < 0) break
      cur = best
    }
    // label the whole network for cartography
    const fid = features.length
    const stack = stem.slice()
    while (stack.length > 0) {
      const c = stack.pop() as number
      if (riverId[c] >= 0) continue
      riverId[c] = fid
      for (const u of upstream[c]) if (riverMask[u] && riverId[u] < 0) stack.push(u)
    }
    const sourceTile = stem[stem.length - 1]
    // tributary count
    let tributaries = 0
    for (const c of stem) {
      let branches = 0
      for (const u of upstream[c]) if (riverMask[u] && riverId[u] === fid) branches++
      if (branches > 1) tributaries += branches - 1
    }
    add(
      'river',
      w.namer.river(),
      Math.round(stem.length / 2),
      stem,
      {
        lengthKm: stem.length * 12,
        sourceAlt: Math.round(altitudeM(elevation[sourceTile])),
        sourceTile,
        mouthTile: mouth,
        tributaries,
        discharge: Math.round(flowAcc[mouth] / 10),
      },
    )
  }

  // --- lakes
  const lakeMasked = new Uint8Array(N)
  for (let i = 0; i < N; i++) if (w.lakeId[i] >= 0) lakeMasked[i] = 1
  const lakeComps = componentsOf(lakeMasked, W, H, 4, true)
  for (const comp of lakeComps) {
    let depth = 0
    let outflow = 0
    for (const t of comp.tiles) {
      const d = w.lakeLevel[t] - elevation[t]
      if (d > depth) depth = d
      const fd = flowDir[t]
      if (fd >= 0 && w.lakeId[fd] < 0 && elevation[fd] > SEA_LEVEL) outflow = 1
    }
    add('lake', w.namer.lake(), comp.tiles[(comp.tiles.length / 2) | 0], comp.tiles, {
      areaKm2: comp.tiles.length * 144,
      maxDepthM: Math.round(depth * 11200),
      hasOutflow: outflow,
    })
  }

  // --- regions: deserts, forests, wetlands
  const report = (kind: string, biomeIds: number[], minSize: number, nameFn: () => string) => {
    const mask = new Uint8Array(N)
    for (let i = 0; i < N; i++) {
      if (biomeIds.includes(w.biome[i]) && elevation[i] > SEA_LEVEL) mask[i] = 1
    }
    const comps = componentsOf(mask, W, H, minSize, true)
    for (const comp of comps) {
      add(kind, nameFn(), comp.tiles[(comp.tiles.length / 2) | 0], comp.tiles, { area: comp.tiles.length })
    }
  }
  report('desert', [B.DESERT], 70, () => w.namer.desert())
  report('forest', [B.BOREAL, B.TEMPERATE_FOREST, B.TEMPERATE_RAINFOREST, B.TROPICAL_RAINFOREST], 90, () => w.namer.forest())
  report('wetland', [B.WETLAND], 14, () => w.namer.wetland())

  // --- islands (land bodies smaller than the main continent)
  const landComps = landComponents(elevation, W, H)
  const landBodyId = new Int32Array(N).fill(-1)
  let biggest = 0
  for (let c = 0; c < landComps.length; c++) {
    if (c > 0 && landComps[c].tiles.length > landComps[biggest].tiles.length) biggest = c
  }
  for (let c = 0; c < landComps.length; c++) {
    for (const t of landComps[c].tiles) landBodyId[t] = c
    const isMain = c === biggest
    const bigEnough = landComps[c].tiles.length >= 5
    if (!isMain && bigEnough) {
      add('island', w.namer.island(), landComps[c].tiles[(landComps[c].tiles.length / 2) | 0], landComps[c].tiles, {
        area: landComps[c].tiles.length,
      })
    }
  }

  // --- canyons: river stretches entrenched in high surrounding relief
  const canyonMask = new Uint8Array(N)
  const canyonWall = new Float32Array(N)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (!riverMask[i]) continue
      let wall = 0
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
          wall = Math.max(wall, elevation[ny * W + nx] - elevation[i])
        }
      }
      canyonWall[i] = wall
      if (wall >= 0.08) canyonMask[i] = 1
    }
  }
  const canyonComps = componentsOf(canyonMask, W, H, 8, true)
  for (const comp of canyonComps) {
    const riverFid = comp.tiles.find((t) => riverId[t] >= 0)
    if (riverFid === undefined) continue
    const riverFeature = features[riverId[riverFid]]
    let wallSum = 0
    for (const t of comp.tiles) wallSum += canyonWall[t]
    add('canyon', w.namer.canyon(), comp.tiles[(comp.tiles.length / 2) | 0], comp.tiles, {
      riverName: riverFeature ? riverFeature.name : '',
      depthM: Math.round(altitudeM(SEA_LEVEL + wallSum / comp.tiles.length)),
      lengthKm: comp.tiles.length * 12,
    })
  }

  // --- natural harbors: coves sheltered by relief
  let harboersPlaced = 0
  for (let t = 0; t < 1400 && harboersPlaced < 5; t++) {
    const x = randInt(rng, 4, W - 5)
    const y = randInt(rng, 4, H - 5)
    const i = y * W + x
    if (elevation[i] <= SEA_LEVEL || w.landDist[i] !== 1) continue
    if (altitudeM(elevation[i]) > 500) continue
    // ocean on one side, reliefs on the other three
    let oceanSides = 0
    let shieldSides = 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const j = (y + dy) * W + (x + dx)
      const j2 = (y + dy * 3) * W + (x + dx * 3)
      if (x + dx < 0 || y + dy < 0 || x + dx >= W || y + dy >= H) continue
      if (elevation[j] <= SEA_LEVEL && elevation[j2] <= SEA_LEVEL) oceanSides++
      else if (elevation[j] > SEA_LEVEL && altitudeM(elevation[j]) > 260) shieldSides++
    }
    if (oceanSides >= 1 && shieldSides >= 2) {
      add('harbor', w.namer.harbor(), i, [i], {})
      harboersPlaced++
    }
  }

  // --- ruins of previous inhabitants
  const ruinCandidates: number[] = []
  for (let t = 0; t < 2600 && ruinCandidates.length < 90; t++) {
    const x = randInt(rng, 5, W - 6)
    const y = randInt(rng, 5, H - 6)
    const i = y * W + x
    if (elevation[i] <= SEA_LEVEL) continue
    if (altitudeM(elevation[i]) > 850) continue
    if (w.landDist[i] > 22 || w.landDist[i] < 2) continue
    const t0 = w.temperature[i]
    if (t0 < 2 || t0 > 27) continue
    const nearRiver =
      riverMask[i] || riverMask[i - 1] || riverMask[i + 1] || riverMask[i - W] || riverMask[i + W]
    const coastal = w.landDist[i] <= 4
    if (nearRiver || coastal || rng() < 0.3) ruinCandidates.push(i)
  }
  const ruins: number[] = []
  for (const i of ruinCandidates) {
    if (ruins.length >= 8) break
    let near = false
    for (const r of ruins) {
      if (Math.hypot((r % W) - (i % W), ((r / W) | 0) - ((i / W) | 0)) < 26) near = true
    }
    if (!near) ruins.push(i)
  }
  for (const r of ruins) {
    add('ruin', w.namer.ruin(), r, [r], { era: randInt(rng, 1800, 3600) })
  }
  // ancient roads between ruin pairs
  const ancientRoads: { from: number; to: number; path: number[] }[] = []
  for (let k = 0; k + 1 < ruins.length; k += 2) {
    const a = ruins[k]
    const b = ruins[k + 1]
    const path = findAncientRoad(a, b, elevation, w.filled, W, H)
    if (path) {
      const rf = features.find((f) => f.kind === 'ruin' && f.keyTile === a)
      const rb = features.find((f) => f.kind === 'ruin' && f.keyTile === b)
      if (rf && rb) {
        rf.meta.roadTo = rb.id
        rb.meta.roadTo = rf.id
        ancientRoads.push({ from: a, to: b, path })
      }
    }
  }

  // --- spawn: a temperate coastal-ish camp
  let spawn = { x: Math.floor(W / 2), y: Math.floor(H / 2) }
  let bestSpawn = -Infinity
  for (let t = 0; t < 3000; t++) {
    const x = randInt(rng, 10, W - 11)
    const y = randInt(rng, 10, H - 11)
    const i = y * W + x
    if (elevation[i] <= SEA_LEVEL || landBodyId[i] < 0) continue
    if (landComps[landBodyId[i]].tiles.length < 400) continue
    const t0 = w.temperature[i]
    const alt = altitudeM(elevation[i])
    if (alt > 700) continue
    const bio = w.biome[i]
    const distScore = -Math.abs(w.landDist[i] - 9) * 2
    const tempScore = -Math.abs(t0 - 14) * 1.5
    const slopeScore = -oneSlope(elevation, i, W) * 800
    const bioScore =
      bio === B.GRASSLAND ? 34 :
      bio === B.TEMPERATE_FOREST ? 30 :
      bio === B.SHRUBLAND ? 22 :
      bio === B.SAVANNA ? 18 :
      bio === B.BOREAL ? 5 :
      bio === B.DESERT ? -40 : -25
    const score = distScore + tempScore + slopeScore + bioScore + rng() * 6
    if (score > bestSpawn) {
      bestSpawn = score
      spawn = { x, y }
    }
  }

  const stats: WorldStats = {
    landTiles: 0,
    oceanTiles: 0,
    riverTiles: 0,
    lakeTiles: 0,
    highestPeakAlt: 0,
    highestPeakTile: 0,
    longRiverLength: 0,
    basins: basinSet.size,
    volcanoes: 0,
  }
  for (let i = 0; i < N; i++) {
    if (elevation[i] > SEA_LEVEL) stats.landTiles++
    else stats.oceanTiles++
    if (riverMask[i]) stats.riverTiles++
    if (w.lakeId[i] >= 0) stats.lakeTiles++
  }
  for (const f of features) {
    if (f.kind === 'peak' || f.kind === 'volcano') {
      const alt = Number(f.meta.alt)
      if (alt > stats.highestPeakAlt) {
        stats.highestPeakAlt = alt
        stats.highestPeakTile = f.keyTile
      }
    }
    if (f.kind === 'volcano') stats.volcanoes++
    if (f.kind === 'river') {
      const l = Number(f.meta.lengthKm)
      if (l > stats.longRiverLength) stats.longRiverLength = l
    }
  }

  return { features, riverId, landBodyId, ancientRoads, spawn, stats }
}

function oneSlope(elev: Float32Array, i: number, W: number): number {
  return Math.max(
    Math.abs(elev[i + 1] - elev[i - 1]),
    Math.abs(elev[i + W] - elev[i - W]),
  )
}

// The lowest-elevation corridor crossing a mountain component (minimax
// Dijkstra from its western to its eastern fringe).
function findPass(comp: Comp, elevation: Float32Array, W: number, H: number): number {
  let minX = Infinity
  let maxX = -Infinity
  for (const t of comp.tiles) {
    const x = t % W
    if (x < minX) minX = x
    if (x > maxX) maxX = x
  }
  if (maxX - minX < 8) return -1
  const onComp = new Uint8Array(W * H)
  for (const t of comp.tiles) onComp[t] = 1
  // seeds: comp cells near min x and max x that have walkable land beside
  const seedsWest: number[] = []
  const isEastSeed = new Uint8Array(W * H)
  for (const t of comp.tiles) {
    const x = t % W
    if (x <= minX + 2) seedsWest.push(t)
    if (x >= maxX - 2) isEastSeed[t] = 1
  }
  const seedsEastCount = (() => {
    let n = 0
    for (const t of comp.tiles) if (isEastSeed[t]) n++
    return n
  })()
  if (seedsWest.length === 0 || seedsEastCount === 0) return -1

  // minimax Dijkstra: minimize the maximum elevation along the path
  const dist = new Float32Array(W * H).fill(Infinity)
  const parent = new Int32Array(W * H).fill(-1)
  const visited = new Uint8Array(W * H)
  const heap = new PassHeap(W * H)
  for (const s of seedsWest) {
    dist[s] = elevation[s]
    heap.push(elevation[s], s)
  }
  let bestEast = -1
  let bestCost = Infinity
  while (heap.size() > 0) {
    const top = heap.pop()
    if (!top) break
    const c = top.i
    if (visited[c]) continue
    visited[c] = 1
    const x = c % W
    const y = (c / W) | 0
    void x
    void y
    if (isEastSeed[c] && seedsEastCount > 0) {
      if (dist[c] < bestCost) {
        bestCost = dist[c]
        bestEast = c
      }
      continue
    }
    for (const [dx, dy] of NB8) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const j = ny * W + nx
      if (visited[j]) continue
      if (elevation[j] <= SEA_LEVEL) continue
      const cost = Math.max(dist[c], elevation[j])
      if (cost < dist[j] - 1e-12) {
        dist[j] = cost
        parent[j] = c
        heap.push(cost, j)
      }
    }
  }
  if (bestEast < 0) return -1
  // walk back and choose the pass tile as the lowest cell along the corridor
  let tile = bestEast
  let passTile = tile
  let lowE = elevation[tile]
  let guard = 0
  while (tile >= 0 && guard++ < 3000) {
    if (elevation[tile] < lowE) {
      lowE = elevation[tile]
      passTile = tile
    }
    if (dist[tile] === 0) break
    tile = parent[tile]
  }
  return passTile
}

class PassHeap {
  private val: Float64Array
  private idx: Int32Array
  private n = 0
  constructor(cap: number) {
    this.val = new Float64Array(cap)
    this.idx = new Int32Array(cap)
  }
  size(): number {
    return this.n
  }
  push(v: number, i: number): void {
    if (this.n >= this.val.length) return
    let c = this.n++
    this.val[c] = v
    this.idx[c] = i
    while (c > 0) {
      const p = (c - 1) >> 1
      if (this.val[p] <= this.val[c]) break
      this.swap(p, c)
      c = p
    }
  }
  pop(): { v: number; i: number } | null {
    if (this.n === 0) return null
    const v = this.val[0]
    const i = this.idx[0]
    this.n--
    if (this.n > 0) {
      this.val[0] = this.val[this.n]
      this.idx[0] = this.idx[this.n]
      let c = 0
      for (;;) {
        const l = 2 * c + 1
        const r = l + 1
        let m = c
        if (l < this.n && this.val[l] < this.val[m]) m = l
        if (r < this.n && this.val[r] < this.val[m]) m = r
        if (m === c) break
        this.swap(m, c)
        c = m
      }
    }
    return { v, i }
  }
  private swap(a: number, b: number): void {
    const tv = this.val[a]
    this.val[a] = this.val[b]
    this.val[b] = tv
    const ti = this.idx[a]
    this.idx[a] = this.idx[b]
    this.idx[b] = ti
  }
}

// Ancient roads: keep a serpent-like path between two ruins avoiding water.
function findAncientRoad(
  a: number,
  b: number,
  elevation: Float32Array,
  filled: Float32Array,
  W: number,
  H: number,
): number[] | null {
  const N = W * H
  const dist = new Float32Array(N).fill(Infinity)
  const parent = new Int32Array(N).fill(-1)
  const visited = new Uint8Array(N)
  const heap = new PassHeap(N)
  dist[a] = 0
  heap.push(0, a)
  while (heap.size() > 0) {
    const top = heap.pop()
    if (!top) break
    const c = top.i
    if (visited[c]) continue
    visited[c] = 1
    if (c === b) break
    const x = c % W
    const y = (c / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const j = ny * W + nx
      if (visited[j] || elevation[j] <= SEA_LEVEL) continue
      const dz = Math.abs(filled[j] - filled[c])
      const cost = dist[c] + 1 + dz * 220
      if (cost < dist[j]) {
        dist[j] = cost
        parent[j] = c
        heap.push(cost, j)
      }
    }
  }
  if (!visited[b]) return null
  const path: number[] = []
  let c = b
  while (c >= 0) {
    path.push(c)
    if (c === a) break
    c = parent[c]
  }
  path.reverse()
  if (path.length < 6 || path.length > 400) return null
  return path
}

export type { Rng }
