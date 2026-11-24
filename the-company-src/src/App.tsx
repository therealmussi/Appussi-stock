import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from './engine/types'
import { newGame } from './engine/world'
import { advanceWeek, chooseEventOption } from './engine/sim'
import * as A from './engine/actions'
import { saveGame, loadGame, hasSave, clearSave } from './engine/save'
import { ENDINGS, endingDef } from './engine/endings'
import { fmtK } from './engine/format'
import { Overview } from './ui/tabs/Overview'
import { Departments } from './ui/tabs/Departments'
import { Employees } from './ui/tabs/Employees'
import { Finance } from './ui/tabs/Finance'
import { Projects } from './ui/tabs/Projects'
import { MapTab } from './ui/tabs/MapTab'
import { Investigations } from './ui/tabs/Investigations'
import { Board } from './ui/tabs/Board'
import { Archives } from './ui/tabs/Archives'
import { Reports } from './ui/tabs/Reports'
import { Btn } from './ui/components'

type TabId = 'overview' | 'departments' | 'employees' | 'finance' | 'projects' | 'map' | 'investigations' | 'board' | 'archives' | 'reports'
export type Act = (fn: (s: GameState) => string | void | null) => void

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'departments', label: 'Departments' },
  { id: 'employees', label: 'Employees' },
  { id: 'finance', label: 'Finance' },
  { id: 'projects', label: 'Projects' },
  { id: 'map', label: 'Corporate Map' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'board', label: 'Board Room' },
  { id: 'archives', label: 'Archives' },
  { id: 'reports', label: 'Reports' },
]

