import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../lib/MovieContext';
import { Movie } from '../types';
import { getPosterUrl, getBackdropUrl, fallbackGradient } from '../lib/posters';
import SEOHead from './SEOHead';
import StudioMonogram from './StudioMonogram';
import {
  getBadge, isVerified, formatNum, topGenre, joinYear,
  BADGE_CONFIG, type BadgeType, type Creator,
} from '../lib/studioUtils';

type FilterChip = 'All' | 'Sci-Fi' | 'Drama' | 'Comedy' | 'Thriller' | 'Horror' | 'Anime' | 'Documentary';
type SortOption = 'Most Viewed' | 'Most Films' | 'Newest' | 'Recently Active';

const FILTER_CHIPS: FilterChip[] = ['All', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Anime', 'Documentary'];
const SORT_OPTIONS: SortOption[] = ['Most Viewed', 'Most Films', 'Newest', 'Recently Active'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function BadgePill({ badge }: { badge: BadgeType }) {
  const { label, className } = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${className}`}>
      {label}
    </span>
  );
}

function VerifiedCheck({ className = 'h-4 w-4 text-blue-500' }: { className?: string }) {
  return (
    <svg className={`${className} flex-none`} viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

// ── FeaturedCreatorCard ───────────────────────────────────────────────────────

function FeaturedCreatorCard({
  creator,
  onSelectMovie,
}: {
  creator: Creator;
  onSelectMovie: (id: number) => void;
}) {
  const navigate = useNavigate();
  const badge = getBadge(creator.totalViews, creator.films);
  const verified = isVerified(creator.totalViews, creator.films.length);
  const category = topGenre(creator.films);
  const year = joinYear(creator.films);
  const topFilm = [...creator.films].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  const previewFilms = [...creator.films]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-slate-950">
      {/* Blurred backdrop */}
      {topFilm && (
        <img
          src={getBackdropUrl(topFilm)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 select-none pointer-events-none"
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
        />
      )}
      {/* Gradient: strong left, fades right so posters show through */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 sm:p-8 lg:p-10">
        {/* Studio info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400 font-semibold mb-5">
            Featured Studio
          </p>

          <div className="flex items-center gap-4 mb-5">
            <StudioMonogram name={creator.name} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{creator.name}</h2>
                {verified && <VerifiedCheck className="h-5 w-5 text-blue-400" />}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{category} Studio</p>
              {badge && <div className="mt-2"><BadgePill badge={badge} /></div>}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mb-6">
            {[
              { label: 'Films', value: creator.films.length.toString() },
              { label: 'Views', value: formatNum(creator.totalViews) },
              { label: 'Joined', value: year },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-lg font-bold text-white tabular-nums">{value}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/studio/${encodeURIComponent(creator.name)}`)}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            View Studio →
          </button>
        </div>

        {/* Film poster strip */}
        <div
          className="flex gap-3 overflow-x-auto pb-1 lg:flex-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {previewFilms.map((film) => (
            <button
              key={film.id}
              onClick={() => onSelectMovie(film.id)}
              title={film.title}
              className="group/poster flex-none w-24 sm:w-28"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-xl transition-all duration-200 group-hover/poster:-translate-y-1 group-hover/poster:shadow-2xl">
                <img
                  src={getPosterUrl(film)}
                  alt={film.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CreatorCard ───────────────────────────────────────────────────────────────

function CreatorCard({
  creator,
  onSelectMovie,
  onViewStudio,
}: {
  creator: Creator;
  onSelectMovie: (id: number) => void;
  onViewStudio: () => void;
}) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const badge = getBadge(creator.totalViews, creator.films);
  const verified = isVerified(creator.totalViews, creator.films.length);
  const category = topGenre(creator.films);
  const year = joinYear(creator.films);

  const preview = useMemo(
    () => [...creator.films].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 4),
    [creator.films],
  );
  const extra = creator.films.length - 4;

  const handleImgError = (id: number) =>
    setImgErrors((prev) => { const n = new Set(prev); n.add(id); return n; });

  return (
    <div
      onClick={onViewStudio}
      className="group/card flex flex-col rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="p-5 pb-4 flex-none">
        <div className="flex items-start gap-3">
          <StudioMonogram name={creator.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-900 truncate leading-tight">{creator.name}</h3>
              {verified && <VerifiedCheck />}
            </div>
            {badge && <div className="mt-1.5"><BadgePill badge={badge} /></div>}
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-widest">
              {category}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Films',  value: creator.films.length.toString() },
            { label: 'Views',  value: formatNum(creator.totalViews) },
            { label: 'Joined', value: year },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2.5 text-center">
              <p className="text-sm font-bold text-slate-950 tabular-nums">{value}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 mx-5 flex-none" />

      {/* Film strip */}
      <div className="p-4 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-medium">Films</p>
        <div className="flex gap-1.5">
          {preview.map((film) => (
            <button
              key={film.id}
              onClick={(e) => { e.stopPropagation(); onSelectMovie(film.id); }}
              title={film.title}
              className="group/poster flex-1 min-w-0"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-100 transition-all duration-200 group-hover/poster:-translate-y-0.5 group-hover/poster:shadow-md">
                {!imgErrors.has(film.id) ? (
                  <img
                    src={getPosterUrl(film)}
                    alt={film.title}
                    loading="lazy"
                    onError={() => handleImgError(film.id)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full flex flex-col items-start justify-end p-1"
                    style={{ background: fallbackGradient(film.genre) }}
                  >
                    <p className="text-[7px] font-bold text-white leading-tight line-clamp-2">{film.title}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
          {extra > 0 && (
            <div className="flex-1 min-w-0">
              <div className="aspect-[2/3] rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-400">+{extra}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Studio */}
      <div className="px-4 pb-4 flex-none">
        <button
          onClick={(e) => { e.stopPropagation(); onViewStudio(); }}
          className="w-full rounded-full bg-slate-950 py-2.5 text-sm font-semibold text-white transition-colors duration-150 group-hover/card:bg-slate-700"
        >
          View Studio →
        </button>
      </div>
    </div>
  );
}

// ── CreatorsPage ──────────────────────────────────────────────────────────────

export default function CreatorsPage() {
  const navigate = useNavigate();
  const { movies } = useMovies();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [activeSort, setActiveSort] = useState<SortOption>('Most Viewed');

  const creators = useMemo<Creator[]>(() => {
    const map = new Map<string, Movie[]>();
    movies.forEach((movie) => {
      map.set(movie.creator, [...(map.get(movie.creator) ?? []), movie]);
    });
    return Array.from(map.entries()).map(([name, films]) => ({
      name,
      films,
      totalViews: films.reduce((s, m) => s + (m.views ?? 0), 0),
    }));
  }, [movies]);

  // The featured studio is always the highest-viewed, shown separately above the grid
  const featured = useMemo(
    () => [...creators].sort((a, b) => b.totalViews - a.totalViews)[0] ?? null,
    [creators],
  );

  const filtered = useMemo(() => {
    let result = [...creators];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (activeFilter !== 'All') {
      result = result.filter((c) =>
        c.films.some((f) => f.genre.toLowerCase() === activeFilter.toLowerCase()),
      );
    }

    switch (activeSort) {
      case 'Most Viewed':
        result.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'Most Films':
        result.sort((a, b) => b.films.length - a.films.length);
        break;
      case 'Newest':
        result.sort((a, b) => {
          const ay = Math.min(...a.films.map((f) => f.releaseYear ?? 2026));
          const by = Math.min(...b.films.map((f) => f.releaseYear ?? 2026));
          return by - ay;
        });
        break;
      case 'Recently Active':
        result.sort(
          (a, b) =>
            Math.max(...b.films.map((f) => f.id)) - Math.max(...a.films.map((f) => f.id)),
        );
        break;
    }

    return result;
  }, [creators, searchQuery, activeFilter, activeSort]);

  const showFeatured = !searchQuery.trim() && activeFilter === 'All';

  return (
    <div className="space-y-8">
      <SEOHead
        title="AI Film Studios | YouMakeTV.ai"
        description="Discover the AI film studios building the next generation of entertainment. Browse creators, watch their films, and find your next favorite studio."
        canonical="/creators"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'AI Film Studios — YouMakeTV.ai',
          description: 'Discover AI film studios building the next generation of entertainment.',
          url: 'https://youmaketv.ai/creators',
        }}
      />

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">AI Film Studios</h1>
          <p className="mt-1 text-slate-500 max-w-lg">
            Discover the creators building the next generation of AI entertainment.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-slate-950">{creators.length}</span> studios ·{' '}
            <span className="font-semibold text-slate-950">{movies.length}</span> films
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/creatorsLogin')}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Creator Login
          </button>
          <button
            onClick={() => navigate('/creator/onboarding')}
            className="rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
          >
            Become a Creator →
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search studios…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter chips + sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 flex-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`flex-none rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                activeFilter === chip
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex-none">
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortOption)}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-400 transition"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured studio spotlight */}
      {showFeatured && featured && (
        <FeaturedCreatorCard
          creator={featured}
          onSelectMovie={(id) => navigate(`/movie/${id}`)}
        />
      )}

      {/* Studios grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <CreatorCard
              key={creator.name}
              creator={creator}
              onSelectMovie={(id) => navigate(`/movie/${id}`)}
              onViewStudio={() => navigate(`/studio/${encodeURIComponent(creator.name)}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm p-12 text-center">
          <p className="text-slate-600 font-medium">
            {searchQuery
              ? `No studios found for "${searchQuery}"`
              : `No studios match the "${activeFilter}" filter`}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
            className="mt-4 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Bottom creator CTA */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="relative p-8 sm:p-12">
          <div className="absolute inset-0 bg-brand-soft opacity-50 pointer-events-none" />
          <div className="relative text-center max-w-lg mx-auto">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
              Creator Platform
            </span>
            <h2 className="text-2xl font-semibold text-slate-950">
              Ready to publish your own AI films?
            </h2>
            <p className="mt-2 text-slate-600">
              Upload your films, set your price, and build a real audience. 30–40% revenue share.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/creator/onboarding')}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Become a Creator →
              </button>
              <button
                onClick={() => navigate('/creatorsLogin')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition underline underline-offset-2"
              >
                Creator Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
