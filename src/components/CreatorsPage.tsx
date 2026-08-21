import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

// ── Data ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Do I keep ownership of my films?',
    a: 'Yes. You retain full creative and legal ownership of everything you upload. By publishing on YouMakeTV you grant a non-exclusive distribution license only — you can request removal at any time.',
  },
  {
    q: 'How long does review take?',
    a: 'Typically 3–7 business days after a complete package is received. Incomplete submissions are returned for revision before the review clock starts.',
  },
  {
    q: 'How do payouts work?',
    a: 'Revenue share starts at 30% of paid-view revenue, rising automatically to 35% after 1,000 paid views (Growth) and 40% after 5,000 (Pro). Billing is not connected yet — no viewer has been charged and no payout has been sent, so any figures in the creator portal are simulated. We will email every creator before real payments begin, and publish the payout schedule then.',
  },
  {
    q: 'Can I publish free films?',
    a: 'Yes. Free films build your audience and drive conversions to your paid content. They go through the same review process as paid films.',
  },
  {
    q: 'Can I upload a series?',
    a: 'Yes. Publish episodes as individual titles under your studio profile. Series and collection management tools are on the roadmap.',
  },
  {
    q: 'What content gets rejected?',
    a: 'Films may be rejected for copyright issues, quality below platform standards, policy violations, or out-of-range pricing. Every rejection includes written feedback so you can revise and resubmit.',
  },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="font-semibold text-slate-900 text-sm sm:text-base">{q}</span>
        <svg
          className={`h-5 w-5 flex-none text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-5 text-slate-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

// ── Dashboard mockup — used in hero ──────────────────────────────────────────

function HeroDashboard() {
  const bars = [42, 58, 50, 76, 68, 100, 92];
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl select-none pointer-events-none ring-1 ring-white/5 w-full">
      {/* Window chrome */}
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-purple" />
          <span className="text-[11px] text-slate-400 font-medium">YouMakeTV · Creator Dashboard</span>
        </div>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 tracking-wide">
          DEMO
        </span>
      </div>

      {/* Nav tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4">
        {['Dashboard', 'Content', 'Payouts', 'Analytics', 'Settings'].map((t, i) => (
          <span
            key={t}
            className={`px-3 py-2.5 text-[11px] font-medium ${
              i === 0 ? 'text-white border-b-2 border-brand-purple' : 'text-slate-500'
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Dashboard content */}
      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total Views', value: '12,450', trend: '+18%' },
            { label: 'Paid Views',  value: '3,780',  trend: '+22%' },
            { label: 'Revenue',     value: '$847',   trend: '+15%' },
            { label: 'Payout Due',  value: '$423',   trend: 'Jun 30' },
          ].map(({ label, value, trend }) => (
            <div key={label} className="rounded-xl bg-slate-900 px-3 py-2.5">
              <p className="text-[13px] font-bold text-white tabular-nums leading-none">{value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{label}</p>
              <p className="text-[9px] text-emerald-400 mt-1">{trend}</p>
            </div>
          ))}
        </div>

        {/* Chart + Film list */}
        <div className="grid grid-cols-[1.15fr_1fr] gap-2">
          {/* Bar chart */}
          <div className="rounded-xl bg-slate-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Monthly Revenue</p>
              <p className="text-[9px] text-brand-purple font-semibold">7 months</p>
            </div>
            <div className="flex items-end gap-1 h-16">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${(h / 100) * 52}px`,
                      background:
                        i === bars.length - 1
                          ? 'linear-gradient(to top, #8b5cf6, #a78bfa)'
                          : 'rgba(139,92,246,0.25)',
                    }}
                  />
                  <p className="text-[7px] text-slate-600">{months[i]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Film list */}
          <div className="rounded-xl bg-slate-900 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2.5">Your Films</p>
            <div className="space-y-2">
              {[
                { title: 'Neon Echoes',    views: '4,200', rev: '$421', live: true  },
                { title: 'Void Protocol',  views: '2,890', rev: '$289', live: true  },
                { title: 'Static Dreams',  views: '1,540', rev: '$154', live: false },
              ].map(({ title, views, rev, live }) => (
                <div key={title} className="flex items-center gap-2">
                  <div className="h-7 w-5 rounded-md bg-gradient-to-b from-indigo-700 to-slate-700 flex-none shadow" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-white truncate leading-none">{title}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{views} · {rev}</p>
                  </div>
                  <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full flex-none ${live ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {live ? 'Live' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Content tab mockup — used in portal showcase ──────────────────────────────

function ContentTabPreview() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl select-none pointer-events-none ring-1 ring-white/5 w-full">
      {/* Window chrome */}
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-purple" />
          <span className="text-[11px] text-slate-400 font-medium">YouMakeTV · Creator Dashboard</span>
        </div>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 tracking-wide">
          DEMO
        </span>
      </div>

      {/* Nav tabs — Content active */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4">
        {['Dashboard', 'Content', 'Payouts', 'Analytics', 'Settings'].map((t, i) => (
          <span
            key={t}
            className={`px-3 py-2.5 text-[11px] font-medium ${
              i === 1 ? 'text-white border-b-2 border-brand-purple' : 'text-slate-500'
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Content tab */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-white">Your Films</p>
          <div className="rounded-full bg-brand-purple px-3 py-1 text-[9px] font-bold text-white">+ Upload Film</div>
        </div>
        <div className="space-y-2">
          {[
            { title: 'Neon Echoes',    genre: 'Sci-Fi',   price: '$3.99', status: 'Live',   views: '4,200' },
            { title: 'Void Protocol',  genre: 'Thriller', price: '$2.49', status: 'Live',   views: '2,890' },
            { title: 'Static Dreams',  genre: 'Drama',    price: '$1.99', status: 'Review', views: '1,540' },
            { title: 'The Deep Loop',  genre: 'Sci-Fi',   price: '$0.99', status: 'Draft',  views: '—'     },
          ].map(({ title, genre, price, status, views }) => (
            <div key={title} className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5">
              <div className="h-10 w-7 rounded-lg bg-gradient-to-b from-indigo-700 to-slate-700 flex-none shadow" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate leading-none">{title}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{genre} · {views} views</p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 flex-none">{price}</span>
              <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full flex-none ${
                status === 'Live'   ? 'bg-emerald-500/10 text-emerald-400' :
                status === 'Review' ? 'bg-amber-500/10 text-amber-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CreatorsPage ──────────────────────────────────────────────────────────────

export default function CreatorsPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <SEOHead {...PAGE_SEO['/creators']} />

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-slate-950 to-indigo-950/50 pointer-events-none" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-purple/8 blur-3xl pointer-events-none" />

        <div className="relative grid lg:grid-cols-[1fr_1.2fr]">
          {/* Left: copy + CTAs */}
          <div className="flex flex-col justify-center px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 lg:pr-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple w-fit mb-6">
              For AI Filmmakers
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]">
              Made With AI.<br />Released For Real.
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-md">
              Publish AI-generated films to an audience that came for them.<br className="hidden sm:block" />
              Set your own price, keep your rights, own your studio page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/creator/onboarding')}
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 shadow-lg"
              >
                Become a Creator →
              </button>
              <button
                onClick={() => navigate('/creator')}
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore Creator Portal
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              {['Free to join', 'Keep your IP', 'Set your own price'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <svg className="h-4 w-4 text-emerald-400 flex-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>

            {/* The disclosure belongs before the decision, not after it. Same
                wording as the creator landing page, recoloured for a dark
                ground — amber-on-white is unreadable here. */}
            <div
              role="note"
              className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 max-w-md"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-400/25 text-[11px] font-bold text-amber-300"
              >
                i
              </span>
              <p className="text-sm leading-6 text-amber-200">
                <strong className="font-semibold">Creator beta</strong> — uploads and studio pages are
                live. Billing is not connected yet, so no payouts have been made. We will email every
                creator before real payments begin.
              </p>
            </div>
          </div>

          {/* Right: Dashboard — visible on first load */}
          <div className="flex items-center justify-center px-6 pb-10 sm:px-10 sm:pb-12 lg:py-12 lg:pr-12 lg:pl-8 lg:border-l lg:border-white/5">
            <div className="w-full max-w-lg">
              <HeroDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WHY JOIN ──────────────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: 'Earn Revenue',
            desc: 'Put a price on approved films and take a share of every paid view. Revenue share starts at 30% and rises automatically to 40% as paid views accumulate.',
            iconClass: 'bg-violet-50 text-brand-purple border-violet-100',
          },
          {
            icon: (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            ),
            title: 'Keep Your IP',
            desc: 'You retain full creative and legal ownership of every film you upload. We distribute it — you own it entirely.',
            iconClass: 'bg-cyan-50 text-brand-cyan border-cyan-100',
          },
          {
            icon: (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h.008v.008H20.25v-.008zm0 3.75h.008v.008H20.25v-.008z" />
              </svg>
            ),
            title: 'Built For AI Films',
            desc: 'A platform dedicated exclusively to AI-generated entertainment. Every feature is built around your workflow, not adapted from legacy tools.',
            iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          },
        ].map(({ icon, title, desc, iconClass }) => (
          <div key={title} className="rounded-[2rem] border border-slate-100 bg-white shadow-soft p-7 sm:p-8 space-y-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClass}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── 3. PORTAL SHOWCASE ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-violet-950/30 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-cyan/4 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
              Creator Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">See Your Studio Dashboard</h2>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Manage films, track views, and watch your studio grow — all from one dashboard.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
            {/* Feature list */}
            <div className="space-y-5">
              {[
                { title: 'Film Management', desc: 'Upload, edit metadata, set pricing, track approval status.' },
                { title: 'Revenue Analytics', desc: 'Views, conversions, and revenue — by film and time period.' },
                { title: 'Payout Dashboard', desc: 'Your revenue-share balance in one place, ready for when billing goes live.' },
                { title: 'Performance Tracking', desc: 'Audience trends, trailer engagement, and conversion rates.' },
                { title: 'Studio Profile', desc: 'Public studio page with your films, brand identity, and badges.' },
              ].map(({ title, desc }, i) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-brand-purple">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => navigate('/creator')}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 shadow-lg"
                >
                  Explore Creator Portal →
                </button>
              </div>
            </div>

            {/* Content tab mockup */}
            <ContentTabPreview />
          </div>
        </div>
      </section>

      {/* ── 4. REVENUE TIERS ─────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] bg-slate-950 overflow-hidden p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Earn More As You Grow</h2>
          <p className="mt-3 text-slate-400 leading-relaxed">
            Your revenue share increases automatically as paid views accumulate across all your films. No application required.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Starter */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-7 flex flex-col">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">Starter</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-6xl font-black text-white">30</span>
              <span className="text-3xl font-bold text-slate-400">%</span>
            </div>
            <p className="text-sm text-slate-400 mb-5">Revenue share</p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-xs text-slate-400 mb-5">
              Default for all new creators
            </div>
            <div className="mt-auto rounded-xl bg-slate-800 px-4 py-4 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Example calculation</p>
              <p className="text-sm text-slate-300">Film sold 100× at $2.99</p>
              <p className="text-lg font-bold text-white">
                You earn <span className="text-brand-purple">$89</span>
              </p>
            </div>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-7 flex flex-col">
            <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-4">Growth</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-6xl font-black text-white">35</span>
              <span className="text-3xl font-bold text-sky-400/70">%</span>
            </div>
            <p className="text-sm text-sky-300/70 mb-5">Revenue share</p>
            <div className="rounded-xl border border-sky-500/20 bg-sky-900/20 px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-sky-400">Unlocked after 1,000 paid views</p>
              <p className="text-xs text-slate-500 mt-0.5">Cumulative across all your films</p>
            </div>
            <div className="mt-auto rounded-xl bg-sky-950/40 border border-sky-800/30 px-4 py-4 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Example calculation</p>
              <p className="text-sm text-slate-300">Film sold 1,000× at $2.99</p>
              <p className="text-lg font-bold text-white">
                You earn <span className="text-sky-400">$1,047</span>
              </p>
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-violet-500/40 bg-violet-950/20 p-7 flex flex-col relative">
            <div className="absolute top-5 right-5">
              <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                Highest tier
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-4">Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-6xl font-black text-white">40</span>
              <span className="text-3xl font-bold text-violet-400/70">%</span>
            </div>
            <p className="text-sm text-violet-300/70 mb-5">Revenue share</p>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-violet-400">Unlocked after 5,000 paid views</p>
              <p className="text-xs text-slate-500 mt-0.5">Cumulative across all your films</p>
            </div>
            <div className="mt-auto rounded-xl bg-violet-950/40 border border-violet-800/30 px-4 py-4 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Example calculation</p>
              <p className="text-sm text-slate-300">Film sold 10,000× at $2.99</p>
              <p className="text-lg font-bold text-white">
                You earn <span className="text-violet-400">$11,960</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Examples based on a $2.99 film price. Revenue share is calculated on Net Revenue after payment
          processing fees. These illustrate the revenue-share terms, not results — billing is not connected
          yet and no payout has been sent.
        </p>
      </section>

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-soft p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">From Upload to Release</h2>
          <p className="mt-3 text-slate-500">Six steps from first upload to a published film.</p>
        </div>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-7 left-[calc(100%/12)] right-[calc(100%/12)] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
            {[
              { num: '1', title: 'Create Account',    desc: 'Set up your studio profile and name.' },
              { num: '2', title: 'Upload Film Package', desc: 'Film, trailer, poster, backdrop, description.' },
              { num: '3', title: 'Submit for Review',  desc: 'Complete package sent to our team.' },
              { num: '4', title: 'Get Approved',       desc: 'Reviewed within 3–7 business days.' },
              { num: '5', title: 'Set Pricing',        desc: 'Suggest your price — we review and confirm.' },
              { num: '6', title: 'Go Live',            desc: 'Published immediately, at your price.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center">
                <div className="relative flex h-14 w-14 flex-none items-center justify-center rounded-full bg-slate-950 text-white font-bold text-lg shadow-md z-10">
                  {num}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950 leading-snug">{title}</p>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHO CAN JOIN ──────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-soft p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">Who Can Join</h2>
          <p className="mt-3 text-slate-500">
            No minimum audience required. If you create AI films, you can apply.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Independent creators',
            'AI animation studios',
            'Documentary filmmakers',
            'Sci-fi storytellers',
            'Horror & thriller directors',
            'Comedy filmmakers',
            'Anime creators',
            'Genre filmmakers',
            'Side-hustle creators',
            'Professional AI studios',
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          All creators complete the same onboarding and film review process regardless of experience level.
        </p>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-soft p-8 sm:p-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 text-center mb-8">
            Common Questions
          </h2>
          <div>
            {FAQS.map(({ q, a }, i) => (
              <FAQItem
                key={q}
                q={q}
                a={a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 lg:p-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-slate-950 to-indigo-950/30 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-purple/8 blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready To Publish<br />Your First AI Film?
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed max-w-md mx-auto">
            Create your account, upload your film package, and submit for review.
            Once it clears, your film goes live on a shelf built for AI cinema.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/creator/onboarding')}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 shadow-lg"
            >
              Become a Creator →
            </button>
            <button
              onClick={() => navigate('/creatorsLogin')}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Creator Login
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Free to join · No upfront fees · Revenue share only
          </p>
        </div>
      </section>
    </div>
  );
}
