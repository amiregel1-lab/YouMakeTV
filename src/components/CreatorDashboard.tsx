import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CreatorFilm, CreatorProfile } from '../types';
import AnalyticsCards from './AnalyticsCards';
import BetaNotice from './BetaNotice';
import CreatorAnalytics from './CreatorAnalytics';
import CreatorEmptyState from './CreatorEmptyState';
import FilmAnalyticsModal from './FilmAnalyticsModal';
import FilmPerformanceTable from './FilmPerformanceTable';
import FilmUploadForm from './FilmUploadForm';
import { formatCurrency, formatNumber } from '../lib/formatters';

type Tab = 'dashboard' | 'content' | 'payouts' | 'analytics' | 'settings' | 'studio';

interface CreatorDashboardProps {
  creator: CreatorProfile | null;
  onAddFilm: (film: CreatorFilm) => void;
  onCreateDemo: () => void;
  onStartOnboarding: () => void;
  onDeleteFilm: (filmId: string) => void;
  onEditFilm?: (filmId: string, changes: Partial<CreatorFilm>) => void;
  showWelcome?: boolean;
  onDismissWelcome?: () => void;
}

// ── Sidebar icons ─────────────────────────────────────────────────────────────

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

// ── Film card (Content tab) — supports inline editing ─────────────────────────

const GENRES = ['Sci-Fi', 'Drama', 'Action', 'Horror', 'Comedy', 'Thriller', 'Romance', 'Documentary', 'Experimental', 'Animation', 'Fantasy', 'Mystery', 'Short'];

