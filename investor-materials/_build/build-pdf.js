/* YouMakeTV_Executive_Summary.pdf — executive summary + condensed business plan */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'YouMakeTV_Executive_Summary.pdf');
const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 64, left: 60, right: 60 }, bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));
doc.registerFont('Body', 'C:/Windows/Fonts/segoeui.ttf');
doc.registerFont('BodyBold', 'C:/Windows/Fonts/segoeuib.ttf');
// Replace math symbols that render unreliably across PDF viewers/extractors
const sanitize = (t) => t.replace(/≈/g, '~').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/±/g, '+/-');
const _text = doc.text;
doc.text = function (t, ...args) {
  if (typeof t === 'string') t = sanitize(t);
  return _text.call(this, t, ...args);
};

const PURPLE = '#6D28D9', CYAN = '#0891B2', DARK = '#111827', GRAY = '#4B5563', LIGHT = '#9CA3AF', RED = '#B91C1C', GREEN = '#15803D';
const PW = doc.page.width - 120; // content width

function h1(t) {
  ensure(80);
  doc.moveDown(0.6);
  doc.rect(60, doc.y, 26, 3).fill(PURPLE);
  doc.moveDown(0.4);
  doc.fillColor(DARK).font('BodyBold').fontSize(17).text(t);
  doc.moveDown(0.35);
}
function h2(t) {
  ensure(60);
  doc.moveDown(0.5);
  doc.fillColor(PURPLE).font('BodyBold').fontSize(12).text(t.toUpperCase(), { characterSpacing: 0.5 });
  doc.moveDown(0.2);
}
function p(t, opts = {}) {
  doc.fillColor(opts.color || GRAY).font(opts.bold ? 'BodyBold' : 'Body').fontSize(opts.size || 10).text(t, { lineGap: 2.5, ...opts });
  doc.moveDown(0.35);
}
function bullet(items, opts = {}) {
  for (const t of items) {
    ensure(40);
    const x = doc.x;
    doc.fillColor(PURPLE).font('BodyBold').fontSize(opts.size || 10).text('•', 60, doc.y, { continued: false, width: 12 });
    doc.moveUp();
    doc.fillColor(opts.color || GRAY).font('Body').fontSize(opts.size || 10).text(t, 74, doc.y, { width: PW - 14, lineGap: 2 });
    doc.x = 60;
    doc.moveDown(0.25);
  }
  doc.moveDown(0.2);
}
function ensure(h) { if (doc.y + h > doc.page.height - 70) doc.addPage(); }
function table(headers, rows, widths, opts = {}) {
  const x0 = 60, fs1 = opts.size || 8.5, pad = 4;
  const rowH = (cells) => {
    let m = 0;
    cells.forEach((c, i) => {
      const h = doc.font('Body').fontSize(fs1).heightOfString(String(c), { width: widths[i] - pad * 2, lineGap: 1 });
      m = Math.max(m, h);
    });
    return m + pad * 2;
  };
  const drawRow = (cells, { header = false, band = false } = {}) => {
    const h = rowH(cells);
    ensure(h + 4);
    const y = doc.y;
    let x = x0;
    if (header) doc.rect(x0, y, widths.reduce((a, b) => a + b, 0), h).fill(DARK);
    else if (band) doc.rect(x0, y, widths.reduce((a, b) => a + b, 0), h).fill('#F3F4F6');
    cells.forEach((c, i) => {
      doc.fillColor(header ? '#FFFFFF' : (i === 0 ? DARK : GRAY))
        .font(header || i === 0 ? 'BodyBold' : 'Body').fontSize(fs1)
        .text(String(c), x + pad, y + pad, { width: widths[i] - pad * 2, lineGap: 1 });
      x += widths[i];
    });
    doc.x = x0; doc.y = y + h;
    doc.moveTo(x0, y + h).lineTo(x0 + widths.reduce((a, b) => a + b, 0), y + h).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
  };
  drawRow(headers, { header: true });
  rows.forEach((r, i) => drawRow(r, { band: i % 2 === 1 }));
  doc.moveDown(0.5);
}

