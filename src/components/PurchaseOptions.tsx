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
  const basePrice = movie.price;
  const discountedPrice = subscriberPrice(basePrice);

  if (basePrice === 0) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Free film</p>
            <p className="mt-2 text-4xl font-semibold text-slate-950">Free</p>
            <p className="mt-1 text-sm text-slate-500">No purchase required for all viewers</p>
          </div>
          <button
            onClick={onWatchTrailer}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            ▶ Watch now
          </button>
        </div>
      </div>
    );
  }

  if (premium) {
    return (
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border-2 border-brand-purple/30 bg-brand-purple/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-purple mb-3">YouMake+ member price</p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-medium text-brand-pink line-through">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-4xl font-semibold text-brand-purple">
                  {formatCurrency(discountedPrice)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                You save <strong className="text-brand-purple">{formatCurrency(basePrice - discountedPrice)}</strong> with YouMake+
              </p>
            </div>
            <button
              onClick={onPurchase}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Buy for {formatCurrency(discountedPrice)}
            </button>
          </div>
        </div>
        <button
          onClick={onWatchTrailer}
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ▶ Watch trailer first
        </button>
      </div>
    );
  }

  // Non-member: show both options side by side
  return (
    <div className="space-y-4">

      {/* Option 1: Buy once */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-3">Option 1 · Buy once</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-950">{formatCurrency(basePrice)}</p>
            <p className="mt-1 text-sm text-slate-500">One-time purchase · Keep forever</p>
          </div>
          <button
            onClick={onPurchase}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Buy for {formatCurrency(basePrice)}
          </button>
        </div>
      </div>

      {/* Option 2: YouMake+ */}
      <div className="rounded-[1.75rem] border-2 border-brand-purple/30 bg-brand-purple/5 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-purple mb-3">Option 2 · Join YouMake+ for $4.99/mo</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg text-brand-pink font-medium line-through">{formatCurrency(basePrice)}</span>
              <span className="text-3xl font-semibold text-brand-purple">{formatCurrency(discountedPrice)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">50% off this film + every film on the platform</p>
          </div>
          <button
            onClick={onSubscribe}
            className="rounded-full bg-brand-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo"
          >
            Try YouMake+
          </button>
        </div>
      </div>

      <button
        onClick={onWatchTrailer}
        className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        ▶ Watch trailer first
      </button>
    </div>
  );
}
