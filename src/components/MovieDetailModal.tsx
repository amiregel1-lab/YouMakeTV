import { Movie } from '../types';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onWatchTrailer: () => void;
  onPurchase: () => void;
}

export default function MovieDetailModal({ movie, onClose, onWatchTrailer, onPurchase }: MovieDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 px-4 py-10 backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-cinematic sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">{movie.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{movie.subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
            <div className="relative aspect-[16/9] bg-slate-800">
              <img src={movie.thumbnail} alt={movie.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <button onClick={onWatchTrailer} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/30">
                Watch Trailer
              </button>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Film Details</p>
              <p className="text-base leading-7 text-slate-300">{movie.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/80 p-4">Genre<div className="mt-2 font-medium text-slate-100">{movie.genre}</div></div>
              <div className="rounded-3xl bg-slate-900/80 p-4">Duration<div className="mt-2 font-medium text-slate-100">{movie.duration}</div></div>
              <div className="rounded-3xl bg-slate-900/80 p-4">Creator<div className="mt-2 font-medium text-slate-100">{movie.creator}</div></div>
              <div className="rounded-3xl bg-slate-900/80 p-4">Language<div className="mt-2 font-medium text-slate-100">{movie.language}</div></div>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">
              <p className="font-medium text-slate-100">AI tools used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.tools.map((tool) => (
                  <span key={tool} className="rounded-full border border-slate-700/70 px-3 py-1 text-xs text-slate-300">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Price</p>
                <p className="mt-2 text-3xl font-semibold text-white">{movie.price}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={onWatchTrailer} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Watch Trailer
                </button>
                <button onClick={onPurchase} className="rounded-full border border-white/10 bg-slate-100/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-100/10">
                  Buy / Rent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
