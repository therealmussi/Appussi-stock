import { useState } from 'react';
import Wheel from '../components/Wheel.jsx';
import { Crest, Chip } from '../components/ui.jsx';
import { teamTier } from '../data/teams.js';

export default function FaSpin({ offers, onDone }) {
  const [target, setTarget] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const segments = offers.map((o) => ({
    label: o.stay ? 'RE-SIGNER' : o.team.id,
    sub: `${o.team.rating} · ${o.years}a`,
    icon: o.stay ? '🏠' : null,
    weight: 1,
    color: o.team.primary === '#000000' ? '#333' : o.team.primary,
  }));

  const spin = () => {
    setTarget(Math.floor(Math.random() * segments.length));
    setSpinning(true);
  };

  return (
    <div className="min-h-dvh px-5 py-8 max-w-md mx-auto flex flex-col items-center gap-5">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-widest text-white/40">Contrat expiré</div>
        <h1 className="text-3xl font-black">Agence libre</h1>
      </div>

      <div className="w-full space-y-2">
        {offers.map((o, i) => {
          const tier = teamTier(o.team.rating);
          return (
            <div key={i} className={`card-glass rounded-2xl p-3 flex items-center gap-3 anim-slide ${i === 0 ? 'anim-none' : ''}`} style={{ animationDelay: `${i * 0.25}s` }}>
              <Crest teamId={o.team.id} size={38} />
              <div className="flex-1">
                <div className="font-bold text-sm">{o.stay ? 'Re-signer avec ton équipe' : `${o.team.city} ${o.team.name}`}</div>
                <div className="text-[11px] text-white/50">{o.role} · {o.years} ans</div>
              </div>
              <div className="text-right">
                <Chip tone={tier.tone}>{o.team.rating} {tier.label}</Chip>
              </div>
            </div>
          );
        })}
      </div>

      <Wheel segments={segments} targetIndex={target} spinning={spinning} size={250} onLanded={() => onDone(target)} />

      {!spinning && (
        <button onClick={spin} className="rounded-2xl px-8 py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-sky-500 to-indigo-600 tap anim-pulse-ring w-full max-w-md">
          📞 Décrocher le téléphone
        </button>
      )}
      {spinning && <p className="text-white/40 text-sm animate-pulse">Le téléphone de l’agent sonne…</p>}
    </div>
  );
}
