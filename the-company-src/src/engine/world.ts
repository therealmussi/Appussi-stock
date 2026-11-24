import { makeRng, hashSeed } from './rng'
import { DEPT_IDS } from './types'
import type {
  Candidate, Department, DeptId, Employee, Evidence, Executive, GameState,
  LocationSite, Level, Metrics, Subsidiary,
} from './types'
import { FIRST_NAMES, LAST_NAMES, SPECIALTIES, TRAITS, TITLES } from './content/names'
import { initialProjects } from './content/projects'
import { EVIDENCE } from './content/docs'

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v))

export const DEPT_BASE: { id: DeptId; name: string; headcount: number; baseline: number; note: string }[] = [
  { id: 'operations', name: 'Operations', headcount: 2400, baseline: 6200, note: 'Runs the plants and the service lines. The closest thing Meridian has to an actual output.' },
  { id: 'logistics', name: 'Logistics', headcount: 1500, baseline: 4100, note: 'Fleet, freight, warehouses. Consistently described in audits as "adequate, somehow".' },
  { id: 'it', name: 'Information Technology', headcount: 900, baseline: 1500, note: 'Maintains aging systems that strange things seem to depend on.' },
  { id: 'rnd', name: 'Research & Development', headcount: 1200, baseline: 2400, note: 'Produces patents, prototypes and one very old open question.' },
  { id: 'marketing', name: 'Marketing', headcount: 800, baseline: 1800, note: 'Sells the idea that Meridian has a coherent offering.' },
  { id: 'finance', name: 'Finance', headcount: 700, baseline: 900, note: 'Balances books that contain lines nobody wants explained.' },
  { id: 'hr', name: 'Human Resources', headcount: 450, baseline: 700, note: 'Manages the workforce and its heavy, patient unhappiness.' },
  { id: 'planning', name: 'Strategic Planning', headcount: 300, baseline: 500, note: 'Owns the long-term strategy. Has owned the same strategy since 1994.' },
  { id: 'legal', name: 'Legal & Compliance', headcount: 250, baseline: 500, note: 'Guarded, competent, and aware of more than it volunteers.' },
  { id: 'security', name: 'Security', headcount: 350, baseline: 600, note: 'Access control, loss prevention, and quiet institutional loyalty.' },
  { id: 'pr', name: 'Public Relations', headcount: 200, baseline: 400, note: 'Maintains the public Meridian: modest, stable, slightly boring.' },
  { id: 'archives', name: 'Corporate Archives', headcount: 150, baseline: 250, note: 'Fifty-six years of records. Remembers what the org chart has forgotten.' },
]

const START_PERF: Record<string, number> = {
  operations: 68, logistics: 62, it: 55, rnd: 58, marketing: 57, finance: 62,
  hr: 60, planning: 52, legal: 65, pr: 55, security: 52, archives: 55,
}

export function makeDepartments(): Department[] {
  return DEPT_BASE.map((d) => ({
    id: d.id, name: d.name, headcount: d.headcount, baseline: d.baseline,
    funding: 100, performance: START_PERF[d.id] ?? 58,
    note: d.note,
  }))
}

function fullName(r: ReturnType<typeof makeRng>): string {
  return `${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`
}

function makeEmployee(r: ReturnType<typeof makeRng>, id: string, dept: DeptId): Employee {
  const level = (r.chance(0.55) ? 1 : r.next() < 0.55 ? 2 : r.chance(0.5) ? 3 : 4) as Level
  const avgSalary = [52, 78, 118, 175][level - 1]
  return {
    id,
    name: fullName(r),
    age: 24 + r.int(0, 34),
    dept,
    title: r.pick(TITLES[level]),
    level,
    salary: Math.round(avgSalary * (0.8 + r.next() * 0.45)),
    skill: clamp(Math.round(38 + r.gauss(14, 16))),
    specialty: r.pick(SPECIALTIES[dept]),
    traits: [r.pick(TRAITS), r.pick(TRAITS)].filter((t, i, a) => a.indexOf(t) === i),
    satisfaction: clamp(Math.round(52 + r.gauss(8, 12))),
    performance: clamp(Math.round(52 + r.gauss(10, 16))),
    stress: clamp(Math.round(38 + r.gauss(8, 15))),
    tenure: 1 + r.int(0, 28),
    ambition: clamp(Math.round(48 + r.gauss(14, 20))),
    loyalty: clamp(Math.round(50 + r.gauss(13, 18))),
    relations: {},
    history: [`Week 0 — on the roster when the new Executive arrived.`],
  }
}

