import { Chip, Crest, PrimaryButton } from '../components/ui.jsx';
import { teamTier } from '../data/teams.js';

export default function FaResult({ career, faResult, onContinue }) {
  const tier = teamTier(faResult.team.rating);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <div className="card-glass rounded-3xl p-6 w-full text-center anim-pop">
        <div className="text-5xl">{faResult.changedTeam ? '✍️' : '🏠'}</div>
        <h1 className="text-xl font-black mt-2">
          {faResult.changedTeam ? 'Signé avec une nouvelle franchise !' : 'Contrat prolongé !'}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Crest teamId={faResult.team.id} size={56} />
          <div className="text-left">
            <div className="font-black">{faResult.team.city} {faResult.team.name}</div>
            <Chip tone={tier.tone} className="mt-1">{tier.label} · {faResult.team.rating} OVR</Chip>
          </div>
        </div>
        <div className="mt-4 text-sm text-white/60">
          {career.name} signe pour <span className="text-white font-bold">{faResult.years} ans</span>
        </div>
      </div>

      <PrimaryButton tone="emerald" onClick={onContinue}>➡️ Hors saison</PrimaryButton>
    </div>
  );
}
