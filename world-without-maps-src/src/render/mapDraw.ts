import { SEA_LEVEL, altitudeM } from '../gen/types'
import type { World } from '../gen/types'
import { clamp } from '../core/noise'
import {
  basePixel,
  hillshadeAt,
  LAKE_COLOR,
  oceanColor,
  parseHex,
  PARCHMENT,
  PARCHMENT_DARK,
  pickBaseStyle,
  riverColor,
  type BaseStyle,
} from './palette'
import type { GameState, LayerToggles, Route } from '../game/state'
import { X_SURVEYED, X_OBSERVED } from '../game/state'
import { weatherAt } from '../game/logic'

export interface View {
  cx: number
  cy: number
  scale: number
}

export interface RenderExtras {
  hover: { x: number; y: number } | null
  measuring: { from: { x: number; y: number } | null; to: { x: number; y: number } | null }
  pathPreview: number[] | null
}

const FOG_HASH = (i: number): number => {
  let x = Math.imul(i + 7, 374761393)
  x ^= x >>> 13
  x = Math.imul(x, 1274126177)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

export function renderMap(
  target: CanvasRenderingContext2D,
  work: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData },
  world: World,
  state: GameState,
  view: View,
  layers: LayerToggles,
  extras: RenderExtras,
): void {
  const { W, H } = world
  const cw = target.canvas.width
  const ch = target.canvas.height
  const style: BaseStyle = pickBaseStyle(layers)

  const img = work.img
  const data = img.data
  const day = state.day
  const N = W * H
  for (let i = 0; i < N; i++) {
    const x = i % W
    const e = world.elevation[i]
    let c: [number, number, number]
    const exp = state.exp[i]
    if (layers.fog && exp === 0) {
      const n = FOG_HASH(i)
      c = [PARCHMENT[0] - 14 * n + (x % 3), PARCHMENT[1] - 12 * n, PARCHMENT[2] - 10 * n]
    } else {
      c = basePixel(world, i, style)
      if (layers.hillshade && e > SEA_LEVEL) {
        const sh = hillshadeAt(world, i)
        c = [c[0] * sh, c[1] * sh, c[2] * sh]
      }
      if (layers.fog && exp === 1) {
        c = [c[0] * 0.42 + PARCHMENT[0] * 0.58, c[1] * 0.42 + PARCHMENT[1] * 0.58, c[2] * 0.42 + PARCHMENT[2] * 0.58]
      }
      if (layers.weather && exp > 0) {
        const wt = weatherAt(world, i, day)
        if (wt.snow) c = [c[0] * 0.75 + 64, c[1] * 0.75 + 64, c[2] * 0.75 + 64]
        else if (wt.rain) c = [c[0] * 0.82, c[1] * 0.84, c[2] * 0.92]
        if (wt.flooded && world.riverMask[i] > 0) c = [c[0] * 0.25 + 120 * 0.75, c[1] * 0.25 + 160 * 0.75, c[2] * 0.25 + 220 * 0.75]
      }
    }
    const o = i * 4
    data[o] = c[0]
    data[o + 1] = c[1]
    data[o + 2] = c[2]
    data[o + 3] = 255
  }
  work.ctx.putImageData(img, 0, 0)

  target.imageSmoothingEnabled = view.scale < 4
  target.fillStyle = '#9a8d72'
  target.fillRect(0, 0, cw, ch)
  const worldW = W * view.scale
  const worldH = H * view.scale
  const offX = cw / 2 - view.cx * view.scale
  const offY = ch / 2 - view.cy * view.scale
  target.drawImage(work.canvas, offX, offY, worldW, worldH)

  const sx = (tx: number): number => offX + (tx + 0.5) * view.scale
  const sy = (ty: number): number => offY + (ty + 0.5) * view.scale

  if (view.scale >= 4) {
    for (let i = 0; i < N; i++) {
      if (!world.riverMask[i]) continue
      if (layers.fog && state.exp[i] === 0) continue
      const fd = world.flowDir[i]
      if (fd < 0) continue
      const fx = fd % W
      const fy = (fd / W) | 0
      if (Math.abs(fx - (i % W)) > 1 || Math.abs(fy - ((i / W) | 0)) > 1) continue
      target.strokeStyle = world.riverMask[i] === 2 ? 'rgba(40,90,140,0.85)' : 'rgba(63,127,184,0.7)'
      target.lineWidth = world.riverMask[i] === 2 ? Math.max(1.2, view.scale * 0.16) : 1
      target.beginPath()
      target.moveTo(sx(i % W), sy((i / W) | 0))
      target.lineTo(sx(fx), sy(fy))
      target.stroke()
    }
  }

  if (layers.contours && view.scale >= 5) {
    target.strokeStyle = 'rgba(70,55,40,0.28)'
    target.lineWidth = 1
    const x0 = Math.max(1, Math.floor((0 - offX) / view.scale))
    const x1 = Math.min(W - 1, Math.ceil((cw - offX) / view.scale))
    const y0 = Math.max(1, Math.floor((0 - offY) / view.scale))
    const y1 = Math.min(H - 1, Math.ceil((ch - offY) / view.scale))
    target.beginPath()
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * W + x
        if (world.elevation[i] <= SEA_LEVEL) continue
        if (layers.fog && state.exp[i] !== X_SURVEYED && state.exp[i] !== X_OBSERVED) continue
        const a = Math.floor(altitudeM(world.elevation[i]) / 300)
        const rx = i + 1
        const ry = i + W
        const ax = world.elevation[rx] > SEA_LEVEL ? Math.floor(altitudeM(world.elevation[rx]) / 300) : -1
        const ay = world.elevation[ry] > SEA_LEVEL ? Math.floor(altitudeM(world.elevation[ry]) / 300) : -1
        if (ax === a && ay === a) continue
        const px = sx(x)
        const py = sy(y)
        if (ax !== a) {
          target.moveTo(px + view.scale / 2 - 1, py - 2)
          target.lineTo(px + view.scale / 2 - 1, py + 2 + view.scale * 0.2)
        }
        if (ay !== a) {
          target.moveTo(px - 2, py + view.scale / 2 - 1)
          target.lineTo(px + 2 + view.scale * 0.2, py + view.scale / 2 - 1)
        }
      }
    }
    target.stroke()
  }

  if (layers.grid) {
    target.strokeStyle = 'rgba(60,50,35,0.25)'
    target.lineWidth = 1
    target.beginPath()
    const step = 5
    for (let gx = Math.floor(Math.max(0, (0 - offX) / view.scale) / step) * step; gx < Math.min(W, (cw - offX) / view.scale); gx += step) {
      target.moveTo(sx(gx), Math.max(0, offY))
      target.lineTo(sx(gx), Math.min(ch, offY + worldH))
    }
    for (let gy = Math.floor(Math.max(0, (0 - offY) / view.scale) / step) * step; gy < Math.min(H, (ch - offY) / view.scale); gy += step) {
      target.moveTo(Math.max(0, offX), sy(gy))
      target.lineTo(Math.min(cw, offX + worldW), sy(gy))
    }
    target.stroke()
  }

  if (layers.labels) {
    target.textAlign = 'center'
    for (const f of world.features) {
      const prog = state.featureProgress[f.id]
      if (!prog || prog.status === 0) continue
      const fx = f.keyTile % W
      const fy = (f.keyTile / W) | 0
      const px = sx(fx)
      const py = sy(fy)
      if (px < -100 || py < -40 || px > cw + 100 || py > ch + 40) continue
      const confirmed = prog.status === 2
      const big = f.kind === 'range' || f.kind === 'desert' || f.kind === 'forest' || f.kind === 'river'
      target.font = confirmed ? `${big ? 'bold ' : ''}italic ${big ? 13 : 11}px Georgia, serif` : `italic ${big ? 12 : 10}px Georgia, serif`
      target.fillStyle = confirmed ? 'rgba(35,28,18,0.92)' : 'rgba(35,28,18,0.55)'
      target.strokeStyle = 'rgba(235,226,200,0.75)'
      target.lineWidth = 3
      const custom = state.renames[f.id]
      const base = custom ?? f.name
      const label = confirmed ? base : `${base}?`
      target.strokeText(label, px, py)
      target.fillText(label, px, py)
    }
  }

  if (layers.routes) {
    target.setLineDash([4, 3])
    target.strokeStyle = 'rgba(120,80,40,0.6)'
    target.lineWidth = 1.4
    for (const road of world.ancientRoads) {
      const fa = state.featureProgress[findFeatureByTile(world, road.from)]
      const fb = state.featureProgress[findFeatureByTile(world, road.to)]
      if (!fa || !fb || fa.status < 1 || fb.status < 1) continue
      target.beginPath()
      let first = true
      for (const t of road.path) {
        const tx = t % W
        const ty = (t / W) | 0
        if (layers.fog && state.exp[t] === 0) continue
        if (first) {
          target.moveTo(sx(tx), sy(ty))
          first = false
        } else target.lineTo(sx(tx), sy(ty))
      }
      target.stroke()
      target.setLineDash([])
    }
    target.setLineDash([])

    for (const r of state.routes) drawRoute(target, r, sx, sy)
  }

  for (const camp of state.camps) {
    const px = sx(camp.x)
    const py = sy(camp.y)
    target.fillStyle = '#7a4a28'
    target.beginPath()
    target.moveTo(px, py - 5)
    target.lineTo(px - 5, py + 4)
    target.lineTo(px + 5, py + 4)
    target.closePath()
    target.fill()
    target.strokeStyle = 'rgba(255,240,210,0.9)'
    target.lineWidth = 1
    target.stroke()
  }

  if (layers.annotations) {
    for (const a of state.annotations) {
      const px = sx(a.x)
      const py = sy(a.y)
      target.strokeStyle = '#8a2f2a'
      target.fillStyle = '#8a2f2a'
      target.beginPath()
      target.arc(px, py, 3, 0, Math.PI * 2)
      target.fill()
      target.font = '10px Georgia, serif'
      target.textAlign = 'left'
      target.fillText(a.text, px + 6, py - 4)
      target.textAlign = 'center'
    }
  }

  {
    const px = sx(state.player.x)
    const py = sy(state.player.y)
    target.strokeStyle = 'rgba(190,40,30,0.9)'
    target.lineWidth = 1.6
    target.beginPath()
    target.arc(px, py, Math.max(6, view.scale * 0.7), 0, Math.PI * 2)
    target.stroke()
    target.beginPath()
    target.moveTo(px - 3, py)
    target.lineTo(px + 3, py)
    target.moveTo(px, py - 3)
    target.lineTo(px, py + 3)
    target.stroke()
  }

  if (extras.pathPreview && extras.pathPreview.length > 1) {
    target.strokeStyle = 'rgba(190,60,40,0.75)'
    target.lineWidth = 1.6
    target.setLineDash([6, 4])
    target.beginPath()
    let first = true
    for (const t of extras.pathPreview) {
      const tx = t % W
      const ty = (t / W) | 0
      if (first) {
        target.moveTo(sx(tx), sy(ty))
        first = false
      } else target.lineTo(sx(tx), sy(ty))
    }
    target.stroke()
    target.setLineDash([])
  }

  if (extras.measuring.from) {
    const f = extras.measuring.from
    target.strokeStyle = '#2a2a2a'
    target.fillStyle = '#2a2a2a'
    target.beginPath()
    target.arc(sx(f.x), sy(f.y), 3.5, 0, Math.PI * 2)
    target.fill()
    if (extras.measuring.to) {
      const t = extras.measuring.to
      target.setLineDash([3, 3])
      target.lineWidth = 1.4
      target.beginPath()
      target.moveTo(sx(f.x), sy(f.y))
      target.lineTo(sx(t.x), sy(t.y))
      target.stroke()
      target.setLineDash([])
      target.beginPath()
      target.arc(sx(t.x), sy(t.y), 3.5, 0, Math.PI * 2)
      target.fill()
      const km = Math.hypot(t.x - f.x, t.y - f.y) * 12
      const midX = (sx(f.x) + sx(t.x)) / 2
      const midY = (sy(f.y) + sy(t.y)) / 2
      const dh = Math.round(altitudeM(world.elevation[t.y * W + t.x]) - altitudeM(world.elevation[f.y * W + f.x]))
      const label = `${km.toFixed(0)} km  Δh ${dh} m`
      target.font = 'bold 11px Georgia, serif'
      target.textAlign = 'center'
      target.fillStyle = 'rgba(235,226,200,0.9)'
      target.strokeStyle = 'rgba(30,25,15,0.85)'
      target.lineWidth = 3
      target.strokeText(label, midX, midY - 6)
      target.fillText(label, midX, midY - 6)
    }
  }

  drawCompass(target, cw - 56, 60)
  drawScaleBar(target, 18, ch - 26, view.scale)
}

