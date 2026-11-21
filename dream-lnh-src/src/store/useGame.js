import { useEffect, useReducer } from 'react';
import {
  createCareer, resolveDraft, applyDevelopment, simSeason, simPlayIn,
  simAwards, simPlayoffs, resolveGame7, faWheel, acceptOffer,
  checkAutoRetirement, commitTrophies, commitSeason, careerSummary,
} from '../engine/simulationEngine.js';
import { GAME } from '../data/events.js';

const SAVE_KEY = 'dream-lnh-save-v1';
const SAVE_VERSION = 1;

export const initialState = {
  screen: 'home',
  saved: null,
  career: null,
  draft: null,
  dev: null,
  season: null,
  pendingGame7: null,
  playinWon: null,
  faOffers: null,
  faResult: null,
  devDelta: 0,
  autoRetire: false,
  summary: null,
  fx: null,
};

function hydrate(raw) {
  if (!raw || raw.v !== SAVE_VERSION) return null;
  return { ...initialState, ...raw.state, fx: null };
}

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    return hydrate(raw);
  } catch {
    return null;
  }
}

function persist(state) {
  const { screen, career, draft, dev, season, pendingGame7, playinWon, faOffers, faResult, devDelta, autoRetire, summary } = state;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: SAVE_VERSION,
      state: { screen, career, draft, dev, season, pendingGame7, playinWon, faOffers, faResult, devDelta, autoRetire, summary },
    }));
  } catch {
    /* storage non disponibile: il gioco continua in memoria */
  }
}

function bigFx(season) {
  if (season?.ring) return 'ring';
  if (season?.awards?.includes('mvp')) return 'mvp';
  if (season?.awards?.includes('finalsMvp')) return 'finalsMvp';
  if (season?.awards?.includes('dpoy')) return 'dpoy';
  if (season?.awards?.includes('allNBA')) return 'allNBA';
  return null;
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_NEW': {
      const career = createCareer(action.payload);
      return { ...state, ...initialState, saved: state.saved, career, screen: 'draftSpin' };
    }

    case 'GO_HOME':
      return { ...initialState, saved: loadSave() };

    case 'NEW_GAME':
      return { ...state, saved: state.saved, screen: 'create' };

    case 'LOAD_SAVE':
      return { ...action.state, saved: state.saved, fx: null, screen: action.state.screen || 'home' };

    case 'DRAFT_DONE': {
      const career = { ...state.career };
      const draft = resolveDraft(career, action.pick);
      return {
        ...state, career, draft, screen: 'draftResult',
        fx: draft.pick <= 3 ? { kind: 'draft1', key: Date.now() } : null,
      };
    }

    case 'DRAFT_CONTINUE':
      return { ...state, screen: 'devSpin' };

    case 'DEV_DONE': {
      const career = { ...state.career };
      const dev = applyDevelopment(career, action.outcomeId);
      return {
        ...state, career, dev, devDelta: dev.delta, screen: 'devResult',
        fx: dev.delta >= 3 ? { kind: 'breakout', key: Date.now() } : null,
      };
    }

    case 'DEV_CONTINUE': {
      const season = simSeason(state.career);
      return { ...state, season, screen: 'seasonResult' };
    }

    case 'AWARDS_DONE': {
      const career = { ...state.career };
      const season = { ...state.season };
      const awards = simAwards(season, career, state.devDelta);
      season.awards = awards;
      return {
        ...state, career, season, screen: 'awardsResult',
        fx: awards.includes('mvp') ? { kind: 'mvp', key: Date.now() } : null,
      };
    }

    case 'PLAYOFFS_DONE': {
      const career = { ...state.career };
      let season = { ...state.season };
      let playinWon = null;

      if (season.mode === 'playin') {
        playinWon = simPlayIn(season, career);
      }

      if (season.mode !== 'playoffs') {
        season.playoffs = { result: season.mode === 'out' ? 'out' : 'playin', rounds: [] };
        commitSeason(career, season);
        commitTrophies(career, season.awards);
        return { ...state, career, season, playinWon, screen: 'playoffsResult', fx: null };
      }

      const outcome = simPlayoffs(season, career);
      if (outcome.pending) {
        return { ...state, career, season, pendingGame7: outcome.pendingState, screen: 'game7Spin' };
      }
      commitSeason(career, season);
      commitTrophies(career, season.awards);
      return {
        ...state, career, season, playinWon, screen: 'playoffsResult',
        fx: bigFx(season) ? { kind: bigFx(season), key: Date.now() } : null,
      };
    }

    case 'GAME7_DONE': {
      const career = { ...state.career };
      const season = { ...state.season };
      resolveGame7(season, career, state.pendingGame7, action.win);
      commitSeason(career, season);
      commitTrophies(career, season.awards);
      return {
        ...state, career, season, pendingGame7: null, screen: 'playoffsResult',
        fx: season.ring ? { kind: 'ring', key: Date.now() } : null,
      };
    }

    case 'SEASON_CONTINUE': {
      const autoRetire = checkAutoRetirement(state.career);
      return { ...state, autoRetire, screen: 'seasonEnd' };
    }

    case 'NEXT_SEASON': {
      const career = { ...state.career };
      career.age += 1;
      career.contractYears -= 1;
      if (career.contractYears <= 0) {
        const faOffers = faWheel(career);
        return { ...state, career, faOffers, screen: 'faSpin' };
      }
      return { ...state, career, dev: null, devDelta: 0, season: null, screen: 'devSpin' };
    }

    case 'FA_DONE': {
      const career = { ...state.career };
      const offer = state.faOffers[action.index];
      const faResult = acceptOffer(career, offer);
      return {
        ...state, career, faResult, screen: 'faResult',
        fx: faResult.changedTeam ? { kind: 'sign', key: Date.now() } : null,
      };
    }

    case 'FA_CONTINUE':
      return { ...state, faOffers: null, faResult: null, season: null, dev: null, devDelta: 0, screen: 'devSpin' };

    case 'RETIRE': {
      const career = { ...state.career, retired: true, autoRetired: state.autoRetire };
      const summary = careerSummary(career);
      return { ...state, career, summary, screen: 'career', fx: null };
    }

    case 'FX_CLEAR':
      return { ...state, fx: null };

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...initialState,
    saved: loadSave(),
  }));

  useEffect(() => {
    if (state.career) persist(state);
  }, [state]);

  return [state, dispatch];
}

export function hasSave() {
  return Boolean(loadSave()?.career);
}

export { GAME };