/* ================= COVER ================= */
doc.rect(0, 0, doc.page.width, 8).fill(PURPLE);
doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(CYAN);
doc.moveDown(8);
doc.fillColor(DARK).font('BodyBold').fontSize(34).text('YouMakeTV.ai', 60);
doc.moveDown(0.2);
doc.fillColor(PURPLE).font('BodyBold').fontSize(16).text('Executive Summary & Business Plan');
doc.moveDown(0.5);
doc.fillColor(GRAY).font('Body').fontSize(12).text('The marketplace and streaming home for AI-generated films');
doc.moveDown(6);
doc.fontSize(10).fillColor(LIGHT).text('Seed Round  •  June 2026  •  Confidential');
doc.text('Companion documents: YouMakeTV_BusinessPlan.xlsx (full editable financial model)  •  YouMakeTV_Investor_Deck.pptx');
doc.addPage();

/* ================= 1. EXECUTIVE SUMMARY ================= */
h1('1. Executive Summary');
h2('Vision');
p('Every great film of the next decade won\'t come from a studio. AI has collapsed the cost of producing a watchable film from millions of dollars to hundreds. YouMakeTV will be the distribution and monetization layer for this new creative class — the Netflix-grade viewing destination, Steam-style marketplace, and YouTube-scale open platform for AI-generated film.');
h2('Mission');
p('Give AI filmmakers a place to premiere, get paid, and build studios; give audiences a curated way to discover an entirely new art form.');
h2('Problem');
bullet([
  'AI filmmakers have no economy: YouTube buries their work and pays $1–3 RPM; Prime Video Direct restricts AI content and is cutting royalties; Netflix won\'t take submissions; tool vendors (Runway, Pika, Sora) monetize creation, not distribution.',
  'Viewers have no destination: the best AI films are scattered across X, TikTok and YouTube with zero curation — finding the good 1% means wading through slop.',
]);
h2('Solution');
p('A curated two-sided marketplace, live today as an MVP: creators upload films, trailers, art and pricing; every title passes a human-plus-AI review gate; viewers buy per film (avg $4.99) or subscribe to YouMake+ ($7.99/mo). Creator revenue share rises with success — 30% (Starter) → 35% at 1,000 paid views (Growth) → 40% at 5,000 (Pro) — the opposite of every incumbent, where success is taxed flat.');
h2('Why now');
p('Sora, Veo 3, Runway Gen-4 and Kling 2.x made coherent multi-minute AI films possible only in the last ~18 months. Supply is exploding while distribution infrastructure is nonexistent. Incumbents are structurally blocked (YouTube can\'t curate without breaking UGC neutrality; Netflix can\'t open uploads; tool vendors can\'t rank their own customers\' work). EU AI Act labeling rules favor a compliance-native platform. The window before a tool vendor or YouTube verticalizes the category is an estimated 18–24 months.');
h2('Market opportunity');
p('TAM ≈ $45B (indie/niche/transactional slice of the $720B global streaming market plus creator monetization). SAM ≈ $3.5B (direct monetization of AI-native film in EN/EU markets over 5 years). SOM ≈ $60–110M Year-5 gross billings; the base case models $21M — deliberately below the ceiling.');
h2('Competitive advantage');
bullet([
  'Curation as product: a quality gate (already built) that no open platform can copy without breaking its model.',
  'Supply-side alignment: rising 30→40% revenue tiers and a creator pool on subscription revenue.',
  'Multi-tool neutrality: partner to Runway/Pika/Luma/Kling rather than competing with any of them.',
  'Supply compounds: films stay in the catalog forever; creator LTV:CAC ≈ 7x even on conservative assumptions.',
]);
h2('Business model');
p('Marketplace take rate (60–70% of PPV), subscription (55% platform share after the creator pool), advertising from Year 3 (free tier), and featured placement. Reported on a net-revenue basis: base case grows from $0.07M (Y1) to $14.4M (Y5) net revenue, 85% Year-5 gross margin, approaching EBITDA breakeven exiting Year 5.');
h2('Funding requirements');
p('Raising a $4.0M seed at $10–14M pre-money: 24–26 months of runway to Series A metrics (~$0.8–1M exit ARR, churn <7%/mo, 1,000+ films, 8K+ subscribers). Total capital to ~breakeven estimated at ~$19M across Seed, Series A (≈$9M, Month 24–28) and Series B (≈$6M).');
h2('Key milestones');
table(['When', 'Milestone'], [
  ['Month 0–6', '50 founding creators recruited; 150–300 curated films live; engagement signal proven (D7 retention >25%)'],
  ['Month 6–12', '300+ active creators; first creators reach Growth tier; paid acquisition tests at CAC ≤ $35'],
  ['Month 12–18', '1,000+ films; 4–8K subscribers; M3 subscriber retention >55% proven'],
  ['Month 18–24', '~935 active creators, ~8.4K subscribers, ~$0.8M exit ARR — Series A raise'],
  ['Month 24–36', 'Network-effect phase: 2,500 creators, 30K subscribers, ~$2.9M exit ARR'],
], [90, PW - 90]);

