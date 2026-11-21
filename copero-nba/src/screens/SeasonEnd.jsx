import { Chip, Crest, PrimaryButton } from '../components/ui.jsx';
import { ROLES } from '../data/events.js';
import { roleLabel } from '../data/events.js';

export default function SeasonEnd({ career, season, contract, autoRetire, onNext, onRetire }) {
  const role = ROLES.find((r) => r.id === career.roleId);
  const age = career.age;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="card-glass rounded-3xl p-6 w-full text-center anim-pop">
        <div className="text-5xl">{age >= 35 ? '🕰️' : '📋'}</div>
        <h1 className="text-xl font-black mt-2">Fine stagione — {age} anni</h1>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <Crest teamId={season.teamId} size={28} />
          <Chip>{career.ovr} OVR</Chip>
          <Chip tone="sky">{role?.icon} {roleLabel(career.roleId)}</Chip>
          {season.awards.map((a) => (
            <Chip key={a} tone="amber">🏅</Chip>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5 text-sm">
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-white/40 text-[10px] uppercase">Anelli in bacheca</div>
            <div className="font-black text-lg">{career.trophies.ring}</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-white/40 text-[10px] uppercase">Contratto</div>
            <div className="font-black text-lg">
              {contract > 0 ? `${contract} a.` : 'SCADUTO'}
            </div>
          </div>
        </div>

        {autoRetire && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-200">
            🦴 Il corpo dice basta: smettere è ormai l'unica opzione sensata.
          </div>
        )}
      </div>

      {autoRetire ? (
        <PrimaryButton onClick={onRetire} tone="slate">🎓 Appendi le scarpe al chiodo</PrimaryButton>
      ) : (
        <>
          <PrimaryButton onClick={onNext}>{contract > 1 ? '➡️ Prossima stagione' : '🔁 Scadenza: vai in Free Agency'}</PrimaryButton>
          {age >= 35 && (
            <button onClick={onRetire} className="text-white/50 text-sm underline underline-offset-4 tap py-2">
              Ritirati adesso, da campione in carica
            </button>
          )}
        </>
      )}
    </div>
  );
}
