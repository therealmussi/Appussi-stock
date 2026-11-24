import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Bar, Btn, Tag } from '../components'
import * as A from '../../engine/actions'
import { fmtK } from '../../engine/format'

const badge = (p: GameState['projects'][number]) => {
  if (p.status === 'completed') return <Tag tone="good">COMPLETED</Tag>
  if (p.status === 'cancelled') return <Tag tone="bad">CANCELLED</Tag>
  if (p.status === 'stalled') return <Tag tone="bad">WATCH</Tag>
  if (p.budgetWeeks >= 999) return <Tag tone="bad">ETERNAL</Tag>
  return <Tag>ACTIVE</Tag>
}

export function Projects({ s, act }: { s: GameState; act: Act }) {
  const ordered = [...s.projects].sort((a, b) => (a.suspicious ? 0 : 1) - (b.suspicious ? 0 : 1))
  const flaggedKnown = s.insights.length >= 2
  return (
    <Panel title={`Project portfolio — ${s.projects.filter((p) => p.status === 'active').length} active, burning ${fmtK(s.projects.filter((p) => p.status === 'active').reduce((a, p) => a + p.weeklyBudget, 0))}K/week`}>
      <div className="grid cols-2">
        {ordered.map((p) => {
          const tone = p.status === 'completed' ? 'var(--good)' : p.status === 'stalled' || p.status === 'cancelled' ? 'var(--bad)' : p.suspicious ? 'var(--mystery)' : 'var(--accent)'
          return (
            <div key={p.id} className="dept-card" style={p.suspicious && flaggedKnown ? { borderColor: 'var(--mystery)' } : undefined}>
              <div className="spread">
                <h4>{p.name} <span className="muted" style={{ fontSize: 11 }}>· {p.dept}{p.requires?.length ? ` · needs ${p.requires.join(', ')}` : ''}</span></h4>
                {badge(p)}
              </div>
              <div className="dept-sub">{p.desc}</div>
              {p.suspicious && flaggedKnown && <div className="alertline bad">{p.suspicious}</div>}
              <Bar value={p.progress} color={tone} />
              <div className="rowflex" style={{ marginTop: 6, gap: 14 }}>
                <div className="kv" style={{ flex: 1 }}><span>Progress</span><b>{Math.floor(p.progress)}%</b></div>
                <div className="kv" style={{ flex: 1 }}><span>Budget</span><b>{fmtK(p.weeklyBudget)}K/wk</b></div>
                <div className="kv" style={{ flex: 1 }}><span>Age</span><b>{p.elapsed} wk</b></div>
                <div className="kv" style={{ flex: 1 }}><span>Risk</span><b>{p.risk}</b></div>
                <div className="kv" style={{ flex: 1 }}><span>Exp. return</span><b>{p.expectedReturn ? `${fmtK(p.expectedReturn)}K/wk` : '—'}</b></div>
                <div className="kv" style={{ flex: 1 }}><span>Returns so far</span><b>{fmtK(p.returns)}K</b></div>
              </div>
              {p.log.slice(-2).map((l, i) => <div key={i} className="muted" style={{ fontSize: 11 }}>{l}</div>)}
              {p.status !== 'completed' && p.status !== 'cancelled' && (
                <div className="rowflex" style={{ marginTop: 8 }}>
                  {p.status === 'active'
                    ? <Btn kind="small" onClick={() => act((st) => A.setProjectWatch(st, p.id))}>Budget watch</Btn>
                    : <Btn kind="small" onClick={() => act((st) => A.resumeProject(st, p.id))}>Resume</Btn>}
                  <Btn kind="small" onClick={() => act((st) => A.boostProject(st, p.id))}>Boost +30% budget</Btn>
                  <Btn kind="danger" onClick={() => act((st) => A.cancelProject(st, p.id))}>Cancel</Btn>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
