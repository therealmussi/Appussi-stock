import { useState } from 'react'
import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Bar, Tag } from '../components'

export function MapTab({ s }: { s: GameState; act: Act }) {
  const [sel, setSel] = useState('loc_hq')
  const site = s.locations.find((l) => l.id === sel) ?? s.locations[0]
  const kinds: Record<string, string> = { HQ: '■', 'HQ-REGIONAL': '▣', FACTORY: '⚙', LAB: '⚗', WAREHOUSE: '▤', OFFICE: '▥' }
  return (
    <>
      <Panel title="Corporate footprint — 10,000 employees across 8 properties">
        <div className="rowflex" style={{ gap: 10 }}>
          <div className="muted" style={{ fontSize: 12 }}>
            Network schematic: Meridian HQ (Capital District) at the center; regional operations by function.
          </div>
        </div>
        <div className="site-grid" style={{ marginTop: 10 }}>
          {s.locations.map((l) => {
            const tone = l.productivity > 65 ? 'var(--good)' : l.productivity < 55 ? 'var(--bad)' : 'var(--warn)'
            return (
              <div key={l.id} className={`dept-card mapnode ${l.id === site.id ? 'selected' : ''}`}
                style={{ borderColor: l.id === site.id ? 'var(--accent)' : 'var(--line)' }}
                onClick={() => setSel(l.id)}>
                <div className="spread">
                  <h5>{kinds[l.kind]} {l.name}</h5>
                  <span className="mono" style={{ color: tone, fontSize: 12 }}>{Math.round(l.productivity)}</span>
                </div>
                <div className="muted" style={{ fontSize: 11 }}>{l.kind} · {l.place}</div>
                <div className="kv"><span>Headcount</span><b>{l.headcount.toLocaleString()}</b></div>
                <div className="kv"><span>Weekly cost</span><b>${l.weeklyCost}K</b></div>
                <Bar value={l.productivity} color={tone} height={4} />
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title={`Site detail: ${site.name} — ${site.place}`}>
        <div className="grid cols-2">
          <div>
            <div className="kv"><span>Type</span><b>{site.kind}</b></div>
            <div className="kv"><span>Headcount</span><b>{site.headcount.toLocaleString()}</b></div>
            <div className="kv"><span>Weekly operating cost</span><b>${site.weeklyCost.toLocaleString()}K</b></div>
            <div className="kv"><span>Productivity</span><b>{Math.round(site.productivity)}/100</b></div>
            <div className="chip-row" style={{ marginTop: 8 }}>
              {site.depts.map((d) => <Tag key={d}>{d}</Tag>)}
            </div>
            {site.issue && <div className="alertline warn" style={{ marginTop: 8 }}>Local issue: {site.issue}</div>}
          </div>
          <div>
            <div className="stat-label">PROJECTS HOSTED HERE</div>
            {s.projects.filter((p) => p.dept && site.depts.includes(p.dept) && p.status === 'active').map((p) => (
              <div key={p.id} className="kv"><span>{p.name}</span><b className="mono">{Math.floor(p.progress)}%</b></div>
            ))}
            <div className="stat-label" style={{ marginTop: 10 }}>SUBSIDIARY RELATIONS</div>
            {s.subsidiaries.slice(0, 4).map((sub) => (
              <div key={sub.id} className="kv">
                <span>{sub.name} <span className="muted">({sub.sector})</span></span>
                <b className="mono">{sub.status === 'active' ? `$${sub.weeklyPayment}K/wk` : sub.status === 'formally-closed' ? `$${sub.weeklyPayment}K/wk ⚠` : `$${sub.weeklyPayment}K/wk`}</b>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  )
}
