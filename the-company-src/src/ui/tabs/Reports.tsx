import type { GameState } from '../../engine/types'
import { Panel, Sparkline } from '../components'

export function Reports({ s }: { s: GameState }) {
  const evs = (key: 'revenue' | 'profit' | 'cash' | 'satisfaction' | 'reputation' | 'productivity' | 'stability') =>
    [...s.history].map((x) => x[key] as number)
  return (
    <>
      <div className="grid cols-2">
        <Panel title="Revenue & cash">
          <div className="rowflex"><span className="stat-label">REVENUE</span><Sparkline data={evs('revenue')} width={460} height={60} /></div>
          <div className="rowflex" style={{ marginTop: 6 }}><span className="stat-label">NET PROFIT</span><Sparkline data={evs('profit')} width={460} height={60} color="var(--good)" /></div>
          <div className="rowflex" style={{ marginTop: 6 }}><span className="stat-label">CASH</span><Sparkline data={evs('cash')} width={460} height={60} color="var(--warn)" /></div>
        </Panel>
        <Panel title="Human indicators">
          <div className="rowflex"><span className="stat-label">SATISFACTION</span><Sparkline data={evs('satisfaction')} width={460} height={60} /></div>
          <div className="rowflex" style={{ marginTop: 6 }}><span className="stat-label">PRODUCTIVITY</span><Sparkline data={evs('productivity')} width={460} height={60} color="var(--good)" /></div>
          <div className="rowflex" style={{ marginTop: 6 }}><span className="stat-label">STABILITY</span><Sparkline data={evs('stability')} width={460} height={60} color="var(--warn)" /></div>
        </Panel>
      </div>
      <Panel title="Executive log" right={<span className="muted">{s.log.length} entries</span>}>
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {[...s.log].reverse().map((l, i) => (
            <div key={i} className={`log-line ${l.kind}`}><span className="w">WK {String(l.week).padStart(2, '0')}</span>{l.text}</div>
          ))}
        </div>
      </Panel>
    </>
  )
}
