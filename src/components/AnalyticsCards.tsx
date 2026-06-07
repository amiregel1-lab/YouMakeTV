interface AnalyticsCardsProps {
  metrics: Array<{ label: string; value: string; hint?: string }>;
}

export default function AnalyticsCards({ metrics }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-purple/50 hover:shadow-glow">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{metric.value}</p>
          {metric.hint ? <p className="mt-2 text-sm text-slate-600">{metric.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
