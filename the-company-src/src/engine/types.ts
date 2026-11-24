export type DeptId =
  | 'operations' | 'finance' | 'hr' | 'rnd' | 'marketing' | 'logistics'
  | 'legal' | 'it' | 'planning' | 'pr' | 'security' | 'archives'

export const DEPT_IDS: DeptId[] = [
  'operations', 'finance', 'hr', 'rnd', 'marketing', 'logistics',
  'legal', 'it', 'planning', 'pr', 'security', 'archives',
]

export interface Department {
  id: DeptId
  name: string
  headcount: number
  baseline: number      // baseline weekly operating budget, K$
  funding: number       // player-set funding level, % of baseline (40..200)
  performance: number   // 0..100
  note: string
}

export type Level = 1 | 2 | 3 | 4 // worker, senior, manager, director

export interface Employee {
  id: string
  name: string
  age: number
  dept: DeptId
  title: string
  level: Level
  salary: number        // annual, K$
  skill: number         // 0..100
  specialty: string
  traits: string[]
  satisfaction: number  // 0..100
  performance: number   // 0..100
  stress: number        // 0..100
  tenure: number        // years
  ambition: number      // 0..100
  loyalty: number       // 0..100
  relations: Record<string, number> // id -> -100..100
  knowledge?: string    // mystery hook id
  flagged?: string
  history: string[]
}

export interface Candidate {
  id: string
  name: string
  age: number
  dept: DeptId
  skill: number
  specialty: string
  traits: string[]
  askSalary: number
  ambition: number
  note: string
}

export type ProjectStatus = 'active' | 'completed' | 'cancelled' | 'stalled'

export interface Project {
  id: string
  name: string
  desc: string
  dept: DeptId
  managerId?: string
  weeklyBudget: number  // K$
  budgetWeeks: number   // approved budget horizon
  elapsed: number
  progress: number      // 0..100
  risk: number          // 0..100
  importance: number    // 1..5
  status: ProjectStatus
  expectedReturn: number // K$ per week once completed
  returns: number
  suspicious?: string
  requires?: DeptId[]
  log: string[]
}

export interface LocationSite {
  id: string
  name: string
  kind: 'HQ' | 'HQ-REGIONAL' | 'FACTORY' | 'LAB' | 'WAREHOUSE' | 'OFFICE'
  place: string
  headcount: number
  weeklyCost: number
  productivity: number
  issue?: string
  depts: DeptId[]
}

export interface Subsidiary {
  id: string
  name: string
  sector: string
  status: 'active' | 'formally-closed' | 'unlisted'
  weeklyPayment: number // K$ paid to it
  incorporated: number
  note: string
  interrogated?: boolean
}

export interface Executive {
  id: string
  name: string
  role: string
  dept: DeptId
  trust: number     // toward the player, 0..100
  ambition: number
  influence: number
  agenda: string
  secret?: string
  active: boolean
}

export interface BoardDemand {
  id: string
  text: string
  kind: 'cost' | 'headcount' | 'dismiss-exec' | 'strategy' | 'profit' | 'investigate'
  target?: string
  deadline: number
  issued: number
  resolved: false | 'complied' | 'refused' | 'expired'
}

export interface Evidence {
  id: string
  title: string
  source: string
  week: number
  text: string
  tags: string[]
}

export interface ArchiveDoc {
  id: string
  title: string
  type: string
  dated: string
  source: string
  text: string
  tags: string[]
  order: number
  needStage: number
}

export interface Insight {
  id: string
  title: string
  text: string
  requires: string[] // evidence ids
  givesSuspicion?: number
}

export interface LogEntry { week: number; text: string; kind: 'info' | 'good' | 'bad' | 'mystery' | 'money' }

export interface EventChoice { label: string; outcome: string; apply?: (s: GameState) => void }

export interface GameEvent {
  id: string
  title: string
  text: string
  choices?: EventChoice[]
  weight: number
  condition?: (s: GameState) => boolean
  fireOnce?: boolean
  apply?: unknown
}

export interface PendingEvent {
  uid: string
  eventId: string
  title: string
  text: string
  choices: { label: string; outcome: string }[]
}

export interface Metrics {
  revenue: number
  expenses: number
  profit: number
  cash: number
  debt: number
  marketShare: number
  satisfaction: number
  productivity: number
  turnover: number
  reputation: number
  efficiency: number
  innovation: number
  stability: number
  complexity: number
  boardConfidence: number
  suspicion: number
}

export interface FinanceBreakdown {
  revenue: number; cogs: number; payroll: number; deptOpex: number;
  projects: number; facilities: number; interest: number; subsidiaries: number;
}

export interface GameState {
  seed: number
  week: number
  founded: number
  departments: Department[]
  employees: Employee[]
  candidates: Candidate[]
  projects: Project[]
  locations: LocationSite[]
  subsidiaries: Subsidiary[]
  executives: Executive[]
  board: { confidence: number; demands: BoardDemand[]; pressure: number }
  metrics: Metrics
  lastFinance: FinanceBreakdown
  history: { week: number; revenue: number; profit: number; cash: number; satisfaction: number; reputation: number; productivity: number; stability: number }[]
  evidence: Evidence[]
  comparedPairs: string[]
  insights: string[]
  docsUnlocked: string[]
  ap: number
  investigation: { suspicion: number; interviewsDone: string[]; lowProfile: number; archivistTrust: number }
  pendingEvents: PendingEvent[]
  firedEvents: string[]
  log: LogEntry[]
  flags: Record<string, number>
  ending: string | null
  endingText?: string
  ceoName: string
}
