import type { Evidence, Insight } from '../types'

export interface EvidenceTemplate {
  id: string
  title: string
  source: string
  text: string
  tags: string[]
}

export const EVIDENCE: Record<string, EvidenceTemplate> = {
  ev_letter_1968: {
    id: 'ev_letter_1968',
    title: 'Deed of the Meridian Founder Trust (1968)',
    source: 'Corporate Archives — Charters',
    tags: ['TRUST', 'FOUNDING', 'CONTINUITY'],
    text: `"…the Founding Families shall receive an annuity of four percent of net operating receipts, payable quarterly, FOR AS LONG AS THE COMPANY SHALL CONTINUE OPERATIONS. Should the Company cease operations, dissolve, or be merged out of existence, the annuity shall lapse absolutely and irrevocably." The deed was amended in 1971. The amendment is one page. It is missing from this file.`,
  },
  ev_chart_1984: {
    id: 'ev_chart_1984',
    title: 'Organizational Chart, 1984 (full print)',
    source: 'Corporate Archives — Org Charts',
    tags: ['ORG', 'CONTINUITY'],
    text: `The 1984 chart lists thirteen departments. The thirteenth is the "Office of Continuity", 41 staff, reporting line drawn only to "THE BOARD — Attention: Resolution 9". The same office does not appear on any chart printed after 1990.`,
  },
  ev_min_1971: {
    id: 'ev_min_1971',
    title: 'Board Minutes, 14 December 1971 (partial)',
    source: 'Corporate Archives — Minutes',
    tags: ['CONTINUITY', 'GOVERNANCE'],
    text: `"…in light of the Regulator matter, the Board adopts RESOLUTION 9: the Company's continued operation is designated a strategic objective in its own right. The Office of Continuity is established to ensure it, and shall receive such funds as it requires. The Office shall report to no officer of the Company." The remainder of the page is water-damaged.`,
  },
  ev_regulator_1971: {
    id: 'ev_regulator_1971',
    title: 'Technical Bulletin T-91: Retirement of the Meridian Regulator',
    source: 'Corporate Archives — Product Records',
    tags: ['PRODUCT', 'LEGAL'],
    text: `The Meridian Regulator, the company's founding product line, was discontinued in 1971. The bulletin cites "commercial reasons". A marginal note in pencil: "recall settled privately — nothing to press". After 1971, Meridian never launched another product classified as "end-user hardware".`,
  },
  ev_finance_alloc: {
    id: 'ev_finance_alloc',
    title: 'Ledger extract: the Continuity Allocation',
    source: 'Finance Audit',
    tags: ['FIN', 'CONTINUITY', 'TRUST'],
    text: `Every year since at least 1981, a line item marked CONTINUITY ALLOCATION disperses exactly $8,400,000 (indexed annually) to an account with no cost center, no approver of record, and no reconciliation. Current value: $61,200,000 per year.`,
  },
  ev_finance_halcyon: {
    id: 'ev_finance_halcyon',
    title: 'Ledger extract: Halcyon Components Ltd',
    source: 'Finance Audit',
    tags: ['FIN', 'SUBSIDIARY'],
    text: `Meridian pays $340,000 per week to Halcyon Components Ltd. Halcyon appears in the registry of subsidiaries as wound up in 1998. The payments are coded "supply services". Halcyon has no bank account that our auditors could locate — the funds land in a Meridian-controlled escrow and are re-dispersed from there.`,
  },
  ev_sub_halcyon: {
    id: 'ev_sub_halcyon',
    title: 'Subsidiary file: Halcyon Components Ltd (1963–1998)',
    source: 'Subsidiary Registry',
    tags: ['SUBSIDIARY', 'FIN', 'CONTINUITY'],
    text: `Incorporated 1963 to "manufacture regulator sub-assemblies". Its factory was sold in 1997. Legally dissolved in 1998. Yet the file contains quarterly "activity statements" signed continuously to the present day — the most recent dated eleven days ago.`,
  },
  ev_finance_d4: {
    id: 'ev_finance_d4',
    title: 'Budget line: Document Control-4',
    source: 'Finance Audit',
    tags: ['FIN', 'PHANTOM', 'CONTINUITY'],
    text: `Budget line "DC-4 / Document Control-4" has been funded for 24 consecutive years: currently $96,000 per week. It has zero registered employees. No department claims it. When Finance asked whose budget it was, the question was answered — by itself — with the notation "ongoing, per Resolution 9".`,
  },
  ev_payroll_5: {
    id: 'ev_payroll_5',
    title: 'Payroll audit: five identical employment histories',
    source: 'HR Records Audit',
    tags: ['HR', 'CUSTODIAN'],
    text: `Five employees — A. Meissner, T. Brand, L. Okonkwo, S. Virtanen, R. Cavallaro — share byte-identical employment histories: hired 2 April 1989, same grade, same increments, same ten-yearly commendation. None has ever taken leave simultaneously with another. Their job title field reads: "Records Custodian".`,
  },
  ev_int_veteran: {
    id: 'ev_int_veteran',
    title: 'Interview: E. Tamm, senior clerk, 41 years of service',
    source: 'Executive Interview',
    tags: ['CUSTODIAN', 'TESTIMONY', 'CONTINUITY'],
    text: `"You keep asking what we make. We process the Ledger. The Ledger." He capitalizes it — you hear it. "Every week it must balance, because the week must end. That is the work. Your reorganizations come and go. The Ledger keeps the week ending." Asked who set it up, he writes a number on a pad: 9.`,
  },
  ev_int_archivist: {
    id: 'ev_int_archivist',
    title: 'Interview: E. Quill, Corporate Archivist',
    source: 'Executive Interview',
    tags: ['ARCHIVES', 'TESTIMONY'],
    text: `"The building has floors the plans omit. You want B4 — everyone who wants B4 eventually finds the elevator bug: it stops at B3, unless you hold two buttons. I would not recommend it yet. Read first, Executive. Do things in the right order, and nobody has to become a problem." His personnel file lists no previous employer. None at all.`,
  },
  ev_basement_b4: {
    id: 'ev_basement_b4',
    title: 'Facilities records: sub-basement B4',
    source: 'Facilities Audit',
    tags: ['FACILITY', 'ARCHIVES', 'CONTINUITY'],
    text: `Official plans show sub-basements B1–B3. Maintenance requisitions repeatedly reference B4: dehumidifier service, a 1987 phone exchange upgrade, and a standing electrical load the board engineer describes as "a small datacenter, or a printing works". Elevator controller logic contains a hidden floor call routed to "ARCH-2".`,
  },
  ev_sig_1998: {
    id: 'ev_sig_1998',
    title: 'Contract impossibly signed for a dead company',
    source: 'Legal — Contracts',
    tags: ['LEGAL', 'SUBSIDIARY'],
    text: `A 2003 supply contract carries the signature "E. Voss, Director, Halcyon Components Ltd". Employee records show E. Voss resigned from Meridian in 1998 — the same week Halcyon was dissolved — and never re-registered as a company officer anywhere. Forensics on the signature block: "consistent with authentic execution".`,
  },
  ev_int_cfo: {
    id: 'ev_int_cfo',
    title: 'Interview: M. Hale, CFO',
    source: 'Executive Interview',
    tags: ['TESTIMONY', 'TRUST', 'CONTINUITY'],
    text: `"The Continuity Allocation predates me by twenty years and it will outlast you and me both. I sign it. I do not like signing it. If you intend to pull that thread, do it with the Archives, not Finance — Finance only touches what the Trust already allows. The Trust, Executive. Read the Trust."`,
  },
  ev_orchard_2: {
    id: 'ev_orchard_2',
    title: 'Two dossiers, one file number: ORCHARD',
    source: 'Project Review',
    tags: ['PROJECT', 'PHANTOM'],
    text: `R&D and Strategic Planning each maintain a project file numbered ORCHARD-0447. R&D's is an "agricultural diversification study" begun 1989, 0% deliverables. Planning's is the same number, same start date, framed as an "organizational pilot". The budgets sum correctly in the Ledger — which means someone deliberately double-books it, so that neither copy can be cancelled without the other objecting.`,
  },
  ev_int_custodian5: {
    id: 'ev_int_custodian5',
    title: 'Interview: A. Meissner, Records Custodian',
    source: 'Executive Interview',
    tags: ['CUSTODIAN', 'TESTIMONY', 'CONTINUITY'],
    text: `She is exactly on time, and stands exactly when you stand. "I have held this position for thirty years. My predecessor held it for thirty years. The position is not a job, Executive, it is a station. Five stations. While a station is kept, the year is kept. You may rearrange everything above the third basement. Please leave the stations alone."`,
  },
}

