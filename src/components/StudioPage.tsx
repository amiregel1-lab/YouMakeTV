import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../lib/MovieContext';
import { getPosterUrl, getBackdropUrl, fallbackGradient } from '../lib/posters';
import SEOHead from './SEOHead';
import StudioMonogram from './StudioMonogram';
import { getBadge, isVerified, formatNum, topGenre, joinYear, BADGE_CONFIG } from '../lib/studioUtils';

export default function StudioPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { movies, loading } = useMovies();
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const studioName = decodeURIComponent(name ?? '');

  const films = useMemo(
    () => movies.filter((m) => m.creator === studioName),
    [movies, studioName],
  );

  const totalViews = useMemo(
    () => films.reduce((s, m) => s + (m.views ?? 0), 0),
    [films],
  );

  const sortedFilms = useMemo(
    () => [...films].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)),
    [films],
  );

  const handleImgError = (id: number) =>
    setImgErrors((prev) => { const n = new Set(prev); n.add(id); return n; });

  // Catalog still loading — don't flash "Studio not found" before data arrives
  if (films.length === 0 && (loading || movies.length === 0)) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading studio">
        <div className="h-40 rounded-[2rem] bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Studio not found
  if (!studioName || films.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-4xl mb-4">🎬</p>
        <h1 className="text-2xl font-semibold text-slate-950">Studio not found</h1>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          We couldn't find a studio named "{studioName}". It may have been removed or the link may be incorrect.
        </p>
        <button
          onClick={() => navigate('/studios')}
          className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          ← Back to Studios
        </button>
      </div>
    );
  }

  const badge = getBadge(totalViews, films);
  const verified = isVerified(totalViews, films.length);
  const category = topGenre(films);
  const year = joinYear(films);
  const topFilm = sortedFilms[0];

  return (
    <div className="space-y-8">
      <SEOHead
        title={`${studioName} | YouMakeTV.ai`}
        description={`Browse ${films.length} films from ${studioName} on YouMakeTV.ai. ${formatNum(totalViews)} total views.`}
        canonical={`/studio/${encodeURIComponent(studioName)}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: studioName,
          description: `AI film studio on YouMakeTV.ai. ${films.length} films, ${formatNum(totalViews)} total views.`,
          url: `https://youmaketv.ai/studio/${encodeURIComponent(studioName)}`,
        }}
      />

      {/* Back navigation */}
      <button
        onClick={() => navigate('/studios')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 transition"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        All Studios
      </button>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 h-56 sm:h-72">
        {topFilm && (
          <img
            src={getBackdropUrl(topFilm)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30 select-none pointer-events-none"
            style={{ filter: 'blur(8px)', transform: 'scale(1.08)' }}
          />
        )}
        {/* Gradient: clear at top, opaque at bottom so studio info is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/98 via-slate-950/50 to-slate-950/10" />

        {/* Studio identity */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end gap-5">
          <StudioMonogram name={studioName} size="xl" />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{studioName}</h1>
              {verified && (
                <svg className="h-6 w-6 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-slate-300 text-sm mt-1">{category} Studio · AI Entertainment</p>
            {badge && (
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${BADGE_CONFIG[badge].className}`}>
                  {BADGE_CONFIG[badge].label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[
          { label: 'Total Films',  value: films.length.toString() },
          { label: 'Total Views',  value: formatNum(totalViews) },
          { label: 'Joined',       value: year },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold text-slate-950 tabular-nums">{value}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Films section */}
      <div>
        <div className="flex items-baseline gap-3 mb-5">
          <h2 className="text-xl font-semibold text-slate-950">Films</h2>
          <span className="text-sm text-slate-400">{films.length} titles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {sortedFilms.map((film) => (
            <button
              key={film.id}
              onClick={() => navigate(`/movie/${film.id}`)}
              className="group text-left"
            >
              {/* Poster */}
              <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                {!imgErrors.has(film.id) ? (
                  <img
                    src={getPosterUrl(film)}
                    alt={film.title}
                    loading="lazy"
                    onError={() => handleImgError(film.id)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full flex flex-col items-start justify-end p-2"
                    style={{ background: fallbackGradient(film.genre) }}
                  >
                    <p className="text-[9px] font-bold text-white leading-tight line-clamp-2">{film.title}</p>
                  </div>
                )}
              </div>

              {/* Film info */}
              <div className="mt-2 px-0.5">
                <p className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-brand-purple transition-colors">
                  {film.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{film.genre} · {film.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA — viewer-to-creator funnel, separate from studio browsing */}
      <section className="rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="relative p-7 sm:p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-40 pointer-events-none" />
          <div className="relative text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-950">Want to publish your own AI films?</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Join YouMakeTV.ai as a creator. Upload films, earn revenue, build an audience.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/creator/onboarding')}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Become a Creator →
              </button>
              <button
                onClick={() => navigate('/creatorsLogin')}
                className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition underline underline-offset-2"
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