/* ================= 2. MARKET ================= */
doc.addPage();
h1('2. Market Analysis');
table(['Market', '2026 (est.)', '2030–32 (est.)', 'CAGR', 'Source / basis'],
  [
    ['AI video generation tools', '$3.2B', '$14–16B', '28–35%', 'Grand View Research, MarketsandMarkets (2024–25 reports)'],
    ['Global video streaming (OTT)', '$720B', '$1.9T', '19–21%', 'Grand View Research; SVOD + AVOD + FAST'],
    ['Creator economy', '$250–300B', '$480–600B', '12–15%', 'Goldman Sachs (2023, updated); SignalFire'],
    ['Independent film prod. & distribution', '$15–20B', '$25–30B', '6–8%', 'IBISWorld / Statista segments'],
    ['AI-generated entertainment (nascent)', '$1–2B', '$10–25B', '>50% (small base)', 'Bottom-up estimate; no analyst category yet'],
  ], [140, 70, 75, 70, PW - 355]);
p('Market sizes are compiled estimates from public research and should be treated as directional; the nascent AI-entertainment category in particular has no established analyst coverage. The investable claim is narrower and more defensible: tool subscriber bases (Runway, Pika, Luma, Kling, Sora and the open-source ComfyUI/SD ecosystem) collectively exceed several million active creators producing film-form content with no monetization rails.', { size: 9 });
h2('TAM / SAM / SOM');
table(['Tier', 'Size', 'Basis'], [
  ['TAM', '$45B', '~6% of global streaming spend addressable by indie/niche/transactional content, plus creator-monetization tooling'],
  ['SAM', '$3.5B', 'Direct monetization of AI-native films (PPV + niche SVOD + creator services), English-speaking + EU markets, 5-yr horizon'],
  ['SOM (Y5)', '$60–110M', 'Obtainable Year-5 gross billings at 1.7–3% SAM share. Base case models $21M gross billings — below the SOM ceiling by design'],
], [60, 80, PW - 140]);
h2('Key trends');
bullet([
  'Production cost collapse: a watchable short film now costs <$500 in tooling/compute versus $50K+ three years ago.',
  'No incumbent treats AI film as a first-class category — distribution is the open layer of the stack.',
  'Creator monetization is shifting from ad-share to direct fan payment (memberships, PPV) — structurally favorable to a take-rate marketplace.',
  'Regulatory pressure (EU AI Act labeling, US likeness laws) burdens general platforms and favors a curated, provenance-first platform.',
  'FAST/AVOD growth proves audiences adopt new low-cost content brands when discovery is good.',
]);

/* ================= 3. COMPETITION ================= */
h1('3. Competitive Landscape');
table(['Player', 'Strengths', 'Weaknesses', 'YouMakeTV opportunity'], [
  ['YouTube', '2.5B+ MAU; free; best discovery & infra', 'AI films buried; $1–3 RPM can\'t fund serious work; no PPV-first model', 'Premium curated home where creators earn per view; use YouTube as trailer funnel'],
  ['Vimeo OTT', 'Mature paywall tech; ~90% creator share', 'Zero audience — creators bring all traffic; declining brand', 'Provide the audience + discovery Vimeo never built; target churners'],
  ['Patreon', '8M+ paying members; recurring mechanics', 'Not a viewing destination; no discovery; weak video UX', 'Membership-style follows + actual streaming; acquisition list of film creators'],
  ['Kickstarter', 'Proven film-funding behavior', 'One-shot funding; no distribution or recurring revenue', 'Funnel partner: funded films need a distribution home'],
  ['Netflix', 'Brand; $17B+ content budget; 300M+ subs', 'Closed; no indie/AI submissions; not a marketplace', 'Be the open marketplace Netflix structurally can\'t be; license breakouts upward later'],
  ['Prime Video Direct', 'Huge audience; self-serve', 'Cutting royalties; restricting AI content; opaque payouts', 'Rejected/demonetized PVD creators are a motivated, reachable segment'],
  ['TikTok', 'Distribution engine; AI content thrives', 'No long-form monetization; no PPV; US regulatory risk', 'Top-of-funnel only (trailers, clips)'],
  ['Reelmind & AI-UGC communities', 'AI-native positioning; early communities', 'Tool-first; shallow monetization; no curation', 'Out-execute on curation/payouts; recruit their frustrated creators'],
  ['Runway / Pika / Luma / Kling', 'Own creator relationships; strong AI-video brands; festivals', 'Monetize creation, not distribution; can\'t rank their own customers', 'Partners, not rivals: "made with Runway → premiered on YouMakeTV"'],
  ['OpenAI Sora ecosystem', 'SOTA generation; social feed; massive attention', 'Feed is remix-social, not film-length; payouts immature; ambitions uncertain', 'Move fast to own "AI film as premium content" before a tool vendor verticalizes — the biggest risk and the biggest validation'],
], [80, 118, 118, PW - 316]);
p('Positioning: YouMakeTV is the only player combining an AI-native curated catalog, per-title sales, a viewer subscription, and a creator revenue share that scales with success. The missing piece — a built-in audience — is precisely what the seed round funds.', { size: 9 });

