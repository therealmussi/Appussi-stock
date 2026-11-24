import { hashSeed } from './rng'

// Gradient-value noise, seeded, plus fBm and ridged variants.
// Deterministic for a given permutation seed.

function buildPerm(seed: number): Uint8Array {
  const p = new Uint8Array(512)
  const base = new Uint8Array(256)
  for (let i = 0; i < 256; i++) base[i] = i
  // seeded shuffle (xorshift)
  let s = hashSeed('perm:' + seed) >>> 0
  const rnd = () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = base[i]
    base[i] = base[j]
    base[j] = t
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255]
  return p
}

function grad(p: Uint8Array, hx: number, hy: number, x: number, y: number): number {
  // 8-direction gradient from hash
  const g = p[p[hx & 255] + (hy & 255)] & 7
  let dx = 0
  let dy = 0
  switch (g) {
    case 0: dx = 1; dy = 0; break
    case 1: dx = -1; dy = 0; break
    case 2: dx = 0; dy = 1; break
    case 3: dx = 0; dy = -1; break
    case 4: dx = 0.7071; dy = 0.7071; break
    case 5: dx = -0.7071; dy = 0.7071; break
    case 6: dx = 0.7071; dy = -0.7071; break
    default: dx = -0.7071; dy = -0.7071; break
  }
  return dx * x + dy * y
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export class Noise {
  private p: Uint8Array
  constructor(seed: number) {
    this.p = buildPerm(seed)
  }

  value(x: number, y: number): number {
    // returns roughly -1..1
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = x0 + 1
    const y1 = y0 + 1
    const fx = x - x0
    const fy = y - y0
    const u = fade(fx)
    const v = fade(fy)
    const p = this.p
    const g00 = grad(p, p[x0 & 255], y0, fx, fy)
    const g10 = grad(p, p[x1 & 255], y0, fx - 1, fy)
    const g01 = grad(p, p[x0 & 255], y1, fx, fy - 1)
    const g11 = grad(p, p[x1 & 255], y1, fx - 1, fy - 1)
    const gx0 = g00 + u * (g10 - g00)
    const gx1 = g01 + u * (g11 - g01)
    return gx0 + v * (gx1 - gx0)
  }

  fbm(x: number, y: number, octaves: number, lacunarity = 2, gain = 0.5): number {
    let amp = 1
    let freq = 1
    let sum = 0
    let norm = 0
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.value(x * freq, y * freq)
      norm += amp
      amp *= gain
      freq *= lacunarity
    }
    return sum / norm
  }

  ridged(x: number, y: number, octaves: number, lacunarity = 2, gain = 0.5): number {
    let amp = 1
    let freq = 1
    let sum = 0
    let norm = 0
    for (let i = 0; i < octaves; i++) {
      const n = 1 - Math.abs(this.value(x * freq, y * freq))
      sum += amp * n * n
      norm += amp
      amp *= gain
      freq *= lacunarity
    }
    return sum / norm
  }
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(t: number): number {
  t = clamp(t, 0, 1)
  return t * t * (3 - 2 * t)
}
