import { formatCurrency, subscriberPrice } from '../lib/formatters';
import { Movie, ViewerAccount } from '../types';

interface MovieCardProps {
  movie: Movie;
  viewer?: ViewerAccount | null;
  onSelect: (movie: Movie) => void;
  onPurchase: () => void;
}

export default function MovieCard({ movie, viewer, onSelect, onPurchase }: MovieCardProps) {
  const standardPrice = formatCurrency(movie.price);
  const premiumPrice = formatCurrency(subscriberPrice(movie.price));
  const hasPremium = Boolean(viewer?.premium);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <button onClick={() => onSelect(movie)} type="button" className="relative block w-full text-left">
        <div className="overflow-hidden rounded-t-[1.75rem]">
          <img src={movie.thumbnail} alt={movie.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-semibold text-brand-pink">{movie.badge}</span>
          <div className="flex items-center gap-2">
            {(movie.genres ?? [movie.genre]).slice(0, 3).map((g) => {
              const map: Record<string, string> = {
                'Sci-Fi': 'border-brand-cyan text-brand-cyan',
                'Sci-Fi Thriller': 'border-brand-cyan text-brand-cyan',
                'Thriller': 'border-rose-600 text-rose-600',
                'Action': 'border-red-500 text-red-500',
                'Adventure': 'border-amber-500 text-amber-500',
                'Fantasy': 'border-indigo-500 text-indigo-500',
                'Drama': 'border-slate-400 text-slate-600',
                'Comedy': 'border-yellow-400 text-yellow-600',
                'Romance': 'border-pink-500 text-pink-500',
                'Horror': 'border-red-700 text-red-700',
                'Mystery': 'border-violet-500 text-violet-500',
                'Crime': 'border-slate-700 text-slate-700',
                'Documentary': 'border-green-600 text-green-600',
                'Animation': 'border-indigo-400 text-indigo-400',
                'Anime': 'border-brand-purple text-brand-purple',
                'Family': 'border-emerald-500 text-emerald-500',
                'Short': 'border-slate-300 text-slate-600',
                'Music': 'border-fuchsia-500 text-fuchsia-500',
                'Experimental': 'border-amber-300 text-amber-600',
                'Noir': 'border-slate-800 text-slate-800',
                'Art': 'border-pink-300 text-pink-600',
              };

              const cls = map[g] ?? 'border-slate-300 text-slate-600';
              return (
                <span key={g} className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${cls}`}>
                  {g}
                </span>
              );
            })}
          </div>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">{movie.duration}</div>
      </button>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 transition group-hover:text-brand-purple">{movie.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{movie.description}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Price</p>
              {movie.price === 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Free</span>
                </div>
              )}
              <div className="mt-2 flex flex-col">
                {hasPremium ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-pink-600 line-through">{standardPrice}</span>
                    <span className="text-lg font-semibold text-brand-purple">{premiumPrice}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-950">{standardPrice}</span>
                    <span className="text-sm text-slate-500">or</span>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-brand-cyan">{premiumPrice}</span>
                      <span className="text-xs text-slate-500">With premium sub</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button onClick={onPurchase} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Rent
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">{hasPremium ? 'YouMake+ pricing applied' : 'Join YouMake+ for half-price access'}</p>
        </div>
      </div>
    </article>
  );
}
