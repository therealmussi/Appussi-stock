import type { GameState } from './types'
import { clamp, deptById, log, deptPerf } from './actions-helpers'
import { unlockEvidence } from './world'
import { nextEvidenceForAction, compareEvidence } from './sim'
import { INSIGHTS, EVIDENCE } from './content/docs'
import { TITLES } from './content/names'

let uidCounter = 0
function spend(s: GameState, kind: 'inv'): boolean {
  if (kind === 'inv' && s.ap <= 0) return false
  if (kind === 'inv') s.ap--
  s.flags.invActions = (s.flags.invActions ?? 0) + 1
  return true
}

// ---------- budgets ----------

export function setFunding(s: GameState, deptId: string, value: number) {
  const d = deptById(s, deptId as never)
  d.funding = clamp(Math.round(value), 40, 200)
  log(s, 'info', `${d.name} funding set to ${d.funding}% of baseline ($${Math.round(d.baseline * d.funding / 100).toLocaleString()}K/week).`)
}

export function setBenefits(s: GameState, level: number) {
  s.flags.benefits = level
  const names = ['Baseline', 'Standard', 'Enhanced', 'Generous']
  log(s, 'info', `Employee benefits package set to: ${names[level]}.`)
}

export function companyRaise(s: GameState, pct: number) {
  for (const e of s.employees) e.salary = Math.round(e.salary * (1 + pct / 100))
  s.flags.grief = Math.max(0, (s.flags.grief ?? 0) - 2)
  for (const e of s.employees) e.satisfaction = clamp(e.satisfaction + pct * 1.5)
  log(s, 'money', `Company-wide salary adjustment: ${pct > 0 ? '+' : ''}${pct}%. Payroll ${pct > 0 ? 'rises' : 'falls'} accordingly.`)
}

export function adjustSalary(s: GameState, empId: string, pct: number) {
  const e = s.employees.find((x) => x.id === empId)
  if (!e) return
  e.salary = Math.max(18, Math.round(e.salary * (1 + pct / 100)))
  e.satisfaction = clamp(e.satisfaction + pct * (e.traits.includes('Opportunistic') ? 2 : 1.4))
  log(s, 'info', `${e.name}: salary ${pct > 0 ? '+' : ''}${pct}%.`)
}

// ---------- people ----------

export function hireCandidate(s: GameState, candId: string): string | null {
  const c = s.candidates.find((x) => x.id === candId)
  if (!c) return 'Candidate no longer available.'
  const cost = Math.round(c.askSalary * 1.5)
  if (s.metrics.cash < cost) return `Not enough cash for the signing package ($${cost}K).`
  s.metrics.cash -= cost
  const emp = {
    id: `emp_h_${c.id}`, name: c.name, age: c.age, dept: c.dept,
    title: 'Associate', level: 1 as const, salary: c.askSalary,
    skill: c.skill, specialty: c.specialty,
    traits: [...new Set([...c.traits, 'Analytical', 'Loyal', 'Ambitious', 'Creative', 'Conservative'].slice(0, 1 + (c.skill % 2)))],
    satisfaction: 62, performance: clamp(c.skill - 5), stress: 30, tenure: 0,
    ambition: c.ambition, loyalty: 55, relations: {},
    history: [`Week ${s.week} — hired into ${deptById(s, c.dept).name} (signing cost $${cost}K).`],
  }
  s.employees.push(emp)
  deptById(s, c.dept).headcount += 250
  s.candidates = s.candidates.filter((x) => x.id !== candId)
  log(s, 'good', `${c.name} hired into ${deptById(s, c.dept).name}.`)
  return null
}

export function fireEmployee(s: GameState, empId: string): string | null {
  const e = s.employees.find((x) => x.id === empId)
  if (!e) return 'No such employee.'
  if (e.flagged?.startsWith('Station')) return 'Quill, by internal phone, before you can act: "The stations are not staffed by you, Executive." The dismissal is blocked at every level console you try.'
  s.employees = s.employees.filter((x) => x.id !== empId)
  deptById(s, e.dept).headcount = Math.max(0, deptById(s, e.dept).headcount - 250)
  s.flags.grief = (s.flags.grief ?? 0) + 3
  for (const o of s.employees) {
    const rel = o.relations[empId]
    if (rel !== undefined && rel > 30) o.satisfaction = clamp(o.satisfaction - 10)
    o.satisfaction = clamp(o.satisfaction - 1.5)
  }
  log(s, 'bad', `${e.name} (${e.title}) dismissed. Morale takes the hit; Legal quietly notes the severance case ($${Math.round(e.salary * 0.5)}K).`)
  s.metrics.cash -= Math.round(e.salary * 0.5)
  return null
}

