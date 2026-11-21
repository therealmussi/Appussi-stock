// DATA: game rules, archetypes, events, awards and verdicts.
// This file is pure configuration: the engine reads from it, the UI
// displays labels/icons/narratives. Editing here changes the gameplay.
// ============================================================

// Stanley Cup: original hand-drawn SVG, ships offline with the app
import stanleyCupUrl from '../assets/stanley-cup.svg';
export const TROPHY_URL = stanleyCupUrl;

export const GAME = {
  START_AGE: 19,
  RETIRE_AGE_MIN: 35,
  RETIRE_AGE_MAX: 40,
  ROOKIE_OVR_MIN: 72,
  ROOKIE_OVR_MAX: 76,
  ROOKIE_CONTRACT_YEARS: 4,
};

export const ROLES = [
  { id: 'C', label: 'Center', icon: '🎯' },
  { id: 'LW', label: 'Left Wing', icon: '⬅️' },
  { id: 'RW', label: 'Right Wing', icon: '➡️' },
  { id: 'D', label: 'Defenseman', icon: '🧱' },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Sniper',
    icon: '🔥',
    desc: 'Goals in bunches, defense optional.',
    scoring: 1.18, playmaking: 0.75, defense: 0.85, rebounding: 0.8,
  },
  playmaker: {
    id: 'playmaker',
    label: 'Playmaker',
    icon: '🧠',
    desc: 'Assists, vision and saucer passes.',
    scoring: 0.85, playmaking: 1.35, defense: 0.9, rebounding: 0.85,
  },
  twoway: {
    id: 'twoway',
    label: 'Two-Way',
    icon: '🛡️',
    desc: 'Balanced game at both ends of the ice.',
    scoring: 0.98, playmaking: 1.0, defense: 1.2, rebounding: 1.0,
  },
  rimProtector: {
    id: 'rimProtector',
    label: 'Stay-at-Home',
    icon: '🏰',
    desc: 'Hits, blocks and shutdown shifts.',
    scoring: 0.8, playmaking: 0.8, defense: 1.3, rebounding: 1.4,
  },
};

// ---------- Step A: development ----------

