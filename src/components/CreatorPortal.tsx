import { useState, useEffect } from 'react';

interface CreatorPortalProps {
  onStart: () => void;
  onDashboard: () => void;
  onViewDemo?: () => void;
  onSignIn?: () => void;
}

// ── AI Tool badges ────────────────────────────────────────────────────────────

const AI_TOOLS = [
  { name: 'Veo',              initials: 'V',   color: '#1A73E8', bg: '#E8F0FE' },
  { name: 'Runway',           initials: 'RW',  color: '#111111', bg: '#EFEFEF' },
  { name: 'Kling',            initials: 'K',   color: '#7C3AED', bg: '#F3EEFF' },
  { name: 'Sora',             initials: 'Sr',  color: '#059669', bg: '#E6F7F1' },
  { name: 'Midjourney',       initials: 'MJ',  color: '#2563EB', bg: '#EFF6FF' },
  { name: 'ElevenLabs',       initials: 'EL',  color: '#EA580C', bg: '#FFF3EE' },
  { name: 'DALL·E',           initials: 'D',   color: '#059669', bg: '#E6F7F1' },
  { name: 'Stable Diffusion', initials: 'SD',  color: '#6D28D9', bg: '#F3EEFF' },
];

function ToolBadge({ name, initials, color, bg }: typeof AI_TOOLS[number]) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold shadow-sm select-none"
        style={{ backgroundColor: bg, color }}
      >
        {initials}
      </div>
      <span className="text-xs font-semibold text-slate-600">{name}</span>
    </div>
  );
}

// ── Creator spotlight data ────────────────────────────────────────────────────

const SPOTLIGHTS = [
  { name: 'AI Noir Studio',   films: 12, earned: '$1,240', views: '14.2K', badge: 'Top Earner',  initials: 'AN' },
  { name: 'Future Worlds',    films: 8,  earned: '$860',   views: '9.8K',  badge: 'Rising',      initials: 'FW' },
  { name: 'Pixel Dreams',     films: 6,  earned: '$540',   views: '6.1K',  badge: 'New Creator', initials: 'PD' },
];

// ── Benefit icons ─────────────────────────────────────────────────────────────

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconRepeat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IconSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Benefits data ─────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: <IconLock />,    title: 'Keep full ownership',             desc: 'Your films remain yours. YouMakeTV distributes — you retain all intellectual property.',       iconColor: 'text-brand-purple', iconBg: 'bg-brand-purple/10' },
  { icon: <IconTag />,     title: 'Set your own prices',             desc: 'Charge what your content is worth. Free, pay-per-view, or anything in between.',              iconColor: 'text-brand-cyan',   iconBg: 'bg-brand-cyan/10'   },
  { icon: <IconRepeat />,  title: 'Earn recurring revenue',          desc: 'Every new view on existing films generates income. Build a catalog that pays over time.',      iconColor: 'text-emerald-600',  iconBg: 'bg-emerald-50'      },
  { icon: <IconSparkle />, title: 'Built for AI-generated films',    desc: 'Not a generic platform — every feature is designed around AI filmmaking workflows.',           iconColor: 'text-amber-600',    iconBg: 'bg-amber-50'        },
  { icon: <IconUsers />,   title: 'Reach viewers seeking AI films',  desc: 'Viewers on YouMakeTV are specifically looking for AI-generated entertainment.',                iconColor: 'text-brand-pink',   iconBg: 'bg-brand-pink/10'  },
  { icon: <IconCheck />,   title: 'No subscribers required',         desc: 'Start earning from day one. Upload, set a price, and earn when viewers buy.',                  iconColor: 'text-indigo-600',   iconBg: 'bg-indigo-50'       },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Who owns my films?',                  a: 'Creators retain ownership of their content and grant YouMakeTV the right to distribute it on the platform.' },
  { q: 'What AI tools can I use?',             a: 'Films created with Veo, Runway, Sora, Kling, Midjourney, ElevenLabs, Stable Diffusion, DALL·E, and similar AI tools are supported.' },
  { q: 'How do payouts work?',                 a: 'Creators earn a share of revenue generated from paid views and purchases. Earnings are tracked inside the creator portal and paid out monthly.' },
  { q: 'Can I upload free films?',             a: 'Yes. Creators can choose whether a film is free or paid.' },
  { q: 'Can I change my pricing later?',       a: 'Yes. Pricing can be updated at any time from the creator portal.' },
  { q: 'Can I remove my films?',               a: 'Yes. Creators can unpublish or remove content at any time, subject to platform policies.' },
  { q: 'Do I need subscribers to earn money?', a: 'No. Any creator can upload content and start earning when viewers purchase or watch their films.' },
  { q: 'How long does approval take?',         a: 'Most creator applications are reviewed within a few business days.' },
];

