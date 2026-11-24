import { Noise, clamp, lerp } from '../core/noise'
import { altitudeM } from './types'
import { B, C, SEA_LEVEL, type GenParams } from './types'

// Layer 6: climate. Temperature from latitude (rows), altitude lapse rate and
// ocean moderation. Precipitation from zonal prevailing winds carrying an
// advected moisture field: orographic lifting on windward slopes, rain
// shadows on leeward basins, convective rain near the equator.

export interface ClimateResult {
  temperature: Float32Array
  precipitation: Float32Array
  climateZone: Uint8Array
  landDist: Int16Array // distance in tiles from the sea
}

const NB4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

export function generateClimate(
  W: number,
  H: number,
  elevation: Float32Array,
  filled: Float32Array,
  biomeWetlandHint: Uint8Array | null,
  params: GenParams,
  seedNum: number,
): ClimateResult {
  const N = W * H
  const temperature = new Float32Array(N)
  const precipitation = new Float32Array(N)

  const nVar = new Noise((seedNum ^ 0x51ab) >>> 0)
  const varAmp = 2.2 * clamp(params.climateVariability, 0, 1)

  // --- temperature ---------------------------------------------------------
  for (let y = 0; y < H; y++) {
    const lat = lerp(-76, 76, y / (H - 1))
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const base = 29 - 47 * Math.pow(Math.abs(lat) / 76, 1.35)
      const jitter = nVar.fbm(x * 9 / W, y * 9 / W + 40, 3) * varAmp
      if (elevation[i] <= SEA_LEVEL) {
        temperature[i] = base + jitter * 0.6
      } else {
        const alt = altitudeM(elevation[i])
        temperature[i] = base + jitter - (alt / 1000) * 6.4
      }
    }
  }

  // --- distance from sea (continentality) ----------------------------------
  const landDist = new Int16Array(N).fill(-1)
  let frontier: number[] = []
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) {
      landDist[i] = 0
      frontier.push(i)
    }
  }
  while (frontier.length > 0) {
    const next: number[] = []
    for (const i of frontier) {
      const x = i % W
      const y = (i / W) | 0
      for (const [dx, dy] of NB4) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const j = ny * W + nx
        if (landDist[j] < 0) {
          landDist[j] = landDist[i] + 1
          next.push(j)
        }
      }
    }
    frontier = next
  }

  // --- precipitation: zonal wind moisture advection ------------------------
  // southeast trades / easterlies below 30: wind FROM east (-x)
  // westerlies 30..60: FROM west (+x)
  // polar easterlies above 60: FROM east, weak
  // for each row, sweep in wind direction
  for (let y = 0; y < H; y++) {
    const lat = lerp(-76, 76, y / (H - 1))
    const alat = Math.abs(lat)
    const fromEast = alat < 30 || alat >= 60
    const bandStrength = alat < 60 ? clamp(1 - Math.abs(alat - 25) / 60, 0.6, 1) : 0.45
    let m = 0.7
    let prevE = 0
    const step = fromEast ? -1 : 1
    for (let s = 0; s < W; s++) {
      const x = fromEast ? W - 1 - s : s
      const i = y * W + x
      if (elevation[i] <= SEA_LEVEL) {
        // open water: moisture resets towards saturation by SST
        m = clamp(0.55 + 0.5 * (temperature[i] / 30), 0.4, 1.15)
        prevE = SEA_LEVEL
        precipitation[i] += (m * 520 + 260) * bandStrength * 0.25
        continue
      }
      // evaporation from land surfaces
      const evap = clamp(0.14 + temperature[i] / 90, 0.02, 0.34)
      m = Math.min(1.3, m + evap * 0.45)
      // orographic lifting on windward gains
      const curE = filled[i]
      const dz = curE - prevE
      let p = 0
      if (dz > 0.004) {
        p += m * clamp(dz * 26, 0, 0.85) * 2600
        m -= clamp(dz * 26, 0, 0.85) * m * 0.75
      }
      // convective rain: strongest near the equator
      const conv = clamp(1 - Math.abs(lat) / 32, 0, 1)
      p += m * conv * 1400 * bandStrength
      // frontal rain at mid-high latitudes
      p += m * clamp((alat - 34) / 40, 0, 1) * 560
      // light background drizzle
      p += 120
      precipitation[i] += p * bandStrength
      m *= 0.985 // slow depletion downwind
      prevE = curE
    }
  }

  // variability: slight noise on rainfall
  for (let i = 0; i < N; i++) {
    const j = nVar.fbm(i % W * 0.05, (i / W) * 0.05 - 90, 2)
    precipitation[i] = Math.max(0, precipitation[i] * (1 + 0.18 * j))
  }

  // --- climate zones --------------------------------------------------------
  const climateZone = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    const alt = elevation[i] > SEA_LEVEL ? altitudeM(elevation[i]) : 0
    const t = temperature[i]
    const p = precipitation[i]
    climateZone[i] = classifyZone(t, p, alt, landDist[i])
  }

  void biomeWetlandHint
  void B
  return { temperature, precipitation, climateZone, landDist }
}

function classifyZone(t: number, p: number, alt: number, landDist: number): number {
  if (elevationHigh(alt)) return C.HIGHLAND
  if (t < -6) return C.POLAR
  if (t < 4) return C.SUBARCTIC
  if (p < 360) return C.ARID
  if (t >= 22) return C.TROPICAL
  if (t < 13 && landDist > 26 && p > 400 && p < 1200) return C.CONTINENTAL
  if (t >= 15 && t < 23 && p >= 340 && p < 820) return C.MEDITERRANEAN
  return C.TEMPERATE
}

function elevationHigh(alt: number): boolean {
  return alt > 2300
}
