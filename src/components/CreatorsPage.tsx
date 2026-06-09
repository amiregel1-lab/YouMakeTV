import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../lib/MovieContext';
import { Movie } from '../types';
import { getPosterUrl, fallbackGradient } from '../lib/posters';
import SEOHead from './SEOHead';

interface Creator {
  name: string;
  films: Movie[];
  totalViews: number;
  followers: number;
}

type FilterChip = 'All' | 'Top Creators' | 'Rising Studios' | 'New Creators' | 'Sci-Fi' | 'Comedy' | 'Drama' | 'Documentary';
type SortOption = 'Most Viewed' | 'Most Films' | 'Most Followers' | 'Newest';

const FILTER_CHIPS: FilterChip[] = ['All', 'Top Creators', 'Rising Studios', 'New Creators', 'Sci-Fi', 'Comedy', 'Drama', 'Documentary'];
const SORT_OPTIONS: SortOption[] = ['Most Viewed', 'Most Films', 'Most Followers', 'Newest'];

// Deterministic studio logo gradient based on name
const STUDIO_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-fuchsia-500 to-purple-600',
  'from-sky-500 to-cyan-500',
  'from-lime-500 to-green-600',
];

function studioGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return STUDIO_GRADIENTS[Math.abs(h) % STUDIO_GRADIENTS.length];
}

type BadgeType = 'Top Creator' | 'Rising Studio' | 'Featured Studio' | 'New Creator' | 'Verified';

function getBadge(creator: Creator): BadgeType {
  if (creator.totalViews > 70_000) return 'Top Creator';
  if (creator.films.some((f) => f.featured)) return 'Featured Studio';
  if (creator.totalViews > 20_000 && creator.films.length >= 3) return 'Rising Studio';
  if (creator.films.length <= 2) return 'New Creator';
  return 'Verified';
}

const BADGE_CONFIG: Record<BadgeType, { label: string; className: string }> = {
  'Top Creator':      { label: '★ Top Creator',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Rising Studio':    { label: '↑ Rising Studio',   className: 'bg-sky-50 text-sky-700 border-sky-200' },
  'Featured Studio':  { label: '◆ Featured',        className: 'bg-violet-50 text-violet-700 border-violet-200' },
  'New Creator':      { label: '✦ New Creator',     className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Verified':         { label: '✓ Verified',        className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function topGenre(films: Movie[]): string {
  const counts: Record<string, number> = {};
  films.forEach((f) => { counts[f.genre] = (counts[f.genre] ?? 0) + 1; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Studio';
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── CreatorCard ─────────────────────────────────────────────────────────────

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

  const preview = creator.films.slice(0, 4);
  const extra = creator.films.length - 4;
  const badge = getBadge(creator);
  const { label: badgeLabel, className: badgeClass } = BADGE_CONFIG[badge];
  const gradient = studioGradient(creator.name);
  const category = topGenre(creator.films);
  const initials = getInitials(creator.name);

  const handleImgError = (id: number) => {
    setImgErrors((prev) => { const n = new Set(prev); n.add(id); return n; });
  };

  return (
    <div
      onClick={onViewStudio}
      className="group/card flex flex-col rounded-[1.75rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Top color band */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} flex-none`} />

      {/* Header */}
      <div className="p-6 pb-4 flex-none">
        <div className="flex items-start gap-4">
          {/* Studio logo badge */}
          <div
            className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white text-base font-bold shadow-md tracking-wide`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            {/* Name + verified */}
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-950 truncate leading-tight">{creator.name}</h3>
              <svg className="h-4 w-4 flex-none text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Badge + category */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badgeClass}`}>
                {badgeLabel}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{category}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Followers', value: formatNum(creator.followers) },
            { label: 'Films',     value: creator.films.length.toString() },
            { label: 'Views',     value: formatNum(creator.totalViews) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2.5 text-center">
              <p className="text-sm font-bold text-slate-950 tabular-nums">{value}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Film strip */}
      <div className="px-5 pb-4 flex-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3 font-medium">Film Library</p>
        <div className="flex gap-2">
          {preview.map((film) => (
            <button
              key={film.id}
              onClick={(e) => { e.stopPropagation(); onSelectMovie(film.id); }}
              title={film.title}
              className="group/poster flex-1 min-w-0"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 shadow-sm transition-all duration-200 group-hover/poster:-translate-y-1 group-hover/poster:shadow-md">
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
              <div className="aspect-[2/3] rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-500">+{extra}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Studio button */}
      <div className="px-5 pb-5 flex-none">
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

// ── CreatorsPage ─────────────────────────────────────────────────────────────

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
    return Array.from(map.entries()).map(([name, films]) => {
      const totalViews = films.reduce((sum, m) => sum + (m.views ?? 0), 0);
      const followers = Math.round(totalViews / 11);
      return { name, films, totalViews, followers };
    });
  }, [movies]);

  const filtered = useMemo(() => {
    let result = [...creators];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    switch (activeFilter) {
      case 'Top Creators':
        result = result.filter((c) => c.totalViews > 70_000);
        break;
      case 'Rising Studios':
        result = result.filter((c) => c.totalViews > 20_000 && c.totalViews <= 70_000 && c.films.length >= 3);
        break;
      case 'New Creators':
        result = result.filter((c) => c.films.length <= 2 || c.totalViews < 15_000);
        break;
      case 'Sci-Fi':
      case 'Comedy':
      case 'Drama':
      case 'Documentary':
        result = result.filter((c) => c.films.some((f) => f.genre.toLowerCase().includes(activeFilter.toLowerCase())));
        break;
    }

    switch (activeSort) {
      case 'Most Viewed':
        result.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'Most Films':
        result.sort((a, b) => b.films.length - a.films.length);
        break;
      case 'Most Followers':
        result.sort((a, b) => b.followers - a.followers);
        break;
      case 'Newest':
        result.sort((a, b) => Math.max(...b.films.map((f) => f.id)) - Math.max(...a.films.map((f) => f.id)));
        break;
    }

    return result;
  }, [creators, searchQuery, activeFilter, activeSort]);

  return (
    <div className="space-y-8">
      <SEOHead
        title="AI Film Studios | YouMakeTV.ai"
        description="Discover AI film studios building the next generation of entertainment. Browse creators, explore their work, and join the platform."
        canonical="/creators"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'AI Film Studios — YouMakeTV.ai',
          description: 'Discover AI film studios building the next generation of entertainment.',
          url: 'https://youmaketv.ai/creators',
        }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">AI Film Studios</h1>
          <p className="mt-1 text-slate-500 max-w-lg">
            Discover the creators building the next generation of AI entertainment.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-slate-950">{creators.length}</span> creators ·{' '}
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
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search studios by name…"
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

      {/* Filter + Sort row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`flex-none rounded-full border px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                activeFilter === chip
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex-none">
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortOption)}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-400 transition"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Creators grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <CreatorCard
              key={creator.name}
              creator={creator}
              onSelectMovie={(id) => navigate(`/movie/${id}`)}
              onViewStudio={() => navigate('/creator')}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
          <p className="text-slate-600 font-medium">
            {searchQuery ? `No studios found for "${searchQuery}"` : `No studios match the "${activeFilter}" filter`}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
            className="mt-4 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
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
