// DATA: game rules, archetypes, events, awards and verdicts.
// This file is pure configuration: the engine reads from it, the UI
// displays labels/icons/narratives. Editing here changes the gameplay.
// ============================================================

// Lombardi Trophy: original hand-drawn SVG, ships offline with the app
import lombardiUrl from '../assets/lombardi-trophy.svg';
export const TROPHY_URL = lombardiUrl;

export const GAME = {
  START_AGE: 19,
  RETIRE_AGE_MIN: 35,
  RETIRE_AGE_MAX: 40,
  ROOKIE_OVR_MIN: 72,
  ROOKIE_OVR_MAX: 76,
  ROOKIE_CONTRACT_YEARS: 4,
};

export const ROLES = [
  { id: 'QB', label: 'Quarterback', icon: '\ud83c\udfc8' },
  { id: 'RB', label: 'Running Back', icon: '\ud83c\udfc3' },
  { id: 'WR', label: 'Wide Receiver', icon: '\ud83e\udd4a' },
  { id: 'TE', label: 'Tight End', icon: '\ud83e\udd3e' },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Deep Threat',
    icon: '\ud83d\udd25',
    desc: 'Home-run plays: go routes, broken coverages and 60-yard touchdowns.',
    scoring: 1.18, playmaking: 0.75, defense: 0.85, rebounding: 1.1,
  },
  playmaker: {
    id: 'playmaker',
    label: 'Chain Mover',
    icon: '\ud83e\udde0',
    desc: 'First downs, YAC and third-down conversions on repeat.',
    scoring: 0.85, playmaking: 1.35, defense: 0.9, rebounding: 0.85,
  },
  twoway: {
    id: 'twoway',
    label: 'Triple Threat',
    icon: '\u2b50',
    desc: 'Runs, catches and even throws the trick pass. Does everything.',
    scoring: 0.98, playmaking: 1.0, defense: 1.2, rebounding: 1.0,
  },
  rimProtector: {
    id: 'rimProtector',
    label: 'Short-Yardage Anchor',
    icon: '\ud83e\udec2',
    desc: 'Converts the 4th-and-1, wins the goal-line battles, never fumbles.',
    scoring: 0.8, playmaking: 0.8, defense: 1.3, rebounding: 1.35,
  },
};

// ---------- Step A: development ----------

export const DEV_OUTCOMES = {
  breakout: {
    id: 'breakout', icon: '\ud83d\udca5', label: 'Breakout', tone: 'emerald',
    delta: [3, 5], narratives: [
      'First in the facility all winter, last one out. Defensive coordinators around the league just got the memo.',
      'New footwork, new release: cornerbacks no longer recognize the route tree.',
      'A spring of real work: body, hands and playbook recalibrated.',
    ],
  },
  solid: {
    id: 'solid', icon: '\ud83d\udcc8', label: 'Step Forward', tone: 'sky',
    delta: [1, 2], narratives: [
      'Quiet but steady improvements. The scouts are nodding.',
      'Adds one move to his toolkit every month. Good trajectory.',
    ],
  },
  flat: {
    id: 'flat', icon: '\u2796', label: 'Plateau', tone: 'slate',
    delta: [0, 0], narratives: [
      'The development curve flattens: same routes, same reads.',
      'An uninspiring training camp. The coaching staff expected more.',
    ],
  },
  injury: {
    id: 'injury', icon: '\ud83d\ude91', label: 'Injury', tone: 'rose',
    delta: [-3, -2], narratives: [
      'A high-ankle sprain in camp: four months out and a long rehab.',
      'Landed awkwardly on Tuesday, injured reserve on Wednesday. The season is compromised.',
      'A tired hamstring. The body is sending a message.',
    ],
  },
};

