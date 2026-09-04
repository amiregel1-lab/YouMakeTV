import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AdminCreator, AdminFilm, AuditLogEntry, MonthlyMetric,
  Movie, PayoutRecord, PlatformSettings,
} from '../types';
import { DEFAULT_SETTINGS } from '../data/adminDefaults';
import { clearAdminSession, loadAdminSession } from '../lib/storage';
import {
  applyAdminFilmToMovieStore,
  getMergedMovies,
  loadAdminFilms,
  resetMovieOverride,
  saveAdminFilms,
} from '../lib/movieStore';
import { compressPosterImage, compressBackdropImage } from '../lib/imageUtils';
import { movies as sourceMovies } from '../data/movies';
import { getMovies, patchMovie, upsertMovie } from '../lib/movieService';
import { uploadCover, uploadBackdrop, uploadTrailer } from '../lib/storageService';
import { useMovies } from '../lib/MovieContext';
import { getTodayEventCounts, type TodayEventCounts } from '../lib/eventService';

// PROTOTYPE NOTE: Admin session is verified client-side only.
// Production requires server-side JWT validation on every protected route.
// Real RBAC must be implemented before launch.

type AdminSection =
  | 'dashboard' | 'overview' | 'creators' | 'movies' | 'moderation'
  | 'payouts' | 'subscriptions' | 'reports' | 'settings' | 'auditlog';

// ── Shared Helpers ────────────────────────────────────────────────────────────

function fmt$(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();
}
function fmtDate(iso: string) {
  if (!iso || iso === 'Never') return iso;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Badge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    Approved: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    Ready: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    Suspended: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
    Rejected: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
    'On Hold': 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    'Pending Review': 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    Processing: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    Draft: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls[status] ?? 'bg-slate-700 text-slate-300'}`}>
      {status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 whitespace-nowrap">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-slate-300 ${className}`}>{children}</td>;
}

// ── Empty State ──────────────────────────────────────────────────────────────
// Used wherever a section has no data behind it yet. Every figure in this console
// is a genuine count, so a section with nothing to show says what it is waiting on
// instead of rendering invented rows or an empty chart skeleton.

function EmptyState({ icon, title, body, note }: { icon: string; title: string; body: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-purple/30 bg-brand-purple/10 text-lg text-brand-purple">
        {icon}
      </span>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">{body}</p>
      {note && <p className="mx-auto mt-3 max-w-md text-[11px] leading-relaxed text-slate-600">{note}</p>}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 space-y-1 ${accent ? 'border-brand-purple/30 bg-brand-purple/5' : 'border-slate-800 bg-slate-900'}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-brand-purple' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

interface OverviewProps { stats: ReturnType<typeof computeStats>; metrics: MonthlyMetric[] }

// Every figure here is derived from real data — the movie catalog, the creator
// list and the payout list. Areas with no live system behind them yet (creator
// sign-ups, purchases, earnings, subscriptions) legitimately compute to 0; that
// zero is the true count, never a stand-in for a number we don't have.
function computeStats(creators: AdminCreator[], films: AdminFilm[], payouts: PayoutRecord[], settings: PlatformSettings, movies: Movie[]) {
  const monthStart = (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).getTime(); })();
  const inThisMonth = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return !Number.isNaN(t) && t >= monthStart;
  };

  const totalRevenue = creators.reduce((s, c) => s + c.totalRevenue, 0);
  const totalViews = films.reduce((s, f) => s + f.views, 0);
  const creatorPayouts = creators.filter(c => c.status === 'Active').reduce((s, c) => s + c.totalRevenue * c.revenueShare / 100, 0);
  const platformRevenue = totalRevenue - creatorPayouts;
  const totalPurchases = films.reduce((s, f) => s + f.purchases, 0);
  const pendingPayouts = payouts.reduce((s, p) => s + p.pending, 0);
  // No subscription system is live yet, so there is nothing to count.
  const activeSubscribers = 0;
  const mrr = activeSubscribers * settings.membershipMonthlyPrice;
  const paidFilms = films.filter(f => f.price > 0);
  const avgPrice = paidFilms.length ? paidFilms.reduce((s, f) => s + f.price, 0) / paidFilms.length : 0;
  const conversionRate = totalViews ? (totalPurchases / totalViews * 100) : 0;
  const avgRevPerCreator = creators.length ? totalRevenue / creators.length : 0;
  const totalTrailerViews = movies.reduce((s, m) => s + (m.trailerViews ?? 0), 0);
  return {
    totalCreators: creators.length,
    totalMovies: films.length,
    totalViews, totalTrailerViews, totalPurchases,
    grossRevenue: totalRevenue, creatorPayouts, platformRevenue,
    pendingPayouts, activeSubscribers, mrr,
    conversionRate, avgPrice, avgRevPerCreator,
    newCreatorsMonth: creators.filter(c => inThisMonth(c.joinedAt)).length,
    newMoviesMonth: movies.filter(m => inThisMonth(m.createdAt)).length,
  };
}

function OverviewSection({ stats, metrics }: OverviewProps) {
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long' });

  const kpis = [
    { label: 'Total Creators', value: stats.totalCreators.toString() },
    { label: 'Total Movies', value: stats.totalMovies.toString() },
    // These two come from the view counts stored on the catalog rows, which were
    // seeded with the catalog rather than measured. Labelled so they are never
    // mistaken for real traffic. Real measured views live in the events table
    // (/api/track) and drive the Today dashboard.
    { label: 'Total Views', value: fmtK(stats.totalViews), sub: 'Catalog figure — not measured traffic' },
    { label: 'Trailer Views', value: fmtK(stats.totalTrailerViews), sub: 'Catalog figure — not measured traffic' },
    { label: 'Total Purchases', value: fmtK(stats.totalPurchases) },
    { label: 'Gross Revenue', value: fmt$(stats.grossRevenue), accent: true },
    { label: 'Creator Payouts', value: fmt$(stats.creatorPayouts) },
    { label: 'Platform Revenue', value: fmt$(stats.platformRevenue), accent: true },
    { label: 'Pending Payouts', value: fmt$(stats.pendingPayouts) },
    { label: 'Active Subscribers', value: stats.activeSubscribers.toString() },
    { label: 'Monthly Recurring Rev', value: fmt$(stats.mrr), accent: true },
    { label: 'Conversion Rate', value: stats.conversionRate.toFixed(2) + '%' },
    { label: 'Avg Movie Price', value: fmt$(stats.avgPrice) },
    { label: 'Avg Rev / Creator', value: fmt$(stats.avgRevPerCreator) },
    { label: `New Creators (${monthLabel})`, value: stats.newCreatorsMonth.toString() },
    { label: `New Movies (${monthLabel})`, value: stats.newMoviesMonth.toString() },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Platform Overview</h2>
        <p className="text-sm text-slate-500">All-time counts, read straight from the live catalog and admin records</p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-600">
          Creator accounts, purchases, earnings and YouMake+ subscriptions have no live
          system behind them yet, so those cards read zero — that is the true figure, not
          a placeholder. The two view counts are the exception: they are the numbers stored
          on the catalog rows themselves, which were seeded rather than measured, and are
          marked as such. Real measured activity is on the Today dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} accent={k.accent} />)}
      </div>

      {metrics.length === 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EmptyState
            icon="◈"
            title="No revenue history yet"
            body="Monthly revenue is charted once purchases start being recorded. Nothing has been earned on the platform so far."
          />
          <EmptyState
            icon="★"
            title="No subscriber history yet"
            body="YouMake+ isn't taking sign-ups yet, so there is no subscriber trend to plot."
          />
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-white mb-4">Revenue (6 months)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'K'} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#c4b5fd' }} formatter={(v) => ['$' + (Number(v) || 0).toLocaleString(), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-white mb-4">Subscribers (6 months)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#22d3ee' }} />
              <Line type="monotone" dataKey="subscribers" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </div>
  );
}

// ── Dashboard — "Today" only ─────────────────────────────────────────────────────
// Shows ONLY what actually happened TODAY, all from real data:
//  • Engagement (trailer plays, purchases, sign-ups, subscriptions) — counted from
//    the events table via /api/track, recorded as users act on the live site.
//  • Catalog (movies uploaded / edited today, creators onboarded today) — from the
//    movies table timestamps (created_at / updated_at) and creator joinedAt.
// Every figure is a genuine count and reads 0 on a quiet day rather than inventing
// activity. If event tracking isn't connected yet, the engagement row explains the
// one-time setup instead of showing fake numbers.

