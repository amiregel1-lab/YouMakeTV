export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-pink via-brand-purple to-brand-cyan text-white shadow-cinematic">
        <div className="absolute inset-2 rounded-[1.4rem] bg-slate-950/95" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/0">
          <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff4aad" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path d="M14 18c0-6.627 5.373-12 12-12h12c6.627 0 12 5.373 12 12v20c0 6.627-5.373 12-12 12H26c-6.627 0-12-5.373-12-12V18Z" fill="#030712" stroke="url(#brandGradient)" strokeWidth="4" />
            <path d="M16 18l-6 8v10l6 8" stroke="url(#brandGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 20l17 12-17 12V20Z" fill="url(#brandGradient)" />
            <path d="M46 12l6-6" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M38 10l10-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="text-left">
        <div className="flex items-end gap-1 text-sm font-semibold tracking-[0.16em] text-slate-900 uppercase sm:text-base">
          <span>YouMakeTV</span>
          <span className="text-brand-cyan">.ai</span>
        </div>
        <p className="text-sm text-slate-500 sm:text-base">Creator-first AI film marketplace</p>
      </div>
    </div>
  );
}