/* ================= 4. CREATOR GTM ================= */
doc.addPage();
h1('4. Creator Acquisition Strategy');
p('Year-1 plan: ~$140K across 11 channels with modeled capacity of ~3,000 signups against a 500-signup base-case target (2x+ buffer — channels underperform, plans shouldn\'t). Full channel math (reach, engagement, conversion, CAC formulas) is editable in the workbook (GTM-Creators sheet).');
table(['Channel cluster', 'Year-1 cost', 'Expected signups', 'CAC', 'Core tactic'], [
  ['Tool communities (Runway, Sora, Pika, Kling, Luma, Midjourney)', '$53K', '~1,100', '$45–50', 'Discord partnerships, creator challenges, festival pipelines (Runway AIFF), "Sora-to-screen" guides'],
  ['Open-source (ComfyUI / SD / Flux)', '$10K', '~350', '~$29', 'GitHub/Reddit presence; workflow-to-film tutorials; highest skill density'],
  ['Reddit + Discord + X', '$28K', '~900', '~$31', 'Founder-led content; payout receipts; AMAs; screening nights'],
  ['Facebook/LinkedIn + indie filmmakers', '$13K', '~240', '~$54', 'Hybrid filmmakers adopting AI; film-school outreach'],
  ['Influencers (10–15 AI-educator sponsorships)', '$36K', '~1,080', '~$33', '$1.5–3K per sponsored video; mid-tier (50–300K followers)'],
], [130, 60, 70, 50, PW - 310]);
bullet([
  'Founding 50: hand-recruited festival winners and viral AI-short creators. Guaranteed placement + 0% take on first $500. CAC ≈ $0 cash.',
  'Activation (signup → publishes an approved film): 45–65% scenario range, driven by white-glove onboarding for the first 200 creators.',
  'Referral program from Month 6 ($50 per activated referral) — expected to be the cheapest channel by Year 2.',
  'Discipline: kill any channel above $80 CAC after two quarters; blended target ≤ $40.',
]);

