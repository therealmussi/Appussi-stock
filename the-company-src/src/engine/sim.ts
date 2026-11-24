import { makeRng, hashSeed } from './rng'
import { DEPT_IDS } from './types'
import type {
  BoardDemand, Candidate, DeptId, Employee, EventChoice, GameState, GameEvent,
} from './types'
import { FIRST_NAMES, LAST_NAMES, SPECIALTIES, TRAITS, TITLES } from './content/names'
import { EVENTS } from './content/events'
import { applyEventEffect } from './eventEffects'
import { CONTRADICTIONS, EVIDENCE, INSIGHTS } from './content/docs'

import { clamp, deptById, deptPerf, log } from './actions-helpers'

export function insightCount(s: GameState) {
  return s.insights.length
}
export function mysteryStage(s: GameState): number {
  const n = s.insights.length
  if (n >= 9) return 5
  if (n >= 7) return 4
  if (n >= 5) return 3
  if (n >= 3) return 2
  if (n >= 1) return 1
  return 0
}

// ---------- departments ----------

const SUPPORT: Record<DeptId, { from: DeptId; w: number; name?: string }[]> = {
  operations: [{ from: 'logistics', w: 0.18 }, { from: 'it', w: 0.1 }],
  logistics: [{ from: 'operations', w: 0.1 }, { from: 'it', w: 0.08 }],
  finance: [{ from: 'it', w: 0.15 }],
  hr: [{ from: 'it', w: 0.05 }],
  rnd: [{ from: 'it', w: 0.15 }, { from: 'finance', w: 0.08 }],
  marketing: [{ from: 'pr', w: 0.12 }],
  legal: [{ from: 'archives', w: 0.08 }],
  it: [{ from: 'finance', w: 0.08 }],
  planning: [{ from: 'archives', w: 0.1 }, { from: 'finance', w: 0.08 }],
  pr: [{ from: 'marketing', w: 0.1 }],
  security: [{ from: 'it', w: 0.12 }],
  archives: [{ from: 'it', w: 0.08 }],
}

export function computeDepartments(s: GameState, r: ReturnType<typeof makeRng>) {
  const prev: Record<string, number> = {}
  for (const d of s.departments) prev[d.id] = d.performance
  for (const d of s.departments) {
    let equil = 58
    const f = d.funding
    equil += (f - 100) * 0.2
    for (const sup of SUPPORT[d.id]) equil += (prev[sup.from] - 60) * sup.w * 1.4
    equil += (s.metrics.satisfaction - 56) * 0.25
    equil += (deptIndivAvgPerf(s, d.id) - 58) * 0.3
    equil -= Math.max(0, s.metrics.complexity - 70) * 0.2
    if (s.metrics.stability < 55) equil -= (55 - s.metrics.stability) * 0.2
    if (d.funding < 70) equil -= (70 - d.funding) * 0.25
    if (d.id === 'archives') equil += (s.investigation.archivistTrust - 40) * 0.2
    const v = prev[d.id] + (Math.max(8, Math.min(95, equil)) - prev[d.id]) * 0.45 + r.gauss(0, 1.1)
    d.performance = clamp(Math.round(v), 5, 97)
  }
}

export function deptIndivAvgPerf(s: GameState, id: DeptId): number {
  const list = s.employees.filter((e) => e.dept === id)
  if (!list.length) return 58
  return list.reduce((a, e) => a + e.performance, 0) / list.length
}

// ---------- employees ----------

