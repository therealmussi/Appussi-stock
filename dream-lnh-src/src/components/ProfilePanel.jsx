import { archetypeOf, playerAttributes, teamsWorn } from '../engine/simulationEngine.js';
import { ROLES, roleLabel } from '../data/events.js';
import { Crest } from './ui.jsx';

const ATTR_META = [
  { key: 'scoring', label: 'Attaque', color: 'from-amber-400 to-orange-300' },
  { key: 'playmaking', label: 'Vision', color: 'from-sky-400 to-cyan-300' },
  { key: 'defense', label: 'Défense', color: 'from-emerald-400 to-teal-300' },
  { key: 'rebounding', label: 'Physique', color: 'from-fuchsia-400 to-purple-300' },
];

export default function ProfilePanel({ career, onClose }) {
  const arch = archetypeOf(career);
  const attrs = playerAttributes(career);
  const teams = teamsWorn(career);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-[#10141d] border-t border-x border-white/10 p-5 pb-8 anim-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Crest teamId={career.teamId} size={44} />
          <div className="min-w-0 flex-1">
            <div className="font-black text-lg truncate">{career.name}</div>
            <div className="text-[11px] text-white/50">
              #{career.jersey} · {roleLabel(career.roleId)} · {arch?.label || roleLabel(career.roleId)}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 w-9 h-9 flex items-center justify-center tap text-white/70">✕</button>
        </div>

        <div className="mt-5 space-y-3">
          {ATTR_META.map(({ key, label, color }, i) => (
            <div key={key}>
              <div className="flex justify-between text-[11px] text-white/60 mb-1">
                <span>{label.toUpperCase()}</span>
                <span className="font-bold text-white text-sm">{attrs[key]}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`bar-fill h-full rounded-full bg-gradient-to-r ${color}`}
                  style={{ width: `${((attrs[key] - 40) / 59) * 100}%`, transitionDelay: `${i * 0.1}s` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-[11px] uppercase tracking-widest text-white/40">Équipes portées</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 pl-1 pr-2.5 py-1">
              <Crest teamId={t.id} size={22} />
              <span className="text-[11px] font-semibold text-white/80">{t.id}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 text-white/40 text-xs text-center">
          {career.age} ans · Choix no {career.draftPick} au repêchage · OVR au sommet {career.peakOvr}
        </div>
        <div className="mt-2 text-white/20 text-[10px] text-center">Developed by Matteo Mussillon</div>
      </div>
    </div>
  );
}
