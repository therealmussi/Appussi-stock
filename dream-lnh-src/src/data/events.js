// DATA: game rules, archetypes, events, awards and verdicts.
// This file is pure configuration: the engine reads from it, the UI
// displays labels/icons/narratives. Editing here changes the gameplay.
// ============================================================

// Coupe Stanley : SVG original dessiné à la main, embarqué hors ligne avec l'app
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
  { id: 'C', label: 'Centre', icon: '\ud83c\udfaf' },
  { id: 'LW', label: 'Ailier gauche', icon: '\u2b05\ufe0f' },
  { id: 'RW', label: 'Ailier droit', icon: '\u27a1\ufe0f' },
  { id: 'D', label: 'D\u00e9fenseur', icon: '\ud83e\uddf1' },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: "Tireur d'\u00e9lite",
    icon: '\ud83d\udd25',
    desc: 'Buts \u00e0 la cha\u00eene, la d\u00e9fense est optionnelle.',
    scoring: 1.18, playmaking: 0.75, defense: 0.85, rebounding: 0.8,
  },
  playmaker: {
    id: 'playmaker',
    label: 'Meneur',
    icon: '\ud83e\udde0',
    desc: 'Aides, vision et passes lob\u00e9es.',
    scoring: 0.85, playmaking: 1.35, defense: 0.9, rebounding: 0.85,
  },
  twoway: {
    id: 'twoway',
    label: 'Deux volets',
    icon: '\ud83d\udee1\ufe0f',
    desc: 'Jeu complet aux deux bouts de la glace.',
    scoring: 0.98, playmaking: 1.0, defense: 1.2, rebounding: 1.0,
  },
  rimProtector: {
    id: 'rimProtector',
    label: 'D\u00e9fenseur engag\u00e9',
    icon: '\ud83c\udff0',
    desc: 'Mises en \u00e9chec, blocages et quarts ferm\u00e9s.',
    scoring: 0.8, playmaking: 0.8, defense: 1.3, rebounding: 1.4,
  },
};

// ---------- Step A: development ----------

