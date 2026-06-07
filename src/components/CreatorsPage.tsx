import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movies } from '../data/movies';
import { Movie } from '../types';
import { getPosterUrl, fallbackGradient } from '../lib/posters';

interface Creator {
  name: string;
  films: Movie[];
  totalViews: number;
  followers: number;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function CreatorCard({ creator, onSelectMovie }: { creator: Creator; onSelectMovie: (id: number) => void }) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const preview = creator.films.slice(0, 4);
  const extra = creator.films.length - 4;

  const handleImgError = (id: number) => {
    setImgErrors((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const initials = creator.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden p-6 pb-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-slate-950 text-white text-lg font-bold shadow-lg">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-950 truncate">{creator.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800">{formatFollowers(creator.followers)}</strong> followers
              </span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800">{creator.films.length}</strong>{' '}
                {creator.films.length === 1 ? 'film' : 'films'}
              </span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800">{formatFollowers(creator.totalViews)}</strong> views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Film library */}
      <div className="px-5 pb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Film Library</p>
        <div className="flex gap-2">
          {preview.map((film) => (
            <button
              key={film.id}
              onClick={() => onSelectMovie(film.id)}
              title={film.title}
              className="group flex-none w-16 sm:w-20"
            >
              <div
                className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md"
                style={{ backgroundImage: `url(${film.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!imgErrors.has(film.id) ? (
                  <img
                    src={getPosterUrl(film)}
                    alt={film.title}
                    loading="lazy"
                    onError={() => handleImgError(film.id)}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                  />
                ) : (
                  <div
                    className="h-full w-full flex flex-col items-start justify-end p-1 gap-0.5"
                    style={{ background: fallbackGradient(film.genre) }}
                  >
                    <p className="text-[8px] font-bold text-white leading-tight line-clamp-2">{film.title}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
          {extra > 0 && (
            <div className="flex-none w-16 sm:w-20">
              <div className="aspect-[2/3] rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-500">+{extra}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatorsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const creators = useMemo<Creator[]>(() => {
    const map = new Map<string, Movie[]>();
    movies.forEach((movie) => {
      const existing = map.get(movie.creator) ?? [];
      map.set(movie.creator, [...existing, movie]);
    });
    return Array.from(map.entries())
      .map(([name, films]) => {
        const totalViews = films.reduce((sum, m) => sum + (m.views ?? 0), 0);
        const followers = Math.round(totalViews / 11);
        return { name, films, totalViews, followers };
      })
      .sort((a, b) => b.totalViews - a.totalViews);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return creators;
    const q = searchQuery.toLowerCase();
    return creators.filter((c) => c.name.toLowerCase().includes(q));
  }, [creators, searchQuery]);

  const handleSelectMovie = (id: number) => navigate(`/movie/${id}`);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Creators</h1>
          <p className="mt-1 text-slate-500">Discover AI filmmakers on YouMakeTV.ai</p>
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-slate-950">{creators.length}</span> creators ·{' '}
            <span className="font-semibold text-slate-950">{movies.length}</span> films
          </p>
        </div>
        <button
          onClick={() => navigate('/creator')}
          className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo"
        >
          Become a Creator →
        </button>
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
          placeholder="Search creators by name…"
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

      {/* Creators grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <CreatorCard key={creator.name} creator={creator} onSelectMovie={handleSelectMovie} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-12 text-center">
          <p className="text-slate-600 font-medium">No creators found for "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Clear search
          </button>
        </div>
      )}

      {/* CTA to become a creator */}
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft overflow-hidden">
        <div className="relative p-8 sm:p-12">
          <div className="absolute inset-0 bg-brand-soft opacity-50 pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div>
              <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
                Become a creator
              </span>
              <h2 className="text-2xl font-semibold text-slate-950">Are you an AI filmmaker?</h2>
              <p className="mt-2 text-slate-600 max-w-md">
                Upload your films, set your price, and build a real audience. 30–40% revenue share.
              </p>
            </div>
            <button
              onClick={() => navigate('/creator')}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Open Creator Studio →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
