import { Movie } from '../types';
import { useState, useMemo } from 'react';
import MovieCard from './MovieCard';

interface ViewerHomeProps {
  movies: Movie[];
  viewer?: { username: string; premium: boolean } | null;
  onSelectMovie: (movieId: number) => void;
  onOpenPurchase: () => void;
  onWatchTrailer: () => void;
}

const GENRES = [
  'Sci-Fi', 'Drama', 'Comedy', 'Action', 'Thriller',
  'Horror', 'Fantasy', 'Anime', 'Documentary', 'Mystery',
];

const PRICE_TIERS = [
  { label: 'All prices', max: 99 },
  { label: 'Free', max: 0 },
  { label: 'Under $1', max: 0.99 },
  { label: 'Under $3', max: 2.99 },
  { label: 'Under $5', max: 4.99 },
  { label: 'Under $8', max: 7.99 },
];

const genreColor: Record<string, string> = {
  'Sci-Fi': 'border-brand-cyan text-brand-cyan',
  Drama: 'border-slate-400 text-slate-600',
  Comedy: 'border-yellow-500 text-yellow-600',
  Action: 'border-red-500 text-red-500',
  Thriller: 'border-rose-600 text-rose-600',
  Horror: 'border-red-800 text-red-800',
  Fantasy: 'border-indigo-500 text-indigo-500',
  Anime: 'border-brand-purple text-brand-purple',
  Documentary: 'border-green-600 text-green-600',
  Mystery: 'border-violet-500 text-violet-500',
};

export default function ViewerHome({ movies, viewer, onSelectMovie, onOpenPurchase, onWatchTrailer }: ViewerHomeProps) {
  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState(0);
  const [memberOnly, setMemberOnly] = useState(false);

  const featured = movies.find((m) => m.featured) ?? movies[0];

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const clearFilters = () => {
    setQuery('');
    setSelectedGenres([]);
    setPriceTier(0);
    setMemberOnly(false);
  };

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedGenres.length +
    (priceTier !== 0 ? 1 : 0) +
    (memberOnly ? 1 : 0);

  const filteredMovies = useMemo(() => {
    const maxPrice = PRICE_TIERS[priceTier].max;
    const q = query.toLowerCase();
    return movies.filter((m) => {
      if (priceTier === 1 && m.price !== 0) return false;
      if (priceTier > 1 && m.price > maxPrice) return false;
      if (memberOnly && !m.subscriberDiscountEligible) return false;
      if (selectedGenres.length > 0) {
        const mg = m.genres ?? [m.genre];
        if (!mg.some((g) => selectedGenres.includes(g))) return false;
      }
      if (q) {
        return (
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.creator.toLowerCase().includes(q) ||
          (m.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movies, query, selectedGenres, priceTier, memberOnly]);

  return (
    <div className="space-y-8">

      {/* PREMIUM MEMBER BANNER */}
      {viewer?.premium && (
        <div className="rounded-[1.75rem] border border-brand-purple/30 bg-gradient-to-r from-brand-purple/10 via-brand-pink/5 to-brand-cyan/10 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-white text-sm font-bold">✓</span>
              <div>
                <p className="text-sm font-semibold text-slate-950">YouMake+ active — 50% off every paid film</p>
                <p className="text-xs text-slate-500">Signed in as <strong>{viewer.username}</strong>. Member pricing applied platform-wide.</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-purple">
              Premium member
            </span>
          </div>
        </div>
      )}

      {/* CINEMATIC HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="absolute inset-0 bg-brand-soft opacity-60 pointer-events-none" />
        <div className="relative grid gap-0 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <span className="inline-flex w-fit rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              YouMakeTV.ai
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl leading-[1.08]">
                Watch AI-generated films.<br />
                <span className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan bg-clip-text text-transparent">
                  Support the creators.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                The first creator-first marketplace for AI-generated cinema. Discover films made with Veo, Runway, Sora, and Kling.
              </p>
            </div>
            <div className="flex flex-wrap gap-5">
              {[{ value: '100+', label: 'AI films' }, { value: '10', label: 'Genres' }, { value: '42', label: 'Countries' }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-semibold text-slate-950">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={onWatchTrailer} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                ▶ Watch featured trailer
              </button>
              <button onClick={onOpenPurchase} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                Browse &amp; buy films
              </button>
            </div>
            {!viewer?.premium && (
              <p className="text-sm text-slate-500">
                Join <strong className="text-slate-950">YouMake+</strong> for $4.99/mo and get 50% off every paid film.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSelectMovie(featured.id)}
            className="group relative overflow-hidden lg:rounded-r-[2.5rem] min-h-[320px] lg:min-h-0 text-left"
          >
            <img src={featured.thumbnail} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="inline-flex rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/80 mb-2">
                Featured AI film
              </span>
              <h2 className="text-xl font-semibold text-white">{featured.title}</h2>
              <p className="mt-1 text-sm text-slate-300 line-clamp-2">{featured.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white">{featured.genre}</span>
                <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white">{featured.duration}</span>
              </div>
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs text-white font-medium">
              Tap for details →
            </div>
          </button>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
        <div className="space-y-4">

          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, genre, creator, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const cls = genreColor[g] ?? 'border-slate-300 text-slate-600';
              const active = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${cls} ${active ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'}`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Price + member row */}
          <div className="flex flex-wrap items-center gap-3">
            {PRICE_TIERS.map((tier, i) => (
              <button
                key={tier.label}
                onClick={() => setPriceTier(i)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  priceTier === i
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tier.label}
              </button>
            ))}
            <button
              onClick={() => setMemberOnly(!memberOnly)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                memberOnly
                  ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              YouMake+ eligible
            </button>

            <div className="ml-auto flex items-center gap-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-950">{filteredMovies.length}</span> of{' '}
                <span className="font-semibold text-slate-950">{movies.length}</span> films
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* UNIFIED MOVIE CATALOG */}
      <section>
        {filteredMovies.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
            <p className="text-slate-600 text-lg font-medium mb-2">No films match your filters.</p>
            <p className="text-slate-400 text-sm mb-6">Try adjusting your search, genre, or price selection.</p>
            <button onClick={clearFilters} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                viewer={viewer}
                onSelect={(m) => onSelectMovie(m.id)}
                onPurchase={onOpenPurchase}
              />
            ))}
          </div>
        )}
      </section>

      {/* PLATFORM FOOTER PITCH */}
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
        <div className="relative p-8 sm:p-12">
          <div className="absolute inset-0 bg-brand-soft opacity-50 pointer-events-none" />
          <div className="relative grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
                Creator economy
              </span>
              <h2 className="text-3xl font-semibold text-slate-950 mb-4">Are you an AI filmmaker?</h2>
              <p className="text-base leading-8 text-slate-600 max-w-xl">
                Upload your films, set your price, and build a real audience. YouMakeTV.ai handles discovery, monetization, and analytics so you can focus on creating.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-[1.5rem] border border-brand-purple/20 bg-brand-purple/5 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-purple">Creator earnings</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">30–40% revenue share</p>
                </div>
                <div className="rounded-[1.5rem] border border-brand-cyan/20 bg-brand-cyan/5 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-cyan">Tools supported</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Veo · Runway · Sora · Kling · +</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm font-semibold text-slate-950">Start your AI film studio today</p>
              <a href="/creator" className="block rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800">
                Open creator portal →
              </a>
              <a href="/subscribe" className="block rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                Learn about YouMake+
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
