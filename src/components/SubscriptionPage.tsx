import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewerAccount } from '../types';

interface SubscriptionPageProps {
  viewer?: ViewerAccount | null;
  onSubscribe: () => void;
}

const BENEFITS = [
  '50% off every paid film, every time',
  'Free films always stay free',
  'Access to 100+ AI-generated titles',
  'New films added regularly',
  'Creator payouts at full price — your support goes further',
  'Cancel anytime, no commitment',
];

export default function SubscriptionPage({ viewer }: SubscriptionPageProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-2xl space-y-10">

      {/* HERO */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative bg-brand-fade/40 px-8 py-14 text-center sm:px-14 sm:py-20">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative space-y-5">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              YouMake+ membership
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Every film.<br />Half the price.
            </h1>
            <p className="text-lg text-slate-600">$4.99/month. Cancel anytime.</p>
          </div>
        </div>
      </div>

      {/* BENEFITS */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft sm:p-10">
        <h2 className="mb-6 text-xl font-semibold text-slate-950">What you get</h2>
        <ul className="space-y-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="mt-0.5 flex-none text-base font-bold text-brand-purple">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* PRICING + CTA */}
      <div className="space-y-6 rounded-[2rem] border-2 border-brand-purple/30 bg-brand-purple/5 p-8 text-center sm:p-10">
        <div>
          <span className="text-6xl font-semibold text-slate-950">$4.99</span>
          <span className="ml-1 text-xl text-slate-500">/month</span>
        </div>
        <p className="text-sm text-slate-500">No commitment. Cancel anytime.</p>

        {viewer?.premium ? (
          <div className="flex items-center justify-center gap-2 font-semibold text-brand-purple">
            <span>✓</span>
            <span>You're already a YouMake+ member</span>
          </div>
        ) : submitted ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-brand-purple">
              <span>✓</span>
              <span>You're on the list!</span>
            </div>
            <p className="text-sm text-slate-600">We'll be in touch soon to get you set up with YouMake+.</p>
          </div>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full rounded-full bg-brand-purple px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-indigo"
          >
            Try YouMake+ for $4.99/month
          </button>
        )}
      </div>

      {/* FOOTER LINKS */}
      <div className="space-y-2 text-center text-sm text-slate-500">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-950 hover:text-brand-purple">
            Sign in
          </Link>
        </p>
        <p>
          Are you a creator?{' '}
          <Link to="/creator" className="font-semibold text-brand-purple hover:text-brand-indigo">
            Open creator portal →
          </Link>
        </p>
      </div>

    </section>
  );
}
