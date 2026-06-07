import { CreatorFilm } from '../types';
import { formatCurrency } from '../lib/formatters';

interface FilmAnalyticsModalProps {
  film: CreatorFilm;
  onClose: () => void;
}

export default function FilmAnalyticsModal({ film, onClose }: FilmAnalyticsModalProps) {
  const conversion = film.trailerViews ? Math.round((film.paidWatches / film.trailerViews) * 100) : 0;
  const revenue = film.price * film.paidWatches;

  const sparkline = [20, 45, 35, 60, 48, 70, 88];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-700">Film analytics</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{film.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Status: {film.status} • Uploaded {film.uploadDate}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Revenue trend</p>
              <div className="mt-5 flex items-end gap-2">
                {sparkline.map((value, index) => (
                  <div key={index} className="h-24 w-full rounded-full bg-slate-200" style={{ height: `${value}%` }} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Revenue', value: formatCurrency(revenue) },
                { label: 'Conversion', value: `${conversion}%` },
                { label: 'Trailer views', value: film.trailerViews.toLocaleString() },
                { label: 'Paid watches', value: film.paidWatches.toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Audience retention</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">Your trailer is performing well, but the next step is converting views into paid watches. Add stronger payoff details to encourage purchases.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Top traffic sources</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Homepage discovery — 42%</li>
                <li>Creator profile — 28%</li>
                <li>Search & recommendations — 18%</li>
                <li>Direct links — 12%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
