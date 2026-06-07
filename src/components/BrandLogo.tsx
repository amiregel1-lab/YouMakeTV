export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Retro TV icon */}
      <svg viewBox="0 0 122 112" className="h-10 w-10 flex-shrink-0" fill="none" aria-hidden="true">
        <defs>
          {/* Clip screen to rounded rect */}
          <clipPath id="ymtv-screen">
            <rect x="10" y="28" width="82" height="52" rx="8" />
          </clipPath>
        </defs>

        {/* ── Antennas ── */}
        {/* Left antenna: from upper-left of TV body, angling up-left */}
        <line x1="30" y1="24" x2="11" y2="2" stroke="#0d1b2e" strokeWidth="5" strokeLinecap="round" />
        <circle cx="11" cy="2" r="4" fill="#0d1b2e" />
        {/* Right antenna: from upper-right, angling up-right */}
        <line x1="72" y1="24" x2="91" y2="2" stroke="#0d1b2e" strokeWidth="5" strokeLinecap="round" />
        <circle cx="91" cy="2" r="4" fill="#0d1b2e" />

        {/* ── TV body — rounded rect + chat-bubble tail ── */}
        {/*
          Path: top-left → top-right (arc) → bottom-right (arc)
          → part of bottom → tail down → tail back up → rest of bottom → bottom-left (arc) → left side (arc) → close
        */}
        <path
          d="M15,24 H87 a13,13 0 0 1 13,13 V81 a13,13 0 0 1 -13,13 H52 L43,108 L40,94 H15 a13,13 0 0 1 -13,-13 V37 a13,13 0 0 1 13,-13 Z"
          fill="#0d1b2e"
        />

        {/* ── Screen: vertical colour bands clipped to rounded rect ── */}
        <g clipPath="url(#ymtv-screen)">
          <rect x="10"  y="28" width="17" height="52" fill="#ff4aad" />
          <rect x="27"  y="28" width="17" height="52" fill="#d946ef" />
          <rect x="44"  y="28" width="17" height="52" fill="#a855f7" />
          <rect x="61"  y="28" width="17" height="52" fill="#60a5fa" />
          <rect x="78"  y="28" width="14" height="52" fill="#22d3ee" />
        </g>

        {/* ── Play triangle (white, centred in screen) ── */}
        <polygon points="44,41 76,54 44,67" fill="white" />

        {/* ── Sparkle stars ── */}
        {/* Pink sparkle — large, just right of right antenna tip */}
        <path d="M99,14 L101.2,20 L107,22 L101.2,24 L99,30 L96.8,24 L91,22 L96.8,20 Z" fill="#ff4aad" />
        {/* Blue sparkle — medium, upper-right of pink */}
        <path d="M112,5 L113.5,9.5 L118,11 L113.5,12.5 L112,17 L110.5,12.5 L106,11 L110.5,9.5 Z" fill="#3b82f6" />
        {/* Purple sparkle — small, between pink and blue */}
        <path d="M106,21 L107.2,24.5 L110.5,25.5 L107.2,26.5 L106,30 L104.8,26.5 L101.5,25.5 L104.8,24.5 Z" fill="#a855f7" />
      </svg>

      {/* ── Wordmark ── */}
      <div className="flex items-baseline leading-none">
        <span className="text-xl font-extrabold tracking-tight text-[#0d1b2e]">YouMakeTV</span>
        <span className="text-xl font-extrabold tracking-tight text-[#2563eb]">.ai</span>
      </div>
    </div>
  );
}
