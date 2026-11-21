import { AwardCard, PrimaryButton } from '../components/ui.jsx';
import { AWARDS_META } from '../data/events.js';

const ORDER = ['mvp', 'finalsMvp', 'dpoy', 'scoringChamp', 'allNBA', 'allDefense', 'allStar', 'mip', 'allRookie', 'roy'];

export default function AwardsResult({ season, onContinue }) {
  const ordered = ORDER.filter((id) => season.awards.includes(id));

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-4 max-w-md mx-auto">
      <h1 className="text-3xl font-black text-center">Individual awards</h1>

      <div className="w-full space-y-2.5">
        {ordered.map((id, i) => (
          <div key={id} style={{ animationDelay: `${i * 0.25}s` }} className="anim-pop">
            <AwardCard id={id} />
          </div>
        ))}
        {ordered.length === 0 && (
          <div className="card-glass rounded-3xl p-8 text-center anim-pop">
            <div className="text-5xl">🏅</div>
            <p className="text-white/60 text-sm mt-3">No individual awards this season.</p>
          </div>
        )}
      </div>

      <div className="w-full mt-2">
        <PrimaryButton tone={season.mode === 'out' ? 'slate' : 'emerald'} onClick={onContinue}>
          {season.mode === 'out' ? '📝 Close the season' : season.mode === 'playin' ? '🎯 Play-In' : '🏆 Off to the Playoffs'}
        </PrimaryButton>
      </div>
      {ordered.length > 0 && (
        <p className="text-[11px] text-white/30">
          {ordered.map((id) => AWARDS_META[id].icon).join(' ')} added to your final trophy case
        </p>
      )}
    </div>
  );
}
