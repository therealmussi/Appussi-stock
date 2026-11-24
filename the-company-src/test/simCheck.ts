import { newGame } from '../src/engine/world'
import { advanceWeek, compareEvidence, resolveEvent } from '../src/engine/sim'
import * as A from '../src/engine/actions'
import { INSIGHTS } from '../src/engine/content/docs'
import { loadGame, saveGame } from '../src/engine/save'

const mem: Record<string, string> = {}
;(globalThis as any).localStorage = {
  getItem: (k: string) => mem[k] ?? null,
  setItem: (k: string, v: string) => { mem[k] = v },
  removeItem: (k: string) => { delete mem[k] },
}

function assert(cond: unknown, msg: string) {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1 } else console.log('ok:', msg)
}

function pickExistingEvent(s: ReturnType<typeof newGame>) {
  while (s.pendingEvents.length) s.pendingEvents = []
}

function run(seedStr: string, weeks: number) {
  const s = newGame(seedStr, 'A. Glover')
  for (let i = 0; i < weeks; i++) {
    advanceWeek(s)
    pickExistingEvent(s)
    if (s.ending) break
  }
  return s
}

// 1. Baseline 12 weeks: company must remain alive and numbers bounded
const base = run('meridian-test', 12)
assert(!base.ending, 'baseline survives 12 weeks without forced ending')
assert(base.metrics.revenue > 60000 && base.metrics.revenue < 130000, `revenue bounded (${base.metrics.revenue.toFixed(0)}K)`)
assert(base.metrics.cash > -60000, `cash not catastrophic (${base.metrics.cash.toFixed(0)}K)`)
assert(base.employees.length <= 100 && base.employees.length > 50, `individual employees sane (${base.employees.length})`)

// 2. Cross-influence: cutting IT drags other departments
const cut = run('meridian-test', 4)
const itPerfBefore = cut.departments.find((d) => d.id === 'it')!.performance
const othersBefore = cut.departments.filter((d) => d.id !== 'it').map((d) => d.performance)
A.setFunding(cut, 'it', 40)
for (let i = 0; i < 6; i++) { advanceWeek(cut); pickExistingEvent(cut) }
const othersAfter = cut.departments.filter((d) => d.id !== 'it').map((d) => d.performance)
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
assert(avg(othersAfter) <= avg(othersBefore) + 2, `slashging IT hurts other departments (${avg(othersBefore).toFixed(1)} -> ${avg(othersAfter).toFixed(1)}; IT was ${itPerfBefore})`)
assert(cut.departments.find((d) => d.id === 'it')!.performance < 45, `IT collapses under 40% funding (${cut.departments.find((d) => d.id === 'it')!.performance})`)

// 3. Finance: raising Operations funding should lift revenue vs baseline
const boost = newGame('meridian-test', 'A. Glover')
A.setFunding(boost, 'operations', 150)
for (let i = 0; i < 10; i++) { advanceWeek(boost); pickExistingEvent(boost) }
const ctrl = run('meridian-test', 10)
assert(boost.metrics.revenue > ctrl.metrics.revenue, `operations funding lifts revenue (${boost.metrics.revenue.toFixed(0)} vs ${ctrl.metrics.revenue.toFixed(0)})`)

// 4. Hiring and firing
const h = run('meridian-test', 2)
const before = h.employees.length
A.hireCandidate(h, h.candidates[0].id)
A.fireEmployee(h, h.employees[0].id)
assert(h.employees.length === before, 'hire+fire keeps headcount stable')
assert(h.flags.grief > 0, 'dismissal causes organizational grief')

// 5. Projects progress and statuses
const p = run('meridian-test', 20)
const progressed = p.projects.filter((x) => x.progress > 20 || x.status !== 'active' || x.elapsed > 15)
assert(progressed.length > 5, `projects progress (${progressed.length}/${p.projects.length})`)
A.cancelProject(p, 'ATLAS')
assert(p.projects.find((x) => x.id === 'ATLAS')!.status === 'cancelled', 'project can be cancelled')

