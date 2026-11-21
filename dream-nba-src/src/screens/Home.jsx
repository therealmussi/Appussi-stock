import { PrimaryButton } from '../components/ui.jsx';

export default function Home({ onNew, hasExisting, onContinue }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-4 anim-pop">🏀</div>
      <h1 className="text-5xl font-black tracking-tight anim-slide">
        DREAM <span className="shimmer-text">NBA</span>
      </h1>
      <p className="text-white/50 mt-3 max-w-xs text-sm leading-relaxed">
        Dal Draft ai 38 anni: una ruota alla volta diventa una leggenda. O supera ogni aspettativa.
      </p>
      <div className="w-full max-w-xs mt-10 space-y-3">
        {hasExisting && (
          <PrimaryButton tone="emerald" onClick={onContinue}>▶️ Continua Carriera</PrimaryButton>
        )}
        <PrimaryButton tone="amber" onClick={onNew}>✨ Nuova Carriera</PrimaryButton>
      </div>
      <p className="text-[11px] text-white/30 mt-8">Salvataggio automatico · 100% offline</p>
      <p className="text-[11px] text-white/25 mt-1.5">Developed by Matteo Mussillon</p>
    </div>
  );
}
