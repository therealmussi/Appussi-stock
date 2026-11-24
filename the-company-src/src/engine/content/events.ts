import type { GameEvent, GameState } from '../types'

const dp = (s: GameState, id: GameState['departments'][number]['id']) =>
  s.departments.find((d) => d.id === id)!.performance

export const EVENTS: GameEvent[] = [
  // ---- scripted narrative ----
  {
    id: 'script_w1', fireOnce: true, weight: 0, condition: (s) => s.week === 1,
    title: 'The Handover',
    text: `Your predecessor's office is intact: glasses on the desk, a pen capped, a wall calendar still open on March — of a year no one will name. The security log shows the badge last used at 23:41 on a Sunday. The Chief of Staff hands you two keys. "This one is for the office," she says. "This one opens nothing we know of."`,
    choices: [
      { label: 'Store the second key in the safe.', outcome: 'You lock it away. Somehow it feels like the safer choice, and the more reckless one.' },
      { label: 'Ask Facilities what it opens.', outcome: 'Facilities checks every lock in the register over three days. It matches none of them. It is not in the register.' },
    ],
    apply: () => {},
  },
  {
    id: 'script_w4', fireOnce: true, weight: 0, condition: (s) => s.week === 4,
    title: 'The Invitation',
    text: `Ezra Quill, the Corporate Archivist, sends a handwritten note: "The record is complete from 1958 onward, with four regrettable gaps. You are welcome in the Archives whenever you wish, Executive — though I would suggest starting with the charts, before the ledgers."`,
    choices: [
      { label: 'Visit the Archives this week.', outcome: 'You spend an afternoon among the boxes. Quill catalogues in pencil, in real time, your questions. (Archives trust +. An investigation action slot was free.)' },
      { label: 'Decline politely — too much else to do.', outcome: 'Quill\'s reply is one line: "Of course. The record keeps." The invitation is not repeated.' },
    ],
    apply: () => {},
  },
  {
    id: 'script_w8', fireOnce: true, weight: 0, condition: (s) => s.week === 8,
    title: 'The Chairman\'s Nod',
    text: `At the quarterly dinner, the Chairman of the Board raises his glass and says, mostly to you: "Profit is nice,endorsements are nicer, but what we ask of every chief executive since 1971 is simpler: keep the week ending." The table laughs. You are not sure it is a joke.`,
    choices: [
      { label: '"Keep the week ending. Understood."', outcome: 'He nods, satisfied. You have no idea what you agreed to.' },
      { label: '"What does that mean, exactly?"', outcome: 'The table goes quiet for two seconds. "It means keep the week ending," he repeats, slower, as if to a foreign guest. Someone changes the subject to wine.' },
    ],
    apply: () => {},
  },
  {
    id: 'script_w12', fireOnce: true, weight: 0, condition: (s) => s.week === 12,
    title: 'Audit Season',
    text: `External auditors arrive for the annual review. Their checklist has 260 line items. Line item 214 is pre-marked "see annex" — but the annex is not attached, and the auditors do not ask about it. When you mention it, the partner smiles: "AH—214. Established practice. We note it and we move on."`,
    choices: [
      { label: '"What is established practice?"', outcome: '"Meridian practice," he says, packing his briefcase with unusual speed.' },
      { label: 'Ask your CFO about line 214 privately.', outcome: 'Marguerite Hale closes her laptop before answering: "214 is old. Older than me. It is not an audit finding, Executive. It is an audit courtesy." (Suspicion of the machinery: your first real one.)' },
    ],
    apply: () => {},
  },
  {
    id: 'script_null_revealed', fireOnce: true, weight: 0, condition: () => true,
    title: 'PROJECT NULL',
    text: `You have enough of the record now. On your desk, in an envelope with no stamp, is a single archived page you never requisitioned — the cover sheet of the 1971 file, stamped: PROJECT NULL — STANDING DIRECTIVE — "THE OPERATION RESPONSIBLE FOR MAINTAINING THE CONTINUITY OF THE ORGANIZATION." Somebody delivered it to you. Somebody wanted you to know that they know that you know.`,
    choices: [
      { label: 'Open the Confrontation menu in the Board Room.', outcome: 'The truth is on the table. What you do with it is the only thing left that matters.' },
      { label: 'Keep the page. Wait.', outcome: 'You file it. The week, as promised by everyone who runs this place, keeps ending.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_custodian_counter', fireOnce: true, weight: 0, condition: () => true,
    title: 'A Drawer Is Empty',
    text: `You go to pull a working paper and it is gone — not misfiled: absent. The panel in the archive that held it is clean, the index card re-squoted to a different shelf. At the end of the corridor, A. Meissner is walking with a box of files and does not look up. "Recorded, not removed," she says to no one, "recorded, not removed."`,
    choices: [
      { label: 'Confront Meissner.', outcome: '"I am not permitted to have this conversation," she says, and then, helpfully, at the door: "The stations are not against you, Executive. The stations are older than you." (Suspicion grows. So does the record.)' },
      { label: 'Say nothing. Harden your record keeping.', outcome: 'You instruct your office to copy every finding, dated and witnessed, from this day forward. (Suspicion +18, but evidence can no longer be taken from you.)' },
    ],
    apply: () => {},
  },

  // ---- conditional, simulation-driven ----
  {
    id: 'ev_strike_ballot', weight: 30, condition: (s) => s.metrics.satisfaction < 42,
    title: 'Strike Ballot Threatened',
    text: `The works council announces a strike ballot. Turnout at the meeting was the highest in a decade. Ingrid Solberg warns you that this is no longer noise: "The floor is angry, and the floor can count."`,
    choices: [
      { label: 'Concede a wage package (+2% payroll).', outcome: 'The ballot is withdrawn. The board will call it weakness; the floor will call it the first sensible thing management has done in years.' },
      { label: 'Open negotiations with agreed arbitration.', outcome: 'Talks drag into next week but the temperature drops about two degrees a day.' },
      { label: 'Restate expectations (refuse to bargain).', outcome: 'The ballot proceeds. Whatever happens, the company will feel it on the floor.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_competitor', weight: 25, condition: () => true,
    title: 'Competitor Launches in Our Category',
    text: `Vantage Systems launches a line that reviewers immediately compare — unfavourably for you — to "whatever it is Meridian sells". Marketing asks for a counter-campaign. Finance asks what category you are in.`,
    choices: [
      { label: 'Fund a counter-campaign ($2,400K).', outcome: 'The campaign is decent. The share bleed slows to a drip.' },
      { label: 'Ignore it; hold position.', outcome: 'You keep the cash. The share keeps going gently down.' },
      { label: 'Attack their pricing publicly.', outcome: 'It plays well for a week, then a trade journal runs: "Meridian attacks rival\'s prices; declines to name its own products". Pr is irritated at having to care.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_supplier_bankrupt', weight: 20, condition: (s) => dp(s, 'logistics') < 62,
    title: 'Key Supplier Bankrupt',
    text: `A tier-1 supplier files for protection. The Procurement queue is 400 requisitions deep, and three plants are exposed this quarter.`,
    choices: [
      { label: 'Emergency re-sourcing ($1,800K).', outcome: 'Painful, but throughput survives.' },
      { label: 'Let contracts lapse to cheapest bidders.', outcome: 'Cheapest is a word with a meaning. Quality will explain itself to you later.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_exec_resignation', weight: 18, condition: (s) => s.executives.some((e) => e.active && e.trust < 30),
    title: 'An Executive Could Resign',
    text: `You hear it in the corridor before you hear it officially: an executive feels frozen out, undervalued, and has taken calls from a headhunter.`,
    choices: [
      { label: 'Offer a personal retention deal ($900K sign-off).', outcome: 'The money works on the body if not the soul. They stay.' },
      { label: 'Let them go.', outcome: 'The department starts the week without a chief and with a complicated feeling.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_leak', weight: 22, condition: (s) => dp(s, 'security') < 50 || s.investigation.suspicion > 55,
    title: 'Document Leak to the Press',
    text: `A financial blogger publishes extracts of an internal memo. The extracts are real. The framing is worse than the facts.`,
    choices: [
      { label: 'Full voluntary disclosure.', outcome: 'Painful week, honest quarter. Trust measures tick up by the end of it.' },
      { label: 'Standard "no comment" and internal investigation.', outcome: 'The story runs a second week on the smell of a cover-up.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_whistle', weight: 16, condition: (s) => s.investigation.suspicion > 25 && s.metrics.satisfaction < 55,
    title: 'A Whistleblower Approves You',
    text: `An unsigned note, deliberately left in the tray of the CEO's mailbox: "Look at what the auditors never mark. 214. We all see it. We assume you were told it was normal. It is normal. That is the problem."`,
    choices: [
      { label: 'Open a protected channel for the source.', outcome: 'The channel is used twice in the first week. One of the messages contains a document name: Deed of the Founder Trust, 1968.' },
      { label: 'Forward it to Security.', outcome: 'Security logs it. Nobody expects to hear more, and nobody does.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_client_terminates', weight: 20, condition: (s) => s.metrics.reputation < 45 || dp(s, 'operations') < 45,
    title: 'A Major Client Terminates',
    text: `One of the five largest client accounts gives notice. The letter cites "delivery reliability". The delivery reliability is a fair description of the last quarter.`,
    choices: [
      { label: 'Personal intervention: fly out and apologize with a plan.', outcome: 'The account stays in a reduced, embarrassed form. Some damage, less than full loss.' },
      { label: 'Accept it; reallocate capacity.', outcome: 'The account is gone. The revenue line will show it.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_sub_profit', weight: 15, condition: (s) => s.week > 6,
    title: 'A Subsidiary Reports Unexpected Profits',
    text: `Arcadia Facilities Group posts a small operating surplus — the first in its makes-a-difference history. The note thanks "group synergies".`,
    choices: [
      { label: 'Consolidate the profit into the group.', outcome: 'The cash is real. The explanation is not, but the cash is real.' },
      { label: 'Request a full breakdown of where synergies came from.', outcome: 'The breakdown arrives nine days late and reconciles perfectly, which is itself strange, because nothing at Meridian normally reconciles perfectly.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_regulation', weight: 18, condition: (s) => s.week > 4,
    title: 'New Regulation in a Core Market',
    text: `A regulator introduces reporting obligations with a nine-month lead. Legal estimates compliance cost and a compliance deadline, in that order, in one sentence.`,
    choices: [
      { label: 'Fund a compliance program ($1,500K).', outcome: 'The obligation is absorbed. The Legal department stops flinching when the phone rings.' },
      { label: 'Absorb into existing workload.', outcome: 'The work is absorbed by people who were already underwater. Exposure grows quietly.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_it_outage', weight: 20, condition: (s) => dp(s, 'it') < 48,
    title: 'Systems Outage',
    text: `The core ordering platform goes dark for eleven hours. The recovery is manual, heroic and imperfect: some orders "processed" never existed; some that existed never processed.`,
    choices: [
      { label: 'Emergency maintenance contract ($1,200K).', outcome: 'The platform stabilizes. The vendors are smug about it.' },
      { label: 'Patch and continue.', outcome: 'It comes back up. Everyone knows it will happen again, including, unfortunately, the outages.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_factory_incident', weight: 18, condition: (s) => dp(s, 'operations') < 50,
    title: 'Factory Incident',
    text: `A line stoppage at Aldenhoven triggers a Safety Directorate review. Nobody is hurt; the report writes itself in exactly the tone you fear.`,
    choices: [
      { label: 'Full safety remediation across sites ($2,000K).', outcome: 'Costly, correct. The review closes with a "proactive" notation.' },
      { label: 'Remediate the named line only.', outcome: 'The Directorate closes the case and flags the group. That flag has a memory.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_undocumented', weight: 12, condition: (s) => s.week > 5,
    title: 'A Department Discovers an Undocumented Project',
    text: `During a floor reorganization, Logistics finds a storeroom of crates addressed to "PROJECT WAYFARER — DO NOT OPEN — HOLD FOR AUDIT". Crates dating from 2004. All sealed.`,
    choices: [
      { label: 'Open the crates.', outcome: 'Inside: ledgers. Hundreds of identical, beautifully kept ledgers, each covering one week, each reconciled to the penny. The final one is for THIS week. Delivered before you found the storeroom.' },
      { label: 'Leave them; log the discovery.', outcome: 'The crates are re-sealed by persons unknown within 48 hours. The log of your discovery is edited to a single word: "nil".' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_viral_praise', weight: 12, condition: (s) => s.metrics.reputation > 68,
    title: 'A Columnist Notices Meridian',
    text: `A business columnist writes an affectionate piece: "The last company in this sector that still answers its phones". It is the best press in a decade and it is mostly an accident.`,
    choices: [
      { label: 'Amplify it with a modest campaign.', outcome: 'Second-cycle coverage, word-for-the-word, calls it "a culture story". Marketing is impossible to live with for a week.' },
      { label: 'Say nothing and let it breathe.', outcome: 'The piece circulates quietly for a month. Trust Rose without a single invoice.' },
    ],
    apply: () => {},
  },
  {
    id: 'ev_board_emergency', weight: 40, condition: (s) => s.board.confidence < 32,
    title: 'Emergency Board Session',
    text: `The Board convenes with four days' notice. The agenda is the governance equivalent of a raised eyebrow: "Session on Group Direction". You are invited in the way suspects are invited to interviews.`,
    choices: [
      { label: 'Open the session with your own diagnosis.', outcome: 'You lead with cash, stability and a plan. It does not fully save you, but control of the narrative is worth a room.' },
      { label: 'Listen, concede, survive.', outcome: 'You take the criticism without defending yourself. Confidence steadies. Your authority does not grow.' },
      { label: 'Present the strange findings from your investigations.', outcome: 'You put Resolutions and allocations on the projector. The room listens differently when the mystery is arithmetical.' },
    ],
    apply: () => {},
  },
]
