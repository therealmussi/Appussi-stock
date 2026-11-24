import React, { useMemo } from 'react'
import type { World } from '../gen/types'
import type { GameState } from '../game/state'
import { getProgress, KIND_LABELS } from '../game/logic'
import { atlasCompletion } from '../game/missions'
import type { Session } from './App'

export default function ExpeditionScreen({ session, showToast }: { session: Session; showToast: (m: string) => void }) {
  const { world, state } = session
  const completion = useMemo(() => atlasCompletion(world, state), [world, state])
  const active = state.missions.filter((m) => !m.done)
  const done = state.missions.filter((m) => m.done)

  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>Spedizioni</h1>
        <div className="sub">
          Obiettivi generati dalla geografia di questo mondo. Completamento dell'esplorazione: {(completion * 100).toFixed(1)}%
        </div>

        <div className="card">
          <h3>Obiettivi in corso</h3>
          {active.length === 0 && <div style={{ color: '#9a8d72' }}>Tutti gli obiettivi sono stati raggiunti. Il mondo resta comunque da cartografare.</div>}
          {active.map((m) => {
            const prog = m.revealed && m.target >= 0 ? getProgress(state, featureIdAt(world, m.target)) : null
            return (
              <div className="mission" key={m.id}>
                <div className="mtitle">{m.title}</div>
                <div className="mdesc">{m.desc}</div>
                {m.revealed && prog && prog.status > 0 && (
                  <div className="mprog">
                    Bersaglio collegato: <b>{m.targetLabel}</b> · stato cartografico: {prog.status === 2 ? 'rilevato' : 'avvistato'}
                  </div>
                )}
                {!m.revealed && <div className="mprog">Bersaglio non ancora individuato: esplora per generare indizi.</div>}
                <div className="mprog">Avanzamento: {(m.progress * 100).toFixed(0)}% · ricompensa {m.reward} pt</div>
              </div>
            )
          })}
        </div>

        {done.length > 0 && (
          <div className="card">
            <h3>Obiettivi raggiunti</h3>
            {done.map((m) => (
              <div className="mission done" key={m.id}>
                <div className="mtitle">{m.title} ✓</div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h3>Campi e rifornimenti</h3>
          {state.camps.length === 0 && <div style={{ color: '#9a8d72' }}>Nessun campo istituito. Dalla mappa: pulsante "Campo".</div>}
          {state.camps.map((c) => (
            <div className="atlas-entry" key={c.id}>
              <span>Campo {c.id} · giorno {Math.floor(c.day)}</span>
              <span className="coords">{c.food} cibo · {c.water} acqua in cache</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function featureIdAt(world: World, tile: number): number {
  for (const f of world.features) if (f.keyTile === tile) return f.id
  return -1
}
void KIND_LABELS
