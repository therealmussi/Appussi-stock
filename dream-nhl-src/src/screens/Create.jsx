import { useState } from 'react';
import { ROLES, ARCHETYPES, randomName } from '../data/events.js';
import { PrimaryButton } from '../components/ui.jsx';

export default function Create({ onStart }) {
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('C');
  const [archId, setArchId] = useState('scorer');
  const archList = Object.values(ARCHETYPES);

  return (
    <div className="min-h-dvh px-5 py-8 max-w-md mx-auto flex flex-col gap-5">
      <h1 className="text-3xl font-black">
        Create your <span className="shimmer-text">prospect</span>
      </h1>

      <div className="card-glass rounded-2xl p-4">
        <label className="text-[11px] uppercase tracking-wider text-white/50">Name</label>
        <div className="flex gap-2 mt-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-amber-400/60"
            maxLength={24}
          />
          <button onClick={() => setName(randomName())} className="px-4 rounded-xl bg-white/10 tap text-lg">🎲</button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-white/50">Position</span>
          <button
            onClick={() => setRoleId(ROLES[Math.floor(Math.random() * ROLES.length)].id)}
            className="text-xs text-amber-400 tap"
          >
            🎲 Spin
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleId(r.id)}
              className={`rounded-2xl py-3 text-center tap border ${roleId === r.id ? 'bg-amber-500 text-black border-amber-300 font-black' : 'card-glass text-white/70'}`}
            >
              <div className="text-xl">{r.icon}</div>
              <div className="text-xs mt-1 font-bold">{r.id}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-white/50">Archetype</span>
          <button
            onClick={() => setArchId(archList[Math.floor(Math.random() * archList.length)].id)}
            className="text-xs text-amber-400 tap"
          >
            🎲 Spin
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {archList.map((a) => (
            <button
              key={a.id}
              onClick={() => setArchId(a.id)}
              className={`rounded-2xl p-3 text-left tap border ${archId === a.id ? 'bg-amber-500/20 border-amber-400' : 'card-glass'}`}
            >
              <div className="font-bold text-sm">{a.icon} {a.label}</div>
              <div className="text-[11px] text-white/50 mt-0.5 leading-snug">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 text-sm text-white/70">
        Draft debut at <span className="text-white font-bold">19</span> with{' '}
        <span className="text-white font-bold">72–76 OVR</span>, headed to the Draft.
      </div>

      <PrimaryButton onClick={() => onStart({ name, roleId, archetypeId: archId })}>
        🎩 Off to the Draft
      </PrimaryButton>
    </div>
  );
}
