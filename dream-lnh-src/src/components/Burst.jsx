import { useEffect, useMemo } from 'react';

const PALETTES = {
  ring: ['#fbbf24', '#fde68a', '#f97316', '#ffffff'],
  mvp: ['#facc15', '#ffffff', '#f59e0b'],
  draft1: ['#f97316', '#fb923c', '#ffffff'],
  breakout: ['#34d399', '#a7f3d0', '#ffffff'],
  finalsMvp: ['#e879f9', '#fbcfe8', '#ffffff'],
  dpoy: ['#818cf8', '#c7d2fe', '#ffffff'],
  allNBA: ['#fb923c', '#fed7aa', '#ffffff'],
  sign: ['#38bdf8', '#e0f2fe', '#ffffff'],
  sad: ['#64748b', '#94a3b8'],
};

const ICONS = { ring: '💍', mvp: '👑', finalsMvp: '🥇', dpoy: '🛡️', draft1: '🎉', breakout: '💥', allNBA: '🏆', sign: '✍️' };

export default function Burst({ kind, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [kind]);

  const colors = PALETTES[kind] || PALETTES.ring;
  const icon = ICONS[kind];

  const particles = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const angle = (i / 34) * Math.PI * 2 + Math.random();
    const dist = 90 + Math.random() * 160;
    return {
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      rot: `${(Math.random() * 720 - 360).toFixed(0)}deg`,
      delay: `${(Math.random() * 0.25).toFixed(2)}s`,
      size: 6 + Math.random() * 8,
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
    };
  }), [kind]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'flash-bg 0.5s ease both' }}
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative">
        {icon && <div className="text-8xl anim-pop z-10">{icon}</div>}
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.round ? '50%' : '2px',
              '--tx': p.tx,
              '--ty': p.ty,
              '--rot': p.rot,
              animation: `burst 1.1s ${p.delay} cubic-bezier(0.1, 0.7, 0.3, 1) both`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
