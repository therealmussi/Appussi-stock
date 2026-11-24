import { Noise, clamp } from '../core/noise'
import { G, R, SEA_LEVEL, altitudeM, B } from './types'

// Layer 8-10: geological regions and natural resources. Rock types follow
// relief and tectonic history; resources follow plausible geological rules.

export interface GeologyResult {
  geology: Uint8Array
  resource: Uint8Array
  resourceRich: Uint8Array
}

export function generateGeology(
  W: number,
  H: number,
  elevation: Float32Array,
  mountains: Uint8Array,
  volcanic: Uint8Array,
  filled: Float32Array,
  biome: Uint8Array,
  precipitation: Float32Array,
  seedNum: number,
): GeologyResult {
  const N = W * H
  const geology = new Uint8Array(N)
  const resource = new Uint8Array(N).fill(R.NONE)
  const resourceRich = new Uint8Array(N)
  const nM = new Noise((seedNum ^ 0x4d1a) >>> 0)
  const nR = new Noise((seedNum ^ 0x7a3f) >>> 0)

  for (let i = 0; i < N; i++) {
    const alt = altitudeM(elevation[i])
    if (volcanic[i]) {
      geology[i] = G.VOLCANIC
      continue
    }
    const mNoise = nM.fbm((i % W) * 0.06, ((i / W) | 0) * 0.06, 3)
    if (mountains[i]) {
      if (alt > 2600 && mNoise > 0.02) geology[i] = G.METAMORPHIC
      else if (mNoise > -0.06) geology[i] = G.IGNEOUS
      else geology[i] = G.METAMORPHIC
    } else {
      geology[i] = G.SEDIMENTARY
    }
    void filled
  }

  // resources
  for (let i = 0; i < N; i++) {
    if (elevation[i] <= SEA_LEVEL) continue
    const geo = geology[i]
    const bio = biome[i]
    const alt = altitudeM(elevation[i])
    const r1 = nR.fbm((i % W) * 0.13 + 30, ((i / W) | 0) * 0.13 + 30, 3)
    const r2 = nR.fbm((i % W) * 0.29 - 60, ((i / W) | 0) * 0.29 - 60, 2)
    let res: number = R.NONE
    let rich = 0

    if (geo === G.VOLCANIC && r2 > 0.25) {
      res = R.GOLD
      rich = r2 > 0.4 ? 2 : 1
    } else if (geo === G.METAMORPHIC) {
      if (r1 > 0.3) {
        res = R.IRON
        rich = r1 > 0.48 ? 2 : 1
      } else if (r2 > 0.42) {
        res = R.RARE_MINERALS
        rich = 1
      } else if (alt > 1700) {
        res = R.STONE
        rich = 1
      }
    } else if (geo === G.IGNEOUS) {
      if (r1 > 0.38) {
        res = R.COPPER
        rich = r1 > 0.5 ? 2 : 1
      } else if (alt > 900) {
        res = R.STONE
        rich = 1
      }
    } else {
      // sedimentary
      if (precipitation[i] < 300 && alt < 900 && filled[i] - elevation[i] > 0.004) {
        res = R.SALT // arid closed basin evaporites
        rich = r1 > 0 ? 1 : 2
      } else if (r1 > 0.4 && (bio === B.TEMPERATE_FOREST || bio === B.BOREAL)) {
        res = R.COAL
        rich = r1 > 0.55 ? 2 : 1
      } else if (r2 < -0.42 && alt < 700 && bio === B.GRASSLAND) {
        res = R.FERTILE_SOIL
        rich = 1
      }
    }
    if (res === R.NONE && bio === B.TEMPERATE_FOREST && r1 < -0.45) {
      res = R.FERTILE_SOIL
      rich = 1
    }
    if (
      res === R.NONE &&
      (bio === B.TEMPERATE_FOREST || bio === B.BOREAL || bio === B.TEMPERATE_RAINFOREST || bio === B.TROPICAL_RAINFOREST)
    ) {
      res = R.TIMBER
      rich = 1
    }
    if (res === R.NONE && r1 > 0.52 && alt > 800) {
      res = R.IRON
      rich = 1
    }
    resource[i] = res
    resourceRich[i] = rich
  }
  return { geology, resource, resourceRich }
}