export function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>(hasSave() ? 'menu' : 'menu')
  const [state, setState] = useState<GameState | null>(null)
  const [tab, setTab] = useState<TabId>('overview')
  const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null)
  const [confront, setConfront] = useState(false)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    if (toast) toastTimer.current = window.setTimeout(() => setToast(null), 5200)
  }, [toast])

  const start = useCallback((seed: string, ceo: string) => {
    const s = newGame(seed, ceo)
    saveGame(s)
    setState(s)
    setScreen('game')
    setTab('overview')
  }, [])

  const cont = useCallback(() => {
    const s = loadGame()
    if (s) { setState(s); setScreen('game'); setTab('overview') }
  }, [])

  const act: Act = useCallback((fn) => {
    setState((prev) => {
      if (!prev) return prev
      const c: GameState = structuredClone(prev)
      const res = fn(c)
      if (typeof res === 'string' && res.length) setToast({ text: res, err: true })
      saveGame(c)
      return c
    })
  }, [])

  const endWeek = useCallback(() => {
    act((s) => { if (!s.ending && !s.pendingEvents.length) advanceWeek(s) })
  }, [act])

  const chooseEvent = useCallback((uid: string, idx: number) => {
    setState((prev) => {
      if (!prev) return prev
      const c: GameState = structuredClone(prev)
      const pe = c.pendingEvents.find((e) => e.uid === uid)
      const outcome = pe?.choices[idx]?.outcome
      chooseEventOption(c, uid, idx)
      if (outcome) setToast({ text: outcome })
      saveGame(c)
      return c
    })
  }, [])

  if (screen === 'menu' || !state) return <Menu onNew={start} onContinue={cont} canContinue={hasSave()} onWipe={() => { clearSave(); setState(null) }} />

  const s = state
  const m = s.metrics
  const pending = s.pendingEvents.length

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>MERIDIAN</h1>
          <small>GROUP · EST. 1958</small>
        </div>
        {TABS.map((t) => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.label}</span>
            {t.id === 'investigations' && <span className={`nav-badge ${s.ap > 0 ? '' : 'mute'}`}>{pending > 0 ? '!' : s.ap}</span>}
            {t.id === 'board' && s.board.demands.some((d) => !d.resolved) && <span className="nav-badge">{s.board.demands.filter((d) => !d.resolved).length}</span>}
            {t.id === 'projects' && s.projects.some((p) => p.status === 'stalled') && <span className="nav-badge mute">⏸</span>}
          </button>
        ))}
        <div className="sidebar-foot">
          CEO {s.ceoName}<br />Week {s.week} · seed {s.seed.toString(16).slice(0, 6)}
          <div style={{ marginTop: 8 }}>
            <Btn kind="ghost" onClick={() => { setScreen('menu'); setState(null) }}>Save & exit</Btn>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="tb-item">
            <span className="tb-label">Week</span>
            <span className="tb-value">{s.week}</span>
          </div>
          <div className="tb-item">
            <span className="tb-label">Cash</span>
            <span className="tb-value" style={{ color: m.cash < 12000 ? 'var(--bad)' : 'var(--text)' }}>{fmtK(m.cash)}K</span>
          </div>
          <div className="tb-item">
            <span className="tb-label">Net / week</span>
            <span className="tb-value" style={{ color: m.profit >= 0 ? 'var(--good)' : 'var(--bad)' }}>{fmtK(m.profit)}K</span>
          </div>
          <div className="tb-item">
            <span className="tb-label">Satisfaction</span>
            <span className="tb-value">{Math.round(m.satisfaction)}</span>
          </div>
          <div className="tb-item">
            <span className="tb-label">Stability</span>
            <span className="tb-value" style={{ color: m.stability < 35 ? 'var(--bad)' : 'var(--text)' }}>{m.stability}</span>
          </div>
          <div className="tb-item">
            <span className="tb-label">Board</span>
            <span className="tb-value" style={{ color: s.board.confidence < 35 ? 'var(--bad)' : 'var(--text)' }}>{Math.round(s.board.confidence)}</span>
          </div>
          <div className="spacer" />
          <Btn kind="primary" onClick={endWeek} disabled={!!s.ending || pending > 0}>
            {pending > 0 ? 'Resolve matters' : 'End week ▸'}
          </Btn>
        </header>

        <main className="content">
          {tab === 'overview' && <Overview s={s} act={act} />}
          {tab === 'departments' && <Departments s={s} act={act} />}
          {tab === 'employees' && <Employees s={s} act={act} />}
          {tab === 'finance' && <Finance s={s} act={act} />}
          {tab === 'projects' && <Projects s={s} act={act} />}
          {tab === 'map' && <MapTab s={s} act={act} />}
          {tab === 'investigations' && <Investigations s={s} act={act} onConfront={() => setConfront(true)} />}
          {tab === 'board' && <Board s={s} act={act} onConfront={() => setConfront(true)} />}
          {tab === 'archives' && <Archives s={s} />}
          {tab === 'reports' && <Reports s={s} />}
        </main>
      </div>

      {pending > 0 && (() => {
        const ev = s.pendingEvents[0]
        return (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-kicker">Internal memorandum · Week {s.week}</div>
              <h2>{ev.title}</h2>
              <p>{ev.text}</p>
              {ev.choices.map((c, i) => (
                <Btn key={i} className="choice-btn" kind="ghost" onClick={() => chooseEvent(ev.uid, i)}>{c.label}</Btn>
              ))}
            </div>
          </div>
        )
      })()}

      {confront && (() => {
        const ins = true
        return ins ? (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-kicker">Executive Decision · The record is complete</div>
              <h2>What is a company for?</h2>
              <p>You hold Project Null in your hands: the Trust deed, Resolution 9, the five stations, floor B4, sixty-one million a year that keeps the week ending. Whatever you decide now, you will decide it for everyone who was never asked.</p>
              <Btn className="choice-btn" kind="gold" onClick={() => { setConfront(false); act((st) => { A.confrontTruth(st, 'expose') }) }}>
                EXPOSE IT — disclose everything: the Resolution, the Trust, the stations, the philosophy. Let the company face what it is.
              </Btn>
              <Btn className="choice-btn" kind="gold" onClick={() => { setConfront(false); act((st) => { A.confrontTruth(st, 'control') }) }}>
                TAKE CONTROL — assume the Office of Continuity yourself. The company survives; you become the sixth station.
              </Btn>
              <Btn className="choice-btn" kind="gold" onClick={() => { setConfront(false); act((st) => { A.confrontTruth(st, 'seal') }) }}>
                SEAL THE ARCHIVES — decide that some questions should remain unanswered, and fund the mystery forever.
              </Btn>
              <Btn className="choice-btn" onClick={() => setConfront(false)}>Not this week.</Btn>
            </div>
          </div>
        ) : null
      })()}

      {toast && <div className={`toast ${toast.err ? 'err' : ''}`}>{toast.text}</div>}

      {s.ending && (() => {
        const def = endingDef(s) ?? ENDINGS.ending_steward
        return (
          <div className="ending-overlay">
            <div className="ending-box">
              <div className="modal-kicker">MERIDIAN GROUP — MANDATE CONCLUDED · WEEK {s.week}</div>
              <h1>{def.name}</h1>
              <h2>{def.title}</h2>
              <p>{def.text}</p>
              <div className="grid cols-4" style={{ margin: '18px 0' }}>
                <div className="stat"><span className="stat-label">Weeks served</span><span className="stat-value">{s.week}</span></div>
                <div className="stat"><span className="stat-label">Final cash</span><span className="stat-value">{fmtK(s.metrics.cash)}K</span></div>
                <div className="stat"><span className="stat-label">Truth uncovered</span><span className="stat-value">{s.insights.length}/9</span></div>
                <div className="stat"><span className="stat-label">Reputation</span><span className="stat-value">{Math.round(s.metrics.reputation)}</span></div>
              </div>
              <Btn kind="primary" onClick={() => { clearSave(); setState(null); setScreen('menu') }}>Begin a new mandate</Btn>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function Menu({ onNew, onContinue, canContinue, onWipe }: { onNew: (seed: string, ceo: string) => void; onContinue: () => void; canContinue: boolean; onWipe: () => void }) {
  const [seed, setSeed] = useState('MERIDIAN-1958')
  const [ceo, setCeo] = useState('')
  return (
    <div className="menu-screen">
      <div className="menu-box">
        <div className="sub">Meridian Group · Executive Terminal</div>
        <h1>THE COMPANY</h1>
        <p className="lede">
          You have been appointed Chief Executive Officer of Meridian Group — 10,000 employees, twelve departments,
          eight subsidiaries, sixty-eight years of continuous operation.
        </p>
        <p className="lede" style={{ color: 'var(--mystery)' }}>
          "We have been operating successfully for 68 years. Unfortunately, we are no longer entirely certain what we do."
        </p>
        <div className="field">
          <label>Name of the incoming CEO</label>
          <input value={ceo} onChange={(e) => setCeo(e.target.value)} placeholder="A. Glover" maxLength={30} />
        </div>
        <div className="field">
          <label>World seed (determines the company you inherit)</label>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} maxLength={40} />
        </div>
        <div className="rowflex" style={{ marginTop: 14 }}>
          <Btn kind="primary" onClick={() => onNew(seed, ceo)}>Accept the appointment ▸</Btn>
          {canContinue && <Btn onClick={onContinue}>Continue previous mandate</Btn>}
          {canContinue && <Btn kind="danger" onClick={onWipe}>Erase save</Btn>}
        </div>
        <p className="muted" style={{ marginTop: 22, fontSize: 12 }}>
          The company runs one working week at a time. It will not wait for you: budgets renew themselves, projects bill,
          managers drift, people leave. Manage, restructure, investigate — and try to establish what, exactly, Meridian Group does.
        </p>
      </div>
    </div>
  )
}
