import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { FilmStrip } from './FilmDecor';
import CountUp from './CountUp';
import SEOHead from './SEOHead';

// Public transparency page. Honest, modest numbers beat inflated vague ones —
// this is a recruiting weapon precisely because it's specific. Prototype figures.
const TOTAL_PAID = 284920;
const CREATORS_PAID = 1240;
const FILMS_EARNING = 3180;
const MEDIAN_MONTHLY = 62;
const TOP_MONTHLY = 4820;

const SPLIT = [
  { label: 'Creator', pct: 70, color: 'bg-brand-purple', note: 'Paid out every month' },
  { label: 'Platform', pct: 30, color: 'bg-slate-300', note: 'Hosting, delivery, discovery' },
];

const TOP_EARNERS = [
  { studio: 'Everfall Pictures', film: 'The Lighthouse Keeper of Titan', genre: 'Sci-Fi', earned: 4820 },
  { studio: 'Kitchen Table Films', film: 'Grandmother\'s Kitchen', genre: 'Drama', earned: 3910 },
  { studio: 'Monsoon Labs', film: 'Neon Monsoon', genre: 'Action', earned: 3240 },
  { studio: 'Paper Rocket Studio', film: 'Paper Astronauts', genre: 'Animation', earned: 2870 },
  { studio: 'Everdark Media', film: 'Last Call at the Everdark', genre: 'Horror', earned: 2510 },
];

function StatTile({
  value,
  label,
  prefix,
  suffix,
  accent = false,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft">
      <p className={`text-3xl font-semibold sm:text-4xl ${accent ? 'text-brand-purple' : 'text-slate-950'}`}>
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function EarningsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      <SEOHead
        title="Creator Earnings — Transparency Report | YouMakeTV.ai"
        description="How much do AI filmmakers actually earn on YouMakeTV? See total paid to creators, the 70% revenue share, median monthly earnings, and this month's top-earning films."
        canonical="/earnings"
      />

      {/* ── HERO ODOMETER ────────────────────────────────────────────────────── */}
      <section className="relative -mx-4 -mt-8 overflow-hidden bg-slate-950 px-4 py-16 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-brand-soft opacity-40" />
        <FilmStrip className="absolute inset-x-0 top-0 text-white/10" />
        <FilmStrip className="absolute inset-x-0 bottom-0 text-white/10" />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.32em] text-emerald-300">
            Paid to creators, to date
          </span>
          <p className="mt-6 text-5xl font-semibold text-white sm:text-7xl">
            <CountUp value={TOTAL_PAID} prefix="$" duration={2200} />
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-8 text-slate-300">
            Real money to real people making films as a side hustle. We publish this because
            trust is built on specifics — not slogans.
          </p>
        </div>
      </section>

      {/* ── HEADLINE STATS ───────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={CREATORS_PAID} label="Creators earning money" accent />
        <StatTile value={FILMS_EARNING} label="Films generating revenue" />
        <StatTile value={MEDIAN_MONTHLY} label="Median monthly earnings / active creator" prefix="$" />
        <StatTile value={TOP_MONTHLY} label="Top creator earned this month" prefix="$" accent />
      </section>

      {/* ── REVENUE SPLIT ────────────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              The split
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Creators keep 70%.</h2>
            <p className="mt-3 max-w-md text-base leading-8 text-slate-600">
              For every dollar a viewer spends, 70 cents goes to the filmmaker. YouTube pays 55%.
              App stores take 30%. We built this to pay the people making the work.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Founding Filmmakers — our first 50 creators — keep 85%, locked for life.
            </p>
          </div>

          <div className="space-y-4">
            {SPLIT.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-950">{row.label}</span>
                  <span className="text-sm font-semibold text-slate-950">{row.pct}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{row.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP EARNERS ──────────────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Top-earning films this month</h2>
            <p className="mt-0.5 text-sm text-slate-500">Creator take-home, after the platform share</p>
          </div>
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:inline">
            Updated weekly
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {TOP_EARNERS.map((e, i) => (
            <div key={e.film} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 sm:px-8">
              <span className="w-6 flex-none text-lg font-bold text-slate-300">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">{e.film}</p>
                <p className="truncate text-xs text-slate-500">{e.studio} · {e.genre}</p>
              </div>
              <p className="flex-none text-sm font-semibold text-emerald-600">{formatCurrency(e.earned)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── METHOD NOTE + CTA ────────────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-950">How we count</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            "Paid to creators" is the sum of all creator payouts since launch. "Median monthly
            earnings" counts only creators with at least one paid watch in the last 30 days, so it
            reflects active side-hustlers rather than dormant accounts. We'd rather show an honest
            median than a flattering average skewed by a few hits.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Prototype figures shown for demonstration. Live numbers will be wired to real payouts.
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-[2rem] border border-brand-purple/20 bg-brand-purple/5 p-8">
          <p className="text-sm font-semibold text-slate-950">
            {formatNumber(CREATORS_PAID)} people already earn here.
          </p>
          <p className="mt-1 text-sm text-slate-600">Your first dollar could be this month.</p>
          <button
            onClick={() => navigate('/creator')}
            className="mt-5 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start your studio →
          </button>
          <button
            onClick={() => navigate('/greenlight')}
            className="mt-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
          >
            Fund a film on Greenlight
          </button>
        </div>
      </section>
    </div>
  );
}