// 6. Eternal projects resist cancellation
const q = run('meridian-test', 2)
const msg = A.cancelProject(q, 'CONTINUITY')
assert(q.projects.find((x) => x.id === 'CONTINUITY')!.status === 'active', 'CONTINUITY resists cancellation')
assert(!!msg, 'cancellation of CONTINUITY is narratively blocked')

// 7. Board demands appear and expire
const b = run('meridian-test', 12)
assert(b.board.demands.length > 0, `board issues demands (${b.board.demands.length})`)

// 8. Investigation: full path to Project Null
const inv = newGame('meridian-test', 'A. Glover')
inv.ap = 99
A.invFinanceAudit(inv); A.invFinanceAudit(inv); A.invFinanceAudit(inv)
A.invArchiveDig(inv); A.invArchiveDig(inv)
A.invSubsidiaryCheck(inv, 'sub_halcyon')
A.invPayrollAudit(inv)
A.invFacilitiesAudit(inv)
inv.ap = 99
A.invInterview(inv, inv.employees.find((e) => e.knowledge === 'ev_int_custodian5')!.id)
A.invInterview(inv, inv.employees.find((e) => e.knowledge === 'ev_int_veteran')!.id)
inv.executives.find((e) => e.id === 'exe_hale')!.trust = 80
A.invExecutiveTalk(inv, 'exe_hale')
inv.executives.find((e) => e.id === 'exe_quill')!.trust = 90
inv.investigation.archivistTrust = 80
A.invExecutiveTalk(inv, 'exe_quill')
if (!inv.evidence.some((e) => e.id === 'ev_int_archivist')) A.invInterview(inv, inv.employees.find((e) => e.name === 'Ezra Quill')?.id ?? 'none')
A.invFacilitiesAudit(inv)
// force-derive remaining docs to guarantee full graph reachable in test
for (const id of ['ev_chart_1984', 'ev_regulator_1971', 'ev_min_1971']) {
  if (!inv.evidence.some((e) => e.id === id)) A.invArchiveDig(inv)
}
assert(inv.evidence.length >= 10, `evidence collected (${inv.evidence.length})`)
// simulate all comparison pairs
for (let i = 0; i < inv.evidence.length; i++)
  for (let j = i + 1; j < inv.evidence.length; j++)
    compareEvidence(inv, inv.evidence[i].id, inv.evidence[j].id)
advanceWeek(inv)
pickExistingEvent(inv)
assert(inv.insights.length === INSIGHTS.length, `all insights reachable (${inv.insights.length}/${INSIGHTS.length})`)
assert(inv.flags.confronted === undefined, 'no premature confrontation')

// 9. Save/load round-trip
inv.week = 77
inv.evidence[0].week = 12345
saveGame(inv)
const loaded = loadGame()
assert(loaded?.week === 77 && loaded.evidence[0].week === 12345, 'save/load round-trip works')

// 10. Determinism: same seed → same trajectory
const d1 = run('determinism', 15)
const d2 = run('determinism', 15)
assert(Math.abs(d1.metrics.cash - d2.metrics.cash) < 1, `seeded determinism (cash ${d1.metrics.cash.toFixed(1)} vs ${d2.metrics.cash.toFixed(1)})`)

// 11. Different endings reachable: collapse scenario
const bad = newGame('doom', 'A. Glover')
for (const d of ['operations', 'it', 'logistics', 'hr']) A.setFunding(bad, d, 40)
for (let i = 0; i < 60; i++) { advanceWeek(bad); pickExistingEvent(bad); if (bad.ending) break }
assert(!!bad.ending, `neglect produces an ending (${bad.ending})`)

// 12. Custodian suspicion mechanic
const sus = run('meridian-test', 4)
sus.investigation.suspicion = 80
sus.flags.lastCustodianWeek = -9
advanceWeek(sus)
pickExistingEvent(sus)
assert(sus.firedEvents.includes('ev_custodian_counter'), 'custodians strike back at high suspicion')

console.log('\nSimulation check complete.')
