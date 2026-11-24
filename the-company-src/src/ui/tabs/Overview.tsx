import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Stat, Gauge, Sparkline, Btn } from '../components'
import { fmtK } from '../../engine/format'
import { DEPT_IDS } from '../../engine/types'

export function Overview({ s, act }: { s: GameState; act: Act }) {
  const m = s.metrics
  const h = s.history
  const evs = (key: keyof GameState['history'][number]) => h.map((x) => x[key] as number)
  const alerts: { text: string; tone: 'warn' | 'bad' }[] = []
  if (m.cash < 12000) alerts.push({ text: `Cash critical: $${fmtK(m.cash)}K remaining. Finance is stretching payables.`, tone: m.cash < 5000 ? 'bad' : 'warn' })
  if (m.satisfaction < 42) alerts.push({ text: 'Workforce dissatisfaction is severe. The works council is filing things.', tone: 'warn' })
  if (m.stability < 40) alerts.push({ text: `Organizational stability ${m.stability}/100 — incidents likely.`, tone: 'bad' })
  if (s.board.confidence < 40) alerts.push({ text: `Board confidence at ${Math.round(s.board.confidence)}/100. Expect another directive.`, tone: 'warn' })
  if (m.turnover > 18) alerts.push({ text: `Turnover at ${m.turnover}%`, tone: 'warn' })
  if (s.investigation.suspicion > 55) alerts.push({ text: 'Someone inside the company is aware of your investigation.', tone: 'bad' })
  const unhandled = s.board.demands.filter((d) => !d.resolved)

  return (
    <>
      <div className="grid cols-4">
        <Stat label="Revenue / week" value={`${fmtK(m.revenue)}K`} sub={h.length > 1 ? `trend ${m.revenue >= h[h.length - 2].revenue ? '▲' : '▼'} vs last week` : undefined} />
        <Stat label="Expenses / week" value={`${fmtK(m.expenses)}K`} sub="payroll · opex · projects · COGS" />
        <Stat label="Net profit / week" value={`${fmtK(m.profit)}K`} tone={m.profit >= 0 ? 'good' : 'bad'} sub={`margin ${((m.profit / Math.max(1, m.revenue)) * 100).toFixed(1)}%`} />
        <Stat label="Cash reserves" value={`${fmtK(m.cash)}K`} tone={m.cash < 12000 ? 'bad' : ''} sub={`debt ${fmtK(m.debt)}K`} />
      </div>

      <div className="grid cols-2" style={{ marginTop: 12 }}>
        <Panel title="Organizational health">
          <Gauge label="Employee satisfaction" value={m.satisfaction} />
          <Gauge label="Productivity" value={m.productivity} />
          <Gauge label="Stability" value={m.stability} />
          <Gauge label="Brand reputation" value={m.reputation} />
          <Gauge label="Operational efficiency" value={m.efficiency} />
          <Gauge label="Innovation" value={m.innovation} />
        </Panel>
        <div>
          <Panel title="Market & structure">
            <div className="kv"><span>Market share</span><b>{m.marketShare.toFixed(2)}%</b></div>
            <div className="kv"><span>Organizational complexity</span><b>{Math.round(m.complexity)}/100</b></div>
            <div className="kv"><span>Annualized turnover</span><b>{m.turnover}%</b></div>
            <div className="kv"><span>Workforce (total)</span><b>{(s.departments.reduce((a, d) => a + d.headcount, 0)).toLocaleString()} + executives</b></div>
            <div className="kv"><span>Simulated individuals</span><b>{s.employees.length}</b></div>
            <div className="kv"><span>Active projects</span><b>{s.projects.filter((p) => p.status === 'active').length}</b></div>
            <div style={{ marginTop: 10 }} className="rowflex">
              <span className="stat-label">REVENUE TREND</span>
              <Sparkline data={evs('revenue')} width={200} />
            </div>
            <div className="rowflex">
              <span className="stat-label">STABILITY TREND</span>
              <Sparkline data={evs('stability')} width={200} color="var(--warn)" />
            </div>
          </Panel>
          <Panel title="This week's alerts">
            {alerts.length === 0 && <span className="muted">No pressing alerts. Suspicious, in this company.</span>}
            {alerts.map((a, i) => <div key={i} className={`alertline ${a.tone}`}>{a.text}</div>)}
          </Panel>
        </div>
      </div>

      <Panel title="Standing decisions">
        {unhandled.length === 0 && <span className="muted">No open board directives.</span>}
        {unhandled.map((d) => (
          <div key={d.id} className="alertline warn">
            <span style={{ flex: 1 }}>{d.text} <span className="muted">(due week {d.deadline})</span></span>
          </div>
        ))}
        {s.projects.filter((p) => p.status === 'stalled').map((p) => (
          <div key={p.id} className="alertline">
            <span style={{ flex: 1 }}>Project {p.name} is under budget watch in {p.dept}.</span>
          </div>
        ))}
        {DEPT_IDS.filter((id) => s.departments.find((d) => d.id === id)!.performance < 45).map((id) => {
          const d = s.departments.find((x) => x.id === id)!
          return (
            <div key={id} className="alertline bad">
              <span style={{ flex: 1 }}>{d.name} performing at {d.performance}/100 — review funding or personnel.</span>
            </div>
          )
        })}
      </Panel>
    </>
  )
}
