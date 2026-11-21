// ============================================================
// MOTORE DI SIMULAZIONE (puro, nessun DOM, nessun React).
// Dipende solo dai contratti dati in src/data/*: duplicando
// teams.js/events.js per NFL/MLB/NHL, questo file resta intatto.
// ============================================================

import {
  TEAMS, teamById, SEASON_GAMES, PLAYOFF_ROUNDS,
} from '../data/teams.js';
import {
  GAME, ARCHETYPES, ROLE_SCORING, ROLE_PASS, ROLE_REB,
  DEV_OUTCOMES, DEV_TABLE, DEV_OUTCOME_OLD, DEV_TABLE_OLD,
  draftPickWeight, DRAFT_FLAVOR_TOP5, DRAFT_FLAVOR_TOP10, DRAFT_FLAVOR_REST,
  retireChance, SCORE_WEIGHTS, verdictFor, randomName,
  SEASON_EVENTS, SEASON_EVENT_TABLE,
} from '../data/events.js';

// ---------------- RNG helpers ----------------

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rnd = (min, max) => min + Math.random() * (max - min);
const rndInt = (min, max) => Math.floor(rnd(min, max + 1));
export const chance = (p) => Math.random() < p;
const jitter = (amount) => rnd(-amount, amount);
const round1 = (v) => Math.round(v * 10) / 10;
const pickFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function weightedPick(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

// ---------------- Carriera: creazione ----------------

export function createCareer({ name, roleId, archetypeId }) {
  return {
    name: name?.trim() || randomName(),
    roleId,
    archetypeId,
    age: GAME.START_AGE,
    ovr: rndInt(GAME.ROOKIE_OVR_MIN, GAME.ROOKIE_OVR_MAX),
    peakOvr: 0,
    teamId: null,
    contractYears: 0,
    draftPick: null,
    minutesBoost: 0,
    jersey: rndInt(0, 99),
    retired: false,
    autoRetired: false,
    events: [],
    seasons: [],
    trophies: { ring: 0, finalsMvp: 0, mvp: 0, dpoy: 0, roy: 0, mip: 0, allStar: 0, allNBA: 0, scoringChamp: 0, allDefense: 0, allRookie: 0 },
  };
}

export function archetypeOf(career) {
  return ARCHETYPES[career.archetypeId];
}

export function careerAverages(career) {
  const seasons = career.seasons;
  if (!seasons.length) return { ppg: 0, rpg: 0, apg: 0 };
  const n = seasons.length;
  const sum = seasons.reduce(
    (acc, s) => ({ ppg: acc.ppg + s.ppg, rpg: acc.rpg + s.rpg, apg: acc.apg + s.apg }),
    { ppg: 0, rpg: 0, apg: 0 },
  );
  return { ppg: round1(sum.ppg / n), rpg: round1(sum.rpg / n), apg: round1(sum.apg / n) };
}

export function teamsWorn(career) {
  const ids = [...new Set(career.seasons.map((s) => s.teamId).filter(Boolean))];
  return ids.map(teamById);
}

// ---------------- Draft ----------------

export function draftWheel() {
  return Array.from({ length: TEAMS.length }, (_, i) => ({
    pick: i + 1,
    weight: draftPickWeight(i + 1),
  }));
}

export function resolveDraft(career, forcedPick = null) {
  const segments = draftWheel();
  const pick = forcedPick ?? weightedPick(segments).pick;

  const order = shuffle(TEAMS)
    .map((t) => ({ t, k: t.rating + jitter(4) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.t);

  const team = order[pick - 1];
  const flavor = pick <= 5
    ? pickFrom(DRAFT_FLAVOR_TOP5)
    : pick <= 10
      ? pickFrom(DRAFT_FLAVOR_TOP10)
      : pickFrom(DRAFT_FLAVOR_REST);

  career.draftPick = pick;
  career.teamId = team.id;
  career.contractYears = GAME.ROOKIE_CONTRACT_YEARS;
  career.minutesBoost = pick <= 5 ? 7 : pick <= 10 ? 4 : pick <= 20 ? 1 : -2;

  return {
    pick,
    team,
    flavor,
    minutesBoost: career.minutesBoost,
    contractYears: career.contractYears,
  };
}

// ---------------- Step A: sviluppo ----------------

function resolveDevOutcome(row) {
  return { ...row, outcome: DEV_OUTCOMES[row.id] || DEV_OUTCOME_OLD[row.id] };
}

export function devWheel(career) {
  let table;
  if (career.age <= 23) table = DEV_TABLE.young;
  else if (career.age <= 30) table = DEV_TABLE.prime;
  else if (career.age <= 33) table = DEV_TABLE_OLD;
  else table = DEV_TABLE_OLD.map((o) => ({ ...o, weight: o.id === 'injury' ? o.weight + 8 : o.weight }));
  return table.map(resolveDevOutcome);
}

export function applyDevelopment(career, outcomeId) {
  const outcome = DEV_OUTCOMES[outcomeId] || DEV_OUTCOME_OLD[outcomeId];
  const [lo, hi] = outcome.delta;
  const delta = hi > lo ? rndInt(lo, hi) : lo;
  const ovr = clamp(career.ovr + delta, 55, 99);
  const applied = {
    ovr,
    delta: ovr - career.ovr,
    outcomeId,
    label: outcome.label,
    icon: outcome.icon,
    tone: outcome.tone,
    narrative: pickFrom(outcome.narratives),
  };
  career.ovr = ovr;
  career.peakOvr = Math.max(career.peakOvr, ovr);
  return applied;
}

// ---------------- Step B: stagione regolare ----------------

export function simSeason(career) {
  const team = teamById(career.teamId);
  const arch = archetypeOf(career);
  const ovr = career.ovr;

  const minutes = clamp(
    20 + (ovr - 72) * 1.5 + (career.minutesBoost || 0) + career.seasons.length * 0.6,
    12, 38,
  );

  const base = ovr - 60;
  let ppg = clamp(base * 0.85 * arch.scoring * ROLE_SCORING[career.roleId] + jitter(2.2), 3, 38);
  const rpg = round1(clamp(ppg * ROLE_REB[career.roleId] * arch.rebounding * rnd(0.85, 1.15), 0.5, 16));
  const apg = round1(clamp(ppg * ROLE_PASS[career.roleId] * arch.playmaking * rnd(0.85, 1.15), 0.3, 13));

  const events = rollSeasonEvents();
  for (const ev of events) ppg += ev.ppg;
  ppg = round1(ppg);

  const teamStrength = team.rating + (ovr > 80 ? (ovr - 80) * 0.25 : 0);
  const wins = clamp(Math.round(41 + (teamStrength - 74) * 2.1 + jitter(6)), 17, 66);
  const rank = 1 + Math.floor((66 - wins) / 3.2);

  let mode = 'playoffs';
  let seed = clamp(rank, 1, 8);
  if (rank >= 9 && rank <= 10) {
    mode = 'playin';
    seed = rank;
  } else if (rank > 10) {
    mode = 'out';
    seed = null;
  }

  return {
    teamId: team.id,
    age: career.age,
    ovr,
    minutes: Math.round(minutes),
    ppg,
    rpg,
    apg,
    events,
    wins,
    losses: SEASON_GAMES - wins,
    mode,
    seed,
    awards: [],
    playoffs: null,
    ring: false,
  };
}

// ---------------- Play-In ----------------

export function simPlayIn(season, career) {
  const p = clamp((season.seed <= 8 ? 0.62 : 0.32) + (career.ovr - 84) * 0.02, 0.12, 0.88);
  const qualified = chance(p);
  if (qualified) season.seed = season.seed <= 8 ? 7 : 8;
  season.mode = qualified ? 'playoffs' : 'playin';
  return qualified;
}

// ---------------- Premi ----------------

export function simAwards(season, career, devDelta = 0) {
  const arch = archetypeOf(career);
  const awards = [];
  const isRookie = career.seasons.length === 0;

  if (isRookie && season.ppg >= 11) {
    const pickBoost = career.draftPick <= 3 ? 0.14 : career.draftPick <= 5 ? 0.09 : career.draftPick <= 10 ? 0.03 : career.draftPick >= 20 ? -0.08 : 0;
    const p = clamp((season.ppg - 9) * 0.06 + pickBoost + (season.seed <= 3 ? 0.05 : 0), 0.06, 0.88);
    if (chance(p)) awards.push('roy');
  }

  if (!isRookie && devDelta >= 4 && season.ppg >= 15 && chance(0.4)) {
    awards.push('mip');
  }

  if (season.ppg >= 16) {
    const p = clamp((season.ppg - 14) * 0.055 + (career.ovr - 82) * 0.02, 0, 0.95);
    if (chance(p)) awards.push('allStar');
  }

  if (season.ppg >= 25 && career.ovr >= 85) {
    if (chance(season.ppg >= 29 ? 0.85 : 0.6)) awards.push('allNBA');
  } else if (season.ppg >= 21 && career.ovr >= 89 && chance(0.35)) {
    awards.push('allNBA');
  }

  const defensiveProfile = arch.defense >= 1.2 || career.roleId === 'C';
  if (defensiveProfile && career.ovr >= 86 && season.ppg >= 12 && chance(0.33)) {
    awards.push('dpoy');
  }

  if (isRookie && season.ppg >= 10) {
    const p = clamp((season.ppg - 8) * 0.07, 0.15, 0.8);
    if (chance(p)) awards.push('allRookie');
  }

  if (season.ppg >= 30) {
    if (chance(clamp((season.ppg - 28) * 0.25, 0.15, 0.8))) awards.push('scoringChamp');
  }

  if (defensiveProfile && career.ovr >= 84 && chance(0.3)) {
    awards.push('allDefense');
  }

  if (season.ppg >= 28 && season.wins >= 52 && career.ovr >= 89) {
    const p = clamp((season.ppg - 27) * 0.07 + (season.wins - 50) * 0.02 + (career.ovr - 89) * 0.03, 0.08, 0.62);
    if (chance(p)) awards.push('mvp');
  }

  season.awards = awards;
  return awards;
}

// ---------------- Playoff ----------------

function playerBoost(career) {
  return career.ovr > 82 ? (career.ovr - 82) * 0.3 : 0;
}

function seriesWinChance(myStr, oppStr) {
  return clamp(0.5 + (myStr - oppStr) * 0.032, 0.16, 0.84);
}

function simSeries(p, stopAtSeven = false) {
  let mine = 0;
  let theirs = 0;
  while (mine < 4 && theirs < 4) {
    if (stopAtSeven && mine === 3 && theirs === 3) break;
    if (chance(p)) mine += 1; else theirs += 1;
  }
  return { mine, theirs, wentSeven: mine === 3 && theirs === 3 };
}

export function simPlayoffs(season, career) {
  if (season.mode === 'out') {
    season.playoffs = { result: 'out', rounds: [] };
    return { season, pending: false };
  }

  const team = teamById(season.teamId);
  const myStr = team.rating - (season.seed - 1) * 1.4 + playerBoost(career);
  const rounds = [];

  for (let idx = 0; idx < PLAYOFF_ROUNDS.length; idx += 1) {
    const name = PLAYOFF_ROUNDS[idx];
    const isFinals = idx === PLAYOFF_ROUNDS.length - 1;
    const oppSeed = isFinals ? rndInt(1, 4) : rndInt(1, idx === 0 ? 8 : 6);
    const oppStr = isFinals
      ? 91 - (oppSeed - 1) * 1.5 + jitter(2.5)
      : clamp(team.rating - (oppSeed - 1) * 1.4 + jitter(3), 62, 97);
    const winChance = seriesWinChance(myStr, oppStr);
    const res = simSeries(winChance, isFinals);

    if (isFinals && res.wentSeven) {
      rounds.push({ name, oppSeed, mine: 3, theirs: 3, chance: winChance });
      return {
        season,
        pending: true,
        pendingState: { rounds, chance: winChance, oppSeed },
      };
    }

    rounds.push({ name, oppSeed, mine: res.mine, theirs: res.theirs, chance: winChance });
    if (res.theirs === 4) {
      season.playoffs = { result: name, rounds };
      return { season, pending: false };
    }
  }

  season.ring = true;
  season.playoffs = { result: 'champion', rounds };
  if (chance(finalsMvpChance(season, career))) season.awards.push('finalsMvp');
  return { season, pending: false };
}

function finalsMvpChance(season, career) {
  return clamp(0.3 + (season.ppg - 22) * 0.05 + (career.ovr - 88) * 0.04, 0.2, 0.8);
}

// Risolve la Gara 7 delle Finals decisa dal giocatore con la ruota.
export function resolveGame7(season, career, pendingState, win) {
  const rounds = pendingState.rounds.map((r, i) => (
    i === pendingState.rounds.length - 1
      ? { ...r, mine: win ? 4 : 3, theirs: win ? 3 : 4 }
      : r
  ));

  if (win) {
    season.ring = true;
    season.playoffs = { result: 'champion', rounds };
    if (chance(clamp(finalsMvpChance(season, career) + 0.15, 0.2, 0.8))) {
      season.awards.push('finalsMvp');
    }
  } else {
    season.playoffs = { result: PLAYOFF_ROUNDS[PLAYOFF_ROUNDS.length - 1], rounds };
  }
  return season;
}

// ---------------- Free Agency ----------------

export function faWheel(career) {
  const pool = shuffle(TEAMS.filter((t) => t.id !== career.teamId))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  const offers = shuffle(pool).slice(0, 4).map((t) => ({
    stay: false,
    team: t,
    years: rndInt(2, 4),
    role: t.rating >= 87 ? 'Titolo subito' : t.rating >= 81 ? 'Ruolo chiave' : t.rating >= 76 ? 'Protagonista' : 'Progetto personale',
  }));

  return [...offers, {
    stay: true,
    team: teamById(career.teamId),
    years: rndInt(3, 5),
    role: 'Casa conosciuta',
  }];
}

export function acceptOffer(career, offer) {
  const changedTeam = !offer.stay && offer.team.id !== career.teamId;
  career.teamId = offer.team.id;
  career.contractYears = offer.years;
  career.minutesBoost = offer.stay
    ? clamp(career.minutesBoost, -2, 7)
    : offer.team.rating >= 85 ? 0 : 5;
  return { changedTeam, years: offer.years, team: offer.team };
}

// ---------------- Ritiro e riepilogo ----------------

export function checkAutoRetirement(career) {
  if (career.retired) return true;
  if (career.age >= GAME.RETIRE_AGE_MAX) return true;
  return chance(retireChance(career.age, career.ovr));
}

export function careerSummary(career) {
  const t = career.trophies;
  const totalWins = career.seasons.reduce((s, x) => s + x.wins, 0);

  let score = 0;
  score += t.ring * SCORE_WEIGHTS.ring;
  score += t.finalsMvp * SCORE_WEIGHTS.finalsMvp;
  score += t.mvp * SCORE_WEIGHTS.mvp;
  score += t.dpoy * SCORE_WEIGHTS.dpoy;
  score += t.roy * SCORE_WEIGHTS.roy;
  score += t.mip * SCORE_WEIGHTS.mip;
  score += t.allNBA * SCORE_WEIGHTS.allNBA;
  score += t.allStar * SCORE_WEIGHTS.allStar;
  score += totalWins * SCORE_WEIGHTS.wins;
  score += Math.max(0, career.peakOvr - 70) * SCORE_WEIGHTS.peakOvr;
  score += career.seasons.length * SCORE_WEIGHTS.longevity;
  score = Math.round(score);

  let pts = 0, reb = 0, ast = 0;
  for (const s of career.seasons) {
    pts += s.ppg * SEASON_GAMES;
    reb += s.rpg * SEASON_GAMES;
    ast += s.apg * SEASON_GAMES;
  }

  const milestones = [];
  const add = (cond, label) => { if (cond) milestones.push(label); };
  add(pts >= 30000, 'Club dei 30.000 punti 👑');
  add(pts >= 20000, '20.000 punti in carriera 🥇');
  add(reb >= 10000, '10.000 rimbalzi 🏋️');
  add(ast >= 8000, '8.000 assist 🧠');
  add(t.ring >= 5, 'Dynastia: 5 anelli 💍');
  add(t.mvp >= 2, 'MVP pluripremiato 🐐');
  add(career.seasons.length >= 20, '20 stagioni di servizio 🦴');

  return {
    years: career.seasons.length,
    teams: teamsWorn(career),
    peakOvr: career.peakOvr || career.ovr,
    averages: careerAverages(career),
    totals: { pts: Math.round(pts), reb: Math.round(reb), ast: Math.round(ast) },
    milestones,
    totalWins,
    trophies: t,
    careerScore: score,
    verdict: verdictFor(score),
  };
}

// ---------------- Bookkeeping ----------------

export function commitTrophies(career, awards) {
  for (const a of awards) {
    if (a in career.trophies) career.trophies[a] += 1;
  }
}

export function commitSeason(career, season) {
  career.seasons.push(season);
  career.peakOvr = Math.max(career.peakOvr, season.ovr);
}

// ---------------- Eventi salienti della stagione regolare ----------------

function rollSeasonEvents() {
  const events = [];
  const roll = () => {
    const chosen = weightedPick(SEASON_EVENT_TABLE);
    const meta = SEASON_EVENTS[chosen.id];
    return { type: chosen.id, ...meta, text: pickFrom(meta.texts) };
  };

  const first = roll();
  events.push(first);
  if (first.ppg !== 0 && chance(0.35)) events.push(roll());

  return events.map((ev, i) => ({
    id: `${ev.type}_${i}`,
    type: ev.type,
    icon: ev.icon,
    label: ev.label,
    tone: ev.tone,
    ppg: ev.ppg,
    text: ev.text,
  }));
}

// ---------------- Profilo attributi (solo presentazione) ----------------

export function playerAttributes(career) {
  const arch = archetypeOf(career);
  const role = career.roleId;
  const top = (x) => Math.round(clamp(x, 40, 99));
  return {
    scoring: top(career.ovr - 5 + (arch.scoring - 0.95) * 35 + (role === 'SG' || role === 'SF' ? 4 : 0)),
    playmaking: top(career.ovr - 5 + (arch.playmaking - 1) * 40 + (role === 'PG' ? 6 : 0)),
    defense: top(career.ovr - 5 + (arch.defense - 1) * 40 + (role === 'C' ? 3 : 0)),
    rebounding: top(career.ovr - 5 + (arch.rebounding - 1) * 40 + (role === 'C' || role === 'PF' ? 6 : 0)),
  };
}
