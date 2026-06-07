import { Movie } from '../types';
import { formatCurrency } from '../lib/formatters';
import MovieGrid from './MovieGrid';
import { movieSections } from '../data/mockData';
import { useState, useMemo } from 'react';

interface ViewerHomeProps {
  movies: Movie[];
  viewer?: { username: string; premium: boolean } | null;
  onSelectMovie: (movieId: number) => void;
  onOpenPurchase: () => void;
  onWatchTrailer: () => void;
}

export default function ViewerHome({ movies, viewer, onSelectMovie, onOpenPurchase, onWatchTrailer }: ViewerHomeProps) {
  const [maxPrice, setMaxPrice] = useState(10);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const featured = movies.find((movie) => movie.id === 0) ?? movies[0];

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value);
    setMaxPrice(numValue);
  };

  const coreGenres = [
    'Action',
    'Adventure',
    'Sci-Fi',
    'Fantasy',
    'Drama',
    'Comedy',
    'Romance',
    'Thriller',
    'Horror',
    'Mystery',
    'Crime',
    'Documentary',
    'Animation',
    'Anime',
    'Family',
  ];

  const genreClassMap: Record<string, string> = {
    Action: 'border-red-500 text-red-500',
    Adventure: 'border-amber-500 text-amber-500',
    'Sci-Fi': 'border-brand-cyan text-brand-cyan',
    Fantasy: 'border-indigo-500 text-indigo-500',
    Drama: 'border-slate-400 text-slate-600',
    Comedy: 'border-yellow-400 text-yellow-600',
    Romance: 'border-pink-500 text-pink-500',
    Thriller: 'border-rose-600 text-rose-600',
    Horror: 'border-red-700 text-red-700',
    Mystery: 'border-violet-500 text-violet-500',
    Crime: 'border-slate-700 text-slate-700',
    Documentary: 'border-green-600 text-green-600',
    Animation: 'border-indigo-400 text-indigo-400',
    Anime: 'border-brand-purple text-brand-purple',
    Family: 'border-emerald-500 text-emerald-500',
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  // Filter movies based on price
  const filteredMovies = useMemo(() => {
    const priceLimit = maxPrice === 10 ? 9.99 : maxPrice;
    return movies.filter((movie) => {
      const withinPrice = movie.price <= priceLimit;
      if (!withinPrice) return false;
      if (selectedGenres.length === 0) return true;
      const mGenres = (movie.genres ?? [movie.genre]).map((x) => x);
      return mGenres.some((g) => selectedGenres.includes(g));
    });
  }, [movies, maxPrice, selectedGenres]);

  // Update sections to use filtered movies
  const filteredSections = movieSections
    .map((section) => ({
      ...section,
      ids: section.ids.filter((id) => filteredMovies.some((m) => m.id === id)),
    }))
    .filter((section) => section.ids.length > 0);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              YouMakeTV.ai marketplace
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your premium AI film marketplace, designed for creators and fans.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Discover AI-generated cinema with transparent creator earnings, premium subscriber savings, and a modern creator studio.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">YouMake+ savings</p>
                <p className="mt-3 text-sm text-slate-600">50% off every paid film and free films stay free.</p>
              </div>
              <div className="rounded-[1.75rem] border border-brand-cyan/20 bg-brand-cyan/5 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">Creator-first design</p>
                <p className="mt-3 text-sm text-slate-600">Manage pricing, analytics, and uploads in one streamlined marketplace.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={onOpenPurchase} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                View premium prices
              </button>
              <button onClick={onWatchTrailer} className="rounded-full border border-slate-300 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Watch trailer
              </button>
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              {viewer?.premium ? 'YouMake+ member: enjoy premium pricing everywhere in the app.' : 'Upgrade to YouMake+ for half-price access across the marketplace.'}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-glow">
            <div className="absolute inset-0 bg-brand-soft opacity-90" />
            <img src={featured.thumbnail} alt={featured.title} className="relative h-full w-full object-cover mix-blend-screen" />
            <div className="relative p-8">
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white">Featured AI film</span>
              <h2 className="mt-6 text-3xl font-semibold text-white">{featured.title}</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200">{featured.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full bg-white/10 px-3 py-2">{featured.genre}</span>
                <span className="rounded-full bg-white/10 px-3 py-2">{featured.duration}</span>
                <span className="rounded-full bg-white/10 px-3 py-2">{featured.creator}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-semibold text-slate-950">Filter by Price</h3>
              <span className="text-lg font-semibold text-brand-cyan">
                {maxPrice === 0 ? 'Free only' : maxPrice === 10 ? 'Up to $9.99' : `Up to $${maxPrice.toFixed(0)}`}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">Slide to see films within your budget</p>

            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={Math.round(maxPrice)}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-slate-200 to-brand-cyan rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(226, 232, 240) 0%, rgb(34, 197, 238) ${
                    ((Math.round(maxPrice) - 0) / (10 - 0)) * 100
                  }%, rgb(226, 232, 240) ${((Math.round(maxPrice) - 0) / (10 - 0)) * 100}%, rgb(226, 232, 240) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Free</span>
                <span>$1</span>
                <span>$2</span>
                <span>$3</span>
                <span>$4</span>
                <span>$5</span>
                <span>$6</span>
                <span>$7</span>
                <span>$8</span>
                <span>$9</span>
                <span>$9.99</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {coreGenres.map((g) => {
                  const cls = genreClassMap[g] ?? 'border-slate-300 text-slate-600';
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${cls} ${
                        active ? 'bg-opacity-20 bg-slate-100' : 'bg-white'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-950">{filteredMovies.length}</span> of{' '}
              <span className="font-semibold text-slate-950">{movies.length}</span> films
              {maxPrice < 9.99 && (
                <>
                  {' '}
                  <span className="text-brand-cyan">•</span> {movies.length - filteredMovies.length} premium films hidden
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{section.title}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{section.title}</h3>
              </div>
              <span className="rounded-full bg-brand-pink/10 px-4 py-2 text-sm font-semibold text-brand-pink">Curated by YouMakeTV.ai</span>
            </div>
            <MovieGrid
              movies={section.ids
                .map((id) => filteredMovies.find((movie) => movie.id === id))
                .filter((movie): movie is Movie => Boolean(movie))}
              viewer={viewer}
              onSelect={(movie) => onSelectMovie(movie.id)}
              onPurchase={onOpenPurchase}
            />
          </div>
        ))}
        {filteredSections.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
            <p className="text-slate-600">No films available in this price range. Try adjusting the slider.</p>
          </div>
        )}
      </section>
    </div>
  );
}
