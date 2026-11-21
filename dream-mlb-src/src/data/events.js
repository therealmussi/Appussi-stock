// DATA: game rules, archetypes, events, awards and verdicts.
// This file is pure configuration: the engine reads from it, the UI
// displays labels/icons/narratives. Editing here changes the gameplay.
// ============================================================

// Commissioner's Trophy: original hand-drawn SVG, ships offline with the app
import wsTrophyUrl from '../assets/world-series-trophy.svg';
export const TROPHY_URL = wsTrophyUrl;

export const GAME = {
  START_AGE: 19,
  RETIRE_AGE_MIN: 35,
  RETIRE_AGE_MAX: 40,
  ROOKIE_OVR_MIN: 72,
  ROOKIE_OVR_MAX: 76,
  ROOKIE_CONTRACT_YEARS: 4,
};

export const ROLES = [
  { id: 'C', label: 'Catcher', icon: '\ud83e\udd4d' },
  { id: 'IF', label: 'Infielder', icon: '\u26be' },
  { id: 'OF', label: 'Outfielder', icon: '\ud83c\udfc3' },
  { id: 'DH', label: 'Designated Hitter', icon: '\ud83e\udc43' },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Slugger',
    icon: '\ud83d\udd25',
    desc: 'Exit velocity, tape-measure homers, RBIs by the dozen.',
    scoring: 1.18, playmaking: 0.75, defense: 0.85, rebounding: 1.1,
  },
  playmaker: {
    id: 'playmaker',
    label: 'Contact Hitter',
    icon: '\ud83e\udde0',
    desc: 'Spray charts, stolen bases, relentless at-bats.',
    scoring: 0.85, playmaking: 1.35, defense: 0.9, rebounding: 0.85,
  },
  twoway: {
    id: 'twoway',
    label: 'Five-Tool',
    icon: '\u2b50',
    desc: 'Hits for average and power, runs, throws, fields.',
    scoring: 0.98, playmaking: 1.0, defense: 1.2, rebounding: 1.0,
  },
  rimProtector: {
    id: 'rimProtector',
    label: 'Defensive Anchor',
    icon: '\ud83e\udec2',
    desc: 'Gold-Glove hands, framing, and cannon throws.',
    scoring: 0.8, playmaking: 0.8, defense: 1.3, rebounding: 1.35,
  },
};

// ---------- Step A: development ----------

export const DEV_OUTCOMES = {
  breakout: {
    id: 'breakout', icon: '\ud83d\udca5', label: 'Breakout', tone: 'emerald',
    delta: [3, 5], narratives: [
      'First one in the cage all summer, last one out. Pitchers around the league just got the memo.',
      'New swing plane, new torque: Triple-A arms no longer recognize him.',
      'A winter of real work: body, hands and load recalibrated.',
    ],
  },
  solid: {
    id: 'solid', icon: '\ud83d\udcc8', label: 'Step Forward', tone: 'sky',
    delta: [1, 2], narratives: [
      'Quiet but steady improvements. The scouts are nodding.',
      'Adds one weapon to his toolkit every month. Good trajectory.',
    ],
  },
  flat: {
    id: 'flat', icon: '\u2796', label: 'Plateau', tone: 'slate',
    delta: [0, 0], narratives: [
      'The development curve flattens: same swing, same holes.',
      'An uninspiring spring training. The coaching staff expected more.',
    ],
  },
  injury: {
    id: 'injury', icon: '\ud83d\ude91', label: 'Injury', tone: 'rose',
    delta: [-3, -2], narratives: [
      'Oblique strain in camp: four months out and a long rehab assignment.',
      'Fouled a ball off the foot on Tuesday, surgery on Wednesday. The season is compromised.',
      'A tired shoulder. The body is sending a message.',
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
      'Bat speed is not what it used to be. The gap is closing on him.',
      'The body starts to weigh. The IQ remains, the explosiveness goes.',
    ],
  },
  vetCraft: {
    id: 'vetCraft', icon: '\ud83e\uddd9', label: 'Veteran Craft', tone: 'purple',
    delta: [-1, 1], narratives: [
      'Loses a half-step, gains two reads: pitch recognition covers the lost bat speed.',
    ],
  },
};

export const DEV_TABLE_OLD = [
  { id: 'vetCraft', weight: 34 },
  { id: 'decline', weight: 40 },
  { id: 'injury', weight: 18 },
  { id: 'breakout', weight: 8 },
];

// ---------- Step B: stat calibration (offensive index per game) ----------

export const ROLE_SCORING = { C: 0.85, IF: 1.0, OF: 1.08, DH: 1.18 };
export const ROLE_PASS = { C: 0.4, IF: 0.75, OF: 0.95, DH: 0.3 };
export const ROLE_REB = { C: 1.0, IF: 0.95, OF: 0.9, DH: 1.1 };

// Draft: the higher the pick, the bigger its weight in the wheel
export function draftPickWeight(pick) {
  return 31 - pick;
}