export const INSIGHTS: Insight[] = [
  {
    id: 'ins_alloc',
    title: 'The Continuity Allocation pays the Founders',
    text: 'The unexplained $61.2M/year line item is not waste or theft. It is the Founding Trust annuity of 1968 — "for as long as the Company shall continue operations". Meridian has been paying its founders to keep it alive for half a century.',
    requires: ['ev_finance_alloc', 'ev_letter_1968'],
  },
  {
    id: 'ins_office',
    title: 'The Office of Continuity still exists',
    text: 'The 1984 chart shows it; Resolution 9 created it. It simply stopped being printed on org charts after 1990. Somewhere in the structure, a thirteenth department operates and reports to nobody.',
    requires: ['ev_chart_1984', 'ev_min_1971'],
  },
  {
    id: 'ins_d4',
    title: 'Document Control-4 is the Office of Continuity',
    text: 'The phantom budget line DC-4 is the Office of Continuity under its third name. Resolution 9 and the 1984 chart confirm the lineage: renamed, delisted, never defunded.',
    requires: ['ev_finance_d4', 'ev_min_1971'],
  },
  {
    id: 'ins_halcyon',
    title: 'A dissolved company still receives wages',
    text: 'Halcyon Components died in 1998 but its "activity statements" continue, signed by a director who left the firm, funded through Meridian escrow. Halcyon is a continuity shell: an entity kept ceremonially alive the way Meridian keeps itself alive.',
    requires: ['ev_finance_halcyon', 'ev_sub_halcyon'],
  },
  {
    id: 'ins_custodians',
    title: 'The Custodians are stations, not people',
    text: 'Five interchangeable employees with identical histories, never on leave together. The position is perpetual and the holder is replaceable — and each of them knows it. Somebody designed roles intended to outlive their occupants.',
    requires: ['ev_payroll_5', 'ev_int_custodian5'],
  },
  {
    id: 'ins_b4',
    title: 'The operation lives on sub-basement B4',
    text: 'B4 exists: hidden floor calls, a standing industrial electrical load, a phone exchange. The Office of Continuity is not a metaphor. It is a place, directly beneath your office.',
    requires: ['ev_basement_b4', 'ev_int_archivist'],
  },
  {
    id: 'ins_pivot',
    title: 'Meridian stopped making things in 1971',
    text: 'The Regulator recall was settled privately and the product line died. Resolution 9 passed the same month. Since 1971 the company has produced almost nothing of its own — every "product" since is brokering, licensing and services wrapped around vendors. The organization replaced the output.',
    requires: ['ev_regulator_1971', 'ev_min_1971'],
  },
  {
    id: 'ins_ledger',
    title: 'THE LEDGER is the actual product',
    text: 'The pointless eternal projects — ORCHARD, LEDGER-7, CONTINUITY, the double-booked file numbers — exist to keep transactions flowing through the Ledger so the week can be closed and the annuity justified. Meridian does not run projects. The projects run Meridian.',
    requires: ['ev_int_veteran', 'ev_finance_alloc'],
  },
  {
    id: 'ins_null',
    title: 'PROJECT NULL',
    text: 'Every thread converges. In 1971, after the Regulator recall, the Board resolved (Resolution 9) that Meridian itself was the company\'s product. The archived codename for that standing directive is PROJECT NULL: the operation responsible for maintaining the continuity of the organization. The Trust pays the founders; the Custodians keep the stations in B4; the shells and phantom departments recycle the money; the dysfunction you inherited is not decay — it is the machinery working exactly as designed. Now you must decide what a company exists for.',
    requires: ['ev_min_1971', 'ev_letter_1968', 'ev_basement_b4', 'ev_int_cfo'],
    givesSuspicion: 25,
  },
]

export const CONTRADICTIONS: { a: string; b: string; insight: string }[] = [
  { a: 'ev_finance_alloc', b: 'ev_letter_1968', insight: 'ins_alloc' },
  { a: 'ev_chart_1984', b: 'ev_min_1971', insight: 'ins_office' },
  { a: 'ev_finance_d4', b: 'ev_min_1971', insight: 'ins_d4' },
  { a: 'ev_finance_halcyon', b: 'ev_sub_halcyon', insight: 'ins_halcyon' },
  { a: 'ev_payroll_5', b: 'ev_int_custodian5', insight: 'ins_custodians' },
  { a: 'ev_basement_b4', b: 'ev_int_archivist', insight: 'ins_b4' },
  { a: 'ev_regulator_1971', b: 'ev_min_1971', insight: 'ins_pivot' },
  { a: 'ev_int_veteran', b: 'ev_finance_alloc', insight: 'ins_ledger' },
  { a: 'ev_sig_1998', b: 'ev_sub_halcyon', insight: 'ins_halcyon' },
]