const CUSTODIANS = ['A. Meissner', 'T. Brand', 'L. Okonkwo', 'S. Virtanen', 'R. Cavallaro']
const KNOWERS: { dept: DeptId; title: string; knowledge: string; flagged?: string }[] = [
  { dept: 'archives', title: 'Records Custodian', knowledge: 'ev_int_custodian5', flagged: 'Station — Department of Records' },
  { dept: 'operations', title: 'Senior Clerk, Order Desk', knowledge: 'ev_int_veteran', flagged: '41 years of service' },
  { dept: 'finance', title: 'Assistant Treasurer', knowledge: 'ev_finance_alloc' },
  { dept: 'legal', title: 'Contracts Reviewer', knowledge: 'ev_sig_1998', flagged: 'Kept a private file on Halcyon' },
  { dept: 'it', title: 'Legacy Systems Engineer', knowledge: 'ev_basement_b4', flagged: 'Wrote the elevator controller patch' },
  { dept: 'security', title: 'Night Access Supervisor', knowledge: 'ev_payroll_5', flagged: 'Logged the identical dossiers' },
]

export function makeExecutives(): Executive[] {
  return [
    { id: 'exe_hale', name: 'Marguerite Hale', role: 'Chief Financial Officer', dept: 'finance', trust: 50, ambition: 60, influence: 85, agenda: 'Protect the balance sheet. Avoid surprises. Sign what must be signed.', secret: 'She signs the Continuity Allocation every January and has twice asked to stop.', active: true },
    { id: 'exe_okafor', name: 'Dario Okafor', role: 'Chief Operating Officer', dept: 'operations', trust: 55, ambition: 70, influence: 75, agenda: 'Cut the strange departments. Consolidate the plants. Make things again.', active: true },
    { id: 'exe_solberg', name: 'Ingrid Solberg', role: 'Chief People Officer', dept: 'hr', trust: 60, ambition: 45, influence: 55, agenda: 'Stability above all. The workforce is old, patient and watching you.', active: true },
    { id: 'exe_tanaka', name: 'Emory Tanaka', role: 'Chief Research Officer', dept: 'rnd', trust: 45, ambition: 80, influence: 60, agenda: 'Protect ORCHARD at any cost. It is the only project the founders ever praised.', active: true },
    { id: 'exe_cruz', name: 'Valentina Cruz', role: 'General Counsel', dept: 'legal', trust: 50, ambition: 50, influence: 65, agenda: 'Keep the company out of court, especially regarding events before 1999.', active: true },
    { id: 'exe_quill', name: 'Ezra Quill', role: 'Corporate Archivist', dept: 'archives', trust: 65, ambition: 20, influence: 40, agenda: 'Order, preservation, and the correct reading order of the corporate record.', secret: 'He answers to the Custodians first and to you second. He will say so, eventually.', active: true },
  ]
}

