import { Link } from 'react-router-dom';
import { ViewerAccount } from '../types';
import { formatCurrency, subscriberPrice } from '../lib/formatters';

interface SubscriptionPageProps {
  viewer?: ViewerAccount | null;
  onSubscribe: () => void;
}

export default function SubscriptionPage({ viewer, onSubscribe }: SubscriptionPageProps) {
  const samplePrice = 4.99;
  const discountExample = subscriberPrice(4.99);

  return (
    <section className="space-y-10">
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative bg-brand-fade/40 p-8 sm:p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
                YouMake+ membership
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Half-price access for every paid AI film.</h1>
              <p className="text-base leading-8 text-slate-600">
                YouMake+ gives viewers premium savings and creators a more engaged marketplace with stronger price signals.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">Monthly cost</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(samplePrice)}/mo</p>
                </div>
                <div className="rounded-[1.75rem] border border-brand-cyan/20 bg-brand-cyan/5 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">Buyer example</p>
                  <p className="mt-3 text-3xl font-semibold text-brand-purple">{formatCurrency(discountExample)}</p>
                  <p className="mt-2 text-sm text-slate-600">Example price for a $4.99 film.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl">
              <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">Subscriber offer</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">Half off every premium film</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                YouMake+ members unlock a premium pricing layer across the marketplace, making higher-value AI films more affordable.
              </p>
              <div className="mt-8 space-y-4 rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">Benefits</p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li>✓ 50% off every paid film</li>
                  <li>✓ Free films stay free</li>
                  <li>✓ Flexible cancel anytime</li>
                  <li>✓ Premium pricing across the marketplace</li>
                </ul>
              </div>
              <button onClick={onSubscribe} className="mt-8 w-full rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50" disabled={viewer?.premium}>
                {viewer?.premium ? 'You are already a YouMake+ member' : 'Start YouMake+ for $4.99/mo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-950">Why upgrade?</h2>
          <p className="mt-4 text-slate-600">YouMake+ lowers friction for viewers and creates more consistent value for creators on the platform.</p>
          <ul className="mt-6 space-y-4 text-slate-700">
            <li className="rounded-[1.5rem] border border-brand-purple/10 bg-brand-purple/5 p-4">Creator payouts are calculated from the original full list price.</li>
            <li className="rounded-[1.5rem] border border-brand-cyan/10 bg-brand-cyan/5 p-4">Free films remain free for everyone.</li>
            <li className="rounded-[1.5rem] border border-brand-pink/10 bg-brand-pink/5 p-4">Member pricing is simple, transparent, and easy to adopt.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-slate-950">Already have YouMake+?</h3>
          <p className="mt-3 text-slate-600">Sign in now and apply your premium pricing instantly throughout the marketplace.</p>
          <Link to="/login" className="mt-6 inline-flex rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Sign in to YouMake+
          </Link>
        </div>
      </div>
    </section>
  );
}