export const DEV_TABLE = {
  young: [
    { id: 'breakout', weight: 18 },
    { id: 'solid', weight: 45 },
    { id: 'flat', weight: 27 },
    { id: 'injury', weight: 10 },
  ],
  prime: [
    { id: 'breakout', weight: 12 },
    { id: 'solid', weight: 40 },
    { id: 'flat', weight: 36 },
    { id: 'injury', weight: 12 },
  ],
  old: [
    { id: 'flat', weight: 34 },
    { id: 'injury', weight: 18 },
  ],
  vet: [
    { id: 'flat', weight: 40 },
    { id: 'injury', weight: 26 },
  ],
};

// Extra outcomes reserved for veterans
export const DEV_OUTCOME_OLD = {
  decline: {
    id: 'decline', icon: '\ud83d\udcc9', label: 'Physical Decline', tone: 'amber',
    delta: [-2, -1], narratives: [
      'First-step quickness is not what it used to be. The gap is closing on him.',
      'The body starts to weigh. The IQ remains, the explosiveness goes.',
    ],
  },
  vetCraft: {
    id: 'vetCraft', icon: '\ud83e\uddd9', label: 'Veteran Craft', tone: 'purple',
    delta: [-1, 1], narratives: [
      'Loses a half-step, gains two reads: hours of film cover the lost quickness.',
    ],
  },
};

export const DEV_TABLE_OLD = [
  { id: 'vetCraft', weight: 34 },
  { id: 'decline', weight: 40 },
  { id: 'injury', weight: 18 },
  { id: 'breakout', weight: 8 },
];

// ---------- Step B: stat calibration (output index per game) ----------

export const ROLE_SCORING = { QB: 1.12, RB: 1.0, WR: 1.1, TE: 0.85 };
export const ROLE_PASS = { QB: 1.3, RB: 0.5, WR: 0.85, TE: 0.7 };
export const ROLE_REB = { QB: 0.3, RB: 1.15, WR: 1.0, TE: 0.75 };

// Draft: the higher the pick, the bigger its weight in the wheel
export function draftPickWeight(pick) {
  return 33 - pick;
}

export const DRAFT_FLAVOR_TOP5 = [
  'Draft night: the commissioner calls his name first, war rooms light up across the league.',
  'New jersey, number one promise: the franchise just bet everything on him.',
];
export const DRAFT_FLAVOR_TOP10 = [
  'First-round bonus! The green room applauds, the project starts here.',
];
export const DRAFT_FLAVOR_REST = [
  'Day-two pick: a special-teams role and a playbook crash-course solve everything.',
];

// ---------- Regular season story events (Step B) ----------

export const SEASON_EVENTS = {
  masterclass: {
    id: 'masterclass', icon: '\ud83c\udfaf', label: 'Sunday masterclass', tone: 'amber', ppg: 0.03,
    texts: [
      'A four-touchdown Sunday: two drives in the final two minutes and the crowd storms the field.',
      'Three touchdowns in one half, all with the division race on the line.',
    ],
  },
  viral: {
    id: 'viral', icon: '\ud83d\udcf1', label: 'Viral clip', tone: 'fuchsia', ppg: 0,
    texts: [
      'A hurdle over a linebacker for the first down trends worldwide: 12 million views in 24 hours.',
      'A one-handed grab in double coverage becomes the clip of the week across every show.',
    ],
  },
  slump: {
    id: 'slump', icon: '\ud83e\uddca', label: 'Cold stretch', tone: 'sky', ppg: -0.03,
    texts: [
      'A freezing month: stalls in the red zone, the coordinator sees ghosts in every film cut.',
      'Three straight games below his standard: the talk shows are calling for play-caller changes.',
    ],
  },
  minorInjury: {
    id: 'minorInjury', icon: '\ud83e\ude79', label: 'Minor injury', tone: 'rose', ppg: -0.03,
    texts: [
      'Two games out with a rib cage bruise, back on the field with extra padding.',
      'Plays through a jammed wrist with extra tape: the numbers pay the toll.',
    ],
  },
  tension: {
    id: 'tension', icon: '\ud83d\ude20', label: 'Locker room tension', tone: 'indigo', ppg: -0.03,
    texts: [
      'A heated film-session argument with the coordinator: the team downplays it, the room does not.',
    ],
  },
};

