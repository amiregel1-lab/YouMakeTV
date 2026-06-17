/* YouMakeTV_Investor_Deck.pptx — 16-slide investor deck, dark theme */
const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'YouMakeTV';
pptx.title = 'YouMakeTV — Investor Deck';

const BG = '0B0F19', PANEL = '141A2B', PANEL2 = '1A2238',
  TXT = 'E7EAF2', MUTED = '93A0B8', PURPLE = '8B5CF6', CYAN = '22D3EE',
  GREEN = '34D399', RED = 'F87171', AMBER = 'FBBF24';
const W = 13.33, H = 7.5;

function slideBase(num, kicker) {
  const s = pptx.addSlide();
  s.background = { color: BG };
  // accent bar
  s.addShape('rect', { x: 0, y: 0, w: 0.12, h: H, fill: { color: PURPLE } });
  if (kicker) {
    s.addText(kicker.toUpperCase(), { x: 0.55, y: 0.32, w: 9, h: 0.35, fontSize: 12, color: CYAN, bold: true, charSpacing: 3, fontFace: 'Segoe UI' });
  }
  if (num != null) {
    s.addText(String(num).padStart(2, '0'), { x: W - 1.0, y: H - 0.55, w: 0.7, h: 0.35, fontSize: 10, color: MUTED, align: 'right', fontFace: 'Segoe UI' });
    s.addText('YouMakeTV — Confidential', { x: 0.55, y: H - 0.55, w: 4, h: 0.35, fontSize: 9, color: '4B5568', fontFace: 'Segoe UI' });
  }
  return s;
}
function title(s, text, opts = {}) {
  s.addText(text, { x: 0.55, y: 0.62, w: 12.2, h: 0.85, fontSize: opts.size || 32, color: TXT, bold: true, fontFace: 'Segoe UI', ...opts });
}
function panel(s, x, y, w, h, color = PANEL) {
  s.addShape('roundRect', { x, y, w, h, fill: { color }, rectRadius: 0.06, line: { color: '232C45', width: 0.75 } });
}
function statCard(s, x, y, w, h, big, label, color = PURPLE) {
  panel(s, x, y, w, h);
  s.addText(big, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: h * 0.52, fontSize: 26, bold: true, color, fontFace: 'Segoe UI', align: 'left', valign: 'middle' });
  s.addText(label, { x: x + 0.15, y: y + h * 0.55, w: w - 0.3, h: h * 0.42, fontSize: 10.5, color: MUTED, fontFace: 'Segoe UI', valign: 'top' });
}
function bullets(s, items, opts = {}) {
  s.addText(items.map(t => ({ text: t, options: { bullet: { characterCode: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: opts.gap ?? 8 } })),
    { x: opts.x ?? 0.6, y: opts.y ?? 1.8, w: opts.w ?? 12, h: opts.h ?? 5, fontSize: opts.size ?? 14, color: opts.color ?? TXT, fontFace: 'Segoe UI', valign: 'top', lineSpacingMultiple: 1.1 });
}
const TBL = {
  border: { type: 'solid', color: '232C45', pt: 0.5 },
  color: TXT, fontFace: 'Segoe UI', valign: 'middle',
};
function hdrRow(cells) {
  return cells.map(t => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: '232C45' }, fontSize: 11 } }));
}

/* ---------- 1. COVER ---------- */
{
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: PURPLE } });
  s.addShape('rect', { x: 0, y: H - 0.12, w: W, h: 0.12, fill: { color: CYAN } });
  // big glow blocks
  s.addShape('roundRect', { x: 9.1, y: 1.4, w: 3.4, h: 1.9, fill: { color: PANEL }, rectRadius: 0.08, line: { color: PURPLE, width: 1 } });
  s.addText('▶', { x: 10.35, y: 1.85, w: 1, h: 1, fontSize: 40, color: PURPLE, align: 'center' });
  s.addShape('roundRect', { x: 9.6, y: 3.6, w: 3.4, h: 1.9, fill: { color: PANEL }, rectRadius: 0.08, line: { color: CYAN, width: 1 } });
  s.addText('AI', { x: 10.85, y: 4.05, w: 1, h: 1, fontSize: 36, bold: true, color: CYAN, align: 'center' });
  s.addText('YOUMAKE', { x: 0.8, y: 2.0, w: 9, h: 1.0, fontSize: 54, bold: true, color: TXT, fontFace: 'Segoe UI', charSpacing: 2 });
  s.addText([{ text: 'TV', options: { color: PURPLE } }, { text: '.ai', options: { color: CYAN } }], { x: 0.8, y: 2.85, w: 6, h: 0.9, fontSize: 44, bold: true, fontFace: 'Segoe UI' });
  s.addText('The marketplace and streaming home for AI-generated films', { x: 0.82, y: 4.0, w: 8, h: 0.6, fontSize: 20, color: TXT, fontFace: 'Segoe UI' });
  s.addText('Where AI filmmakers earn, and audiences discover a new art form.', { x: 0.82, y: 4.62, w: 8, h: 0.5, fontSize: 14, color: MUTED, italic: true, fontFace: 'Segoe UI' });
  s.addText('Seed Round  •  June 2026  •  Confidential', { x: 0.82, y: 6.4, w: 8, h: 0.4, fontSize: 12, color: MUTED, fontFace: 'Segoe UI' });
}

