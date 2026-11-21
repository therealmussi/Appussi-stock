import { useState } from 'react';
import Wheel from '../components/Wheel.jsx';
import { Crest } from '../components/ui.jsx';

export default function Game7Spin({ season, pending, onDone }) {
  const [target, setTarget] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const pWin = Math.round(pending.chance * 100);
  const segments = [
    { label: 'VICTORY', sub: `${pWin}%`, icon: '🏆', weight: pWin, color: '#f59e0b' },
    { label: 'DEFEAT', sub: `${100 - pWin}%`, icon: '💔', weight: 100 - pWin, color: '#7f1d3a' },
  ];

  const spin = () => {
    const total = segments.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    let idx = r <= segments[0].weight ? 0 : 1;
    setTarget(idx);
    setSpinning(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-6">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-widest text-amber-400">World Series · Series 3–3</div>
        <h1 className="text-3xl font-black mt-1">GAME 7</h1>
      </div>

      <div className="flex items-center gap-4">
        <Crest teamId={season.teamId} size={52} />
        <span className="text-2xl font-black text-white/40">vs</span>
        <div className="card-glass rounded-full h-12 w-12 flex items-center justify-center font-black text-rose-300">?</div>
      </div>

      <Wheel segments={segments} targetIndex={target} spinning={spinning} size={260} onLanded={() => onDone(target === 0)} />

      {!spinning ? (
        <button onClick={spin} className="rounded-2xl px-8 py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-red-500 to-amber-500 tap anim-pulse-ring">
          🔥 Step to the plate
        </button>
      ) : (
        <p className="text-white/40 text-sm animate-pulse">Full house, ninth inning… draw the swing.</p>
      )}
    </div>
  );
}
