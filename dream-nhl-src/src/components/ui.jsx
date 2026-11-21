import { useState } from 'react';
import { AWARDS_META, TROPHY_URL } from '../data/events.js';
import { logoUrl, teamById } from '../data/teams.js';

export function Crest({ teamId, size = 44 }) {
  const team = teamById(teamId);
  const [broken, setBroken] = useState(false);
  if (!team) return null;
  const imgSize = Math.round(size * 0.84);
  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0 border overflow-hidden"
      style={{
        width: size, height: size,
        background: team.primary,
        borderColor: team.secondary,
        color: '#fff',
        fontSize: size * 0.25,
        textShadow: '0 1px 2px rgba(0,0,0,.6)',
      }}
    >
      {broken ? (
        <span>{team.id}</span>
      ) : (
        <img
          src={logoUrl(team.id)}
          alt={team.name}
          width={imgSize}
          height={imgSize}
          draggable={false}
          onError={() => setBroken(true)}
          style={{ width: imgSize, height: imgSize, objectFit: 'contain' }}
        />
      )}
    </div>
  );
}

export function Trophy({ size = 96, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (broken || !TROPHY_URL) {
    return <div className={`anim-pop ${className}`} style={{ fontSize: size * 0.75, lineHeight: 1 }}>🏆</div>;
  }
  return (
    <img
      src={TROPHY_URL}
      alt="Stanley Cup"
      width={size}
      height={size}
      draggable={false}
      onError={() => setBroken(true)}
      className={`anim-pop ${className}`}
      style={{
        width: size, height: size, objectFit: 'contain',
        filter: 'drop-shadow(0 0 22px rgba(191,219,254,.45))',
      }}
    />
  );
}

export function OvrBar({ ovr }) {
  const pct = ((ovr - 55) / 44) * 100;
  const color = ovr >= 90 ? 'from-amber-400 to-yellow-300' : ovr >= 82 ? 'from-emerald-500 to-emerald-300' : ovr >= 76 ? 'from-sky-500 to-sky-300' : 'from-slate-500 to-slate-300';
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] text-white/60 mb-1">
        <span>OVERALL</span>
        <span className="font-bold text-white text-sm">{ovr}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`bar-fill h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatBox({ label, value, tone = 'text-white' }) {
  return (
    <div className="card-glass rounded-2xl px-3 py-3 text-center tap">
      <div className={`text-2xl font-black leading-none ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1.5">{label}</div>
    </div>
  );
}

export function Chip({ tone = 'slate', children, className = '' }) {
  const tones = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
    yellow: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/40',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    teal: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    slate: 'bg-white/10 text-white/70 border-white/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone] || tones.slate} ${className}`}>
      {children}
    </span>
  );
}

export function AwardCard({ id, small = false }) {
  const meta = AWARDS_META[id];
  if (!meta) return null;
  if (small) return <Chip tone={meta.tone}>{meta.icon} {meta.label}</Chip>;
  return (
    <div className="card-glass rounded-2xl p-4 flex items-center gap-3 anim-pop" key={id}>
      <span className="text-3xl">{meta.icon}</span>
      <div>
        <div className="font-bold">{meta.label}</div>
        <div className="text-xs text-white/50">Won this season</div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, tone = 'amber', className = '' }) {
  const tones = {
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_8px_30px_rgba(249,115,22,0.35)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_8px_30px_rgba(16,185,129,0.35)]',
    slate: 'bg-white/10 border border-white/15',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl py-4 font-black uppercase tracking-wider text-black ${tones[tone]} tap anim-pulse-ring ${className}`}
    >
      {children}
    </button>
  );
}

export function SeedChip({ season }) {
  if (season.mode === 'out') return <Chip tone="rose">❌ Eliminated — out of the race</Chip>;
  if (season.mode === 'playin') return <Chip tone="amber">🎯 Play-In — Seed {season.seed}</Chip>;
  return <Chip tone="emerald">🏒 Playoffs — Seed {season.seed}</Chip>;
}