function updateEmployees(s: GameState, r: ReturnType<typeof makeRng>) {
  const m = s.metrics
  const grief = s.flags.grief ?? 0
  const benefits = s.flags.benefits ?? 1
  for (const e of [...s.employees]) {
    e.stress = clamp(e.stress
      + (deptById(s, e.dept).funding < 80 ? 1.2 : -0.5)
      + (e.traits.includes('Ambitious') && s.flags.sincePromotion > 8 ? 0.8 : 0)
      + r.gauss(0, 1.4))
    const pull = (m.satisfaction - e.satisfaction) * 0.18
    const own = (e.salary > 60 ? 0.4 : 0) + benefits * 1.2 - grief * 0.6 + (e.stress > 72 ? -2 : 0)
    e.satisfaction = clamp(e.satisfaction + pull + own * 0.25 + r.gauss(0, 1.2))
    e.performance = clamp(e.performance + (e.skill - e.performance) * 0.06 - (e.stress > 70 ? 0.8 : 0) + r.gauss(0, 1) + (deptById(s, e.dept).performance > 70 ? 0.3 : 0))
    e.loyalty = clamp(e.loyalty + (e.satisfaction > 65 ? 0.3 : e.satisfaction < 40 ? -0.5 : 0) + r.gauss(0, 0.6))

    const griefPenalty = grief * 2
    const leaveP = Math.max(0, (46 - e.satisfaction) * 0.0022 + (e.ambition > 72 && (s.flags.sincePromotion ?? 0) > 10 && e.level < 4 ? 0.004 : 0) + griefPenalty * 0.001)
    if (r.chance(leaveP)) {
      s.employees = s.employees.filter((x) => x.id !== e.id)
      deptById(s, e.dept).headcount -= 1
      log(s, 'bad', `${e.name} (${e.title}, ${deptById(s, e.dept).name}) resigned. "${e.ambition > 70 ? 'There is nothing left to learn here.' : 'A competitor called. I answered.'}"`)
    }
  }
  if (grief > 0) s.flags.grief = Math.max(0, grief - 1)
}

const CAND_NOTES = [
  'Left a competitor over a pay dispute.',
  'Referred by two department heads who do not speak to each other.',
  'Résumé contains a nine-year gap. Explains it as "gardening".',
  'Was let go in the 2016 restructuring. Speaks of it calmly. Too calmly.',
  'Asks detailed questions about the archives during interviews.',
  'Impeccable references. Suspiciously impeccable.',
  'Previously worked at a subsidiary that you have never heard of.',
]

export function refreshCandidates(s: GameState, r: ReturnType<typeof makeRng>) {
  while (s.candidates.length < 6) {
    const dept = s.departments[r.int(0, s.departments.length - 1)].id
    s.candidates.push({
      id: `cand_${s.week}_${s.candidates.length}_${r.int(0, 9999)}`,
      name: `${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`,
      age: 24 + r.int(0, 33),
      dept,
      skill: clamp(Math.round(38 + r.gauss(14, 16))),
      specialty: r.pick(SPECIALTIES[dept]),
      traits: [r.pick(TRAITS)],
      askSalary: Math.round(46 + r.next() * 90),
      ambition: clamp(Math.round(48 + r.gauss(14, 20))),
      note: r.pick(CAND_NOTES),
    })
  }
}

// ---------- projects ----------

function updateProjects(s: GameState, r: ReturnType<typeof makeRng>) {
  for (const p of s.projects) {
    if (p.status === 'completed') {
      p.returns += p.expectedReturn
      continue
    }
    if (p.status === 'cancelled') continue
    p.elapsed++
    if (p.status === 'stalled') {
      if (r.chance(0.22)) {
        p.status = 'active'
        log(s, 'bad', `Project ${p.name}: budget quietly restored by the department. Nobody requested it visibly.`)
      }
      continue
    }
    const dp = deptPerf(s, p.dept)
    if (p.progress >= 100) { p.status = 'completed'; continue }
    let gain = 0.6 + dp / 90 + (p.weeklyBudget > 100 ? 0.35 : 0) + r.gauss(0, 0.6)
    if (p.requires) {
      for (const req of p.requires) if (deptPerf(s, req) < 32) gain -= 0.8
    }
    const setbackP = (p.risk / 100) * (s.metrics.stability < 50 ? 0.16 : 0.07)
    if (r.chance(setbackP)) {
      gain -= 2.2
      p.log.push(`W${s.week}: setback — ${['supplier issue','staff turnover','scope dispute','data loss','re-baselining'][r.int(0,4)]}`)
    }
    if (p.budgetWeeks >= 999) {
      gain *= 0.05
    }
    p.progress = clamp(p.progress + gain, 0, 100)
    if (p.progress >= 100) {
      p.status = 'completed'
      p.returns += p.expectedReturn
      log(s, 'good', `Project ${p.name} completed${p.expectedReturn === 0 ? '. The completion report runs to 400 pages and concludes that further study is required.' : `; expected return $${p.expectedReturn}K per week.`}`)
      if (p.id === 'ORCHARD' || p.id === 'CONTINUITY' || p.id === 'LEDGER-7') {
        p.progress = 99
        p.status = 'active'
        log(s, 'mystery', `Project ${p.name} was at 100% for one afternoon. By end of day its progress read 99% again. The file has been "re-baselined".`)
      }
    }
    if (!p.suspicious && dp < 25 && r.chance(0.05)) {
      p.status = 'stalled'
      p.log.push(`W${s.week}: stalled — department cannot resource the work.`)
    }
  }
}

