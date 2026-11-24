import { useState } from 'react'
import type { GameState } from '../../engine/types'
import type { Act } from '../../App'
import { Panel, Btn, Bar, Tag } from '../components'
import * as A from '../../engine/actions'
import { INSIGHTS } from '../../engine/content/docs'

export function Investigations({ s, act, onConfront }: { s: GameState; act: Act; onConfront: () => void }) {
  const [selA, setSelA] = useState<string | null>(null)
  const [selB, setSelB] = useState<string | null>(null)

  const pick = (id: string) => {
    if (selA === id) { setSelA(null); return }
    if (selB === id) { setSelB(null); return }
    if (!selA) { setSelA(id); return }
    if (!selB) { setSelB(id); return }
    setSelA(null); setSelB(null)
  }

  const compare = () => {
    if (!selA || !selB) return
    act((st: GameState) => A.compareEvidencePublic(st, selA, selB))
  }

  const canConfront = s.insights.includes('ins_null')
  const insightObjs = INSIGHTS.filter((i) => s.insights.includes(i.id))

  return (
    <>
      <div className="grid cols-3">
        <Panel title="Investigation desk" right={<span className="muted mono">{s.ap} AP left this week</span>}>
          <p className="muted" style={{ marginTop: 0, fontSize: 12.5 }}>
            Every active probe raises internal suspicion: someone is watching you watch them. Weeks without
            investigation activity let suspicion decay.
          </p>
          <div className="alertline {tone}">Suspicion: <Bar value={s.investigation.suspicion} color={s.investigation.suspicion > 60 ? 'var(--bad)' : 'var(--warn)'} height={5} /></div>
          <div className="alertline {tone}">Archivist trust: <Bar value={s.investigation.archivistTrust} color="var(--mystery)" height={5} /></div>
          <div className="rowflex" style={{ marginTop: 10 }}>
            <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invFinanceAudit(st))}>Audit the books</Btn>
            <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invArchiveDig(st))}>Search the archives</Btn>
          </div>
          <div className="rowflex" style={{ marginTop: 6 }}>
            <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invPayrollAudit(st))}>Payroll audit</Btn>
            <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invFacilitiesAudit(st))}>Facilities audit</Btn>
          </div>
          <div className="rowflex" style={{ marginTop: 6 }}>
            <Btn kind="small" disabled={s.ap <= 0} onClick={() => act((st) => A.invSubsidiaryCheck(st, 'sub_halcyon'))}>Examine Halcyon file</Btn>
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            Interviews with individual employees and executives are available from their profiles and the Board Room.
          </div>
        </Panel>

        <Panel title="Evidence board" className="span-2" right={<span className="muted">Select two documents to cross-reference</span>}>
          <div className="rowflex" style={{ marginBottom: 8 }}>
            <Btn kind="primary" disabled={!selA || !selB} onClick={compare}>Cross-reference selected pair</Btn>
            <Btn kind="ghost" onClick={() => { setSelA(null); setSelB(null) }}>Clear</Btn>
            {selA && <Tag tone="gold">A: {selA}</Tag>}
            {selB && <Tag tone="gold">B: {selB}</Tag>}
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {s.evidence.map((ev) => {
              const isSel = ev.id === selA || ev.id === selB
              return (
                <div key={ev.id} className={`ev-card ${isSel ? 'selected' : ''}`} onClick={() => pick(ev.id)}>
                  <h5>{ev.title}</h5>
                  <div className="ev-src">{ev.source} · week {ev.week}</div>
                  <div className="rowflex">{ev.tags.map((t) => <Tag key={t} tone={t === 'CONTINUITY' || t === 'CUSTODIAN' ? 'mystery' : ''}>{t}</Tag>)}</div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <Panel title={`Working theory — ${insightObjs.length}/9 conclusions`} right={
        canConfront ? <Btn kind="gold" onClick={onConfront}>Confront the truth (Board Room)</Btn> : <span className="muted">9 conclusions exist. Cross-reference documents to build the theory.</span>
      }>
        {insightObjs.length === 0 && <span className="muted">No conclusions yet. Audit the books, pull files, interview people — then compare what you learn.</span>}
        {insightObjs.map((i, n) => (
          <div key={i.id} className="insight-card">
            <h5>{n + 1}. {i.title}</h5>
            <div style={{ fontSize: 13, color: '#c9c2dd' }}>{i.text}</div>
          </div>
        ))}
      </Panel>
    </>
  )
}
