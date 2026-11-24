import React from 'react'
import type { World } from '../gen/types'
import { B, BIOMES, SEA_LEVEL } from '../gen/types'
import type { GameState } from '../game/state'
import { atlasCompletion } from '../game/missions'
import type { Session } from './App'

export function EquipmentScreen({
  session,
  updateState,
  showToast,
}: {
  session: Session
  updateState: (fn: (s: GameState) => GameState) => void
  showToast: (m: string) => void
}) {
  const { state } = session
  const repair = () => {
    updateState((s) => ({ ...s, equipment: Math.min(100, s.equipment + 25) }))
    showToast('Equipaggiamento riparato e tarato.')
  }
  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>Equipaggiamento</h1>
        <div className="sub">Lo stato del materiale influenza viabilità e rilievi.</div>
        <div className="grid2">
          <div className="card">
            <h3>Colonna</h3>
            <div className="kv"><span>Viveri</span><span>{Math.round(state.food)} / 260</span></div>
            <div className="kv"><span>Acqua</span><span>{Math.round(state.water)} / 200</span></div>
            <div className="kv"><span>Fatica</span><span>{Math.round(state.fatigue)} / 100</span></div>
            <div className="kv"><span>Condizione strumentazione</span><span>{Math.round(state.equipment)}%</span></div>
            <div className="kv"><span>Distanza percorsa</span><span>{Math.round(state.distanceKm)} km</span></div>
            <div className="kv"><span>Campioni archiviati</span><span>{state.samples.length}</span></div>
            <button className="primary" style={{ marginTop: 10 }} onClick={repair} disabled={state.equipment > 95}>
              Ritira e ripara (al campo/base)
            </button>
          </div>
          <div className="card">
            <h3>Cassetta del cartografo</h3>
            <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li><b>Bussola</b> — orientamento e rotte</li>
              <li><b>Altimetro aneroide</b> — quota stimata ovunque, misurata con il rilievo</li>
              <li><b>Roulette e Odometro</b> — misura distanze sulla mappa</li>
              <li><b>Quaderno tascabile</b> — annotazioni etoponimi</li>
              <li><b>Kit da rilievo</b> — trasforma avvistato in rilevato (pulsante "Rileva zona")</li>
              <li><b>Teodolite da campo</b> — visuale estesa dai punti alti</li>
              <li><b>Bilancia idrostatica</b> — lettura di portate dei fiumi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function JournalScreen({ session }: { session: Session }) {
  const { state } = session
  const entries = [...state.journal].reverse()
  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>Giornale di Bordo</h1>
        <div className="sub">Tutto quello che la spedizione ha visto e fatto.</div>
        {entries.length === 0 && <div style={{ color: '#9a8d72' }}>Il giornale è vuoto: esplora per popolarlo.</div>}
        {entries.map((e, k) => (
          <div className="journal-entry" key={k}>
            <span className="jd">Giorno {Math.max(1, Math.floor(e.day))} · {e.kind}</span>
            <div>{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsScreen({ session }: { session: Session }) {
  const { world, state } = session
  const completion = atlasCompletion(world, state)
  let land = 0
  for (let i = 0; i < world.W * world.H; i++) if (world.elevation[i] > SEA_LEVEL) land++
  const pctSurveyed = (100 * state.tilesSurveyed) / Math.max(1, land)
  const pctObserved = (100 * state.tilesObserved) / Math.max(1, land)
  const disc = world.features.filter((f) => (state.featureProgress[f.id]?.status ?? 0) >= 1).length
  const conf = world.features.filter((f) => (state.featureProgress[f.id]?.status ?? 0) === 2).length

  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>Statistiche della Spedizione</h1>
        <div className="sub">Seed “{world.seedStr}” · mondo di {world.W}×{world.H} celle · 1 cella = 144 km²</div>
        <div className="grid3">
          <div className="card">
            <div className="stat-big">{completion.toFixed(1)}%</div>
            <div className="stat-lbl">Atlante completato</div>
          </div>
          <div className="card">
            <div className="stat-big">{state.points}</div>
            <div className="stat-lbl">Punti esplorazione</div>
          </div>
          <div className="card">
            <div className="stat-big">{Math.floor(state.day)}</div>
            <div className="stat-lbl">Giorni trascorsi</div>
          </div>
          <div className="card">
            <div className="stat-big">{state.tilesSurveyed}</div>
            <div className="stat-lbl">Celle rilevate ({pctSurveyed.toFixed(2)}% delle terre)</div>
          </div>
          <div className="card">
            <div className="stat-big">{state.tilesObserved}</div>
            <div className="stat-lbl">Celle avvistate ({pctObserved.toFixed(2)}%)</div>
          </div>
          <div className="card">
            <div className="stat-big">{disc}/{world.features.length}</div>
            <div className="stat-lbl">Feature scoperte ({conf} confermate)</div>
          </div>
          <div className="card">
            <div className="stat-big">{Math.round(state.distanceKm)}</div>
            <div className="stat-lbl">Km percorsi</div>
          </div>
          <div className="card">
            <div className="stat-big">{state.camps.length}</div>
            <div className="stat-lbl">Campi istituiti</div>
          </div>
          <div className="card">
            <div className="stat-big">{world.stats.highestPeakAlt} m</div>
            <div className="stat-lbl">Quota massima del mondo</div>
          </div>
        </div>
        <div className="card">
          <h3>Mondo Asteria #{world.seedStr} — dati del generatore</h3>
          <div className="kv"><span>Terre emerse</span><span>{world.stats.landTiles} celle</span></div>
          <div className="kv"><span>Bacini idrografici principali</span><span>{world.stats.basins}</span></div>
          <div className="kv"><span>Vulcani</span><span>{world.stats.volcanoes}</span></div>
          <div className="kv"><span>Celle fluviali</span><span>{world.stats.riverTiles}</span></div>
          <div className="kv"><span>Superficie lacustre</span><span>{world.stats.lakeTiles} celle</span></div>
          <div className="kv"><span>Insediamenti abbandonati</span><span>{world.features.filter((f) => f.kind === 'ruin').length}</span></div>
        </div>
      </div>
    </div>
  )
}
void B
void BIOMES
