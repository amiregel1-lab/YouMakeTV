import { Movie } from '../types';

interface HeroSectionProps {
  movie: Movie;
  viewerCount: number;
  onSelect: (movie: Movie) => void;
  onWatchTrailer: () => void;
  onPurchase: () => void;
}

export default function HeroSection({ movie, viewerCount, onSelect, onWatchTrailer, onPurchase }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/80 p-6 shadow-cinematic backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 bg-hero-gradient opacity-70 mix-blend-screen" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="lg:max-w-xl">
          <p className="mb-3 inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-sky-200">
            Featured AI Film
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {movie.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {movie.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-2">{movie.genre}</span>
            <span className="rounded-full bg-white/5 px-3 py-2">{movie.duration}</span>
            <span className="rounded-full bg-white/5 px-3 py-2">Creator: {movie.creator}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button onClick={onWatchTrailer} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Watch Trailer
            </button>
            <button onClick={onPurchase} className="rounded-full border border-slate-100/20 bg-slate-100/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900/80">
              Buy / Rent {movie.price}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>AI tools used:</span>
            {movie.tools.map((tool) => (
              <span key={tool} className="rounded-full bg-slate-800 px-3 py-1">
                {tool}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
            <p>{viewerCount} viewers are browsing AI Cinema now.</p>
            <p className="mt-1 text-slate-300">Payment, KYC, and hosting are mocked in this prototype.</p>
          </div>
        </div>

        <button className="group relative max-w-xl overflow-hidden rounded-[2rem] border border-white/10 shadow-film transition hover:scale-[1.01]
        before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.85))] before:transition before:duration-500">
          <img src={movie.thumbnail} alt={movie.title} className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-lg font-medium">{movie.subtitle}</p>
            <span className="mt-3 inline-flex rounded-full bg-slate-950/70 px-3 py-2 text-sm text-slate-100">Tap for details</span>
          </div>
          <div className="absolute inset-0" onClick={() => onSelect(movie)} />
        </button>
      </div>
    </section>
  );
}
