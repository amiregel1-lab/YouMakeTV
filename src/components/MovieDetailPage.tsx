import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { movies } from '../data/movies';
import { formatCurrency, subscriberPrice } from '../lib/formatters';
import type { Movie, ViewerAccount } from '../types';
import PurchaseOptions from './PurchaseOptions';
import { getPosterUrl, fallbackGradient } from '../lib/posters';
import SEOHead from './SEOHead';
import { loadMediaOverrides } from '../lib/storage';

interface MovieDetailPageProps {
  viewer?: ViewerAccount | null;
  onPurchase: () => void;
  onSubscribe: () => void;
  onWatchTrailer: () => void;
}

function RelatedPosterCard({ movie }: { movie: Movie }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="group flex-none w-28 sm:w-36 text-left"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-900 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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
      <p className="mt-1.5 text-xs font-semibold text-slate-950 line-clamp-2 leading-tight">{movie.title}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{movie.genre}</p>
    </button>
  );
}

export default function MovieDetailPage({ viewer, onPurchase, onSubscribe, onWatchTrailer }: MovieDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posterError, setPosterError] = useState(false);
  const [trailerPlayerUrl, setTrailerPlayerUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const movie = useMemo(() => movies.find((item) => item.id === Number(id)), [id]);

  const moreFromCreator = useMemo(
    () => (movie ? movies.filter((m) => m.creator === movie.creator && m.id !== movie.id).slice(0, 8) : []),
    [movie],
  );

  const similarMovies = useMemo(
    () =>
      movie
        ? movies
            .filter((m) => m.genre === movie.genre && m.id !== movie.id && m.creator !== movie.creator)
            .slice(0, 8)
        : [],
    [movie],
  );

  const handleWatchTrailer = () => {
    if (movie) {
      const trailerUrl = loadMediaOverrides()[movie.title]?.trailerUrl;
      if (trailerUrl) {
        setTrailerPlayerUrl(trailerUrl);
        return;
      }
    }
    onWatchTrailer();
  };

  if (!movie) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-soft">
        <p className="text-slate-700">Movie not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to browse
        </button>
      </div>
    );
  }

  const subscriberPriceValue = subscriberPrice(movie.price);
  const posterUrl = getPosterUrl(movie);

  return (
    <div className="space-y-8">
      <SEOHead
        title={`${movie.title} — ${movie.genre} AI Film`}
        description={movie.description.slice(0, 155)}
        canonical={`/movie/${movie.id}`}
        ogImage={posterUrl}
        ogType="video.movie"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: movie.title,
          description: movie.description,
          genre: movie.genre,
          duration: `PT${movie.duration.replace('m', 'M')}`,
          image: posterUrl,
          url: `https://youmaketv.ai/movie/${movie.id}`,
          creator: { '@type': 'Person', name: movie.creator },
          datePublished: movie.releaseYear?.toString(),
        }}
      />

      {/* ── MAIN DETAIL PANEL ─────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/40 p-8 sm:p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">

            {/* Left: metadata */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-brand-pink">
                {movie.badge}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{movie.title}</h1>
              <p className="text-lg leading-8 text-slate-600">{movie.subtitle}</p>
              <p className="text-sm leading-7 text-slate-600 max-w-xl">{movie.description}</p>

              {/* Key metadata grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Genre', value: movie.genre },
                  { label: 'Runtime', value: movie.duration },
                  { label: 'Language', value: movie.language },
                  ...(movie.releaseYear ? [{ label: 'Release Year', value: String(movie.releaseYear) }] : []),
                  { label: 'Rating', value: movie.rating },
                ].map((field) => (
                  <div key={field.label} className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{field.label}</p>
                    <p className="mt-2 font-semibold text-slate-950">{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Creator & AI tools */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500 mb-3">Creator</p>
                  <button
                    onClick={() => navigate('/creators')}
                    className="text-lg font-semibold text-slate-950 hover:text-brand-purple transition"
                  >
                    {movie.creator}
                  </button>
                  <p className="mt-1 text-sm text-slate-500">AI studio partner on YouMakeTV.ai</p>
                </div>
                <div className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500 mb-3">AI Tools Used</p>
                  <div className="flex flex-wrap gap-2">
                    {movie.tools.map((tool) => (
                      <span key={tool} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: poster + purchase */}
            <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
              {/* Poster */}
              <div className="overflow-hidden rounded-[1.5rem] bg-slate-900">
                {!posterError ? (
                  <img
                    src={getPosterUrl(movie)}
                    alt={movie.title}
                    onError={() => setPosterError(true)}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-72 w-full flex flex-col items-start justify-end p-4 gap-1"
                    style={{ background: fallbackGradient(movie.genre) }}
                  >
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-medium">{movie.genre}</span>
                    <p className="text-sm font-bold text-white leading-tight">{movie.title}</p>
                  </div>
                )}
              </div>

              {/* Trailer button */}
              <button
                onClick={handleWatchTrailer}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                ▶ Watch Trailer
              </button>

              {/* Purchase options */}
              <PurchaseOptions
                movie={movie}
                viewer={viewer}
                onPurchase={onPurchase}
                onSubscribe={onSubscribe}
                onWatchTrailer={onWatchTrailer}
              />

              <Link
                to="/subscribe"
                className="block rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Learn more about YouMake+
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SUMMARY ───────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Standard price</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">
              {movie.price === 0 ? 'Free' : formatCurrency(movie.price)}
            </p>
            <p className="mt-3 text-sm text-slate-600">One-time purchase price.</p>
          </div>
          <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">YouMake+ price</p>
            <p className="mt-4 text-3xl font-semibold text-brand-purple">
              {movie.price === 0 ? 'Free' : formatCurrency(subscriberPriceValue)}
            </p>
            <p className="mt-3 text-sm text-slate-600">50% off for members.</p>
          </div>
        </div>
      </section>

      {/* ── MORE FROM THIS CREATOR ────────────────────────────────────────── */}
      {moreFromCreator.length > 0 && (
        <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-950">More from {movie.creator}</h2>
            <button
              onClick={() => navigate('/creators')}
              className="text-xs font-semibold text-brand-purple hover:text-brand-indigo transition"
            >
              View creator →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {moreFromCreator.map((film) => (
              <RelatedPosterCard key={film.id} movie={film} />
            ))}
          </div>
        </section>
      )}

      {/* ── SIMILAR MOVIES ────────────────────────────────────────────────── */}
      {similarMovies.length > 0 && (
        <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-8">
          <h2 className="text-lg font-semibold text-slate-950 mb-4">More {movie.genre} Films</h2>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {similarMovies.map((film) => (
              <RelatedPosterCard key={film.id} movie={film} />
            ))}
          </div>
        </section>
      )}

      {/* ── TRAILER PLAYER MODAL ─────────────────────────────────────────── */}
      {trailerPlayerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setTrailerPlayerUrl(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden bg-black shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
              <p className="text-sm font-semibold text-white">{movie.title} — Trailer</p>
              <button
                onClick={() => setTrailerPlayerUrl(null)}
                className="text-slate-400 hover:text-white transition text-xl leading-none"
              >
                ×
              </button>
            </div>
            <video
              src={trailerPlayerUrl}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: '60vh' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