/* ================= 5. VIEWER GTM ================= */
h1('5. Viewer Acquisition Strategy');
p('Channel plan totals ~$505K (full Year-1 + early Year-2 budget; the model\'s Year-1 marketing line is gated lower until retention proof). Blended target CAC ≤ $40 falling to ≤ $25 by Year 2. All CPM/CTR/conversion cells editable in the workbook (GTM-Viewers sheet).');
table(['Channel', 'Budget', 'Key assumptions', 'Payers', 'CAC'], [
  ['Paid search (Google)', '$60K', '~$2.50 CPC, 12% signup, 18% paid — high intent, small market today', '~1,000', '$58'],
  ['Meta / IG Reels ads', '$90K', '$9 CPM, 1.2% CTR, 10% signup, 10% paid — trailer-led creative', '~1,200', '$75'],
  ['TikTok ads', '$60K', '$6 CPM, 1.5% CTR, 8% × 8% — younger, lower intent', '~960', '$63'],
  ['YouTube pre-roll', '$80K', '$12 CPM, 1.0% CTR, 12% × 12%', '~960', '$83'],
  ['Display / programmatic', '$20K', 'Capped test — weak intent', '~125', '$160'],
  ['Retargeting', '$30K', '2.5% CTR, 18% × 22% — best paid channel; needs pixel base', '~2,376', '$13'],
  ['SEO & content hub', '$25K', '120K organic visits Y1; compounds from Month 6', '~1,400', '$18'],
  ['Owned YouTube/Shorts', '$30K', '2M trailer/clip views', '~1,600', '$19'],
  ['Owned TikTok/Reels', '$20K', 'Clip factory from catalog', '~900', '$22'],
  ['Influencers (film/AI reviewers)', '$45K', '8–12 sponsorships; converts 2–3x paid ads', '~1,500', '$30'],
  ['Creator affiliates', '$15K', '20% of referred first-year revenue to creators — the cold-start cheat code', '~2,500', '$6'],
  ['PR & festivals', '$30K', 'Launch story + AI film awards; drives brand search', '~700', '$43'],
], [105, 45, PW - 290, 50, 40]);
p('Spend gates: paid budgets unlock only after D7 viewer retention >25% and trailer→film conversion >15% on the founding catalog — do not buy traffic into a leaky funnel.', { size: 9, color: RED });

/* ================= 6. BOOTSTRAPPING ================= */
doc.addPage();
h1('6. Marketplace Bootstrapping (Cold Start)');
p('The core insight: supply doesn\'t churn. A film, once approved, sits in the catalog forever; viewers churn monthly. Therefore seed supply first, concentrate demand on a small curated catalog, and let payouts recruit the next wave of creators.');
table(['', 'Phase 1 — Seed supply (M0–6)', 'Phase 2 — Prove demand (M6–18)', 'Phase 3 — Network effects (M18–36)'], [
  ['Creators', '50 founding creators (hand-picked); 150–300 films', '300–500 active; 1,000–1,800 films; first Growth-tier graduates', '1,500–3,000 active; 5,000–12,000 films; top creators at $2–5K/mo'],
  ['Viewers', '3–5K registered — for signal, not scale', '30–120K registered; 1.5–8K subscribers', '300K–1M registered; 30K+ subscribers'],
  ['Mechanics', 'Guaranteed ≥500 impressions per approved film; weekly themed premieres', 'Editorial front page; creator affiliate links (20% of referred revenue)', 'Personalized discovery; genre verticals; series/seasons'],
  ['Gate to next phase', 'D7 retention >25%; >40% of invited creators publish', 'CAC ≤ $35; M3 subscriber retention >55%', 'Organic/referral >40% of signups; blended CAC <$30'],
], [62, (PW - 62) / 3, (PW - 62) / 3, (PW - 62) / 3]);
h2('Minimum viable liquidity — when network effects start');
table(['Dimension', 'Threshold', 'Rationale'], [
  ['Films', '~1,000 quality titles', 'Shudder and Dropout demonstrate retention with 200–600 titles; 1,000 gives genre depth'],
  ['Active creators', '~400–600', 'Sustains ~30 new releases/week — enough newness for weekly visits'],
  ['Subscribers', '~25–30K', '≈$2.5M ARR funds $1M+/yr creator-pool payouts — the platform becomes self-evidently worth creators\' time'],
  ['Timeline', 'Month 24–30 (base case)', 'Matches model: Year-3 exit ≈ 30K subscribers, ~2,500 creators, ~13K films'],
], [80, 110, PW - 190]);
p('Honest kill criteria: if <40% of invited creators publish in Phase 1, the value proposition is wrong — fix payouts/onboarding before scaling. If M3 subscriber retention stays <40% despite curation, the standalone-destination thesis fails and the company pivots to B2B licensing / white-label AI-content supply.', { size: 9, color: RED });

