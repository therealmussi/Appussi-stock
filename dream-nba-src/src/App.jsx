import { useState } from 'react';
import { useGame } from './store/useGame.js';
import Burst from './components/Burst.jsx';
import ProfilePanel from './components/ProfilePanel.jsx';
import { Crest, Chip } from './components/ui.jsx';
import { roleLabel } from './data/events.js';
import Home from './screens/Home.jsx';
import Create from './screens/Create.jsx';
import DraftSpin from './screens/DraftSpin.jsx';
import DraftResult from './screens/DraftResult.jsx';
import DevSpin from './screens/DevSpin.jsx';
import DevResult from './screens/DevResult.jsx';
import SeasonResult from './screens/SeasonResult.jsx';
import AwardsResult from './screens/AwardsResult.jsx';
import Game7Spin from './screens/Game7Spin.jsx';
import PlayoffsResult from './screens/PlayoffsResult.jsx';
import SeasonEnd from './screens/SeasonEnd.jsx';
import FaSpin from './screens/FaSpin.jsx';
import FaResult from './screens/FaResult.jsx';
import Career from './screens/Career.jsx';

export default function App() {
  const [state, dispatch] = useGame();
  const { screen, career, fx } = state;

  const view = gameRouter(state, dispatch);
  const isGameScreen = screen !== 'home' && screen !== 'create' && screen !== 'career';

  return (
    <div className="min-h-dvh bg-[#0a0d14] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.07),transparent_55%)]">
      {isGameScreen && career && <Hud career={career} />}
      <div key={screen} className="anim-slide">{view}</div>
      {fx && <Burst kind={fx.kind} onDone={() => dispatch({ type: 'FX_CLEAR' })} />}
    </div>
  );
}

function Hud({ career }) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <div className="sticky top-0 z-40 bg-[#0a0d14]/85 backdrop-blur border-b border-white/5 px-4 py-2.5 flex items-center gap-3">
      <Crest teamId={career.teamId} size={32} />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm truncate">#{career.jersey} {career.name}</div>
        <div className="text-[10px] text-white/40">{career.age} anni · {roleLabel(career.roleId)}</div>
      </div>
      <button onClick={() => setProfileOpen(true)} className="tap anim-pop" title="Profilo giocatore">
        <Chip tone="amber">OVR {career.ovr} ▾</Chip>
      </button>
      <Chip tone={career.trophies.ring > 0 ? 'emerald' : 'slate'}>💍 {career.trophies.ring}</Chip>
      {profileOpen && <ProfilePanel career={career} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

function gameRouter(state, dispatch) {
  switch (state.screen) {
    case 'home':
      return <HomeScreen state={state} dispatch={dispatch} />;
    case 'create':
      return <Create onStart={(payload) => dispatch({ type: 'START_NEW', payload })} />;
    case 'draftSpin':
      return <DraftSpin onDone={(pick) => dispatch({ type: 'DRAFT_DONE', pick })} />;
    case 'draftResult':
      return <DraftResult career={state.career} draft={state.draft} onContinue={() => dispatch({ type: 'DRAFT_CONTINUE' })} />;
    case 'devSpin':
      return <DevSpin career={state.career} onDone={(outcomeId) => dispatch({ type: 'DEV_DONE', outcomeId })} />;
    case 'devResult':
      return <DevResult career={state.career} dev={state.dev} onContinue={() => dispatch({ type: 'DEV_CONTINUE' })} />;
    case 'seasonResult':
      return <SeasonResult career={state.career} season={state.season} onContinue={() => dispatch({ type: 'AWARDS_DONE' })} />;
    case 'awardsResult':
      return <AwardsResult season={state.season} onContinue={() => dispatch({ type: 'PLAYOFFS_DONE' })} />;
    case 'game7Spin':
      return <Game7Spin season={state.season} pending={state.pendingGame7} onDone={(win) => dispatch({ type: 'GAME7_DONE', win })} />;
    case 'playoffsResult':
      return <PlayoffsResult career={state.career} season={state.season} playinWon={state.playinWon} onContinue={() => dispatch({ type: 'SEASON_CONTINUE' })} />;
    case 'seasonEnd':
      return (
        <SeasonEnd
          career={state.career}
          season={state.season}
          contract={state.career.contractYears}
          autoRetire={state.autoRetire}
          onNext={() => dispatch({ type: 'NEXT_SEASON' })}
          onRetire={() => dispatch({ type: 'RETIRE' })}
        />
      );
    case 'faSpin':
      return <FaSpin offers={state.faOffers} onDone={(index) => dispatch({ type: 'FA_DONE', index })} />;
    case 'faResult':
      return <FaResult career={state.career} faResult={state.faResult} onContinue={() => dispatch({ type: 'FA_CONTINUE' })} />;
    case 'career':
      return <Career career={state.career} summary={state.summary} onRestart={() => dispatch({ type: 'GO_HOME' })} />;
    default:
      return <HomeScreen state={state} dispatch={dispatch} />;
  }
}

function HomeScreen({ state, dispatch }) {
  const saved = state.saved;
  return (
    <Home
      hasExisting={Boolean(saved?.career)}
      onContinue={() => dispatch({ type: 'LOAD_SAVE', state: saved })}
      onNew={() => dispatch({ type: 'NEW_GAME' })}
    />
  );
}
