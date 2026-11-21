import { Chip, OvrBar } from '../components/ui.jsx';

const TONE_MAP = {
  emerald: 'text-emerald-300',
  sky: 'text-sky-300',
  slate: 'text-slate-300',
  rose: 'text-rose-300',
  amber: 'text-amber-300',
  purple: 'text-purple-300',
};

export default function DevResult({ career, dev, onContinue }) {
  const sign = dev.delta > 0 ? `+${dev.delta}` : `${dev.delta}`;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="card-glass rounded-3xl p-6 w-full text-center anim-pop">
        <div className="text-6xl">{dev.icon}</div>
        <h1 className={`text-2xl font-black mt-2 ${TONE_MAP[dev.tone] || 'text-white'}`}>{dev.label}</h1>
        <div className="text-4xl font-black mt-3">
          <span className={dev.delta > 0 ? 'text-emerald-400' : dev.delta < 0 ? 'text-rose-400' : 'text-slate-400'}>{sign} OVR</span>
        </div>
        <p className="text-white/60 text-sm mt-4 leading-relaxed">{dev.narrative}</p>
        <div className="mt-5 text-left">
          <OvrBar ovr={career.ovr} />
        </div>
        {dev.delta <= -2 && (
          <div className="mt-4">
            <Chip tone="rose">🚑 Season at risk: production will dip</Chip>
          </div>
        )}
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-md rounded-2xl py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-sky-500 to-indigo-500 tap"
      >
        🏒 Simulate the season
      </button>
    </div>
  );
}
