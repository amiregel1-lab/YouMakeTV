import { useState, useEffect } from 'react';

interface CreatorPortalProps {
  onStart: () => void;
  onDashboard: () => void;
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

// ── Dashboard preview ─────────────────────────────────────────────────────────

function DashboardPreview() {
  const stats = [
    { label: 'Revenue',      value: '$3,420', color: 'text-brand-purple' },
    { label: 'Total Views',  value: '24,800', color: 'text-brand-cyan'   },
    { label: 'Paid Watches', value: '1,240',  color: 'text-brand-pink'   },
    { label: 'Conversion',   value: '12%',    color: 'text-emerald-600'  },
  ];
  const films = [
    { title: 'Neon Shadows',   views: '4,240', rev: '$840', status: 'Approved' },
    { title: 'Void Protocol',  views: '3,820', rev: '$762', status: 'Approved' },
    { title: 'Static Dreams',  views: '2,910', rev: '$580', status: 'Approved' },
  ];
  const navItems = ['Dashboard', 'Content', 'Payouts', 'Analytics', 'Settings'];

  return (
    <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-2xl pointer-events-none select-none">
      {/* Window chrome */}
      <div className="flex items-center gap-3 bg-slate-950 px-5 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <div className="h-3 w-3 rounded-full bg-green-400/70" />
        </div>
        <span className="text-xs text-slate-400 font-medium">YouMakeTV · Creator Dashboard</span>
      </div>

      {/* Dashboard body */}
      <div className="flex" style={{ minHeight: 340 }}>
        {/* Sidebar */}
        <div className="hidden sm:flex w-40 flex-none flex-col border-r border-slate-100 bg-white p-2.5 gap-0.5">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-slate-950 flex items-center justify-center text-white text-[10px] font-bold">AN</div>
            <div>
              <p className="text-[10px] font-semibold text-slate-950 leading-tight">AI Noir Studio</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-emerald-400" />
                <p className="text-[8px] text-slate-500">Verified</p>
              </div>
            </div>
          </div>
          {navItems.map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-medium ${i === 0 ? 'bg-slate-950 text-white' : 'text-slate-500'}`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 sm:p-5 space-y-4 bg-slate-50/60">
          <div>
            <p className="text-[8px] uppercase tracking-widest text-brand-purple font-semibold">Welcome back</p>
            <p className="text-xs font-semibold text-slate-950 mt-0.5">AI Noir Studio</p>
            <p className="text-[9px] text-slate-400 mt-0.5">12 films · Analytics updated live</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">{s.label}</p>
                <p className={`text-sm font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Payout banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-wide text-emerald-600 font-semibold">Pending payout</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">$398.40</p>
            </div>
            <span className="text-[9px] bg-emerald-600 text-white rounded-full px-2 py-0.5 font-semibold">Processing</span>
          </div>

          {/* Film table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 gap-1 bg-slate-50 px-3 py-1.5 text-[8px] uppercase tracking-wide text-slate-400 font-semibold">
              <span className="col-span-2">Film</span><span>Views</span><span>Revenue</span>
            </div>
            {films.map((f) => (
              <div key={f.title} className="grid grid-cols-4 gap-1 px-3 py-1.5 border-t border-slate-100 text-[9px]">
                <span className="col-span-2 font-medium text-slate-900 truncate">{f.title}</span>
                <span className="text-slate-500">{f.views}</span>
                <span className="font-semibold text-slate-900">{f.rev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreatorPortal({ onStart, onDashboard }: CreatorPortalProps) {
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
                  onClick={onDashboard}
                  className="w-full text-center text-sm text-slate-500 hover:text-brand-purple transition font-medium py-2"
                >
                  Already a creator? Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CREATOR SPOTLIGHT ─────────────────────────────────────────────── */}
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

      {/* ── 6. DASHBOARD PREVIEW ─────────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Creator tools</p>
            <h2 className="text-2xl font-semibold text-slate-950">Everything you need to grow</h2>
            <p className="text-slate-500 leading-7 text-sm">
              Your creator dashboard gives you real-time visibility into revenue, views, paid watches, and conversion rates — so you always know what's working.
            </p>
            <ul className="space-y-2.5">
              {[
                'Revenue & earnings tracking',
                'Per-film analytics breakdown',
                'Trailer-to-paid conversion rate',
                'Monthly payout history',
                'Audience engagement insights',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onStart}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start Creator Onboarding →
            </button>
          </div>
          <DashboardPreview />
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
                onClick={onDashboard}
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
              onClick={onDashboard}
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