/* ---------- 2. VISION ---------- */
{
  const s = slideBase(2, 'Vision');
  title(s, 'Every great film of the next decade won\'t come from a studio.');
  s.addText([
    { text: 'AI has collapsed the cost of filmmaking from millions to hundreds of dollars. Millions of new filmmakers are coming. ', options: { color: TXT } },
    { text: 'They have nowhere to premiere, no way to get paid, and no audience that takes them seriously.', options: { color: CYAN, bold: true } },
  ], { x: 0.6, y: 1.9, w: 11.8, h: 1.2, fontSize: 18, fontFace: 'Segoe UI', lineSpacingMultiple: 1.2 });
  statCard(s, 0.6, 3.5, 3.9, 1.7, 'Netflix', 'the consumer experience: curated, premium, lean-back', PURPLE);
  statCard(s, 4.7, 3.5, 3.9, 1.7, 'Steam', 'the marketplace: creators set prices, earn per sale, build studios', CYAN);
  statCard(s, 8.8, 3.5, 3.9, 1.7, 'YouTube', 'the openness: anyone can publish — but with a quality gate', GREEN);
  s.addText('YouMakeTV is the distribution and monetization layer for the AI film era — the place where this new category of entertainment gets premiered, discovered, and paid for.',
    { x: 0.6, y: 5.6, w: 12, h: 1.0, fontSize: 16, color: TXT, italic: true, fontFace: 'Segoe UI' });
}

/* ---------- 3. PROBLEM ---------- */
{
  const s = slideBase(3, 'Problem');
  title(s, 'A new creative class with no economy');
  const cols = [
    ['FOR AI FILMMAKERS', RED, [
      'YouTube buries AI films in an infinite feed; ad RPM of $1–3 can\'t fund serious work',
      'Prime Video Direct is cutting royalties and restricting AI content',
      'Netflix and traditional distributors won\'t take submissions',
      'Tool vendors (Runway, Pika, Sora) monetize creation — not distribution',
      'Result: world-class AI shorts go viral on X… and earn $0',
    ]],
    ['FOR VIEWERS', AMBER, [
      'AI films are scattered across X, TikTok, YouTube — no destination',
      'No curation: finding the good 1% means wading through slop',
      'No formats: no premieres, festivals, series, or genre depth',
      'Growing curiosity ("can AI make a real film?") with nowhere to satisfy it',
    ]],
  ];
  let x = 0.6;
  for (const [h, c, items] of cols) {
    panel(s, x, 1.75, 6.0, 5.1);
    s.addText(h, { x: x + 0.25, y: 1.95, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: c, charSpacing: 2, fontFace: 'Segoe UI' });
    bullets(s, items, { x: x + 0.25, y: 2.45, w: 5.6, h: 4.2, size: 12.5, gap: 10 });
    x += 6.25;
  }
}

/* ---------- 4. SOLUTION ---------- */
{
  const s = slideBase(4, 'Solution');
  title(s, 'A curated marketplace where AI films premiere and earn');
  const steps = [
    ['1 — CREATE', 'Creators upload films, trailers, cover art, metadata and set pricing', PURPLE],
    ['2 — CURATE', 'Every title passes human + AI review. The quality gate is the product.', CYAN],
    ['3 — MONETIZE', 'Viewers buy per-film or subscribe to YouMake+. Creators earn 30–40% with tiers that rise as they succeed.', GREEN],
  ];
  let x = 0.6;
  for (const [h, b, c] of steps) {
    panel(s, x, 1.8, 3.95, 2.1);
    s.addShape('rect', { x, y: 1.8, w: 3.95, h: 0.09, fill: { color: c } });
    s.addText(h, { x: x + 0.2, y: 2.0, w: 3.6, h: 0.4, fontSize: 14, bold: true, color: c, fontFace: 'Segoe UI' });
    s.addText(b, { x: x + 0.2, y: 2.45, w: 3.6, h: 1.35, fontSize: 12, color: TXT, fontFace: 'Segoe UI', lineSpacingMultiple: 1.1 });
    x += 4.12;
  }
  s.addText('TWO-SIDED VALUE', { x: 0.6, y: 4.25, w: 6, h: 0.35, fontSize: 12, bold: true, color: MUTED, charSpacing: 2, fontFace: 'Segoe UI' });
  panel(s, 0.6, 4.65, 6.0, 2.2);
  s.addText('Creators get', { x: 0.85, y: 4.8, w: 5.5, h: 0.35, fontSize: 13, bold: true, color: PURPLE, fontFace: 'Segoe UI' });
  bullets(s, ['Real per-view revenue (not ad crumbs)', 'A legitimizing premiere venue + studio identity', 'Rising revenue share: 30% → 35% (1K paid views) → 40% (5K)'], { x: 0.85, y: 5.2, w: 5.5, h: 1.6, size: 12, gap: 6 });
  panel(s, 6.85, 4.65, 6.0, 2.2);
  s.addText('Viewers get', { x: 7.1, y: 4.8, w: 5.5, h: 0.35, fontSize: 13, bold: true, color: CYAN, fontFace: 'Segoe UI' });
  bullets(s, ['The best 1% of AI film, curated — zero slop', 'Buy one film ($3–6) or stream the catalog (YouMake+ $7.99/mo)', 'Follow creators & studios as they build franchises'], { x: 7.1, y: 5.2, w: 5.5, h: 1.6, size: 12, gap: 6 });
}