function findFeatureByTile(world: World, tile: number): number {
  for (const f of world.features) if (f.keyTile === tile) return f.id
  return -1
}

function drawRoute(target: CanvasRenderingContext2D, r: Route, sx: (n: number) => number, sy: (n: number) => number): void {
  if (r.points.length < 2) return
  target.strokeStyle = 'rgba(150,50,50,0.8)'
  target.lineWidth = 1.6
  target.setLineDash([2, 3])
  target.beginPath()
  r.points.forEach((p, k) => {
    if (k === 0) target.moveTo(sx(p.x), sy(p.y))
    else target.lineTo(sx(p.x), sy(p.y))
  })
  target.stroke()
  target.setLineDash([])
}

function drawCompass(target: CanvasRenderingContext2D, x: number, y: number): void {
  target.save()
  target.strokeStyle = 'rgba(40,32,20,0.8)'
  target.fillStyle = 'rgba(40,32,20,0.8)'
  target.lineWidth = 1.4
  target.beginPath()
  target.arc(x, y, 18, 0, Math.PI * 2)
  target.stroke()
  target.beginPath()
  target.moveTo(x, y + 14)
  target.lineTo(x - 4, y + 4)
  target.lineTo(x, y - 14)
  target.lineTo(x + 4, y + 4)
  target.closePath()
  target.fill()
  target.font = 'bold 10px Georgia, serif'
  target.textAlign = 'center'
  target.fillText('N', x, y - 22)
  target.restore()
}

function drawScaleBar(target: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  const tiles = 8 / 12
  const width = tiles * scale
  target.fillStyle = 'rgba(30,25,15,0.85)'
  target.fillRect(x, y, width, 4)
  target.fillRect(x, y - 4, 1.5, 8)
  target.fillRect(x + width - 1.5, y - 4, 1.5, 8)
  target.font = '10px Georgia, serif'
  target.textAlign = 'left'
  target.fillText(`${Math.round(tiles * 12)} km`, x + width + 6, y + 4)
}

export function tileUnderPointer(view: View, cw: number, ch: number, mx: number, my: number): { x: number; y: number } {
  const offX = cw / 2 - view.cx * view.scale
  const offY = ch / 2 - view.cy * view.scale
  return { x: Math.floor((mx - offX) / view.scale), y: Math.floor((my - offY) / view.scale) }
}

export function blankWork(world: World): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData } {
  const canvas = document.createElement('canvas')
  canvas.width = world.W
  canvas.height = world.H
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const img = ctx.createImageData(world.W, world.H)
  return { canvas, ctx, img }
}
