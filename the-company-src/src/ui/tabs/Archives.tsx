import type { GameState } from '../../engine/types'
import { Panel, Tag } from '../components'
import { EVIDENCE } from '../../engine/content/docs'

export function Archives({ s }: { s: GameState }) {
  const docs = s.evidence.filter((e) => e.source.startsWith('Corporate Archives') || ['ev_letter_1968', 'ev_chart_1984', 'ev_min_1971', 'ev_regulator_1971', 'ev_basement_b4'].includes(e.id))
  const others = s.evidence.filter((e) => !docs.includes(e))
  return (
    <>
      <Panel title="Corporate archives — retained documents (1958 → present)" right={<span className="muted">{s.evidence.length} documents in your possession</span>}>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 0 }}>
          "The record is complete from 1958 onward, with four regrettable gaps." — E. Quill, Corporate Archivist
        </p>
        {docs.map((d) => (
          <div key={d.id} className="arch-row">
            <h5>{d.title}</h5>
            <div className="ev-src">{d.source} · dated "{d.title.split('(')[1]?.replace(')', '') ?? '—'}" · retrieved wk {d.week}</div>
            <div className="rowflex">{d.tags.map((t) => <Tag key={t} tone={(t === 'CONTINUITY' || t === 'CUSTODIAN' || t === 'TRUST') ? 'mystery' : ''}>{t}</Tag>)}</div>
            <div className="ev-text">{d.text}</div>
          </div>
        ))}
      </Panel>
      <Panel title="Requisitions, reports & testimonies">
        {others.length === 0 && <span className="muted">Nothing else in the public record yet.</span>}
        {others.map((d) => (
          <div key={d.id} className="arch-row">
            <h5>{d.title}</h5>
            <div className="ev-src">{d.source} · retrieved wk {d.week}</div>
            <div className="rowflex">{d.tags.map((t) => <Tag key={t} tone={(t === 'CONTINUITY' || t === 'CUSTODIAN' || t === 'TRUST') ? 'mystery' : ''}>{t}</Tag>)}</div>
            <div className="ev-text">{d.text}</div>
          </div>
        ))}
      </Panel>
    </>
  )
}

export const _totalDocs = Object.keys(EVIDENCE).length