export function makeSubsidiaries(): Subsidiary[] {
  return [
    { id: 'sub_halcyon', name: 'Halcyon Components Ltd', sector: 'Component manufacturing', status: 'formally-closed', weeklyPayment: 340, incorporated: 1963, note: 'Legally wound up in 1998. Payments continue: $340K/week, coded "supply services".' },
    { id: 'sub_arcadia', name: 'Arcadia Facilities Group', sector: 'Facility management', status: 'active', weeklyPayment: 210, incorporated: 1987, note: 'Maintains aging properties. Reliably mediocre.' },
    { id: 'sub_boreal', name: 'Boreal Freight Partners', sector: 'Transport', status: 'active', weeklyPayment: 480, incorporated: 2001, note: 'Owns half of Meridian\'s north-road fleet.' },
    { id: 'sub_corvus', name: 'Corvus Data Services', sector: 'Data processing', status: 'active', weeklyPayment: 150, incorporated: 2011, note: 'Processes records few people remember creating.' },
    { id: 'sub_lindgren', name: 'Lindgren & Moore Advisory', sector: 'Consulting', status: 'active', weeklyPayment: 120, incorporated: 2004, note: 'Authors every org-design study since 2004. Including the ones that contradict each other.' },
    { id: 'sub_protea', name: 'Protea Systems SA', sector: 'Industrial electronics', status: 'active', weeklyPayment: 260, incorporated: 1979, note: 'Solid, unremarkable, the only subsidiary that files real financials.' },
    { id: 'sub_marlow', name: 'Marlow Assurance BV', sector: 'Insurance', status: 'unlisted', weeklyPayment: 95, incorporated: 1983, note: 'Unlisted in group reporting since 2016. Premiums still deducted.' },
    { id: 'sub_kestrel', name: 'Kestrel Properties Ltd', sector: 'Real estate', status: 'active', weeklyPayment: 175, incorporated: 1966, note: 'Owns three of Meridian\'s four regional HQs. Fees flow onward to the Trust.' },
  ]
}

export function makeLocations(): LocationSite[] {
  return [
    { id: 'loc_hq', name: 'Meridian House', kind: 'HQ', place: 'Capital District', headcount: 2100, weeklyCost: 2100, productivity: 68, depts: ['finance', 'legal', 'pr', 'planning', 'hr'], issue: 'Elevators stop at B3. Maintenance insists this is correct.' },
    { id: 'loc_alde', name: 'Aldenhoven Works', kind: 'FACTORY', place: 'Northern Belt', headcount: 1850, weeklyCost: 2600, productivity: 71, depts: ['operations', 'logistics'], issue: 'Line 2 tooling is older than its operators.' },
    { id: 'loc_couronne', name: 'Couronne Regional HQ', kind: 'HQ-REGIONAL', place: 'Couronne', headcount: 1250, weeklyCost: 1250, productivity: 63, depts: ['marketing', 'operations'], issue: 'Two departments renamed in 2009; the signage never was.' },
    { id: 'loc_valle', name: 'Valle Azul Plant', kind: 'FACTORY', place: 'Valle Azul', headcount: 1450, weeklyCost: 1900, productivity: 66, depts: ['operations', 'logistics'], issue: 'Water treatment grandfathered under 1974 rules.' },
    { id: 'loc_ridge', name: 'Ridgeway Research Facility', kind: 'LAB', place: 'Ridgeway', headcount: 620, weeklyCost: 1100, productivity: 58, depts: ['rnd', 'it'], issue: 'ORCHARD team shares the building with nobody who has seen them.' },
    { id: 'loc_cairn', name: 'Cairn Distribution Center', kind: 'WAREHOUSE', place: 'Cairn Flats', headcount: 950, weeklyCost: 1300, productivity: 70, depts: ['logistics'], issue: 'Inventory drift of ±3% monthly, unexplained, tolerated.' },
    { id: 'loc_pier', name: 'Pier 9 Offices', kind: 'OFFICE', place: 'Harbor Quarter', headcount: 430, weeklyCost: 480, productivity: 60, depts: ['it', 'security'], issue: 'Leased from Kestrel Properties at above-market rate since 1966.' },
    { id: 'loc_cedar', name: 'Cedar Annex', kind: 'OFFICE', place: 'Cedar Row', headcount: 380, weeklyCost: 420, productivity: 55, depts: ['archives'], issue: 'Fire doors chained in violation of three regulations. No one has removed them.' },
  ]
}

function relationSeed(r: ReturnType<typeof makeRng>): number {
  const roll = r.next()
  if (roll < 0.55) return 10 + r.int(0, 45)
  if (roll < 0.85) return -25 + r.int(0, 20)
  return -90
}

