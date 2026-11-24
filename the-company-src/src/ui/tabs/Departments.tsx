import { useState } from 'react'
import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Bar, Btn } from '../components'
import * as A from '../../engine/actions'
import { fmtK } from '../../engine/format'

const EFFECT_HINTS: Record<string, string> = {
  operations: 'Drives revenue and cost of goods. Depends on Logistics and IT.',
  logistics: 'Feeds Operations; failure creates supply events. Supported by IT.',
  it: 'Supports every other department; underfunding causes outages and leaks.',
  rnd: 'Builds future returns via completed projects. Needs IT and Finance.',
  marketing: 'Lifts demand, market share and reputation. Costs cash now.',
  finance: 'Keeper of the books; enables project financing. Needs IT.',
  hr: 'Holds satisfaction and turnover together.',
  planning: 'Long-term strategy; low performance slows the whole portfolio.',
  legal: 'Reduces legal exposure; weak Legal amplifies incidents.',
  pr: 'Maintains public reputation and political cover.',
  security: 'Information security and internal order; blocked leaks.',
  archives: 'Remembers everything. An asset for the investigation.',
}

function DeptCard({ s, act, id }: { s: GameState; act: Act; id: string }) {
  const d = s.departments.find((x) => x.id === id)!
  const [val, setVal] = useState(d.funding)
  const committed = val === d.funding
  const indivs = s.employees.filter((e) => e.dept === id)
  const avgPerf = indivs.length ? Math.round(indivs.reduce((a, e) => a + e.performance, 0) / indivs.length) : null
  const tone = d.performance > 65 ? 'var(--good)' : d.performance < 40 ? 'var(--bad)' : 'var(--warn)'
  return (
    <div className="dept-card">
      <div className="spread">
        <h4>{d.name}</h4>
        <span className="mono" style={{ color: tone }}>{d.performance}/100</span>
      </div>
      <div className="dept-sub">{d.note}</div>
      <Bar value={d.performance} color={tone} />
      <div className="kv" style={{ marginTop: 6 }}><span>Headcount</span><b>{d.headcount.toLocaleString()}</b></div>
      <div className="kv"><span>Weekly budget</span><b>{fmtK(d.baseline * d.funding / 100)}K {d.funding !== 100 && <span className="muted">({d.funding}% of {fmtK(d.baseline)}K)</span>}</b></div>
      <div className="kv"><span>Open individuals</span><b>{indivs.length}{avgPerf !== null ? ` · avg perf ${avgPerf}` : ''}</b></div>
      <input className="range" type="range" min={40} max={200} step={5} value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        onMouseUp={() => act((st) => { A.setFunding(st, id, val) })}
        onTouchEnd={() => act((st) => { A.setFunding(st, id, val) })} />
      <div className="rowflex" style={{ justifyContent: 'space-between' }}>
        <span className="muted" style={{ fontSize: 11 }}>{EFFECT_HINTS[id]}</span>
        {!committed && <Btn kind="small" onClick={() => act((st) => { A.setFunding(st, id, val) })}>Apply {val}%</Btn>}
      </div>
    </div>
  )
}

const IDS = ['operations', 'logistics', 'it', 'rnd', 'marketing', 'finance', 'hr', 'planning', 'legal', 'pr', 'security', 'archives'] as const

export function Departments({ s, act }: { s: GameState; act: Act }) {
  const suspiciousFunded = s.projects.filter((p) => p.status === 'active' && (p.suspicious || p.budgetWeeks >= 999))
  return (
    <>
      <Panel title="Department funding control" right={<span className="muted">Drag to set weekly funding. The organization adapts from next week.</span>}>
        <div className="grid cols-3">
          {IDS.map((id) => <DeptCard key={id} s={s} act={act} id={id} />)}
        </div>
      </Panel>
      <Panel title="Standing cost anomalies">
        {suspiciousFunded.length === 0 && <span className="muted">None currently visible.</span>}
        {suspiciousFunded.map((p) => (
          <div key={p.id} className="alertline warn">
            <span style={{ flex: 1 }}><b>{p.name}</b> permanently funded from {p.dept}: {fmtK(p.weeklyBudget)}K/week. {p.suspicious ?? 'No deliverable ever filed.'}</span>
          </div>
        ))}
      </Panel>
    </>
  )
}
