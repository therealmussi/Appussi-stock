import React, { useMemo, useState } from 'react'
import type { World } from '../gen/types'
import { KIND_NAMES } from '../gen/types'
import type { GameState } from '../game/state'
import { getProgress, KIND_LABELS } from '../game/logic'
import { atlasCompletion } from '../game/missions'
import type { Session } from './App'

const CATALOGUES: { key: string; name: string; kinds: string[] }[] = [
  { key: 'geo', name: 'Catalogo geografico', kinds: ['range', 'peak', 'volcano', 'river', 'lake', 'desert', 'forest', 'island', 'wetland', 'canyon', 'harbor', 'pass'] },
  { key: 'human', name: 'Tracce umane', kinds: ['ruin'] },
]

export default function AtlasScreen({
  session,
  updateState,
  showToast,
}: {
  session: Session
  updateState: (fn: (s: GameState) => GameState) => void
  showToast: (msg: string) => void
}) {
  const { world, state } = session
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const completion = useMemo(() => atlasCompletion(world, state), [world, state])

  const byKind = useMemo(() => {
    const map: Record<string, { name: string; status: number; day: number; id: number; meta: Record<string, number | string> }[]> = {}
    for (const f of world.features) {
      const prog = getProgress(state, f.id)
      if (prog.status === 0) continue
      if (!map[f.kind]) map[f.kind] = []
      map[f.kind].push({ name: state.renames[f.id] ?? f.name, status: prog.status, day: prog.day, id: f.id, meta: f.meta })
    }
    return map
  }, [world, state])

  const kindsPresent = Object.keys(byKind).filter((k) => (byKind[k] ?? []).length > 0)
  const visibleKinds =
    filter === 'all'
      ? CATALOGUES.flatMap((c) => c.kinds)
      : [filter]

  const search = (name: string) => name.toLowerCase().includes(query.toLowerCase())

  const rename = (id: number, current: string) => {
    const v = window.prompt('Rinomina la scoperta:', current)
    if (v && v.trim()) {
      updateState((s) => ({ ...s, renames: { ...s.renames, [id]: v.trim() } }))
      showToast('Cartografia aggiornata.')
    }
  }

  const zonesSeen = Object.keys(state.zoneSurveyed).length
  const biomesSeen = Object.keys(state.biomeSurveyed).length

  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>L'Atlante di Asteria</h1>
        <div className="sub">
          Il tuo archivio geografico crescente. Completamento complessivo: <b>{(completion * 100).toFixed(1)}%</b> ·
          avvistamenti: {Object.keys(state.featureProgress).length} · zone climatiche rilevate: {zonesSeen}/8 · ecosistemi rilevati: {biomesSeen}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" placeholder="Cerca nell'atlante…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tutte le categorie</option>
              {kindsPresent.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k] ?? k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {CATALOGUES.map((cat) => {
          const kindsHere = visibleKinds.filter((k) => (byKind[k] ?? []).length > 0)
          if (kindsHere.length === 0) return null
          return (
            <div className="card" key={cat.key}>
              <h3>{cat.name}</h3>
              {kindsHere.map((k) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div className="stat-lbl" style={{ marginBottom: 4 }}>
                    {KIND_LABELS[k] ?? k} — {(byKind[k] ?? []).length} scopert{(byKind[k] ?? []).length === 1 ? 'a' : 'e'}
                  </div>
                  {(byKind[k] ?? [])
                    .filter((e) => search(e.name))
                    .map((e) => (
                      <div className="atlas-entry" key={e.id}>
                        <span>
                          {e.name}{' '}
                          {e.status === 2 ? (
                            <span className="acc srv">rilevata</span>
                          ) : (
                            <span className="acc obs">avvistata</span>
                          )}
                        </span>
                        <span className="coords">
                          {featMetaText(k, e.meta)} · giorno {Math.floor(e.day)}{' '}
                          <button style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => rename(e.id, e.name)}>
                            rinomina
                          </button>
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )
        })}

        <div className="card">
          <h3>Catalogo scientifico</h3>
          <div className="grid2">
            <div>
              <div className="stat-lbl">Zone climatiche documentate</div>
              {Object.entries(state.zoneSurveyed)
                .sort((a, b) => b[1] - a[1])
                .map(([z, n]) => (
                  <div className="kv" key={z}>
                    <span>{zoneName(Number(z))}</span>
                    <span className="coords">{n} celle rilevate</span>
                  </div>
                ))}
            </div>
            <div>
              <div className="stat-lbl">Ecosistemi documentati</div>
              {Object.entries(state.biomeSurveyed)
                .sort((a, b) => b[1] - a[1])
                .map(([b, n]) => (
                  <div className="kv" key={b}>
                    <span>{biomeName(Number(b))}</span>
                    <span className="coords">{n} celle rilevate</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function featMetaText(kind: string, meta: Record<string, number | string>): string {
  switch (kind) {
    case 'peak':
    case 'volcano':
      return `${meta.alt} m`
    case 'river':
      return `${meta.lengthKm} km · ${meta.tributaries} affl. · ~${meta.discharge} m³/s`
    case 'lake':
      return `${meta.areaKm2} km² · fondale −${meta.maxDepthM} m${Number(meta.hasOutflow) ? ' · emissario' : ' · endoreico'}`
    case 'range':
      return `${meta.maxAlt} m max · ${meta.area} celle`
    case 'pass':
      return `${meta.alt} m`
    case 'island':
      return `${Math.round(Number(meta.area) * 144)} km²`
    case 'ruin':
      return `era: −${meta.era} anni`
    default:
      return ''
  }
}

function zoneName(z: number): string {
  const names = ['Tropicale', 'Arido', 'Mediterraneo', 'Temperato', 'Continentale', 'Subartico', 'Polare', 'Alpino']
  return names[z] ?? `Zona ${z}`
}

function biomeName(b: number): string {
  const names: Record<number, string> = {
    0: 'Oceano', 1: 'Lago', 2: 'Ghiacciaio', 3: 'Tundra', 4: 'Foresta boreale', 5: 'F. temperata pluviale',
    6: 'Foresta temperata', 7: 'Prateria', 8: 'Macchia mediterranea', 9: 'Savana', 10: 'F. pluviale tropicale',
    11: 'Deserto', 12: 'Prateria alpina', 13: 'Roccia nuda', 14: 'Palude',
  }
  return names[b] ?? `Bioma ${b}`
}
