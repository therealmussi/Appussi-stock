import { newGame, unlockEvidence } from '../src/engine/world'
import { advanceWeek, compareEvidence, insightCount, mysteryStage } from '../src/engine/sim'
import * as A from '../src/engine/actions'
import { ENDINGS } from '../src/engine/endings'
import { INSIGHTS } from '../src/engine/content/docs'

let s = newGame('destiny-run', 'A. Glover')
// good management
A.setBenefits(s, 2)
for (const d of ['operations','logistics','it','hr','finance']) A.setFunding(s, d, 115)
for (let i = 0; i < 45; i++) {
  advanceWeek(s); s.pendingEvents = []
  if (s.board.confidence < 45) s.board.confidence += 8
  for (const d of ['operations','hr']) s.departments.find(x=>x.id===d)!.funding = Math.min(160, s.departments.find(x=>x.id===d)!.funding + 5)
  if (s.ending) break
}
console.log('wk', s.week, 'cash', Math.round(s.metrics.cash), 'eff', s.metrics.efficiency, 'sat', s.metrics.satisfaction, 'rep', Math.round(s.metrics.reputation), 'stab', s.metrics.stability, 'margin', (s.metrics.profit/s.metrics.revenue*100).toFixed(1)+'%')
const code = A.callDestinyReview(s)
console.log('destiny review →', code, '| ending exists:', !!ENDINGS[code], code==='confront_menu'?'(truth available)':'')

// full truth run (engine-forced evidence like simCheck)
let t = newGame('truth-run', 'A. Glover')
t.ap = 99
const order: [number, any][] = [
  [1, null], [1, null], [1, null],
  [2, null], [2, null], [5, 'sub_halcyon'],
  [3, null], [4, null],
]
const fns = ['invFinanceAudit','invArchiveDig','invPayrollAudit','invFacilitiesAudit','invSubsidiaryCheck']
for (const [fn, arg] of order) { const f = (A as any)[fns[fn - 1]!]; f(t, arg) }
for (const emp of t.employees.filter(e=>e.knowledge==='ev_int_custodian5'||e.knowledge==='ev_int_veteran')) A.invInterview(t, emp.id)
t.investigation.archivistTrust = 80
for (let i=0;i<6;i++) if (!t.evidence.some(e=>e.id==='ev_int_archivist')) A.invFacilitiesAudit(t)
t.executives.find((e) => e.id === 'exe_hale')!.trust = 80
A.invExecutiveTalk(t, 'exe_hale')
t.executives.find((e) => e.id === 'exe_quill')!.trust = 90
A.invExecutiveTalk(t, 'exe_quill')
for (let i=0;i<4;i++) A.invArchiveDig(t)
for (let i = 0; i < t.evidence.length; i++) for (let j = i+1; j < t.evidence.length; j++) compareEvidence(t, t.evidence[i].id, t.evidence[j].id)
advanceWeek(t); t.pendingEvents = []
console.log('truth run: evidence', t.evidence.length, 'insights', t.insights.length, '/9  stage', mysteryStage(t))
if (t.insights.includes('ins_null')) { A.confrontTruth(t, 'expose'); console.log('confront →', t.ending, '| ending exists:', !!ENDINGS[t.ending!]) }
else { const miss = INSIGHTS.filter(i=>!t.insights.includes(i.id)).map(i=>i.id+':'+i.requires.filter(r=>!t.evidence.some(e=>e.id===r))); console.log('MISSING', miss) }