export const SEASON_EVENT_TABLE = [
  { id: 'masterclass', weight: 10 },
  { id: 'viral', weight: 12 },
  { id: 'slump', weight: 16 },
  { id: 'minorInjury', weight: 12 },
  { id: 'tension', weight: 6 },
];

export const AWARDS_META = {
  roy: { label: 'Offensive Rookie of the Year', icon: '\u2b50', tone: 'sky' },
  mip: { label: 'Most Improved Player', icon: '\ud83d\udcd0', tone: 'teal' },
  allStar: { label: 'Pro Bowl', icon: '\ud83c\udf1f', tone: 'amber' },
  allNBA: { label: 'First-Team All-Pro', icon: '\ud83c\udfc8', tone: 'orange' },
  dpoy: { label: 'Second-Team All-Pro', icon: '\ud83e\udec2', tone: 'indigo' },
  scoringChamp: { label: 'Offensive Player of the Year', icon: '\ud83c\udfaf', tone: 'orange' },
  allDefense: { label: 'Special Teams Ace', icon: '\ud83e\udd4a', tone: 'indigo' },
  allRookie: { label: 'All-Rookie Team', icon: '\ud83c\udf31', tone: 'teal' },
  mvp: { label: 'League MVP', icon: '\ud83d\udc51', tone: 'yellow' },
  ring: { label: 'Super Bowl', icon: '\ud83c\udfc6', tone: 'emerald' },
  finalsMvp: { label: 'Super Bowl MVP', icon: '\ud83e\udd47', tone: 'fuchsia' },
};

// ---------- Retirement ----------

export function retireChance(age, ovr) {
  if (age < GAME.RETIRE_AGE_MIN) return 0;
  const base = (age - 32) * 0.16;
  const bonus = ovr < 78 ? 0.12 : 0;
  return Math.min(0.92, 0.12 + base + bonus);
}

// ---------- Career Score & verdicts ----------

export const SCORE_WEIGHTS = {
  ring: 18,
  finalsMvp: 10,
  mvp: 14,
  dpoy: 9,
  roy: 7,
  mip: 3,
  allNBA: 5,
  allStar: 2.5,
  scoringChamp: 4,
  allDefense: 4,
  allRookie: 2,
  wins: 0.15,
  peakOvr: 1.5,
  longevity: 1.0,
};

export const VERDICTS = [
  { min: 375, label: 'GOAT \ud83d\udc10', sub: 'Every conversation starts with his name.', tone: 'gold' },
  { min: 260, label: 'First-Ballot Hall of Famer', sub: 'His Canton speech runs forty minutes and nobody yawns.', tone: 'emerald' },
  { min: 160, label: 'Hall of Famer', sub: 'A statue outside the stadium, a gold jacket in Canton.', tone: 'sky' },
  { min: 100, label: 'Career All-Star', sub: 'The franchise keeps his number in the Ring of Honor.', tone: 'indigo' },
  { min: 70, label: 'Elite Role Player', sub: 'The second contract was earned the hard way.', tone: 'slate' },
  { min: -1, label: 'Bust', sub: 'Remembered for that one fumble replayed on the jumbotron.', tone: 'rose' },
];

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

// ---------- Name generator ----------

export const FIRST_NAMES = ['Aiden', 'Marcus', 'Devin', 'Dylan', 'Tyler', 'Cade', 'Elijah', 'Mason', 'Nico', 'Dario', 'Levi', 'Jalen', 'Amari', 'Zeke', 'Bruno'];
export const LAST_NAMES = ['Carter', 'Brooks', 'Hayes', 'Whitfield', 'Rossi', 'Delgado', 'Monroe', 'Bell', 'Vance', 'Kovac', 'Sterling', 'Ferraro', 'Dawkins', 'Nakamura', 'Byrne'];

export function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
