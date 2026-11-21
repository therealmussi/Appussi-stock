import { Crest, Chip, OvrBar, PrimaryButton } from '../components/ui.jsx';
import { teamTier } from '../data/teams.js';

export default function DraftResult({ career, draft, onContinue }) {
  const tier = teamTier(draft.team.rating);
  const minutes = draft.minutesBoost > 4 ? 'Heavy snap load expected ⏱️' : draft.minutesBoost >= 0 ? 'Rotation snaps every game' : 'Earn your snaps';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 gap-5 max-w-md mx-auto">
      <Chip tone={draft.pick <= 5 ? 'amber' : 'slate'}>
        {draft.pick === 1 ? '🥇 1ST OVERALL PICK' : `Pick no. ${draft.pick}`}
      </Chip>

      <div className="card-glass rounded-3xl p-6 w-full text-center anim-pop">
        <Crest teamId={draft.team.id} size={72} />
        <h1 className="text-2xl font-black mt-3">{draft.team.city} {draft.team.name}</h1>
        <div className="mt-2">
          <Chip tone={tier.tone}>{tier.label} team · {draft.team.rating} OVR</Chip>
        </div>
        <p className="text-white/60 text-sm mt-4 leading-relaxed">{draft.flavor}</p>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-white/40 text-[10px] uppercase">Contract</div>
            <div className="font-bold">{draft.contractYears} years</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-white/40 text-[10px] uppercase">Snap count</div>
            <div className="font-bold text-xs pt-1">{minutes}</div>
          </div>
        </div>
      </div>

      <div className="w-full card-glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Crest teamId={draft.team.id} size={36} />
          <div>
            <div className="font-bold">{career.name}</div>
            <div className="text-xs text-white/50">{career.age} years old · OVR {career.ovr}</div>
          </div>
        </div>
        <div className="mt-3">
          <OvrBar ovr={career.ovr} />
        </div>
      </div>

      <PrimaryButton onClick={onContinue}>Start the career</PrimaryButton>
    </div>
  );
}