/* ================= 7. FINANCIALS ================= */
h1('7. Financial Plan (Base Case)');
p('Full formula-driven model in YouMakeTV_BusinessPlan.xlsx (scenario switch: Conservative / Base / Aggressive; every driver editable). Figures below are the base case; revenue is shown net of creator payouts — the comparable basis for marketplace businesses.');
table(['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'], [
  ['Gross billings', '$0.12M', '$0.67M', '$2.82M', '$8.69M', '$21.4M'],
  ['Creator payouts', '$0.05M', '$0.27M', '$1.07M', '$3.03M', '$6.96M'],
  ['Net revenue', '$0.07M', '$0.40M', '$1.75M', '$5.66M', '$14.4M'],
  ['Gross margin', '70%', '75%', '80%', '83%', '85%'],
  ['Payroll', '$0.87M', '$1.74M', '$3.19M', '$5.22M', '$6.96M'],
  ['Marketing', '$0.17M', '$0.49M', '$1.20M', '$2.27M', '$3.57M'],
  ['EBITDA', '–$1.27M', '–$2.35M', '–$3.67M', '–$3.95M', '–$0.19M'],
  ['Exit MRR (subs)', '$12K', '$67K', '$244K', '$640K', '$1.41M'],
  ['Exit ARR (subs)', '$0.15M', '$0.81M', '$2.92M', '$7.67M', '$16.9M'],
  ['Subscribers (exit)', '1,516', '8,398', '30,475', '80,041', '175,912'],
  ['Active creators', '275', '935', '2,475', '5,225', '9,625'],
  ['Films in catalog', '963', '4,235', '12,898', '31,185', '64,873'],
  ['Ending cash (with raises)', '$2.7M', '$0.4M', '$5.7M', '$7.8M', '$7.6M'],
], [120, (PW - 120) / 5, (PW - 120) / 5, (PW - 120) / 5, (PW - 120) / 5, (PW - 120) / 5]);
bullet([
  'Scenario range (Y5 net revenue): Conservative $3.5M · Base $14.4M · Aggressive $53.9M (aggressive turns EBITDA-positive in Y4: +$4.2M, then +$26.3M in Y5).',
  'Expense coverage: payroll, infrastructure/streaming/storage, AI + human moderation, marketing, legal/compliance, support and payment processing are each modeled as separate driver-based lines.',
  'Cash plan assumes Seed $4M now, Series A ≈$9M in Year 3, Series B ≈$6M in Year 4 (editable "New funding" row in the model).',
  'Sobriety checks built in: 8%→5.5%/mo churn (niche-SVOD reality), paid-led early growth, no virality, ad revenue only from Year 3.',
]);

/* ================= 8. FUNDRAISING ================= */
doc.addPage();
h1('8. Fundraising Strategy');
p('Recommendation: skip a separate pre-seed and raise a single $4.0M seed now. Rationale: the product is already built (pre-seed\'s usual purpose), the open question is traction, and answering it credibly takes 24 months of runway — a $1M pre-seed would force a fundraise mid-experiment.', { bold: false });
table(['', 'Scenario A — Lean', 'Scenario B — Recommended', 'Scenario C — Market leader'], [
  ['Raise', '$2.0M', '$4.0M', '$7.0M'],
  ['Runway', '18–20 months', '24–26 months', '~30 months'],
  ['Team size', '~6', '~12 by Year 2', '~18'],
  ['Milestones', '300 creators · 1,500 films · retention proof · ~$0.4M ARR', '935 active creators · 4,200 films · 8.4K subs · ~$0.8M exit ARR · Series A-ready', '2,200 creators · 12.5K films · 18.5K subs · ~$2M exit ARR'],
  ['Risk profile', 'Bridges into the Series A raise; one missed quarter = distress', 'One-quarter buffer; clean A story', 'Only at a competitive/preempted round; dilution-heavy if priced low'],
], [70, (PW - 70) / 3, (PW - 70) / 3, (PW - 70) / 3]);

h1('9. Use of Funds ($4.0M Seed)');
table(['Category', '%', '$', 'What it buys'], [
  ['Engineering & Product', '38%', '$1.52M', '4–5 engineers + design: recommendations, payout infra, TV/mobile apps, creator analytics'],
  ['Growth & Marketing', '24%', '$0.96M', 'Creator + viewer GTM per channel plans; gated on retention milestones'],
  ['Content & Creator Success', '14%', '$0.56M', 'Founding-creator incentives, curation team, festivals, creator success managers'],
  ['Trust, Safety & Moderation', '8%', '$0.32M', 'Human review ops, AI screening, provenance verification, copyright handling'],
  ['Infrastructure', '6%', '$0.24M', 'Streaming/CDN, storage, transcoding capacity'],
  ['Legal & Compliance', '5%', '$0.20M', 'AI-content policy counsel, licensing framework, payout/KYC compliance'],
  ['Operations & Buffer', '5%', '$0.20M', 'Finance ops, insurance, contingency'],
], [110, 35, 50, PW - 195]);

