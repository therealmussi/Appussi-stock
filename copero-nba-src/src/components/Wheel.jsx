import { useEffect, useState } from 'react';

function segAngles(segments) {
  const total = segments.reduce((s, x) => s + (x.weight ?? 1), 0);
  let acc = 0;
  return segments.map((s) => {
    const span = ((s.weight ?? 1) / total) * 360;
    const center = acc + span / 2;
    acc += span;
    return { center, span };
  });
}

const FALLBACK = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#ef4444', '#eab308'];

export default function Wheel({ segments, targetIndex, spinning, onLanded, size = 290 }) {
  const [rotation, setRotation] = useState(0);
  const angles = segAngles(segments);

  useEffect(() => {
    if (!spinning || targetIndex == null) return;
    const seg = angles[targetIndex];
    const target = (360 - seg.center) % 360;
    const spins = 5;
    setRotation((prev) => {
      const mod = ((prev % 360) + 360) % 360;
      const delta = spins * 360 + ((target - mod) % 360 + 360) % 360;
      return prev + delta;
    });
    const t = setTimeout(onLanded, 3900);
    return () => clearTimeout(t);
  }, [spinning, targetIndex]);

  const gradient = segments.map((s, i) => {
    const a = angles[i];
    const color = s.color || FALLBACK[i % FALLBACK.length];
    const start = angles.slice(0, i).reduce((sum, x) => sum + x.span, 0);
    return `${color} ${start}deg ${start + a.span}deg`;
  }).join(', ');

  const labelRadius = size / 2 - 26;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full border-4 border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
        style={{
          background: `conic-gradient(${gradient})`,
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 3.8s cubic-bezier(0.12, 0.68, 0.06, 1)' : 'none',
        }}
      >
        {segments.map((s, i) => {
          const a = angles[i];
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 text-white"
              style={{
                transform: `rotate(${a.center}deg) translateY(-${labelRadius}px)`,
                transformOrigin: '0 0',
              }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2 text-center" style={{ fontSize: segments.length > 12 ? 9 : 11 }}>
                <div className="font-bold whitespace-nowrap drop-shadow">{s.icon ? `${s.icon} ` : ''}{s.label}</div>
                {s.sub && segments.length <= 10 && (
                  <div className="text-white/80 whitespace-nowrap">{s.sub}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-[#0a0d14] border-2 border-white/25 flex items-center justify-center font-black text-amber-400" style={{ fontSize: 15 }}>
        COPERO
      </div>

      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-2 text-2xl drop-shadow-lg">▼</div>
    </div>
  );
}