// ── Enhanced Dashboard preview ────────────────────────────────────────────────

function DashboardPreview() {
  const stats = [
    { label: 'Total Revenue',  value: '$3,420', color: 'text-brand-purple', bg: 'bg-brand-purple/5',  border: 'border-brand-purple/20', trend: '+24%' },
    { label: 'Total Views',    value: '24,800', color: 'text-brand-cyan',   bg: 'bg-brand-cyan/5',    border: 'border-brand-cyan/20',   trend: '+18%' },
    { label: 'Paid Watches',   value: '1,240',  color: 'text-brand-pink',   bg: 'bg-brand-pink/5',    border: 'border-brand-pink/20',   trend: '+31%' },
    { label: 'Conversion',     value: '12%',    color: 'text-emerald-600',  bg: 'bg-emerald-50',      border: 'border-emerald-200',     trend: '+5%'  },
  ];
  const films = [
    { title: 'Neon Shadows',  views: '4,240', rev: '$840', conv: '14%' },
    { title: 'Void Protocol', views: '3,820', rev: '$762', conv: '12%' },
    { title: 'Static Dreams', views: '2,910', rev: '$580', conv: '11%' },
    { title: 'Echo Chamber',  views: '2,100', rev: '$420', conv: '9%'  },
  ];
  const navItems = ['Dashboard', 'Content', 'Payouts', 'Analytics', 'Settings'];
  const chartBars = [52, 68, 58, 82, 74, 100];
  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="rounded-[2rem] overflow-hidden border border-slate-700/50 bg-white shadow-2xl pointer-events-none select-none ring-1 ring-white/10">
      {/* Window chrome */}
      <div className="flex items-center gap-3 bg-slate-950 px-5 py-3.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-xs text-slate-400 font-medium ml-1">YouMakeTV · Creator Dashboard</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-500">Live</span>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="flex" style={{ minHeight: 500 }}>
        {/* Sidebar */}
        <div className="hidden sm:flex w-44 flex-none flex-col border-r border-slate-100 bg-white p-3 gap-0.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 mb-2">
            <div className="h-8 w-8 rounded-xl bg-slate-950 flex items-center justify-center text-white text-[11px] font-bold flex-none">AN</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-950 truncate">AI Noir Studio</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-none" />
                <p className="text-[9px] text-slate-500">Verified creator</p>
              </div>
            </div>
          </div>
          {navItems.map((item, i) => (
            <div
              key={item}
              className={`rounded-xl px-3 py-2 text-[10px] font-medium ${i === 0 ? 'bg-slate-950 text-white' : 'text-slate-500'}`}
            >
              {item}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-slate-100">
            <div className="rounded-xl bg-brand-purple/8 border border-brand-purple/20 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold text-brand-purple">+ Upload Film</p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 sm:p-5 space-y-3.5 bg-slate-50/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-brand-purple font-semibold">Welcome back</p>
              <p className="text-[13px] font-semibold text-slate-950 mt-0.5">AI Noir Studio</p>
              <p className="text-[10px] text-slate-400">12 films · Analytics updated live</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 flex-none">
              + Upload
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-2.5`}>
                <p className="text-[8px] uppercase tracking-wide text-slate-400 leading-tight">{s.label}</p>
                <p className={`text-sm font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-emerald-600 mt-0.5 font-semibold">↑ {s.trend}</p>
              </div>
            ))}
          </div>

          {/* Payout banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-wide text-emerald-600 font-semibold">Pending payout</p>
              <p className="text-[13px] font-bold text-emerald-700 mt-0.5">$398.40</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] bg-emerald-600 text-white rounded-full px-2 py-0.5 font-semibold">Processing</span>
              <p className="text-[8px] text-slate-400 mt-1">Paid Jul 1, 2026</p>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl border border-slate-200 bg-white px-3 pt-3 pb-2 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-slate-800">Monthly Revenue</p>
              <p className="text-[9px] text-emerald-600 font-semibold">↑ 24% this period</p>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 52 }}>
              {chartBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm ${i === chartBars.length - 1 ? 'bg-brand-purple' : 'bg-brand-purple/25'}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[7px] text-slate-400">{chartMonths[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Film performance table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-5 gap-1 bg-slate-50 px-3 py-1.5 text-[8px] uppercase tracking-wide text-slate-400 font-semibold border-b border-slate-100">
              <span className="col-span-2">Film</span>
              <span>Views</span>
              <span>Revenue</span>
              <span>Conv.</span>
            </div>
            {films.map((f) => (
              <div key={f.title} className="grid grid-cols-5 gap-1 px-3 py-1.5 border-t border-slate-100 text-[9px] items-center">
                <span className="col-span-2 font-medium text-slate-900 truncate">{f.title}</span>
                <span className="text-slate-500">{f.views}</span>
                <span className="font-semibold text-slate-900">{f.rev}</span>
                <span className="font-semibold text-emerald-600">{f.conv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreatorPortal({ onStart, onDashboard, onViewDemo, onSignIn }: CreatorPortalProps) {
  const [showSticky, setShowSticky] = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setShowSticky(window.scrollY > 520);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="space-y-16">

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/50 px-8 py-14 sm:px-12 sm:py-20">
          <div className="absolute inset-0 bg-brand-soft opacity-80" />
          <div className="relative grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-center">

            {/* Left */}
            <div className="space-y-8">
              <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
                Creators
              </span>

              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 leading-[1.06]">
                Turn AI Movies<br />
                <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                  Into Income.
                </span>
              </h1>

              <p className="text-lg leading-8 text-slate-600 max-w-xl">
                Upload AI-generated films, set your own price, grow an audience, and earn revenue from viewers around the world.
              </p>

              <p className="text-sm leading-7 text-slate-500 max-w-xl">
                YouMakeTV is built exclusively for AI-generated entertainment. Publish films, trailers, and series — track performance and grow your creative business from one platform.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 pt-2">
                {[
                  { value: '$842k+',  label: 'Total creator payouts' },
                  { value: '$18.4k',  label: 'Highest creator earnings' },
                  { value: 'Up to 40%', label: 'Per paid view' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold text-slate-950">{s.value}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — action card */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl space-y-5">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-purple">Get started</p>
              <h2 className="text-xl font-semibold text-slate-950">Launch your first AI film today</h2>
              <p className="text-sm leading-7 text-slate-600">
                Complete a short onboarding to set up your profile, then upload your first film and start earning.
              </p>
              <div className="space-y-3 pt-1">
                <button
                  onClick={onStart}
                  className="w-full rounded-full bg-brand-purple px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-indigo"
                >
                  Start Creator Onboarding →
                </button>
                <button
                  onClick={onSignIn ?? onDashboard}
                  className="w-full text-center text-sm text-slate-500 hover:text-brand-purple transition font-medium py-2"
                >
                  Already a creator? Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DASHBOARD PREVIEW — major conversion element, above fold ──────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-800/60 bg-slate-950 shadow-2xl">
        <div className="relative overflow-hidden px-8 py-14 sm:px-12 sm:py-16">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          {/* Purple glow */}
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-purple/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.75fr] lg:items-center">

            {/* Left: headline + benefits + CTAs */}
            <div className="space-y-7">
              <span className="inline-flex rounded-full bg-brand-purple/20 border border-brand-purple/30 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple/90">
                Creator Dashboard
              </span>

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.1]">
                  Creators Are Earning.<br />
                  <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                    Track Everything.
                  </span>
                </h2>
                <p className="text-base leading-7 text-slate-300 max-w-sm">
                  Track earnings, film performance, audience growth, purchases, and engagement from a single dashboard built specifically for AI filmmakers.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  'Track every sale and purchase in real time',
                  'Monitor audience growth across all films',
                  'See top-performing films at a glance',
                  'Measure trailer-to-paid conversion rates',
                  'Understand viewer behavior and engagement',
                  'Manage your entire AI film catalog',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-purple text-white text-xs font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="space-y-3 pt-1">
                <button
                  onClick={onStart}
                  className="w-full rounded-full bg-brand-purple px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-indigo shadow-lg shadow-brand-purple/25"
                >
                  Start Creator Onboarding →
                </button>
                <button
                  onClick={onViewDemo ?? onDashboard}
                  className="w-full rounded-full border border-slate-600 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-slate-500"
                >
                  View Full Dashboard Demo
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Used by AI filmmakers to track performance and grow revenue.
              </p>
            </div>

            {/* Right: large dashboard preview */}
            <div className="w-full lg:translate-y-2">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CREATOR SPOTLIGHT ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-7">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Social proof</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-slate-950">Creator Spotlight</h2>
          <p className="mt-1 text-slate-500 text-sm">Real creators building real income on YouMakeTV.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {SPOTLIGHTS.map((creator) => (
            <div key={creator.name} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-slate-950 text-white text-sm font-bold">
                  {creator.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950">{creator.name}</h3>
                  <span className="inline-flex rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-purple">
                    {creator.badge}
                  </span>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-brand-purple/5 border border-brand-purple/15 px-5 py-4 text-center">
                <p className="text-3xl font-semibold text-brand-purple">{creator.earned}</p>
                <p className="text-xs text-slate-500 mt-1">earned on YouMakeTV</p>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span><strong className="text-slate-950">{creator.films}</strong> films</span>
                <span><strong className="text-slate-950">{creator.views}</strong> views</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. METRICS BAR ───────────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center sm:text-left">
          {[
            { value: '$842,000+', label: 'Total creator payouts',        accent: 'text-brand-purple' },
            { value: '$18,400',   label: 'Highest creator earnings',      accent: 'text-amber-600'   },
            { value: '$1,200',    label: 'Avg monthly creator earnings',  accent: 'text-emerald-600' },
            { value: '$2.99',     label: 'Average film price',            accent: 'text-brand-cyan'  },
          ].map((m) => (
            <div key={m.label} className="space-y-1.5">
              <p className={`text-3xl font-semibold ${m.accent}`}>{m.value}</p>
              <p className="text-sm text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. AI TOOLS ──────────────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Compatibility</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-slate-950">Works with your tools</h2>
          <p className="mt-2 text-slate-500 text-sm max-w-lg mx-auto">
            Upload films made with any leading AI video, image, or voice tool. If you made it with AI, it belongs here.
          </p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-6 justify-items-center">
          {AI_TOOLS.map((tool) => (
            <ToolBadge key={tool.name} {...tool} />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">+ any other AI video, image, or voice generation tool</p>
      </section>

      {/* ── 5. WHY CREATORS CHOOSE YOUMAKETV ─────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Benefits</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-slate-950">Why Creators Choose YouMakeTV</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-[1.75rem] border border-slate-200/70 bg-white shadow-soft p-6 flex gap-4">
              <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${b.iconBg} ${b.iconColor}`}>
                {b.icon}
              </span>
              <div>
                <h3 className="font-semibold text-slate-950 text-sm">{b.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Support</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-slate-950">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-950">{faq.q}</span>
                <span className="flex-none text-slate-400">
                  <IconChevron open={openFaq === i} />
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm leading-7 text-slate-600">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/40 px-8 py-16 sm:px-12 sm:py-20 text-center">
          <div className="absolute inset-0 bg-brand-soft opacity-70" />
          <div className="relative max-w-xl mx-auto space-y-6">
            <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple">
              Join YouMakeTV
            </span>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
              Ready to publish your first AI film?
            </h2>
            <p className="text-lg text-slate-600 leading-8">
              Join creators building audiences and earning revenue from AI-generated entertainment.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={onStart}
                className="w-full max-w-xs rounded-full bg-brand-purple px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-indigo"
              >
                Start Creator Onboarding →
              </button>
              <button
                onClick={onSignIn ?? onDashboard}
                className="text-sm text-slate-500 hover:text-brand-purple transition font-medium py-1"
              >
                Already a creator? Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. STICKY CTA ────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-slate-950/95 backdrop-blur-xl px-4 py-4 transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-white hidden sm:block">
            Ready to launch your AI film business?
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onStart}
              className="flex-1 sm:flex-none rounded-full bg-brand-purple px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-indigo"
            >
              Start Creator Onboarding
            </button>
            <button
              onClick={onSignIn ?? onDashboard}
              className="flex-none text-sm text-slate-400 hover:text-white transition font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
