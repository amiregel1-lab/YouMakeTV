import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'public', 'og-image.png');

// 1200 × 630 — standard OG image size
const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Background gradient: very dark navy → deep purple -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#07071a"/>
      <stop offset="55%"  stop-color="#0d0622"/>
      <stop offset="100%" stop-color="#120828"/>
    </linearGradient>

    <!-- Radial glow behind logo -->
    <radialGradient id="glow" cx="50%" cy="45%" r="38%">
      <stop offset="0%"   stop-color="#7c3aed" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>

    <!-- TV screen gradient (pink → purple → cyan) -->
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#ec4899"/>
      <stop offset="35%"  stop-color="#a855f7"/>
      <stop offset="65%"  stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Vertical stripe overlay on screen -->
    <linearGradient id="stripes" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="14%"  stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="28%"  stop-color="#fff" stop-opacity="0"/>
      <stop offset="42%"  stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="56%"  stop-color="#fff" stop-opacity="0"/>
      <stop offset="70%"  stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="84%"  stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.04"/>
    </linearGradient>

    <!-- Subtle vignette -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>

    <!-- Clip for TV screen -->
    <clipPath id="screenClip">
      <rect x="0" y="0" width="166" height="124" rx="10" ry="10"/>
    </clipPath>

    <!-- Purple bottom accent gradient -->
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#ec4899" stop-opacity="0"/>
      <stop offset="20%"  stop-color="#a855f7" stop-opacity="0.8"/>
      <stop offset="50%"  stop-color="#06b6d4" stop-opacity="1"/>
      <stop offset="80%"  stop-color="#a855f7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- ── Background ── -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Subtle grid lines -->
  <g stroke="#ffffff" stroke-opacity="0.025" stroke-width="1">
    <line x1="0"    y1="157" x2="${W}" y2="157"/>
    <line x1="0"    y1="315" x2="${W}" y2="315"/>
    <line x1="0"    y1="472" x2="${W}" y2="472"/>
    <line x1="300"  y1="0"   x2="300"  y2="${H}"/>
    <line x1="600"  y1="0"   x2="600"  y2="${H}"/>
    <line x1="900"  y1="0"   x2="900"  y2="${H}"/>
  </g>

  <!-- Glow behind logo -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Vignette -->
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <!-- ══════════════════════════════════════════
       TV ICON  (centred at x=600, top at y=112)
       TV body: 220×190 (with tail: +26px height)
       ══════════════════════════════════════════ -->
  <g transform="translate(490, 108)">

    <!-- Outer TV body shadow/glow -->
    <rect x="-6" y="-6" width="232" height="274" rx="28" ry="28"
          fill="#7c3aed" fill-opacity="0.12"/>

    <!-- TV body -->
    <rect x="0" y="0" width="220" height="185" rx="22" ry="22"
          fill="#0d0d1a" stroke="#1e1e3a" stroke-width="2"/>

    <!-- Speech bubble tail (centred under TV) -->
    <polygon points="82,183 138,183 110,216" fill="#0d0d1a"/>

    <!-- Antennas -->
    <line x1="76" y1="0" x2="48" y2="-38" stroke="#0d0d1a" stroke-width="9" stroke-linecap="round"/>
    <line x1="144" y1="0" x2="172" y2="-38" stroke="#0d0d1a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="48"  cy="-42" r="9" fill="#0d0d1a"/>
    <circle cx="172" cy="-42" r="9" fill="#0d0d1a"/>

    <!-- TV screen bezel -->
    <rect x="17" y="17" width="186" height="148" rx="12" ry="12"
          fill="#1a1a2e" stroke="#2d2d4e" stroke-width="1.5"/>

    <!-- Screen gradient fill -->
    <g transform="translate(20, 20)">
      <rect width="180" height="142" rx="10" ry="10" fill="url(#screen)" clip-path="url(#screenClip)"/>
      <!-- Stripe overlay -->
      <rect width="180" height="142" rx="10" ry="10" fill="url(#stripes)" clip-path="url(#screenClip)"/>
      <!-- Screen sheen highlight -->
      <rect width="180" height="40" rx="10" ry="10" fill="#fff" fill-opacity="0.06"/>
    </g>

    <!-- Play button (white triangle, centred on screen) -->
    <polygon points="97,71 97,119 139,95" fill="white" fill-opacity="0.95"/>
    <!-- Play button subtle shadow -->
    <polygon points="97,71 97,119 139,95" fill="white" fill-opacity="0.1" transform="translate(2,2)"/>

    <!-- Sparkles -->
    <!-- Pink sparkle top-right -->
    <g transform="translate(194, -34)" fill="#ec4899">
      <polygon points="0,-9 2,-2 9,0 2,2 0,9 -2,2 -9,0 -2,-2" opacity="0.95"/>
    </g>
    <!-- Cyan sparkle -->
    <g transform="translate(215, -58)" fill="#06b6d4">
      <polygon points="0,-7 1.5,-1.5 7,0 1.5,1.5 0,7 -1.5,1.5 -7,0 -1.5,-1.5" opacity="0.85"/>
    </g>
    <!-- Purple sparkle small -->
    <g transform="translate(178, -52)" fill="#a855f7">
      <polygon points="0,-5 1,-1 5,0 1,1 0,5 -1,1 -5,0 -1,-1" opacity="0.8"/>
    </g>
  </g>

  <!-- ══════════════════════════════════════════
       WORDMARK: YouMakeTV.ai
       ══════════════════════════════════════════ -->
  <!-- "YouMakeTV" in white-ish -->
  <text
    x="600" y="396"
    text-anchor="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="800"
    font-size="72"
    letter-spacing="-2"
    fill="#f1f0ff"
  >YouMakeTV</text>

  <!-- ".ai" in brand cyan/blue -->
  <text
    x="600" y="396"
    text-anchor="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="800"
    font-size="72"
    letter-spacing="-2"
    fill="transparent"
  >YouMakeTV<tspan fill="#38bdf8">.ai</tspan></text>

  <!-- Kerning fix: overlay just ".ai" to the right of "YouMakeTV" -->
  <!-- We use a combined approach: full text in near-white, then overlay .ai in cyan -->
  <!-- (SVG tspan handles this inline — the above already does it) -->

  <!-- ── Tagline ── -->
  <text
    x="600" y="448"
    text-anchor="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="400"
    font-size="26"
    letter-spacing="0.5"
    fill="#94a3b8"
  >Watch &amp; Publish AI-Generated Movies</text>

  <!-- ── Bottom accent line ── -->
  <rect x="160" y="530" width="880" height="2.5" rx="1.25" fill="url(#accentLine)"/>

  <!-- ── Corner watermarks (subtle) ── -->
  <text x="52" y="590"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="16" font-weight="500" fill="#334155" letter-spacing="0.5"
  >youmaketv.ai</text>
  <text x="${W - 52}" y="590"
    text-anchor="end"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="16" font-weight="500" fill="#334155" letter-spacing="0.5"
  >AI Cinema Platform</text>

</svg>`;

const buf = Buffer.from(svg);

await sharp(buf, { density: 150 })
  .resize(W, H, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`✓ Generated ${outPath} (${W}×${H})`);
