import { useState } from 'react';
import { Chip, Crest, SeedChip, StatBox } from '../components/ui.jsx';

export default function SeasonResult({ career, season, onContinue }) {
  const isRookie = career.seasons.length === 0;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="flex items-center gap-3 anim-pop">
        <Crest teamId={season.teamId} size={48} />
        <div>
          <div className="font-black text-lg">Saison — {career.age} ans</div>
          <SeedChip season={season} />
        </div>
      </div>

      <div className="card-glass rounded-3xl p-5 w-full anim-pop">
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight">
            {season.wins}<span className="text-white/30 text-3xl">–</span>{season.losses}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-white/40 mt-1">Fiche {isRookie ? '· année recrue' : ''}</div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          <StatBox label="PTS/M" value={season.ppg} tone="text-amber-300" />
          <StatBox label="A/M" value={season.rpg} />
          <StatBox label="ME/M" value={season.apg} />
          <StatBox label="TOI" value={season.minutes} tone="text-white/70" />
        </div>

        {season.events?.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-white/40">Fil de la saison</div>
            {season.events.map((ev) => (
              <div key={ev.id} className="anim-pop">
                <Chip tone={ev.tone}>{ev.icon} {ev.label}{ev.ppg !== 0 ? ` (${ev.ppg > 0 ? '+' : ''}${ev.ppg} PTS/M)` : ''}</Chip>
                <p className="text-xs text-white/50 mt-1 italic">{ev.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-md rounded-2xl py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 tap"
      >
        🏆 Honneurs &amp; Séries
      </button>
    </div>
  );
}
