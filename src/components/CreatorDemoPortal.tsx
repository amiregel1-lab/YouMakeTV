import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { demoCreatorProfile } from '../data/mockData';
import { CreatorFilm } from '../types';
import AnalyticsCards from './AnalyticsCards';
import CreatorAnalytics from './CreatorAnalytics';
import FilmPerformanceTable from './FilmPerformanceTable';
import FilmAnalyticsModal from './FilmAnalyticsModal';
import { formatCurrency, formatNumber } from '../lib/formatters';

type DemoTab = 'dashboard' | 'content' | 'payouts' | 'analytics' | 'settings' | 'studio';

// ── Sidebar icons (shared shapes, kept local) ─────────────────────────────────

const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconFilm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);
const IconPayout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconAnalytics = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconStudio = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick, badge }: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
    >
      <span className={`flex-none ${active ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Film card (read-only in demo) ─────────────────────────────────────────────

function DemoFilmCard({ film, onAnalytics }: { film: CreatorFilm; onAnalytics: (f: CreatorFilm) => void }) {
  const [imgError, setImgError] = useState(false);
  const revenue = film.price * film.paidWatches;

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-600',
    'Pending Review': 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="aspect-video overflow-hidden bg-slate-800 relative">
        {!imgError ? (
          <img src={film.thumbnail} alt={film.title} onError={() => setImgError(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center p-4">
            <span className="text-sm text-slate-400 text-center">{film.title}</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[film.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {film.status}
        </span>
        {film.price > 0 && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur-sm">
            ${film.price.toFixed(2)}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-950 line-clamp-1 text-sm">{film.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{film.genre} · {film.duration}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Views</p>
            <p className="text-sm font-semibold text-slate-950 mt-0.5">{formatNumber(film.views)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Paid</p>
            <p className="text-sm font-semibold text-slate-950 mt-0.5">{formatNumber(film.paidWatches)}</p>
          </div>
          <div className="rounded-xl bg-brand-purple/5 p-2">
            <p className="text-[10px] uppercase tracking-wide text-brand-purple/70">Revenue</p>
            <p className="text-sm font-semibold text-brand-purple mt-0.5">{formatCurrency(revenue)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAnalytics(film)}
            className="flex-1 rounded-full border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            View Analytics
          </button>
          <span className="rounded-full border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-400 cursor-default">
            Demo
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Payout history (demo data) ────────────────────────────────────────────────

const DEMO_PAYOUTS = [
  { id: 'p1', date: 'May 1, 2026',  amount: 287.40,  status: 'Processing', method: 'Bank transfer', reference: 'YM-26-00142' },
  { id: 'p2', date: 'Apr 1, 2026',  amount: 412.80,  status: 'Paid',       method: 'Bank transfer', reference: 'YM-26-00118' },
  { id: 'p3', date: 'Mar 1, 2026',  amount: 198.20,  status: 'Paid',       method: 'Bank transfer', reference: 'YM-26-00094' },
  { id: 'p4', date: 'Feb 1, 2026',  amount: 356.00,  status: 'Paid',       method: 'Bank transfer', reference: 'YM-26-00071' },
  { id: 'p5', date: 'Jan 1, 2026',  amount: 124.60,  status: 'Paid',       method: 'Bank transfer', reference: 'YM-26-00049' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function CreatorDemoPortal() {
  const navigate = useNavigate();
  const creator = demoCreatorProfile;

  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');
  const [selectedFilm, setSelectedFilm] = useState<CreatorFilm | null>(null);

  // Derived metrics
  const trailerViews   = creator.films.reduce((s, f) => s + f.trailerViews, 0);
  const paidWatches    = creator.films.reduce((s, f) => s + f.paidWatches, 0);
  const freeWatches    = creator.films.reduce((s, f) => s + f.freeWatches, 0);
  const totalViews     = creator.films.reduce((s, f) => s + f.views, 0) + trailerViews;
  const totalRevenue   = creator.films.reduce((s, f) => s + f.price * f.paidWatches, 0);
  const totalEarnings  = creator.films.reduce((s, f) => {
    const share = f.paidWatches > 500 ? 0.4 : 0.3;
    return s + f.price * f.paidWatches * share;
  }, 0);
  const pendingPayout   = Math.round(totalEarnings * 0.35 * 100) / 100;
  const conversionRate  = trailerViews ? Math.round((paidWatches / trailerViews) * 100) : 0;

  const topFilm = [...creator.films].sort((a, b) => b.price * b.paidWatches - a.price * a.paidWatches)[0];
  const topConvertingFilm = [...creator.films].sort((a, b) => {
    const rA = a.trailerViews ? a.paidWatches / a.trailerViews : 0;
    const rB = b.trailerViews ? b.paidWatches / b.trailerViews : 0;
    return rB - rA;
  })[0];

  const moneyMetrics = [
    { label: 'Your estimated earnings', value: formatCurrency(totalEarnings),  accent: 'purple' as const, hint: 'Your share after platform fee' },
    { label: 'Pending payout',          value: formatCurrency(pendingPayout),  accent: 'green'  as const, hint: 'Available for withdrawal' },
    { label: 'Total gross revenue',     value: formatCurrency(totalRevenue),   accent: 'cyan'   as const },
    { label: 'Avg watch price',         value: formatCurrency(paidWatches ? totalRevenue / paidWatches : 0), accent: 'default' as const },
  ];

  const viewMetrics = [
    { label: 'Total views',    value: formatNumber(totalViews),   accent: 'cyan'   as const },
    { label: 'Paid watches',   value: formatNumber(paidWatches),  accent: 'purple' as const },
    { label: 'Free watches',   value: formatNumber(freeWatches),  accent: 'default' as const },
    { label: 'Trailer → paid', value: `${conversionRate}%`,       accent: 'green'  as const, hint: 'Strong conversion' },
  ];

  const paidPayouts = useMemo(() => DEMO_PAYOUTS.filter(p => p.status === 'Paid'), []);
  const paidTotal = paidPayouts.reduce((s, p) => s + p.amount, 0);

  const initials = creator.studioName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navItems: { id: DemoTab; label: string; icon: ReactNode; badge?: string }[] = [
    { id: 'dashboard',  label: 'Dashboard',      icon: <IconDashboard /> },
    { id: 'content',    label: 'Content',         icon: <IconFilm />, badge: String(creator.films.length) },
    { id: 'payouts',    label: 'Payout History',  icon: <IconPayout /> },
    { id: 'analytics',  label: 'Analytics',       icon: <IconAnalytics /> },
    { id: 'settings',   label: 'Settings',        icon: <IconSettings /> },
    { id: 'studio',     label: 'Studio Profile',  icon: <IconStudio /> },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 -mb-16 flex flex-col" style={{ minHeight: 'calc(100vh - 73px)' }}>

      {/* ── DEMO MODE BANNER ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-400 text-white text-xs font-bold">D</span>
          <p className="text-sm font-semibold text-amber-900">
            Demo Creator Portal — <span className="font-normal">This is example data. No real uploads or changes are saved.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <button
            onClick={() => navigate('/creator/onboarding')}
            className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Start Real Onboarding →
          </button>
          <button
            onClick={() => navigate('/creator')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
        <aside
          className="hidden lg:flex w-60 xl:w-64 flex-none flex-col border-r border-slate-200 bg-white"
          style={{ position: 'sticky', top: 105, height: 'calc(100vh - 105px)', overflowY: 'auto' }}
        >
          {/* Studio identity */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-950 text-white text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950 truncate">{creator.studioName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-none" />
                  <span className="text-xs text-amber-600 font-medium">Demo mode</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-slate-100 space-y-0.5">
            <button
              onClick={() => navigate('/creator/onboarding')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 transition-all"
            >
              <svg className="flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Start Real Account
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Mobile tab bar */}
          <div className="lg:hidden flex overflow-x-auto border-b border-slate-200 bg-white scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-none flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 xl:p-10 space-y-8">

            {/* ── DASHBOARD ────────────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-brand-purple">Welcome back</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-950">{creator.studioName}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {creator.films.length} films · Demo data — not real
                    </p>
                  </div>
                  <div className="self-start sm:self-auto rounded-full bg-amber-100 border border-amber-200 px-5 py-2.5 text-sm font-semibold text-amber-800">
                    Demo Mode
                  </div>
                </div>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">Revenue overview</p>
                  <AnalyticsCards metrics={moneyMetrics} />
                </section>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">Audience &amp; engagement</p>
                  <AnalyticsCards metrics={viewMetrics} />
                </section>

                {topFilm && (
                  <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm">💡</span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">What's working</p>
                        <h2 className="text-lg font-semibold text-slate-950">Studio insights</h2>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-amber-600 mb-2">Top earning film</p>
                        <p className="font-semibold text-slate-950 line-clamp-2">{topFilm.title}</p>
                        <p className="text-2xl font-semibold text-amber-600 mt-2">{formatCurrency(topFilm.price * topFilm.paidWatches)}</p>
                        <p className="text-sm text-slate-500 mt-1">gross revenue</p>
                      </div>
                      {topConvertingFilm && (
                        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-emerald-600 mb-2">Best converting</p>
                          <p className="font-semibold text-slate-950 line-clamp-2">{topConvertingFilm.title}</p>
                          <p className="text-2xl font-semibold text-emerald-600 mt-2">
                            {topConvertingFilm.trailerViews
                              ? Math.round((topConvertingFilm.paidWatches / topConvertingFilm.trailerViews) * 100)
                              : 0}%
                          </p>
                          <p className="text-sm text-slate-500 mt-1">trailer → paid</p>
                        </div>
                      )}
                      <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-brand-purple mb-2">Ready to earn?</p>
                        <p className="font-semibold text-slate-950">Start your account</p>
                        <p className="text-sm text-slate-600 mt-2">Upload real films and start earning. Onboarding takes about 5 minutes.</p>
                        <button
                          onClick={() => navigate('/creator/onboarding')}
                          className="mt-3 rounded-full bg-brand-purple px-4 py-2 text-xs font-semibold text-white hover:bg-brand-indigo transition"
                        >
                          Start Onboarding →
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ── CONTENT ──────────────────────────────────────────────────────── */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Content</h2>
                    <p className="mt-1 text-sm text-slate-500">{creator.films.length} demo films — read only</p>
                  </div>
                  <button
                    onClick={() => navigate('/creator/onboarding')}
                    className="rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                  >
                    + Upload Real Film
                  </button>
                </div>

                {/* Upload workflow explanation */}
                <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-purple mb-3">How uploading works</p>
                  <ol className="space-y-2">
                    {[
                      'Complete a short onboarding to set up your studio.',
                      'Click "+ Upload new film" and fill in title, genre, price, and description.',
                      'Your film enters "Pending Review" status — typically approved within a few business days.',
                      'Once approved, your film goes live and viewers can purchase it.',
                      'Earnings accumulate in real time on your Dashboard.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-purple text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {creator.films.map((film) => (
                    <DemoFilmCard key={film.id} film={film} onAnalytics={setSelectedFilm} />
                  ))}
                </div>
              </div>
            )}

            {/* ── PAYOUT HISTORY ─────────────────────────────────────────────── */}
            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Payout History</h2>
                  <p className="mt-1 text-sm text-slate-500">Example payout history — demo data</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.75rem] border border-brand-purple/30 bg-brand-purple/5 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-purple">Total earnings (demo)</p>
                    <p className="mt-3 text-3xl font-semibold text-brand-purple">{formatCurrency(totalEarnings)}</p>
                    <p className="text-xs text-slate-500 mt-1">After platform fee</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Pending payout</p>
                    <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatCurrency(pendingPayout)}</p>
                    <p className="text-xs text-slate-500 mt-1">Processing this month</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Paid out (lifetime)</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(paidTotal)}</p>
                    <p className="text-xs text-slate-500 mt-1">Successfully transferred</p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-950">Transactions (demo)</h3>
                    <span className="text-xs text-slate-400">{DEMO_PAYOUTS.length} entries</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {DEMO_PAYOUTS.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${payout.status === 'Paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {payout.status === 'Paid' ? (
                              <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{payout.method}</p>
                            <p className="text-xs text-slate-500">{payout.date} · {payout.reference}</p>
                          </div>
                        </div>
                        <div className="text-right flex-none">
                          <p className="font-semibold text-slate-950">{formatCurrency(payout.amount)}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payout.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-center text-slate-400">
                  Demo data only. Real payouts are processed on the 1st of each month. Minimum threshold: $25.
                </p>
              </div>
            )}

            {/* ── ANALYTICS ────────────────────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Analytics</h2>
                  <p className="mt-1 text-sm text-slate-500">Demo analytics — views, revenue, and audience performance</p>
                </div>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                  <CreatorAnalytics creator={creator} />
                </section>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-slate-950 mb-6">Film performance table</h3>
                  <FilmPerformanceTable
                    films={creator.films}
                    onViewAnalytics={setSelectedFilm}
                    onDelete={() => {}}
                  />
                </section>
              </div>
            )}

            {/* ── SETTINGS ─────────────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
                  <p className="mt-1 text-sm text-slate-500">Demo creator preferences — read only</p>
                </div>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-5">
                  <h3 className="font-semibold text-slate-950">Creator profile</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Full name',    value: creator.fullName },
                      { label: 'Studio name',  value: creator.studioName },
                      { label: 'Email',        value: creator.email },
                      { label: 'Member since', value: creator.createdAt },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-1.5">{field.label}</p>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 flex-none" />
                    <p className="text-sm font-medium text-emerald-700">Identity verified · KYC complete</p>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-5">
                  <h3 className="font-semibold text-slate-950">Revenue settings</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-brand-purple mb-1">Your revenue share</p>
                      <p className="text-2xl font-semibold text-slate-950">30–40%</p>
                      <p className="text-xs text-slate-500 mt-1">40% unlocked after 500 paid watches per film</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-1">Payout schedule</p>
                      <p className="text-2xl font-semibold text-slate-950">Monthly</p>
                      <p className="text-xs text-slate-500 mt-1">Processed on the 1st of each month</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ── STUDIO PROFILE ─────────────────────────────────────────────── */}
            {activeTab === 'studio' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Studio Profile</h2>
                  <p className="mt-1 text-sm text-slate-500">How your studio appears to viewers on YouMakeTV — demo data</p>
                </div>

                {/* Profile card */}
                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 flex-none items-center justify-center rounded-[1.5rem] bg-slate-950 text-white text-2xl font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-slate-950">{creator.studioName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-none" />
                          Verified Creator
                        </span>
                        <span className="inline-flex rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
                          {creator.films.length} Films
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Creator name',    value: creator.fullName },
                      { label: 'Studio name',     value: creator.studioName },
                      { label: 'Member since',    value: creator.createdAt },
                      { label: 'Verification',    value: 'KYC Complete' },
                    ].map((f) => (
                      <div key={f.label}>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-1.5">{f.label}</p>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950">
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Public profile stats */}
                <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-5">
                  <h3 className="font-semibold text-slate-950">Public profile stats</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.5rem] bg-slate-50 border border-slate-200 p-5 text-center">
                      <p className="text-2xl font-semibold text-slate-950">{creator.films.length}</p>
                      <p className="text-xs text-slate-500 mt-1">Total films</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-brand-purple/5 border border-brand-purple/20 p-5 text-center">
                      <p className="text-2xl font-semibold text-brand-purple">{formatNumber(totalViews)}</p>
                      <p className="text-xs text-slate-500 mt-1">Total views</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-emerald-50 border border-emerald-200 p-5 text-center">
                      <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(totalEarnings)}</p>
                      <p className="text-xs text-slate-500 mt-1">Earnings (demo)</p>
                    </div>
                  </div>
                </section>

                {/* CTA */}
                <section className="rounded-[2rem] border border-brand-purple/20 bg-brand-purple/5 p-6 sm:p-8 text-center space-y-4">
                  <p className="text-sm font-semibold text-slate-950">Ready to create your own studio profile?</p>
                  <p className="text-sm text-slate-600">Complete onboarding to set up your real studio and start publishing AI films.</p>
                  <button
                    onClick={() => navigate('/creator/onboarding')}
                    className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                  >
                    Start Creator Onboarding →
                  </button>
                </section>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA BAR ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-slate-950 px-4 py-4">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-white hidden sm:block">
            Liked what you saw? Start your real creator account — it's free.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/creator/onboarding')}
              className="flex-1 sm:flex-none rounded-full bg-brand-purple px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
            >
              Start Creator Onboarding →
            </button>
            <button
              onClick={() => navigate('/creatorsLogin')}
              className="flex-none text-sm text-slate-400 hover:text-white transition font-medium"
            >
              Already a creator? Sign in
            </button>
          </div>
        </div>
      </div>

      {selectedFilm && <FilmAnalyticsModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />}
    </div>
  );
}
