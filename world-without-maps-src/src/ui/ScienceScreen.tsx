import React, { useMemo } from 'react'
import { altitudeM, B, BIOMES, C, CLIMATE_ZONES, G, GEOLOGIES, R, RESOURCES, SEA_LEVEL } from '../gen/types'
import type { World } from '../gen/types'
import type { GameState } from '../game/state'
import { getProgress, weatherAt } from '../game/logic'
import type { Session } from './App'

export default function ScienceScreen({ session, showToast }: { session: Session; showToast: (m: string) => void }) {
  const { world, state } = session
  const pIdx = state.player.y * world.W + state.player.x
  const alt = Math.round(altitudeM(world.elevation[pIdx]))
  const wt = weatherAt(world, pIdx, state.day)

  const landTiles = useMemo(() => {
    let n = 0
    for (let i = 0; i < world.W * world.H; i++) if (world.elevation[i] > SEA_LEVEL) n++
    return n
  }, [world])

  const zoneStats = useMemo(() => {
    const m: Record<number, number> = {}
    for (let i = 0; i < world.W * world.H; i++) {
      if (world.elevation[i] > SEA_LEVEL) m[world.climateZone[i]] = (m[world.climateZone[i]] ?? 0) + 1
    }
    return m
  }, [world])

  const geoSampledCount = Object.values(state.geoSampled).reduce((a, b) => a + b, 0)

  return (
    <div className="screen">
      <div className="screen-inner">
        <h1>Analisi Scientifica</h1>
        <div className="sub">Come funziona questo mondo: i dati derivano dalla geografia generata, non da decorazioni.</div>

        <div className="grid2">
          <div className="card">
            <h3>Stazione attuale</h3>
            <div className="kv"><span>Coordinate</span><span className="coords">{((state.player.x / world.W) * 152 - 76).toFixed(2)}°, {((state.player.y / world.H) * 152 - 76).toFixed(2)}°</span></div>
            <div className="kv"><span>Quota</span><span>{alt} m</span></div>
            <div className="kv"><span>Temperatura media annua</span><span>{world.temperature[pIdx].toFixed(1)} °C</span></div>
            <div className="kv"><span>Temperatura attuale</span><span>{wt.temp.toFixed(1)} °C {wt.snow ? '(nevica)' : wt.rain ? '(pioggia)' : ''}</span></div>
            <div className="kv"><span>Precipitazioni annue</span><span>{Math.round(world.precipitation[pIdx])} mm</span></div>
            <div className="kv"><span>Zona climatica</span><span>{CLIMATE_ZONES[world.climateZone[pIdx]].name}</span></div>
            <div className="kv"><span>Bioma</span><span>{BIOMES[world.biome[pIdx]].name}</span></div>
            <div className="kv"><span>Formazione</span><span>{GEOLOGIES[world.geology[pIdx]].name}</span></div>
            <div className="kv"><span>Distanza dal mare</span><span>{world.landDist[pIdx] * 12} km</span></div>
            <div className="kv"><span>Bacino idrografico</span><span>{world.watershedId[pIdx] >= 0 ? `#${world.watershedId[pIdx] + 1}` : '—'}</span></div>
            <button className="primary" style={{ marginTop: 10 }} onClick={() => showToast('Usa "Preleva campione" sulla mappa per archiviare un campione qui.')}>
              Preleva campione (dalla mappa)
            </button>
          </div>

          <div className="card">
            <h3>Sistema climatico osservato</h3>
            {Object.keys(zoneStats).length === 0 && <div style={{ color: '#9a8d72' }}>Dati in corso di raccolta.</div>}
            {Object.entries(zoneStats)
              .sort((a, b) => b[1] - a[1])
              .map(([z, n]) => {
                const surveyed = state.zoneSurveyed[Number(z)] ?? 0
                const pct = (100 * n) / landTiles
                const conf = surveyed > 0 ? Math.min(100, (100 * surveyed) / Math.max(50, n * 0.12)) : 0
                return (
                  <div key={z} style={{ marginBottom: 8 }}>
                    <div className="kv">
                      <span>{CLIMATE_ZONES[Number(z)].name}</span>
                      <span className="coords">{pct.toFixed(1)}% del continente</span>
                    </div>
                    <div className="bar"><div style={{ width: `${pct}%`, background: CLIMATE_ZONES[Number(z)].color }} /></div>
                    <div style={{ fontSize: 10.5, color: '#9a8d72' }}>affidabilità telemetry: {conf.toFixed(0)}%</div>
                  </div>
                )
              })}
          </div>

          <div className="card">
            <h3>Sistema idrologico</h3>
            <div className="kv"><span>Bacini principali</span><span>{world.stats.basins}</span></div>
            <div className="kv"><span>Celle fluviali generate</span><span>{world.stats.riverTiles} (~{world.stats.riverTiles * 144} km² di alvei)</span></div>
            <div className="kv"><span>Laghi</span><span>{world.features.filter((f) => f.kind === 'lake').length}</span></div>
            <div className="kv"><span>Fiume più lungo noto</span><span>{world.stats.longRiverLength} km</span></div>
            <div style={{ fontSize: 11.5, color: '#9a8d72', marginTop: 8, lineHeight: 1.5 }}>
              Ogni fiume segue la superficie idrologica (priority-flood): nasce in quota, scende, riceve affluenti,
              si raccoglie nei laghi o raggiunge l'oceano. Le ombre di pioggia riducono il deflusso a valle delle
              catene: cerca i fiumi dove piove di più.
            </div>
          </div>

          <div className="card">
            <h3>Collezione di campioni ({geoSampledCount})</h3>
            {state.samples.length === 0 && <div style={{ color: '#9a8d72' }}>Nessun campione archiviato.</div>}
            {state.samples.slice(-30).reverse().map((s, k) => (
              <div className="atlas-entry" key={k}>
                <span>G{s.day.toFixed(0)} · {GEOLOGIES[s.geology].name}</span>
                <span className="coords">{BIOMES[s.biome]?.name ?? '—'} · {CLIMATE_ZONES[s.zone].name}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Sistema geologico</h3>
            <div style={{ fontSize: 11.5, color: '#9a8d72', lineHeight: 1.5, marginBottom: 10 }}>
              Le rocce seguono la storia tettonica del mondo: ignee nelle ascendenze, metamorfiche nei nuclei
              profondi delle catene, sedimentarie nei bacini, vulcaniche nei punti caldi. Le risorse seguono la
              geologia: oro vicino ai vulcani, ferro nelle metamorfiche, sale nei bacini aridi chiusi, carbone nei
              bacini forestali.
            </div>
            {Object.values(G).map((g) => (
              <div className="kv" key={g}>
                <span>{GEOLOGIES[g].name}</span>
                <span className="coords">{state.geoSampled[g] ?? 0} campioni</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Ciclo stagionale</h3>
            <div style={{ fontSize: 11.5, color: '#9a8d72', lineHeight: 1.5 }}>
              L'anno di Asteria dura 360 giorni. Le stagioni alternano piene e magre dei fiumi, innevano i passi
              in quota e seccano le zone mediterranee in estate. Osserva la mappa in stagioni diverse: i passi
              montani più alti diventano impraticabili, le pianure alluvionali si allagano.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