// ---------- finance ----------

export function computeFinance(s: GameState, r: ReturnType<typeof makeRng>): void {
  const payrollAgg = s.departments.reduce((a, d) => a + d.headcount, 0) * 1.55
  const payrollInd = s.employees.reduce((a, e) => a + e.salary, 0) / 52
  const deptOpex = s.departments.reduce((a, d) => a + d.baseline * (d.funding / 100), 0)
  const projects = s.projects.filter((p) => p.status === 'active').reduce((a, p) => a + p.weeklyBudget, 0)
  const facilities = s.locations.reduce((a, l) => a + l.weeklyCost, 0)
  const subs = s.subsidiaries.reduce((a, x) => a + (x.status === 'formally-closed' ? x.weeklyPayment * (s.flags.halcyonPaused === 1 ? 0 : 1) : x.weeklyPayment), 0)
  const benefits = (s.flags.benefits ?? 1) * 260
  const cogs = 40000 * (1.12 - deptPerf(s, 'operations') * 0.002) * (deptPerf(s, 'logistics') > 60 ? 0.99 : 1.04)
  const interest = s.metrics.debt * 0.00095

  const m = s.metrics
  const ops = deptPerf(s, 'operations')
  const rep = m.reputation
  const revenue = 92000
    * (0.6 + 0.42 * (ops / 72))
    * (0.86 + 0.14 * (deptPerf(s, 'marketing') / 60))
    * (0.9 + 0.14 * (rep / 58))
    * (0.94 + 0.08 * (m.stability / 66))
    * (0.985 + r.next() * 0.03)
    * (s.flags.demandShock ? Math.max(0.6, 1 - s.flags.demandShock * 0.25) : 1)
  const expenses = payrollAgg + payrollInd + deptOpex + projects + facilities + subs + benefits + cogs + interest
  const profit = revenue - expenses

  m.revenue = revenue
  m.expenses = expenses
  m.profit = profit
  m.cash = Math.max(-999999, m.cash + profit)
  s.lastFinance = {
    revenue: Math.round(revenue), cogs: Math.round(cogs), payroll: Math.round(payrollAgg + payrollInd),
    deptOpex: Math.round(deptOpex), projects: Math.round(projects), facilities: Math.round(facilities),
    interest: Math.round(interest), subsidiaries: Math.round(subs + benefits),
  }

  m.efficiency = Math.round(clamp((deptPerf(s, 'operations') + deptPerf(s, 'logistics') + deptPerf(s, 'it')) / 3))
  m.innovation = Math.round(clamp((deptPerf(s, 'rnd') * 0.7 + deptPerf(s, 'it') * 0.3)))
  m.productivity = Math.round(clamp(s.departments.reduce((a, d) => a + d.performance, 0) / s.departments.length))
  m.turnover = Math.round(Math.max(2, 5 + Math.max(0, 52 - m.satisfaction) * 0.25 + (s.flags.grief ?? 0) * 3))
  m.marketShare = Math.max(0.5, m.marketShare + (deptPerf(s, 'marketing') - 58) * 0.002 + (rep - 55) * 0.001 + r.gauss(0, 0.01) - (s.flags.demandShock ?? 0) * 0.25)

  if (m.cash < 0) {
    m.debt += Math.min(20000, -m.cash)
    m.cash = 0
    if (m.debt > 500000) log(s, 'bad', 'The banks have begun calling daily. Debt is becoming a board-level problem.')
  }
}

// ---------- politics ----------

export function updatePolitics(s: GameState, r: ReturnType<typeof makeRng>) {
  const m = s.metrics
  const margin = m.revenue > 0 ? m.profit / m.revenue : 0
  let dc = 0
  dc += margin > 0.02 ? 1.5 : margin > 0 ? 0.6 : -1.6
  dc += (m.stability - 62) * 0.05
  dc += (m.satisfaction - 58) * 0.03
  for (const d of s.board.demands) {
    if (!d.resolved && s.week > d.deadline) {
      d.resolved = 'expired'
      dc -= 7
      log(s, 'bad', `The board notes that the directive "${d.text}" expired unanswered. Confidence falls.`)
    }
  }
  s.board.confidence = clamp(s.board.confidence + dc + r.gauss(0, 0.7))

  for (const ex of s.executives) {
    if (!ex.active) continue
    ex.trust = clamp(ex.trust + (margin > 0 ? 0.4 : -0.5) + r.gauss(0, 0.8))
  }

  if (s.week % 6 === 2 && s.board.demands.filter((d) => !d.resolved).length < 2) issueDemand(s, r)
  if (s.board.confidence < 20) {
    s.flags.crisisBoard = (s.flags.crisisBoard ?? 0) + 1
    if (s.flags.crisisBoard >= 4) {
      s.ending = 'ending_removed'
    }
  } else s.flags.crisisBoard = 0
}