/* ================= 10. HIRING ================= */
h1('10. Hiring Plan (Years 1–3, Base Case)');
table(['Role', 'Loaded salary', 'Y1', 'Y2', 'Y3'], [
  ['CEO (founder)', '$120K', '1', '1', '1'],
  ['CTO / founding engineer', '$140K', '1', '1', '1'],
  ['Full-stack engineers', '$160K', '1.5', '3', '5'],
  ['ML / moderation engineer', '$175K', '—', '1', '2'],
  ['Product designer', '$140K', '0.5', '1', '1.5'],
  ['Head of Content / Curation', '$130K', '0.8', '1', '1'],
  ['Creator Success managers', '$95K', '0.7', '2', '4'],
  ['Growth / performance marketer', '$135K', '0.4', '1', '2'],
  ['Content & social lead', '$90K', '0.2', '1', '2'],
  ['Customer support', '$65K', '0.1', '1', '2.5'],
  ['Finance / ops (fractional → FTE)', '$110K', '0.3', '0.5', '1'],
  ['Trust & safety / moderation ops', '$80K', '0.5', '1.5', '3'],
  ['TOTAL (avg FTEs / payroll)', '', '7.0 / ~$0.9M', '15 / ~$1.9M', '26 / ~$3.3M'],
], [150, 70, 70, 70, PW - 360]);
p('FTEs are year-averages (0.5 = mid-year hire). Salaries fully loaded (base + taxes + benefits + equipment), US-remote blend; 30–40% savings available via EU/LatAm engineering. Curation and creator success are staffed like product roles — they are the moat.', { size: 9 });

/* ================= 11. UNIT ECONOMICS ================= */
doc.addPage();
h1('11. Unit Economics');
table(['Subscribers (YouMake+)', 'Worst', 'Base', 'Best'], [
  ['Net ARPU ($/mo after creator pool)', '$3.50', '$4.39', '$5.39'],
  ['Monthly churn', '9.0%', '6.5%', '4.5%'],
  ['CAC', '$35', '$25', '$16'],
  ['LTV', '$27', '$80', '$98'],
  ['LTV : CAC', '0.8x', '3.2x', '6.1x'],
  ['Payback', '14 mo', '~7 mo', '~4 mo'],
], [170, (PW - 170) / 3, (PW - 170) / 3, (PW - 170) / 3]);
table(['PPV buyers', 'Worst', 'Base', 'Best'], [
  ['Net revenue / transaction', '$2.03', '$2.81', '$3.61'],
  ['Lifetime transactions', '3', '6', '10'],
  ['CAC (must be near-organic)', '$8', '$4', '$2'],
  ['LTV / LTV:CAC', '$6 / 0.8x', '$17 / 4.2x', '$36 / 18x'],
], [170, (PW - 170) / 3, (PW - 170) / 3, (PW - 170) / 3]);
table(['Creators (supply side)', 'Worst', 'Base', 'Best'], [
  ['CAC per activated creator', '$130', '$73', '$46'],
  ['24-month LTV (platform net revenue)', '$200', '$500', '$1,200'],
  ['LTV : CAC', '1.5x', '6.8x', '26x'],
], [170, (PW - 170) / 3, (PW - 170) / 3, (PW - 170) / 3]);
bullet([
  'Read-through: base-case subscriber economics clear the 3x bar with ~7-month payback — fundable, not exceptional. The lever is churn: ±1pt monthly churn ≈ ±$11 LTV. Churn is the metric to underwrite before scaling spend.',
  'PPV is margin-rich but cannot absorb paid CAC; it monetizes organic traffic and feeds subscription conversion.',
  'Creator-side LTV:CAC ≈ 7x is the model\'s quiet strength: supply compounds while demand churns.',
  'Worst-case subscriber economics are NOT viable (0.8x) — stated plainly because the plan\'s spend gates exist precisely to avoid scaling into them.',
]);