export function promoteEmployee(s: GameState, empId: string): string | null {
  const e = s.employees.find((x) => x.id === empId)
  if (!e) return 'No such employee.'
  if (e.level >= 4) return 'Already at the top of the grade structure.'
  e.level = (e.level + 1) as 1 | 2 | 3 | 4
  if (!e.flagged) e.title = TITLES[e.level][0]
  e.salary = Math.round(e.salary * 1.32)
  e.satisfaction = clamp(e.satisfaction + 16)
  e.stress = clamp(e.stress + 6)
  s.flags.sincePromotion = 0
  const rivals = s.employees.filter((o) => o.dept === e.dept && o.id !== e.id && o.ambition > 65 && o.level >= e.level - 1)
  for (const riv of rivals) riv.satisfaction = clamp(riv.satisfaction - 5)
  log(s, 'info', `${e.name} promoted to ${e.title === 'Records Custodian' ? e.title : e.title.replace('Senior ', '')} (level ${e.level}). ${rivals.length} colleague(s) with ambitions took note.`)
  return null
}

export function flattenManagement(s: GameState): string | null {
  const managers = s.employees.filter((e) => e.level === 3)
  const directors = s.employees.filter((e) => e.level === 4)
  const drop = 8 + managers.length
  s.flags.complexityDrop = (s.flags.complexityDrop ?? 0) + drop
  const cohesion = s.employees.filter((e) => e.level >= 3)
    .flatMap((e) => Object.values(e.relations))
    .reduce((a, v) => a + Math.max(0, v), 0)
  const resist = cohesion / Math.max(1, s.employees.filter((e) => e.level >= 3).length) > 28
  for (const e of s.employees.filter((x) => x.level >= 3)) e.satisfaction = clamp(e.satisfaction - (resist ? 14 : 8))
  for (const e of s.employees.filter((x) => x.level < 3)) e.satisfaction = clamp(e.satisfaction + (resist ? 2 : 5))
  log(s, resist ? 'bad' : 'good', `Management layer review executed. Organizational complexity −${drop}. ${resist ? 'Senior management resists in an organized way: the middle layer coordinated, briefed each other, and slow-walked every instruction.' : 'The remaining managers absorb the duties; the floor notices the decision speed.'}`)
  return null
}

export function callDestinyReview(s: GameState): string {
  const m = s.metrics
  const margin = m.revenue > 0 ? m.profit / m.revenue : -1
  const ins = s.insights.length
  if (m.cash < 5000) return 'ending_collapse'
  if (ins >= 9 || s.flags.confronted) return 'confront_menu'
  if (m.efficiency > 72 && m.satisfaction > 68 && m.reputation > 68 && m.stability > 68) return 'ending_reformer'
  if (margin > 0.14 && m.satisfaction < 46) return 'ending_tycoon'
  if (m.complexity > 82 && m.stability > 64 && ins === 0) return 'ending_bureaucrat'
  if (m.complexity < 40 && m.satisfaction > 66) return 'ending_revolution'
  if (margin > 0.1) return 'ending_tycoon'
  return 'ending_steward'
}

// ---------- board ----------

export function complyDemand(s: GameState, id: string) {
  const d = s.board.demands.find((x) => x.id === id)
  if (!d || d.resolved !== false) return
  d.resolved = 'complied'
  s.board.confidence = clamp(s.board.confidence + 6)
  log(s, 'good', `Directive executed: "${d.text}".`)
  if (d.kind === 'headcount') {
    for (const dep of s.departments) dep.headcount = Math.max(50, Math.round(dep.headcount * 0.97))
    s.flags.grief = (s.flags.grief ?? 0) + 2
    log(s, 'info', 'Voluntary severance program executed across departments.')
  }
}

