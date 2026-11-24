import { B, C, G, SEA_LEVEL, altitudeM, R, RESOURCES, GEOLOGIES, CLIMATE_ZONES } from '../gen/types'
import type { World } from '../gen/types'
import { clamp } from '../core/noise'

function hex(c: number): string {
  const s = Math.round(clamp(c, 0, 255)).toString(16)
  return s.length === 1 ? '0' + s : s
}
void hex

export function parseHex(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const HYPSO: [number, string][] = [
  [0, '#3d6b3c'],
  [0.18, '#5b7d42'],
  [0.32, '#8c9a55'],
  [0.45, '#b3a05f'],
  [0.6, '#a97e4f'],
  [0.75, '#8a684f'],
  [0.88, '#8d8578'],
  [1, '#e8e8ea'],
]

export function hypsoColor(altNorm: number): [number, number, number] {
  for (let k = 1; k < HYPSO.length; k++) {
    if (altNorm <= HYPSO[k][0]) {
      const t = (altNorm - HYPSO[k - 1][0]) / (HYPSO[k][0] - HYPSO[k - 1][0])
      return mix(parseHex(HYPSO[k - 1][1]), parseHex(HYPSO[k][1]), t)
    }
  }
  return parseHex(HYPSO[HYPSO.length - 1][1])
}

export function oceanColor(depthNorm: number): [number, number, number] {
  return mix(parseHex('#2a5a8a'), parseHex('#0a1c33'), Math.pow(clamp(depthNorm, 0, 1), 0.7))
}

export function riverColor(): [number, number, number] {
  return parseHex('#3f7fb8')
}

export const LAKE_COLOR = parseHex('#3a6fa5')
export const PARCHMENT: [number, number, number] = parseHex('#e6dcc3')
export const PARCHMENT_DARK = parseHex('#cfc2a4')

const BIOME_HEX: Record<number, string> = {
  [B.OCEAN]: '#1d3a5f',
  [B.LAKE]: '#2d5f8a',
  [B.ICE]: '#e8f0f5',
  [B.TUNDRA]: '#b8bfa3',
  [B.BOREAL]: '#4d6b4a',
  [B.TEMPERATE_RAINFOREST]: '#2f6b3d',
  [B.TEMPERATE_FOREST]: '#4d8b53',
  [B.GRASSLAND]: '#a6c169',
  [B.SHRUBLAND]: '#b5a95f',
  [B.SAVANNA]: '#c9b35c',
  [B.TROPICAL_RAINFOREST]: '#1e5c30',
  [B.DESERT]: '#d8c08a',
  [B.ALPINE_MEADOW]: '#7ba86f',
  [B.ROCK]: '#8d8578',
  [B.WETLAND]: '#5c7a63',
}

export function biomeColor(w: World, i: number): [number, number, number] {
  return parseHex(BIOME_HEX[w.biome[i]] ?? '#808080')
}

export function climateColor(w: World, i: number): [number, number, number] {
  return parseHex(CLIMATE_ZONES[w.climateZone[i]].color)
}

export function geologyColor(w: World, i: number): [number, number, number] {
  return parseHex(GEOLOGIES[w.geology[i]].color)
}

export function resourceColor(w: World, i: number): [number, number, number] {
  const res = w.resource[i]
  if (res === R.NONE) {
    const alt = altitudeM(w.elevation[i])
    return mix(parseHex('#cbbfa1'), parseHex('#a3987c'), clamp(alt / 3000, 0, 1))
  }
  const c = parseHex(RESOURCES[res].color)
  const rich = w.resourceRich[i]
  const base = parseHex('#b0a687')
  return mix(base, c, rich >= 2 ? 0.95 : 0.6)
}

const BASIN_HUES = ['#b56a6a', '#6a8ab5', '#a3b56a', '#b59a6a', '#7a6ab5', '#6ab5a3', '#b56a9a', '#8ab06a', '#6a6ab5', '#b5876a', '#55a3a3', '#aa7ab5']

export function watershedColor(w: World, i: number): [number, number, number] {
  const b = w.watershedId[i]
  if (b < 0) {
    return w.elevation[i] <= SEA_LEVEL ? oceanColor(0.6) : parseHex('#d5cbb2')
  }
  return parseHex(BASIN_HUES[b % BASIN_HUES.length])
}

export function terrainColor(w: World, i: number): [number, number, number] {
  const e = w.elevation[i]
  if (e <= SEA_LEVEL) return oceanColor((SEA_LEVEL - e) / SEA_LEVEL)
  if (w.lakeId[i] >= 0) return LAKE_COLOR
  const altNorm = clamp((e - SEA_LEVEL) / (1 - SEA_LEVEL), 0, 1)
  let c = hypsoColor(altNorm)
  const temp = w.temperature[i]
  const snow = temp < -1 || (altNorm > 0.8 && temp < 3)
  if (snow) c = mix(c, parseHex('#f2f4f6'), clamp((3 - temp) / 8, 0.4, 1))
  const bio = w.biome[i]
  if (bio === B.DESERT && altNorm < 0.35) c = mix(c, parseHex('#d8c08a'), 0.5)
  return c
}

export type BaseStyle = 'terrain' | 'vegetation' | 'climate' | 'geology' | 'resources' | 'watershed'

export function pickBaseStyle(layers: { vegetation: boolean; climate: boolean; geology: boolean; resources: boolean; watershed: boolean }): BaseStyle {
  if (layers.geology) return 'geology'
  if (layers.resources) return 'resources'
  if (layers.climate) return 'climate'
  if (layers.watershed) return 'watershed'
  if (layers.vegetation) return 'vegetation'
  return 'terrain'
}

export function basePixel(w: World, i: number, style: BaseStyle): [number, number, number] {
  const e = w.elevation[i]
  if (e <= SEA_LEVEL) return terrainColor(w, i)
  if (w.lakeId[i] >= 0 && style !== 'climate') return LAKE_COLOR
  switch (style) {
    case 'terrain':
      return terrainColor(w, i)
    case 'vegetation':
      return biomeColor(w, i)
    case 'climate':
      return climateColor(w, i)
    case 'geology':
      return geologyColor(w, i)
    case 'resources':
      return resourceColor(w, i)
    case 'watershed':
      return watershedColor(w, i)
    default:
      return terrainColor(w, i)
  }
}

export function hillshadeAt(w: World, i: number): number {
  const x = i % w.W
  const y = (i / w.W) | 0
  if (x <= 0 || y <= 0 || x >= w.W - 1 || y >= w.H - 1) return 1
  const dzdx = w.elevation[i + 1] - w.elevation[i - 1]
  const dzdy = w.elevation[i + w.W] - w.elevation[i - w.W]
  const shade = 1 - (dzdx + dzdy) * 5.2
  return clamp(shade, 0.62, 1.38)
}

export const GEO_G = G
export const CLIMATE_C = C