/* ================= 12. RISKS ================= */
h1('12. Risks & Mitigations');
table(['Risk', 'L / I', 'Mitigation'], [
  ['Copyright & IP (AI films embedding protected characters, music, likenesses; upstream training-data litigation)', 'High / High', 'Pre-publication review (built); music/character fingerprinting; creator warranties + indemnification; DMCA program; E&O insurance; provenance metadata required; legal budget scales 2.8x by Y5'],
  ['AI regulation (EU AI Act labeling, US deepfake/likeness laws)', 'Med-High / Med', 'Labeling is the platform default — regulation that burdens open platforms is a tailwind for a compliance-native one; counsel on retainer; geo-gating capability'],
  ['Moderation failure (deepfakes of real people, harmful generated content)', 'Med / High', '100% human review pre-publication (feasible to ~30K films/yr); AI screening layer; likeness verification; KYC at payout'],
  ['Fraud (view-count gaming of revenue tiers, stolen cards, self-dealing)', 'Med / Med', 'Paid-view definition = watch-time + settled payment; 30-day payout holds; device/IP anomaly detection; chargeback reserves'],
  ['Content quality / lemon market ("AI slop" floods catalog)', 'High / Med', 'Curation IS the product: approval gate, 60–80% expected early reject rate, quality-weighted discovery, editorial front page'],
  ['Competition (OpenAI/YouTube/Runway verticalizes AI film)', 'Med-High / High', 'Speed to liquidity; multi-tool neutrality (creators won\'t hand distribution to one tool vendor); curation brand; payout relationships'],
  ['Funding risk (selective consumer-marketplace appetite; AI premium may fade)', 'Med / High', 'Raise 24 months (not 18); milestone-gated spend; B2B licensing pivot preserved as revenue backstop'],
  ['Demand risk (will people pay to watch AI films?) — the core unproven assumption', 'Med-High / Very High', 'This is what the seed exists to answer. Phase-gated spending with explicit kill criteria; no scale marketing before D7 >25% and M3 retention >55% are proven'],
], [185, 65, PW - 250]);

/* ================= 13. VALUATION ================= */
doc.addPage();
h1('13. Valuation Analysis');
table(['Round', 'Milestone basis', 'Valuation (post)', 'Dilution', 'Comparables & basis'], [
  ['Pre-seed (if taken)', 'MVP live, pre-traction', '$5–8M cap (SAFE)', '10–15%', '2025–26 US pre-seed medians ~$5–7M (Carta) + AI-consumer premium'],
  ['Seed (recommended)', 'MVP + founding creators signed', '$14–18M post ($4M on $10–14M pre)', '22–28%', 'Carta 2025 seed medians ~$15M post for consumer marketplace; AI-content upper band. Reference points: Patreon seed (era-adjusted), Nebula (~$50M, bootstrapped), early Vimeo OTT'],
  ['Series A', 'M20–28: $1.5–2.5M ARR, 4–5x YoY, churn <7%/mo, 1,000+ films', '$45–70M post ($9–12M raise)', '18–22%', '8–15x forward net revenue for marketplaces + AI premium; consumer-sub As at ~$2M ARR priced $40–60M in 2024–25 vintage'],
  ['Series B (illustrative)', 'Year 4: $8–12M net revenue run-rate', '$120–200M', '15–20%', 'Contingent on take-rate durability and EBITDA trajectory'],
], [75, 120, 95, 50, PW - 340]);
bullet([
  'These valuations assume milestones are met; pre-traction, price reflects team + thesis + working product — $10–14M pre is the defensible 2026 range, not higher.',
  'Anchor on NET revenue multiples; quoting gross-billings multiples damages credibility with marketplace-literate investors.',
  'The AI-content sentiment premium may compress; the base case is built to support a Series A on metrics, not hype, by Month ~24–28.',
  'Founder dilution through Series A ≈ 40–45% cumulative including ~10% ESOP refresh.',
]);
doc.moveDown(1);
doc.rect(60, doc.y, PW, 2).fill(PURPLE);
doc.moveDown(0.8);
p('Prepared June 2026. Companion files: YouMakeTV_BusinessPlan.xlsx (fully editable, formula-driven model — scenario switch on the Assumptions sheet) and YouMakeTV_Investor_Deck.pptx. Market figures are estimates from cited public research; projections are illustrative and depend on stated assumptions.', { size: 8.5, color: LIGHT });

/* page numbers */
const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i++) {
  doc.switchToPage(i);
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0; // allow writing inside the bottom margin without triggering a new page
  doc.fillColor(LIGHT).font('Body').fontSize(8)
    .text(`YouMakeTV — Confidential · ${i + 1}`, 60, doc.page.height - 46, { width: PW, align: 'right', lineBreak: false });
  doc.page.margins.bottom = savedBottom;
}
doc.end();
console.log('Wrote', OUT);
