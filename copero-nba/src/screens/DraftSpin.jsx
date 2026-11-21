import { useState } from 'react';
import Wheel from '../components/Wheel.jsx';
import { draftWheel } from '../engine/simulationEngine.js';
import { LEAGUE_NAME } from '../data/teams.js';

export default function DraftSpin({ onDone }) {
  const [target, setTarget] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const segments = draftWheel().map((s) => ({ label: `#${s.pick}`, weight: s.weight }));

  const spin = () => {
    const total = segments.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    let idx = segments.length - 1;
    for (let i = 0; i < segments.length; i += 1) {
      r -= segments[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    setTarget(idx);
    setSpinning(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-6">
      <h1 className="text-3xl font-black text-center">Draft {LEAGUE_NAME}</h1>
      <p className="text-white/50 text-sm text-center max-w-xs">Gira la ruota: il destino decide dove inizierà la tua carriera. Scelte alte = squadra debolissima ma minuti garantiti.</p>
      <Wheel
        segments={segments}
        targetIndex={target}
        spinning={spinning}
        size={300}
        onLanded={() => onDone(spinnerTargetPick(target))}
      />
      {!spinning && <button onClick={spin} className="rounded-2xl px-8 py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-orange-500 tap anim-pulse-ring">🎡 Gira il Draft</button>}
      {spinning && <p className="text-white/40 text-sm animate-pulse">Il commissario si avvicina al microfono…</p>}
    </div>
  );
}

function spinnerTargetPick(index) {
  return index + 1;
}
