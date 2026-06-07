interface Metric {
  label: string;
  value: string;
  hint?: string;
  accent?: 'purple' | 'cyan' | 'pink' | 'green' | 'default';
}

interface AnalyticsCardsProps {
  metrics: Metric[];
}

const accentStyles: Record<string, string> = {
  purple: 'border-brand-purple/30 bg-brand-purple/5',
  cyan: 'border-brand-cyan/30 bg-brand-cyan/5',
  pink: 'border-brand-pink/30 bg-brand-pink/5',
  green: 'border-emerald-200 bg-emerald-50',
  default: 'border-slate-200 bg-white',
};

const accentValueStyles: Record<string, string> = {
  purple: 'text-brand-purple',
  cyan: 'text-brand-cyan',
  pink: 'text-brand-pink',
  green: 'text-emerald-600',
  default: 'text-slate-950',
};

export default function AnalyticsCards({ metrics }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const accent = metric.accent ?? 'default';
        const isPrimary = index === 0;
        return (
          <div
            key={metric.label}
            className={`group rounded-[1.75rem] border p-6 shadow-sm transition hover:shadow-glow ${accentStyles[accent]}`}
          >
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            <p className={`mt-4 font-semibold ${isPrimary ? 'text-4xl' : 'text-3xl'} ${accentValueStyles[accent]}`}>
              {metric.value}
            </p>
            {metric.hint && (
              <p className="mt-2 text-sm text-slate-500">{metric.hint}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