function FilmCard({ film, onAnalytics, onDelete, onEdit }: {
  film: CreatorFilm;
  onAnalytics: (f: CreatorFilm) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, changes: Partial<CreatorFilm>) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ title: film.title, price: film.price, genre: film.genre, description: film.description });
  const revenue = film.price * film.paidWatches;

  const statusColors: Record<string, string> = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Pending Review': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-red-100 text-red-700',
  };

  const handleSave = () => {
    onEdit?.(film.id, {
      title: editFields.title.trim() || film.title,
      price: Math.max(0, editFields.price),
      genre: editFields.genre,
      description: editFields.description,
      updatedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditFields({ title: film.title, price: film.price, genre: film.genre, description: film.description });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-[1.5rem] border border-brand-purple/30 bg-white overflow-hidden shadow-md">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-purple">Edit Film</p>
            <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-slate-700 transition">Cancel ×</button>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Title</label>
            <input
              type="text"
              value={editFields.title}
              onChange={(e) => setEditFields(p => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editFields.price}
                onChange={(e) => setEditFields(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Genre</label>
              <select
                value={editFields.genre}
                onChange={(e) => setEditFields(p => ({ ...p, genre: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-purple"
              >
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={editFields.description}
              onChange={(e) => setEditFields(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 rounded-full bg-brand-purple py-2.5 text-xs font-semibold text-white transition hover:bg-brand-indigo"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video overflow-hidden bg-slate-800 relative">
        {!imgError ? (
          <img
            src={film.thumbnail}
            alt={film.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
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
            Analytics
          </button>
          {onEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-full border border-brand-purple/30 bg-brand-purple/5 px-3.5 py-2 text-xs font-semibold text-brand-purple hover:bg-brand-purple/10 transition"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(film.id)}
            className="rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Deterministic mock payout history ─────────────────────────────────────────

function buildPayouts(totalEarnings: number) {
  if (totalEarnings === 0) return [];
  const entries = [
    { mult: 0.18, date: 'May 1, 2026',  status: 'Processing', ref: 'YM-26-00142' },
    { mult: 0.22, date: 'Apr 1, 2026',  status: 'Paid',       ref: 'YM-26-00118' },
    { mult: 0.15, date: 'Mar 1, 2026',  status: 'Paid',       ref: 'YM-26-00094' },
    { mult: 0.25, date: 'Feb 1, 2026',  status: 'Paid',       ref: 'YM-26-00071' },
    { mult: 0.12, date: 'Jan 1, 2026',  status: 'Paid',       ref: 'YM-26-00049' },
    { mult: 0.08, date: 'Dec 1, 2025',  status: 'Paid',       ref: 'YM-25-00033' },
  ];
  return entries.map((e, i) => ({
    id: `payout-${i}`,
    date: e.date,
    amount: Math.round(totalEarnings * e.mult * 100) / 100,
    status: e.status,
    method: 'Bank transfer',
    reference: e.ref,
  }));
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreatorDashboard({ creator, onAddFilm, onCreateDemo, onStartOnboarding, onDeleteFilm, onEditFilm, showWelcome, onDismissWelcome }: CreatorDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<CreatorFilm | null>(null);

  // ── No creator state ──────────────────────────────────────────────────────
  if (!creator) {
    return (
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative rounded-[2.5rem] bg-brand-fade/30 p-10">
          <div className="pointer-events-none absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative space-y-6 text-center">
            <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              Creator dashboard
            </span>
            <h1 className="text-4xl font-semibold text-slate-950">No creator account found.</h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600">
              Complete onboarding to start tracking films, views, and earnings. Or explore a demo creator workspace.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={onStartOnboarding} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Start Creator Onboarding
              </button>
              <button onClick={onCreateDemo} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                View demo creator workspace
              </button>
              <button onClick={() => navigate('/creatorsLogin')} className="rounded-full border border-brand-purple/40 bg-white px-6 py-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/5">
                Back to Creator Login
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Derived metrics ───────────────────────────────────────────────────────
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
    { label: 'Pending payout',          value: formatCurrency(pendingPayout),  accent: 'green'  as const, hint: 'Your share once billing is live' },
    { label: 'Total gross revenue',     value: formatCurrency(totalRevenue),   accent: 'cyan'   as const },
    { label: 'Avg watch price',         value: formatCurrency(paidWatches ? totalRevenue / paidWatches : 0), accent: 'default' as const },
  ];

  const viewMetrics = [
    { label: 'Total views',              value: formatNumber(totalViews),   accent: 'cyan'   as const },
    { label: 'Paid watches',             value: formatNumber(paidWatches),  accent: 'purple' as const },
    { label: 'Free watches',             value: formatNumber(freeWatches),  accent: 'default' as const },
    { label: 'Trailer → paid',           value: `${conversionRate}%`,       accent: conversionRate >= 10 ? 'green' as const : 'default' as const, hint: conversionRate >= 10 ? 'Strong conversion' : 'Room to grow' },
  ];

  // Deliberately not useMemo: this line sits AFTER the `if (!creator)` early
  // return, so a hook here runs on some renders and not others. Landing
  // directly on /creator/dashboard renders once with creator === null (the
  // profile is read from localStorage in an effect) and again with the profile,
  // and React threw "Rendered more hooks than during the previous render",
  // white-screening the dashboard. buildPayouts is a cheap pure function.
  const payouts = buildPayouts(totalEarnings);
  const paidTotal = payouts.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

  const initials = creator.studioName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navItems: { id: Tab; label: string; icon: ReactNode; badge?: string }[] = [
    { id: 'dashboard',  label: 'Dashboard',      icon: <IconDashboard /> },
    { id: 'content',    label: 'Content',         icon: <IconFilm />, badge: creator.films.length > 0 ? String(creator.films.length) : undefined },
    { id: 'payouts',    label: 'Payout History',  icon: <IconPayout /> },
    { id: 'analytics',  label: 'Analytics',       icon: <IconAnalytics /> },
    { id: 'settings',   label: 'Settings',        icon: <IconSettings /> },
    { id: 'studio',     label: 'Studio Profile',  icon: <IconStudio /> },
  ];

  const handleAddFilm = (payload: Parameters<typeof onAddFilm>[0]) => {
    onAddFilm(payload);
    setIsUploadOpen(false);
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 -mb-16 flex" style={{ minHeight: 'calc(100vh - 73px)' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-60 xl:w-64 flex-none flex-col border-r border-slate-200 bg-white"
        style={{ position: 'sticky', top: 73, height: 'calc(100vh - 73px)', overflowY: 'auto' }}
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
                <span
                  className={`h-1.5 w-1.5 rounded-full flex-none ${creator.verified ? 'bg-emerald-400' : 'bg-slate-300'}`}
                />
                <span className="text-xs text-slate-500">
                  {creator.verified ? 'Verified creator' : 'Verification coming soon'}
                </span>
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
            onClick={() => navigate('/studios')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-all"
          >
            <svg className="flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View public page
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 transition-all"
          >
            <svg className="flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload new film
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
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

          {/* Every earnings figure below is simulated until billing launches —
              said once, at the top, on every tab. */}
          <BetaNotice />

          {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome banner — shown once after account creation */}
              {showWelcome && (
                <div className="relative rounded-[1.75rem] border border-brand-purple/30 bg-gradient-to-r from-brand-purple/10 via-brand-indigo/5 to-brand-cyan/10 p-6 sm:p-8">
                  <button
                    onClick={onDismissWelcome}
                    aria-label="Dismiss"
                    className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition text-lg"
                  >
                    ×
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-brand-purple text-white text-xl">
                      🎬
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-950 text-lg">Welcome to YouMakeTV.</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Your creator account is active. Upload your first film to start building your audience.
                      </p>
                      <button
                        onClick={() => { setIsUploadOpen(true); onDismissWelcome?.(); }}
                        className="mt-4 rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                      >
                        Upload Your First Film →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-brand-purple">Welcome back</p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-950">{creator.studioName}</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {creator.films.length} film{creator.films.length !== 1 ? 's' : ''} · Analytics updated live
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="self-start sm:self-auto rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  + Upload new film
                </button>
              </div>

              {creator.films.length === 0 ? (
                <CreatorEmptyState onUpload={() => setIsUploadOpen(true)} onGuidelines={() => setActiveTab('settings')} />
              ) : (
                <>
                  <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">Earnings overview</p>
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
                            <p className="text-xs uppercase tracking-[0.24em] text-emerald-600 mb-2">Best converting film</p>
                            <p className="font-semibold text-slate-950 line-clamp-2">{topConvertingFilm.title}</p>
                            <p className="text-2xl font-semibold text-emerald-600 mt-2">
                              {topConvertingFilm.trailerViews ? Math.round((topConvertingFilm.paidWatches / topConvertingFilm.trailerViews) * 100) : 0}%
                            </p>
                            <p className="text-sm text-slate-500 mt-1">trailer → paid</p>
                          </div>
                        )}
                        <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-brand-purple mb-2">What to upload next</p>
                          <p className="font-semibold text-slate-950">More like "{topFilm.genre}"</p>
                          <p className="text-sm text-slate-600 mt-2">Your {topFilm.genre} content drives the most revenue. Upload similar genres to accelerate growth.</p>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── CONTENT ────────────────────────────────────────────────────────── */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Content</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {creator.films.length} film{creator.films.length !== 1 ? 's' : ''} uploaded
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  + Upload new film
                </button>
              </div>

              {creator.films.length === 0 ? (
                <CreatorEmptyState onUpload={() => setIsUploadOpen(true)} onGuidelines={() => setActiveTab('settings')} />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {creator.films.map((film) => (
                    <FilmCard
                      key={film.id}
                      film={film}
                      onAnalytics={setSelectedFilm}
                      onDelete={onDeleteFilm}
                      onEdit={onEditFilm}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYOUT HISTORY ─────────────────────────────────────────────────── */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Payout History</h2>
                <p className="mt-1 text-sm text-slate-500">Simulated earnings and payout history — no money has moved</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-brand-purple/30 bg-brand-purple/5 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-purple">Total earnings</p>
                  <p className="mt-3 text-3xl font-semibold text-brand-purple">{formatCurrency(totalEarnings)}</p>
                  <p className="text-xs text-slate-500 mt-1">After platform fee</p>
                </div>
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Pending payout</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatCurrency(pendingPayout)}</p>
                  <p className="text-xs text-slate-500 mt-1">Nothing is processing yet</p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Paid out (lifetime)</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(paidTotal)}</p>
                  <p className="text-xs text-slate-500 mt-1">No money has been transferred</p>
                </div>
              </div>

              {payouts.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
                  <p className="text-slate-500 font-medium">No payout history yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Upload and price your films — revenue share accrues once billing is live.</p>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-950">Transactions</h3>
                    <span className="text-xs text-slate-400">{payouts.length} entries</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${
                            payout.status === 'Paid' ? 'bg-emerald-100' : 'bg-amber-100'
                          }`}>
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
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            payout.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-slate-400">
                When billing goes live, payouts will be processed monthly with a $25 minimum. No payouts have been made yet.
              </p>
            </div>
          )}

          {/* ── ANALYTICS ──────────────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Analytics</h2>
                <p className="mt-1 text-sm text-slate-500">Deep dive into views, revenue, and audience performance</p>
              </div>

              {creator.films.length === 0 ? (
                <CreatorEmptyState onUpload={() => setIsUploadOpen(true)} onGuidelines={() => setActiveTab('settings')} />
              ) : (
                <>
                  <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                    <CreatorAnalytics creator={creator} />
                  </section>
                  <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <h3 className="text-lg font-semibold text-slate-950">Film performance table</h3>
                    </div>
                    <FilmPerformanceTable
                      films={creator.films}
                      onViewAnalytics={setSelectedFilm}
                      onDelete={(film) => onDeleteFilm(film.id)}
                    />
                  </section>
                </>
              )}
            </div>
          )}

          {/* ── SETTINGS ───────────────────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Manage your creator profile and preferences</p>
              </div>

              {/* Profile */}
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
                {creator.verified ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 flex-none" />
                    <p className="text-sm font-medium text-emerald-700">Identity verified</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-slate-400 flex-none" />
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">Verification coming soon.</span>{' '}
                      Identity verification arrives with creator payouts — we will ask for what a
                      payment processor actually requires, at the point it is required, and not
                      before.
                    </p>
                  </div>
                )}
                <button className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                  Request profile edit
                </button>
              </section>

              {/* Revenue */}
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
                    <p className="text-2xl font-semibold text-slate-950">Not live yet</p>
                    <p className="text-xs text-slate-500 mt-1">Monthly once billing is connected</p>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-5">
                <h3 className="font-semibold text-slate-950">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New paid watch',       desc: 'When a viewer pays to watch one of your films',          on: true  },
                    { label: 'Payout ready',         desc: 'When your earnings are ready to transfer, once billing is live', on: true  },
                    { label: 'Film status change',   desc: 'When a submitted film is approved or rejected',          on: true  },
                    { label: 'Marketing tips',       desc: 'Platform tips for growing your audience',                on: false },
                  ].map((pref) => (
                    <div key={pref.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-950">{pref.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                      </div>
                      <div className={`relative flex-none h-6 w-11 cursor-pointer rounded-full transition-colors ${pref.on ? 'bg-brand-purple' : 'bg-slate-300'}`}>
                        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${pref.on ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── STUDIO PROFILE ─────────────────────────────────────────────────── */}
          {activeTab === 'studio' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Studio Profile</h2>
                <p className="mt-1 text-sm text-slate-500">How your studio appears to viewers on YouMakeTV</p>
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
                        <span className={`h-1.5 w-1.5 rounded-full flex-none ${creator.verified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {creator.verified ? 'Verified creator' : 'Verification coming soon'}
                      </span>
                      <span className="inline-flex rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
                        {creator.films.length} Film{creator.films.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Creator name',  value: creator.fullName },
                    { label: 'Studio name',   value: creator.studioName },
                    { label: 'Email',         value: creator.email },
                    { label: 'Member since',  value: creator.createdAt },
                    { label: 'Verification',  value: creator.kycCompleted ? 'KYC Complete' : 'Verification coming soon' },
                    { label: 'Status',        value: 'Active' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-1.5">{f.label}</p>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950">
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/contact')}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  Request profile edit →
                </button>
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
                    <p className="text-2xl font-semibold text-brand-purple">
                      {formatNumber(creator.films.reduce((s, f) => s + f.views, 0))}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Total views</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-emerald-50 border border-emerald-200 p-5 text-center">
                    <p className="text-2xl font-semibold text-emerald-700">
                      {creator.films.filter(f => f.status === 'Approved').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Published films</p>
                  </div>
                </div>
              </section>

              {/* View on platform */}
              <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 sm:p-8 space-y-4">
                <h3 className="font-semibold text-slate-950">Your public page</h3>
                <p className="text-sm text-slate-500">
                  Viewers can discover your studio and browse all your published films on YouMakeTV.
                </p>
                <button
                  onClick={() => navigate('/studios')}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Browse all studios
                </button>
              </section>
            </div>
          )}

        </div>
      </div>

      {/* ── UPLOAD MODAL ─────────────────────────────────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 pt-20">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">Upload new film</h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <FilmUploadForm
              creatorName={creator.studioName}
              onCancel={() => setIsUploadOpen(false)}
              onSubmit={(payload) => {
                const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                handleAddFilm({
                  id: `film-${Date.now()}`,
                  title: payload.title,
                  subtitle: payload.subtitle,
                  description: payload.description,
                  genre: payload.genre,
                  duration: payload.duration,
                  creator: creator.studioName,
                  category: payload.category,
                  price: payload.price,
                  thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
                  status: 'Draft',
                  views: 0,
                  trailerViews: 0,
                  paidWatches: 0,
                  freeWatches: 0,
                  rating: payload.rating,
                  language: payload.language,
                  tools: payload.tools,
                  trailerUrl: payload.trailerUrl,
                  filmUrl: payload.filmUrl,
                  uploadDate: dateLabel,
                  updatedDate: dateLabel,
                });
              }}
            />
          </div>
        </div>
      )}

      {selectedFilm && <FilmAnalyticsModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />}
    </div>
  );
}
