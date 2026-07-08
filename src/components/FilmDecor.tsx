/**
 * Small on-brand decorative atoms built from the language of film:
 * a sprocket-hole film strip and a festival laurel. Cheap to render,
 * used to make the AI-film marketplace feel authored rather than generated.
 */

/** A horizontal film strip — a thin band of sprocket holes. Purely decorative. */
export function FilmStrip({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-[6px] overflow-hidden ${className}`}
    >
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-3 flex-none rounded-[2px] bg-current opacity-70"
        />
      ))}
    </div>
  );
}

/** Festival-style laurel wrapping a short label — the visual grammar of credibility. */
export function Laurel({ label = 'YMTV Certified' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-600">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3c-3 2-4 6-4 9s1 7 4 9" />
        <path d="M8 6c-1.5 1.2-2 3.2-2 6M8 10c-1 .8-1.4 2-1.5 3.5" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 scale-x-[-1]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3c-3 2-4 6-4 9s1 7 4 9" />
        <path d="M8 6c-1.5 1.2-2 3.2-2 6M8 10c-1 .8-1.4 2-1.5 3.5" />
      </svg>
    </span>
  );
}