export function refuseDemand(s: GameState, id: string) {
  const d = s.board.demands.find((x) => x.id === id)
  if (!d || d.resolved !== false) return
  d.resolved = 'refused'
  s.board.confidence = clamp(s.board.confidence - 8)
  log(s, 'bad', `You refused the directive "${d.text}". The Board notes your independence. And files it.`)
}

export function dismissExecutive(s: GameState, exId: string) {
  const ex = s.executives.find((e) => e.id === exId)
  if (!ex || !ex.active) return
  ex.active = false
  const d = deptById(s, ex.dept)
  d.performance = clamp(d.performance - 9)
  s.board.confidence = clamp(s.board.confidence + 4)
  for (const o of s.executives.filter((e) => e.active)) o.trust = clamp(o.trust - 8)
  log(s, 'bad', `${ex.name} (${ex.role}) has been dismissed. The department is rattled; the other executives watch how easily it was done.`)
  const dmd = s.board.demands.find((x) => x.kind === 'dismiss-exec' && x.resolved === false)
  if (dmd) { dmd.resolved = 'complied'; s.board.confidence = clamp(s.board.confidence + 4) }
  log(s, 'mystery', `${ex.name}'s office is cleared within the hour. The archive requests her records the same day. They are returned complete — except for one folder, marked "withheld pending review", which is never reviewed by anyone you can find.`)
}

export function boardBriefing(s: GameState, emphasis: 'efficiency' | 'growth' | 'stability' | 'truth') {
  const m = s.metrics
  switch (emphasis) {
    case 'efficiency': s.board.confidence = clamp(s.board.confidence + (m.efficiency > 60 ? 4 : -1)); s.board.pressure += 5; break
    case 'growth': s.board.confidence = clamp(s.board.confidence + (m.revenue > 92000 ? 4 : -1)); s.board.pressure += 5; break
    case 'stability': s.board.confidence = clamp(s.board.confidence + (m.stability > 60 ? 4 : -1)); break
    case 'truth':
      if (s.insights.length >= 2) {
        s.board.confidence = clamp(s.board.confidence + 6)
        s.investigation.suspicion = clamp(s.investigation.suspicion + 10)
        log(s, 'mystery', 'You table the cross-referenced findings. Two directors go very still. The Chairman says only: "The 1971 file is not the Board\'s file." Someone else at the table disagrees, silently.')
      } else {
        s.board.confidence = clamp(s.board.confidence - 3)
        log(s, 'info', 'You warn the Board about irregularities. With no cross-referenced evidence, it reads as the usual new-CEO restructuring talk.')
      }
      break
  }
  log(s, 'info', `Quarterly briefing delivered (emphasis: ${emphasis}).`)
}

// ---------- projects ----------

export function cancelProject(s: GameState, id: string): string | null {
  const p = s.projects.find((x) => x.id === id)
  if (!p || p.status !== 'active' && p.status !== 'stalled') return null
  if (p.id === 'CONTINUITY' || p.id === 'LEDGER-7') {
    p.status = 'active'
    s.investigation.suspicion = clamp(s.investigation.suspicion + 8)
    log(s, 'mystery', `You sign the cancellation of ${p.name}. The next morning the project is active, the cancellation minute is missing from the record, and your signature on it is described in the register as "pending countersignature" — by an office with no name.`)
    return 'The project resists cancellation. Investigate before trying again.'
  }
  if (p.id === 'ORCHARD') {
    p.status = 'active'
    s.investigation.suspicion = clamp(s.investigation.suspicion + 5)
    const other = deptPerf(s, 'planning') > deptPerf(s, 'rnd') ? 'Strategic Planning' : 'Research & Development'
    log(s, 'mystery', `You cancel ORCHARD under R&D. ${other} immediately lodges a formal objection: they claim co-ownership and restore funding from their own budget line. The double-booking protects it.`)
    return 'ORCHARD is protected by its double-booking. Cross-reference the project dossiers to break the protection.'
  }
  p.status = 'cancelled'
  log(s, 'info', `Project ${p.name} cancelled. $${p.weeklyBudget}K/week released.`)
  for (const e of s.employees.filter((x) => x.dept === p.dept)) e.satisfaction = clamp(e.satisfaction - 1)
  return null
}

