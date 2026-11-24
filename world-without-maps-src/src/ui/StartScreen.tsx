import React, { useMemo, useRef, useState } from 'react'
import { regenerateWorld, DEFAULTS } from '../game/init'
import { deleteSave, listSaves, saveGame } from '../game/persist'
import type { GenParams, World } from '../gen/types'
import { basePixel, hillshadeAt, pickBaseStyle } from '../render/palette'
import { SEA_LEVEL } from '../gen/types'
import type { GameState } from '../game/state'

function drawPreview(canvas: HTMLCanvasElement, world: World): void {
  canvas.width = world.W
  canvas.height = world.H
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const img = ctx.createImageData(world.W, world.H)
  const N = world.W * world.H
  const style = pickBaseStyle({ vegetation: true, climate: false, geology: false, resources: false, watershed: false })
  for (let i = 0; i < N; i++) {
    let c = basePixel(world, i, style)
    if (world.elevation[i] > SEA_LEVEL) {
      const sh = hillshadeAt(world, i)
      c = [c[0] * sh, c[1] * sh, c[2] * sh]
    }
    const o = i * 4
    img.data[o] = c[0]
    img.data[o + 1] = c[1]
    img.data[o + 2] = c[2]
    img.data[o + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
}

function randomSeed(): string {
  const syl = ['aster', 'vel', 'thar', 'noct', 'mir', 'cal', 'dun', 'or', 'vess', 'kal', 'ion', 'umbra']
  const pick = (n: number) => syl[Math.floor(Math.random() * n)]
  return `${pick(syl.length)}${pick(syl.length)}-${Math.floor(Math.random() * 900 + 100)}`
}

export default function StartScreen({
  onStart,
  onContinue,
}: {
  onStart: (name: string, seedStr: string, params: GenParams) => void
  onContinue: (id: string) => boolean
}) {
  const [seed, setSeed] = useState<string>(() => randomSeed())
  const [name, setName] = useState('Prima Spedizione')
  const [params, setParams] = useState<GenParams>({ ...DEFAULTS })
  const [preview, setPreview] = useState<World | null>(null)
  const [generating, setGenerating] = useState(false)
  const previewRef = useRef<HTMLCanvasElement | null>(null)
  const saves = useMemo(() => listSaves(), [])

  const gen = () => {
    setGenerating(true)
    window.setTimeout(() => {
      const t0 = performance.now()
      const world = regenerateWorld(seed, params)
      const ms = Math.round(performance.now() - t0)
      setPreview(world)
      setGenerating(false)
      window.setTimeout(() => {
        if (previewRef.current) drawPreview(previewRef.current, world)
      }, 10)
      void ms
    }, 30)
  }

  const setP = (k: keyof GenParams, v: number) => setParams((p) => ({ ...p, [k]: v }))

  return (
    <div className="screen">
      <div className="screen-inner">
        <div className="start-hero">
          <h1>WORLD WITHOUT MAPS</h1>
          <p>UN CONTINENTE SENZA CARTE · ESPLORA · MISURA · CARTOGRAFA</p>
        </div>

        <div className="card">
          <h3>Mondi salvati</h3>
          {saves.length === 0 && <div style={{ color: '#9a8d72', fontSize: 13 }}>Nessuna spedizione in archivio. Genera un nuovo mondo Asteria qui sotto.</div>}
          <div className="saves-grid">
            {saves.map((m) => (
              <div key={m.id} className="mission">
                <div className="mtitle">{m.name}</div>
                <div className="mdesc">
                  Seed “{m.seedStr}” · Giorno {Math.floor(m.day)} · {m.points} pt
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button className="primary" onClick={() => onContinue(m.id)}>
                    Continua
                  </button>
                  <button onClick={() => { deleteSave(m.id); window.location.reload() }}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Nuova spedizione</h3>
          <div className="grid2">
            <div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#9a8d72' }}>Nome della spedizione</div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#9a8d72' }}>Seed del mondo</div>
                  <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} style={{ width: '100%' }} />
                </div>
                <button style={{ alignSelf: 'flex-end' }} onClick={() => setSeed(randomSeed())}>
                  ⟳
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#9a8d72' }}>Dimensione del mondo</div>
                <select
                  value={params.worldSize}
                  onChange={(e) => setP('worldSize', Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  <option value={240}>Piccolo (240×160)</option>
                  <option value={300}>Medio (300×200)</option>
                  <option value={360}>Grande (360×240)</option>
                </select>
              </div>
              {(
                [
                  ['oceanCoverage', 'Copertura oceanica'],
                  ['mountainDensity', 'Densità montuosa'],
                  ['riverDensity', 'Densità fluviale'],
                  ['vegetationDensity', 'Densità vegetale'],
                  ['climateVariability', 'Variabilità climatica'],
                  ['islandFrequency', 'Frequenza isolane'],
                  ['geologicalActivity', 'Attività geologica'],
                  ['continents', 'Frammentazione continentale'],
                ] as [keyof GenParams, string][]
              ).map(([k, label]) => (
                <div className="slider-row" key={k}>
                  <label>{label}</label>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={params[k] as number}
                    onChange={(e) => setP(k, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
            <div>
              <canvas ref={previewRef} className="preview" width={300} height={200} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={gen} disabled={generating}>
                  {generating ? 'Generazione…' : 'Genera anteprima'}
                </button>
                <button
                  className="primary"
                  disabled={!preview}
                  onClick={() => {
                    void preview
                    onStart(name, seed, params)
                  }}
                >
                  Salpa per {name || 'Asteria'}
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: '#9a8d72', marginTop: 8, lineHeight: 1.5 }}>
                Lo stesso seed rigenera sempre lo stesso mondo: annotalo, condividilo, confrontalo. La generazione
                passa per continentali → elevazione → fasce tettoniche → idrologia (drenaggio reale) → clima con
                ombre di pioggia → biomi → geologia → risorse.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
void saveGame
void ({} as GameState)
