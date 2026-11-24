import { SEA_LEVEL, type GenParams } from './types'

// Layer 5: river networks, lakes, watersheds.
// Uses priority-flood depression filling (Barnes et al. 2014), D8 flow
// directions and flow accumulation. Rivers always flow downhill and reach
// the ocean or an internal lake: no uphill rivers, no orphan drainage.

export interface HydroResult {
  filled: Float32Array
  flowDir: Int32Array
  flowAcc: Float32Array
  riverMask: Uint8Array
  lakeId: Int32Array
  lakeLevel: Float32Array
  watershedId: Int32Array
  lakeCount: number
  outlets: number[] // ocean mouths of major rivers
}

const NB = [
  { dx: 1, dy: 0, d: 1 },
  { dx: -1, dy: 0, d: 1 },
  { dx: 0, dy: 1, d: 1 },
  { dx: 0, dy: -1, d: 1 },
  { dx: 1, dy: 1, d: 1.414 },
  { dx: 1, dy: -1, d: 1.414 },
  { dx: -1, dy: 1, d: 1.414 },
  { dx: -1, dy: -1, d: 1.414 },
]

// Simple binary min-heap of (value, index)
class MinHeap {
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
    if (this.n >= this.val.length) this.grow()
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
  private grow(): void {
    const nv = new Float64Array(this.val.length * 2)
    nv.set(this.val)
    this.val = nv
    const ni = new Int32Array(this.idx.length * 2)
    ni.set(this.idx)
    this.idx = ni
  }
}

export function generateHydrology(
  elevation: Float32Array,
  precipitation: Float32Array,
  W: number,
  H: number,
  params: GenParams,
  seedNum: number,
): HydroResult {
  const N = W * H
  const { filled, parent } = floodFill(elevation, W, H)
  const flowDir = new Int32Array(N).fill(-1)
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) continue
    const p = parent[i]
    if (p >= 0 && filled[p] <= filled[i] + 1e-12) flowDir[i] = p
  }
  const flowAcc = accumulate(flowDir, filled, W, H)

  // river threshold: more rain -> more rivers
  const density = params.riverDensity
  const baseT = Math.round(95 * (1.3 - density) * (300 / W)) // tiles of upstream area
  const precipNorm = new Float32Array(N)
  let maxP = 0.0001
  for (let i = 0; i < N; i++) if (precipitation[i] > maxP) maxP = precipitation[i]
  for (let i = 0; i < N; i++) precipNorm[i] = precipitation[i] / maxP

  const riverMask = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    if (flowAcc[i] < 1) continue
    const p = 0.35 + 0.65 * precipNorm[i]
    const t = baseT / Math.max(0.35, p)
    if (flowAcc[i] >= t * 3) riverMask[i] = 2
    else if (flowAcc[i] >= t) riverMask[i] = 1
  }

  // lakes: depressions with meaningful fill and enough inflow
  const lakeId = new Int32Array(N).fill(-1)
  const lakeLevel = new Float32Array(N)
  const minFill = 0.004 + 0.002 * (1 - density)
  const minAcc = Math.max(24, baseT * 0.05)
  const candidate: number[] = []
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) continue
    if (filled[i] - elevation[i] >= minFill && flowAcc[i] >= minAcc) candidate.push(i)
  }
  // connected components of candidates -> lake bodies, keep only size >= 4
  const compOf = new Int32Array(N).fill(-1)
  const comps: number[] = []
  for (const i of candidate) {
    if (compOf[i] >= 0) continue
    const id = comps.length
    let size = 0
    const stack = [i]
    compOf[i] = id
    while (stack.length > 0) {
      const c = stack.pop() as number
      size++
      const x = c % W
      const y = (c / W) | 0
      for (const nb of NB) {
        const nx = x + nb.dx
        const ny = y + nb.dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const j = ny * W + nx
        if (
          compOf[j] < 0 &&
          elevation[j] > SEA_LEVEL &&
          filled[j] - elevation[j] >= minFill &&
          flowAcc[j] >= minAcc
        ) {
          compOf[j] = id
          stack.push(j)
        }
      }
    }
    comps.push(size)
  }
  let lakeCount = 0
  for (const size of comps) if (size >= 6) lakeCount++
  for (let i = 0; i < N; i++) {
    const c = compOf[i]
    if (c >= 0 && comps[c] >= 6) {
      lakeId[i] = c
      lakeLevel[i] = filled[i]
    }
  }

  // watersheds: flood upstream from each ocean mouth
  const watershedId = new Int32Array(N).fill(-1)
  const outlets: number[] = []
  let basin = 0
  const upstream: number[][] = buildUpstream(flowDir, N)
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) continue
    if (flowAcc[i] < 1) continue
    const fd = flowDir[i]
    if (fd < 0) continue
    if (elevation[fd] <= SEA_LEVEL && flowAcc[i] >= baseT) outlets.push(i)
  }
  // keep only well-spaced mouths (same river offset by a tile)
  const filtered: number[] = []
  for (const o of outlets) {
    const ox = o % W
    const oy = (o / W) | 0
    let near = false
    for (const f of filtered) {
      if (Math.hypot((f % W) - ox, ((f / W) | 0) - oy) < 4) near = true
    }
    if (!near) filtered.push(o)
  }
  for (const mouth of filtered) {
    const stack = [mouth]
    watershedId[mouth] = basin
    while (stack.length > 0) {
      const c = stack.pop() as number
      for (const u of upstream[c]) {
        if (watershedId[u] < 0) {
          watershedId[u] = basin
          stack.push(u)
        }
      }
    }
    basin++
  }

  return { filled, flowDir, flowAcc, riverMask, lakeId, lakeLevel, watershedId, lakeCount, outlets: filtered }
}

