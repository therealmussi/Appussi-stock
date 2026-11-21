import { Crest, Chip, Trophy, fmtAvg, hrOf } from '../components/ui.jsx';
import { ROLES, AWARDS_META, GAME, roleLabel } from '../data/events.js';

const TONES = {
  gold: 'from-yellow-500/25 border-yellow-400/50',
  emerald: 'from-emerald-500/25 border-emerald-400/50',
  sky: 'from-sky-500/25 border-sky-400/50',
  indigo: 'from-indigo-500/25 border-indigo-400/50',
  slate: 'from-white/10 border-white/20',
  rose: 'from-rose-500/25 border-rose-400/50',
};

const ORDER = ['ring', 'finalsMvp', 'mvp', 'dpoy', 'scoringChamp', 'allNBA', 'allDefense', 'allStar', 'mip', 'allRookie', 'roy'];

const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

export default function Career({ career, summary, onRestart }) {
  const role = ROLES.find((r) => r.id === career.roleId);
  const { verdict } = summary;
  const awards = ORDER.filter((id) => summary.trophies[id] > 0);

  return (
    <div className="min-h-dvh px-4 py-8 max-w-md mx-auto flex flex-col gap-4 pb-12">
      <h1 className="text-2xl font-black text-center tracking-wide">CAREER TROPHY CASE</h1>

      <div className={`rounded-3xl p-6 text-center border bg-gradient-to-b ${TONES[verdict.tone] || TONES.slate} anim-pop`}>
        <div className="flex justify-center">{summary.trophies.ring > 0 ? <Trophy size={84} /> : <div className="text-6xl">{verdict.tone === 'rose' ? '😔' : '🗿'}</div>}</div>
        <h2 className="text-3xl font-black mt-2 shimmer-text">{summary.careerScore}</h2>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Career Score</div>
        <div className="text-2xl font-black mt-3">{verdict.label}</div>
        <p className="text-white/60 text-sm mt-1 italic">{verdict.sub}</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-black/40 px-4 py-3">
            <div className="text-3xl font-black">{career.peakOvr}</div>
            <div className="text-[10px] uppercase text-white/40 tracking-wider">Peak OVR</div>
          </div>
          <div className="rounded-2xl bg-black/40 px-4 py-3">
            <div className="text-3xl font-black">{summary.years}</div>
            <div className="text-[10px] uppercase text-white/40 tracking-wider">Years (age {GAME.START_AGE}–{career.age})</div>
          </div>
          <div className="rounded-2xl bg-black/40 px-4 py-3">
            <div className="text-3xl font-black">#{career.jersey}</div>
            <div className="text-[10px] uppercase text-white/40 tracking-wider">Jersey</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{fmtAvg(summary.averages.ppg)}</span><span className="text-white/40 text-xs"> AVG</span></div>
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{summary.averages.rpg}</span><span className="text-white/40 text-xs"> RBI/G</span></div>
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{hrOf(summary.averages.apg)}</span><span className="text-white/40 text-xs"> HR/yr</span></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{fmtK(summary.totals.pts)}</span><span className="text-white/40 text-xs"> H</span></div>
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{fmtK(summary.totals.reb)}</span><span className="text-white/40 text-xs"> SB</span></div>
          <div className="bg-black/40 rounded-xl py-2"><span className="font-black">{fmtK(summary.totals.ast)}</span><span className="text-white/40 text-xs"> RBI</span></div>
        </div>
        <div className="text-[10px] text-white/30 mt-1">totals estimated over 162 games per season</div>

        {summary.milestones.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {summary.milestones.map((m) => (
              <Chip key={m} tone="yellow">{m}</Chip>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
          <Chip tone="slate">{role?.icon} {roleLabel(career.roleId)}</Chip>
          {summary.teams.map((t) => (
            <Chip key={t.id} tone="slate">🏟 {t.id}</Chip>
          ))}
        </div>
      </div>

      <div className="card-glass rounded-3xl p-5">
        <div className="text-[11px] uppercase tracking-widest text-white/40 mb-3">Trophy case</div>
        {awards.length === 0 ? (
          <p className="text-white/50 text-sm">A career of stories, not of trophies.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {awards.map((id) => (
              <div key={id} className="rounded-2xl bg-black/30 p-3 flex items-center gap-2.5">
                <span className="text-2xl">{AWARDS_META[id].icon}</span>
                <div>
                  <div className="font-bold text-sm leading-tight">{summary.trophies[id]}×</div>
                  <div className="text-[10px] text-white/50 leading-tight">{AWARDS_META[id].label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-3 text-center text-sm">
          <div className="flex-1 bg-black/30 rounded-xl py-2"><span className="font-black">{summary.totalWins}</span><span className="text-white/40 text-xs"> wins</span></div>
          <div className="flex-1 bg-black/30 rounded-xl py-2"><span className="font-black">{career.draftPick}</span><span className="text-white/40 text-xs">th at the Draft</span></div>
        </div>
      </div>

      <div className="card-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
        {career.seasons.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2 text-xs">
            <span className="text-white/40 w-7">{s.age}y</span>
            <Crest teamId={s.teamId} size={20} />
            <span className="font-bold w-16">{s.ppg}/{s.rpg}/{s.apg}</span>
            <span className="text-white/40">{s.wins}-{s.losses}</span>
            <span className="ml-auto flex gap-1">
              {s.awards.map((a) => <span key={a}>{AWARDS_META[a]?.icon}</span>)}
            </span>
            <span className="w-6 text-right">{s.ring ? '💍' : ''}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full rounded-2xl py-4 font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-orange-500 tap"
      >
        ✨ New career
      </button>
    </div>
  );
}
