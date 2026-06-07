import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { getPosterUrl, fallbackGradient } from '../lib/posters';

interface ViewerHomeProps {
  movies: Movie[];
  viewer?: { username: string; premium: boolean } | null;
  onSelectMovie: (movieId: number) => void;
  onWatchTrailer: () => void;
}

const FILTER_GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Horror', 'Comedy', 'Documentary', 'Animation', 'Fantasy', 'Thriller', 'Anime', 'Mystery'];
const SORT_OPTIONS = ['Most Popular', 'Newest', 'Highest Rated'] as const;
const PRICE_TIERS = [
  { label: 'All prices', maxPrice: Infinity },
  { label: 'Free', maxPrice: 0 },
  { label: 'Under $1', maxPrice: 0.99 },
  { label: 'Under $2', maxPrice: 1.99 },
  { label: 'Under $3', maxPrice: 2.99 },
  { label: 'Under $5', maxPrice: 4.99 },
  { label: 'Under $8', maxPrice: 7.99 },
];

// ── Arrow button used in all scroll rows ───────────────────────────────────

function ArrowBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${dir}`}
      className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 hover:shadow-md"
    >
      {dir === 'left' ? (
        <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

// ── Poster card used inside horizontal movie rows ──────────────────────────

interface PosterCardProps {
  movie: Movie;
  onSelect: () => void;
  onTrailer: () => void;
}

function PosterCard({ movie, onSelect, onTrailer }: PosterCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex-none w-28 sm:w-36 group cursor-pointer">
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-900 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
        onClick={onSelect}
      >
        {!imgError ? (
          <img
            src={getPosterUrl(movie)}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full flex flex-col items-start justify-end p-2 gap-0.5"
            style={{ background: fallbackGradient(movie.genre) }}
          >
            <p className="text-[9px] font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-2 gap-1.5 bg-slate-950/0 group-hover:bg-slate-950/75 transition-all duration-300">
          <div className="w-full space-y-1.5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); onTrailer(); }}
              className="w-full rounded-full bg-white py-1.5 text-[10px] font-semibold text-slate-950 hover:bg-slate-100 transition"
            >
              ▶ Trailer
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="w-full rounded-full border border-white/50 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 transition"
            >
              Details
            </button>
          </div>
        </div>
      </div>
      <button onClick={onSelect} className="mt-1.5 w-full text-left">
        <p className="text-xs font-semibold text-slate-950 line-clamp-1">{movie.title}</p>
      </button>
    </div>
  );
}

// ── Top-10 card with ranking number ───────────────────────────────────────

interface Top10CardProps {
  movie: Movie;
  rank: number;
  onSelect: () => void;
}

function Top10Card({ movie, rank, onSelect }: Top10CardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex-none flex items-end gap-1">
      <span
        className="select-none text-right leading-[0.85] font-black text-slate-800 flex-none"
        style={{ fontSize: 'clamp(3.5rem, 5.5vw, 5.5rem)', width: '2.8rem' }}
      >
        {rank}
      </span>
      <button onClick={onSelect} className="group w-24 sm:w-28 text-left">
        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-900 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          {!imgError ? (
            <img
              src={getPosterUrl(movie)}
              alt={movie.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full flex flex-col items-start justify-end p-2 gap-0.5"
              style={{ background: fallbackGradient(movie.genre) }}
            >
              <p className="text-[9px] font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs font-semibold text-slate-950 line-clamp-1">{movie.title}</p>
      </button>
    </div>
  );
}

// ── Horizontal movie row with scroll arrows ────────────────────────────────

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onSelectMovie: (id: number) => void;
  onWatchTrailer: () => void;
}

function MovieRow({ title, movies, onSelectMovie, onWatchTrailer }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -480 : 480, behavior: 'smooth' });
  };

  if (movies.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <div className="flex gap-1.5">
          <ArrowBtn dir="left" onClick={() => scroll('left')} />
          <ArrowBtn dir="right" onClick={() => scroll('right')} />
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {movies.map((movie) => (
          <PosterCard
            key={movie.id}
            movie={movie}
            onSelect={() => onSelectMovie(movie.id)}
            onTrailer={onWatchTrailer}
          />
        ))}
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ViewerHome({ movies, viewer, onSelectMovie, onWatchTrailer }: ViewerHomeProps) {
  const navigate = useNavigate();
  const top10ScrollRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [priceTier, setPriceTier] = useState(0);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Most Popular');
  const [heroImgError, setHeroImgError] = useState(false);

  const scrollTop10 = (dir: 'left' | 'right') => {
    top10ScrollRef.current?.scrollBy({ left: dir === 'left' ? -480 : 480, behavior: 'smooth' });
  };

  const featured = useMemo(() => movies.find((m) => m.featured) ?? movies[5], [movies]);

  const top10 = useMemo(
    () => [...movies].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 10),
    [movies],
  );

  const newReleases = useMemo(
    () => movies.filter((m) => m.badge === 'New' || m.releaseYear === 2026).slice(0, 15),
    [movies],
  );

  const trending = useMemo(() => {
    const tagged = movies.filter((m) => m.badge === 'Trending');
    if (tagged.length >= 6) return tagged;
    return [...movies].sort((a, b) => (b.trailerViews ?? 0) - (a.trailerViews ?? 0)).slice(0, 12);
  }, [movies]);

  const topGrossing = useMemo(
    () => [...movies].filter((m) => m.price > 0).sort((a, b) => b.price - a.price).slice(0, 12),
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const tier = PRICE_TIERS[priceTier];
    let result = [...movies];

    // Price filter
    if (priceTier === 1) {
      result = result.filter((m) => m.price === 0);
    } else if (priceTier > 1) {
      result = result.filter((m) => m.price <= tier.maxPrice);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.creator.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Genre
    if (selectedGenre !== 'All') {
      const target = selectedGenre === 'Animation' ? ['anime', 'animation'] : [selectedGenre.toLowerCase()];
      result = result.filter((m) =>
        (m.genres ?? [m.genre]).some((g) => target.some((t) => g.toLowerCase().includes(t))),
      );
    }

    // Sort
    if (sortBy === 'Most Popular') result.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else if (sortBy === 'Newest') result.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));
    else if (sortBy === 'Highest Rated') result.sort((a, b) => (b.trailerViews ?? 0) - (a.trailerViews ?? 0));

    return result;
  }, [movies, searchQuery, selectedGenre, priceTier, sortBy]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedGenre !== 'All' ? 1 : 0) +
    (priceTier !== 0 ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setPriceTier(0);
  };

  return (
    <div className="space-y-10">

      {/* ── PREMIUM BANNER ────────────────────────────────────────────────── */}
      {viewer?.premium && (
        <div className="rounded-[1.75rem] border border-brand-purple/30 bg-gradient-to-r from-brand-purple/10 via-brand-pink/5 to-brand-cyan/10 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-white text-sm font-bold">✓</span>
              <div>
                <p className="text-sm font-semibold text-slate-950">YouMake+ active — 50% off every paid film</p>
                <p className="text-xs text-slate-500">Signed in as <strong>{viewer.username}</strong></p>
              </div>
            </div>
            <span className="rounded-full bg-brand-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-purple">
              Premium member
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION 1: HERO ───────────────────────────────────────────────── */}
      <section
        className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 overflow-hidden bg-slate-950"
        style={{ minHeight: '460px', height: 'min(65vh, 700px)' }}
      >
        {!heroImgError ? (
          <img
            src={getPosterUrl(featured)}
            alt={featured.title}
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: fallbackGradient(featured.genre) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/25" />

        <div className="absolute inset-0 flex items-end pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/20 px-4 py-1.5 text-xs uppercase tracking-[0.32em] text-brand-pink mb-4">
              Featured Film
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.08] mb-3">
              {featured.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-7 mb-6 line-clamp-2 max-w-xl">
              {featured.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectMovie(featured.id)}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                ▶ Watch Now
              </button>
              <button
                onClick={onWatchTrailer}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                ▶ Trailer
              </button>
              <div className="flex gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">{featured.genre}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">{featured.duration}</span>
                {featured.releaseYear && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">{featured.releaseYear}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TOP 10 THIS WEEK ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-950">Top 10 This Week</h2>
          <div className="flex gap-1.5">
            <ArrowBtn dir="left" onClick={() => scrollTop10('left')} />
            <ArrowBtn dir="right" onClick={() => scrollTop10('right')} />
          </div>
        </div>
        <div ref={top10ScrollRef} className="flex items-end gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {top10.map((movie, i) => (
            <Top10Card
              key={movie.id}
              movie={movie}
              rank={i + 1}
              onSelect={() => onSelectMovie(movie.id)}
            />
          ))}
        </div>
      </section>

      {/* ── SECTION 3: NEW RELEASES ───────────────────────────────────────── */}
      <MovieRow title="New Releases" movies={newReleases} onSelectMovie={onSelectMovie} onWatchTrailer={onWatchTrailer} />

      {/* ── SECTION 4: TRENDING ───────────────────────────────────────────── */}
      <MovieRow title="Trending" movies={trending} onSelectMovie={onSelectMovie} onWatchTrailer={onWatchTrailer} />

      {/* ── SECTION 5: TOP GROSSING ───────────────────────────────────────── */}
      <MovieRow title="Top Grossing" movies={topGrossing} onSelectMovie={onSelectMovie} onWatchTrailer={onWatchTrailer} />

      {/* ── SECTION 6: ALL MOVIES ─────────────────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold text-slate-950">All Movies</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-950">{filteredMovies.length}</span> of{' '}
              <span className="font-semibold text-slate-950">{movies.length}</span> titles
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

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, creator, genre, or tag…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
          )}
        </div>

        {/* Genre filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {FILTER_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selectedGenre === genre
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Price filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRICE_TIERS.map((tier, i) => (
            <button
              key={tier.label}
              onClick={() => setPriceTier(i)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                priceTier === i
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                sortBy === opt
                  ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Movie grid */}
        {filteredMovies.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
            <p className="text-slate-600 text-lg font-medium mb-2">No movies match your filters.</p>
            <p className="text-slate-400 text-sm mb-6">Try adjusting your search, genre, or price selection.</p>
            <button
              onClick={clearFilters}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => onSelectMovie(m.id)}
                onWatchTrailer={onWatchTrailer}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── PLATFORM PITCH / CREATOR CTA ──────────────────────────────────── */}
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
                Upload your films, set your price, and build a real audience. YouMakeTV.ai handles discovery,
                monetization, and analytics so you can focus on creating.
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
              <button
                onClick={() => navigate('/creators')}
                className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Creator Portal →
              </button>
              <button
                onClick={() => navigate('/subscribe')}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Learn about YouMake+
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
