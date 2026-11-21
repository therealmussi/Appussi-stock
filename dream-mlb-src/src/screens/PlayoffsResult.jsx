import { Crest, Chip, PrimaryButton, SeedChip, Trophy } from '../components/ui.jsx';
import { teamById } from '../data/teams.js';

const RESULT_LABEL = {
  out: 'Season over after 162 games',
  playin: 'Play-In lost: no Playoffs',
};

export default function PlayoffsResult({ career, season, playinWon, onContinue }) {
  const champion = season.ring;
  const result = season.playoffs?.result;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Crest teamId={season.teamId} size={48} />
        <div>
          <div className="font-black text-lg">Age {career.age}</div>
          <SeedChip season={season} />
        </div>
      </div>

      <div className={`w-full rounded-3xl p-6 text-center anim-pop border ${champion ? 'bg-gradient-to-b from-amber-500/25 to-transparent border-amber-400/50' : 'card-glass'}`}>
        {champion ? (
          <>
            <Trophy size={96} />
            <h1 className="text-3xl font-black mt-2 shimmer-text">WORLD SERIES CHAMPIONS</h1>
            <p className="text-white/60 text-sm mt-2">World Series ring no. {career.trophies.ring} for {career.name}.</p>
          </>
        ) : (
          <>
            <div className="text-5xl">{result === 'out' ? '🛋️' : '😢'}</div>
            <h1 className="text-xl font-black mt-2">{RESULT_LABEL[result] || result}</h1>
          </>
        )}
      </div>

      {season.mode === 'playin' && (
        <Chip tone={playinWon ? 'emerald' : 'rose'}>
          {playinWon ? '🎯 Play-In survived!' : '❌ Knocked out in the Play-In'}
        </Chip>
      )}

      {season.playoffs?.rounds?.length > 0 && (
        <div className="w-full card-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
          {season.playoffs.rounds.map((r, i) => {
            const won = r.mine > r.theirs;
            const decider = r.mine === 3 && r.theirs === 3;
            return (
              <div key={i} className="flex items-center gap-2.5 px-4 py-3 anim-slide" style={{ animationDelay: `${i * 0.25}s` }}>
                <Crest teamId={r.oppTeamId} size={28} />
                <div className="min-w-0">
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-[11px] text-white/40">vs {teamById(r.oppTeamId)?.city} {teamById(r.oppTeamId)?.name} · seed {r.oppSeed}</div>
                </div>
                <div className={`ml-auto font-black text-lg ${decider ? 'text-amber-300' : won ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {r.mine}–{r.theirs} {decider ? '· G7' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PrimaryButton onClick={onContinue}>{champion ? '🏆 Popped the champagne' : '➡️ Move on'}</PrimaryButton>
    </div>
  );
}
