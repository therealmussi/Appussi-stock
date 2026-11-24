import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { GenParams, World } from '../gen/types'
import type { GameState, LayerToggles } from '../game/state'
import { DEFAULT_LAYERS } from '../game/state'
import { createNew, loadSaveState, saveGame } from '../game/persist'
import StartScreen from './StartScreen'
import MapScreen from './MapScreen'
import AtlasScreen from './AtlasScreen'
import ScienceScreen from './ScienceScreen'
import ExpeditionScreen from './ExpeditionScreen'
import { EquipmentScreen, JournalScreen, StatsScreen } from './SideScreens'

export interface Session {
  saveId: string
  saveName: string
  world: World
  state: GameState
}

export type ScreenKey =
  | 'map'
  | 'expeditions'
  | 'atlas'
  | 'science'
  | 'equipment'
  | 'journal'
  | 'stats'

const SCREEN_LABELS: Record<ScreenKey, string> = {
  map: 'Mappa del Mondo',
  expeditions: 'Spedizioni',
  atlas: 'Atlante',
  science: 'Analisi Scientifica',
  equipment: 'Equipaggiamento',
  journal: 'Giornale di Bordo',
  stats: 'Statistiche',
}

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('map')
  const [session, setSession] = useState<Session | null>(null)
  const [layers, setLayers] = useState<LayerToggles>({ ...DEFAULT_LAYERS })
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null)
  const lastSavedDay = useRef(-1)

  const showToast = useCallback((msg: string) => {
    setToast({ msg, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5200)
    return () => window.clearTimeout(t)
  }, [toast])

  const updateState = useCallback((fn: (s: GameState) => GameState) => {
    setSession((s) => (s ? { ...s, state: fn(s.state) } : s))
  }, [])

  // autosave once per game-day tick
  useEffect(() => {
    if (!session) return
    const day = Math.floor(session.state.day)
    if (day > lastSavedDay.current) {
      lastSavedDay.current = day
      saveGame(
        {
          name: session.saveName,
          worldName: session.state.worldName,
          seedStr: session.state.seedStr,
          params: session.state.params,
          createdAt: session.state.createdAt,
          day: session.state.day,
          points: session.state.points,
        },
        session.state,
        session.saveId,
      )
    }
  }, [session])

  const startNew = useCallback((name: string, seedStr: string, params: GenParams) => {
    const created = createNew(
      { name, worldName: 'Asteria', seedStr, params, createdAt: Date.now(), day: 0, points: 0 },
      seedStr,
      params,
    )
    lastSavedDay.current = 0
    setSession({ saveId: created.id, saveName: name, world: created.world, state: created.state })
    setScreen('map')
  }, [])

  const continueGame = useCallback((id: string) => {
    const loaded = loadSaveState(id)
    if (!loaded) return false
    lastSavedDay.current = Math.floor(loaded.state.day)
    setSession({
      saveId: id,
      saveName: loaded.meta.name,
      world: loaded.world,
      state: loaded.state,
    })
    setScreen('map')
    return true
  }, [])

  if (!session) {
    return <StartScreen onStart={startNew} onContinue={continueGame} />
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          WORLD WITHOUT MAPS
          <small>ASTERIA · {session.saveName}</small>
        </div>
        {(Object.keys(SCREEN_LABELS) as ScreenKey[]).map((k) => (
          <button key={k} className={`navbtn ${screen === k ? 'active' : ''}`} onClick={() => setScreen(k)}>
            <span className={`dot ${screen === k ? 'on' : ''}`} />
            {SCREEN_LABELS[k]}
          </button>
        ))}
        <div className="foot">
          Giorno {Math.floor(session.state.day)} · {session.state.points} pt
          <br />
          <button style={{ marginTop: 6, fontSize: 11, width: '100%' }} onClick={() => setSession(null)}>
            Torna ai mondi
          </button>
        </div>
      </aside>
      <div className="main">
        {screen === 'map' && (
          <MapScreen
            session={session}
            layers={layers}
            setLayers={setLayers}
            updateState={updateState}
            showToast={showToast}
            onNavigate={(k) => setScreen(k)}
          />
        )}
        {screen === 'expeditions' && <ExpeditionScreen session={session} showToast={showToast} />}
        {screen === 'atlas' && <AtlasScreen session={session} updateState={updateState} showToast={showToast} />}
        {screen === 'science' && <ScienceScreen session={session} showToast={showToast} />}
        {screen === 'equipment' && <EquipmentScreen session={session} updateState={updateState} showToast={showToast} />}
        {screen === 'journal' && <JournalScreen session={session} />}
        {screen === 'stats' && <StatsScreen session={session} />}
      </div>
    </div>
  )
}