export function issueDemand(s: GameState, r: ReturnType<typeof makeRng>) {
  const m = s.metrics
  const pool: BoardDemand[] = []
  if (m.profit < 0) pool.push({ id: `bd_cost_${s.week}`, text: 'Reduce departmental operating costs by at least 6% within six weeks.', kind: 'cost', deadline: s.week + 6, issued: s.week, resolved: false })
  if (m.satisfaction < 50) pool.push({ id: `bd_people_${s.week}`, text: 'Address workforce dissatisfaction; the annual survey results are, in the Board\'s words, "unprintable".', kind: 'strategy', deadline: s.week + 6, issued: s.week, resolved: false })
  if (m.boardConfidence < 50) {
    const ex = s.executives.filter((e) => e.active && e.trust < 45)
    if (ex.length) pool.push({ id: `bd_exec_${s.week}`, text: `Dismiss a member of the executive committee. The Board suggests a name in the sealed envelope. It is up to you whom.`, kind: 'dismiss-exec', deadline: s.week + 6, issued: s.week, resolved: false })
  }
  pool.push({ id: `bd_focus_${s.week}`, text: r.pick([
    'Deliver a strategic review: what does Meridian Group actually sell?',
    'Reduce organizational complexity; the Board cannot follow the reporting lines.',
    'Raise the operating margin. The founders are asking questions — actual, literal founders.',
    'Improve operational stability; the last quarter had four separate incidents.',
  ]), kind: 'strategy', deadline: s.week + 6, issued: s.week, resolved: false })
  const d = pool[r.int(0, pool.length - 1)]
  s.board.demands.push(d)
  log(s, 'info', `New board directive: "${d.text}" (due week ${d.deadline}).`)
}

/** Checks cost-type demands compliance (called from finance changes). */
export function checkDemandCompliance(s: GameState) {
  for (const d of s.board.demands) {
    if (d.resolved !== false) continue
    if (d.kind === 'cost') {
      const opex = s.departments.reduce((a, x) => a + x.baseline * (x.funding / 100), 0)
      if (opex <= 19850 * 0.94) {
        d.resolved = 'complied'
        s.board.confidence = clamp(s.board.confidence + 6)
        log(s, 'good', 'The Board acknowledges the cost reduction directive as fulfilled.')
      }
    }
  }
}

// ---------- events ----------

export function rollEvents(s: GameState, r: ReturnType<typeof makeRng>) {
  const eligible = EVENTS.filter((e) => !e.fireOnce || !s.firedEvents.includes(e.id))
  const ok = eligible.filter((e) => !e.condition || e.condition(s))
  if (!ok.length) return
  const scripted = EVENTS.find((e) => (e.id === `script_w${s.week}`) && (e.condition?.(s) ?? true))
  if (r.next() < 0.62 || scripted) {
    const ev = scripted && r.chance(0.9) ? scripted : ok[r.int(0, ok.length - 1)]
    const resolved = resolveEvent(s, ev)
    if (resolved) s.pendingEvents.push(resolved)
  }
}

export function resolveEvent(s: GameState, ev: GameEvent) {
  if (ev.fireOnce) s.firedEvents.push(ev.id)
  log(s, 'info', ev.title)
  return {
    uid: `${ev.id}_${s.week}_${Math.floor(Math.random() * 9999)}`,
    eventId: ev.id,
    title: ev.title,
    text: ev.text,
    choices: (ev.choices ?? []).map((c) => ({ label: c.label, outcome: c.outcome })),
  }
}

export function chooseEventOption(s: GameState, uid: string, index: number) {
  const pe = s.pendingEvents.find((e) => e.uid === uid)
  if (!pe) return
  s.pendingEvents = s.pendingEvents.filter((e) => e.uid !== uid)
  applyEventEffect(s, pe.eventId, index)
}

