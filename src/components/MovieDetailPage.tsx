import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { movies } from '../data/movies';
import { formatCurrency, subscriberPrice } from '../lib/formatters';
import { Movie, ViewerAccount } from '../types';
import PurchaseOptions from './PurchaseOptions';

interface MovieDetailPageProps {
  viewer?: ViewerAccount | null;
  onPurchase: () => void;
  onSubscribe: () => void;
  onWatchTrailer: () => void;
}

export default function MovieDetailPage({ viewer, onPurchase, onSubscribe, onWatchTrailer }: MovieDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = useMemo(() => movies.find((item) => item.id === Number(id)), [id]);

  if (!movie) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-soft">
        <p className="text-slate-700">Movie not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Back to browse
        </button>
      </div>
    );
  }

  const subscriberPriceValue = subscriberPrice(movie.price);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/40 p-8 sm:p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-brand-pink">
                {movie.badge}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{movie.title}</h1>
              <p className="text-lg leading-8 text-slate-600">{movie.subtitle}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Genre', value: movie.genre },
                  { label: 'Duration', value: movie.duration },
                  { label: 'Language', value: movie.language },
                ].map((field) => (
                  <div key={field.label} className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                    <p className="uppercase tracking-[0.28em] text-slate-500">{field.label}</p>
                    <p className="mt-2 font-semibold text-slate-950">{field.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">AI tools</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                    {movie.tools.map((tool) => (
                      <span key={tool} className="rounded-full border border-slate-200 px-3 py-2 text-slate-700">{tool}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.75rem] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Creator</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{movie.creator}</p>
                  <div className="mt-3 text-sm text-slate-600">Trusted AI studio partner on YouMakeTV.ai.</div>
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
              <div className="rounded-[1.75rem] bg-slate-950 p-4 text-white">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Now playing</p>
                <p className="mt-3 text-2xl font-semibold">{movie.title}</p>
              </div>
              <div className="rounded-[1.75rem] overflow-hidden bg-slate-800">
                <img src={movie.thumbnail} alt={movie.title} className="h-72 w-full object-cover" />
              </div>
              <PurchaseOptions movie={movie} viewer={viewer} onPurchase={onPurchase} onSubscribe={onSubscribe} onWatchTrailer={onWatchTrailer} />
              <Link to="/subscribe" className="block rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Learn more about YouMake+
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Viewer pricing</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCurrency(movie.price)}</p>
            <p className="mt-3 text-sm text-slate-600">Standard one-time purchase price.</p>
          </div>
          <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">YouMake+ savings</p>
            <p className="mt-4 text-3xl font-semibold text-brand-purple">{formatCurrency(subscriberPriceValue)}</p>
            <p className="mt-3 text-sm text-slate-600">Premium pricing applied for members.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
