import { useState } from 'react';
import Wheel from '../components/Wheel.jsx';
import { weightedPick, devWheel } from '../engine/simulationEngine.js';

export default function DevSpin({ career, onDone }) {
  const [target, setTarget] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const segments = devWheel(career).map((s) => ({
    id: s.id,
    label: s.outcome.label,
    icon: s.outcome.icon,
    sub: fmtDelta(s.outcome.delta),
    weight: s.weight,
    color: colorFor(s.id),
  }));

  const spin = () => {
    setTarget(segments.indexOf(weightedPick(segments)));
    setSpinning(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-6">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-widest text-white/40">Summer · Offseason</div>
        <h1 className="text-3xl font-black">Summer training</h1>
        <p className="text-white/50 text-sm mt-1 max-w-xs">{career.name}, {career.age} — how did the grind go?</p>
      </div>

      <Wheel segments={segments} targetIndex={target} spinning={spinning} onLanded={() => onDone(segments[target].id)} />

      {!spinning ? (
        <button onClick={spin} className="rounded-2xl px-8 py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-emerald-500 to-teal-500 tap anim-pulse-ring">
          ⚾ Spin the training
        </button>
      ) : (
        <p className="text-white/40 text-sm animate-pulse">Sweat, iron and video…</p>
      )}
    </div>
  );
}

function fmtDelta([lo, hi]) {
  if (lo === 0 && hi === 0) return '±0 OVR';
  if (hi > 0) return `+${lo}…+${hi} OVR`;
  return `${lo}…${hi} OVR`;
}

function colorFor(id) {
  return {
    breakout: '#10b981',
    solid: '#0ea5e9',
    flat: '#475569',
    injury: '#f43f5e',
    vetCraft: '#a855f7',
    decline: '#f59e0b',
  }[id] || '#475569';
}
