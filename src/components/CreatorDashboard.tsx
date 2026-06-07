import { useState } from 'react';
import { CreatorFilm, CreatorProfile, ViewerAccount } from '../types';
import AnalyticsCards from './AnalyticsCards';
import CreatorAnalytics from './CreatorAnalytics';
import CreatorEmptyState from './CreatorEmptyState';
import FilmAnalyticsModal from './FilmAnalyticsModal';
import FilmPerformanceTable from './FilmPerformanceTable';
import FilmUploadForm from './FilmUploadForm';
import { formatCurrency, formatNumber } from '../lib/formatters';

interface CreatorDashboardProps {
  creator: CreatorProfile | null;
  viewer?: ViewerAccount | null;
  onAddFilm: (film: CreatorFilm) => void;
  onCreateDemo: () => void;
  onStartOnboarding: () => void;
  onDeleteFilm: (filmId: string) => void;
}

export default function CreatorDashboard({ creator, viewer, onAddFilm, onCreateDemo, onStartOnboarding, onDeleteFilm }: CreatorDashboardProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<CreatorFilm | null>(null);

  if (!creator) {
    return (
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative rounded-[2.5rem] bg-brand-fade/30 p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
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
                Start onboarding
              </button>
              <button onClick={onCreateDemo} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                View demo creator workspace
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const trailerViews = creator.films.reduce((s, f) => s + f.trailerViews, 0);
  const paidWatches = creator.films.reduce((s, f) => s + f.paidWatches, 0);
  const freeWatches = creator.films.reduce((s, f) => s + f.freeWatches, 0);
  const totalViews = creator.films.reduce((s, f) => s + f.views, 0) + trailerViews;
  const totalRevenue = creator.films.reduce((s, f) => s + f.price * f.paidWatches, 0);
  const totalCreatorEarnings = creator.films.reduce((s, f) => {
    const share = f.paidWatches > 500 ? 0.4 : 0.3;
    return s + f.price * f.paidWatches * share;
  }, 0);
  const pendingPayout = Math.round(totalCreatorEarnings * 0.35 * 100) / 100;
  const conversionRate = trailerViews ? Math.round((paidWatches / trailerViews) * 100) : 0;

  const topFilm = [...creator.films].sort((a, b) => (b.price * b.paidWatches) - (a.price * a.paidWatches))[0];
  const topConvertingFilm = [...creator.films].sort((a, b) => {
    const rateA = a.trailerViews ? a.paidWatches / a.trailerViews : 0;
    const rateB = b.trailerViews ? b.paidWatches / b.trailerViews : 0;
    return rateB - rateA;
  })[0];

  const moneyMetrics = [
    { label: 'Your estimated earnings', value: formatCurrency(totalCreatorEarnings), accent: 'purple' as const, hint: 'Your share after platform fee' },
    { label: 'Pending payout', value: formatCurrency(pendingPayout), accent: 'green' as const, hint: 'Available for withdrawal' },
    { label: 'Total gross revenue', value: formatCurrency(totalRevenue), accent: 'cyan' as const },
    { label: 'Avg watch price', value: formatCurrency(paidWatches ? totalRevenue / paidWatches : 0), accent: 'default' as const },
  ];

  const viewMetrics = [
    { label: 'Total views', value: formatNumber(totalViews), accent: 'cyan' as const },
    { label: 'Paid watches', value: formatNumber(paidWatches), accent: 'purple' as const },
    { label: 'Free watches', value: formatNumber(freeWatches), accent: 'default' as const },
    { label: 'Trailer → paid conversion', value: `${conversionRate}%`, accent: conversionRate >= 10 ? 'green' as const : 'default' as const, hint: conversionRate >= 10 ? 'Strong conversion' : 'Room to grow' },
  ];

  return (
    <div className="space-y-10">

      {/* STUDIO HEADER */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative rounded-[2.5rem] bg-brand-fade/40 p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-brand-purple">Welcome back</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">{creator.studioName} creator studio</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {creator.films.length} film{creator.films.length !== 1 ? 's' : ''} · Verified creator · Analytics updated live
              </p>
              <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-950 ring-1 ring-brand-purple/20">
                <span className="h-2 w-2 rounded-full bg-brand-cyan" /> Verified creator
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + Upload new film
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                View public page
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Payouts coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {creator.films.length === 0 ? (
        <CreatorEmptyState onUpload={() => setIsUploadOpen(true)} onGuidelines={() => alert('Upload guidelines coming soon.')} />
      ) : (
        <>
          {/* MONEY CARDS */}
          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">Earnings overview</p>
            <AnalyticsCards metrics={moneyMetrics} />
          </section>

          {/* VIEW CARDS */}
          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">Audience &amp; engagement</p>
            <AnalyticsCards metrics={viewMetrics} />
          </section>

          {/* WHAT'S WORKING INSIGHT */}
          {topFilm && (
            <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold">💡</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">What's working</p>
                  <h2 className="text-lg font-semibold text-slate-950">Studio insights</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-600 mb-2">Top earning film</p>
                  <p className="font-semibold text-slate-950">{topFilm.title}</p>
                  <p className="text-2xl font-semibold text-amber-600 mt-2">{formatCurrency(topFilm.price * topFilm.paidWatches)}</p>
                  <p className="text-sm text-slate-500 mt-1">gross revenue</p>
                </div>
                {topConvertingFilm && (
                  <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600 mb-2">Best converting film</p>
                    <p className="font-semibold text-slate-950">{topConvertingFilm.title}</p>
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

          {/* CHARTS */}
          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <CreatorAnalytics creator={creator} />
          </section>

          {/* FILM TABLE */}
          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Film management</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Your uploaded films</h2>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + Upload film
              </button>
            </div>
            <FilmPerformanceTable films={creator.films} onViewAnalytics={setSelectedFilm} onDelete={(film) => onDeleteFilm(film.id)} />
          </section>
        </>
      )}

      {/* Upload modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 pt-20">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-950">Upload new film</h2>
              <button onClick={() => setIsUploadOpen(false)} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                Close
              </button>
            </div>
            <div className="mt-6">
              <FilmUploadForm
                creatorName={creator.studioName}
                onCancel={() => setIsUploadOpen(false)}
                onSubmit={(payload) => {
                  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  onAddFilm({
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
                    uploadDate: dateLabel,
                    updatedDate: dateLabel,
                  });
                  setIsUploadOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedFilm && <FilmAnalyticsModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />}
    </div>
  );
}
