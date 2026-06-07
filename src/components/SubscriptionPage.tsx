import { Link } from 'react-router-dom';
import { ViewerAccount } from '../types';
import { formatCurrency, subscriberPrice } from '../lib/formatters';

interface SubscriptionPageProps {
  viewer?: ViewerAccount | null;
  onSubscribe: () => void;
}

export default function SubscriptionPage({ viewer, onSubscribe }: SubscriptionPageProps) {
  const examplePrice = 4.99;
  const memberPrice = subscriberPrice(examplePrice);

  return (
    <section className="space-y-10">

      {/* HERO */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative bg-brand-fade/40 p-8 sm:p-12">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative space-y-6 text-center max-w-2xl mx-auto">
            <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              YouMake+ membership
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Half-price access to every AI film on the platform.
            </h1>
            <p className="text-base leading-8 text-slate-600">
              Join YouMake+ for $4.99/month and unlock 50% off every paid film — forever, as long as you're a member.
            </p>
          </div>
        </div>
      </div>

      {/* CORE COMPARISON */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Option 1: Buy once */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Option 1</p>
            <h2 className="text-xl font-semibold text-slate-950">Buy this film once</h2>
            <p className="mt-2 text-sm text-slate-500">One-time purchase. No subscription required.</p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">Example price</p>
            <p className="text-5xl font-semibold text-slate-950">{formatCurrency(examplePrice)}</p>
            <p className="mt-2 text-sm text-slate-500">Full list price · One film · One time</p>
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2"><span className="text-slate-400">✗</span> Pay per film</li>
            <li className="flex items-center gap-2"><span className="text-slate-400">✗</span> No monthly commitment</li>
            <li className="flex items-center gap-2"><span className="text-slate-400">✗</span> Full price every time</li>
          </ul>

          <button
            onClick={() => {}}
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Browse films to buy
          </button>
        </div>

        {/* Option 2: YouMake+ */}
        <div className="rounded-[2rem] border-2 border-brand-purple/40 bg-white p-8 shadow-soft space-y-5 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-brand-purple text-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              Best value
            </span>
          </div>
          <div className="absolute inset-0 bg-brand-soft opacity-30 pointer-events-none" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-purple mb-2">Option 2</p>
            <h2 className="text-xl font-semibold text-slate-950">Join YouMake+ for $4.99/mo</h2>
            <p className="mt-2 text-sm text-slate-500">Get 50% off every film, every month.</p>
          </div>

          <div className="relative rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-purple mb-2">Same film, member price</p>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-medium text-brand-pink line-through opacity-60">
                {formatCurrency(examplePrice)}
              </span>
              <span className="text-5xl font-semibold text-brand-purple">{formatCurrency(memberPrice)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              You save <strong className="text-brand-purple">{formatCurrency(examplePrice - memberPrice)}</strong> on this film alone
            </p>
          </div>

          <ul className="relative space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2"><span className="text-brand-purple font-bold">✓</span> 50% off every paid film</li>
            <li className="flex items-center gap-2"><span className="text-brand-purple font-bold">✓</span> Free films stay free</li>
            <li className="flex items-center gap-2"><span className="text-brand-purple font-bold">✓</span> Cancel anytime</li>
            <li className="flex items-center gap-2"><span className="text-brand-purple font-bold">✓</span> Member pricing applied platform-wide</li>
          </ul>

          <button
            onClick={onSubscribe}
            disabled={viewer?.premium}
            className="relative w-full rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {viewer?.premium ? '✓ You are a YouMake+ member' : 'Start YouMake+ · $4.99/mo'}
          </button>

          {!viewer?.premium && (
            <p className="relative text-center text-xs text-slate-400">No commitment. Cancel anytime.</p>
          )}
        </div>
      </div>

      {/* MEMBERSHIP MATH */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8">
        <h2 className="text-2xl font-semibold text-slate-950 mb-6">The membership math</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { films: '1 film/mo', savings: formatCurrency(examplePrice * 0.5), net: `Membership pays for itself after 1 film` },
            { films: '2 films/mo', savings: formatCurrency(examplePrice * 0.5 * 2), net: `Save ${formatCurrency(examplePrice * 0.5 * 2 - 4.99)} after membership cost` },
            { films: '4 films/mo', savings: formatCurrency(examplePrice * 0.5 * 4), net: `Save ${formatCurrency(examplePrice * 0.5 * 4 - 4.99)} after membership cost` },
          ].map((row) => (
            <div key={row.films} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <p className="font-semibold text-slate-950">{row.films}</p>
              <p className="mt-2 text-2xl font-semibold text-brand-purple">+{row.savings}</p>
              <p className="mt-2 text-sm text-slate-600">{row.net}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-400">Based on example $4.99 film price. Creator payouts always calculated at full list price.</p>
      </div>

      {/* BOTTOM CTA */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950 mb-3">Already a member?</h2>
          <p className="text-slate-600 mb-5">Sign in to apply your YouMake+ pricing across the marketplace.</p>
          <Link
            to="/login"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in →
          </Link>
        </div>
        <div className="rounded-[2rem] border border-brand-purple/20 bg-brand-purple/5 p-8">
          <h2 className="text-xl font-semibold text-slate-950 mb-3">Are you a creator?</h2>
          <p className="text-slate-600 mb-5">Creator payouts are always calculated at the full list price — YouMake+ savings come from the platform, not your earnings.</p>
          <Link
            to="/creator"
            className="inline-flex rounded-full border border-brand-purple/30 bg-white px-5 py-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/5"
          >
            Open creator portal →
          </Link>
        </div>
      </div>

    </section>
  );
}
