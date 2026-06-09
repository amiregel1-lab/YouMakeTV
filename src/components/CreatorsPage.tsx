import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from './SEOHead';

// ── Data ──────────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h.008v.008H20.25v-.008zm0 3.75h.008v.008H20.25v-.008z" />
      </svg>
    ),
    title: 'Side-Hustle Creators',
    desc: 'Upload between jobs or after hours. No minimum commitment required.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Independent Filmmakers',
    desc: 'Distribute your work globally without needing a traditional studio deal.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI Animation Creators',
    desc: 'Build animated worlds and visual stories with AI generation tools.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Documentary Creators',
    desc: 'Explore real-world themes and narratives through an AI lens.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Genre Storytellers',
    desc: 'Sci-fi, horror, thriller, comedy — every genre finds an audience here.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: 'Professional AI Studios',
    desc: 'Scale your production operation with full studio branding and analytics.',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Create your creator account',
    desc: 'Sign up and set up your studio profile. Add your studio name, bio, and brand.',
  },
  {
    num: '02',
    title: 'Complete identity verification',
    desc: 'Verify your identity and confirm ownership of your uploaded content.',
  },
  {
    num: '03',
    title: 'Upload your film package',
    desc: 'Submit everything needed for your film to go live:',
    items: ['Full film file', 'Trailer', 'Cover poster', 'Backdrop / hero image', 'Title & description', 'Genre & runtime', 'Suggested price'],
  },
  {
    num: '04',
    title: 'Submit for review',
    desc: 'Once your package is complete, submit it for platform review.',
  },
  {
    num: '05',
    title: 'Platform review',
    desc: 'Our team reviews every submission for:',
    items: ['Content quality', 'Copyright & ownership', 'Policy compliance', 'Technical quality', 'Pricing appropriateness'],
  },
  {
    num: '06',
    title: 'Approved films go live',
    desc: 'Approved films are published and immediately available for viewers to purchase or stream. You start earning.',
  },
];

const BENEFITS = [
  { title: 'Monetize AI Films', desc: 'Earn a revenue share from every paid view' },
  { title: 'Keep Ownership', desc: 'You retain full creative and legal ownership' },
  { title: 'Reach AI-Focused Viewers', desc: 'Audience that actively seeks AI content' },
  { title: 'Upload Unlimited Projects', desc: 'No cap on how many films you publish' },
  { title: 'Track Performance', desc: 'Real-time analytics and payout dashboard' },
  { title: 'Grow Revenue Share', desc: 'Tier up to 40% as your paid views grow' },
  { title: 'Build Your Studio Brand', desc: 'Full branded studio profile on the platform' },
  { title: 'Get Platform Spotlight', desc: 'Top studios get featured placement' },
];

