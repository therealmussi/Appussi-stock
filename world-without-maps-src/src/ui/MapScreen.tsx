import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { World } from '../gen/types'
import { SEA_LEVEL, altitudeM, B, BIOMES, CLIMATE_ZONES, GEOLOGIES, RESOURCES } from '../gen/types'
import type { GameState, LayerToggles } from '../game/state'
import { SEASON_NAMES, TILE_KM, seasonOf } from '../game/state'
import {
  advanceTime,
  findPath,
  getProgress,
  moveCostHours,
  observe,
  pathHours,
  pathKm,
  sightRadiusAt,
  survey,
  weatherAt,
} from '../game/logic'
import { updateMissions } from '../game/missions'
import { blankWork, renderMap, tileUnderPointer, type RenderExtras, type View } from '../render/mapDraw'
import type { Session } from './App'

type Mode = 'move' | 'measure' | 'annotate' | 'route'

const ZOOM_MIN = 1.4
const ZOOM_MAX = 26

export default function MapScreen({
  session,
  layers,
  setLayers,
  updateState,
  showToast,
  onNavigate,
}: {
  session: Session
  layers: LayerToggles
  setLayers: (l: LayerToggles) => void
  updateState: (fn: (s: GameState) => GameState) => void
  showToast: (msg: string) => void
  onNavigate: (k: 'expeditions' | 'atlas' | 'science') => void
}) {
  const { world, state } = session
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const workRef = useRef<ReturnType<typeof blankWork> | null>(null)
  const viewRef = useRef<View>({ cx: world.spawn.x, cy: world.spawn.y, scale: 6 })
  const [viewTick, setViewTick] = useState(0)
  const [mode, setMode] = useState<Mode>('move')
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const [pathPreview, setPathPreview] = useState<number[] | null>(null)
  const [queue, setQueue] = useState<number[]>([])
  const [measuring, setMeasuring] = useState<{ from: { x: number; y: number } | null; to: { x: number; y: number } | null }>({ from: null, to: null })
  const [annPoints, setAnnPoints] = useState<{ x: number; y: number }[]>([])
  const dirty = useRef(0)

  // mark render dirty on any state/layer change
  useEffect(() => {
    dirty.current++
  }, [state, layers, mode, hover, pathPreview, queue, measuring, annPoints])

  // draw loop
  useEffect(() => {
    let raf = 0
    const draw = () => {
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (canvas && wrap) {
        const dpr = window.devicePixelRatio || 1
        const w = wrap.clientWidth
        const h = wrap.clientHeight
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr
          canvas.height = h * dpr
        }
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if (!workRef.current || workRef.current.canvas.width !== world.W) {
          workRef.current = blankWork(world)
        }
        const extras: RenderExtras = { hover, measuring, pathPreview }
        renderMap(ctx, workRef.current, world, state, viewRef.current, layers, extras)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [world, state, layers, hover, pathPreview, measuring, extras_deps()])

  // travel queue executor
  useEffect(() => {
    if (queue.length === 0) return
    const timer = window.setInterval(() => {
      setQueue((q) => {
        if (q.length === 0) return q
        const step = stepOnce(q)
        return step
      })
    }, 90)
    return () => window.clearInterval(timer)
  }, [queue.length > 0])

  function stepOnce(q: number[]): number[] {
    const next = q[0]
    const rest = q.slice(1)
    if (next === undefined) return rest
    const pi = state.player.y * world.W + state.player.x
    if (next === pi) return rest
    const hours = moveCostHours(world, pi, next, state)
    if (hours < 0) {
      showToast('Terreno impraticabile: rotta interrotta.')
      return []
    }
    if (state.food <= 0 || state.water <= 0) {
      showToast('Rifornimenti esauriti: stabilisci un campo o rientra. La marcia si ferma.')
      return []
    }
    const nx = next % world.W
    const ny = (next / world.W) | 0
    let s: GameState = { ...state, player: { x: nx, y: ny }, distanceKm: state.distanceKm + TILE_KM }
    s = advanceTime(s, world, hours, [])
    const wear = BIOMES[world.biome[next]].moveCost > 2.6 ? 0.35 : 0.1
    s = { ...s, fatigue: Math.min(100, s.fatigue + hours * 0.4), equipment: Math.max(0, s.equipment - wear) }
    const { state: s2, discoveries, surveys } = observe(s, world, { x: nx, y: ny }, s.day, hours)
    const journ = [...s2.journal]
    for (const d of discoveries) {
      journ.push({ day: s2.day, kind: 'discover', text: `Avvistato: ${d.name} (${kindLabel(d.kind)})` })
    }
    for (const d of surveys) {
      journ.push({ day: s2.day, kind: 'discover', text: `Documentato: ${d.name}` })
    }
    let s3 = { ...s2, journal: journ.slice(-250) }
    const mu = updateMissions(world, s3)
    if (mu.completed.length > 0) {
      const pts = mu.completed.reduce((a, m) => a + m.reward, 0)
      s3 = { ...s3, missions: mu.missions, points: s3.points + pts }
      s3 = { ...s3, journal: [...s3.journal, ...mu.journal.map((t) => ({ day: s3.day, kind: 'mission' as const, text: t }))].slice(-250) }
      showToast(`Missione completata: +${pts} pt`)
    } else {
      s3 = { ...s3, missions: mu.missions }
    }
    if (discoveries.length > 0) {
      const d = discoveries[0]
      showToast(`Nuovo avvistamento: ${d.name}${discoveries.length > 1 ? ` (+${discoveries.length - 1} altri)` : ''}`)
    }
    updateState(() => s3)
    if (s3.food <= 0 || s3.water <= 0) {
      showToast('Rifornimenti in esaurimento: ferma la marcia e rifornisciti.')
      return []
    }
    return rest
  }

  // keyboard stepping
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      }
      const dir = dirs[e.key]
      if (dir) {
        e.preventDefault()
        const nx = state.player.x + dir[0]
        const ny = state.player.y + dir[1]
        if (nx < 0 || ny < 0 || nx >= world.W || ny >= world.H) return
        const j = ny * world.W + nx
        stepOnceRef.current([j])
      }
      if (e.key === 'Escape') {
        setQueue([])
        setPathPreview(null)
        setMode('move')
        setMeasuring({ from: null, to: null })
        setAnnPoints([])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, world])

  const stepOnceRef = useRef<(q: number[]) => void>(() => {})
  stepOnceRef.current = (q: number[]) => {
    // apply one step synchronously through the same logic
    let cur = q
    let s = state
    const next = cur[0]
    if (next === undefined) return
    const pi = s.player.y * world.W + s.player.x
    if (next === pi) cur = cur.slice(1)
    const target = cur[0]
    if (target === undefined) return
    const hours = moveCostHours(world, pi, target, s)
    if (hours < 0) {
      showToast('Terreno impraticabile.')
      return
    }
    if (s.food <= 0 || s.water <= 0) {
      showToast('Rifornimenti esauriti.')
      return
    }
    const nx = target % world.W
    const ny = (target / world.W) | 0
    let s1: GameState = { ...s, player: { x: nx, y: ny }, distanceKm: s.distanceKm + TILE_KM }
    s1 = advanceTime(s1, world, hours, [])
    const wear = BIOMES[world.biome[target]].moveCost > 2.6 ? 0.35 : 0.1
    s1 = { ...s1, fatigue: Math.min(100, s1.fatigue + hours * 0.4), equipment: Math.max(0, s1.equipment - wear) }
    const { state: s2, discoveries, surveys } = observe(s1, world, { x: nx, y: ny }, s1.day, hours)
    const journ = [...s2.journal]
    for (const d of discoveries) journ.push({ day: s2.day, kind: 'discover', text: `Avvistato: ${d.name} (${kindLabel(d.kind)})` })
    for (const d of surveys) journ.push({ day: s2.day, kind: 'discover', text: `Documentato: ${d.name}` })
    let s3 = { ...s2, journal: journ.slice(-250) }
    const mu = updateMissions(world, s3)
    if (mu.completed.length > 0) {
      const pts = mu.completed.reduce((a, m) => a + m.reward, 0)
      s3 = {
        ...s3,
        missions: mu.missions,
        points: s3.points + pts,
        journal: [...s3.journal, ...mu.journal.map((t) => ({ day: s3.day, kind: 'mission' as const, text: t }))].slice(-250),
      }
      showToast(`Missione completata: +${pts} pt`)
    } else {
      s3 = { ...s3, missions: mu.missions }
    }
    if (discoveries.length > 0) {
      showToast(`Nuovo avvistamento: ${discoveries[0].name}${discoveries.length > 1 ? ` (+${discoveries.length - 1} altri)` : ''}`)
    }
    updateState(() => s3)
    setQueue(cur.slice(1))
  }

  // pointer interactions
  const drag = useRef<{ active: boolean; moved: boolean; lx: number; ly: number }>({ active: false, moved: false, lx: 0, ly: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, moved: false, lx: e.clientX, ly: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const tile = tileUnderPointer(viewRef.current, rect.width, rect.height, e.clientX - rect.left, e.clientY - rect.top)
    setHover(tile.x >= 0 && tile.y >= 0 && tile.x < world.W && tile.y < world.H ? tile : null)
    if (drag.current.active) {
      const dx = e.clientX - drag.current.lx
      const dy = e.clientY - drag.current.ly
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true
      viewRef.current.cx -= dx / viewRef.current.scale
      viewRef.current.cy -= dy / viewRef.current.scale
      clampView()
      drag.current.lx = e.clientX
      drag.current.ly = e.clientY
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = drag.current.moved
    drag.current.active = false
    if (wasDrag) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const tile = tileUnderPointer(viewRef.current, rect.width, rect.height, e.clientX - rect.left, e.clientY - rect.top)
    if (tile.x < 0 || tile.y < 0 || tile.x >= world.W || tile.y >= world.H) return
    handleClick(tile)
  }
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const before = tileUnderPointer(viewRef.current, rect.width, rect.height, e.clientX - rect.left, e.clientY - rect.top)
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18
    viewRef.current.scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, viewRef.current.scale * factor))
    const afterOff = tileUnderPointer(viewRef.current, rect.width, rect.height, e.clientX - rect.left, e.clientY - rect.top)
    viewRef.current.cx += before.x - afterOff.x
    viewRef.current.cy += before.y - afterOff.y
    clampView()
    setViewTick((t) => t + 1)
  }
  const clampView = () => {
    const v = viewRef.current
    v.cx = Math.max(-40, Math.min(world.W + 40, v.cx))
    v.cy = Math.max(-40, Math.min(world.H + 40, v.cy))
  }

  const handleClick = (tile: { x: number; y: number }) => {
    const ti = tile.y * world.W + tile.x
    if (mode === 'move') {
      const from = state.player.y * world.W + state.player.x
      const path = findPath(world, state, from, ti)
      if (!path) {
        showToast('Nessuna rotta praticabile verso quel punto.')
        return
      }
      const est = pathHours(world, state, path)
      const km = pathKm(path)
      setPathPreview(path)
      const days = Math.ceil(est / 24)
      const ok = window.confirm(
        `Rotta di ${km} km, tempo stimato ${fmtHours(est)} (~${days} g). Cibo/water consumati lungo il cammino.\nPartire?`,
      )
      if (ok) {
        setQueue(path.slice(1))
        setPathPreview(null)
      } else {
        setPathPreview(null)
      }
    } else if (mode === 'measure') {
      if (!measuring.from || measuring.to) setMeasuring({ from: tile, to: null })
      else setMeasuring({ from: measuring.from, to: tile })
    } else if (mode === 'annotate') {
      const text = window.prompt('Etichetta sulla mappa:')
      if (text && text.trim()) {
        updateState((s) => ({
          ...s,
          annotations: [...s.annotations, { id: s.nextAnnId, x: tile.x, y: tile.y, text: text.trim(), kind: 'label' }],
          nextAnnId: s.nextAnnId + 1,
        }))
      }
      setMode('move')
    } else if (mode === 'route') {
      setAnnPoints((p) => [...p, tile])
    }
  }

  const doSurvey = () => {
    const out = survey(state, world, state.player)
    updateState(() => out.state)
    const mu = updateMissions(world, out.state)
    let s3 = { ...out.state, missions: mu.missions }
    if (mu.completed.length > 0) {
      const pts = mu.completed.reduce((a, m) => a + m.reward, 0)
      s3 = {
        ...s3,
        points: s3.points + pts,
        journal: [...s3.journal, ...mu.journal.map((t) => ({ day: s3.day, kind: 'mission' as const, text: t }))].slice(-250),
      }
      showToast(`Missioni completate: +${pts} pt`)
    }
    updateState(() => s3)
    showToast(`Rilievo: +${out.tilesDone} celle documentate (${fmtHours(out.hours)})`)
    const newSurv = out.surveys
    if (newSurv.length > 0) showToast(`Confermato: ${newSurv.map((f) => f.name).join(', ')}`)
  }

  const doCamp = () => {
    updateState((s) => {
      const leaveFood = Math.min(Math.round(s.food * 0.3), 30)
      const leaveWater = Math.min(Math.round(s.water * 0.25), 30)
      const s1: GameState = {
        ...s,
        camps: [...s.camps, { id: s.nextCampId, x: s.player.x, y: s.player.y, food: leaveFood, water: leaveWater, day: s.day }],
        nextCampId: s.nextCampId + 1,
        food: s.food - leaveFood,
        water: s.water - leaveWater,
        journal: [
          ...s.journal,
          { day: s.day, kind: 'expedition' as const, text: `Campo base ${s.nextCampId} istituito con cache (${leaveFood} cibo, ${leaveWater} acqua).` },
        ].slice(-250),
      }
      return advanceTime(s1, world, 8, [])
    })
    showToast('Campo istituito: cache di rifornimenti depositata.')
  }

  const resting = useRef(false)

  const doRest = () => {
    if (resting.current) return
    updateState((s) => {
      const s1 = { ...s, fatigue: Math.max(0, s.fatigue - 45) }
      return advanceTime(s1, world, 12, [{ day: s.day, kind: 'info' as const, text: 'Riposo al bivacco (12 ore).' }])
    })
    showToast('Riposo: 12 ore, fatica ridotta.')
  }

  const atCamp = state.camps.find((c) => c.x === state.player.x && c.y === state.player.y)
  const doResupply = () => {
    if (!atCamp) return
    updateState((s) => {
      const camps = s.camps.map((c) => (c.id === atCamp.id ? { ...c, food: 0, water: 0 } : c))
      return {
        ...s,
        camps,
        food: s.food + atCamp.food,
        water: s.water + atCamp.water,
        journal: [...s.journal, { day: s.day, kind: 'info' as const, text: `Rifornimento al campo ${atCamp.id}.` }].slice(-250),
      }
    })
    showToast(`Recuperati ${atCamp.food} cibo e ${atCamp.water} acqua dalla cache.`)
  }

  const doSample = () => {
    const pi = state.player.y * world.W + state.player.x
    updateState((s) => {
      const g = world.geology[pi]
      const samples = [...s.samples, { tile: pi, biome: world.biome[pi], geology: g, zone: world.climateZone[pi], day: s.day }]
      return {
        ...s,
        samples,
        geoSampled: { ...s.geoSampled, [g]: (s.geoSampled[g] ?? 0) + 1 },
        points: s.points + 5,
        journal: [
          ...s.journal,
          {
            day: s.day,
            kind: 'science' as const,
            text: `Campione prelevato: ${GEOLOGIES[g].name} @ ${Math.round(altitudeM(world.elevation[pi]))} m, ${BIOMES[world.biome[pi]].name}`,
          },
        ].slice(-250),
      }
    })
    advanceAfterSample()
  }

  const advanceAfterSample = () => {
    updateState((s) => advanceTime(s, world, 4, []))
  }

  const tilesSeen = useMemo(() => {
    let obs = 0
    let srv = 0
    for (let i = 0; i < state.exp.length; i++) {
      const v = state.exp[i]
      if (v === 1) obs++
      else if (v === 2) srv++
    }
    return { obs, srv }
  }, [state])

  const pIdx = state.player.y * world.W + state.player.x
  const wt = weatherAt(world, pIdx, state.day)
  const hereAlt = Math.round(altitudeM(world.elevation[pIdx]))
  const hoverIdx = hover ? hover.y * world.W + hover.x : -1
  const season = seasonOf(state.day)

  const nearbyFeatures = useMemo(() => {
    const arr: { name: string; kind: string; status: number; distTiles: number }[] = []
    for (const f of world.features) {
      const prog = state.featureProgress[f.id]
      if (!prog || prog.status === 0) continue
      const fx = f.keyTile % world.W
      const fy = (f.keyTile / world.W) | 0
      const d = Math.hypot(fx - state.player.x, fy - state.player.y)
      if (d < 60) arr.push({ name: f.name, kind: f.kind, status: prog.status, distTiles: d })
    }
    arr.sort((a, b) => a.distTiles - b.distTiles)
    return arr.slice(0, 7)
  }, [state, world])

  const surveyRadius = sightRadiusAt(world, pIdx)

  return (
    <div className="mapwrap" ref={wrapRef} data-tick={viewTick}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
      <div className="hud-top">
        <div className="hud-chip">
          <b>Giorno {Math.floor(state.day)}</b> · {SEASON_NAMES[season]} · punteggio {state.points}
        </div>
        <div className="hud-chip">
          {wt.rain ? (wt.snow ? '❄ Neve' : '🌧 Pioggia') : '☀ Sereno'} {Math.round(wt.temp)}°C
          {wt.flooded ? ' · fiumi in piena' : ''}
        </div>
        <div className="hud-chip">
          {state.food <= 0 || state.water <= 0 ? <b style={{ color: '#c96a2a' }}>RIFORNITI!</b> : <span>Cibo {Math.round(state.food)} · Acqua {Math.round(state.water)}</span>}
        </div>
      </div>

      <div className="hud-left">
        <h3>Colonne della spedizione</h3>
        <div className="kv"><span>Posizione</span><span className="coords">{fmtCoord(state.player.x, world.W)}, {fmtCoord(state.player.y, world.H)}</span></div>
        <div className="kv"><span>Quota (altimetrio)</span><span>{hereAlt} m</span></div>
        <div className="kv"><span>Territorio</span><span>{BIOMES[world.biome[pIdx]].name}</span></div>
        <div className="kv"><span>Visuale</span><span>{surveyRadius.toFixed(1)} celle</span></div>
        <div className="sect">
          <div className="bar"><div style={{ width: `${Math.min(100, state.food / 2.6)}%`, background: state.food < 25 ? '#c9792a' : '#5c8a4a' }} /></div>
          <div className="bar"><div style={{ width: `${Math.min(100, state.water / 2)}%`, background: '#4a8ab5' }} /></div>
          <div className="bar"><div style={{ width: `${state.fatigue}%`, background: state.fatigue > 70 ? '#c9402a' : '#8a7a4a' }} /></div>
          <div className="bar"><div style={{ width: `${state.equipment}%`, background: state.equipment < 30 ? '#c9402a' : '#9a8d72' }} /></div>
        </div>

        <div className="sect">
          <h3 style={{ fontSize: 12 }}>Azioni</h3>
          <div className="mode-row">
            <button className={mode === 'move' ? 'on' : ''} onClick={() => setMode('move')}>Viaggia</button>
            <button onClick={doSurvey} disabled={state.fatigue > 95 || state.food <= 0}>Rileva zona</button>
            <button onClick={doCamp}>Campo</button>
            <button onClick={doRest} disabled={state.fatigue <= 0}>Riposa 12h</button>
          </div>
          <div className="mode-row">
            <button className={mode === 'measure' ? 'on' : ''} onClick={() => { setMode('measure'); setMeasuring({ from: null, to: null }) }}>Misura distanze</button>
            <button className={mode === 'annotate' ? 'on' : ''} onClick={() => setMode('annotate')}>Etichetta</button>
            <button className={mode === 'route' ? 'on' : ''} onClick={() => { setMode('route'); setAnnPoints([]) }}>Traccia rotta</button>
            {mode === 'route' && (
              <button
                onClick={() => {
                  if (annPoints.length >= 2) {
                    updateState((s) => ({
                      ...s,
                      routes: [...s.routes, { id: s.nextRouteId, name: `Rotta ${s.nextRouteId}`, points: annPoints }],
                      nextRouteId: s.nextRouteId + 1,
                    }))
                    showToast('Rotta salvata sulla mappa.')
                  }
                  setAnnPoints([])
                  setMode('move')
                }}
              >
                Salva rotta
              </button>
            )}
          </div>
          {queue.length > 0 && (
            <div style={{ marginTop: 6 }}>
              Marcia in corso, {queue.length} celle alla tappa · <button onClick={() => setQueue([])}>Ferma</button>
            </div>
          )}
          {atCamp && (
            <div style={{ marginTop: 6, color: '#c9a227' }}>
              Sei al campo {atCamp.id} (cache: {atCamp.food} cibo / {atCamp.water} acqua) · <button onClick={doResupply}>Rifornisci</button>
            </div>
          )}
        </div>

        <div className="sect">
          <h3 style={{ fontSize: 12 }}>Stazione qui (sorvolata)</h3>
          {hover && hoverIdx >= 0 ? (
            <>
              <div className="kv"><span>Coordinate</span><span className="coords">{fmtCoord(hover.x, world.W)}, {fmtCoord(hover.y, world.H)}</span></div>
              <div className="kv"><span>Quota stimata</span><span>{knownAlt(world, state, hoverIdx)} m</span></div>
              <div className="kv"><span>Distanza</span><span>{(Math.hypot(hover.x - state.player.x, hover.y - state.player.y) * TILE_KM).toFixed(0)} km</span></div>
              <div className="kv"><span>Stato cartografico</span><span>{['inconosciuto', 'avvistato', 'rilevato'][state.exp[hoverIdx]]}</span></div>
              {state.exp[hoverIdx] === 2 && (
                <>
                  <div className="kv"><span>Bioma</span><span>{BIOMES[world.biome[hoverIdx]]?.name ?? '—'}</span></div>
                  <div className="kv"><span>Zona climatica</span><span>{CLIMATE_ZONES[world.climateZone[hoverIdx]].name}</span></div>
                  <div className="kv"><span>Geologia</span><span>{GEOLOGIES[world.geology[hoverIdx]].name}</span></div>
                  <div className="kv"><span>Risorsa</span><span>{world.resource[hoverIdx] ? RESOURCES[world.resource[hoverIdx]].name : '—'}</span></div>
                  <div className="kv"><span>Precip. annue</span><span>{Math.round(world.precipitation[hoverIdx])} mm</span></div>
                </>
              )}
            </>
          ) : (
            <div style={{ color: '#9a8d72' }}>Passa il cursore sul territorio…</div>
          )}
        </div>

        <div className="sect">
          <h3 style={{ fontSize: 12 }}>Scoperte vicine</h3>
          {nearbyFeatures.length === 0 && <div style={{ color: '#9a8d72' }}>Ancora nessuna scoperta nei paraggi.</div>}
          {nearbyFeatures.map((nf, k) => (
            <div className="kv" key={k}>
              <span>{nf.name}{nf.status === 1 ? '?' : ''}</span>
              <span className="coords">{(nf.distTiles * TILE_KM).toFixed(0)} km</span>
            </div>
          ))}
        </div>

        <div className="sect">
          <h3 style={{ fontSize: 12 }}>Strati cartografici</h3>
          <div className="layer-grid">
            {(
              [
                ['vegetation', 'Vegetazione'],
                ['climate', 'Clima'],
                ['geology', 'Geologia'],
                ['resources', 'Risorse'],
                ['watershed', 'Bacini'],
                ['contours', 'Isoipse'],
                ['grid', 'Griglia'],
                ['annotations', 'Note'],
                ['routes', 'Rotte'],
                ['labels', 'Toponimi'],
                ['hillshade', 'Ombreggiatura'],
                ['weather', 'Meteo'],
                ['fog', 'Nebbia esplor.'],
              ] as [keyof LayerToggles, string][]
            ).map(([k, label]) => (
              <label key={k}>
                <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers({ ...layers, [k]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="sect">
          <div className="kv"><span>Territorio avvistato</span><span>{tilesSeen.obs}</span></div>
          <div className="kv"><span>Territorio rilevato</span><span>{tilesSeen.srv}</span></div>
          <button style={{ width: '100%', marginTop: 6 }} onClick={() => onNavigate('atlas')}>Apri l'Atlante</button>
          <button style={{ width: '100%', marginTop: 4 }} onClick={() => onNavigate('science')}>Analisi scientifica</button>
        </div>
      </div>

      <div className="mode-row" style={{ position: 'absolute', right: 12, top: 46 }}>
        <button className="primary" onClick={doSample}>Preleva campione</button>
      </div>

      {annPoints.length > 0 && (
        <div className="toast" style={{ bottom: 12 }}>
          Rotta in tracciatura: {annPoints.length} punti. Clicca per aggiungere, poi “Salva rotta”.
        </div>
      )}
    </div>
  )
}

function extras_deps(): unknown[] {
  return []
}

export function kindLabel(kind: string): string {
  const map: Record<string, string> = {
    range: 'catena montuosa',
    peak: 'montagna',
    volcano: 'vulcano',
    river: 'fiume',
    lake: 'lago',
    desert: 'deserto',
    forest: 'foresta',
    island: 'isola',
    pass: 'passo',
    harbor: 'approdo',
    ruin: 'insediamento abbandonato',
    wetland: 'palude',
    canyon: 'canyon',
  }
  return map[kind] ?? kind
}

function fmtHours(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h${mm.toString().padStart(2, '0')}`
}

function fmtCoord(v: number, size: number): string {
  const deg = ((v / size) * 152 - 76).toFixed(2)
  return `${deg}°`
}

function knownAlt(world: World, state: GameState, i: number): string {
  if (state.exp[i] === 2) return String(Math.round(altitudeM(world.elevation[i]))) + ' (misurata)'
  if (state.exp[i] === 1) return '~' + Math.round(altitudeM(world.elevation[i]) / 200) * 200 + ' (stima)'
  return '—'
}
