import type { DeptId, Project } from '../types'

type P = {
  id: string; name: string; desc: string; dept: DeptId; weeklyBudget: number;
  budgetWeeks: number; progress: number; risk: number; importance: number;
  expectedReturn: number; elapsed?: number; suspicious?: string; requires?: DeptId[]; log?: string[]
}

const T: P[] = [
  { id: 'HARBOUR', name: 'HARBOUR', desc: 'Replacement of the 37-year-old core ERP. Phase 2 of a program that has had four Phase 2s.', dept: 'it', weeklyBudget: 260, budgetWeeks: 120, progress: 34, risk: 55, importance: 4, expectedReturn: 900, requires: ['finance'] },
  { id: 'ATLAS', name: 'ATLAS', desc: 'Freight routing automation across the northern distribution yards.', dept: 'logistics', weeklyBudget: 180, budgetWeeks: 60, progress: 61, risk: 30, importance: 3, expectedReturn: 620 },
  { id: 'BEACON', name: 'BEACON', desc: 'Full brand refresh, including the company motto nobody can agree on.', dept: 'marketing', weeklyBudget: 140, budgetWeeks: 40, progress: 22, risk: 35, importance: 2, expectedReturn: 400 },
  { id: 'KEEL', name: 'KEEL', desc: 'Re-tooling of the Aldenhoven plant line 2 for higher tolerance components.', dept: 'operations', weeklyBudget: 320, budgetWeeks: 80, progress: 48, risk: 40, importance: 4, expectedReturn: 1100 },
  { id: 'HELIOS', name: 'HELIOS', desc: 'Feasibility study for on-site power generation at three factories.', dept: 'rnd', weeklyBudget: 90, budgetWeeks: 55, progress: 18, risk: 45, importance: 3, expectedReturn: 700 },
  { id: 'OPTIC', name: 'OPTIC', desc: 'Customer analytics platform. Has produced 11 dashboards so far.', dept: 'planning', weeklyBudget: 70, budgetWeeks: 50, progress: 40, risk: 25, importance: 2, expectedReturn: 300 },
  { id: 'LEDGER-II', name: 'LEDGER-II', desc: 'Consolidation of accounting systems after the 2019 split of the 2011 consolidation.', dept: 'finance', weeklyBudget: 110, budgetWeeks: 90, progress: 52, risk: 35, importance: 3, expectedReturn: 450 },
  { id: 'CROSSROADS', name: 'CROSSROADS', desc: 'Organization redesign consultancy engagement, fourth renewal.', dept: 'planning', weeklyBudget: 120, budgetWeeks: 48, progress: 27, risk: 30, importance: 2, expectedReturn: 250 },
  { id: 'LANTERN', name: 'LANTERN', desc: 'Compliance documentation harmonization across all jurisdictions.', dept: 'legal', weeklyBudget: 80, budgetWeeks: 60, progress: 65, risk: 20, importance: 3, expectedReturn: 350 },
  { id: 'VIGIL', name: 'VIGIL', desc: 'Physical and logical access control unification.', dept: 'security', weeklyBudget: 95, budgetWeeks: 55, progress: 31, risk: 30, importance: 3, expectedReturn: 300 },
  { id: 'MERCATOR', name: 'MERCATOR', desc: 'Mapping of all supplier dependencies beyond tier-2. The map is expected to be uncomfortable.', dept: 'logistics', weeklyBudget: 60, budgetWeeks: 45, progress: 15, risk: 35, importance: 3, expectedReturn: 400 },
  { id: 'CONTINUITY', name: 'CONTINUITY', desc: 'On the books since 1983. Renewed 1,712 times. No deliverable has ever been filed. The renewal signature is always legible, always the same hand.', dept: 'planning', weeklyBudget: 210, budgetWeeks: 999, progress: 0, risk: 5, importance: 1, expectedReturn: 0, elapsed: 999, suspicious: 'Renewed every year since 1983 without a single deliverable. Renewals carry the same signature across four decades.', log: ['Renewed by prior administration.'] },
  { id: 'LEDGER-7', name: 'LEDGER-7', desc: 'A reconciliation project reconciling the reconciliation of ledgers. Nobody currently assigned remembers issuing its mandate.', dept: 'finance', weeklyBudget: 150, budgetWeeks: 999, progress: 0, risk: 10, importance: 1, expectedReturn: 0, elapsed: 620, suspicious: 'Zero deliverables since 1996. Budget is protected by an internal note marked "per standing instruction".', log: ['Standing instruction cited: never suspend.'], requires: ['finance'] },
  { id: 'ORCHARD', name: 'ORCHARD', desc: 'Agricultural diversification study (R&D) — or an organizational pilot (Strategic Planning). Files disagree. File number agrees with itself twice.', dept: 'rnd', weeklyBudget: 130, budgetWeeks: 999, progress: 0, risk: 15, importance: 1, expectedReturn: 0, elapsed: 900, suspicious: 'Two departments claim ownership with the same file number. Cancelling one triggers the other to object.', requires: ['it', 'finance'] },
  { id: 'WAYFARER', name: 'WAYFARER', desc: 'A comprehensive audit of subsidiary activity. Scheduled to complete annually since 2004. Has never audited anything.', dept: 'finance', weeklyBudget: 85, budgetWeeks: 999, progress: 0, risk: 10, importance: 1, expectedReturn: 0, elapsed: 850, suspicious: 'The audit report template is updated every year. The findings field has never contained text.', },
  { id: 'INDEX', name: 'INDEX', desc: 'Backlog digitization of corporate records, est. third of the archive remains on paper. Est. 1972.', dept: 'archives', weeklyBudget: 55, budgetWeeks: 999, progress: 61, risk: 15, importance: 2, expectedReturn: 0, elapsed: 999 },
]

export function initialProjects(elapsedJitter = 0): Project[] {
  return T.map((p) => ({
    id: p.id,
    name: p.name,
    desc: p.desc,
    dept: p.dept,
    weeklyBudget: p.weeklyBudget,
    budgetWeeks: p.budgetWeeks,
    elapsed: Math.min(p.elapsed ?? 0, 999) + elapsedJitter,
    progress: p.progress,
    risk: p.risk,
    importance: p.importance,
    status: 'active' as const,
    expectedReturn: p.expectedReturn,
    returns: 0,
    suspicious: p.suspicious,
    requires: p.requires,
    log: p.log ?? [],
  }))
}
