interface CreatorPortalProps {
  onStart: () => void;
  onDashboard: () => void;
  onDemo: () => void;
}

export default function CreatorPortal({ onStart, onDashboard, onDemo }: CreatorPortalProps) {
  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-fade/50 px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-brand-soft opacity-80" />
        <div className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-brand-pink/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-pink">
              Creator studio
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Build your AI film studio and launch premium storytelling.</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              YouMakeTV.ai is built for creators who want fast publishing, transparent pricing, and modern studio analytics.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-brand-purple/20 bg-white/80 p-5">
                <p className="font-semibold text-slate-950">Creator profile</p>
                <p className="mt-2 text-sm text-slate-600">Verify identity, manage your studio credentials, and unlock creator tools.</p>
              </div>
              <div className="rounded-[1.75rem] border border-brand-cyan/20 bg-white/80 p-5">
                <p className="font-semibold text-slate-950">Monetization control</p>
                <p className="mt-2 text-sm text-slate-600">Set prices, upload trailers, and track revenue in a premium dashboard.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-purple">Quick actions</p>
            <div className="mt-6 grid gap-4">
              <button onClick={onStart} className="rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                Start onboarding
              </button>
              <button onClick={onDashboard} className="rounded-full border border-slate-300 bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-900">
                Open creator dashboard
              </button>
              <button onClick={onDemo} className="rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-4 text-sm font-semibold text-brand-cyan transition hover:bg-brand-cyan/15">
                View demo creator workspace
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-600">Creator onboarding and dashboard are mocked in this prototype, with structure ready for real KYC, payments and uploads.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
