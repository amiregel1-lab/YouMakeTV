import { useMemo, useState } from 'react';
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
              Complete onboarding to start tracking films, views, and earnings. You can also explore a demo creator workspace.
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

  const totalFilms = creator.films.length;
  const trailerViews = creator.films.reduce((sum, film) => sum + film.trailerViews, 0);
  const paidWatches = creator.films.reduce((sum, film) => sum + film.paidWatches, 0);
  const freeWatches = creator.films.reduce((sum, film) => sum + film.freeWatches, 0);
  const totalViews = creator.films.reduce((sum, film) => sum + film.views, 0) + trailerViews;
  const totalRevenue = creator.films.reduce((sum, film) => sum + film.price * film.paidWatches, 0);
  const totalCreatorEarnings = creator.films.reduce((sum, film) => {
    const share = film.paidWatches > 500 ? 0.4 : 0.3;
    return sum + film.price * film.paidWatches * share;
  }, 0);
  const totalPlatformFee = Math.max(0, totalRevenue - totalCreatorEarnings);
  const pendingPayout = Math.round(totalCreatorEarnings * 0.35 * 100) / 100;
  const averageWatchPrice = paidWatches ? totalRevenue / paidWatches : 0;
  const conversionRate = trailerViews ? Math.round((paidWatches / trailerViews) * 100) : 0;

  const metrics = [
    { label: 'Total films uploaded', value: totalFilms.toString() },
    { label: 'Total views', value: formatNumber(totalViews) },
    { label: 'Trailer views', value: formatNumber(trailerViews) },
    { label: 'Paid watches', value: formatNumber(paidWatches) },
    { label: 'Free watches', value: formatNumber(freeWatches) },
    { label: 'Total revenue', value: formatCurrency(totalRevenue) },
    { label: 'Estimated platform fee', value: formatCurrency(totalPlatformFee) },
    { label: 'Estimated creator earnings', value: formatCurrency(totalCreatorEarnings) },
    { label: 'Pending payout', value: formatCurrency(pendingPayout) },
    { label: 'Average watch price', value: formatCurrency(averageWatchPrice) },
    { label: 'Trailer-to-paid conversion', value: `${conversionRate}%` },
  ];

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative rounded-[2.5rem] bg-brand-fade/40 p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-brand-purple">Welcome back</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">{creator.studioName} creator studio</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">Your account is verified and ready to manage films, pricing, and performance.</p>
              <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-950 ring-1 ring-brand-purple/20">
                <span className="h-2 w-2 rounded-full bg-brand-cyan" /> Verified creator
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload New Film
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                View public creator page
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Payouts coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {creator.films.length === 0 ? (
        <CreatorEmptyState onUpload={() => setIsUploadOpen(true)} onGuidelines={() => window.alert('Upload guidelines are coming soon for creators.')} />
      ) : (
        <>
          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <AnalyticsCards metrics={metrics.slice(0, 4)} />
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <AnalyticsCards metrics={metrics.slice(4, 8)} />
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <CreatorAnalytics creator={creator} />
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Film management</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your uploaded films</h2>
              </div>
            </div>
            <div className="mt-6">
              <FilmPerformanceTable films={creator.films} onViewAnalytics={setSelectedFilm} onDelete={(film) => onDeleteFilm(film.id)} />
            </div>
          </section>
        </>
      )}

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
