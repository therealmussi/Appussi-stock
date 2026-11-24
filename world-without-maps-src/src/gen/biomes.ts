import { B } from './types'
import { altitudeM } from './types'

// Layer 7: biome classification (Whittaker-style temperature/precipitation
// table, adjusted for altitude, water and wetlands).

export function classifyBiomes(
  W: number,
  H: number,
  elevation: Float32Array,
  temperature: Float32Array,
  precipitation: Float32Array,
  riverMask: Uint8Array,
  lakeId: Int32Array,
  vegetationDensity: number,
): Uint8Array {
  const N = W * H
  const biome = new Uint8Array(N)
  const slope = new Float32Array(N)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const dx = elevation[y * W + Math.min(W - 1, x + 1)] - elevation[y * W + Math.max(0, x - 1)]
      const dy =
        elevation[Math.min(H - 1, y + 1) * W + x] - elevation[Math.max(0, y - 1) * W + x]
      slope[i] = Math.sqrt(dx * dx + dy * dy)
    }
  }

  for (let i = 0; i < N; i++) {
    if (elevation[i] <= 0.4999) {
      biome[i] = B.OCEAN
      continue
    }
    if (lakeId[i] >= 0) {
      biome[i] = B.LAKE
      continue
    }
    const t = temperature[i]
    const p = precipitation[i] * (0.55 + 0.9 * vegetationDensity)
    const alt = altitudeM(elevation[i])
    const sl = slope[i]

    // wetlands: flat low ground with water and rain
    if (alt < 420 && sl < 0.012 && p > 620 && (riverMask[i] > 0 || nearWater(i, W, H, riverMask, lakeId))) {
      biome[i] = B.WETLAND
      continue
    }

    if (t < -6) {
      biome[i] = B.ICE
      continue
    }
    if (t < 1) {
      biome[i] = p > 220 ? B.BOREAL : B.TUNDRA
      continue
    }
    // high altitude zones
    if (alt > 4300) {
      biome[i] = B.ROCK
      continue
    }
    if (alt > 2900) {
      biome[i] = sl > 0.05 || p < 380 * (0.6 + 0.8 * vegetationDensity) ? B.ROCK : B.ALPINE_MEADOW
      continue
    }
    if (alt > 2100 && sl > 0.035) {
      biome[i] = B.ROCK
      continue
    }

    if (t < 8) {
      biome[i] = p > 340 ? B.BOREAL : B.TUNDRA
      continue
    }
    if (t < 18) {
      if (p > 2100) biome[i] = B.TEMPERATE_RAINFOREST
      else if (p > 760) biome[i] = B.TEMPERATE_FOREST
      else if (p > 380) biome[i] = B.GRASSLAND
      else if (p > 210) biome[i] = B.SHRUBLAND
      else biome[i] = B.DESERT
      continue
    }
    if (p > 1700) biome[i] = B.TROPICAL_RAINFOREST
    else if (p > 620) biome[i] = B.SAVANNA
    else if (p > 330) biome[i] = B.SHRUBLAND
    else biome[i] = B.DESERT
  }
  return biome
}

function nearWater(i: number, W: number, H: number, riverMask: Uint8Array, lakeId: Int32Array): boolean {
  const x = i % W
  const y = (i / W) | 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const j = ny * W + nx
      if (riverMask[j] > 0 || lakeId[j] >= 0) return true
    }
  }
  return false
}
