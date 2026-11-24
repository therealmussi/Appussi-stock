import { Noise, clamp, lerp } from '../core/noise'
import { makeSeedRng, randInt } from '../core/rng'
import { SEA_LEVEL, type GenParams } from './types'

// Layer 1-4: continental masses, elevation, mountain ranges (tectonic belts),
// volcanic regions. The same seed always yields the same terrain.

export interface TerrainResult {
  W: number
  H: number
  elevation: Float32Array
  mountains: Uint8Array
  volcanic: Uint8Array
  plateStrength: Float32Array
}

export function generateTerrain(seedNum: number, params: GenParams): TerrainResult {
  const W = params.worldSize
  const H = Math.round((W * 2) / 3)
  const N = W * H
  const elevation = new Float32Array(N)
  const mountains = new Uint8Array(N)
  const volcanic = new Uint8Array(N)
  const plateStrength = new Float32Array(N)

  const nBase = new Noise(seedNum ^ 0x51ed)
  const nMtn = new Noise((seedNum ^ 0x9e37) >>> 0)
  const nMtn2 = new Noise((seedNum ^ 0x7f4a) >>> 0)
  const nPlate = new Noise((seedNum ^ 0xc0de) >>> 0)
  const nWarp = new Noise((seedNum ^ 0x2ff1) >>> 0)
  const nDetail = new Noise((seedNum ^ 0x3c10) >>> 0)
  const rng = makeSeedRng(String(seedNum), 7717)

  const freqC = lerp(2.6, 4.6, clamp(params.continents, 0, 1)) / W
  const freqM = 5.2 / W
  const mtnT = 0.735 - params.mountainDensity * 0.06 // ridged threshold

  // Domain-warped continentalness
  const cont = new Float32Array(N)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const wx = nWarp.value(x * freqC * 2 + 11.3, y * freqC * 2 - 7.9) * 0.25
      const wy = nWarp.value(x * freqC * 2 - 4.2, y * freqC * 2 + 9.1) * 0.25
      let c = nBase.fbm((x + wx * W) * freqC, (y + wy * W) * freqC, 5)
      // elliptical edge falloff so the continent is surrounded by ocean
      const dx = (x / W - 0.5) * 2
      const dy = (y / H - 0.5) * 2
      const d = Math.sqrt(dx * dx + dy * dy)
      c -= Math.pow(clamp(d - 0.34, 0, 1.4), 2) * 1.5
      cont[i] = c
    }
  }

  // Threshold by quantile to hit the requested ocean coverage
  const sampleN = Math.min(N, 20000)
  const step = Math.max(1, Math.floor(N / sampleN))
  const vals: number[] = []
  for (let i = rng() & 1023; i < N; i += step) vals.push(cont[i])
  vals.sort((a, b) => a - b)
  const q = clamp(params.oceanCoverage, 0.2, 0.85)
  const thresh = vals[Math.floor(q * vals.length)] ?? 0
  const maxC = vals[vals.length - 1]

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const c = cont[i]
      // tectonic plate strength: where belts can rise
      const plate = clamp(0.5 + 0.5 * nPlate.fbm(x * 6.5 / W, y * 6.5 / W, 2), 0, 1)
      plateStrength[i] = plate
      if (c <= thresh) {
        // ocean basin with depth variation
        const depth = clamp((thresh - c) / (thresh + 0.0001), 0, 1)
        elevation[i] = SEA_LEVEL - 0.34 * (0.35 + 0.65 * depth) - 0.05 * nDetail.fbm(x * 0.05, y * 0.05, 2)
        continue
      }
      // land base
      let hh = clamp((c - thresh) / Math.max(0.05, maxC - thresh), 0, 1)
      const detailD = 0.5 + 0.5 * nDetail.fbm(x * 16 / W, y * 16 / W, 4)
      let e = SEA_LEVEL + 0.42 * Math.pow(hh, 1.25) * (0.5 + 0.5 * detailD)
      // leggere colline
      e += 0.022 * nDetail.fbm(x * 42 / W + 31, y * 42 / W - 17, 3)

      // ridged mountain belts, warped
      const wx = nWarp.value(x * freqM * 3 - 21, y * freqM * 3 + 13) * 1.6
      const wy = nWarp.value(x * freqM * 3 + 8, y * freqM * 3 - 33) * 1.6
      const r = clamp(nMtn.ridged((x + wx * W) * freqM, (y + wy * W) * freqM, 4), 0, 1)
      const r2 = clamp(nMtn2.ridged((x - wx * W) * freqM * 2.1 + 50, (y + wy * W) * freqM * 2.1 + 50, 3), 0, 1)
      const belt = (Math.max(r, r2 * 0.75) - mtnT) / (1 - mtnT)
      if (belt > 0) {
        const strength = Math.pow(clamp(belt, 0, 1), 1.5) * (0.45 + 0.55 * plate)
        e += 0.42 * strength
      }
      elevation[i] = clamp(e, SEA_LEVEL, 1)
    }
  }

  // Volcanic hotspots in high-plate oceanic or interior regions
  const nHot = Math.round(lerp(1, 6, clamp(params.geologicalActivity, 0, 1)))
  const placed: number[] = []
  for (let k = 0; k < nHot * 6 && placed.length < nHot; k++) {
    const cx = randInt(rng, 6, W - 7)
    const cy = randInt(rng, 6, H - 7)
    const ci = cy * W + cx
    const plate = plateStrength[ci]
    if (plate < 0.55 + (1 - params.geologicalActivity) * 0.25) continue
    // avoid clustering near existing volcanoes
    let tooClose = false
    for (const p of placed) {
      const d = Math.hypot((p % W) - cx, Math.floor(p / W) - cy)
      if (d < W / 5) tooClose = true
    }
    if (tooClose) continue
    // ocean island arc or inland stratovolcano
    const radius = randInt(rng, 3, 7)
    let innerLand = 0
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const j = (cy + dy) * W + (cx + dx)
        if (elevation[j] > SEA_LEVEL) innerLand++
      }
    if (innerLand > 40) continue
    for (let dy = -radius - 1; dy <= radius + 1; dy++) {
      for (let dx = -radius - 1; dx <= radius + 1; dx++) {
        const nx = cx + dx
        const ny = cy + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const j = ny * W + nx
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > radius) continue
        const cone = Math.exp(-(dist * dist) / (radius * radius * 0.25))
        const bump = lerp(elevation[j], SEA_LEVEL + 0.3, Math.min(0.85, cone * 1.05))
        elevation[j] = clamp(bump + cone * 0.25, SEA_LEVEL - 0.3, 0.98)
        if (cone > 0.25) volcanic[j] = 1
      }
    }
    placed.push(ci)
  }

  // smoothing passes: reduce coastal fringing, keep relief
  for (let pass = 0; pass < 2; pass++) {
    const elev2 = new Float32Array(elevation)
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x
        const avg =
          (elev2[i] * 4 +
            elev2[i - 1] +
            elev2[i + 1] +
            elev2[i - W] +
            elev2[i + W]) / 8
        elevation[i] = warmBlur(avg, elev2[i], 0.65)
      }
    }
  }

  // coastal smoothing: diffusion limited to the sea-level band (shelf +
  // lowland rim) so capes round off and small gulfs open up without
  // touching interior relief or the deep ocean
  for (let pass = 0; pass < 3; pass++) {
    const elev2 = new Float32Array(elevation)
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x
        const e = elev2[i]
        if (e <= SEA_LEVEL - 0.14 || e >= SEA_LEVEL + 0.14) continue
        let landN = 0
        if (elev2[i - 1] > SEA_LEVEL) landN++
        if (elev2[i + 1] > SEA_LEVEL) landN++
        if (elev2[i - W] > SEA_LEVEL) landN++
        if (elev2[i + W] > SEA_LEVEL) landN++
        const avg =
          (elev2[i] * 4 +
            elev2[i - 1] +
            elev2[i + 1] +
            elev2[i - W] +
            elev2[i + W]) / 8
        elevation[i] = warmBlur(avg, e, landN === 1 || landN === 3 ? 0.25 : 0.45)
      }
    }
  }

  // final mountain mask from resulting elevation relief
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (elevation[i] <= SEA_LEVEL) continue
      const alt = (elevation[i] - SEA_LEVEL) / 0.5
      const slope = localSlope(elevation, x, y, W, H)
      if ((alt > 0.5 && slope > 0.009) || alt > 0.78) mountains[i] = 1
    }
  }

  return { W, H, elevation, mountains, volcanic, plateStrength }
}

function warmBlur(avg: number, orig: number, bias: number): number {
  return orig * bias + avg * (1 - bias)
}

function localSlope(elev: Float32Array, x: number, y: number, W: number, H: number): number {
  let maxd = 0
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const d = Math.abs(elev[ny * W + nx] - elev[y * W + x])
      if (d > maxd) maxd = d
    }
  return maxd
}