export const DRAFT_FLAVOR_TOP5 = [
  'Draft night: the commissioner calls his name first, the clubhouse phones light up.',
  'New cap, number one promise: the franchise just bet everything on him.',
];
export const DRAFT_FLAVOR_TOP10 = [
  'First-round bonus! The draft floor applauds, the project starts here.',
];
export const DRAFT_FLAVOR_REST = [
  'Day-two pick: an assignment to High-A and a swing program solve everything.',
];

// ---------- Step C: awards ----------

// ---------- Regular season story events (Step B) ----------

export const SEASON_EVENTS = {
  masterclass: {
    id: 'masterclass', icon: '\ud83c\udf29\ufe0f', label: 'Masterclass night', tone: 'amber', ppg: 0.03,
    texts: [
      'A three-homer night: he hits for the cycle in the seventh and the ballpark loses its mind.',
      'Two grand slams in one week, both with the bases loaded and the game on the line.',
    ],
  },
  viral: {
    id: 'viral', icon: '\ud83d\udcf1', label: 'Viral clip', tone: 'fuchsia', ppg: 0,
    texts: [
      'A no-look flip behind the back for the double play trends worldwide: 12 million views in 24 hours.',
      'A 480-foot blast that leaves the stadium entirely becomes league-wide viewing material.',
    ],
  },
  slump: {
    id: 'slump', icon: '\ud83e\uddca', label: 'Cold stretch', tone: 'sky', ppg: -0.03,
    texts: [
      'A freezing month: an 0-for-24 slide, the hitting coach is seeing ghosts in every angular popup.',
      'Nineteen games below his standard: the talk shows are calling for a lineup shuffle.',
    ],
  },
  minorInjury: {
    id: 'minorInjury', icon: '\ud83e\ude79', label: 'Minor injury', tone: 'rose', ppg: -0.03,
    texts: [
      'Twelve games out with a sore hamstring, gradual return as the DH.',
      'Plays through a jammed wrist with extra tape: the numbers pay the toll.',
    ],
  },
  tension: {
    id: 'tension', icon: '\ud83d\ude20', label: 'Clubhouse tension', tone: 'indigo', ppg: -0.03,
    texts: [
      'A heated film-session argument with the hitting coach: the club downplays it, the room does not.',
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
  roy: { label: 'Rookie of the Year', icon: '\u2b50', tone: 'sky' },
  mip: { label: 'Most Improved Player', icon: '\ud83d\udcd0', tone: 'teal' },
  allStar: { label: 'MLB All-Star', icon: '\ud83c\udf1f', tone: 'amber' },
  allNBA: { label: 'Silver Slugger', icon: '\ud83c\udfd2', tone: 'orange' },
  dpoy: { label: 'Gold Glove', icon: '\ud83e\udec2', tone: 'indigo' },
  scoringChamp: { label: 'Hank Aaron Award', icon: '\ud83c\udfaf', tone: 'orange' },
  allDefense: { label: 'Platinum Glove', icon: '\ud83e\udd4a', tone: 'indigo' },
  allRookie: { label: 'All-Rookie Team', icon: '\ud83c\udf31', tone: 'teal' },
  mvp: { label: 'AL/NL MVP', icon: '\ud83d\udc51', tone: 'yellow' },
  ring: { label: 'World Series', icon: '\ud83c\udfc6', tone: 'emerald' },
  finalsMvp: { label: 'World Series MVP', icon: '\ud83e\udd47', tone: 'fuchsia' },
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
  wins: 0.045,
  peakOvr: 1.5,
  longevity: 1.0,
};

export const VERDICTS = [
  { min: 375, label: 'GOAT \ud83d\udc10', sub: 'Every conversation starts with his name.', tone: 'gold' },
  { min: 260, label: 'First-Ballot Hall of Famer', sub: 'His Cooperstown speech runs forty minutes and nobody yawns.', tone: 'emerald' },
  { min: 160, label: 'Hall of Famer', sub: 'A statue outside the ballpark, a plaque in Cooperstown.', tone: 'sky' },
  { min: 100, label: 'Career All-Star', sub: 'The franchise always keeps his number on speed dial.', tone: 'indigo' },
  { min: 70, label: 'Elite Role Player', sub: 'The second contract was earned the hard way.', tone: 'slate' },
  { min: -1, label: 'Bust', sub: 'Remembered for that one racing sausage cameo.', tone: 'rose' },
];

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

// ---------- Name generator ----------

export const FIRST_NAMES = ['Aiden', 'Marcus', 'Devin', 'Dylan', 'Tyler', 'Cade', 'Elijah', 'Mason', 'Nico', 'Dario', 'Levi', 'Kirby', 'Amari', 'Zeke', 'Bruno'];
export const LAST_NAMES = ['Carter', 'Brooks', 'Hayes', 'Whitfield', 'Rossi', 'Delgado', 'Monroe', 'Bell', 'Vance', 'Kovac', 'Sterling', 'Ferraro', 'Dawkins', 'Nakamura', 'Byrne'];

export function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
