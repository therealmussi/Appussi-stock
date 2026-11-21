// ============================================================
// DATI: regole di gioco, archetipi, eventi, premi e verdetti.
// File "configurazione": il motore legge da qui, la UI mostra
// label/icone/narrazioni. Editare qui cambia il gameplay.
// ============================================================

export const GAME = {
  START_AGE: 19,
  RETIRE_AGE_MIN: 35,
  RETIRE_AGE_MAX: 40,
  ROOKIE_OVR_MIN: 72,
  ROOKIE_OVR_MAX: 76,
  ROOKIE_CONTRACT_YEARS: 4,
};

export const ROLES = [
  { id: 'PG', label: 'Playmaker', icon: '🎯' },
  { id: 'SG', label: 'Guardia', icon: '🔫' },
  { id: 'SF', label: 'Ala', icon: '⚡' },
  { id: 'PF', label: 'Ala Grande', icon: '🪓' },
  { id: 'C', label: 'Center', icon: '🧱' },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Scorer',
    icon: '🔥',
    desc: 'Punti a raffica, difesa opzionale.',
    scoring: 1.18, playmaking: 0.75, defense: 0.85, rebounding: 0.8,
  },
  playmaker: {
    id: 'playmaker',
    label: 'Playmaker',
    icon: '🧠',
    desc: 'Assist e visione di gioco.',
    scoring: 0.85, playmaking: 1.35, defense: 0.9, rebounding: 0.85,
  },
  twoway: {
    id: 'twoway',
    label: 'Two-Way',
    icon: '🛡️',
    desc: 'Equilibrio tra attacco e difesa.',
    scoring: 0.98, playmaking: 1.0, defense: 1.2, rebounding: 1.0,
  },
  rimProtector: {
    id: 'rimProtector',
    label: 'Rim Protector',
    icon: '🏰',
    desc: 'Rimbalzi e stop sotto canestro.',
    scoring: 0.8, playmaking: 0.8, defense: 1.3, rebounding: 1.4,
  },
};

// ---------- Step A: sviluppo ----------

