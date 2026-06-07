import { useState } from 'react';
import { Movie } from '../types';
import { getPosterUrl, fallbackGradient } from '../lib/posters';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onWatchTrailer: () => void;
}

export default function MovieCard({ movie, onSelect, onWatchTrailer }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group cursor-pointer">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-900 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
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
            className="h-full w-full flex flex-col items-start justify-end p-3 gap-1"
            style={{ background: fallbackGradient(movie.genre) }}
          >
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-medium">{movie.genre}</span>
            <p className="text-xs font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
            <p className="text-[9px] text-white/40">{movie.creator}</p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-3 gap-2 bg-slate-950/0 group-hover:bg-slate-950/75 transition-all duration-300">
          <div className="w-full space-y-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); onWatchTrailer(); }}
              className="w-full rounded-full bg-white py-2 text-xs font-semibold text-slate-950 hover:bg-slate-100 transition"
            >
              ▶ Watch Trailer
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(movie); }}
              className="w-full rounded-full border border-white/50 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
            {movie.genre}
          </span>
          {movie.price === 0 && (
            <span className="rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
              Free
            </span>
          )}
        </div>
      </div>

      <button onClick={() => onSelect(movie)} className="mt-2 w-full text-left">
        <h3 className="text-xs font-semibold text-slate-950 leading-tight line-clamp-2">{movie.title}</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">{movie.creator}</p>
      </button>
    </article>
  );
}