export function scriptedEvent(s: GameState, id: string) {
  const ev = EVENTS.find((e) => e.id === id)
  if (!ev) return
  const resolved = resolveEvent(s, ev)
  if (resolved) s.pendingEvents.push(resolved)
}

// ---------- mystery ----------

export function updateMystery(s: GameState) {
  for (const ins of INSIGHTS) {
    if (s.insights.includes(ins.id)) continue
    if (ins.requires.every((q) => s.evidence.some((e) => e.id === q))) {
      s.insights.push(ins.id)
      log(s, 'mystery', `CROSS-REFERENCE COMPLETE — ${ins.title}`)
      s.metrics.suspicion = clamp(s.metrics.suspicion + (ins.givesSuspicion ?? 8))
      if (ins.id === 'ins_null') {
        scriptedEvent(s, 'script_null_revealed')
      }
    }
  }
  const actionsUsed = (s.flags.invActions ?? 0) > 0
  if (actionsUsed) s.investigation.suspicion = clamp(s.investigation.suspicion + 1.5)
  else {
    s.investigation.suspicion = clamp(s.investigation.suspicion - 2)
    s.investigation.lowProfile++
  }
  s.flags.invActions = 0
  s.metrics.suspicion = s.investigation.suspicion

  if (s.investigation.suspicion > 65 && !s.flags.custodianEvent && s.week - (s.flags.lastCustodianWeek ?? -9) > 5) {
    s.flags.custodianEvent = 1
    s.flags.lastCustodianWeek = s.week
    scriptedEvent(s, 'ev_custodian_counter')
  }
}

export function compareEvidence(s: GameState, aId: string, bId: string): { found: boolean; message: string } {
  if (aId === bId) return { found: false, message: 'You cannot cross-reference a document with itself.' }
  const key = [aId, bId].sort().join('|')
  if (s.comparedPairs.includes(key)) return { found: false, message: 'Already cross-referenced. No correlation either way.' }
  s.comparedPairs.push(key)
  const c = CONTRADICTIONS.find((x) => (x.a === aId && x.b === bId) || (x.a === bId && x.b === aId))
  if (c) {
    if (s.insights.includes(c.insight)) return { found: false, message: 'This correlation is already part of your working theory.' }
    s.insights.push(c.insight)
    const ins = INSIGHTS.find((i) => i.id === c.insight)!
    log(s, 'mystery', `CROSS-REFERENCE COMPLETE — ${ins.title}`)
    s.metrics.suspicion = clamp(s.metrics.suspicion + (ins.givesSuspicion ?? 8))
    s.investigation.suspicion = s.metrics.suspicion
    if (c.insight === 'ins_null') scriptedEvent(s, 'script_null_revealed')
    return { found: true, message: `CONTRADICTION CONFIRMED — ${ins.title}. ${ins.text}` }
  }
  return { found: false, message: 'You compare the documents closely. The detail is consistent, the dates align, and nothing surfaces — this pair tells the same story.' }
}

// ---------- weekly orchestration ----------

