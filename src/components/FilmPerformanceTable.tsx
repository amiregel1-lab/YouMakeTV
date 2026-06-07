import { CreatorFilm } from '../types';
import { formatCurrency } from '../lib/formatters';

interface FilmPerformanceTableProps {
  films: CreatorFilm[];
  onViewAnalytics: (film: CreatorFilm) => void;
  onDelete?: (film: CreatorFilm) => void;
}

export default function FilmPerformanceTable({ films, onViewAnalytics, onDelete }: FilmPerformanceTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-slate-900">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Views</th>
            <th className="px-6 py-4">Paid watches</th>
            <th className="px-6 py-4">Revenue</th>
            <th className="px-6 py-4">Conversion</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {films.map((film) => {
            const revenue = film.price * film.paidWatches;
            const conversion = film.trailerViews ? Math.round((film.paidWatches / film.trailerViews) * 100) : 0;
            const statusStyle = film.status === 'Approved'
              ? 'bg-brand-cyan/10 text-brand-cyan'
              : film.status === 'Draft'
              ? 'bg-brand-pink/10 text-brand-pink'
              : 'bg-brand-purple/10 text-brand-purple';

            return (
              <tr key={film.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-950">{film.title}</div>
                  <div className="text-xs text-slate-500">{film.duration} • {film.category}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
                    {film.status}
                  </span>
                </td>
                <td className="px-6 py-4">{formatCurrency(film.price)}</td>
                <td className="px-6 py-4">{film.views.toLocaleString()}</td>
                <td className="px-6 py-4">{film.paidWatches.toLocaleString()}</td>
                <td className="px-6 py-4">{formatCurrency(revenue)}</td>
                <td className="px-6 py-4">{conversion}%</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => onViewAnalytics(film)} className="rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95">
                    Analytics
                  </button>
                  {onDelete ? (
                    <button onClick={() => onDelete(film)} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