export const DEV_OUTCOMES = {
  breakout: {
    id: 'breakout', icon: '💥', label: 'Breakout', tone: 'emerald',
    delta: [3, 5], narratives: [
      'First one on the ice all summer, last one off. The league gets a warning.',
      'New physique, new release: goalies around the league just saw the scouting tape.',
      'A summer of real work: body, mind and wrist shot recalibrated.',
    ],
  },
  solid: {
    id: 'solid', icon: '📈', label: 'Step Forward', tone: 'sky',
    delta: [1, 2], narratives: [
      'Quiet but steady improvements. The scouts are nodding.',
      'Adds one weapon to his toolkit every month. Good trajectory.',
    ],
  },
  flat: {
    id: 'flat', icon: '➖', label: 'Plateau', tone: 'slate',
    delta: [0, 0], narratives: [
      'The development curve flattens: same game, same habits.',
      'An uninspiring camp. The coaching staff expected more.',
    ],
  },
  injury: {
    id: 'injury', icon: '🚑', label: 'Injury', tone: 'rose',
    delta: [-3, -2], narratives: [
      'Knee injury in camp: four months out and a long road back.',
      'Skate cut on Tuesday, surgery on Wednesday. The season is compromised.',
      'Chronic back issues. The body is sending a message.',
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
    id: 'decline', icon: '📉', label: 'Physical Decline', tone: 'amber',
    delta: [-2, -1], narratives: [
      'The first step is not what it used to be. The gap is closing on him.',
      'The body starts to weigh. The IQ remains, the explosiveness goes.',
    ],
  },
  vetCraft: {
    id: 'vetCraft', icon: '🧙', label: 'Veteran Craft', tone: 'purple',
    delta: [-1, 1], narratives: [
      'Loses a half-step, gains two reads: positioning covers the lost speed.',
    ],
  },
};

export const DEV_TABLE_OLD = [
  { id: 'vetCraft', weight: 34 },
  { id: 'decline', weight: 40 },
  { id: 'injury', weight: 18 },
  { id: 'breakout', weight: 8 },
];

// ---------- Step B: stat calibration (points per game scale) ----------

export const ROLE_SCORING = { C: 1.0, LW: 1.12, RW: 1.1, D: 0.62 };
export const ROLE_PASS = { C: 0.62, LW: 0.3, RW: 0.32, D: 0.42 };
export const ROLE_REB = { C: 0.5, LW: 0.3, RW: 0.3, D: 1.0 };

// Draft: the higher the pick, the bigger its weight in the wheel
export function draftPickWeight(pick) {
  return 33 - pick;
}

export const DRAFT_FLAVOR_TOP5 = [
  'Draft night: the commissioner calls his name first, the arena erupts.',
  'New jersey, number one promise: the franchise just bet everything on him.',
];
export const DRAFT_FLAVOR_TOP10 = [
  'Lottery pick! The draft floor applauds, the project starts here.',
];
export const DRAFT_FLAVOR_REST = [
  'Mid-second-rounder: a contract and a training camp solve everything.',
];

// ---------- Step C: awards ----------

// ---------- Regular season story events (Step B) ----------

export const SEASON_EVENTS = {
  masterclass: {
    id: 'masterclass', icon: '🌩️', label: 'Masterclass night', tone: 'amber', ppg: 1,
    texts: [
      'A five-point night: he scores the game-winner with nine seconds left and the building loses its mind.',
      'A natural hat trick in eleven minutes: every highlight show replays it all week.',
    ],
  },
  viral: {
    id: 'viral', icon: '📱', label: 'Viral clip', tone: 'fuchsia', ppg: 0,
    texts: [
      'A between-the-legs saucer pass through the security net trends worldwide: 9 million views in 24 hours.',
      'The spin-o-rama through three defenders becomes league-wide viewing material.',
    ],
  },
  slump: {
    id: 'slump', icon: '🧊', label: 'Cold stretch', tone: 'sky', ppg: -1,
    texts: [
      'A freezing month: sixteen games without a single point, the analytics staff is begging.',
      'Nineteen games below his standard: the talk shows are calling for a line shuffle.',
    ],
  },
  minorInjury: {
    id: 'minorInjury', icon: '🩹', label: 'Minor injury', tone: 'rose', ppg: -1,
    texts: [
      'Twelve games out with a sprained wrist, gradual return to the lineup.',
      'Plays through a cracked rib with extra padding: the numbers pay the toll.',
    ],
  },
  tension: {
    id: 'tension', icon: '😠', label: 'Locker room tension', tone: 'indigo', ppg: -1,
    texts: [
      'A heated video-session argument with the head coach: the club downplays it, the room does not.',
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
  roy: { label: 'Calder Trophy', icon: '⭐', tone: 'sky' },
  mip: { label: 'Most Improved Player', icon: '📐', tone: 'teal' },
  allStar: { label: 'NHL All-Star', icon: '🌟', tone: 'amber' },
  allNBA: { label: 'First All-Star Team', icon: '🏒', tone: 'orange' },
  dpoy: { label: 'Norris Trophy', icon: '🛡️', tone: 'indigo' },
  scoringChamp: { label: 'Art Ross Trophy', icon: '🎯', tone: 'orange' },
  allDefense: { label: 'Selke Trophy', icon: '🥊', tone: 'indigo' },
  allRookie: { label: 'All-Rookie Team', icon: '🌱', tone: 'teal' },
  mvp: { label: 'Hart Trophy', icon: '👑', tone: 'yellow' },
  ring: { label: 'Stanley Cup', icon: '🏒', tone: 'emerald' },
  finalsMvp: { label: 'Conn Smythe Trophy', icon: '🥇', tone: 'fuchsia' },
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
  { min: 375, label: 'GOAT 🐐', sub: 'Every conversation starts with his name.', tone: 'gold' },
  { min: 260, label: 'First-Ballot Hall of Famer', sub: 'His Hall of Fame speech runs forty minutes and nobody yawns.', tone: 'emerald' },
  { min: 160, label: 'Hall of Famer', sub: 'A statue outside the arena, a plaque in Toronto.', tone: 'sky' },
  { min: 100, label: 'Career All-Star', sub: 'The franchise always keeps his number on speed dial.', tone: 'indigo' },
  { min: 70, label: 'Elite Role Player', sub: 'The second contract was earned the hard way.', tone: 'slate' },
  { min: -1, label: 'Bust', sub: 'Remembered for that one mascot race he joined.', tone: 'rose' },
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