export function setProjectWatch(s: GameState, id: string) {
  const p = s.projects.find((x) => x.id === id)
  if (!p || p.status !== 'active') return
  p.status = 'stalled'
  log(s, 'info', `Project ${p.name} placed under budget watch. Work pauses; watch the department's reaction.`)
}

export function resumeProject(s: GameState, id: string) {
  const p = s.projects.find((x) => x.id === id)
  if (!p || p.status !== 'stalled') return
  p.status = 'active'
  log(s, 'info', `Project ${p.name} resumed.`)
}

export function boostProject(s: GameState, id: string): string | null {
  const p = s.projects.find((x) => x.id === id)
  if (!p || p.status !== 'active') return null
  p.weeklyBudget = Math.round(p.weeklyBudget * 1.3)
  log(s, 'money', `Project ${p.name} budget boosted 30% (now $${p.weeklyBudget}K/week).`)
  return null
}

// ---------- subsidiaries ----------

export function closeSubsidiary(s: GameState, id: string): string | null {
  const sub = s.subsidiaries.find((x) => x.id === id)
  if (!sub || sub.status !== 'active' && sub.status !== 'unlisted') return null
  sub.status = 'formally-closed'
  log(s, 'money', `${sub.name} wound down. Payments scheduled to stop ($${sub.weeklyPayment}K/week).`)
  if (id === 'sub_marlow') {
    log(s, 'mystery', 'HR reports a benefits nightmare: 900 pensions were quietly issued through Marlow Assurance. Winding it down unleashes a compliance storm (legal exposure up).')
    deptById(s, 'legal').performance = clamp(deptById(s, 'legal').performance - 10)
  }
  return null
}

export function stopHalcyonPayments(s: GameState): string | null {
  const sub = s.subsidiaries.find((x) => x.id === 'sub_halcyon')!
  if (s.flags.halcyonPaused) return 'Payments are already suspended — check the ledger next week.'
  s.flags.halcyonPaused = 1
  s.flags.halcyonPausedSince = s.week
  s.investigation.suspicion = clamp(s.investigation.suspicion + 10)
  log(s, 'mystery', 'You instruct Treasury to suspend the Halcyon payments. Treasury confirms. The instruction is confirmed again, in writing, twice.')
  return null
}

// ---------- investigation ----------

export function invFinanceAudit(s: GameState): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const id = nextEvidenceForAction(s, 'finance')
  if (!id) return 'The books yield nothing new — for now.'
  unlockEvidence(s, id)
  log(s, 'mystery', `Finance audit produced a working paper: "${id}".`)
  s.investigation.suspicion = clamp(s.investigation.suspicion + 3)
  return null
}

export function invArchiveDig(s: GameState): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const stage = s.insights.length >= 5 ? 3 : s.insights.length >= 3 ? 2 : 1
  const id = nextEvidenceForAction(s, 'archive')
  if (!id) return 'The Archives have given you everything they will — for now.'
  const needsQuill = id === 'ev_basement_b4'
  if (needsQuill && s.investigation.archivistTrust < 55) {
    return 'Quill declines to pull the facility records: "Ask again when we know each other better." (Earn his trust — interviews, the invitation, results.)'
  }
  unlockEvidence(s, id)
  log(s, 'mystery', `Archive retrieval: a document surfaces — "${EVIDENCE[id].title}".`)
  return null
}

export function invPayrollAudit(s: GameState): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const id = nextEvidenceForAction(s, 'payroll')
  if (!id) return 'Payroll has given you all it has.'
  unlockEvidence(s, id)
  log(s, 'mystery', `Payroll audit complete: "${EVIDENCE[id].title}".`)
  s.investigation.suspicion = clamp(s.investigation.suspicion + 4)
  return null
}

export function invFacilitiesAudit(s: GameState): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const id = nextEvidenceForAction(s, 'facility')
  if (!id) return 'Facilities records turned over. Nothing else surfaces this time.'
  if (id === 'ev_int_archivist' && s.investigation.archivistTrust < 50) {
    return 'The Archivist declines the walk-through: "Not yet." He is not being difficult. He is being careful.'
  }
  unlockEvidence(s, id)
  log(s, 'mystery', `Facilities audit: "${EVIDENCE[id].title}".`)
  s.investigation.suspicion = clamp(s.investigation.suspicion + 5)
  return null
}