export const DEV_OUTCOMES = {
  breakout: {
    id: 'breakout', icon: '\ud83d\udca5', label: 'Explosion', tone: 'emerald',
    delta: [3, 5], narratives: [
      "Premier sur la glace tout l'\u00e9t\u00e9, dernier \u00e0 partir. La ligue est pr\u00e9venue.",
      'Nouveau physique, nouveau lancer : les gardiens viennent de revoir la cassette des recruteurs.',
      "Un \u00e9t\u00e9 de vrai travail : corps, t\u00eate et lancer du poignet r\u00e9calibr\u00e9s.",
    ],
  },
  solid: {
    id: 'solid', icon: '\ud83d\udcc8', label: 'Progr\u00e8s s\u00fbr', tone: 'sky',
    delta: [1, 2], narratives: [
      'Des progr\u00e8s discrets mais constants. Les recruteurs approuvent.',
      'Il ajoute une arme \u00e0 son arsenal chaque mois. Belle trajectoire.',
    ],
  },
  flat: {
    id: 'flat', icon: '\u2796', label: 'Palier', tone: 'slate',
    delta: [0, 0], narratives: [
      'La courbe de d\u00e9veloppement stagne : m\u00eame jeu, m\u00eames habitudes.',
      "Un camp d'entra\u00eenement sans \u00e9clat. Le personnel attendait mieux.",
    ],
  },
  injury: {
    id: 'injury', icon: '\ud83d\ude91', label: 'Blessure', tone: 'rose',
    delta: [-3, -2], narratives: [
      "Blessure au genou au camp : quatre mois d'arr\u00eat et une longue route du retour.",
      'Coup de patin mardi, chirurgie mercredi. La saison est compromise.',
      'Douleurs dorsales chroniques. Le corps envoie un message.',
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
    id: 'decline', icon: '\ud83d\udcc9', label: 'D\u00e9clin physique', tone: 'amber',
    delta: [-2, -1], narratives: [
      "La premi\u00e8re foul\u00e9e n'est plus ce qu'elle \u00e9tait. L'\u00e9cart se r\u00e9duit.",
      "Le corps p\u00e8se. Le QI hockey reste, l'explosivit\u00e9 s'en va.",
    ],
  },
  vetCraft: {
    id: 'vetCraft', icon: '\ud83e\uddd9', label: "M\u00e9tier de v\u00e9t\u00e9ran", tone: 'purple',
    delta: [-1, 1], narratives: [
      'Perd un demi-pas, gagne deux lectures : le positionnement compense la vitesse perdue.',
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
  'Soir\u00e9e de rep\u00eachage : le commissaire prononce son nom en premier, l\u2019ar\u00e9na explose.',
  'Nouveau chandail, promesse num\u00e9ro un : la franchise vient de tout miser sur lui.',
];
export const DRAFT_FLAVOR_TOP10 = [
  'Choix du lottery ! Le plancher du rep\u00eachage applaudit, le projet commence ici.',
];
export const DRAFT_FLAVOR_REST = [
  'Choix de deuxi\u00e8me ronde : un contrat et un camp d\u2019entra\u00eenement r\u00e8glent tout.',
];

// ---------- Step C: awards ----------

// ---------- Regular season story events (Step B) ----------

export const SEASON_EVENTS = {
  masterclass: {
    id: 'masterclass', icon: '\ud83c\udf29\ufe0f', label: 'Soir\u00e9e de gala', tone: 'amber', ppg: 1,
    texts: [
      'Une soir\u00e9e de cinq points : il marque le but gagnant \u00e0 neuf secondes de la fin et l\u2019ar\u00e9na perd la t\u00eate.',
      'Un tour du chapeau naturel en onze minutes : tous les r\u00e9sum\u00e9s le rejouent toute la semaine.',
    ],
  },
  viral: {
    id: 'viral', icon: '\ud83d\udcf1', label: 'Clip viral', tone: 'fuchsia', ppg: 0,
    texts: [
      'Une passe lob\u00e9e entre les jambes \u00e0 travers le filet de protection devient virale : 9 millions de vues en 24 heures.',
      'Le spin-o-rama \u00e0 travers trois d\u00e9fenseurs devient un classique des pr\u00e9sentations de la ligue.',
    ],
  },
  slump: {
    id: 'slump', icon: '\ud83e\uddca', label: 'P\u00e9riode froide', tone: 'sky', ppg: -1,
    texts: [
      'Un mois glac\u00e9 : seize matchs sans le moindre point, les analystes supplient.',
      'Dix-neuf matchs sous sa norme : les trimestres t\u00e9l\u00e9 r\u00e9clament un remaniement des trios.',
    ],
  },
  minorInjury: {
    id: 'minorInjury', icon: '\ud83e\ude79', label: 'Blessure mineure', tone: 'rose', ppg: -1,
    texts: [
      'Douze matchs d\u2019absence pour un poignet foul\u00e9, retour graduel dans l\u2019alignement.',
      'Il joue avec une c\u00f4te fissur\u00e9e et un coussin suppl\u00e9mentaire : les chiffres paient le prix.',
    ],
  },
  tension: {
    id: 'tension', icon: '\ud83d\ude20', label: 'Tension au vestiaire', tone: 'indigo', ppg: -1,
    texts: [
      'Une s\u00e9ance vid\u00e9o qui d\u00e9g\u00e9n\u00e8re avec l\u2019entra\u00eeneur-chef : le club minimise, le vestiaire pas.',
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
  roy: { label: 'Troph\u00e9e Calder', icon: '\u2b50', tone: 'sky' },
  mip: { label: 'Joueur le plus am\u00e9lior\u00e9', icon: '\ud83d\udcd0', tone: 'teal' },
  allStar: { label: '\u00c9toile de la LNH', icon: '\ud83c\udf1f', tone: 'amber' },
  allNBA: { label: "Premi\u00e8re \u00e9quipe d'\u00e9toiles", icon: '\ud83c\udfd2', tone: 'orange' },
  dpoy: { label: 'Troph\u00e9e Norris', icon: '\ud83d\udee1\ufe0f', tone: 'indigo' },
  scoringChamp: { label: 'Troph\u00e9e Art Ross', icon: '\ud83c\udfaf', tone: 'orange' },
  allDefense: { label: 'Troph\u00e9e Selke', icon: '\ud83e\udd4a', tone: 'indigo' },
  allRookie: { label: "\u00c9quipe d'\u00e9toiles des recrues", icon: '\ud83c\udf31', tone: 'teal' },
  mvp: { label: 'Troph\u00e9e Hart', icon: '\ud83d\udc51', tone: 'yellow' },
  ring: { label: 'Coupe Stanley', icon: '\ud83c\udfd2', tone: 'emerald' },
  finalsMvp: { label: 'Troph\u00e9e Conn Smythe', icon: '\ud83e\udd47', tone: 'fuchsia' },
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
  { min: 375, label: 'GOAT \ud83d\udc10', sub: 'Chaque conversation commence par son nom.', tone: 'gold' },
  { min: 260, label: 'Temple de la renomm\u00e9e \u2014 premi\u00e8re ballote', sub: 'Son discours d\u2019intrusion dure quarante minutes et personne ne b\u00e2ille.', tone: 'emerald' },
  { min: 160, label: 'Membre du Temple de la renomm\u00e9e', sub: 'Une statue devant l\u2019ar\u00e9na, une plaque \u00e0 Toronto.', tone: 'sky' },
  { min: 100, label: '\u00c9toile de carri\u00e8re', sub: 'La franchise garde toujours son num\u00e9ro en m\u00e9moire rapide.', tone: 'indigo' },
  { min: 70, label: 'Joueur de r\u00f4le \u00e9lite', sub: 'Le deuxi\u00e8me contrat a \u00e9t\u00e9 arrach\u00e9 \u00e0 la sueur de son front.', tone: 'slate' },
  { min: -1, label: 'Rat\u00e9 (bust)', sub: 'Il restera c\u00e9l\u00e8bre pour cette course de masquettes \u00e0 laquelle il a particip\u00e9.', tone: 'rose' },
];

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

// ---------- Name generator ----------

export const FIRST_NAMES = ['Aiden', 'Marc-Antoine', 'Dylan', '\u00c9tienne', 'Xavier', 'Cade', '\u00c9lie', 'Mathis', 'Nico', 'Dario', 'William', 'L\u00e9o', 'Zachary', 'Zek\u00e9', 'Bruno'];
export const LAST_NAMES = ['Carrier', 'Brochu', 'Hayes', 'Whitfield', 'Rossi', 'Delgado', 'Monroe', 'Bellerose', 'Vance', 'Kovac', 'Sterling', 'Ferraro', 'Dawkins', 'Nakamura', 'Byrne'];

export function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