const REVIEW_ITEMS = [
  'Copyright and ownership verification',
  'Content quality assessment',
  'Technical quality check (resolution, audio)',
  'Policy compliance review',
  'Pricing appropriateness',
  'Metadata accuracy',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Who can become a creator?',
    a: 'Anyone who creates original AI-generated film content. There is no minimum audience requirement — you can start with zero followers. We accept individual creators, collectives, and fully formed studios.',
  },
  {
    q: 'Do I keep ownership of my films?',
    a: 'Yes. You retain full creative and legal ownership of your content. By uploading, you grant YouMakeTV a non-exclusive license to distribute your film on the platform. You can request removal at any time.',
  },
  {
    q: 'How much can I earn?',
    a: 'Starter creators earn 30% of paid-view revenue. That grows to 35% after 1,000 paid views (Growth tier) and 40% after 5,000 paid views (Pro tier). Payouts are processed monthly.',
  },
  {
    q: 'What counts toward tier upgrades?',
    a: 'Total cumulative paid views across all your approved films on the platform. Free-view films count toward your audience but not your tier upgrade threshold.',
  },
  {
    q: 'Can I upload free films?',
    a: 'Yes. Offering a film for free is a valid strategy to build your audience, earn followers, and increase conversion to your paid films. Free films still go through the same review process.',
  },
  {
    q: 'Can I choose my own price?',
    a: 'You suggest a price during submission. YouMakeTV reviews and approves a final pricing range based on film quality, runtime, category, and platform standards. You\'ll be notified if adjustments are made.',
  },
  {
    q: 'Can I upload trailers?',
    a: 'Yes, and it\'s strongly encouraged. Trailers significantly improve conversion rates. A trailer is a required part of your film submission package.',
  },
  {
    q: 'Can I upload cover art and backdrop images?',
    a: 'Yes. Cover poster and backdrop (hero) images are part of the required film package. High-quality artwork directly affects how your film is featured across the platform.',
  },
  {
    q: 'How long does review take?',
    a: 'Typically 3–7 business days after a complete submission is received. Incomplete packages are returned for revision before the review clock starts.',
  },
  {
    q: 'Can YouMakeTV reject a film?',
    a: 'Yes. Films may be rejected for copyright issues, quality below platform standards, policy violations, or pricing that doesn\'t fit the platform\'s range. You\'ll receive feedback so you can revise and resubmit.',
  },
  {
    q: 'Do I need an existing audience?',
    a: 'No. Many successful creators on the platform started with zero audience. The discovery features and platform promotion help new studios get found.',
  },
  {
    q: 'What tools do I need to create AI films?',
    a: 'YouMakeTV is tool-agnostic. We accept content made with Sora, Runway, Kling, Pika, Midjourney, DALL·E, ElevenLabs, or any combination of AI tools. What matters is the quality and originality of the final film.',
  },
];

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-slate-900 text-sm sm:text-base">{q}</span>
        <svg
          className={`h-5 w-5 flex-none text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-slate-600 text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ── Dashboard preview ─────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Creator Dashboard</p>
          <p className="text-xs text-slate-500 mt-0.5">Lumen Creative</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          Demo Preview
        </span>
      </div>

      {/* 4 key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Total Views', value: '12,450', change: '+18%' },
          { label: 'Paid Views',  value: '3,780',  change: '+22%' },
          { label: 'Revenue',     value: '$847',   change: '+15%' },
          { label: 'Conversion',  value: '30.4%',  change: '+2.1%' },
        ].map(({ label, value, change }) => (
          <div key={label} className="rounded-xl bg-slate-900 p-3">
            <p className="text-base font-bold text-white tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
            <p className="text-[10px] text-emerald-400 mt-1">{change} this month</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-slate-800 mb-5" />

      {/* Top film */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-8 rounded-lg bg-gradient-to-b from-indigo-800 to-slate-800 flex-none shadow" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Top Performing Film</p>
          <p className="text-sm font-semibold text-white mt-0.5">Neon Echoes</p>
          <p className="text-xs text-slate-500 mt-0.5">4,200 views · $421.20 earned</p>
        </div>
      </div>

      {/* Payout + film status */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pending Payout</p>
          <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">$423.60</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Next: end of month</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Film Status</p>
          <p className="text-sm font-semibold text-white mt-1">3 Approved</p>
          <p className="text-xs text-amber-400 mt-0.5">1 Under Review</p>
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
    <div className="space-y-6">
      <SEOHead
        title="Become a Creator | YouMakeTV.ai"
        description="Turn your AI films into income. Publish, monetize, and grow your audience on YouMakeTV.ai. Join as a creator today — 30–40% revenue share."
        canonical="/creators"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Become a Creator — YouMakeTV.ai',
          description: 'Turn your AI films into income. Publish, monetize, and grow your audience on YouMakeTV.ai.',
          url: 'https://youmaketv.ai/creators',
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 lg:p-16">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-slate-950 to-indigo-950/40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple mb-6">
            For AI Filmmakers
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Turn AI Films<br />Into Income
          </h1>
          <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
            Whether you're creating AI films as a side hustle or building a full production studio,
            YouMakeTV helps you publish, monetize, and grow your audience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/creator/onboarding')}
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 shadow-lg"
            >
              Become a Creator →
            </button>
            <button
              onClick={() => navigate('/creatorsLogin')}
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Creator Login
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '30–40%', label: 'Revenue Share' },
          { value: '100+',   label: 'Films on Platform' },
          { value: 'Free',   label: 'To Join' },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold text-slate-950">{value}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Who It's For ─────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">
            Built For Every Type of AI Filmmaker
          </h2>
          <p className="mt-3 text-slate-500 leading-relaxed">
            You don't need a large audience or a traditional studio.
            If you create compelling AI-generated entertainment, you can apply.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {PERSONAS.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-4">
                {icon}
              </div>
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">How It Works</h2>
          <p className="mt-3 text-slate-500">From first upload to first payout in six steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map(({ num, title, desc, items }) => (
            <div key={num} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <span className="text-3xl font-black text-slate-200 leading-none">{num}</span>
              <p className="font-semibold text-slate-950 mt-2 text-sm">{title}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
              {items && (
                <ul className="mt-3 space-y-1">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <span className="text-brand-purple mt-0.5 flex-none">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Revenue Tiers ────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] bg-slate-950 overflow-hidden p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            Earn More As Your Audience Grows
          </h2>
          <p className="mt-3 text-slate-400">
            Your revenue share increases automatically as your paid views accumulate.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Starter */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Starter</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">30</span>
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">Revenue Share</p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs text-slate-400">
              Default for all new creators
            </div>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-6 relative">
            <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3">Growth</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">35</span>
              <span className="text-2xl font-bold text-sky-400/70">%</span>
            </div>
            <p className="text-sm text-sky-300/70 mb-4">Revenue Share</p>
            <div className="rounded-xl border border-sky-500/20 bg-sky-900/20 px-3 py-2.5">
              <p className="text-xs font-semibold text-sky-400">After 1,000 paid views</p>
              <p className="text-xs text-slate-500 mt-0.5">Across all approved films</p>
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-violet-500/40 bg-violet-950/20 p-6 relative">
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                Highest
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">40</span>
              <span className="text-2xl font-bold text-violet-400/70">%</span>
            </div>
            <p className="text-sm text-violet-300/70 mb-4">Revenue Share</p>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 px-3 py-2.5">
              <p className="text-xs font-semibold text-violet-400">After 5,000 paid views</p>
              <p className="text-xs text-slate-500 mt-0.5">Across all approved films</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">
            Flexible Pricing, Reviewed for Quality
          </h2>
          <p className="mt-3 text-slate-500 leading-relaxed">
            You suggest a price during submission. YouMakeTV reviews and approves a final pricing
            range based on quality, runtime, category, and platform standards.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            {
              tier: 'Free',
              range: '$0',
              desc: 'Build your audience. Free films convert viewers to paid content.',
              color: 'border-slate-200 bg-slate-50',
              label: 'text-slate-600',
            },
            {
              tier: 'Low-Cost',
              range: '$0.99 – $2.49',
              desc: 'Accessible pricing for shorts, episodes, and new releases.',
              color: 'border-sky-100 bg-sky-50',
              label: 'text-sky-700',
            },
            {
              tier: 'Premium',
              range: '$2.50 – $4.99',
              desc: 'For feature-length, high-quality productions and established studios.',
              color: 'border-violet-100 bg-violet-50',
              label: 'text-violet-700',
            },
          ].map(({ tier, range, desc, color, label }) => (
            <div key={tier} className={`rounded-2xl border p-5 ${color}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest ${label} mb-2`}>{tier}</p>
              <p className="text-xl font-bold text-slate-950">{range}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 max-w-md mx-auto">
          Final pricing is approved by YouMakeTV. The platform may adjust pricing based on quality, demand, and category standards.
        </p>
      </section>

      {/* ── Dashboard Preview ─────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 sm:p-12">
        <div className="text-center max-w-lg mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">
            See Your Performance in Real Time
          </h2>
          <p className="mt-3 text-slate-500">
            Track views, revenue, conversions, and payouts — all in your creator dashboard.
          </p>
        </div>
        <DashboardPreview />
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8 sm:p-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 text-center mb-10">
          Everything You Need to Succeed
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BENEFITS.map(({ title, desc }) => (
            <div key={title} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-semibold text-slate-900 text-sm leading-tight">{title}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Review Process ───────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 sm:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">Every Film Is Reviewed</h2>
            <p className="mt-3 text-slate-500 leading-relaxed">
              To protect both viewers and creators, every submission is reviewed by our team before publication.
              This keeps quality high and the platform trustworthy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {REVIEW_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <svg className="h-4 w-4 flex-none text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8 sm:p-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 text-center mb-8">
            Frequently Asked Questions
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

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 lg:p-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-slate-950 to-indigo-950/30 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready To Publish Your First AI Film?
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Create your account, upload your film package, and submit it for review.
            Start earning from day one.
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
            Free to join. No upfront fees. Revenue share only.
          </p>
        </div>
      </section>
    </div>
  );
}