export const DEV_OUTCOMES = {
  breakout: {
    id: 'breakout', icon: '💥', label: 'Breakout', tone: 'emerald',
    delta: [3, 5], narratives: [
      'Entro in palestra alle 6 di mattina tutto l\'estate. Poi in stagione fa paura a tutti.',
      'Nuovo fisico, nuovo step-back: la lega ha appena ricevuto un avviso.',
      'Estate da grandi lavori: corpo, testa e tiro ricalibrati.',
    ],
  },
  solid: {
    id: 'solid', icon: '📈', label: 'Passo Avanti', tone: 'sky',
    delta: [1, 2], narratives: [
      'Miglioramenti silenziosi ma costanti. Gli scout annuiscono.',
      'Aggiunge un dettaglio al suo gioco ogni mese. Sta crescendo bene.',
    ],
  },
  flat: {
    id: 'flat', icon: '➖', label: 'Stagnazione', tone: 'slate',
    delta: [0, 0], narratives: [
      'La curva di crescita si appiattisce: stessa gagliardetteria, stesse abitudini.',
      'Preseason sottotono. Il tavolo tecnico si aspettava di più.',
    ],
  },
  injury: {
    id: 'injury', icon: '🚑', label: 'Infortunio', tone: 'rose',
    delta: [-3, -2], narratives: [
      'Male al ginocchio in preseason: 4 mesi fuori e ritmo da ritrovare.',
      'Tendine d\'oro martedì. Riabilitazione lunga, stagione compromessa.',
      'Problemi alla schiena cronici. Il fisico manda un segnale.',
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

// Outcome extra riservato ai veterani
export const DEV_OUTCOME_OLD = {
  decline: {
    id: 'decline', icon: '📉', label: 'Calo Fisico', tone: 'amber',
    delta: [-2, -1], narratives: [
      'Gli scafi si filtrano: primo passo meno esplosivo di un tempo.',
      'Il corpo comincia a pesare. L\'esperienza resta, l\'esplosività va.',
    ],
  },
  vetCraft: {
    id: 'vetCraft', icon: '🧙', label: "Artigianato Veterano", tone: 'purple',
    delta: [-1, 1], narratives: [
      'Perde atletismo ma ruba IQ da gioco: si compensa con maniera e posizione.',
    ],
  },
};

export const DEV_TABLE_OLD = [
  { id: 'vetCraft', weight: 34 },
  { id: 'decline', weight: 40 },
  { id: 'injury', weight: 18 },
  { id: 'breakout', weight: 8 },
];

// ---------- Step B: calibration stats ----------

export const ROLE_SCORING = { PG: 1.0, SG: 1.12, SF: 1.0, PF: 0.9, C: 0.85 };
export const ROLE_PASS = { PG: 0.62, SG: 0.34, SF: 0.3, PF: 0.22, C: 0.14 };
export const ROLE_REB = { PG: 0.18, SG: 0.24, SF: 0.36, PF: 0.56, C: 0.72 };

// Draft: più alta è la scelta, più peso ha nella ruota
export function draftPickWeight(pick) {
  return 31 - pick;
}

export const DRAFT_FLAVOR_TOP5 = [
  'Notte di lottery: il commissario chiama il suo nome per primo, arena in delirio.',
  'Cappellino nuovo, promessa numero 1: la franchigia punta tutto su di lui.',
];
export const DRAFT_FLAVOR_TOP10 = [
  'Lottery pick! La sala applaude, il progetto inizia da qui.',
];
export const DRAFT_FLAVOR_REST = [
  'Scelto a metà secondo giro: niente che un contratto e una chin-up non possano sistemare.',
];

// ---------- Step C: premi ----------

export const AWARDS_META = {
  roy: { label: 'Rookie of the Year', icon: '🌟', tone: 'sky' },
  mip: { label: 'Most Improved Player', icon: '📐', tone: 'teal' },
  allStar: { label: 'All-Star', icon: '⭐', tone: 'amber' },
  allNBA: { label: 'All-NBA Team', icon: '🏆', tone: 'orange' },
  dpoy: { label: 'Defensive Player of the Year', icon: '🛡️', tone: 'indigo' },
  mvp: { label: 'MVP Stagione', icon: '👑', tone: 'yellow' },
  ring: { label: 'Anello NBA', icon: '💍', tone: 'emerald' },
  finalsMvp: { label: 'Finals MVP', icon: '🥇', tone: 'fuchsia' },
};

// ---------- Ritiro ----------

export function retireChance(age, ovr) {
  if (age < GAME.RETIRE_AGE_MIN) return 0;
  const base = (age - 32) * 0.16;
  const bonus = ovr < 78 ? 0.12 : 0;
  return Math.min(0.92, 0.12 + base + bonus);
}

// ---------- Career Score & verdetti ----------

export const SCORE_WEIGHTS = {
  ring: 18,
  finalsMvp: 10,
  mvp: 14,
  dpoy: 9,
  roy: 7,
  mip: 3,
  allNBA: 5,
  allStar: 2.5,
  wins: 0.045,
  peakOvr: 1.5,
  longevity: 1.0,
};

export const VERDICTS = [
  { min: 375, label: 'GOAT 🐐', sub: 'La conversazione parte sempre dal suo nome.', tone: 'gold' },
  { min: 260, label: 'First-Ballot Hall of Famer', sub: 'Il suo discorso alla Hall dura 40 minuti e nessuno sbadiglia.', tone: 'emerald' },
  { min: 160, label: 'Hall of Famer', sub: 'Statua davanti all\'arena, cornice a Springfield.', tone: 'sky' },
  { min: 100, label: 'All-Star di carriera', sub: 'Il titolo lo invita sempre volentieri.', tone: 'indigo' },
  { min: 70, label: 'Role Player d\'élite', sub: 'Il secondo contratto l\'ha conquistato sul campo.', tone: 'slate' },
  { min: -1, label: 'Bust', sub: 'La lega lo ha ricordato per il momento con la mascotte.', tone: 'rose' },
];

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

// ---------- Generatore nomi ----------

export const FIRST_NAMES = ['Aiden', 'Marcus', 'Devin', 'Jalen', 'Tyler', 'Cade', 'Elijah', 'Mason', 'Nico', 'Dario', 'Levi', 'Kyrie', 'Amari', 'Zeke', 'Bruno'];
export const LAST_NAMES = ['Carter', 'Brooks', 'Hayes', 'Whitfield', 'Rossi', 'Delgado', 'Monroe', 'Bell', 'Vance', 'Kovac', 'Sterling', 'Ferraro', 'Dawkins', 'Nakamura', 'Byrne'];

export function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
