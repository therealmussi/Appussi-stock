import { useState } from 'react'
import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Btn, Bar, Tag } from '../components'
import * as A from '../../engine/actions'

export function Board({ s, act, onConfront }: { s: GameState; act: Act; onConfront?: () => void }) {
  const b = s.board
  const open = b.demands.filter((d) => !d.resolved)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const destiny = () => {
    const probe = structuredClone(s)
    const code = A.callDestinyReview(probe)
    if (code === 'confront_menu' && onConfront) { onConfront(); return }
    act((st) => { st.ending = code as never })
  }

  return (
    <>
      <div className="grid cols-2">
        <Panel title="Board confidence">
          <div className="spread">
            <span className="stat-value" style={{ color: b.confidence < 35 ? 'var(--bad)' : b.confidence > 60 ? 'var(--good)' : 'var(--warn)' }}>{Math.round(b.confidence)}/100</span>
            <span className="muted">pressure {Math.round(b.pressure)}</span>
          </div>
          <Bar value={b.confidence} color={b.confidence < 35 ? 'var(--bad)' : b.confidence > 60 ? 'var(--good)' : 'var(--warn)'} height={8} />
          <p className="muted" style={{ fontSize: 12.5 }}>
            Confidence rises with margins, stability and satisfied employees; it falls with missed directives and red ink.
            Below 20 for four consecutive weeks, the Board replaces you.
          </p>
          <div className="stat-label">QUARTERLY BRIEFING — CHOOSE THE FRAMING</div>
          <div className="rowflex" style={{ marginTop: 6 }}>
            <Btn kind="small" onClick={() => act((st) => A.boardBriefing(st, 'efficiency'))}>Efficiency</Btn>
            <Btn kind="small" onClick={() => act((st) => A.boardBriefing(st, 'growth'))}>Growth</Btn>
            <Btn kind="small" onClick={() => act((st) => A.boardBriefing(st, 'stability'))}>Stability</Btn>
            <Btn kind="small" onClick={() => act((st) => A.boardBriefing(st, 'truth'))}>Table the irregularities</Btn>
          </div>
          {s.week >= 40 && (
            <div style={{ marginTop: 12 }}>
              <Btn kind="gold" onClick={destiny}>Convene destiny review</Btn>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                Formally define what Meridian Group will be under your leadership. Available from week 40.
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Standing directives">
          {open.length === 0 && <span className="muted">The Board is (outwardly) satisfied.</span>}
          {open.map((d) => (
            <div key={d.id} className="alertline warn">
              <span style={{ flex: 1 }}>{d.text} <span className="muted mono">(due wk {d.deadline})</span></span>
              <Btn kind="small" onClick={() => act((st) => A.complyDemand(st, d.id))}>Comply</Btn>
              <Btn kind="danger" onClick={() => act((st) => A.refuseDemand(st, d.id))}>Refuse</Btn>
            </div>
          ))}
          {b.demands.filter((d) => d.resolved !== false).slice(-3).map((d) => (
            <div key={d.id} className="kv"><span>{d.text}</span><b className="muted">{d.resolved}</b></div>
          ))}
        </Panel>
      </div>

      <Panel title="Executive committee">
        <div className="grid cols-3">
          {s.executives.map((ex) => ex.active ? (
            <div key={ex.id} className="dept-card" style={{ borderColor: ex.trust < 35 ? 'var(--bad)' : 'var(--line)' }}>
              <div className="spread"><h4>{ex.name}</h4><span className="muted" style={{ fontSize: 11 }}>{ex.role}</span></div>
              <div className="dept-sub">{ex.agenda}</div>
              <div className="kv"><span>Trust in you</span><b style={{ color: ex.trust < 35 ? 'var(--bad)' : 'var(--text)' }}>{Math.round(ex.trust)}</b></div>
              <div className="kv"><span>Ambition / influence</span><b>{ex.ambition} / {ex.influence}</b></div>
              {ex.secret && s.insights.length >= 4 && <Tag tone="mystery">knows more than they say</Tag>}
              <div className="rowflex" style={{ marginTop: 8 }}>
                <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invExecutiveTalk(st, ex.id))}>Meet ({s.ap} AP)</Btn>
                {confirmId === ex.id
                  ? <Btn kind="danger" onClick={() => { setConfirmId(null); act((st) => { A.dismissExecutive(st, ex.id) }) }}>Confirm dismissal?</Btn>
                  : <Btn kind="danger" onClick={() => setConfirmId(ex.id)}>Dismiss</Btn>}
              </div>
            </div>
          ) : (
            <div key={ex.id} className="dept-card" style={{ opacity: .45 }}>
              <h4>{ex.name}</h4>
              <div className="dept-sub">{ex.role} — departed during your mandate.</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
