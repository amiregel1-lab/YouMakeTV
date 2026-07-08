import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { greenlightProjects, GreenlightProject } from '../data/greenlightData';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { FilmStrip } from './FilmDecor';
import CountUp from './CountUp';
import SEOHead from './SEOHead';

const STORAGE_KEY = 'ymtv_greenlight_pledges';

type PledgeMap = Record<string, { extra: number; backers: number }>;

function loadPledges(): PledgeMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePledges(map: PledgeMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function ProgressBar({ pct }: { pct: number }) {
  const funded = pct >= 100;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          funded
            ? 'bg-emerald-500'
            : 'bg-gradient-to-r from-brand-pink via-brand-purple to-brand-cyan'
        }`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  pledge,
  justBacked,
  onBack,
}: {
  project: GreenlightProject;
  pledge: { extra: number; backers: number };
  justBacked: boolean;
  onBack: (p: GreenlightProject) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const pledged = project.pledged + pledge.extra;
  const backers = project.backers + pledge.backers;
  const pct = Math.round((pledged / project.goal) * 100);
  const funded = pledged >= project.goal;

  return (
    <article className="flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-soft transition hover:shadow-cinematic">
      {/* Poster */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        {!imgError ? (
          <img
            src={`https://picsum.photos/seed/${project.posterSeed}/640/400`}
            alt={project.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {project.genre}
          </span>
          {funded && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">
              Green-lit ✓
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {project.daysLeft} day{project.daysLeft !== 1 ? 's' : ''} left
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-semibold leading-tight text-white">{project.title}</h3>
          <p className="mt-0.5 text-xs text-slate-300">
            by {project.creator} · {project.creatorLocation}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-6 text-slate-600">{project.logline}</p>

        <div className="mt-4">
          <ProgressBar pct={pct} />
          <div className="mt-2.5 flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-950">{formatCurrency(pledged)}</p>
              <p className="text-xs text-slate-500">of {formatCurrency(project.goal)} goal</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${funded ? 'text-emerald-600' : 'text-brand-purple'}`}>{pct}%</p>
              <p className="text-xs text-slate-500">{formatNumber(backers)} backers</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Pledge {formatCurrency(project.minPledge)}+
          </p>
          <p className="mt-1 text-sm text-slate-700">{project.reward}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tools.map((t) => (
            <span key={t} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={() => onBack(project)}
          disabled={justBacked}
          className={`mt-5 w-full rounded-full py-3 text-sm font-semibold transition ${
            justBacked
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          {justBacked ? '✓ Thanks — you\'re a backer!' : `Back this film · ${formatCurrency(project.minPledge)}`}
        </button>
      </div>
    </article>
  );
}

export default function GreenlightPage() {
  const navigate = useNavigate();
  const [pledges, setPledges] = useState<PledgeMap>(() => loadPledges());
  const [justBacked, setJustBacked] = useState<string | null>(null);

  const get = (id: string) => pledges[id] ?? { extra: 0, backers: 0 };

  const handleBack = (p: GreenlightProject) => {
    setPledges((prev) => {
      const cur = prev[p.id] ?? { extra: 0, backers: 0 };
      // One pledge per browser per project — backing again is a no-op.
      if (cur.backers > 0) return prev;
      const next = { ...prev, [p.id]: { extra: cur.extra + p.minPledge, backers: cur.backers + 1 } };
      savePledges(next);
      return next;
    });
    setJustBacked(p.id);
    window.setTimeout(() => setJustBacked((cur) => (cur === p.id ? null : cur)), 2600);
  };

  const totals = useMemo(() => {
    const totalPledged = greenlightProjects.reduce((s, p) => s + p.pledged + get(p.id).extra, 0);
    const totalBackers = greenlightProjects.reduce((s, p) => s + p.backers + get(p.id).backers, 0);
    const greenlit = greenlightProjects.filter((p) => p.pledged + get(p.id).extra >= p.goal).length;
    return { totalPledged, totalBackers, greenlit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pledges]);

  return (
    <div className="space-y-12">
      <SEOHead
        title="Greenlight — Fund AI Films Before They're Made | YouMakeTV.ai"
        description="Back AI films at the pitch stage. Pledge a few dollars, and if a project hits its goal it gets made — you stream it free and get a credit. Demand-driven filmmaking."
        canonical="/greenlight"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative -mx-4 -mt-8 overflow-hidden bg-slate-950 px-4 py-14 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-brand-soft opacity-40" />
        <FilmStrip className="absolute inset-x-0 top-0 text-white/10" />
        <FilmStrip className="absolute inset-x-0 bottom-0 text-white/10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-brand-pink/40 bg-brand-pink/15 px-4 py-1.5 text-xs uppercase tracking-[0.32em] text-brand-pink">
            Greenlight
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Decide what gets made.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-300">
            These films don't exist yet. Back the ones you want to see — pledge a few dollars,
            and when a project hits its goal, the creator makes it. Backers stream it free and
            get their name in the credits.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-semibold text-white sm:text-3xl">
                <CountUp value={totals.totalPledged} prefix="$" />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Pledged</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white sm:text-3xl">
                <CountUp value={totals.totalBackers} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Backers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-400 sm:text-3xl">
                <CountUp value={totals.greenlit} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Green-lit</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { n: '01', t: 'Pitch', d: 'Creators post a trailer, a logline, and a budget goal — before making the film.' },
          { n: '02', t: 'Pledge', d: 'Viewers back the films they want to exist. A few dollars each adds up fast.' },
          { n: '03', t: 'Premiere', d: 'Hit the goal and the film gets made. Backers watch free and get a credit.' },
        ].map((step) => (
          <div key={step.n} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft">
            <p className="text-sm font-bold text-brand-purple">{step.n}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.t}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{step.d}</p>
          </div>
        ))}
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Films seeking a greenlight</h2>
            <p className="mt-1 text-sm text-slate-500">{greenlightProjects.length} live campaigns · funding now</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {greenlightProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              pledge={get(p.id)}
              justBacked={justBacked === p.id}
              onBack={handleBack}
            />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Prototype — pledges are simulated locally and no payment is processed.
        </p>
      </section>

      {/* ── CREATOR CTA ──────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-3">
          <div className="pointer-events-none absolute inset-0 bg-brand-soft opacity-50" />
          <div className="relative lg:col-span-2">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              For creators
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Get paid before you press render.</h2>
            <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
              Pitch your next film to an audience that's already here. Greenlight lets you validate
              demand and fund production up front — so you build what people actually want to watch.
            </p>
          </div>
          <div className="relative flex flex-col justify-center gap-3">
            <button
              onClick={() => navigate('/creator')}
              className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Pitch a film →
            </button>
            <button
              onClick={() => navigate('/earnings')}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              See what creators earn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