/* ---------- 5. PRODUCT ---------- */
{
  const s = slideBase(5, 'Product — live today');
  title(s, 'The MVP is built and operating');
  const feats = [
    ['Viewer platform', 'Browse, trailers, film pages, studio/creator pages, purchase & streaming flows', GREEN, 'LIVE'],
    ['Creator onboarding', 'Studio profiles, guided upload: film, trailer, art, metadata, pricing', GREEN, 'LIVE'],
    ['Creator dashboard', 'Catalog management, edit films, studio profile, performance views', GREEN, 'LIVE'],
    ['Admin review system', 'Human approval gate before any film is listed — curation enforced in software', GREEN, 'LIVE'],
    ['Payouts & analytics v2', 'Tier tracking (30/35/40%), payout automation, creator revenue analytics', AMBER, 'NEXT'],
    ['Discovery & TV apps', 'Recommendations, genre verticals, living-room apps (TV is where films get watched)', AMBER, 'SEED SCOPE'],
  ];
  let y = 1.8;
  for (const [h, b, c, tag] of feats) {
    panel(s, 0.6, y, 12.2, 0.78);
    s.addText(h, { x: 0.85, y: y + 0.08, w: 2.9, h: 0.6, fontSize: 13, bold: true, color: TXT, fontFace: 'Segoe UI', valign: 'middle' });
    s.addText(b, { x: 3.9, y: y + 0.08, w: 7.2, h: 0.6, fontSize: 11, color: MUTED, fontFace: 'Segoe UI', valign: 'middle' });
    s.addText(tag, { x: 11.3, y: y + 0.2, w: 1.3, h: 0.38, fontSize: 10, bold: true, color: BG, align: 'center', valign: 'middle', fill: { color: c }, fontFace: 'Segoe UI' });
    y += 0.88;
  }
  s.addText('Honest status: product is ahead of traction. No meaningful user or creator base yet — the seed round funds exactly that.',
    { x: 0.6, y, w: 12.2, h: 0.5, fontSize: 12, italic: true, color: AMBER, fontFace: 'Segoe UI' });
}

