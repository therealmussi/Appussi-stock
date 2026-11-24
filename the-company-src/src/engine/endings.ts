import type { GameState } from './types'

export interface EndingDef {
  id: string
  name: string
  title: string
  text: string
}

export const ENDINGS: Record<string, EndingDef> = {
  ending_reformer: {
    id: 'ending_reformer', name: 'THE REFORMER', title: 'Meridian, clarified',
    text: `You never did publish everything you found. You did something quieter: you made DC-4 a real department with real people, closed Halcyon on paper and in fact, and put the Trust on the table at the 71st annual meeting. The founders sued. They settled. The annuity became a disclosed related-party transaction, debated openly by shareholders with opinions. Ten years on, Meridian is smaller, slower, and — a survey says — the most trusted firm in its sector. On quiet Fridays, Ezra Quill brings you coffee and neither of you mentions B4, which now houses the compliance documentation center. The week, you are pleased to report, still ends.`,
  },
  ending_tycoon: {
    id: 'ending_tycoon', name: 'THE TYCOON', title: 'The margin is the message',
    text: `You ran it like an asset, because it was one. Margin up 19 points. Headcount down 40%. The strange departments were not closed — they were monetized: DC-4's twenty-four years of clean books turned out to be exactly what certain acquirers value. The floor does not cheer you at the farewell party; the floor is not invited. Somewhere in the sub-basement, five employees keep the stations, and you have learned to invoice their maintenance as "heritage continuity services" to a client list you are not told. It is, the board agrees, a triumph of modern management. The week still ends. You no longer ask who ends it.`,
  },
  ending_bureaucrat: {
    id: 'ending_bureaucrat', name: 'THE BUREAUCRAT', title: 'Another custodian of the week',
    text: `You kept the machine humming and the machine kept you. Twelve years, four mandates, zero scandals. They will carve "GLOVER — A STABLE HAND" into the lobby glass between the founder and the man nobody talks about. You never asked what 214 was; 214 never asked about your bonus. The archives remain complete. The elevators still stop at B3, correctly. The company cannot tell you what it does, and by the end, neither can you — but you can keep it doing it.`,
  },
  ending_revolution: {
    id: 'ending_revolution', name: 'THE REVOLUTION', title: 'No station, no floor, no B4',
    text: `You abolished the layer that runs things and kept the people who do them. It was chaos for a quarter and then, unnervingly, it worked: teams formed and dissolved around problems, budgets were public, the org chart became a wiki. The Custodians were the hardest problem — stations outlive structures — but when the last one retired, the position simply was not refilled, and the Ledger... stopped needing to balance weekly. Meridian won a sector innovation award for "organizational honesty". B4 is a training center now. The week ends when the work ends.`,
  },
  ending_collapse: {
    id: 'ending_collapse', name: 'THE COLLAPSE', title: 'The week that did not end',
    text: `It did not fail loudly. It failed like Meridian always did things: quietly, procedurally, with minutes taken. Cash exhausted, confidence in single digits, the board's letter of dismissal arrived in the same courier batch as the works council's strike notice and the administrator's appointment. As the doors were being sealed, a clerk from the fourth basement handed your assistant a single reconciled page for the final week — balanced, signed, and dated four days into the future. Meridian Group, 1958–20XX. The record is complete.`,
  },
  ending_truth_expose: {
    id: 'ending_truth_expose', name: 'THE TRUTH — EXPOSED', title: 'You said it out loud',
    text: `You stood in the board room and read Resolution 9 aloud, then the Trust deed, then the names of the five stations. The founders' lawyers moved within the hour; the business press within the day. The stock fell 40% and, over three chaotic years, found a floor — because underneath the apparatus of continuity you exposed something that still worked: the plants, the freight, the clients who never left. Meridian survived the truth the way it survived everything: by continuing. The annuity is gone. The Custodians were re-deployed to the archive you saved from dissolution. Your memoir is one sentence longer than the 1971 minutes, because you state what they hedged: for fifty years, the company existed to exist. Not anymore.`,
  },
  ending_truth_control: {
    id: 'ending_truth_control', name: 'THE CUSTODIAN', title: 'You kept the week ending',
    text: `You did not expose Project Null. You were promoted into it. The founders' counsel explained it gently: the Trust does not fund companies, it funds continuity, and continuity needs an officer. The five stations salute your office now — figuratively; the sixth station is yours. The company remains profitable, opaque, and quiet, and you are its best custodian in fifty years because you know why the strange departments are strange. Every January you sign the Allocation and, like Hale before you, you do not like signing it. Unlike Hale, you know exactly what would happen if you stopped.`,
  },
  ending_unknown: {
    id: 'ending_unknown', name: 'THE UNKNOWN', title: 'Some questions keep their answers',
    text: `You sealed the record. Not destroyed — Quill would never — but access-restricted, authorzation-gated, yours. The company runs on. The strange lines remain in the ledger, modest and indexed, and the elevators still stop at B3, and some nights you take the stairs down to the fire door at B4 and stand there, not knocking. Meridian continues to operate successfully. It no longer asks itself what it does, and under your administration, neither do you. Historians will call your tenure "stable". The record, complete from 1958 onward, calls it: maintained.`,
  },
  ending_removed: {
    id: 'ending_removed', name: 'THE VOTE', title: 'Confidence withdrawn',
    text: `The board's emergency session ran 40 minutes. You were given the customary courtesy of a closing statement and the customary courier for your personal effects. The official press release cites "a difference of strategic direction". unofficially, a director tells a journalist what directors always say: "The numbers were fine. The numbers were never the problem." The week, your successor will be pleased to confirm, continues to end.`,
  },
  ending_resign: {
    id: 'ending_resign', name: 'RESIGNED', title: 'You stepped aside',
    text: `You wrote a short letter and left before the second board meeting could decide anything about you. Meridian continues, as it always has, in the care of people who never asked the question either. In your last week you received a card with no sender: a photograph of the archives, the aisle marked B4, the shelves complete. Someone, somewhere, considers your discretion a professional reference.`,
  },
  ending_steward: {
    id: 'ending_steward', name: 'THE STEWARD', title: 'A week like any other',
    text: `You never forced the reckoning and never let it rot either. Meridian ends your tenure about where it began: solvent, opaque at the edges, functional at the core, run by ten thousand people who mostly do not ask what it makes. It is not a transformation. It is stewardship — and the evidence you gathered stays scanned, dated and witnessed in your private safe, because one day someone else will inherit this chair and ask the question out loud. You have decided to leave them the answer where Quill leaves his: in the correct reading order.`,
  },
}

export function endingText(s: GameState): string {
  if (s.endingText) return s.endingText
  return ENDINGS[s.ending ?? '']?.text ?? ''
}

export function endingDef(s: GameState): EndingDef | null {
  if (!s.ending) return null
  return ENDINGS[s.ending] ?? ENDINGS.ending_steward
}
