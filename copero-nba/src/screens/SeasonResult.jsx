import { Chip, Crest, SeedChip, StatBox } from '../components/ui.jsx';

export default function SeasonResult({ career, season, onContinue }) {
  const isRookie = career.seasons.length === 0;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="flex items-center gap-3 anim-pop">
        <Crest teamId={season.teamId} size={48} />
        <div>
          <div className="font-black text-lg">Stagione {career.age} anni</div>
          <SeedChip season={season} />
        </div>
      </div>

      <div className="card-glass rounded-3xl p-5 w-full anim-pop">
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight">
            {season.wins}<span className="text-white/30 text-3xl">–</span>{season.losses}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-white/40 mt-1">Record {isRookie ? 'da rookie' : 'squadra'}</div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          <StatBox label="PPG" value={season.ppg} tone="text-amber-300" />
          <StatBox label="RPG" value={season.rpg} />
          <StatBox label="APG" value={season.apg} />
          <StatBox label="MIN" value={season.minutes} tone="text-white/70" />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-md rounded-2xl py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 tap"
      >
        🏆 Premi &amp; Playoff
      </button>
    </div>
  );
}