export function advanceWeek(s: GameState): void {
  if (s.ending || s.pendingEvents.length) return
  const r = makeRng((s.seed ^ (s.week * 2654435761)) >>> 0)
  s.week++
  s.flags.sincePromotion = (s.flags.sincePromotion ?? 0) + 1
  if (s.flags.demandShock) s.flags.demandShock = Math.max(0, s.flags.demandShock - 1)

  if (s.flags.halcyonPaused === 1 && s.week - (s.flags.halcyonPausedSince ?? 0) >= 2) {
    s.flags.halcyonPaused = 2
    log(s, 'mystery', 'The Halcyon payments have resumed. Treasury has no record of authorizing the resumption; the instruction file shows your own signature, dated yesterday, in a hand close to but not quite your own.')
    s.investigation.suspicion = clamp(s.investigation.suspicion + 8)
  }
  computeDepartments(s, r)
  updateEmployees(s, r)
  updateProjects(s, r)

  const m = s.metrics
  m.satisfaction = clamp(Math.round(
    (m.satisfaction * 0.75)
    + (s.employees.reduce((a, e) => a + e.satisfaction, 0) / Math.max(1, s.employees.length)) * 0.25
    + ((s.flags.benefits ?? 1) - 1) * 2
    - (s.flags.grief ?? 0) * 1.5
    + (deptPerf(s, 'hr') - 55) * 0.05
    + r.gauss(0, 0.8),
  ))
  m.reputation = clamp(m.reputation + (deptPerf(s, 'pr') - 55) * 0.05 + (deptPerf(s, 'marketing') - 58) * 0.04 + (m.satisfaction - 58) * 0.03 + r.gauss(0, 0.6))
  const stresses = s.employees.reduce((a, e) => a + e.stress, 0) / Math.max(1, s.employees.length)
  let stability = 50 + (m.satisfaction - 58) * 0.25 + (deptPerf(s, 'legal') - 58) * 0.12 + (deptPerf(s, 'security') - 58) * 0.25 - Math.max(0, s.investigation.suspicion - 50) * 0.25 - (stresses - 45) * 0.25
  if (m.cash < 12000) stability -= 6
  m.stability = clamp(Math.round(m.stability + (stability - m.stability) * 0.3 + r.gauss(0, 1)))
  m.complexity = clamp(Math.round(m.complexity - (s.flags.complexityDrop ?? 0) + 0.08))
  s.flags.complexityDrop = 0

  computeFinance(s, r)
  updatePolitics(s, r)
  rollEvents(s, r)
  updateMystery(s)
  refreshCandidates(s, r)

  s.ap = 3 + (deptPerf(s, 'archives') > 72 ? 1 : 0)
  s.history.push({
    week: s.week, revenue: Math.round(m.revenue), profit: Math.round(m.profit), cash: Math.round(m.cash),
    satisfaction: m.satisfaction, reputation: Math.round(m.reputation), productivity: m.productivity, stability: m.stability,
  })
  if (s.history.length > 300) s.history.splice(0, s.history.length - 300)

  log(s, 'money', `Week ${s.week}: revenue $${Math.round(m.revenue).toLocaleString()}K, expenses $${Math.round(m.expenses).toLocaleString()}K, net $${Math.round(m.profit).toLocaleString()}K. Cash $${Math.round(m.cash).toLocaleString()}K.`)
}

// ---------- misc helpers used by actions/events ----------

export function nextEvidenceForAction(s: GameState, kind: 'finance' | 'archive' | 'payroll' | 'facility' | 'subsidiary' | 'legal'): string | null {
  const stage = mysteryStage(s)
  const owned = (id: string) => s.evidence.some((e) => e.id === id)
  const first = (ids: string[]) => ids.find((id) => !owned(id)) ?? null
  switch (kind) {
    case 'finance':
      return first(['ev_finance_alloc', 'ev_finance_halcyon', 'ev_finance_d4', 'ev_orchard_2'])
    case 'archive':
      if (stage >= 2) return first(['ev_basement_b4', 'ev_regulator_1971', 'ev_min_1971', 'ev_chart_1984'])
      return first(['ev_chart_1984', 'ev_regulator_1971', 'ev_min_1971', 'ev_basement_b4'])
    case 'payroll':
      return first(['ev_payroll_5', 'ev_int_custodian5'])
    case 'facility':
      return first(['ev_basement_b4', 'ev_int_archivist'])
    case 'subsidiary':
      return first(['ev_sub_halcyon', 'ev_sig_1998'])
    case 'legal':
      return first(['ev_sig_1998', 'ev_regulator_1971'])
  }
}

export function candidateToEmployee(s: GameState, c: Candidate): Employee {
  const r = makeRng((hashSeed(c.id)) >>> 0)
  return {
    id: `emp_h_${c.id}`,
    name: c.name, age: c.age, dept: c.dept, title: TITLES[1][0], level: 1,
    salary: c.askSalary, skill: c.skill, specialty: c.specialty, traits: [...c.traits, r.pick(TRAITS)].filter((t, i, a) => a.indexOf(t) === i),
    satisfaction: 62, performance: clamp(c.skill - 5 + r.int(-5, 10)), stress: 30, tenure: 0,
    ambition: c.ambition, loyalty: 55, relations: {},
    history: [`Week ${s.week} — hired into ${deptById(s, c.dept).name}.`],
  }
}

export function evidenceById(id: string) {
  return EVIDENCE[id]
}

export const EVENT_TRANSFORM = (
  s: GameState,
  evId: string,
): EventChoice[] => {
  const ev = EVENTS.find((e) => e.id === evId)
  return ev?.choices ?? []
}

export const ALL_DEPTS = DEPT_IDS
