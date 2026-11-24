# THE COMPANY — Meridian Group

A browser-based corporate management + investigation simulation.
You are the new CEO of Meridian Group (est. 1958, 10,000 employees, 12 departments,
8 subsidiaries). The company is solvent. Nobody knows what it does anymore.

Manage the organization week by week while investigating why the company's
dysfunction is too consistent to be accidental — and what **Project Null** actually is.

## Run

```bash
npm install
npm run dev        # play at http://localhost:5173
npm run build      # production build in dist/
npm test           # or: npm run typecheck && npm run test:sim
```

`test/simCheck.ts` runs the headless verification suite (52 simulated weeks,
influence checks, full investigation path, save/load, determinism, endings).

## Systems

- **Simulation engine** (`src/engine/sim.ts`) — weekly tick: departments
  (mean-reverting performance with cross-department support matrix), employees,
  projects, finance (full P&L), politics, events, mystery triggers.
  Seeded RNG (`rng.ts`) → deterministic, debuggable runs.
- **Departments** — 12, each with funding control (40–200%), performance, and
  explicit dependency edges. Underfunding IT degrades everyone; weak Logistics
  raises COGS and triggers supply events.
- **Employees** — 100 individually simulated identities (skills, traits,
  satisfaction, stress, ambition, relations), aggregated populations for the rest.
  Hiring, dismissal (with grief + legal severance), promotion (with rivals),
  per-person and company-wide salary adjustments.
- **Projects** — 16 initial, including eternal zero-deliverable projects
  (CONTINUITY, LEDGER-7, ORCHARD) that actively resist cancellation.
- **Events** (`src/engine/content/events.ts`) — condition-gated on real state:
  strikes when morale is low, leaks when security/suspicion is high, board
  emergencies when confidence collapses. Plus scripted narrative beats (weeks 1/4/8/12, Project Null).
- **Investigation** — 3 AP/week: finance/payroll/facilities audits, archive digs,
  subsidiary files, interviews. 16 documents. **Cross-reference any two documents**
  to surface contradictions; 9 insights build the theory layer by layer.
  Suspicion mechanic: the inside men react when you get noticed.
- **Board & executives** — 6 recurring executives with trust/agendas/secrets,
  board directives (comply/refuse/expiry), quarterly briefing framing,
  dismissal politics, and — from week 40 — the destiny review.
- **Endings** — Reformer, Tycoon, Bureaucrat, Revolution, Collapse, the three
  truth choices of Project Null (Expose / Take Control / Seal), resignation, steward.
- **Persistence** — localStorage autosave after every action and week.

## The mystery (spoiler-free)

Everything the player can find is listed in `src/engine/content/docs.ts`.
Every anomaly in the ledger, the org charts and the personnel files has one
consistent explanation, discoverable through play. No pixel hunts: any pair of
relevant documents compared together surfaces the same conclusions.