export function newGame(seedStr: string, ceoName: string): GameState {
  const seed = hashSeed(seedStr || 'meridian')
  const r = makeRng(seed)
  const departments = makeDepartments()
  const employees: Employee[] = []
  const deptWeights: Record<string, number> = { operations: 14, logistics: 9, finance: 9, hr: 8, it: 9, rnd: 12, marketing: 9, planning: 9, legal: 7, pr: 6, security: 6, archives: 12 }
  const pool: DeptId[] = []
  for (const d of DEPT_IDS) for (let i = 0; i < deptWeights[d]; i++) pool.push(d)
  let n = 0
  for (let i = 0; i < 94; i++) {
    const dept = pool[r.int(0, pool.length - 1)]
    employees.push(makeEmployee(r,`emp_${++n}`, dept))
  }
  for (let i = 0; i < 5; i++) {
    const e = makeEmployee(r, `emp_${++n}`, 'archives')
    e.name = CUSTODIANS[i]
    e.title = 'Records Custodian'
    e.level = 2
    e.tenure = 35
    e.age = 52 + i * 2
    e.salary = 68
    e.satisfaction = 70
    e.loyalty = 90
    e.ambition = 5
    e.performance = 85
    e.stress = 12
    e.traits = ['Loyal', 'Introverted']
    e.knowledge = 'ev_int_custodian5'
    e.flagged = 'Station — Department of Records'
    e.history = ['2 April 1989 — hired as Records Custodian.']
    employees.push(e)
  }
  for (const k of KNOWERS) {
    const e = employees.find((x) => x.dept === k.dept && !x.knowledge && !x.flagged)
    if (e) { e.knowledge = k.knowledge; if (k.flagged) e.flagged = k.flagged; if (k.title) e.title = k.title }
  }
  for (const a of employees) {
    if (r.chance(0.55)) {
      const b = employees[r.int(0, employees.length - 1)]
      if (b.id !== a.id) {
        const v = r.next() < 0.55 ? 15 + r.int(0, 45) : -20 - r.int(0, 60)
        a.relations[b.id] = v
        b.relations[a.id] = v
      }
    }
  }
  const metrics: Metrics = {
    revenue: 0, expenses: 0, profit: 0, cash: 45000, debt: 380000,
    marketShare: 6.2, satisfaction: 58, productivity: 60, turnover: 11,
    reputation: 55, efficiency: 58, innovation: 50, stability: 62,
    complexity: 74, boardConfidence: 68, suspicion: 8,
  }
  const s: GameState = {
    seed,
    week: 1,
    founded: 1958,
    departments,
    employees,
    candidates: [],
    projects: initialProjects(),
    locations: makeLocations(),
    subsidiaries: makeSubsidiaries(),
    executives: makeExecutives(),
    board: { confidence: 68, demands: [], pressure: 30 },
    metrics,
    history: [],
    lastFinance: { revenue: 92000, cogs: 44000, payroll: 15545, deptOpex: 19850, projects: 5500, facilities: 10950, interest: 361, subsidiaries: 1830 },
    evidence: [],
    comparedPairs: [],
    insights: [],
    docsUnlocked: [],
    ap: 3,
    investigation: { suspicion: 8, interviewsDone: [], lowProfile: 0, archivistTrust: 40 },
    pendingEvents: [],
    firedEvents: [],
    log: [],
    flags: {},
    ending: null,
    ceoName: ceoName || 'A. Glover',
  }
  const first = unlockEvidence(s, 'ev_letter_1968')
  s.evidence = first ? [first] : []
  s.log.push({ week: 1, kind: 'info', text: `You are appointed CEO of Meridian Group. Ten thousand employees, twelve departments, four regional headquarters, eight subsidiaries. Founded 1958.` })
  s.log.push({ week: 1, kind: 'mystery', text: `Board briefing, final line: "We have been operating successfully for 68 years. Unfortunately, we are no longer entirely certain what we do."` })
  return s
}

export function unlockEvidence(s: GameState, id: string): Evidence | null {
  if (s.docsUnlocked.includes(id)) return null
  const t = EVIDENCE[id]
  if (!t) return null
  s.docsUnlocked.push(id)
  const ev: Evidence = { ...t, week: s.week }
  s.evidence.push(ev)
  return ev
}
