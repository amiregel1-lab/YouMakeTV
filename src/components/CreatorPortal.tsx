interface CreatorPortalProps {
  onStart: () => void;
  onDashboard: () => void;
  onDemo: () => void;
}

export default function CreatorPortal({ onStart, onDashboard, onDemo }: CreatorPortalProps) {
  const tools = ['Veo', 'Runway', 'Kling', 'Sora', 'Midjourney', 'ElevenLabs', 'DALL·E', 'Stable Diffusion'];

  return (
    <div className="space-y-10">

      {/* HERO */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
        <div className="relative overflow-hidden bg-brand-fade/50 px-8 py-12 sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-brand-soft opacity-80" />
          <div className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div className="space-y-7">
              <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
                Creator studio
              </span>
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 leading-[1.08]">
                Build your AI film business.<br />
                <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                  Monetize your creativity.
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                YouMakeTV.ai is the first platform built exclusively for AI-generated entertainment. Upload films, set your own price, track revenue, and grow a real audience — all from one creator studio.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 pt-2">
                {[
                  { value: '180+', label: 'Active creators' },
                  { value: '$4.2k', label: 'Avg creator earnings' },
                  { value: '30–40%', label: 'Revenue share' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold text-slate-950">{s.value}</p>
                    <p className="text-sm text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Supported tools */}
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-3">Supported AI tools</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action card */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-brand-purple">Get started</p>
              <h2 className="text-xl font-semibold text-slate-950">Launch your studio in minutes</h2>
              <p className="text-sm leading-7 text-slate-600">Complete a short onboarding to set up your creator profile, then upload your first film and start earning.</p>

              <div className="pt-2 space-y-3">
                <button
                  onClick={onStart}
                  className="w-full rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start creator onboarding →
                </button>
                <button
                  onClick={onDashboard}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Open creator dashboard
                </button>
                <button
                  onClick={onDemo}
                  className="w-full rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-5 py-4 text-sm font-semibold text-brand-cyan transition hover:bg-brand-cyan/10"
                >
                  Explore demo creator workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400 mb-2">How it works</p>
        <h2 className="text-2xl font-semibold text-slate-950 mb-8">From creation to income in 4 steps</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '01', title: 'Create your film', body: 'Use any AI tool — Veo, Runway, Sora, Kling, Midjourney, ElevenLabs — to produce your content.' },
            { step: '02', title: 'Set up your studio', body: 'Complete onboarding, verify your identity, and configure your creator profile and pricing.' },
            { step: '03', title: 'Upload & price', body: 'Submit your film, set a price or make it free, and add a trailer to drive paid conversions.' },
            { step: '04', title: 'Track & earn', body: 'Monitor views, paid watches, revenue, and conversion rates from your creator analytics dashboard.' },
          ].map((item) => (
            <div key={item.step} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-3xl font-semibold text-brand-purple/30">{item.step}</p>
              <p className="mt-4 font-semibold text-slate-950">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT THE DASHBOARD ANSWERS */}
      <section className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400 mb-2">Creator analytics</p>
            <h2 className="text-2xl font-semibold text-slate-950 mb-4">Your studio dashboard answers everything</h2>
            <p className="text-slate-600 leading-7">Built like a Stripe + YouTube Studio hybrid. Every metric you need to grow a real audience and maximize earnings.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { q: 'How much did I earn?', color: 'border-brand-purple/20 bg-brand-purple/5 text-brand-purple' },
              { q: 'Which films perform best?', color: 'border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan' },
              { q: 'What content converts?', color: 'border-brand-pink/20 bg-brand-pink/5 text-brand-pink' },
              { q: 'Where do viewers come from?', color: 'border-indigo-200 bg-indigo-50 text-indigo-600' },
              { q: 'Are my views growing?', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
              { q: 'What should I upload next?', color: 'border-amber-200 bg-amber-50 text-amber-700' },
            ].map((item) => (
              <div key={item.q} className={`rounded-[1.5rem] border px-4 py-3 text-sm font-semibold ${item.color}`}>
                {item.q}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