function startOfTodayMs(): number {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
}
function isToday(iso: string | undefined, start: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t >= start;
}
function relTime(iso?: string): string {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'never';
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface DashboardProps {
  movies: Movie[];
  creators: AdminCreator[];
  loading: boolean;
}

type FeedItem = { id: number; title: string; action: 'Uploaded' | 'Edited'; ts: number; iso?: string };

function DashboardSection({ movies, creators, loading }: DashboardProps) {
  const t = useMemo(() => {
    const start = startOfTodayMs();
    const todayStr = new Date().toISOString().slice(0, 10);

    const uploadedToday = movies.filter(m => isToday(m.createdAt, start));
    const editedToday = movies.filter(m => isToday(m.updatedAt, start) && !isToday(m.createdAt, start));
    const newCreatorsToday = creators.filter(c => c.joinedAt === todayStr);

    const feed: FeedItem[] = [];
    for (const m of movies) {
      const uploaded = isToday(m.createdAt, start);
      const edited = isToday(m.updatedAt, start) && !uploaded;
      if (uploaded) feed.push({ id: m.id, title: m.title, action: 'Uploaded', ts: new Date(m.createdAt as string).getTime(), iso: m.createdAt });
      else if (edited) feed.push({ id: m.id, title: m.title, action: 'Edited', ts: new Date(m.updatedAt as string).getTime(), iso: m.updatedAt });
    }
    feed.sort((a, b) => b.ts - a.ts);

    const byCreated = [...movies].filter(m => m.createdAt).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
    const byUpdated = [...movies].filter(m => m.updatedAt).sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime());

    return {
      uploadedToday, editedToday, newCreatorsToday, feed,
      newPaidToday: uploadedToday.filter(m => m.price > 0).length,
      newFreeToday: uploadedToday.filter(m => m.price === 0).length,
      featuredAddedToday: uploadedToday.filter(m => m.featured).length,
      lastUpload: byCreated[0],
      lastEdit: byUpdated[0],
    };
  }, [movies, creators]);

  const [events, setEvents] = useState<TodayEventCounts>({ configured: false, counts: {} });
  useEffect(() => {
    let alive = true;
    getTodayEventCounts().then(e => { if (alive) setEvents(e); });
    return () => { alive = false; };
  }, []);

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const engagementKpis = [
    { label: 'Trailer Plays', value: events.counts.trailer_play ?? 0 },
    { label: 'Purchases', value: events.counts.purchase ?? 0 },
    { label: 'New Sign-ups', value: events.counts.signup ?? 0 },
    { label: 'New Subscriptions', value: events.counts.subscription ?? 0 },
  ];

  const kpis = [
    { label: 'New Movies Uploaded', value: t.uploadedToday.length },
    { label: 'Movies Edited', value: t.editedToday.length },
    { label: 'New Creators Onboarded', value: t.newCreatorsToday.length },
    { label: 'New Paid Films', value: t.newPaidToday },
    { label: 'New Free Films', value: t.newFreeToday },
    { label: 'Featured Films Added', value: t.featuredAddedToday },
  ];

  const eventsToday = engagementKpis.reduce((s, k) => s + k.value, 0);
  const anythingToday = t.feed.length > 0 || t.newCreatorsToday.length > 0 || eventsToday > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Today</h2>
          <p className="text-sm text-slate-500 mt-0.5">{todayLabel} · only what changed today</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full inline-block ${anythingToday ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          {anythingToday ? 'Activity today' : 'Quiet so far today'}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      ) : (
        <>
          {/* Engagement today — real counts from the events table */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">Engagement today</p>
            {events.configured ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {engagementKpis.map(k => (
                  <div key={k.label} className={`rounded-2xl border p-5 space-y-1 ${k.value > 0 ? 'border-brand-cyan/30 bg-brand-cyan/5' : 'border-slate-800 bg-slate-900'}`}>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">{k.label}</p>
                    <p className={`text-3xl font-bold ${k.value > 0 ? 'text-brand-cyan' : 'text-slate-600'}`}>{k.value}</p>
                    <p className="text-[11px] text-slate-600">today</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-sm font-semibold text-amber-300/90 mb-1">Event tracking not connected yet</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Trailer plays, purchases, sign-ups and subscriptions are logged the moment they
                  happen on the live site, but counting them here needs a one-time setup: run
                  <span className="font-mono text-slate-300"> supabase/migrations/004_events.sql</span> in
                  the Supabase SQL editor, then add <span className="font-mono text-slate-300">SUPABASE_SERVICE_ROLE_KEY</span> to
                  your Vercel environment variables. Once both are in place these four cards fill with
                  real same-day counts — no fake numbers in the meantime.
                </p>
              </div>
            )}
          </div>

          {/* Catalog today — real counts from movie timestamps (0 on a quiet day) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">Catalog today</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {kpis.map(k => (
                <div key={k.label} className={`rounded-2xl border p-5 space-y-1 ${k.value > 0 ? 'border-brand-purple/30 bg-brand-purple/5' : 'border-slate-800 bg-slate-900'}`}>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">{k.label}</p>
                  <p className={`text-3xl font-bold ${k.value > 0 ? 'text-brand-purple' : 'text-slate-600'}`}>{k.value}</p>
                  <p className="text-[11px] text-slate-600">today</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's real activity feed from DB timestamps */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-white mb-4">Today’s Catalog Activity</p>
            {t.feed.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">No catalog changes today yet.</p>
                <p className="text-xs text-slate-600 mt-1">Uploads and edits will appear here as they happen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {t.feed.map(item => (
                  <div key={`${item.id}-${item.action}`} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${item.action === 'Uploaded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {item.action === 'Uploaded' ? '↑' : '✎'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 leading-snug truncate">
                        <span className="font-semibold text-white">{item.action}</span> · {item.title}
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 flex-none">{relTime(item.iso)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog pulse — real "last change" markers so a quiet day still has context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">Last Movie Uploaded</p>
              <p className="text-lg font-bold text-white mt-1 truncate">{t.lastUpload?.title ?? '—'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{t.lastUpload ? relTime(t.lastUpload.createdAt) : 'no uploads recorded'}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">Last Catalog Edit</p>
              <p className="text-lg font-bold text-white mt-1 truncate">{t.lastEdit?.title ?? '—'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{t.lastEdit ? relTime(t.lastEdit.updatedAt) : 'no edits recorded'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// ── Creators Section ──────────────────────────────────────────────────────────

interface CreatorsProps {
  creators: AdminCreator[];
  search: string;
  selectedCreator: AdminCreator | null;
  onSelect: (c: AdminCreator) => void;
  onEdit: (c: AdminCreator) => void;
  onVerify: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function CreatorsSection({ creators, search, selectedCreator, onSelect, onEdit, onVerify, onSuspend, onReactivate, onDelete }: CreatorsProps) {
  const filtered = useMemo(() => {
    if (!search) return creators;
    const q = search.toLowerCase();
    return creators.filter(c =>
      c.studioName.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    );
  }, [creators, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Creator Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{creators.length} total creators</p>
        </div>
      </div>

      {creators.length === 0 ? (
        <EmptyState
          icon="◉"
          title="No creators have signed up yet"
          body="Creator accounts appear here the moment someone completes onboarding. Nobody has registered so far, so there is nothing to verify, suspend or edit."
        />
      ) : (
      <div className="flex gap-6">
        {/* Table */}
        <div className={`rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden ${selectedCreator ? 'flex-1 min-w-0' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  <Th>Studio / Creator</Th>
                  <Th>Email</Th>
                  <Th>Country</Th>
                  <Th>Verified</Th>
                  <Th>Status</Th>
                  <Th>Rev %</Th>
                  <Th>Movies</Th>
                  <Th>Revenue</Th>
                  <Th>Views</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedCreator?.id === c.id ? 'bg-brand-purple/5' : ''}`}
                  >
                    <Td>
                      <p className="font-semibold text-white">{c.studioName}</p>
                      <p className="text-xs text-slate-500">{c.fullName}</p>
                    </Td>
                    <Td className="text-slate-400">{c.email}</Td>
                    <Td>{c.country}</Td>
                    <Td>{c.verified ? <span className="text-emerald-400 text-xs font-semibold">✓ Verified</span> : <span className="text-amber-400 text-xs font-semibold">Pending</span>}</Td>
                    <Td><Badge status={c.status} /></Td>
                    <Td>{c.revenueShare}%</Td>
                    <Td>{c.totalMovies}</Td>
                    <Td className="font-medium text-white">{fmt$(c.totalRevenue)}</Td>
                    <Td>{fmtK(c.totalViews)}</Td>
                    <Td className="text-slate-500">{fmtDate(c.joinedAt)}</Td>
                    <Td>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <ActionBtn onClick={() => onEdit(c)} color="blue">Edit</ActionBtn>
                        {!c.verified && <ActionBtn onClick={() => onVerify(c.id)} color="green">Verify</ActionBtn>}
                        {c.status === 'Active' && <ActionBtn onClick={() => onSuspend(c.id)} color="red">Suspend</ActionBtn>}
                        {c.status === 'Suspended' && <ActionBtn onClick={() => onReactivate(c.id)} color="green">Reactivate</ActionBtn>}
                        <ActionBtn onClick={() => { if (confirm('Delete creator?')) onDelete(c.id); }} color="red">Del</ActionBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedCreator && (
          <div className="w-72 flex-none rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 self-start">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-white">{selectedCreator.studioName}</p>
                <p className="text-xs text-slate-500">{selectedCreator.fullName}</p>
              </div>
              <Badge status={selectedCreator.status} />
            </div>
            <div className="h-px bg-slate-800" />
            <div className="space-y-3 text-sm">
              {[
                ['Email', selectedCreator.email],
                ['Country', selectedCreator.country],
                ['KYC', selectedCreator.kycCompleted ? 'Completed' : 'Pending'],
                ['Revenue Share', `${selectedCreator.revenueShare}%`],
                ['Total Movies', selectedCreator.totalMovies.toString()],
                ['Total Revenue', fmt$(selectedCreator.totalRevenue)],
                ['Total Views', fmtK(selectedCreator.totalViews)],
                ['Joined', fmtDate(selectedCreator.joinedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-white text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
            {selectedCreator.notes && (
              <div className="rounded-xl bg-slate-800 px-3 py-2.5">
                <p className="text-xs text-slate-500 mb-1">Admin Notes</p>
                <p className="text-xs text-slate-300 leading-5">{selectedCreator.notes}</p>
              </div>
            )}
            <button onClick={() => onEdit(selectedCreator)} className="w-full rounded-xl border border-brand-purple/40 bg-brand-purple/10 py-2 text-sm font-semibold text-brand-purple hover:bg-brand-purple/20 transition">
              Edit Creator
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// ── Movies Section ────────────────────────────────────────────────────────────

interface MoviesProps {
  films: AdminFilm[];
  search: string;
  onEdit: (f: AdminFilm) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onFeature: (id: string) => void;
  onDelete: (id: string) => void;
}

function MoviesSection({ films, search, onEdit, onApprove, onReject, onSuspend, onFeature, onDelete }: MoviesProps) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');

  const genres = useMemo(() => ['All', ...Array.from(new Set(films.map(f => f.genre)))], [films]);

  const filtered = useMemo(() => {
    let r = films;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.studioName.toLowerCase().includes(q) ||
        f.creatorName.toLowerCase().includes(q) ||
        f.genre.toLowerCase().includes(q) ||
        f.tags.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') r = r.filter(f => f.status === statusFilter);
    if (genreFilter !== 'All') r = r.filter(f => f.genre === genreFilter);
    return r;
  }, [films, search, statusFilter, genreFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Movie Library</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length < films.length
              ? `Showing ${filtered.length} of ${films.length} films`
              : `${films.length} total films`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple">
            {['All', 'Approved', 'Pending Review', 'Rejected', 'Suspended', 'Draft'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple">
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800">
              <tr>
                <Th>Poster</Th>
                <Th>Title / Creator</Th>
                <Th>Genre</Th>
                <Th>Runtime</Th>
                <Th>Price</Th>
                <Th>Views</Th>
                <Th>Purchases</Th>
                <Th>Revenue</Th>
                <Th>Status</Th>
                <Th>Flags</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                  <Td>
                    <img src={f.thumbnail} alt={f.title} className="h-14 w-10 rounded-lg object-cover" />
                  </Td>
                  <Td>
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-500">{f.studioName}</p>
                  </Td>
                  <Td className="text-slate-400">{f.genre}</Td>
                  <Td className="text-slate-400">{f.duration}</Td>
                  <Td className="font-medium text-white">{f.price === 0 ? 'Free' : fmt$(f.price)}</Td>
                  <Td>{fmtK(f.views)}</Td>
                  <Td>{f.purchases.toLocaleString()}</Td>
                  <Td className="font-medium text-white">{fmt$(f.revenue)}</Td>
                  <Td><Badge status={f.status} /></Td>
                  <Td>
                    <div className="flex gap-1 flex-wrap">
                      {f.featured && <span className="text-xs bg-brand-purple/20 text-brand-purple rounded-full px-2 py-0.5">Featured</span>}
                      {f.trending && <span className="text-xs bg-brand-cyan/20 text-brand-cyan rounded-full px-2 py-0.5">Trending</span>}
                      {f.newRelease && <span className="text-xs bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">New</span>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex gap-1 flex-wrap">
                      <ActionBtn onClick={() => onEdit(f)} color="blue">Edit</ActionBtn>
                      {f.status !== 'Approved' && <ActionBtn onClick={() => onApprove(f.id)} color="green">Approve</ActionBtn>}
                      {f.status === 'Approved' && <ActionBtn onClick={() => onReject(f.id)} color="amber">Reject</ActionBtn>}
                      {f.status !== 'Suspended' && f.status !== 'Draft' && <ActionBtn onClick={() => onSuspend(f.id)} color="red">Suspend</ActionBtn>}
                      <ActionBtn onClick={() => onFeature(f.id)} color="purple">{f.featured ? 'Unfeature' : 'Feature'}</ActionBtn>
                      <ActionBtn onClick={() => { if (confirm('Delete film?')) onDelete(f.id); }} color="red">Del</ActionBtn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Moderation Section ────────────────────────────────────────────────────────

interface ModerationProps {
  films: AdminFilm[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
}

function ModerationSection({ films, onApprove, onReject, onSuspend }: ModerationProps) {
  const [filter, setFilter] = useState('Pending Review');

  const filtered = useMemo(() =>
    filter === 'All' ? films : films.filter(f => f.status === filter),
    [films, filter]);

  const pendingCount = films.filter(f => f.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Content Moderation</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingCount === 0
              ? `Nothing waiting on you — all ${films.length} films in the catalog are cleared`
              : `${pendingCount} pending review`}
          </p>
        </div>
        <div className="flex gap-2">
          {['Pending Review', 'Approved', 'Rejected', 'Suspended', 'All'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${filter === s ? 'bg-brand-purple text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {s} {s !== 'All' && <span className="ml-1 opacity-60">({films.filter(f => f.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          filter === 'Pending Review' ? (
            <EmptyState
              icon="◻"
              title="Nothing in the moderation queue"
              body={films.length === 0
                ? 'No films have been uploaded yet, so there is nothing to review.'
                : `Every one of the ${films.length} films in the catalog has already been cleared. New uploads land here when they need a decision.`}
            />
          ) : (
            <EmptyState
              icon="◻"
              title={`No films marked "${filter}"`}
              body="Films move into this category only when an admin sets that status."
            />
          )
        )}
        {filtered.map(f => (
          <div key={f.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex items-start gap-5">
            <img src={f.thumbnail} alt={f.title} className="h-20 w-14 rounded-xl object-cover flex-none" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white">{f.title}</p>
                <Badge status={f.status} />
                {f.featured && <span className="text-xs bg-brand-purple/20 text-brand-purple rounded-full px-2 py-0.5">Featured</span>}
              </div>
              <p className="text-sm text-slate-400">{f.studioName} · {f.genre} · {f.duration} · {f.rating}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{f.description}</p>
              {f.moderationNotes && (
                <p className="text-xs text-amber-400 mt-1">⚠ {f.moderationNotes}</p>
              )}
            </div>
            <div className="flex gap-2 flex-none flex-wrap justify-end">
              {f.status !== 'Approved' && <ActionBtn onClick={() => onApprove(f.id)} color="green">Approve</ActionBtn>}
              {f.status !== 'Rejected' && <ActionBtn onClick={() => onReject(f.id)} color="amber">Reject</ActionBtn>}
              {f.status !== 'Suspended' && <ActionBtn onClick={() => onSuspend(f.id)} color="red">Suspend</ActionBtn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payouts Section ───────────────────────────────────────────────────────────

interface PayoutsProps {
  payouts: PayoutRecord[];
  onMarkPaid: (id: string) => void;
  onHold: (id: string) => void;
  onRelease: (id: string) => void;
}

function PayoutsSection({ payouts, onMarkPaid, onHold, onRelease }: PayoutsProps) {
  const totalPending = payouts.reduce((s, p) => s + p.pending, 0);
  const totalPaid = payouts.reduce((s, p) => s + p.totalPaid, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Payout Management</h2>
        <p className="text-sm text-slate-500 mt-0.5">Creator earnings and payout status</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Pending" value={fmt$(totalPending)} accent />
        <KpiCard label="Total Paid (All Time)" value={fmt$(totalPaid)} />
        <KpiCard label="Creators with Pending" value={payouts.filter(p => p.pending > 0).length.toString()} />
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No payouts to process"
          body="Payout rows are created per creator once they have earnings. There are no creators and nothing has been earned yet, so there is nothing to pay out."
        />
      ) : (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800">
              <tr>
                <Th>Studio</Th>
                <Th>Creator</Th>
                <Th>Total Earnings</Th>
                <Th>Pending</Th>
                <Th>Last Payout</Th>
                <Th>Last Amount</Th>
                <Th>Total Paid</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <Td className="font-semibold text-white">{p.studioName}</Td>
                  <Td className="text-slate-400">{p.creatorName}</Td>
                  <Td className="font-medium text-white">{fmt$(p.earnings)}</Td>
                  <Td className={`font-bold ${p.pending > 0 ? 'text-brand-purple' : 'text-slate-600'}`}>{fmt$(p.pending)}</Td>
                  <Td className="text-slate-500">{fmtDate(p.lastPayoutDate)}</Td>
                  <Td>{fmt$(p.lastPayoutAmount)}</Td>
                  <Td>{fmt$(p.totalPaid)}</Td>
                  <Td><Badge status={p.status} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      {p.pending > 0 && p.status === 'Ready' && <ActionBtn onClick={() => onMarkPaid(p.id)} color="green">Mark Paid</ActionBtn>}
                      {p.status !== 'On Hold' && <ActionBtn onClick={() => onHold(p.id)} color="red">Hold</ActionBtn>}
                      {p.status === 'On Hold' && <ActionBtn onClick={() => onRelease(p.id)} color="green">Release</ActionBtn>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}

// ── Subscriptions Section ─────────────────────────────────────────────────────

interface SubsProps { settings: PlatformSettings; onSave: (s: PlatformSettings) => void }

function SubscriptionsSection({ settings, onSave }: SubsProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">YouMake+ Subscriptions</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage subscription pricing and limits</p>
      </div>

      <EmptyState
        icon="★"
        title="YouMake+ isn't taking sign-ups yet"
        body="Subscriber counts, MRR, churn and average subscription length appear here once the subscription system is live and the first member joins. Nothing is being billed today."
        note="The pricing below is live configuration — it sets what viewers will be charged when subscriptions open."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 max-w-lg">
        <p className="text-sm font-semibold text-white">Subscription Pricing</p>
        {[
          { label: 'Monthly Price ($)', key: 'membershipMonthlyPrice' as const, type: 'number' },
          { label: 'Annual Price ($)', key: 'membershipAnnualPrice' as const, type: 'number' },
          { label: 'Subscriber Discount (%)', key: 'membershipDiscountPercent' as const, type: 'number' },
          { label: 'Free Movie Daily Limit', key: 'freeMovieDailyLimit' as const, type: 'number' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">{field.label}</label>
            <input
              type={field.type}
              value={draft[field.key] as number}
              onChange={e => setDraft(p => ({ ...p, [field.key]: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-purple"
            />
          </div>
        ))}
        <button onClick={handleSave} className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${saved ? 'bg-emerald-600 text-white' : 'bg-brand-purple text-white hover:bg-brand-indigo'}`}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Reports Section ───────────────────────────────────────────────────────────

interface ReportsProps { metrics: MonthlyMetric[]; creators: AdminCreator[]; films: AdminFilm[] }

function ReportsSection({ metrics, creators, films }: ReportsProps) {
  // Ranked lists only mean something once there is revenue to rank by — a table of
  // $0.00 rows would read as a real leaderboard when nothing has been earned.
  const topCreators = [...creators].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const topFilms = [...films].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const hasCreatorRevenue = topCreators.some(c => c.totalRevenue > 0);
  const hasFilmRevenue = topFilms.some(f => f.revenue > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {metrics.length === 0
            ? 'Trends appear here once the platform has recorded activity to report on'
            : `Platform performance over the last ${metrics.length} months`}
        </p>
      </div>

      {metrics.length === 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EmptyState
            icon="▦"
            title="No revenue history to chart"
            body="Revenue is plotted month by month as purchases come in. Nothing has been sold on the platform yet."
          />
          <EmptyState
            icon="▦"
            title="No purchase or subscriber history"
            body="This chart fills in once purchases and YouMake+ sign-ups start being recorded."
          />
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-white mb-4">Revenue Growth</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="rptRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v / 1000 + 'K'} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} formatter={(v) => ['$' + (Number(v) || 0).toLocaleString(), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#rptRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-white mb-4">Purchases & Subscribers</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="purchases" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Purchases" />
              <Bar dataKey="subscribers" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Subscribers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {!hasCreatorRevenue ? (
          <EmptyState
            icon="◉"
            title="No creator earnings to rank"
            body="Creators are ranked by revenue once they have some. No creator accounts exist yet, so there is no leaderboard to build."
          />
        ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Top Creators by Revenue</p>
          {topCreators.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-white truncate">{c.studioName}</p>
                  <p className="text-sm font-bold text-brand-purple flex-none ml-2">{fmt$(c.totalRevenue)}</p>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-purple rounded-full" style={{ width: `${(c.totalRevenue / topCreators[0].totalRevenue) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {!hasFilmRevenue ? (
          <EmptyState
            icon="▷"
            title="No film earnings to rank"
            body="Films are ranked once they start selling. No purchases have been recorded against the catalog yet."
          />
        ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Top Films by Revenue</p>
          {topFilms.map((f, i) => (
            <div key={f.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-white truncate">{f.title}</p>
                  <p className="text-sm font-bold text-brand-cyan flex-none ml-2">{fmt$(f.revenue)}</p>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-cyan rounded-full" style={{ width: `${topFilms[0].revenue > 0 ? (f.revenue / topFilms[0].revenue) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

// ── Settings Section ──────────────────────────────────────────────────────────

interface SettingsProps { settings: PlatformSettings; onSave: (s: PlatformSettings) => void }

function SettingsSection({ settings, onSave }: SettingsProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof PlatformSettings) =>
    setDraft(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Global configuration for YouMakeTV.ai</p>
      </div>

      {[
        { heading: 'Platform', fields: [
          { label: 'Platform Name', key: 'platformName', type: 'text' },
          { label: 'Support Email', key: 'supportEmail', type: 'email' },
          { label: 'Legal Email', key: 'legalEmail', type: 'email' },
        ]},
        { heading: 'Revenue', fields: [
          { label: 'Default Creator Share (%)', key: 'defaultCreatorShare', type: 'number' },
          { label: 'Premium Creator Share (%)', key: 'premiumCreatorShare', type: 'number' },
          { label: 'Platform Fee (%)', key: 'platformFeePercent', type: 'number' },
        ]},
        { heading: 'Membership', fields: [
          { label: 'YouMake+ Monthly Price ($)', key: 'membershipMonthlyPrice', type: 'number' },
          { label: 'YouMake+ Annual Price ($)', key: 'membershipAnnualPrice', type: 'number' },
          { label: 'Free Movie Daily Limit', key: 'freeMovieDailyLimit', type: 'number' },
          { label: 'Subscriber Discount (%)', key: 'membershipDiscountPercent', type: 'number' },
        ]},
      ].map(section => (
        <div key={section.heading} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{section.heading}</p>
          <div className="grid grid-cols-2 gap-4">
            {section.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={draft[f.key as keyof PlatformSettings] as string | number}
                  onChange={e => setDraft(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Content Controls</p>
        {[
          { key: 'approvalRequired', label: 'Approval required for new uploads' },
          { key: 'creatorOnboardingEnabled', label: 'Creator onboarding enabled' },
          { key: 'newUploadsEnabled', label: 'New uploads enabled' },
          { key: 'freeMoviesEnabled', label: 'Free movies enabled' },
        ].map(t => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{t.label}</span>
            <button
              onClick={() => toggle(t.key as keyof PlatformSettings)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${draft[t.key as keyof PlatformSettings] ? 'bg-brand-purple' : 'bg-slate-700'}`}
              style={{ height: '22px', width: '40px' }}
              aria-label={t.label}
            >
              <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform ${draft[t.key as keyof PlatformSettings] ? 'translate-x-[19px]' : 'translate-x-0.5'}`} style={{ height: '18px', width: '18px', top: '2px' }} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${saved ? 'bg-emerald-600 text-white' : 'bg-brand-purple text-white hover:bg-brand-indigo'}`}>
        {saved ? '✓ Settings Saved' : 'Save All Settings'}
      </button>
    </div>
  );
}

// ── Audit Log Section ─────────────────────────────────────────────────────────

interface AuditLogProps { entries: AuditLogEntry[] }

const targetTypeColor: Record<string, string> = {
  movie: 'text-brand-cyan',
  creator: 'text-brand-purple',
  payout: 'text-emerald-400',
  settings: 'text-amber-400',
  auth: 'text-slate-500',
};

function AuditLogSection({ entries }: AuditLogProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Audit Log</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {entries.length === 0
            ? 'Admin actions taken in this session — most recent first'
            : `${entries.length} entries — most recent first`}
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon="≡"
          title="No admin actions recorded yet"
          body="Approving a film, editing a creator or changing settings is written here as you do it."
          note="The log lives in this browser session only — it starts empty again after a reload."
        />
      ) : (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800">
              <tr>
                <Th>Timestamp</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>Type</Th>
                <Th>Performed By</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <Td className="text-slate-500 whitespace-nowrap">{fmtDateTime(e.timestamp)}</Td>
                  <Td className="font-medium text-white whitespace-nowrap">{e.action}</Td>
                  <Td>{e.target}</Td>
                  <Td><span className={`text-xs font-semibold uppercase tracking-wider ${targetTypeColor[e.targetType] ?? 'text-slate-400'}`}>{e.targetType}</span></Td>
                  <Td>{e.performedBy}</Td>
                  <Td className="text-slate-500 max-w-xs truncate">{e.details}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}

// ── Creator Edit Modal ────────────────────────────────────────────────────────

function CreatorEditModal({ creator, onSave, onClose }: { creator: AdminCreator; onSave: (c: AdminCreator) => void; onClose: () => void }) {
  const [draft, setDraft] = useState({ ...creator });
  const set = (key: keyof AdminCreator, value: unknown) => setDraft(p => ({ ...p, [key]: value }));

  return (
    <Modal title={`Edit: ${creator.studioName}`} onClose={onClose}>
      <div className="space-y-4">
        {[
          { label: 'Studio Name', key: 'studioName' as const, type: 'text' },
          { label: 'Creator Name', key: 'fullName' as const, type: 'text' },
          { label: 'Email', key: 'email' as const, type: 'email' },
          { label: 'Country', key: 'country' as const, type: 'text' },
          { label: 'Revenue Share (%)', key: 'revenueShare' as const, type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={draft[f.key] as string | number}
              onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Account Status</label>
          <select
            value={draft.status}
            onChange={e => set('status', e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple"
          >
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Admin Notes</label>
          <textarea
            rows={3}
            value={draft.notes}
            onChange={e => set('notes', e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition">Cancel</button>
          <button onClick={() => onSave(draft)} className="flex-1 rounded-xl bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo transition">Save Changes</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Film Edit Modal ───────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function FilmEditModal({ film, onSave, onReset, onClose }: {
  film: AdminFilm;
  onSave: (f: AdminFilm, originalTitle: string) => Promise<void>;
  onReset: (f: AdminFilm) => void;
  onClose: () => void;
}) {
  const originalTitle = film.title;
  const [draft, setDraft] = useState({ ...film });
  const set = (key: keyof AdminFilm, value: unknown) => setDraft(p => ({ ...p, [key]: value }));

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState('');
  const [coverCompressing, setCoverCompressing] = useState(false);

  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState('');
  const [backdropCompressing, setBackdropCompressing] = useState(false);
  const backdropInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Derive suggested deployment filename from the numeric movie id in the admin film id string.
  const numericId = film.id.replace('movie-', '');
  const suggestedFilename = `poster-${numericId}.jpg`;
  const suggestedPath = `/posters/${suggestedFilename}`;

  // Pre-populate if the current thumbnail is already a committed path (not base64, not picsum).
  const [staticPath, setStaticPath] = useState<string>(() => {
    const t = film.thumbnail;
    if (t && !t.startsWith('data:') && !t.includes('picsum.photos')) return t;
    return '';
  });

  const handleDownloadImage = () => {
    const src = coverPreview ?? (draft.thumbnail?.startsWith('data:') ? draft.thumbnail : null);
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = suggestedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [trailerTestUrl, setTrailerTestUrl] = useState<string | null>(draft.trailerUrl ?? null);
  const [trailerStatus, setTrailerStatus] = useState<'idle' | 'found' | 'not-found'>('idle');

  // Trailer file upload state (for uploading to Supabase Storage)
  const trailerInputRef = useRef<HTMLInputElement>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [trailerUploadStatus, setTrailerUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCoverError('Please upload a JPG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }
    setCoverCompressing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      try {
        // Compress to max 400×600 JPEG 75% before storing — keeps base64 under ~100 KB
        // so localStorage writes always succeed (5 MB limit).
        const compressed = await compressPosterImage(raw);
        setCoverPreview(compressed);
        setStaticPath('');
        set('thumbnail', compressed);
      } catch {
        setCoverError('Image processing failed. Please try a different file.');
      } finally {
        setCoverCompressing(false);
      }
    };
    reader.onerror = () => {
      setCoverError('Could not read the file. Please try again.');
      setCoverCompressing(false);
    };
    reader.readAsDataURL(file);
  };


  const handleBackdropUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackdropError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setBackdropError('Please upload a JPG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }
    setBackdropCompressing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      try {
        const compressed = await compressBackdropImage(raw);
        setBackdropPreview(compressed);
        set('backdropUrl', compressed);
      } catch {
        setBackdropError('Image processing failed. Please try a different file.');
      } finally {
        setBackdropCompressing(false);
      }
    };
    reader.onerror = () => {
      setBackdropError('Could not read the file. Please try again.');
      setBackdropCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (coverCompressing || backdropCompressing || saving) return;
    setSaving(true);
    setSaveError('');

    let finalDraft = { ...draft };

    // 1. Static path overrides everything — use as-is (resolves from Vercel CDN)
    if (staticPath.trim()) {
      finalDraft = { ...finalDraft, thumbnail: staticPath.trim() };
    } else if (finalDraft.thumbnail?.startsWith('data:')) {
      // 2. Upload base64 cover to Supabase Storage → replace with public URL
      try {
        const filmKey = film.id.replace(/[^a-z0-9]/gi, '-');
        const publicUrl = await uploadCover(filmKey, finalDraft.thumbnail);
        finalDraft = { ...finalDraft, thumbnail: publicUrl };
      } catch (err) {
        setSaveError(`Cover upload failed: ${err instanceof Error ? err.message : String(err)}`);
        setSaving(false);
        return;
      }
    }

    // 3. Upload backdrop image to Supabase Storage if one was selected
    if (finalDraft.backdropUrl?.startsWith('data:')) {
      try {
        const filmKey = film.id.replace(/[^a-z0-9]/gi, '-');
        const publicUrl = await uploadBackdrop(filmKey, finalDraft.backdropUrl);
        finalDraft = { ...finalDraft, backdropUrl: publicUrl };
      } catch (err) {
        setSaveError(`Backdrop upload failed: ${err instanceof Error ? err.message : String(err)}`);
        setSaving(false);
        return;
      }
    }

    // 4. Upload trailer file to Supabase Storage if one was selected
    if (trailerFile) {
      try {
        const filmKey = film.id.replace(/[^a-z0-9]/gi, '-');
        setTrailerUploadStatus('uploading');
        const publicUrl = await uploadTrailer(filmKey, trailerFile);
        finalDraft = { ...finalDraft, trailerUrl: publicUrl };
        setTrailerUploadStatus('done');
      } catch (err) {
        setSaveError(`Trailer upload failed: ${err instanceof Error ? err.message : String(err)}`);
        setTrailerUploadStatus('error');
        setSaving(false);
        return;
      }
    }

    try {
      await onSave(finalDraft, originalTitle);
      setSaving(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setSaving(false);
      return;
    }
  };

  return (
    <Modal title={`Edit: ${film.title}`} onClose={onClose}>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* ── Cover Photo ── */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Cover Photo / Poster</p>
          <div className="flex gap-4 items-start">
            <div className="flex-none relative">
              {(coverPreview ?? draft.thumbnail) ? (
                <img
                  src={coverPreview ?? draft.thumbnail}
                  alt="Cover preview"
                  className="h-28 w-20 rounded-xl object-cover bg-slate-700"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="h-28 w-20 rounded-xl bg-slate-700 flex items-center justify-center">
                  <span className="text-slate-500 text-xs">No image</span>
                </div>
              )}
              {coverPreview && !coverCompressing && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5">NEW</span>
              )}
              {coverCompressing && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">...</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverUpload}
                disabled={coverCompressing}
                className="hidden"
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverCompressing}
                className="rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-600 transition w-full text-left disabled:opacity-50"
              >
                {coverCompressing ? 'Processing image…' : 'Upload new cover photo'}
              </button>
              {(coverPreview || draft.thumbnail?.startsWith('data:')) && !coverCompressing && (
                <button
                  onClick={handleDownloadImage}
                  className="rounded-xl bg-brand-purple/10 border border-brand-purple/30 px-3 py-2 text-sm text-brand-purple hover:bg-brand-purple/20 transition w-full text-left"
                >
                  ↓ Download for deployment ({suggestedFilename})
                </button>
              )}
              <p className="text-xs text-slate-500">JPG, PNG, WebP accepted — resized to 400×600 for storage</p>
              {coverError && <p className="text-xs text-red-400">{coverError}</p>}
            </div>
          </div>

          {/* Static deployment path — works on all devices once file is committed */}
          <div className="rounded-lg bg-slate-900/60 border border-slate-700 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.12em]">Static poster path (cross-device)</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Uploaded covers are stored in this browser only.
              To show the same image on all devices: download above → place in{' '}
              <span className="font-mono text-slate-400">public/posters/</span> → commit &amp; deploy → enter the path below.
            </p>
            <input
              type="text"
              value={staticPath}
              onChange={e => setStaticPath(e.target.value)}
              placeholder={suggestedPath}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none focus:border-brand-purple placeholder:text-slate-600"
            />
            {staticPath && (
              <p className="text-[11px] text-emerald-400">
                ✓ On save, this path replaces the base64 thumbnail — resolves from Vercel CDN on all devices.
              </p>
            )}
          </div>
        </div>

        {/* ── Backdrop / Hero Image ── */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Backdrop / Hero Image</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Wide 16:9 image shown in the homepage hero. Separate from the poster.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-none relative">
              {(backdropPreview ?? draft.backdropUrl) && !String(backdropPreview ?? draft.backdropUrl).includes('picsum.photos') ? (
                <img
                  src={backdropPreview ?? draft.backdropUrl}
                  alt="Backdrop preview"
                  className="h-16 w-28 rounded-xl object-cover bg-slate-700"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="h-16 w-28 rounded-xl bg-slate-700 flex items-center justify-center">
                  <span className="text-slate-500 text-[10px]">No backdrop</span>
                </div>
              )}
              {backdropPreview && !backdropCompressing && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5">NEW</span>
              )}
              {backdropCompressing && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">...</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={backdropInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBackdropUpload}
                disabled={backdropCompressing}
                className="hidden"
              />
              <button
                onClick={() => backdropInputRef.current?.click()}
                disabled={backdropCompressing}
                className="rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-600 transition w-full text-left disabled:opacity-50"
              >
                {backdropCompressing ? 'Processing image…' : 'Upload backdrop image (16:9)'}
              </button>
              <p className="text-xs text-slate-500">JPG, PNG, WebP — resized to 1280×720. Use a wide landscape photo.</p>
              {backdropError && <p className="text-xs text-red-400">{backdropError}</p>}
            </div>
          </div>
        </div>

        {/* ── Trailer ── */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Trailer</p>

          {/* Upload to Supabase Storage */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Upload Trailer File</label>
            <input
              ref={trailerInputRef}
              type="file"
              accept="video/mp4,video/webm,video/mov,video/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0] ?? null;
                setTrailerFile(f);
                setTrailerUploadStatus('idle');
                // Show a local blob preview immediately
                if (f) {
                  const blobUrl = URL.createObjectURL(f);
                  setTrailerTestUrl(blobUrl);
                  setTrailerStatus('idle');
                }
              }}
            />
            <button
              type="button"
              onClick={() => trailerInputRef.current?.click()}
              className="w-full rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-600 transition text-left"
            >
              {trailerFile ? `✓ ${trailerFile.name}` : 'Choose video file…'}
            </button>
            {trailerFile && (
              <p className="mt-1 text-[11px] text-brand-purple">
                {trailerUploadStatus === 'idle' && 'Will upload to Supabase Storage on Save.'}
                {trailerUploadStatus === 'uploading' && '⏳ Uploading…'}
                {trailerUploadStatus === 'done' && '✓ Uploaded — public URL saved.'}
                {trailerUploadStatus === 'error' && '✗ Upload failed — check console.'}
              </p>
            )}
          </div>

          {/* Manual URL field (for existing paths or external URLs) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Trailer URL (manual)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft.trailerUrl ?? ''}
                onChange={e => {
                  set('trailerUrl', e.target.value || undefined);
                  setTrailerTestUrl(null);
                  setTrailerStatus('idle');
                  setTrailerFile(null);
                }}
                placeholder="/trailers/parallax-station.mp4"
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => { if (draft.trailerUrl) setTrailerTestUrl(draft.trailerUrl); }}
                disabled={!draft.trailerUrl}
                className="rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-600 transition whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Test
              </button>
            </div>
            {trailerStatus === 'found' && <p className="mt-1 text-xs text-emerald-400 font-semibold">✓ Trailer Found</p>}
            {trailerStatus === 'not-found' && <p className="mt-1 text-xs text-red-400">✗ Not found — check path</p>}
          </div>

          {trailerTestUrl && (
            <video
              key={trailerTestUrl}
              src={trailerTestUrl}
              controls
              playsInline
              preload="metadata"
              onCanPlay={() => setTrailerStatus('found')}
              onError={() => setTrailerStatus('not-found')}
              className="w-full rounded-xl bg-slate-900"
              style={{ maxHeight: '160px' }}
            />
          )}
        </div>

        {/* ── Text fields ── */}
        {[
          { label: 'Title', key: 'title' as const, type: 'text' },
          { label: 'Subtitle', key: 'subtitle' as const, type: 'text' },
          { label: 'Genre', key: 'genre' as const, type: 'text' },
          { label: 'Tags', key: 'tags' as const, type: 'text' },
          { label: 'Duration', key: 'duration' as const, type: 'text' },
          { label: 'Release Year', key: 'releaseYear' as const, type: 'number' },
          { label: 'Price ($)', key: 'price' as const, type: 'number' },
          { label: 'Rating', key: 'rating' as const, type: 'text' },
          { label: 'Moderation Notes', key: 'moderationNotes' as const, type: 'text' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={draft[f.key] as string | number}
              onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Description</label>
          <textarea
            rows={3}
            value={draft.description}
            onChange={e => set('description', e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Status</label>
          <select
            value={draft.status}
            onChange={e => set('status', e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple"
          >
            {['Approved', 'Pending Review', 'Rejected', 'Suspended', 'Draft'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          {([['featured', 'Featured'], ['trending', 'Trending'], ['newRelease', 'New Release'], ['visible', 'Visible']] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={e => set(key, e.target.checked)}
                className="rounded border-slate-600 accent-brand-purple"
              />
              {label}
            </label>
          ))}
        </div>
        {saveError && (
          <p className="text-xs text-red-400 rounded-lg bg-red-500/10 px-3 py-2">{saveError}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition">Cancel</button>
          <button
            onClick={() => { if (window.confirm('Reset this film to its original data? All edits will be lost.')) onReset(film); }}
            className="flex-1 rounded-xl border border-red-700 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-900/30 transition"
          >
            Reset to Original
          </button>
          <button
            onClick={handleSave}
            disabled={coverCompressing || backdropCompressing || saving}
            className="flex-1 rounded-xl bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo transition disabled:opacity-50"
          >
            {coverCompressing || backdropCompressing ? 'Compressing…' : saving ? 'Uploading…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────

type BtnColor = 'blue' | 'green' | 'red' | 'amber' | 'purple';
const btnCls: Record<BtnColor, string> = {
  blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  red: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
  amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  purple: 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20',
};

function ActionBtn({ onClick, color, children }: { onClick: () => void; color: BtnColor; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${btnCls[color]}`}>
      {children}
    </button>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV: { key: AdminSection; label: string; emoji: string }[] = [
  { key: 'dashboard', label: 'Dashboard', emoji: '◆' },
  { key: 'overview', label: 'Overview', emoji: '◈' },
  { key: 'creators', label: 'Creators', emoji: '◉' },
  { key: 'movies', label: 'Movies', emoji: '▷' },
  { key: 'moderation', label: 'Moderation', emoji: '◻' },
  { key: 'payouts', label: 'Payouts', emoji: '◈' },
  { key: 'subscriptions', label: 'Subscriptions', emoji: '★' },
  { key: 'reports', label: 'Reports', emoji: '▦' },
  { key: 'settings', label: 'Settings', emoji: '◌' },
  { key: 'auditlog', label: 'Audit Log', emoji: '≡' },
];

// ── Admin film init ───────────────────────────────────────────────────────────
// Build the complete admin film list from a Movie[] array.
// Source of truth for display fields: the movies array (from Supabase or local fallback).
// Source of truth for admin-only fields: localStorage → sensible defaults.
// A catalog film with no stored admin metadata is Approved and visible — that is
// the real state of the live catalog — and carries no purchases or revenue,
// because none have been recorded.
function buildAdminFilmsFromMovies(mergedMovies: Movie[]): AdminFilm[] {
  const storedFilms = loadAdminFilms() ?? [];

  return mergedMovies.map(m => {
    const meta = storedFilms.find(af => af.title.toLowerCase() === m.title.toLowerCase());

    return {
      id:              meta?.id ?? `movie-${m.id}`,
      title:           m.title,
      subtitle:        m.subtitle,
      description:     m.description,
      genre:           m.genre,
      tags:            Array.isArray(m.tags) ? m.tags.join(', ') : (meta?.tags ?? ''),
      duration:        m.duration,
      releaseYear:     m.releaseYear ?? meta?.releaseYear ?? 2025,
      price:           m.price,
      thumbnail:       m.thumbnail,
      rating:          m.rating,
      creatorId:       meta?.creatorId ?? `creator-${m.creator.toLowerCase().replace(/\s+/g, '-')}`,
      creatorName:     meta?.creatorName ?? m.creator,
      studioName:      meta?.studioName ?? m.creator,
      status:          meta?.status ?? 'Approved',
      featured:        m.featured ?? meta?.featured ?? false,
      trending:        meta?.trending ?? false,
      newRelease:      meta?.newRelease ?? false,
      visible:         meta?.visible ?? true,
      views:           m.views ?? meta?.views ?? 0,
      purchases:       meta?.purchases ?? 0,
      revenue:         meta?.revenue ?? 0,
      uploadDate:      meta?.uploadDate ?? `${m.releaseYear ?? 2025}-01-01`,
      moderationNotes: meta?.moderationNotes ?? '',
      trailerUrl:      m.trailerUrl,
      backdropUrl:     m.backdropUrl,
    };
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { movies: liveMovies, refreshMovies } = useMovies();

  // Auth guard — the stored token is only trusted after the server revalidates
  // its signature and expiry. Missing, expired, forged or edited → back to login.
  const [authState, setAuthState] = useState<'checking' | 'ok'>('checking');
  useEffect(() => {
    let cancelled = false;
    const reject = () => {
      clearAdminSession();
      if (!cancelled) navigate('/superadmin', { replace: true });
    };

    const session = loadAdminSession();
    if (!session?.token || (session.expiresAt && session.expiresAt <= Date.now())) {
      reject();
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.token }),
        });
        const data = await res.json().catch(() => ({ valid: false }));
        if (cancelled) return;
        if (res.ok && data.valid === true) setAuthState('ok');
        else reject();
      } catch {
        // Can't confirm the session → fail closed.
        if (!cancelled) reject();
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  const [section, setSection] = useState<AdminSection>('dashboard');
  // Creators, payouts and the audit log have no backing store yet — they start
  // empty and only fill with what actually happens in this console.
  const [creators, setCreators] = useState<AdminCreator[]>([]);
  const [films, setFilms] = useState<AdminFilm[]>([]);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<AdminCreator | null>(null);
  const [editingCreator, setEditingCreator] = useState<AdminCreator | null>(null);
  const [editingFilm, setEditingFilm] = useState<AdminFilm | null>(null);

  // Load movies from Supabase on mount, then build admin film list.
  useEffect(() => {
    setFilmsLoading(true);
    getMovies()
      .then(movies => setFilms(buildAdminFilmsFromMovies(movies)))
      .catch(() => setFilms(buildAdminFilmsFromMovies(getMergedMovies())))
      .finally(() => setFilmsLoading(false));
  }, []);

  // Persist admin-only metadata (status, flags, revenue) to localStorage.
  // Strip base64 thumbnails — those are transient upload previews.
  useEffect(() => {
    if (filmsLoading) return;
    saveAdminFilms(films.map(af => ({
      ...af,
      thumbnail: af.thumbnail?.startsWith('data:') ? '' : af.thumbnail,
    })));
  }, [films, filmsLoading]);

  // No historical metrics are collected yet — the reporting charts render an
  // honest empty state rather than an axis with nothing on it.
  const metrics: MonthlyMetric[] = [];
  const stats = useMemo(
    () => computeStats(creators, films, payouts, settings, liveMovies),
    [creators, films, payouts, settings, liveMovies],
  );

  // Audit helper
  const addAudit = (action: string, target: string, targetType: AuditLogEntry['targetType'], details: string) => {
    setAuditLog(prev => [{
      id: 'a-' + Date.now(),
      timestamp: new Date().toISOString(),
      action, target, targetType,
      performedBy: 'YouMakeTV',
      details,
    }, ...prev]);
  };

  // Creator handlers
  const verifyCreator = (id: string) => {
    const c = creators.find(x => x.id === id);
    setCreators(p => p.map(x => x.id === id ? { ...x, verified: true, kycCompleted: true, status: 'Active' } : x));
    if (selectedCreator?.id === id) setSelectedCreator(p => p ? { ...p, verified: true, kycCompleted: true, status: 'Active' } : p);
    addAudit('Verified creator', c?.studioName ?? '', 'creator', 'KYC reviewed and account activated.');
  };
  const suspendCreator = (id: string) => {
    const c = creators.find(x => x.id === id);
    setCreators(p => p.map(x => x.id === id ? { ...x, status: 'Suspended' } : x));
    if (selectedCreator?.id === id) setSelectedCreator(p => p ? { ...p, status: 'Suspended' } : p);
    addAudit('Suspended creator', c?.studioName ?? '', 'creator', 'Account suspended.');
  };
  const reactivateCreator = (id: string) => {
    const c = creators.find(x => x.id === id);
    setCreators(p => p.map(x => x.id === id ? { ...x, status: 'Active' } : x));
    if (selectedCreator?.id === id) setSelectedCreator(p => p ? { ...p, status: 'Active' } : p);
    addAudit('Reactivated creator', c?.studioName ?? '', 'creator', 'Account reactivated.');
  };
  const deleteCreator = (id: string) => {
    const c = creators.find(x => x.id === id);
    setCreators(p => p.filter(x => x.id !== id));
    if (selectedCreator?.id === id) setSelectedCreator(null);
    addAudit('Deleted creator', c?.studioName ?? '', 'creator', 'Account permanently deleted.');
  };
  const saveCreatorEdit = (updated: AdminCreator) => {
    setCreators(p => p.map(x => x.id === updated.id ? updated : x));
    if (selectedCreator?.id === updated.id) setSelectedCreator(updated);
    addAudit('Edited creator', updated.studioName, 'creator', 'Profile updated.');
    setEditingCreator(null);
  };

  // Film handlers
  const resolveMovieId = (film: AdminFilm, originalTitle?: string): number | null => {
    const idMatch = /^movie-(\d+)$/.exec(film.id);
    if (idMatch) return Number(idMatch[1]);

    const lookupTitle = (originalTitle ?? film.title).toLowerCase();
    const liveMovie = liveMovies.find(m => m.title.toLowerCase() === lookupTitle)
      ?? liveMovies.find(m => m.title.toLowerCase() === film.title.toLowerCase());
    return liveMovie?.id ?? null;
  };

  const approveFilm = async (id: string) => {
    const f = films.find(x => x.id === id);
    try {
      const movieId = f ? resolveMovieId(f) : null;
      if (movieId === null) throw new Error(`No live movie found for admin id "${id}".`);
      await patchMovie(movieId, { status: 'Approved', visible: true });
    } catch (err) {
      addAudit('Failed to approve film', f?.title ?? id, 'movie', `Film approval did not persist: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setFilms(p => p.map(x => x.id === id ? { ...x, status: 'Approved', visible: true } : x));
    addAudit('Approved film', f?.title ?? '', 'movie', 'Film approved for distribution.');
    await refreshMovies();
  };
  const rejectFilm = async (id: string) => {
    const f = films.find(x => x.id === id);
    try {
      const movieId = f ? resolveMovieId(f) : null;
      if (movieId === null) throw new Error(`No live movie found for admin id "${id}".`);
      await patchMovie(movieId, { status: 'Rejected', visible: false });
    } catch (err) {
      addAudit('Failed to reject film', f?.title ?? id, 'movie', `Film rejection did not persist: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setFilms(p => p.map(x => x.id === id ? { ...x, status: 'Rejected', visible: false } : x));
    addAudit('Rejected film', f?.title ?? '', 'movie', 'Film rejected during review.');
    await refreshMovies();
  };
  const suspendFilm = async (id: string) => {
    const f = films.find(x => x.id === id);
    try {
      const movieId = f ? resolveMovieId(f) : null;
      if (movieId === null) throw new Error(`No live movie found for admin id "${id}".`);
      await patchMovie(movieId, { status: 'Suspended', visible: false });
    } catch (err) {
      addAudit('Failed to suspend film', f?.title ?? id, 'movie', `Film suspension did not persist: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setFilms(p => p.map(x => x.id === id ? { ...x, status: 'Suspended', visible: false } : x));
    addAudit('Suspended film', f?.title ?? '', 'movie', 'Film suspended.');
    await refreshMovies();
  };
  const featureFilm = async (id: string) => {
    const f = films.find(x => x.id === id);
    const nf = !f?.featured;
    try {
      const movieId = f ? resolveMovieId(f) : null;
      if (movieId === null) throw new Error(`No live movie found for admin id "${id}".`);
      await patchMovie(movieId, { featured: nf });
    } catch (err) {
      addAudit('Failed to change featured film', f?.title ?? id, 'movie', `Featured status did not persist: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setFilms(p => p.map(x => x.id === id ? { ...x, featured: nf } : x));
    addAudit(nf ? 'Featured film' : 'Unfeatured film', f?.title ?? '', 'movie', `Featured status changed to ${nf}.`);
    await refreshMovies();
  };
  const deleteFilm = (id: string) => {
    const f = films.find(x => x.id === id);
    setFilms(p => p.filter(x => x.id !== id));
    addAudit('Deleted film', f?.title ?? '', 'movie', 'Film permanently deleted.');
  };
  const saveFilmEdit = async (updated: AdminFilm, originalTitle?: string) => {
    const movieId = resolveMovieId(updated, originalTitle);
    const liveMovie = movieId === null ? undefined : liveMovies.find(m => m.id === movieId);
    if (!liveMovie) {
      throw new Error(`No live movie found for admin id "${updated.id}".`);
    }

    const genres = Array.isArray(liveMovie.genres) && liveMovie.genres.some(genre => typeof genre === 'string' && genre.trim())
      ? [...liveMovie.genres]
      : [updated.genre];
    if (updated.genre !== liveMovie.genre) {
      const primaryGenreIndex = genres.indexOf(liveMovie.genre);
      if (primaryGenreIndex >= 0) genres[primaryGenreIndex] = updated.genre;
    }

    const movieUpdate: Movie = {
      ...liveMovie,
      title: updated.title,
      subtitle: updated.subtitle ?? '',
      description: updated.description ?? '',
      genre: updated.genre,
      genres,
      duration: updated.duration,
      creator: updated.studioName,
      price: updated.price,
      thumbnail: updated.thumbnail,
      rating: updated.rating,
      tags: updated.tags ? updated.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      releaseYear: updated.releaseYear,
      featured: updated.featured,
      trailerUrl: updated.trailerUrl,
      backdropUrl: updated.backdropUrl,
    };

    await upsertMovie(movieUpdate, updated.status);
    await refreshMovies();

    // Keep localStorage overlay in sync for backward compat
    applyAdminFilmToMovieStore(updated, originalTitle);
    setFilms(p => p.map(x => x.id === updated.id ? updated : x));
    addAudit('Edited film', updated.title, 'movie', 'Film metadata updated.');
    setEditingFilm(null);
  };

  const resetFilmToOriginal = (film: AdminFilm) => {
    // Remove the public movie override (restores raw catalog values)
    const sourceMovie = sourceMovies.find(
      m => m.title.toLowerCase() === film.title.toLowerCase() ||
           m.id === parseInt(film.id.replace('movie-', ''))
    );
    if (sourceMovie) resetMovieOverride(sourceMovie.id);

    // Restore the film's display fields from the source catalog entry
    if (sourceMovie) {
      setFilms(p => p.map(x => x.id === film.id ? {
        ...x,
        title: sourceMovie.title,
        subtitle: sourceMovie.subtitle,
        description: sourceMovie.description,
        genre: sourceMovie.genre,
        duration: sourceMovie.duration,
        price: sourceMovie.price,
        thumbnail: sourceMovie.thumbnail,
        rating: sourceMovie.rating,
        releaseYear: sourceMovie.releaseYear ?? x.releaseYear,
        trailerUrl: sourceMovie.trailerUrl,
        tags: Array.isArray(sourceMovie.tags) ? sourceMovie.tags.join(', ') : x.tags,
        status: 'Approved',
        featured: sourceMovie.featured ?? false,
        moderationNotes: '',
      } : x));
    }
    addAudit('Reset film to original', film.title, 'movie', 'Film reset to original catalog data.');
    setEditingFilm(null);
  };

  // Payout handlers
  const markPayoutPaid = (id: string) => {
    const p = payouts.find(x => x.id === id);
    if (!p || p.pending === 0) return;
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    setPayouts(prev => prev.map(x => x.id === id ? { ...x, totalPaid: x.totalPaid + x.pending, lastPayoutAmount: x.pending, lastPayoutDate: now, pending: 0 } : x));
    addAudit('Marked payout paid', p.studioName, 'payout', `Payout of ${fmt$(p.pending)} processed.`);
  };
  const holdPayout = (id: string) => {
    const p = payouts.find(x => x.id === id);
    setPayouts(prev => prev.map(x => x.id === id ? { ...x, status: 'On Hold' } : x));
    addAudit('Held payout', p?.studioName ?? '', 'payout', 'Payout placed on hold.');
  };
  const releasePayout = (id: string) => {
    const p = payouts.find(x => x.id === id);
    setPayouts(prev => prev.map(x => x.id === id ? { ...x, status: 'Ready' } : x));
    addAudit('Released payout', p?.studioName ?? '', 'payout', 'Payout hold released.');
  };

  const saveSettings = (s: PlatformSettings) => {
    setSettings(s);
    addAudit('Updated settings', 'Platform Settings', 'settings', 'Platform settings updated.');
  };

  const handleLogout = () => {
    addAudit('Logout', 'Super Admin', 'auth', 'Admin session ended.');
    clearAdminSession();
    navigate('/superadmin');
  };

  const pendingModCount = films.filter(f => f.status === 'Pending Review').length;
  const readyPayoutCount = payouts.filter(p => p.status === 'Ready' && p.pending > 0).length;

  // Hold the console back until the server has confirmed the session, so an
  // unauthenticated visitor never sees admin UI (all hooks above already ran).
  if (authState !== 'ok') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-500">
        Verifying session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden" style={{ height: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-none bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">YouMakeTV</p>
          <p className="text-sm font-bold text-white mt-0.5">Super Admin</p>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); setSelectedCreator(null); setSearch(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                section === item.key ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-xs opacity-60 font-mono">{item.emoji}</span>
              <span className="flex-1">{item.label}</span>
              {item.key === 'moderation' && pendingModCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">{pendingModCount}</span>
              )}
              {item.key === 'payouts' && readyPayoutCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-white">{readyPayoutCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <span className="text-xs">→</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex-none">
          <input
            type="text"
            placeholder="Search creators, movies, studios…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 max-w-sm rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-purple"
          />
          <div className="flex items-center gap-2 ml-auto text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-slate-400">YouMakeTV</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-bold">Super Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard' && (
            <DashboardSection
              movies={liveMovies}
              creators={creators}
              loading={filmsLoading}
            />
          )}

          {section === 'overview' && <OverviewSection stats={stats} metrics={metrics} />}

          {section === 'creators' && (
            <CreatorsSection
              creators={creators}
              search={search}
              selectedCreator={selectedCreator}
              onSelect={setSelectedCreator}
              onEdit={setEditingCreator}
              onVerify={verifyCreator}
              onSuspend={suspendCreator}
              onReactivate={reactivateCreator}
              onDelete={deleteCreator}
            />
          )}

          {section === 'movies' && (
            <MoviesSection
              films={films}
              search={search}
              onEdit={setEditingFilm}
              onApprove={approveFilm}
              onReject={rejectFilm}
              onSuspend={suspendFilm}
              onFeature={featureFilm}
              onDelete={deleteFilm}
            />
          )}

          {section === 'moderation' && (
            <ModerationSection
              films={films}
              onApprove={approveFilm}
              onReject={rejectFilm}
              onSuspend={suspendFilm}
            />
          )}

          {section === 'payouts' && (
            <PayoutsSection
              payouts={payouts}
              onMarkPaid={markPayoutPaid}
              onHold={holdPayout}
              onRelease={releasePayout}
            />
          )}

          {section === 'subscriptions' && (
            <SubscriptionsSection settings={settings} onSave={saveSettings} />
          )}

          {section === 'reports' && (
            <ReportsSection metrics={metrics} creators={creators} films={films} />
          )}

          {section === 'settings' && (
            <SettingsSection settings={settings} onSave={saveSettings} />
          )}

          {section === 'auditlog' && <AuditLogSection entries={auditLog} />}
        </main>
      </div>

      {/* Modals */}
      {editingCreator && <CreatorEditModal creator={editingCreator} onSave={saveCreatorEdit} onClose={() => setEditingCreator(null)} />}
      {editingFilm && <FilmEditModal film={editingFilm} onSave={saveFilmEdit} onReset={resetFilmToOriginal} onClose={() => setEditingFilm(null)} />}
    </div>
  );
}
