import { Link } from 'react-router-dom';
import { ViewerAccount } from '../types';
import { formatCurrency, subscriberPrice } from '../lib/formatters';
import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

interface AccountPageProps {
  viewer?: ViewerAccount | null;
  onSignOut: () => void;
}

export default function AccountPage({ viewer, onSignOut }: AccountPageProps) {
  return (
    <>
      <SEOHead {...PAGE_SEO['/account']} />
      <AccountContent viewer={viewer} onSignOut={onSignOut} />
    </>
  );
}

function AccountContent({ viewer, onSignOut }: AccountPageProps) {
  if (!viewer) {
    return (
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative rounded-[2.5rem] bg-brand-fade/40 p-10">
          <div className="absolute inset-0 bg-brand-soft opacity-80" />
          <div className="relative space-y-6 text-center">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              Account
            </span>
            <h1 className="text-3xl font-semibold text-slate-950">You are not signed in yet.</h1>
            <p className="text-slate-600">Sign in to manage your YouMake+ membership and premium savings within this prototype.</p>
            <Link to="/login" className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Sign in now
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
      <div className="relative rounded-[2.5rem] bg-brand-fade/40 p-10">
        <div className="absolute inset-0 bg-brand-soft opacity-80" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              Account overview
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Welcome back, {viewer.username}</h1>
            <p className="text-base leading-8 text-slate-600">Your premium status and browser-saved settings are active for this prototype session.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">YouMake+ status</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{viewer.premium ? 'Premium member' : 'Standard viewer'}</p>
            <p className="mt-2 text-sm text-slate-600">{viewer.premium ? 'Premium pricing is now reflected across the marketplace.' : 'Upgrade to YouMake+ to unlock half-price films.'}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-brand-purple/20 bg-brand-purple/5 p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">Example savings</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCurrency(subscriberPrice(4.99))}</p>
          <p className="mt-2 text-sm text-slate-600">Premium member price on a $4.99 film.</p>
        </div>
        <div className="rounded-[1.75rem] border border-brand-cyan/20 bg-brand-cyan/5 p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">Next step</p>
          <p className="mt-4 text-sm text-slate-600">Explore the film catalog or head to the creator studio to see creator earnings and growth.</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Browse films
          </Link>
        </div>
      </div>

      <button onClick={onSignOut} className="mt-10 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
        Sign out
      </button>
    </section>
  );
}
