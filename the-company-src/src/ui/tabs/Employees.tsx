import { useMemo, useState } from 'react'
import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Bar, Btn, Tag } from '../components'
import * as A from '../../engine/actions'
import { fmtK } from '../../engine/format'

const DEPTS = ['operations', 'logistics', 'it', 'rnd', 'marketing', 'finance', 'hr', 'planning', 'legal', 'pr', 'security', 'archives'] as const
const LEVELS = ['', 'Worker', 'Senior', 'Manager', 'Director']

const tone = (v: number, invert = false) =>
  (invert ? v > 65 : v < 38) ? 'var(--bad)' : (invert ? v > 45 : v > 62) ? 'var(--good)' : 'var(--warn)'

export function Employees({ s, act }: { s: GameState; act: Act }) {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('all')
  const [selId, setSelId] = useState<string | null>(null)

  const filtered = useMemo(() => s.employees.filter((e) => {
    if (dept !== 'all' && e.dept !== dept) return false
    if (q && !(e.name.toLowerCase().includes(q.toLowerCase()) || e.title.toLowerCase().includes(q.toLowerCase()) || e.specialty.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }), [s, q, dept])

  const sel = s.employees.find((e) => e.id === selId) ?? null
  const sat = (id: string | null) => (id ? s.employees.find((e) => e.id === id) : null)

  return (
    <>
      <Panel title="Candidate pool" right={<span className="muted">The pool refreshes weekly. Signing cost = 1.5× ask salary.</span>}>
        <div className="grid cols-3">
          {s.candidates.map((c) => (
            <div key={c.id} className="dept-card">
              <div className="spread"><h4>{c.name}</h4><span className="muted">{c.age} y.o.</span></div>
              <div className="dept-sub">{c.dept} · {c.specialty}</div>
              <div className="kv"><span>Skill</span><b>{c.skill}</b></div>
              <div className="kv"><span>Asks</span><b>{fmtK(c.askSalary)}K/yr</b></div>
              <div className="chip-row"><Tag>{c.traits[0]}</Tag><span className="muted" style={{ fontSize: 11 }}>{c.note}</span></div>
              <Btn kind="small" onClick={() => act((st) => A.hireCandidate(st, c.id))}>Hire — {fmtK(Math.round(c.askSalary * 1.5))}K</Btn>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`Personnel files (${filtered.length} of ${s.employees.length})`} right={
        <div className="rowflex">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search name, role, specialty…"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '5px 9px', fontSize: 12.5 }} />
          <select value={dept} onChange={(e) => setDept(e.target.value)}
            style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '5px 9px', fontSize: 12.5 }}>
            <option value="all">All departments</option>
            {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      }>
        <table className="tbl">
          <thead><tr>
            <th>Name</th><th>Role</th><th>Dept</th><th>Perf</th><th>Satisfaction</th><th>Stress</th><th>Salary/yr</th><th>Traits</th>
          </tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="clickable" onClick={() => setSelId(e.id)}>
                <td>{e.name}{e.flagged && <span title={e.flagged}> ⚑</span>}</td>
                <td className="muted">{e.title}</td>
                <td className="muted">{e.dept}</td>
                <td className="mono" style={{ color: tone(e.performance) }}>{e.performance}</td>
                <td className="mono" style={{ color: tone(e.satisfaction) }}>{Math.round(e.satisfaction)}</td>
                <td className="mono" style={{ color: tone(e.stress, true) }}>{Math.round(e.stress)}</td>
                <td className="mono">{fmtK(e.salary)}K</td>
                <td className="muted" style={{ fontSize: 11 }}>{e.traits.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {sel && sat(sel.id) && (
        <Panel title={`File: ${sel.name}`} right={<Btn kind="small" onClick={() => setSelId(null)}>Close</Btn>}>
          <div className="emp-profile">
            <div>
              <div className="kv"><span>Position</span><b>{sel.title} · {sel.dept} · level {sel.level}</b></div>
              <div className="kv"><span>Specialty</span><b>{sel.specialty}</b></div>
              <div className="kv"><span>Age / tenure</span><b>{sel.age} / {sel.tenure} yrs</b></div>
              <div className="kv"><span>Salary</span><b>{fmtK(sel.salary)}K/yr</b></div>
              <div className="kv"><span>Skill</span><b>{sel.skill}</b></div>
              <div className="kv"><span>Ambition / loyalty</span><b>{sel.ambition} / {sel.loyalty}</b></div>
              {sel.flagged && <div className="alertline warn" style={{ marginTop: 8 }}>⚑ {sel.flagged}</div>}
              <div style={{ marginTop: 10 }}>
                <span className="stat-label">SATISFACTION</span><Bar value={sel.satisfaction} color={tone(sel.satisfaction)} />
                <span className="stat-label">PERFORMANCE</span><Bar value={sel.performance} color={tone(sel.performance)} />
                <span className="stat-label">STRESS</span><Bar value={sel.stress} color={tone(sel.stress, true)} />
              </div>
              <div className="rowflex" style={{ marginTop: 10 }}>
                <Btn kind="small" onClick={() => act((st) => A.promoteEmployee(st, sel.id))}>Promote</Btn>
                <Btn kind="small" onClick={() => act((st) => A.adjustSalary(st, sel.id, 5))}>+5% salary</Btn>
                <Btn kind="small" onClick={() => act((st) => A.adjustSalary(st, sel.id, -5))}>−5% salary</Btn>
                <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invInterview(st, sel.id))}>Interview ({s.ap} AP)</Btn>
                <Btn kind="danger" onClick={() => { A; act((st) => A.fireEmployee(st, sel.id)); setSelId(null) }}>Dismiss</Btn>
              </div>
            </div>
            <div>
              <div className="stat-label">KNOWN RELATIONSHIPS</div>
              {Object.entries(sel.relations).length === 0 && <span className="muted">No significant ties.</span>}
              {Object.entries(sel.relations).map(([oid, v]) => {
                const o = s.employees.find((e) => e.id === oid)
                if (!o) return null
                return (
                  <div key={oid} className="kv">
                    <span>{v > 30 ? '🤝' : v < -50 ? '⚔️' : '·'} {o.name} <span className="muted">({o.title})</span></span>
                    <b className="mono">{v > 30 ? 'alliance' : v < -50 ? 'feud' : 'cordial'}</b>
                  </div>
                )
              })}
              <div className="stat-label" style={{ marginTop: 12 }}>RECORD</div>
              {sel.history.slice(-6).map((hh, i) => <div key={i} className="log-line"><span className="w">{i}</span>{hh}</div>)}
              {sel.traits.includes('Ambitious') && sel.level < 4 && (s.flags.sincePromotion ?? 0) > 10 && (
                <div className="alertline warn" style={{ marginTop: 8 }}>This employee has gone {s.flags.sincePromotion} weeks without a promotion and is looking around.</div>
              )}
            </div>
          </div>
        </Panel>
      )}
    </>
  )
}

export const LEVEL_NAMES = LEVELS
