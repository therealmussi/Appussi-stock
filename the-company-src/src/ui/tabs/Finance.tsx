import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Btn, Sparkline, Tag } from '../components'
import * as A from '../../engine/actions'
import { fmtK } from '../../engine/format'

export function Finance({ s, act }: { s: GameState; act: Act }) {
  const f = s.lastFinance
  const cash = s.history.map((x) => x.cash)
  const profit = s.history.map((x) => x.profit)
  const rows: [string, number, string][] = [
    ['Cost of goods & services', f.cogs, 'Scales with Operations performance.'],
    ['Payroll (aggregate workforce)', f.payroll, '10,000 employees at ~1.55K/week average.'],
    ['Department operations', f.deptOpex, 'Sum of all funding levels.'],
    ['Active projects', f.projects, 'Billing while active or silently re-funded.'],
    ['Facilities & sites', f.facilities, 'Eight locations. Leases rarely get cheaper.'],
    ['Subsidiaries & benefits', f.subsidiaries, 'Payments to subsidiaries + benefits program.'],
    ['Debt interest', f.interest, 'On outstanding debt.'],
  ]
  return (
    <>
      <div className="grid cols-4">
        <div className="stat"><span className="stat-label">Revenue / week</span><span className="stat-value">{fmtK(f.revenue)}K</span></div>
        <div className="stat"><span className="stat-label">Expenses / week</span><span className="stat-value">{fmtK(s.metrics.expenses)}K</span></div>
        <div className={`stat ${s.metrics.profit >= 0 ? 'good' : 'bad'}`}><span className="stat-label">Net / week</span><span className="stat-value">{fmtK(s.metrics.profit)}K</span></div>
        <div className={`stat ${s.metrics.cash < 12000 ? 'bad' : ''}`}><span className="stat-label">Cash</span><span className="stat-value">{fmtK(s.metrics.cash)}K</span></div>
      </div>
      <div className="grid cols-2" style={{ marginTop: 12 }}>
        <Panel title="Profit & loss breakdown">
          <table className="tbl"><tbody>
            <tr><td><b style={{ color: 'var(--good)' }}>Revenue</b></td><td className="mono" style={{ color: 'var(--good)' }}>{fmtK(f.revenue)}K</td><td className="muted">market, ops, reputation-driven</td></tr>
            {rows.map(([label, v, hint]) => (
              <tr key={label}><td>{label}</td><td className="mono">−{fmtK(v)}K</td><td className="muted" style={{ fontSize: 11 }}>{hint}</td></tr>
            ))}
            <tr><td><b>Net</b></td><td className="mono" style={{ color: s.metrics.profit >= 0 ? 'var(--good)' : 'var(--bad)' }}>{fmtK(s.metrics.profit)}K</td><td /></tr>
          </tbody></table>
          <div className="rowflex" style={{ marginTop: 10 }}>
            <span className="stat-label">BENEFITS PACKAGE</span>
            <Btn kind="small" onClick={() => act((st) => A.setBenefits(st, 0))}>Baseline</Btn>
            <Btn kind="small" onClick={() => act((st) => A.setBenefits(st, 1))}>Standard</Btn>
            <Btn kind="small" onClick={() => act((st) => A.setBenefits(st, 2))}>Enhanced</Btn>
            <Btn kind="small" onClick={() => act((st) => A.setBenefits(st, 3))}>Generous</Btn>
            <span className="muted">current: {['Baseline', 'Standard', 'Enhanced', 'Generous'][s.flags.benefits ?? 1]}</span>
          </div>
          <div className="rowflex" style={{ marginTop: 6 }}>
            <span className="stat-label">SALARIES</span>
            <Btn kind="small" onClick={() => act((st) => A.companyRaise(st, 3))}>+3% across the board</Btn>
            <Btn kind="small" onClick={() => act((st) => A.companyRaise(st, -3))}>−3% across the board</Btn>
          </div>
        </Panel>
        <div>
          <Panel title="Cash trajectory">
            <div className="rowflex"><span className="stat-label">CASH</span><Sparkline data={cash} width={420} height={54} /></div>
            <div className="rowflex" style={{ marginTop: 6 }}><span className="stat-label">NET PROFIT / WEEK</span><Sparkline data={profit} width={420} height={54} color="var(--good)" /></div>
            <div className="kv" style={{ marginTop: 8 }}><span>Gross debt</span><b>{fmtK(s.metrics.debt)}K</b></div>
            <div className="muted" style={{ fontSize: 12 }}>If cash runs dry, deficits convert to debt. Above ~$500M debt, the banks escalate.</div>
          </Panel>
          <Panel title="Subsidiaries" right={<span className="muted">Weekly payment · status</span>}>
            <table className="tbl"><tbody>
              {s.subsidiaries.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <b>{sub.name}</b> <Tag>{sub.sector} · {sub.incorporated}</Tag>
                    {sub.status === 'formally-closed' && <Tag tone="bad">DISSOLVED</Tag>}
                    {sub.status === 'unlisted' && <Tag tone="bad">UNLISTED</Tag>}
                    {sub.interrogated && <Tag tone="good">REVIEWED</Tag>}
                    <div className="muted" style={{ fontSize: 12 }}>{sub.note}</div>
                  </td>
                  <td className="mono">{fmtK(sub.weeklyPayment)}K</td>
                  <td>
                    {sub.id === 'sub_halcyon'
                      ? <Btn kind="small" onClick={() => act((st) => A.stopHalcyonPayments(st))}>Suspend payments</Btn>
                      : sub.status === 'active' && <Btn kind="small" onClick={() => act((st) => A.closeSubsidiary(st, sub.id))}>Wind down</Btn>}
                  </td>
                </tr>
              ))}
            </tbody></table>
          </Panel>
        </div>
      </div>
    </>
  )
}
