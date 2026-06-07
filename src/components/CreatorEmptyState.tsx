interface CreatorEmptyStateProps {
  onUpload: () => void;
  onGuidelines: () => void;
}

export default function CreatorEmptyState({ onUpload, onGuidelines }: CreatorEmptyStateProps) {
  const cards = [
    { title: 'Views and engagement', description: 'Track trailer interest, watch counts, and audience momentum for every AI film.' },
    { title: 'Revenue and payouts', description: 'See total revenue, platform fees, and creator earnings in one clean dashboard.' },
    { title: 'Film performance analytics', description: 'Compare titles, conversion rates, and top traffic sources to optimize your lineup.' },
  ];

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-soft">
      <div className="relative rounded-[2.5rem] bg-brand-fade/30 p-10">
        <div className="absolute inset-0 bg-brand-soft opacity-80" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-brand-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-cyan">
              Creator dashboard
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Your creator studio is ready.</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Complete onboarding, then upload your first AI film, trailer, and thumbnail whenever you are ready.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={onUpload} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload first film
              </button>
              <button onClick={onGuidelines} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                View upload guidelines
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {cards.map((card) => (
              <div key={card.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{card.title}</p>
                <p className="mt-3 text-sm text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