/* ---------- 6. MARKET ---------- */
{
  const s = slideBase(6, 'Market');
  title(s, 'A new category at the crossing of three big markets');
  statCard(s, 0.6, 1.8, 3.9, 1.6, '$720B → $1.9T', 'Global video streaming, 2026 → 2030 (~20% CAGR)', PURPLE);
  statCard(s, 4.7, 1.8, 3.9, 1.6, '$250–300B', 'Creator economy today; ~$500B+ by 2030 (Goldman Sachs)', CYAN);
  statCard(s, 8.8, 1.8, 3.9, 1.6, '$3.2B → ~$15B', 'AI video generation tools, 2026 → 2030 (28–35% CAGR)', GREEN);
  // TAM SAM SOM
  const cx = 2.9, cy = 4.85;
  s.addShape('ellipse', { x: cx - 1.85, y: cy - 1.85, w: 3.7, h: 3.7, fill: { color: '1E1B3A' }, line: { color: PURPLE, width: 1 } });
  s.addShape('ellipse', { x: cx - 1.2, y: cy - 1.2, w: 2.4, h: 2.4, fill: { color: '2A2353' }, line: { color: CYAN, width: 1 } });
  s.addShape('ellipse', { x: cx - 0.55, y: cy - 0.55, w: 1.1, h: 1.1, fill: { color: PURPLE }, line: { color: 'FFFFFF', width: 1 } });
  s.addText('SOM', { x: cx - 0.55, y: cy - 0.3, w: 1.1, h: 0.6, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center' });
  const legend = [
    ['TAM — $45B', 'Indie / niche / transactional slice of global on-demand video + creator monetization', PURPLE],
    ['SAM — $3.5B', 'Direct monetization of AI-native films (PPV + niche SVOD + creator services), EN + EU markets', CYAN],
    ['SOM — $60–110M', 'Year-5 obtainable gross billings (1.7–3% of SAM). Base case models $21M — below the ceiling, not a hockey stick', GREEN],
  ];
  let y = 3.35;
  for (const [h, b, c] of legend) {
    s.addText(h, { x: 5.4, y, w: 7.3, h: 0.35, fontSize: 15, bold: true, color: c, fontFace: 'Segoe UI' });
    s.addText(b, { x: 5.4, y: y + 0.36, w: 7.4, h: 0.6, fontSize: 11.5, color: MUTED, fontFace: 'Segoe UI' });
    y += 1.12;
  }
  s.addText('Why now: Sora, Veo 3, Runway Gen-4 and Kling 2.x made watchable AI films possible in the last 18 months. Supply is exploding; no one owns distribution.',
    { x: 0.6, y: 6.85, w: 12.2, h: 0.45, fontSize: 11.5, italic: true, color: TXT, fontFace: 'Segoe UI' });
}

/* ---------- 7. COMPETITION ---------- */
{
  const s = slideBase(7, 'Competition');
  title(s, 'Everyone touches this space. No one owns it.', { size: 30 });
  const rows = [
    hdrRow(['', 'AI-native curated catalog', 'Per-title sales', 'Viewer subscription', 'Creator rev-share scaling', 'Built-in audience']),
    ['YouTube', '✘ buried in feed', '~ limited', '~ not AI', '✘ flat 55%', '✔'],
    ['Vimeo OTT', '✘', '✔', '✘', '✔ but no audience', '✘'],
    ['Netflix / Prime', '✘ closed', '~', '✔', '✘ no submissions', '✔'],
    ['Runway / Pika / Sora', '~ tool showcases', '✘', '✘', '✘', '~ tool users'],
    ['Patreon / Kickstarter', '✘', '✘', '~ membership', '✔', '✘'],
    ['YouMakeTV', '✔ the product', '✔', '✔ YouMake+', '✔ 30→40% tiers', 'building — the execution risk'],
  ].map((r, i) => i === 0 ? r : r.map((t, j) => ({
    text: t,
    options: {
      fontSize: 11, color: i === 6 ? (j === 0 ? PURPLE : GREEN) : (j === 0 ? TXT : MUTED),
      bold: i === 6 || j === 0, fill: { color: i === 6 ? '231B45' : (i % 2 ? PANEL : PANEL2) },
    },
  })));
  s.addTable(rows, { x: 0.6, y: 1.85, w: 12.2, colW: [2.5, 2.3, 1.7, 1.9, 2.3, 1.5], rowH: 0.52, ...TBL, align: 'left' });
  bullets(s, [
    'Tool vendors are partners, not rivals: they monetize creation and need a distribution story ("made with Runway → premiered on YouMakeTV").',
    'The credible threat is OpenAI or YouTube verticalizing AI film. The defense is speed to liquidity + multi-tool neutrality + a curation brand.',
  ], { x: 0.6, y: 5.75, w: 12.2, h: 1.4, size: 12, gap: 6 });
}

/* ---------- 8. BUSINESS MODEL ---------- */
{
  const s = slideBase(8, 'Business model');
  title(s, 'Marketplace take rate + subscription, supply-side aligned');
  const streams = [
    ['Pay-per-view', 'Avg $4.99/film. Platform keeps 60–70% (creator tier 30→40%).', '~30% of Y5 billings', PURPLE],
    ['YouMake+ subscription', '$7.99/mo all-access. 45% of sub revenue flows to a creator watch-time pool.', '~58% of Y5 billings', CYAN],
    ['Advertising (Y3+)', 'Free ad-supported tier converts non-payers; net ARPU $2.40/registered user at maturity.', '~11% of Y5 billings', GREEN],
    ['Featured placement & promo', 'Creators pay for premium placement; future: licensing breakout titles upstream.', '~1% (growing)', AMBER],
  ];
  let y = 1.8;
  for (const [h, b, share, c] of streams) {
    panel(s, 0.6, y, 8.6, 1.0);
    s.addShape('rect', { x: 0.6, y, w: 0.09, h: 1.0, fill: { color: c } });
    s.addText(h, { x: 0.85, y: y + 0.08, w: 3.0, h: 0.84, fontSize: 13.5, bold: true, color: TXT, fontFace: 'Segoe UI', valign: 'middle' });
    s.addText(b, { x: 3.7, y: y + 0.08, w: 5.3, h: 0.84, fontSize: 10.5, color: MUTED, fontFace: 'Segoe UI', valign: 'middle' });
    s.addText(share, { x: 7.5, y: y + 0.08, w: 1.6, h: 0.84, fontSize: 10, bold: true, color: c, fontFace: 'Segoe UI', valign: 'middle', align: 'right' });
    y += 1.12;
  }
  panel(s, 9.5, 1.8, 3.3, 4.4, PANEL2);
  s.addText('CREATOR TIERS', { x: 9.7, y: 2.0, w: 2.9, h: 0.35, fontSize: 11, bold: true, color: MUTED, charSpacing: 2, fontFace: 'Segoe UI' });
  const tiers = [['Starter', '30%', 'day one'], ['Growth', '35%', '1,000 paid views'], ['Pro', '40%', '5,000 paid views']];
  let ty = 2.45;
  for (const [n, p, m] of tiers) {
    s.addText(p, { x: 9.7, y: ty, w: 1.2, h: 0.55, fontSize: 22, bold: true, color: PURPLE, fontFace: 'Segoe UI' });
    s.addText([{ text: n + '\n', options: { bold: true, color: TXT, fontSize: 12 } }, { text: m, options: { color: MUTED, fontSize: 9.5 } }],
      { x: 10.9, y: ty, w: 1.9, h: 0.55, fontFace: 'Segoe UI', valign: 'middle' });
    ty += 0.72;
  }
  s.addText('Success is shared: the take rate falls as creators win — the opposite of every incumbent.',
    { x: 9.7, y: ty + 0.1, w: 2.95, h: 1.4, fontSize: 10.5, italic: true, color: CYAN, fontFace: 'Segoe UI' });
  s.addText('Unit economics (base case): subscriber LTV ≈ $80 vs CAC $25 (3.2x, ~7-mo payback) • 80%+ gross margin on net revenue • creator LTV:CAC ≈ 7x',
    { x: 0.6, y: 6.45, w: 12.2, h: 0.5, fontSize: 12, color: GREEN, fontFace: 'Segoe UI' });
}

/* ---------- 9. GROWTH ---------- */
{
  const s = slideBase(9, 'Growth strategy');
  title(s, 'Supply-led growth: creators first, then concentrate demand');
  panel(s, 0.6, 1.8, 6.0, 4.9);
  s.addText('CREATORS  (CAC target ≤ $40)', { x: 0.85, y: 1.95, w: 5.5, h: 0.4, fontSize: 13, bold: true, color: PURPLE, charSpacing: 1, fontFace: 'Segoe UI' });
  bullets(s, [
    'Founding 50: hand-recruited festival winners & viral AI shorts — guaranteed placement, 0% take on first $500',
    'Tool communities: Runway, Sora, Pika, Kling, Luma, ComfyUI/SD — Discords, challenges, festival pipelines',
    'Reddit / X / Discord: founder-led content + payout receipts ("first creator just crossed $1K")',
    '10–15 AI-educator influencer sponsorships (~$33 CAC modeled)',
    'Referrals from Month 6: $50 per activated creator',
    'Year-1 channel plan: ~$140K → 3,000+ signup capacity vs. 500 target (2x buffer)',
  ], { x: 0.85, y: 2.4, w: 5.55, h: 4.2, size: 11, gap: 8 });
  panel(s, 6.85, 1.8, 6.0, 4.9);
  s.addText('VIEWERS  (blended CAC ≤ $40 → $25)', { x: 7.1, y: 1.95, w: 5.5, h: 0.4, fontSize: 13, bold: true, color: CYAN, charSpacing: 1, fontFace: 'Segoe UI' });
  bullets(s, [
    'Trailer-led paid social (Meta, TikTok, YouTube pre-roll) — entertainment creative, not platform ads',
    'Owned clip factory: Shorts/TikTok/Reels from catalog moments',
    'SEO: "best AI films", film & creator pages — compounding from Month 6',
    'Creator-as-affiliate: 20% of referred first-year revenue — creators bring their own audiences (the cold-start cheat code)',
    'PR & festivals: "the Netflix of AI film" launch story, AI film awards',
    'Spend gates: no scale-up until D7 retention >25% and M3 sub retention >55%',
  ], { x: 7.1, y: 2.4, w: 5.55, h: 4.2, size: 11, gap: 8 });
  s.addText('Marketing is derived from targets in the model (adds × CAC × paid share) — growth and budget always reconcile.',
    { x: 0.6, y: 6.85, w: 12.2, h: 0.4, fontSize: 11, italic: true, color: MUTED, fontFace: 'Segoe UI' });
}

/* ---------- 10. COLD START ---------- */
{
  const s = slideBase(10, 'Marketplace bootstrapping');
  title(s, 'Solving the cold start: supply doesn\'t churn, so seed supply first');
  const phases = [
    ['PHASE 1 · M0–6', 'Seed supply', ['50 founding creators, hand-picked', '150–300 curated films', '3–5K viewers for signal, not scale', 'Gate: D7 retention >25%'], PURPLE],
    ['PHASE 2 · M6–18', 'Prove demand', ['300–500 active creators, 1,000+ films', '1.5–8K subscribers', 'Prove CAC ≤$35, M3 retention >55%', 'First creators hit Growth tier — publicize every payout'], CYAN],
    ['PHASE 3 · M18–36', 'Network effects', ['1,500–3,000 creators, 5–12K films', '30K+ subscribers', 'Referral & affiliate loops; organic >40% of signups', 'Top creators earn $2–5K/mo and recruit for us'], GREEN],
  ];
  let x = 0.6;
  for (const [tag, h, items, c] of phases) {
    panel(s, x, 1.8, 3.95, 4.0);
    s.addShape('rect', { x, y: 1.8, w: 3.95, h: 0.09, fill: { color: c } });
    s.addText(tag, { x: x + 0.2, y: 1.98, w: 3.5, h: 0.3, fontSize: 10, bold: true, color: c, charSpacing: 2, fontFace: 'Segoe UI' });
    s.addText(h, { x: x + 0.2, y: 2.28, w: 3.5, h: 0.45, fontSize: 17, bold: true, color: TXT, fontFace: 'Segoe UI' });
    bullets(s, items, { x: x + 0.2, y: 2.8, w: 3.6, h: 2.9, size: 10.5, gap: 7 });
    x += 4.12;
  }
  panel(s, 0.6, 6.1, 12.2, 1.0, PANEL2);
  s.addText([
    { text: 'Minimum viable liquidity:  ', options: { bold: true, color: AMBER } },
    { text: '~1,000 quality films • ~500 active creators • ~25–30K subscribers (≈$2.5M ARR funding $1M+/yr creator payouts). Base case reaches this by Month 24–30. Shudder launched with <200 titles — curation beats volume.', options: { color: TXT } },
  ], { x: 0.85, y: 6.2, w: 11.8, h: 0.8, fontSize: 11.5, fontFace: 'Segoe UI', valign: 'middle' });
}

/* ---------- 11. FINANCIALS ---------- */
{
  const s = slideBase(11, 'Financial projections');
  title(s, '5-year model — net revenue basis, three scenarios', { size: 30 });
  const rows = [
    hdrRow(['Base case', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']),
    ['Gross billings', '$0.12M', '$0.67M', '$2.8M', '$8.7M', '$21.4M'],
    ['Net revenue (platform)', '$0.07M', '$0.40M', '$1.75M', '$5.7M', '$14.4M'],
    ['Gross margin', '70%', '75%', '80%', '83%', '85%'],
    ['EBITDA', '–$1.3M', '–$2.4M', '–$3.7M', '–$3.9M', '–$0.2M'],
    ['Subscribers (exit)', '1.5K', '8.4K', '30K', '80K', '176K'],
    ['Active creators', '275', '935', '2,475', '5,225', '9,625'],
    ['Films in catalog', '963', '4,235', '12.9K', '31.2K', '64.9K'],
  ].map((r, i) => i === 0 ? r : r.map((t, j) => ({
    text: t, options: {
      fontSize: 11.5, color: j === 0 ? TXT : (i === 4 ? RED : (i === 2 ? GREEN : MUTED)),
      bold: j === 0 || i === 2, fill: { color: i % 2 ? PANEL : PANEL2 }, align: j === 0 ? 'left' : 'right',
    },
  })));
  s.addTable(rows, { x: 0.6, y: 1.8, w: 8.2, colW: [2.6, 1.12, 1.12, 1.12, 1.12, 1.12], rowH: 0.42, ...TBL });
  panel(s, 9.1, 1.8, 3.7, 3.45, PANEL2);
  s.addText('Y5 NET REVENUE BY SCENARIO', { x: 9.3, y: 1.95, w: 3.3, h: 0.35, fontSize: 10, bold: true, color: MUTED, charSpacing: 1.5, fontFace: 'Segoe UI' });
  const scen = [['Conservative', '$3.5M', MUTED], ['Base', '$14.4M', PURPLE], ['Aggressive', '$53.9M', CYAN]];
  let sy = 2.4;
  for (const [n, v, c] of scen) {
    s.addText(v, { x: 9.3, y: sy, w: 1.9, h: 0.55, fontSize: 21, bold: true, color: c, fontFace: 'Segoe UI' });
    s.addText(n, { x: 11.0, y: sy + 0.06, w: 1.7, h: 0.45, fontSize: 11, color: TXT, fontFace: 'Segoe UI', valign: 'middle' });
    sy += 0.62;
  }
  s.addText('Aggressive case turns EBITDA-positive in Y4 (+$4.2M) and prints $26M EBITDA in Y5; base case reaches ~breakeven exiting Y5.',
    { x: 9.3, y: sy + 0.05, w: 3.35, h: 1.0, fontSize: 9.5, color: MUTED, fontFace: 'Segoe UI' });
  bullets(s, [
    'Deliberately sober: niche-SVOD churn (8%→5.5%/mo), paid-led early growth, no virality assumed. Y2/Y3 ≈ 4–5x growth off a small base.',
    'Total capital to ~breakeven: ≈ $19M across Seed ($4M, this round), Series A (≈$9M, Mo. 24–28) and Series B (≈$6M).',
    'Full formula-driven model with editable assumptions delivered alongside this deck (Excel workbook, 3 scenarios).',
  ], { x: 0.6, y: 5.45, w: 12.2, h: 1.7, size: 11.5, gap: 6 });
}

/* ---------- 12. UNIT ECONOMICS ---------- */
{
  const s = slideBase(12, 'Unit economics');
  title(s, 'The model works if churn behaves — and we underwrite churn first');
  const rows = [
    hdrRow(['Base case', 'Subscriber', 'PPV buyer', 'Creator (supply)']),
    ['LTV', '$80', '$17', '$500 (24-mo net rev)'],
    ['CAC', '$25', '$4 (organic only)', '$73 (activated)'],
    ['LTV : CAC', '3.2x', '4.2x', '6.8x'],
    ['Payback', '~7 months', 'immediate', '< 12 months'],
  ].map((r, i) => i === 0 ? r : r.map((t, j) => ({
    text: t, options: { fontSize: 13, color: j === 0 ? TXT : (i === 3 ? GREEN : MUTED), bold: j === 0 || i === 3, fill: { color: i % 2 ? PANEL : PANEL2 }, align: j === 0 ? 'left' : 'center' },
  })));
  s.addTable(rows, { x: 0.6, y: 1.85, w: 12.2, colW: [2.6, 3.2, 3.2, 3.2], rowH: 0.55, ...TBL });
  bullets(s, [
    'Subscribers: $7.99/mo × 55% platform share × 78% contribution margin ÷ 6.5% monthly churn = $80 LTV. Every point of churn ≈ ±$11 of LTV — churn is the metric we underwrite before scaling spend.',
    'PPV cannot absorb paid CAC — it monetizes organic traffic and converts buyers into subscribers.',
    'The quiet strength: supply-side economics. Films stay in the catalog forever (inventory doesn\'t churn); creator LTV:CAC ≈ 7x even with conservative payout growth.',
    'Worst case (9% churn, $35 CAC) → 1.1x LTV:CAC: not viable. The seed plan gates all scale spending on proving churn <7%/mo on a small cohort first.',
  ], { x: 0.6, y: 4.35, w: 12.2, h: 2.7, size: 12.5, gap: 10 });
}

/* ---------- 13. FUNDRAISING ---------- */
{
  const s = slideBase(13, 'The raise');
  title(s, 'Raising a $4M Seed — 24+ months to Series A metrics');
  const cols = [
    ['SCENARIO A — LEAN', '$2.0M', ['18–20 months runway', 'Team of ~6', '300 creators · 1,500 films', 'Retention proof + ~$0.4M ARR', 'Risk: bridges into the Series A raise'], MUTED],
    ['SCENARIO B — RECOMMENDED', '$4.0M', ['24–26 months runway', 'Team of ~12 by Y2', '935 active creators · 4,200 films', '8.4K subs · ~$0.8M exit ARR · Series A-ready', 'Buffer for one missed quarter'], PURPLE],
    ['SCENARIO C — MARKET LEADER', '$7.0M', ['~30 months runway', 'Team of ~18', '2,200 creators · 12.5K films', '18.5K subs · ~$2M exit ARR', 'For a competitive/preempted round only'], CYAN],
  ];
  let x = 0.6;
  for (const [h, amt, items, c] of cols) {
    panel(s, x, 1.8, 3.95, 3.6);
    if (c === PURPLE) s.addShape('roundRect', { x: x - 0.03, y: 1.77, w: 4.01, h: 3.66, fill: { type: 'none' }, line: { color: PURPLE, width: 2 }, rectRadius: 0.06 });
    s.addText(h, { x: x + 0.2, y: 1.95, w: 3.6, h: 0.32, fontSize: 10.5, bold: true, color: c, charSpacing: 1, fontFace: 'Segoe UI' });
    s.addText(amt, { x: x + 0.2, y: 2.25, w: 3.6, h: 0.55, fontSize: 26, bold: true, color: TXT, fontFace: 'Segoe UI' });
    bullets(s, items, { x: x + 0.2, y: 2.85, w: 3.6, h: 2.5, size: 10, gap: 5 });
    x += 4.12;
  }
  panel(s, 0.6, 5.6, 12.2, 1.35, PANEL2);
  s.addText('USE OF FUNDS ($4M):', { x: 0.85, y: 5.72, w: 3, h: 0.35, fontSize: 11, bold: true, color: MUTED, fontFace: 'Segoe UI' });
  const uof = [['Engineering & Product', '38%', PURPLE], ['Growth', '24%', CYAN], ['Content & Creator Success', '14%', GREEN], ['Trust & Safety', '8%', AMBER], ['Infra', '6%', RED], ['Legal', '5%', MUTED], ['Ops/Buffer', '5%', TXT]];
  let bx = 0.85;
  for (const [n, p] of uof) {
    const w = parseFloat(p) / 100 * 11.6;
    s.addShape('rect', { x: bx, y: 6.15, w, h: 0.35, fill: { color: uof.find(u => u[0] === n)[2] } });
    bx += w;
  }
  s.addText(uof.map(u => `${u[0]} ${u[1]}`).join('   ·   '), { x: 0.85, y: 6.55, w: 11.8, h: 0.35, fontSize: 9, color: MUTED, fontFace: 'Segoe UI' });
  s.addText('Terms guidance: $10–14M pre-money (2026 seed medians for consumer marketplace + AI-category premium). Why not pre-seed? Product already de-risked; the open question is traction — fund 24 months to answer it properly.',
    { x: 0.6, y: 7.02, w: 12.2, h: 0.45, fontSize: 10, italic: true, color: MUTED, fontFace: 'Segoe UI' });
}

/* ---------- 14. TEAM ---------- */
{
  const s = slideBase(14, 'Team');
  title(s, 'Built lean. Hiring for the three things that matter.');
  panel(s, 0.6, 1.8, 5.9, 2.6);
  s.addText('FOUNDING TEAM', { x: 0.85, y: 1.95, w: 5.4, h: 0.35, fontSize: 11, bold: true, color: PURPLE, charSpacing: 2, fontFace: 'Segoe UI' });
  s.addText('[Founder] — CEO\nProduct & vision. Shipped the full marketplace MVP — viewer platform, creator onboarding, dashboards, and admin curation — pre-funding.',
    { x: 0.85, y: 2.35, w: 5.4, h: 1.9, fontSize: 12, color: TXT, fontFace: 'Segoe UI', lineSpacingMultiple: 1.15 });
  panel(s, 6.75, 1.8, 6.0, 2.6);
  s.addText('FIRST KEY HIRES (SEED)', { x: 7.0, y: 1.95, w: 5.5, h: 0.35, fontSize: 11, bold: true, color: CYAN, charSpacing: 2, fontFace: 'Segoe UI' });
  bullets(s, [
    'Founding engineer(s) — recommendations, payments, payout infra',
    'Head of Content / Curation — ex-festival programmer; owns the quality bar',
    'Creator Success lead — onboarding the founding 50 → 500',
    'Growth lead (Mo. 8+) — only after retention gates pass',
  ], { x: 7.0, y: 2.35, w: 5.5, h: 1.9, size: 11.5, gap: 7 });
  panel(s, 0.6, 4.7, 12.15, 1.9, PANEL2);
  s.addText('OPERATING PRINCIPLES', { x: 0.85, y: 4.85, w: 5, h: 0.35, fontSize: 11, bold: true, color: MUTED, charSpacing: 2, fontFace: 'Segoe UI' });
  bullets(s, [
    'Headcount follows proof: 6 FTEs in Y1 → 12 in Y2 → 22 in Y3 (full role-by-role plan with salaries in the financial workbook)',
    'Curation and creator success are staffed like product roles — they are the moat',
    'Fractional CFO + outsourced support until Series A',
  ], { x: 0.85, y: 5.25, w: 11.6, h: 1.3, size: 11.5, gap: 6 });
}

/* ---------- 15. WHY NOW ---------- */
{
  const s = slideBase(15, 'Why now');
  title(s, 'An 18-month window before someone else owns this');
  const items = [
    ['Capability threshold crossed', 'Sora, Veo 3, Runway Gen-4, Kling 2.x: watchable, coherent multi-minute films became possible in the last 18 months — not before.', PURPLE],
    ['Supply explosion, zero infrastructure', 'Millions of tool subscribers are producing films with no premiere venue, no pricing power, no payout rails.', CYAN],
    ['Incumbent paralysis', 'YouTube can\'t curate without breaking UGC neutrality; Netflix can\'t open uploads; tool vendors can\'t pick winners among their own customers. A neutral curator can.', GREEN],
    ['Regulatory tailwind', 'EU AI Act labeling obligations and US likeness laws burden general platforms — and favor a compliance-native, provenance-first platform.', AMBER],
    ['The window', 'When OpenAI or YouTube decides AI film is a category, the curated brand and creator payout relationships need to already exist. That is an 18–24 month race — and the reason to fund it now.', RED],
  ];
  let y = 1.8;
  for (const [h, b, c] of items) {
    s.addShape('rect', { x: 0.6, y: y + 0.05, w: 0.09, h: 0.78, fill: { color: c } });
    s.addText(h, { x: 0.85, y, w: 3.6, h: 0.9, fontSize: 13.5, bold: true, color: TXT, fontFace: 'Segoe UI', valign: 'middle' });
    s.addText(b, { x: 4.5, y, w: 8.3, h: 0.9, fontSize: 11.5, color: MUTED, fontFace: 'Segoe UI', valign: 'middle' });
    y += 1.02;
  }
}

/* ---------- 16. CLOSING ---------- */
{
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: CYAN } });
  s.addShape('rect', { x: 0, y: H - 0.12, w: W, h: 0.12, fill: { color: PURPLE } });
  s.addText('The studios of the next decade are being founded right now —\nin Discord servers, with $30 tool subscriptions.',
    { x: 0.8, y: 1.5, w: 11.7, h: 1.6, fontSize: 28, bold: true, color: TXT, fontFace: 'Segoe UI', lineSpacingMultiple: 1.15 });
  s.addText('YouMakeTV is where they premiere, get paid, and find their audience.',
    { x: 0.8, y: 3.3, w: 11.7, h: 0.6, fontSize: 18, color: CYAN, fontFace: 'Segoe UI' });
  const stats = [['$4M', 'Seed round'], ['24+ mo', 'Runway to Series A metrics'], ['~$14M', 'Y5 net revenue (base)'], ['$45B', 'TAM']];
  let x = 0.8;
  for (const [v, l] of stats) {
    s.addText(v, { x, y: 4.4, w: 2.8, h: 0.6, fontSize: 30, bold: true, color: PURPLE, fontFace: 'Segoe UI' });
    s.addText(l, { x, y: 5.0, w: 2.8, h: 0.4, fontSize: 11, color: MUTED, fontFace: 'Segoe UI' });
    x += 3.05;
  }
  s.addText('YouMakeTV.ai   •   Seed Round, June 2026   •   Confidential',
    { x: 0.8, y: 6.4, w: 11, h: 0.4, fontSize: 12, color: MUTED, fontFace: 'Segoe UI' });
}

pptx.writeFile({ fileName: path.join(__dirname, '..', 'YouMakeTV_Investor_Deck.pptx') })
  .then(f => console.log('Wrote', f));