export function invSubsidiaryCheck(s: GameState, subId: string): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const sub = s.subsidiaries.find((x) => x.id === subId)
  if (!sub) return 'No such subsidiary.'
  sub.interrogated = true
  if (subId === 'sub_halcyon') {
    const id = nextEvidenceForAction(s, 'subsidiary')
    if (id) {
      unlockEvidence(s, id)
      log(s, 'mystery', `Subsidiary file pulled: "${EVIDENCE[id].title}".`)
      return null
    }
    return 'The Halcyon file has already told you what it can.'
  }
  log(s, 'info', `${sub.name}: records reviewed. ${sub.note} Nothing criminally interesting — which is, in this company, mildly comforting.`)
  return null
}

export function invInterview(s: GameState, empId: string): string | null {
  if (!spend(s, 'inv')) return 'No investigation capacity left this week.'
  const e = s.employees.find((x) => x.id === empId)
  if (!e) return 'No such employee.'
  s.investigation.interviewsDone.push(empId)
  if (e.name === 'Ezra Quill' || e.title === 'Corporate Archivist') {
    s.investigation.archivistTrust = clamp(s.investigation.archivistTrust + 12)
  }
  if (e.knowledge && !s.evidence.some((x) => x.id === e.knowledge)) {
    unlockEvidence(s, e.knowledge)
    log(s, 'mystery', `Interview recorded: "${e.knowledge}" — from ${e.name}.`)
    return null
  }
  log(s, 'info', `Interview with ${e.name}: ${e.performance > 70 ? 'capable, guarded' : e.satisfaction < 40 ? 'unhappy, and happy to say so' : 'polite, unremarkable'}. Nothing actionable emerges.`)
  return null
}

export function invExecutiveTalk(s: GameState, exId: string): string | null {
  const ex = s.executives.find((e) => e.id === exId)
  if (!ex || !ex.active) return 'Not available.'
  if (s.ap <= 0) return 'No investigation capacity left this week.'
  s.ap--; s.flags.invActions = (s.flags.invActions ?? 0) + 1
  ex.trust = clamp(ex.trust + 4)
  if (ex.id === 'exe_quill') s.investigation.archivistTrust = clamp(s.investigation.archivistTrust + 8)
  if (ex.trust > 65 && !s.evidence.some((e) => e.id === 'ev_int_cfo') && ex.id === 'exe_hale') {
    unlockEvidence(s, 'ev_int_cfo')
    log(s, 'mystery', 'Hale, guarded, gives you the thread: "Read the Trust. And do it with the Archives." (New evidence: Interview: M. Hale)')
    return null
  }
  if (ex.trust > 60 && ex.secret) {
    log(s, 'mystery', `${ex.name}, late in the conversation, almost tells you something about "${ex.secret.slice(0, 40)}…" — then refills your coffee and leaves.`)
    return null
  }
  if (ex.id === 'exe_quill' && s.investigation.archivistTrust > 70 && !s.evidence.some((e) => e.id === 'ev_int_archivist')) {
    unlockEvidence(s, 'ev_int_archivist')
    log(s, 'mystery', 'Quill talks — carefully — about floors the plans omit. (New evidence: Interview: E. Quill)')
    return null
  }
  log(s, 'info', `${ex.name}: ${ex.agenda}`)
  return null
}

export function confrontTruth(s: GameState, choice: 'expose' | 'control' | 'seal'): void {
  s.flags.confronted = 1
  const m = s.metrics
  switch (choice) {
    case 'expose':
      s.ending = 'ending_truth_expose'
      m.reputation = clamp(m.reputation + 15)
      m.stability = clamp(m.stability - 25)
      break
    case 'control':
      s.ending = 'ending_truth_control'
      m.cash += 61200 / 52
      m.boardConfidence = clamp(m.boardConfidence + 10)
      break
    case 'seal':
      s.ending = 'ending_unknown'
      m.stability = clamp(m.stability + 10)
      break
  }
}

export function resign(s: GameState): void {
  s.ending = 'ending_resign'
}

export const INSIGHT_LIST = INSIGHTS

export function compareEvidencePublic(s: GameState, a: string, b: string): string {
  return compareEvidence(s, a, b).message
}
