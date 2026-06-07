import { Movie, ViewerAccount } from '../types';
import { formatCurrency, subscriberPrice } from '../lib/formatters';

interface PurchaseOptionsProps {
  movie: Movie;
  viewer?: ViewerAccount | null;
  onPurchase: () => void;
  onSubscribe: () => void;
  onWatchTrailer: () => void;
}

export default function PurchaseOptions({ movie, viewer, onPurchase, onSubscribe, onWatchTrailer }: PurchaseOptionsProps) {
  const premium = viewer?.premium;
  const basePrice = formatCurrency(movie.price);
  const discounted = formatCurrency(subscriberPrice(movie.price));

  if (movie.price === 0) {
    return (
      <div className="space-y-4 rounded-[1.75rem] border border-brand-cyan/10 bg-brand-cyan/10 p-6 text-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">Free film</p>
            <p className="mt-2 text-3xl font-semibold">Free</p>
          </div>
          <button onClick={onWatchTrailer} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Watch trailer
          </button>
        </div>
        <p className="text-sm text-slate-600">This film is free for all viewers. No purchase required.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">One-time purchase</p>
            {premium ? (
              <p className="mt-3 text-3xl font-semibold text-slate-950">{basePrice}</p>
            ) : (
              <div className="mt-3 flex items-center gap-4">
                <div className="flex flex-col">
                  <p className="text-sm text-slate-500 uppercase tracking-[0.08em]">Full price</p>
                  <p className="text-3xl font-semibold text-slate-950">{basePrice}</p>
                </div>
                <p className="text-lg text-slate-400">or</p>
                <div className="flex flex-col">
                  <p className="text-sm text-slate-500 uppercase tracking-[0.08em]">With premium sub</p>
                  <p className="text-3xl font-semibold text-brand-cyan">{discounted}</p>
                </div>
              </div>
            )}
          </div>
          <button onClick={onPurchase} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Buy for {basePrice}
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Creator revenue is calculated from the original full list price.</p>
      </div>

      {!premium && (
        <div className="rounded-[1.75rem] border border-brand-cyan/20 bg-brand-cyan/5 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">YouMake+ subscriber price</p>
              <p className="mt-3 text-3xl font-semibold text-brand-cyan">{discounted}</p>
              <p className="mt-2 text-sm text-slate-600">Save 50% on every film</p>
            </div>
            <button onClick={onSubscribe} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Start YouMake+
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-700">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Pressure-free purchase</p>
        <p className="mt-3 text-sm leading-7">
          Free films remain free. If you are not a member, purchase this film at full price now and save on future titles with YouMake+.
        </p>
      </div>
    </div>
  );
}