// priority-flood; returns filled surface plus, for each cell, the neighbour
// from which it was closed ("flow parent"). Parents form a tree rooted at the
// ocean/boundary, so routing along parents drains every land cell without
// cycles or uphill flow.
function floodFill(elev: Float32Array, W: number, H: number): { filled: Float32Array; parent: Int32Array } {
  const N = W * H
  const filled = new Float32Array(N)
  const parent = new Int32Array(N).fill(-1)
  const closed = new Uint8Array(N)
  const heap = new MinHeap(1 << 16)
  for (let i = 0; i < N; i++) {
    const x = i % W
    const y = (i / W) | 0
    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1
    if (edge || elev[i] <= SEA_LEVEL) {
      filled[i] = elev[i]
      closed[i] = 1
      heap.push(elev[i], i)
    }
  }
  for (;;) {
    const top = heap.pop()
    if (!top) break
    const i = top.i
    const x = i % W
    const y = (i / W) | 0
    for (let k = 0; k < 8; k++) {
      const nx = x + NB[k].dx
      const ny = y + NB[k].dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const j = ny * W + nx
      if (closed[j]) continue
      closed[j] = 1
      filled[j] = elev[j] > filled[i] ? elev[j] : filled[i]
      parent[j] = i
      heap.push(filled[j], j)
    }
  }
  return { filled, parent }
}

function buildUpstream(flowDir: Int32Array, N: number): number[][] {
  const up: number[][] = new Array(N)
  for (let i = 0; i < N; i++) up[i] = []
  for (let i = 0; i < N; i++) {
    const d = flowDir[i]
    if (d >= 0) up[d].push(i)
  }
  return up
}

function accumulate(flowDir: Int32Array, filled: Float32Array, W: number, H: number): Float32Array {
  const N = W * H
  const acc = new Float32Array(N).fill(1)
  // process in descending filled elevation order
  const sorted = Array.from({ length: N }, (_, i) => i).sort((a, b) => filled[b] - filled[a])
  for (const i of sorted) {
    const d = flowDir[i]
    if (d >= 0) acc[d] += acc[i]
  }
  return acc
}
