/* YouMakeTV_BusinessPlan.xlsx builder
   - Assumptions sheet: 3 scenarios (Conservative / Base / Aggressive), scenario switch cell
   - Model sheet: 5-year P&L driven entirely by live formulas referencing Assumptions
   - Supporting sheets: Market, Competition, GTM, Bootstrapping, Unit Economics, Hiring,
     Use of Funds, Valuation, Risks
*/
const ExcelJS = require('exceljs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'YouMakeTV_BusinessPlan.xlsx');

/* ----------------------------- styling helpers ----------------------------- */
const C = {
  navy: 'FF101828', purple: 'FF6D28D9', lightPurple: 'FFEDE9FE',
  inputFill: 'FFFFF7CC', headerFill: 'FF101828', subHeaderFill: 'FFE5E7EB',
  bandFill: 'FFF3F4F6', good: 'FF15803D', bad: 'FFB91C1C', grayTxt: 'FF6B7280',
};
const fmt = {
  usd0: '$#,##0', usd2: '$#,##0.00', usd0k: '$#,##0,"K"', num0: '#,##0',
  num1: '#,##0.0', pct0: '0%', pct1: '0.0%', mult: '0.0"x"',
};
function fill(hex) { return { type: 'pattern', pattern: 'solid', fgColor: { argb: hex } }; }
function titleRow(ws, cell, text) {
  const c = ws.getCell(cell);
  c.value = text;
  c.font = { bold: true, size: 16, color: { argb: C.navy } };
}
function sectionRow(ws, row, text, lastCol = 'G') {
  ws.mergeCells(`B${row}:${lastCol}${row}`);
  const c = ws.getCell(`B${row}`);
  c.value = text;
  c.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  c.fill = fill(C.headerFill);
}
function markInput(cell) {
  cell.fill = fill(C.inputFill);
  cell.border = { top: {style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
}

/* ----------------------------- assumption spec ----------------------------- */
/* Each entry: key, label, unit, numFmt, values [cons, base, aggr] (single) or
   perYear: [[y1..y5] cons, [y1..y5] base, [y1..y5] aggr] */
const singles = [
  ['ppvPrice',        'Avg. pay-per-view price',                  '$ / film',      fmt.usd2, [3.99, 4.99, 5.99]],
  ['subPrice',        'YouMake+ subscription price',              '$ / month',     fmt.usd2, [6.99, 7.99, 8.99]],
  ['creatorPpvShare', 'Creator share of PPV (blended across tiers)', '% of PPV',   fmt.pct0, [0.40, 0.36, 0.33]],
  ['subPoolShare',    'Creator pool share of subscription revenue','% of subs rev',fmt.pct0, [0.50, 0.45, 0.40]],
  ['procPct',         'Payment processing cost',                  '% of gross billings', fmt.pct1, [0.055, 0.045, 0.040]],
  ['adArpu',          'Ad net ARPU at maturity (per registered user)', '$ / user / yr', fmt.usd2, [1.20, 2.40, 4.00]],
  ['featured',        'Featured placement / promo rev per active creator', '$ / creator / yr', fmt.usd0, [15, 30, 60]],
  ['ppvBuyerPct',     'Registered users who buy PPV',             '% of registered', fmt.pct0, [0.06, 0.08, 0.10]],
  ['subCac',          'Blended paid CAC per gross subscriber add (Year 1)', '$',  fmt.usd2, [35, 25, 20]],
  ['cacDecay',        'Annual CAC improvement factor',            'x / yr',        '0.00',  [0.95, 0.90, 0.88]],
  ['hoursPerSubMo',   'Viewing hours per subscriber',             'hrs / month',   fmt.num0, [8, 10, 12]],
  ['streamCostHr',    'Streaming + delivery cost',                '$ / hour',      '$0.000', [0.05, 0.04, 0.03]],
  ['activationPct',   'Creator activation (signs up AND publishes)', '% of signups', fmt.pct0, [0.45, 0.55, 0.65]],
  ['filmsPerCreator', 'Films published per active creator per year', 'films / yr', fmt.num1, [2.5, 3.5, 4.5]],
  ['creatorCac',      'Creator acquisition cost',                 '$ / signup',    fmt.usd0, [60, 40, 30]],
  ['modPerFilm',      'Moderation + review cost per film',        '$ / film',      fmt.usd0, [12, 8, 6]],
  ['storPerFilmYr',   'Storage + transcode per film in catalog',  '$ / film / yr', fmt.usd0, [6, 4, 3]],
  ['avgSalaryK',      'Avg. fully-loaded cost per employee',      '$K / yr',       fmt.num0, [155, 145, 135]],
  ['legalY1',         'Legal, compliance & content policy (Year 1)', '$K / yr',    fmt.num0, [80, 120, 180]],
  ['supportPct',      'Customer support cost',                    '% of net rev (min $60K)', fmt.pct0, [0.06, 0.05, 0.04]],
  ['gnaPct',          'G&A, tools, insurance, office',            '% of payroll',  fmt.pct0, [0.15, 0.12, 0.10]],
  ['fundingY1',       'Funding raised at start of Year 1',        '$K',            fmt.num0, [2000, 4000, 7000]],
];
const perYears = [
  ['regViewers', 'Registered viewers, end of year', '000s', fmt.num1,
    [[15,60,180,420,800],[30,120,400,1000,2000],[50,250,900,2500,5000]]],
  ['subAdds', 'Gross subscriber additions', '000s / yr', fmt.num1,
    [[1.5,6,18,40,75],[2.5,12,40,95,190],[4,25,90,220,450]]],
  ['churn', 'Subscriber churn (monthly)', '% / month', fmt.pct1,
    [[0.09,0.08,0.075,0.07,0.065],[0.08,0.07,0.065,0.06,0.055],[0.07,0.06,0.055,0.05,0.045]]],
  ['ppvTxns', 'PPV purchases per buyer per year', 'txns / yr', fmt.num1,
    [[2.5,3,3.5,4,4.5],[3,3.5,4,4.5,5],[3.5,4,4.5,5,5.5]]],
  ['paidShare', 'Share of subscriber adds from paid channels', '%', fmt.pct0,
    [[0.85,0.80,0.75,0.70,0.65],[0.80,0.70,0.60,0.50,0.40],[0.75,0.65,0.50,0.40,0.30]]],
  ['newCreators', 'New creator signups', 'creators / yr', fmt.num0,
    [[300,700,1500,2500,4000],[500,1200,2800,5000,8000],[900,2500,6000,11000,18000]]],
  ['headcount', 'Headcount (avg. for year)', 'FTEs', fmt.num0,
    [[5,8,14,22,32],[6,12,22,36,48],[8,18,34,56,80]]],
  ['brandMktg', 'Brand, content & community marketing', '$K / yr', fmt.num0,
    [[60,150,350,700,1200],[100,250,600,1200,2000],[200,600,1500,3000,5000]]],
];
const ADRAMP = [0, 0, 0.25, 0.6, 1.0];
const LEGALRAMP = [1, 1.3, 1.7, 2.2, 2.8];
const RAISES = [0, 0, 9000000, 6000000, 0]; // base-case future financings, editable in Model
const SUPPORT_FLOOR = 60000;

/* ------------------------- JS mirror of the Excel model ------------------------- */
function computeScenario(si) {
  const g = {}; // get single
  for (const [k,,,,v] of singles) g[k] = v[si];
  const p = {}; // per-year
  for (const [k,,,,v] of perYears) p[k] = v[si];

  const Y = 5, r = {};
  const arr = () => new Array(Y).fill(0);
  r.newCreators = p.newCreators.slice();
  r.activeCreators = arr(); r.newFilms = arr(); r.catalog = arr();
  r.subsEnd = arr(); r.subsAvg = arr();
  r.subBill = arr(); r.ppvTx = arr(); r.ppvBill = arr(); r.adRev = arr(); r.featRev = arr();
  r.gross = arr(); r.payouts = arr(); r.netRev = arr();
  r.cogs = arr(); r.gp = arr(); r.gmPct = arr();
  r.payroll = arr(); r.mktg = arr(); r.opex = arr(); r.ebitda = arr();
  r.cashEnd = arr();
  let cumCreators = 0, cumFilms = 0, prevSubs = 0, cash = g.fundingY1 * 1000;
  for (let y = 0; y < Y; y++) {
    cumCreators += p.newCreators[y];
    r.activeCreators[y] = cumCreators * g.activationPct;
    r.newFilms[y] = r.activeCreators[y] * g.filmsPerCreator;
    cumFilms += r.newFilms[y];
    r.catalog[y] = cumFilms;
    const ch = p.churn[y], adds = p.subAdds[y] * 1000;
    const end = prevSubs * Math.pow(1 - ch, 12) + adds * Math.pow(1 - ch, 6);
    r.subsAvg[y] = (prevSubs + end) / 2;
    r.subsEnd[y] = end; prevSubs = end;
    const reg = p.regViewers[y] * 1000;
    r.subBill[y] = r.subsAvg[y] * g.subPrice * 12;
    r.ppvTx[y] = reg * g.ppvBuyerPct * p.ppvTxns[y];
    r.ppvBill[y] = r.ppvTx[y] * g.ppvPrice;
    r.adRev[y] = reg * g.adArpu * ADRAMP[y];
    r.featRev[y] = r.activeCreators[y] * g.featured;
    r.gross[y] = r.subBill[y] + r.ppvBill[y] + r.adRev[y] + r.featRev[y];
    r.payouts[y] = r.ppvBill[y] * g.creatorPpvShare + r.subBill[y] * g.subPoolShare;
    r.netRev[y] = r.gross[y] - r.payouts[y];
    const proc = r.gross[y] * g.procPct;
    const stream = r.subsAvg[y] * g.hoursPerSubMo * 12 * g.streamCostHr + r.ppvTx[y] * 2 * g.streamCostHr;
    const stor = r.catalog[y] * g.storPerFilmYr;
    const mod = r.newFilms[y] * g.modPerFilm;
    r.cogs[y] = proc + stream + stor + mod;
    r.gp[y] = r.netRev[y] - r.cogs[y];
    r.gmPct[y] = r.gp[y] / r.netRev[y];
    r.payroll[y] = p.headcount[y] * g.avgSalaryK * 1000;
    const creatorAcq = p.newCreators[y] * g.creatorCac;
    const viewerAcq = adds * g.subCac * Math.pow(g.cacDecay, y) * p.paidShare[y];
    const brand = p.brandMktg[y] * 1000;
    r.mktg[y] = creatorAcq + viewerAcq + brand;
    const legal = g.legalY1 * 1000 * LEGALRAMP[y];
    const support = Math.max(SUPPORT_FLOOR, r.netRev[y] * g.supportPct);
    const gna = r.payroll[y] * g.gnaPct;
    r.opex[y] = r.payroll[y] + r.mktg[y] + legal + support + gna;
    r.ebitda[y] = r.gp[y] - r.opex[y];
    cash += RAISES[y] + r.ebitda[y];
    r.cashEnd[y] = cash;
  }
  r.exitMRR = r.subsEnd.map(s => s * g.subPrice);
  r.exitARR = r.exitMRR.map(m => m * 12);
  return r;
}

/* ----------------------------- workbook ----------------------------- */
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'YouMakeTV';
  wb.calcProperties.fullCalcOnLoad = true;

  /* ============ README ============ */
  {
    const ws = wb.addWorksheet('README', { properties: { tabColor: { argb: C.purple } } });
    ws.getColumn('A').width = 3; ws.getColumn('B').width = 110;
    titleRow(ws, 'B2', 'YouMakeTV — 5-Year Business & Financial Model');
    const lines = [
      '',
      'HOW TO USE THIS WORKBOOK',
      '1. Go to the "Assumptions" sheet and set the Scenario switch (cell D3): 1 = Conservative, 2 = Base, 3 = Aggressive.',
      '2. Every yellow cell is an editable input. All white/grey cells are live formulas — do not overtype them.',
      '3. The "Model" sheet recalculates the full 5-year P&L, cash position and KPIs from the Assumptions sheet.',
      '4. Future financing rounds (Series A / B) are editable inputs on the Model sheet, row "New funding".',
      '',
      'SHEETS',
      '• Assumptions — every driver of the model, with Conservative / Base / Aggressive values side by side.',
      '• Model — 5-year users, revenue, creator payouts, COGS, OPEX, EBITDA, cash and runway.',
      '• Market — TAM / SAM / SOM with CAGR and sources.',
      '• Competition — competitive landscape and positioning matrix.',
      '• GTM-Creators — creator acquisition channels: reach, cost, conversion, expected signups, CAC.',
      '• GTM-Viewers — viewer acquisition channels: budget, CPM, CTR, conversion, expected subscribers, CAC.',
      '• Bootstrapping — the 3-phase cold-start plan for marketplace liquidity.',
      '• UnitEcon — CAC, LTV and payback for subscribers, PPV buyers and creators (best / base / worst).',
      '• Hiring — role-by-role hiring plan, Years 1–3, with salaries.',
      '• UseOfFunds — allocation of the recommended seed round.',
      '• Valuation — comparable-company analysis and round-by-round valuation framework.',
      '• Risks — risk register with likelihood, impact and mitigations.',
      '',
      'MODELLING PRINCIPLES',
      '• Revenue is shown both as GROSS BILLINGS (what viewers pay) and NET REVENUE (platform take after creator payouts).',
      '  Investors should anchor on NET REVENUE — it is the comparable figure for marketplace businesses.',
      '• Subscriber dynamics use cohort decay: End = Begin × (1−churn)^12 + Adds × (1−churn)^6.',
      '• Marketing spend is DERIVED from growth targets (adds × CAC × paid share), so growth and budget always reconcile.',
      '• The Base case is deliberately sober: niche-SVOD churn (7–8%/mo early), no viral assumptions, paid-led early growth.',
      '',
      'DISCLAIMER: Market sizes are estimates compiled from public research (sources cited on the Market sheet).',
      'All projections are illustrative and depend on the assumptions herein. Prepared June 2026.',
    ];
    let rix = 4;
    for (const t of lines) {
      const c = ws.getCell(`B${rix++}`);
      c.value = t;
      if (/^[A-Z &]+$/.test(t) && t.length > 3) c.font = { bold: true, color: { argb: C.purple } };
      c.alignment = { wrapText: true, vertical: 'top' };
    }
  }

  /* ============ ASSUMPTIONS ============ */
  const A = {}; // key -> row (singles) or first row (per-year)
  {
    const ws = wb.addWorksheet('Assumptions', { properties: { tabColor: { argb: 'FFF59E0B' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 52; ws.getColumn('C').width = 20;
    ['D','E','F','G'].forEach(col => ws.getColumn(col).width = 15);
    titleRow(ws, 'B1', 'Assumptions & Scenario Drivers');
    ws.getCell('B3').value = 'Scenario switch  (1 = Conservative, 2 = Base, 3 = Aggressive):';
    ws.getCell('B3').font = { bold: true };
    const sw = ws.getCell('D3'); sw.value = 2; markInput(sw); sw.font = { bold: true, size: 14 };
    ws.getCell('E3').value = { formula: 'CHOOSE($D$3,"CONSERVATIVE","BASE","AGGRESSIVE")', result: 'BASE' };
    ws.getCell('E3').font = { bold: true, color: { argb: C.purple } };

    const hdr = 5;
    ws.getRow(hdr).values = [null, 'Driver', 'Unit', 'Conservative', 'Base', 'Aggressive', 'ACTIVE'];
    ws.getRow(hdr).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F','G'].forEach(col => ws.getCell(`${col}${hdr}`).fill = fill(C.headerFill));

    let row = hdr + 1;
    const writeDriver = (label, unit, numFmt, vals) => {
      ws.getCell(`B${row}`).value = label;
      ws.getCell(`C${row}`).value = unit;
      ws.getCell(`C${row}`).font = { color: { argb: C.grayTxt }, size: 9 };
      ['D','E','F'].forEach((col, i) => {
        const c = ws.getCell(`${col}${row}`);
        c.value = vals[i]; c.numFmt = numFmt; markInput(c);
      });
      const g = ws.getCell(`G${row}`);
      g.value = { formula: `CHOOSE($D$3,D${row},E${row},F${row})`, result: vals[1] };
      g.numFmt = numFmt; g.font = { bold: true };
      g.fill = fill(C.lightPurple);
      return row++;
    };

    sectionRow(ws, row, 'PRICING & TAKE RATES'); row++;
    for (const [key, label, unit, numFmt, vals] of singles.slice(0, 8)) A[key] = writeDriver(label, unit, numFmt, vals);
    sectionRow(ws, row, 'VIEWER GROWTH & ACQUISITION'); row++;
    for (const [key, label, unit, numFmt, vals] of singles.slice(8, 12)) A[key] = writeDriver(label, unit, numFmt, vals);
    sectionRow(ws, row, 'CREATOR SUPPLY'); row++;
    for (const [key, label, unit, numFmt, vals] of singles.slice(12, 17)) A[key] = writeDriver(label, unit, numFmt, vals);
    sectionRow(ws, row, 'TEAM & OVERHEAD'); row++;
    for (const [key, label, unit, numFmt, vals] of singles.slice(17)) A[key] = writeDriver(label, unit, numFmt, vals);

    sectionRow(ws, row, 'PER-YEAR DRIVERS (each row = one year)'); row++;
    for (const [key, label, unit, numFmt, scen] of perYears) {
      A[key] = row;
      for (let y = 0; y < 5; y++) {
        writeDriver(`${label} — Year ${y + 1}`, unit, numFmt, [scen[0][y], scen[1][y], scen[2][y]]);
      }
    }
    ws.views = [{ state: 'frozen', ySplit: 5 }];
  }
  const ref = (key, y = 0) => `Assumptions!$G$${A[key] + y}`;

  /* ============ MODEL ============ */
  const R = [computeScenario(0), computeScenario(1), computeScenario(2)];
  const base = R[1];
  {
    const ws = wb.addWorksheet('Model', { properties: { tabColor: { argb: 'FF10B981' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 44;
    ['C','D','E','F','G'].forEach(col => ws.getColumn(col).width = 15);
    titleRow(ws, 'B1', 'YouMakeTV — 5-Year Operating Model');
    ws.getCell('B2').value = { formula: '"Active scenario: "&CHOOSE(Assumptions!$D$3,"CONSERVATIVE","BASE","AGGRESSIVE")', result: 'Active scenario: BASE' };
    ws.getCell('B2').font = { italic: true, color: { argb: C.purple } };

    const cols = ['C','D','E','F','G'];
    ws.getRow(4).values = [null, '', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    ws.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F','G'].forEach(col => ws.getCell(`${col}4`).fill = fill(C.headerFill));

    let row = 5;
    const line = (label, numFmt, fns, results, opts = {}) => {
      const r = row;
      ws.getCell(`B${r}`).value = label;
      if (opts.bold) ws.getCell(`B${r}`).font = { bold: true };
      if (opts.indent) ws.getCell(`B${r}`).alignment = { indent: 1 };
      cols.forEach((col, y) => {
        const c = ws.getCell(`${col}${r}`);
        if (opts.input) { c.value = results[y]; markInput(c); }
        else c.value = { formula: fns(y, col, r), result: results[y] };
        c.numFmt = numFmt;
        if (opts.bold) { c.font = { bold: true }; c.fill = fill(C.bandFill); }
      });
      row++;
      return r;
    };
    const sec = (t) => { sectionRow(ws, row, t); row++; };

    sec('SUPPLY — CREATORS & CATALOG');
    const rNewCr = line('New creator signups', fmt.num0, (y) => ref('newCreators', y), base.newCreators);
    const rActCr = line('Active creators (cumulative × activation)', fmt.num0,
      (y, col) => `SUM($C$${rNewCr}:${col}${rNewCr})*${ref('activationPct')}`, base.activeCreators);
    const rNewF = line('New films published', fmt.num0,
      (y, col) => `${col}${rActCr}*${ref('filmsPerCreator')}`, base.newFilms);
    const rCat = line('Catalog size (cumulative films)', fmt.num0,
      (y, col) => `SUM($C$${rNewF}:${col}${rNewF})`, base.catalog, { bold: true });

    sec('DEMAND — VIEWERS & SUBSCRIBERS');
    const rReg = line('Registered viewers (end of year)', fmt.num0,
      (y) => `${ref('regViewers', y)}*1000`, perYears[0][4][1].map(v => v * 1000));
    const rAdds = line('Gross subscriber additions', fmt.num0,
      (y) => `${ref('subAdds', y)}*1000`, perYears[1][4][1].map(v => v * 1000));
    const rChurn = line('Monthly churn', fmt.pct1, (y) => ref('churn', y), perYears[2][4][1]);
    const rSubsE = line('Subscribers — end of year', fmt.num0,
      (y, col) => y === 0
        ? `${col}${rAdds}*(1-${col}${rChurn})^6`
        : `${cols[y-1]}${row}*(1-${col}${rChurn})^12+${col}${rAdds}*(1-${col}${rChurn})^6`,
      base.subsEnd, { bold: true });
    const rSubsA = line('Subscribers — average', fmt.num0,
      (y, col) => y === 0 ? `${col}${rSubsE}/2` : `(${cols[y-1]}${rSubsE}+${col}${rSubsE})/2`, base.subsAvg);

    sec('REVENUE — GROSS BILLINGS');
    const rSubB = line('Subscription billings', fmt.usd0,
      (y, col) => `${col}${rSubsA}*${ref('subPrice')}*12`, base.subBill);
    const rTx = line('PPV transactions', fmt.num0,
      (y, col) => `${col}${rReg}*${ref('ppvBuyerPct')}*${ref('ppvTxns', y)}`, base.ppvTx);
    const rPpvB = line('PPV billings', fmt.usd0,
      (y, col) => `${col}${rTx}*${ref('ppvPrice')}`, base.ppvBill);
    const rRamp = line('Ad monetization ramp (input)', fmt.pct0, null, ADRAMP, { input: true });
    const rAd = line('Advertising revenue (net)', fmt.usd0,
      (y, col) => `${col}${rReg}*${ref('adArpu')}*${col}${rRamp}`, base.adRev);
    const rFeat = line('Featured placement & creator promo', fmt.usd0,
      (y, col) => `${col}${rActCr}*${ref('featured')}`, base.featRev);
    const rGross = line('TOTAL GROSS BILLINGS', fmt.usd0,
      (y, col) => `${col}${rSubB}+${col}${rPpvB}+${col}${rAd}+${col}${rFeat}`, base.gross, { bold: true });

    sec('CREATOR PAYOUTS');
    const rPOppv = line('PPV payouts to creators', fmt.usd0,
      (y, col) => `${col}${rPpvB}*${ref('creatorPpvShare')}`, base.ppvBill.map((v,i)=>v*0.36));
    const rPOsub = line('Subscription pool payouts', fmt.usd0,
      (y, col) => `${col}${rSubB}*${ref('subPoolShare')}`, base.subBill.map((v,i)=>v*0.45));
    const rPO = line('Total creator payouts', fmt.usd0,
      (y, col) => `${col}${rPOppv}+${col}${rPOsub}`, base.payouts, { bold: true });
    const rNet = line('NET REVENUE (platform take)', fmt.usd0,
      (y, col) => `${col}${rGross}-${col}${rPO}`, base.netRev, { bold: true });
    line('Net revenue growth (YoY)', fmt.pct0,
      (y, col) => y === 0 ? `""` : `${col}${rNet}/${cols[y-1]}${rNet}-1`,
      base.netRev.map((v, i) => i === 0 ? '' : v / base.netRev[i-1] - 1));

    sec('COST OF REVENUE');
    const rProc = line('Payment processing', fmt.usd0,
      (y, col) => `${col}${rGross}*${ref('procPct')}`, base.gross.map(v => v * 0.045));
    const rStream = line('Streaming, CDN & delivery', fmt.usd0,
      (y, col) => `${col}${rSubsA}*${ref('hoursPerSubMo')}*12*${ref('streamCostHr')}+${col}${rTx}*2*${ref('streamCostHr')}`,
      base.subsAvg.map((s, i) => s * 10 * 12 * 0.04 + base.ppvTx[i] * 2 * 0.04));
    const rStor = line('Storage & transcoding', fmt.usd0,
      (y, col) => `${col}${rCat}*${ref('storPerFilmYr')}`, base.catalog.map(v => v * 4));
    const rMod = line('Moderation, review & content QA', fmt.usd0,
      (y, col) => `${col}${rNewF}*${ref('modPerFilm')}`, base.newFilms.map(v => v * 8));
    const rCogs = line('Total cost of revenue', fmt.usd0,
      (y, col) => `${col}${rProc}+${col}${rStream}+${col}${rStor}+${col}${rMod}`, base.cogs, { bold: true });
    const rGP = line('GROSS PROFIT', fmt.usd0,
      (y, col) => `${col}${rNet}-${col}${rCogs}`, base.gp, { bold: true });
    line('Gross margin (% of net revenue)', fmt.pct0,
      (y, col) => `${col}${rGP}/${col}${rNet}`, base.gmPct);

    sec('OPERATING EXPENSES');
    const rHC = line('Headcount (avg. FTEs)', fmt.num0, (y) => ref('headcount', y), perYears[6][4][1]);
    const rPay = line('Payroll & benefits', fmt.usd0,
      (y, col) => `${col}${rHC}*${ref('avgSalaryK')}*1000`, base.payroll);
    const rCrAcq = line('Creator acquisition', fmt.usd0,
      (y, col) => `${col}${rNewCr}*${ref('creatorCac')}`, base.newCreators.map(v => v * 40));
    const rVwAcq = line('Viewer acquisition (paid)', fmt.usd0,
      (y, col) => `${col}${rAdds}*${ref('subCac')}*${ref('cacDecay')}^${y}*${ref('paidShare', y)}`,
      perYears[1][4][1].map((v, i) => v * 1000 * 25 * Math.pow(0.9, i) * perYears[4][4][1][i]));
    const rBrand = line('Brand, content & community', fmt.usd0,
      (y) => `${ref('brandMktg', y)}*1000`, perYears[7][4][1].map(v => v * 1000));
    const rMktg = line('Total marketing', fmt.usd0,
      (y, col) => `${col}${rCrAcq}+${col}${rVwAcq}+${col}${rBrand}`, base.mktg, { bold: true });
    const rLegal = line('Legal, compliance & content policy', fmt.usd0,
      (y) => `${ref('legalY1')}*1000*${LEGALRAMP[y]}`, LEGALRAMP.map(m => 120000 * m));
    const rSup = line('Customer support & community ops', fmt.usd0,
      (y, col) => `MAX(${SUPPORT_FLOOR},${col}${rNet}*${ref('supportPct')})`,
      base.netRev.map(v => Math.max(SUPPORT_FLOOR, v * 0.05)));
    const rGna = line('G&A, tools, insurance', fmt.usd0,
      (y, col) => `${col}${rPay}*${ref('gnaPct')}`, base.payroll.map(v => v * 0.12));
    const rOpex = line('TOTAL OPEX', fmt.usd0,
      (y, col) => `${col}${rPay}+${col}${rMktg}+${col}${rLegal}+${col}${rSup}+${col}${rGna}`, base.opex, { bold: true });

    sec('PROFITABILITY');
    const rEb = line('EBITDA', fmt.usd0, (y, col) => `${col}${rGP}-${col}${rOpex}`, base.ebitda, { bold: true });
    line('EBITDA margin (% of net revenue)', fmt.pct0, (y, col) => `${col}${rEb}/${col}${rNet}`,
      base.ebitda.map((v, i) => v / base.netRev[i]));

    sec('CASH & RUNWAY');
    const rBeg = line('Beginning cash', fmt.usd0,
      (y, col) => y === 0 ? `${ref('fundingY1')}*1000` : `${cols[y-1]}${row + 2}`,
      [4000000, ...base.cashEnd.slice(0, 4)]);
    const rRaise = line('New funding (input — edit for your raise plan)', fmt.usd0, null, RAISES, { input: true });
    const rEnd = line('Ending cash', fmt.usd0,
      (y, col) => `${col}${rBeg}+${col}${rRaise}+${col}${rEb}`, base.cashEnd, { bold: true });
    line('Runway at year-end burn (months)', fmt.num1,
      (y, col) => `IF(${col}${rEb}<0,${col}${rEnd}/(-${col}${rEb}/12),999)`,
      base.ebitda.map((e, i) => e < 0 ? base.cashEnd[i] / (-e / 12) : 999));

    sec('KEY METRICS');
    const rMRR = line('Exit MRR (subscriptions)', fmt.usd0,
      (y, col) => `${col}${rSubsE}*${ref('subPrice')}`, base.exitMRR);
    line('Exit ARR (subscriptions)', fmt.usd0, (y, col) => `${col}${rMRR}*12`, base.exitARR);
    line('Net revenue per active creator', fmt.usd0,
      (y, col) => `${col}${rNet}/${col}${rActCr}`, base.netRev.map((v, i) => v / base.activeCreators[i]));
    ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 4 }];
  }

  /* ============ MARKET ============ */
  {
    const ws = wb.addWorksheet('Market', { properties: { tabColor: { argb: 'FF3B82F6' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 38;
    ['C','D','E','F'].forEach(c => ws.getColumn(c).width = 18);
    ws.getColumn('G').width = 60;
    titleRow(ws, 'B1', 'Market Analysis — TAM / SAM / SOM');
    ws.getRow(3).values = [null, 'Market', '2026 size (est.)', '2030–32 size (est.)', 'CAGR (est.)', '', 'Source / basis'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F','G'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    const rows = [
      ['AI video generation tools', '$3.2B', '$14–16B (2030)', '28–35%', '', 'Grand View Research / MarketsandMarkets AI video generator reports (2024–25); Sora/Veo/Runway commercial launches accelerated 2025–26'],
      ['Global video streaming (OTT)', '$720B', '$1.9T (2030)', '~19–21%', '', 'Grand View Research video streaming market report; includes SVOD, AVOD, FAST'],
      ['Creator economy', '$250–300B', '$480–600B (2030)', '~12–15%', '', 'Goldman Sachs creator economy research (2023, updated trajectories); SignalFire / Linktree creator reports'],
      ['Independent film production & distribution', '$15–20B', '$25–30B (2030)', '~6–8%', '', 'IBISWorld / Statista independent film segment; theatrical + digital self-distribution'],
      ['AI-generated entertainment content (nascent)', '$1–2B', '$10–25B (2030)', '>50% (from small base)', '', 'Bottom-up: AI tool subscription base × content output × monetization rates; no established analyst category yet — early-stage estimate'],
    ];
    let r = 4;
    for (const vals of rows) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).font = { bold: true };
      ws.getCell(`G${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getCell(`G${r}`).font = { size: 9, color: { argb: C.grayTxt } };
      if (r % 2 === 0) ['B','C','D','E','F','G'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 38;
      r++;
    }
    r += 1;
    sectionRow(ws, r, 'YOUMAKETV TAM / SAM / SOM BUILD (bottom-up)', 'G'); r++;
    const build = [
      ['TAM — Total Addressable Market', '$45B', 'Global premium on-demand video spend addressable by independent/AI content: ~6% of $720B streaming market (indie + niche SVOD + transactional VOD) + creator-monetization tooling.'],
      ['SAM — Serviceable Addressable Market', '$3.5B', 'Direct monetization of AI-native film/video content (PPV + niche SVOD + creator services) in English-speaking + EU markets over next 5 years.'],
      ['SOM — Serviceable Obtainable Market (Yr 5)', '$60–110M gross billings', 'Base-to-aggressive Year-5 gross billings from the Model represent ~0.5–3% share of SAM; Base case models ~$21M gross billings — deliberately below SOM ceiling.'],
    ];
    for (const [label, size, basis] of build) {
      ws.getCell(`B${r}`).value = label; ws.getCell(`B${r}`).font = { bold: true };
      ws.getCell(`C${r}`).value = size; ws.getCell(`C${r}`).font = { bold: true, color: { argb: C.purple } };
      ws.mergeCells(`D${r}:G${r}`);
      ws.getCell(`D${r}`).value = basis;
      ws.getCell(`D${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 42;
      r++;
    }
    r += 1;
    sectionRow(ws, r, 'KEY TRENDS', 'G'); r++;
    const trends = [
      'Cost of producing a watchable short film has collapsed from ~$50K+ to <$500 in tooling/compute (Sora, Veo 3, Runway Gen-4, Kling 2.x) — supply of AI films is exploding.',
      'No incumbent platform treats AI films as a first-class category: YouTube buries them in general content; Netflix/Prime don\'t accept them; tool vendors (Runway, Pika) monetize creation, not distribution.',
      'Creator economy monetization is shifting from ad-share to direct fan monetization (memberships, PPV) — favorable to a take-rate marketplace.',
      'Regulatory pressure (AI labeling, provenance) favors a curated, compliance-first platform over open uploads.',
      'FAST/AVOD growth shows audiences accept new low-cost content brands when discovery is good.',
    ];
    for (const t of trends) {
      ws.mergeCells(`B${r}:G${r}`);
      ws.getCell(`B${r}`).value = '• ' + t;
      ws.getCell(`B${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 30;
      r++;
    }
  }

  /* ============ COMPETITION ============ */
  {
    const ws = wb.addWorksheet('Competition', { properties: { tabColor: { argb: 'FFEF4444' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 18; ws.getColumn('C').width = 16;
    ['D','E','F'].forEach(c => ws.getColumn(c).width = 46);
    titleRow(ws, 'B1', 'Competitive Landscape');
    ws.getRow(3).values = [null, 'Player', 'Type', 'Strengths', 'Weaknesses', 'Opportunity for YouMakeTV'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    const comp = [
      ['YouTube', 'UGC / ads', 'Massive reach (2.5B+ MAU); free; best-in-class discovery & infra; Shorts funnel', 'AI films buried among all content; ad-share economics weak for long-form niche ($1–3 RPM); no PPV-first model; algorithm punishes low-sub channels', 'Position as the premium, curated home where AI filmmakers actually earn per view, not per ad impression. Use YouTube as a trailer/funnel channel, not a competitor for the catalog.'],
      ['Vimeo OTT', 'White-label VOD', 'Mature paywall tech; creator keeps ~90%; strong player/infra', 'No audience — creators bring 100% of traffic; declining consumer brand; expensive for small creators', 'YouMakeTV provides the audience + marketplace discovery Vimeo never built. Target Vimeo OTT churners.'],
      ['Patreon', 'Membership', '8M+ paying members; recurring revenue mechanics; creator loyalty', 'Not a viewing destination; no discovery; video experience poor; membership ≠ per-title sales', 'Integrate membership-style follows with actual streaming. Patreon creators with film projects are a prime acquisition list.'],
      ['Kickstarter', 'Crowdfunding', 'Proven film-funding behavior; project discovery', 'One-shot funding, no distribution or recurring monetization', 'Partner/funnel: films funded on Kickstarter need a distribution home; AI films rarely fit its norms.'],
      ['Netflix', 'Premium SVOD', 'Brand, $17B+ content budget, global subs (300M+)', 'Closed; does not accept indie/AI submissions; experimenting with AI internally but not as a marketplace', 'Be the open marketplace Netflix structurally cannot be. Long-term: license breakout AI titles upward.'],
      ['Prime Video Direct', 'Open VOD', 'Huge audience; self-serve uploads', 'Has been cutting royalty rates & rejecting low-engagement content; AI content explicitly restricted/limited; opaque payouts', 'Creators rejected or demonetized by PVD are actively seeking alternatives — a real, motivated segment.'],
      ['TikTok', 'Short video', 'Distribution engine; AI content thrives; huge Gen-Z reach', 'No long-form monetization; no PPV; creator fund economics weak; ban/regulatory risk in US', 'Use as top-of-funnel (trailers, clips). Not a destination for films.'],
      ['Reelmind / AI video communities', 'AI-native UGC', 'AI-native positioning; early communities', 'Tool-first, monetization shallow; tiny audiences; no curation/QC', 'Out-execute on curation, payouts, and viewer experience; acquire their frustrated creators.'],
      ['Runway / Pika / Luma / Kling', 'Creation tools', 'Own the creator relationship; strong brands in AI video; festivals (Runway AIFF)', 'They monetize creation (subscriptions/credits), not distribution; no consumer viewing destination; conflicted about ranking one user\'s film over another\'s', 'Natural partners, not competitors: "made with Runway → distributed on YouMakeTV." Co-marketing, festival pipelines, export integrations.'],
      ['OpenAI Sora ecosystem', 'Creation tool + feed', 'State-of-the-art generation; Sora app has a social feed; massive attention', 'Feed is social/remix-oriented, not film-length; no creator payouts at scale yet; OpenAI ambitions uncertain — could become a competitor', 'Move fast to own "AI films as premium content" before a tool vendor verticalizes. Biggest strategic risk AND biggest validation.'],
      ['Emerging AI film platforms (e.g., AI film festivals, niche curators)', 'Curation', 'Community credibility; early-mover taste-making', 'No tech moat, no payments/streaming infra, mostly events not platforms', 'Acquire or partner for curation brand + creator lists; YouMakeTV supplies the rails.'],
    ];
    let r = 4;
    for (const vals of comp) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).font = { bold: true };
      ['D','E','F'].forEach(c => { ws.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(`${c}${r}`).font = { size: 9 }; });
      ws.getCell(`C${r}`).font = { size: 9, color: { argb: C.grayTxt } };
      if (r % 2 === 0) ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 64;
      r++;
    }
    r += 1;
    sectionRow(ws, r, 'POSITIONING MATRIX (✔ = strong, ~ = partial, ✘ = none)', 'F'); r++;
    ws.getRow(r).values = [null, 'Capability', 'YouTube', 'Vimeo OTT', 'Tool vendors', 'YouMakeTV'];
    ws.getRow(r).font = { bold: true };
    ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
    r++;
    const matrix = [
      ['AI-native curated catalog', '✘', '✘', '~', '✔'],
      ['Per-title (PPV) monetization', '~ (rentals, limited)', '✔', '✘', '✔'],
      ['Subscription bundle for viewers', '~ (Premium, not AI)', '✘', '✘', '✔'],
      ['Creator revenue share that scales with success', '✘ (flat 55%)', '✔ (but no audience)', '✘', '✔ (30→40% tiers)'],
      ['Built-in audience / discovery', '✔', '✘', '~ (tool users)', 'Building — the core execution risk'],
      ['Human review / quality gate', '✘', '✘', '✘', '✔'],
    ];
    for (const vals of matrix) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).alignment = { wrapText: true };
      ws.getCell(`F${r}`).font = { bold: true, color: { argb: C.good } };
      if (r % 2 === 0) ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 26;
      r++;
    }
  }

  /* ============ GTM-CREATORS ============ */
  {
    const ws = wb.addWorksheet('GTM-Creators', { properties: { tabColor: { argb: 'FF8B5CF6' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 34;
    ['C','D','E','F','G','H','I'].forEach(c => ws.getColumn(c).width = 14);
    ws.getColumn('J').width = 50;
    titleRow(ws, 'B1', 'Creator Acquisition — Channel Plan (Year 1)');
    ws.getCell('B2').value = 'Yellow = editable. Signups & CAC are formulas.';
    ws.getCell('B2').font = { italic: true, size: 9, color: { argb: C.grayTxt } };
    ws.getRow(4).values = [null, 'Channel', 'Est. addressable reach', 'Engaged / mo', 'Click/visit rate', 'Visit→signup', 'Annual cost ($)', 'Expected signups', 'CAC ($)', 'Notes / tactics'];
    ws.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    ['B','C','D','E','F','G','H','I','J'].forEach(c => ws.getCell(`${c}4`).fill = fill(C.headerFill));
    ws.getRow(4).height = 28;
    // reach, engaged/mo, visitRate, signupRate, cost
    const ch = [
      ['Runway community & AIFF film festival', 350000, 18000, 0.05, 0.06, 18000, 'Festival sponsorship, Discord presence, "distribute your AIFF entry" campaign'],
      ['OpenAI Sora creators (feed + Discord/X)', 600000, 40000, 0.03, 0.05, 15000, 'X engagement, showcase reposts, "Sora-to-screen" onboarding guides'],
      ['Pika / Luma / Kling user communities', 450000, 25000, 0.04, 0.05, 12000, 'Discord partnerships, creator challenges with cash prizes'],
      ['Midjourney cinematic community', 800000, 30000, 0.02, 0.04, 8000, 'Targets storyboard/cinematic prompt artists moving into video'],
      ['ComfyUI / Stable Diffusion / Flux (open-source)', 500000, 35000, 0.04, 0.07, 10000, 'GitHub/Reddit presence; workflow-to-film tutorials; highest technical skill density'],
      ['Reddit (r/aivideo, r/StableDiffusion, r/Filmmakers…)', 2500000, 120000, 0.015, 0.04, 9000, 'Organic posts + modest promoted posts; AMA with founding creators'],
      ['Discord servers (AI art/video, 50+ servers)', 400000, 60000, 0.03, 0.06, 7000, 'Server partnerships, screening-night events, bot integrations'],
      ['X (AI film Twitter)', 1500000, 90000, 0.02, 0.04, 12000, 'Founder-led content, creator spotlights, revenue-share receipts ("first $1K paid out")'],
      ['Facebook groups & LinkedIn (AI video pros)', 600000, 25000, 0.015, 0.03, 5000, 'Groups for AI filmmakers; LinkedIn for studio/agency creators'],
      ['Indie filmmaker communities (film schools, NoFilmSchool…)', 900000, 30000, 0.01, 0.03, 8000, 'Hybrid filmmakers adopting AI tools; festival-circuit outreach'],
      ['AI creator influencers (10–15 sponsorships)', 3000000, 150000, 0.012, 0.05, 36000, '$1.5–3K per sponsored video/thread; mid-tier (50–300K followers) AI-tool educators'],
    ];
    let r = 5;
    const firstR = r;
    for (const [name, reach, eng, vr, sr, cost, notes] of ch) {
      ws.getCell(`B${r}`).value = name; ws.getCell(`B${r}`).font = { size: 9 };
      ws.getCell(`B${r}`).alignment = { wrapText: true, vertical: 'top' };
      const cells = { C: reach, D: eng, E: vr, F: sr, G: cost };
      for (const [col, v] of Object.entries(cells)) {
        const c = ws.getCell(`${col}${r}`); c.value = v; markInput(c);
        c.numFmt = (col === 'E' || col === 'F') ? fmt.pct1 : (col === 'G' ? fmt.usd0 : fmt.num0);
        c.font = { size: 9 };
      }
      const signups = Math.round(eng * 12 * vr * sr);
      ws.getCell(`H${r}`).value = { formula: `D${r}*12*E${r}*F${r}`, result: signups };
      ws.getCell(`H${r}`).numFmt = fmt.num0; ws.getCell(`H${r}`).font = { bold: true, size: 9 };
      ws.getCell(`I${r}`).value = { formula: `IF(H${r}>0,G${r}/H${r},"-")`, result: Math.round(cost / signups) };
      ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { size: 9 };
      ws.getCell(`J${r}`).value = notes; ws.getCell(`J${r}`).font = { size: 8, color: { argb: C.grayTxt } };
      ws.getCell(`J${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 30;
      r++;
    }
    const lastR = r - 1;
    ws.getCell(`B${r}`).value = 'TOTAL YEAR 1'; ws.getCell(`B${r}`).font = { bold: true };
    ws.getCell(`G${r}`).value = { formula: `SUM(G${firstR}:G${lastR})`, result: ch.reduce((s, c) => s + c[5], 0) };
    ws.getCell(`G${r}`).numFmt = fmt.usd0; ws.getCell(`G${r}`).font = { bold: true };
    const totSign = ch.reduce((s, c) => s + Math.round(c[2] * 12 * c[3] * c[4]), 0);
    ws.getCell(`H${r}`).value = { formula: `SUM(H${firstR}:H${lastR})`, result: totSign };
    ws.getCell(`H${r}`).numFmt = fmt.num0; ws.getCell(`H${r}`).font = { bold: true };
    ws.getCell(`I${r}`).value = { formula: `G${r}/H${r}`, result: Math.round(ch.reduce((s, c) => s + c[5], 0) / totSign) };
    ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { bold: true };
    ['B','C','D','E','F','G','H','I','J'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
    r += 2;
    sectionRow(ws, r, 'FUNNEL ASSUMPTIONS & ACTIVATION', 'J'); r++;
    const fa = [
      'Activation (signup → publishes ≥1 approved film): 45–65% — driven by white-glove onboarding for first 200 creators.',
      'These channel totals intentionally exceed the Model\'s Base-case 500 Year-1 signups (~2x buffer) — channels underperform, plans shouldn\'t.',
      'First 50 creators: founder-led direct recruitment (hand-picked from festival winners & viral AI shorts). CAC ≈ $0 cash, high founder time.',
      'Creator referral program from Month 6: $50 bonus per activated referral — expected to become the cheapest channel by Year 2.',
      'Influencer ROI check: $36K → ~1,080 signups → ~$33 CAC; vs. blended target $40. Kill any channel >$80 CAC after 2 quarters.',
    ];
    for (const t of fa) {
      ws.mergeCells(`B${r}:J${r}`);
      ws.getCell(`B${r}`).value = '• ' + t;
      ws.getCell(`B${r}`).alignment = { wrapText: true };
      ws.getRow(r).height = 26;
      r++;
    }
  }

  /* ============ GTM-VIEWERS ============ */
  {
    const ws = wb.addWorksheet('GTM-Viewers', { properties: { tabColor: { argb: 'FF06B6D4' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 26;
    ['C','D','E','F','G','H','I'].forEach(c => ws.getColumn(c).width = 13);
    ws.getColumn('J').width = 52;
    titleRow(ws, 'B1', 'Viewer Acquisition — Channel Plan (Year 1 → Year 2)');
    ws.getRow(4).values = [null, 'Channel', 'Y1 budget ($)', 'CPM ($)', 'CTR', 'Visit→signup', 'Signup→paid', 'Paying users', 'CAC ($)', 'Notes'];
    ws.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    ['B','C','D','E','F','G','H','I','J'].forEach(c => ws.getCell(`${c}4`).fill = fill(C.headerFill));
    // name, budget, cpm, ctr, signupRate, paidRate, notes  (organic channels: cpm 0 → use impressions col? keep cpm>0 paid only; organic rows computed differently — keep simple: paid rows formula, organic rows direct estimates)
    const paid = [
      ['Paid search (Google)', 60000, 0, 0, 0, 0, 'High-intent: "watch AI films", "AI movies". Modeled directly: ~$2.5 CPC, 12% signup, 18% paid → ~1,000 payers, CAC ≈ $58. Small market today, grows with category.', 1000, 58],
      ['Meta / Instagram Reels ads', 90000, 9, 0.012, 0.10, 0.10, 'Trailer-led creative; retarget video viewers', null, null],
      ['TikTok ads', 60000, 6, 0.015, 0.08, 0.08, 'Clips + creator duets; younger demo, lower intent', null, null],
      ['YouTube ads (trailer pre-roll)', 80000, 12, 0.010, 0.12, 0.12, 'In-feed trailer promotion to film/AI-interest audiences', null, null],
      ['Display / programmatic', 20000, 4, 0.002, 0.05, 0.05, 'Cheap reach, weak intent — capped test budget', null, null],
      ['Retargeting (all platforms)', 30000, 7, 0.025, 0.18, 0.22, 'Highest-converting paid channel; needs pixel base first', null, null],
    ];
    const organic = [
      ['SEO & content hub', 25000, '"Best AI films 2026", creator pages, film pages. 6–12 mo lag; compounding. Est. 120K organic visits Y1 → ~1,400 payers.', 1400, 18],
      ['Owned YouTube + Shorts', 30000, 'Trailer channel + weekly "best of AI film" shows; 2 editors part-time. Est. 2M views Y1 → ~1,600 payers.', 1600, 19],
      ['Owned TikTok / Reels', 20000, 'Clip factory from catalog (with creator consent); viral upside not modeled.', 900, 22],
      ['Influencers (film/AI reviewers)', 45000, '8–12 sponsorships; "I watched 20 AI films" format. CPM-equivalent ~$15, but conversion 2–3x paid ads.', 1500, 30],
      ['Affiliates (creators as affiliates)', 15000, '20% of first-year revenue to referring creator — creators bring their own audience; the structural answer to cold start.', 2500, 6],
      ['PR & festivals', 30000, 'Launch story ("the Netflix of AI film"), festival partnerships, awards show. Drives brand search baseline.', 700, 43],
    ];
    let r = 5;
    const firstR = r;
    for (const row of paid) {
      const [name, budget, cpm, ctr, su, pd, notes, fixedPayers, fixedCac] = row;
      ws.getCell(`B${r}`).value = name; ws.getCell(`B${r}`).font = { size: 9, bold: true };
      const set = (col, v, nf) => { const c = ws.getCell(`${col}${r}`); c.value = v; c.numFmt = nf; c.font = { size: 9 }; markInput(c); };
      set('C', budget, fmt.usd0);
      if (fixedPayers != null) {
        ws.getCell(`H${r}`).value = fixedPayers; ws.getCell(`H${r}`).numFmt = fmt.num0; markInput(ws.getCell(`H${r}`)); ws.getCell(`H${r}`).font = { size: 9 };
        ws.getCell(`I${r}`).value = { formula: `C${r}/H${r}`, result: fixedCac }; ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { size: 9, bold: true };
      } else {
        set('D', cpm, fmt.usd2); set('E', ctr, fmt.pct1); set('F', su, fmt.pct0); set('G', pd, fmt.pct0);
        const payers = Math.round(budget / cpm * 1000 * ctr * su * pd);
        ws.getCell(`H${r}`).value = { formula: `C${r}/D${r}*1000*E${r}*F${r}*G${r}`, result: payers };
        ws.getCell(`H${r}`).numFmt = fmt.num0; ws.getCell(`H${r}`).font = { size: 9, bold: true };
        ws.getCell(`I${r}`).value = { formula: `IF(H${r}>0,C${r}/H${r},"-")`, result: Math.round(budget / payers) };
        ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { size: 9, bold: true };
      }
      ws.getCell(`J${r}`).value = notes; ws.getCell(`J${r}`).font = { size: 8, color: { argb: C.grayTxt } };
      ws.getCell(`J${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 30;
      r++;
    }
    for (const [name, budget, notes, payers, cac] of organic) {
      ws.getCell(`B${r}`).value = name; ws.getCell(`B${r}`).font = { size: 9, bold: true };
      const c = ws.getCell(`C${r}`); c.value = budget; c.numFmt = fmt.usd0; c.font = { size: 9 }; markInput(c);
      const h = ws.getCell(`H${r}`); h.value = payers; h.numFmt = fmt.num0; h.font = { size: 9, bold: true }; markInput(h);
      ws.getCell(`I${r}`).value = { formula: `C${r}/H${r}`, result: cac };
      ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { size: 9, bold: true };
      ws.getCell(`J${r}`).value = notes; ws.getCell(`J${r}`).font = { size: 8, color: { argb: C.grayTxt } };
      ws.getCell(`J${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 30;
      r++;
    }
    const lastR = r - 1;
    ws.getCell(`B${r}`).value = 'TOTAL'; ws.getCell(`B${r}`).font = { bold: true };
    ws.getCell(`C${r}`).value = { formula: `SUM(C${firstR}:C${lastR})`, result: 505000 };
    ws.getCell(`C${r}`).numFmt = fmt.usd0; ws.getCell(`C${r}`).font = { bold: true };
    ws.getCell(`H${r}`).value = { formula: `SUM(H${firstR}:H${lastR})`, result: 13000 };
    ws.getCell(`H${r}`).numFmt = fmt.num0; ws.getCell(`H${r}`).font = { bold: true };
    ws.getCell(`I${r}`).value = { formula: `C${r}/H${r}`, result: 39 };
    ws.getCell(`I${r}`).numFmt = fmt.usd0; ws.getCell(`I${r}`).font = { bold: true };
    ['B','C','D','E','F','G','H','I','J'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
    r += 2;
    sectionRow(ws, r, 'NOTES', 'J'); r++;
    const notes2 = [
      'This plan front-loads the full Year-1 + part of Year-2 marketing budget vs. the Model (Model Year 1 marketing ≈ $164K Base). Spend gates open only after activation metrics (D7 retention >25%, trailer→watch >15%) are hit — do not buy traffic into a leaky funnel.',
      '"Paying users" mixes subscribers and PPV buyers; blended target CAC ≤ $40, subscriber-only CAC ≤ $25 by Year 2.',
      'Retargeting and affiliates are the two channels expected to beat $20 CAC at scale; both require an existing traffic/creator base — hence paid social leads in H1.',
      'CPM/CTR/conversion cells are editable; benchmarks from 2025 Meta/TikTok/YouTube performance norms for entertainment apps.',
    ];
    for (const t of notes2) {
      ws.mergeCells(`B${r}:J${r}`);
      ws.getCell(`B${r}`).value = '• ' + t;
      ws.getCell(`B${r}`).alignment = { wrapText: true };
      ws.getRow(r).height = 30;
      r++;
    }
  }

  /* ============ BOOTSTRAPPING ============ */
  {
    const ws = wb.addWorksheet('Bootstrapping', { properties: { tabColor: { argb: 'FFF97316' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 24;
    ['C','D','E'].forEach(c => ws.getColumn(c).width = 50);
    titleRow(ws, 'B1', 'Marketplace Cold-Start Plan — Solving "Creators need viewers, viewers need content"');
    ws.getRow(3).values = [null, '', 'PHASE 1 — Seed supply (Months 0–6)', 'PHASE 2 — Prove demand (Months 6–18)', 'PHASE 3 — Network effects (Months 18–36)'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    ws.getRow(3).height = 30;
    const rows = [
      ['Core principle', 'Supply first. A film catalog is inventory that doesn\'t churn — viewers do. Curate 150–300 genuinely good films before spending $1 on viewer ads.', 'Concentrate demand. Drive all traffic to a small, high-quality catalog so every film gets views and every creator gets paid something.', 'Let creators bring viewers and viewers attract creators. Referral loops, payout screenshots, and franchise/series content compound.'],
      ['Creator targets', '50 hand-picked founding creators (festival winners, viral AI shorts); 150–300 films live; guaranteed placement + 0% take on first $500 each ("Founding Creator" deal).', '300–500 active creators; 1,000–1,800 films; first creators crossing Growth tier (1,000 paid views) — publicize every milestone.', '1,500–3,000 active creators; 5,000–12,000 films; top creators earning $2–5K/mo; Pro-tier creators become platform evangelists.'],
      ['Viewer targets', '3–5K registered (waitlist + creators\' own audiences). Goal is engagement data, not scale: D7 retention >25%, >15% trailer→film conversion.', '30–120K registered; 1.5–8K subscribers; prove CAC ≤ $35 and M3 subscriber retention >55% before scaling spend.', '300K–1M registered; 30K+ subscribers; organic/referral share of signups >40%.'],
      ['Liquidity mechanics', 'Every approved film guaranteed ≥500 impressions in-app; weekly themed premieres create appointment viewing despite a small catalog.', 'Editorial front page (human-curated rows); "new this week" velocity; affiliate links so creators earn 20% of referred first-year revenue.', 'Personalized discovery; genre verticals (AI horror, sci-fi shorts, animation); seasons/series retain viewers between releases.'],
      ['Chicken-and-egg answer', 'Creators don\'t need viewers yet — they need DISTRIBUTION + LEGITIMACY. A curated platform that says "your film is good" plus guaranteed placement is enough to seed supply at near-zero cost.', 'Viewers don\'t need a huge catalog — they need 20 great hours in their genre. 300 curated films ≈ a niche streamer\'s launch catalog (Shudder launched with <200 titles).', 'At ~1,000 films / 30K subscribers the flywheel turns: payouts attract creators organically (CAC→$0), catalog breadth lifts retention, retention lifts LTV, LTV funds growth.'],
      ['Kill / pivot signals', 'If <40% of invited creators publish, the value prop is wrong — fix payouts/onboarding before scaling.', 'If subscriber M3 retention <40% despite curation, the standalone-destination thesis fails → pivot to B2B licensing / white-label.', 'If CAC won\'t drop below $30 blended, raise prices or shift to AVOD-first model.'],
    ];
    let r = 4;
    for (const vals of rows) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).font = { bold: true };
      ['C','D','E'].forEach(c => { ws.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(`${c}${r}`).font = { size: 9 }; });
      if (r % 2 === 0) ['B','C','D','E'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 88;
      r++;
    }
    r += 1;
    sectionRow(ws, r, 'MINIMUM VIABLE LIQUIDITY — what it takes before network effects start', 'E'); r++;
    const mvl = [
      ['Films', '≈ 1,000 quality titles', 'Comparable niche streamers (Shudder, Dropout) demonstrate retention with 200–600 titles; 1,000 gives genre depth.'],
      ['Active creators', '≈ 400–600', 'At 3.5 films/creator/yr this sustains ~30 new releases/week — enough "newness" for weekly visits.'],
      ['Subscribers', '≈ 25–30K', 'At $7.99/mo this is ~$2.4–2.9M ARR — funds meaningful creator pool payouts ($1M+/yr), which makes the platform self-evidently worth creators\' time.'],
      ['Timeline', 'Months 24–30 (Base case)', 'Matches Model: Year-3 exit ≈ 30K subscribers, ~2,500 active creators, ~13K films.'],
    ];
    ws.getRow(r).values = [null, 'Dimension', 'Threshold', 'Rationale'];
    ws.getRow(r).font = { bold: true };
    ['B','C','D'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill)); r++;
    for (const vals of mvl) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`C${r}`).font = { bold: true, color: { argb: C.purple } };
      ws.getCell(`D${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getRow(r).height = 34;
      r++;
    }
  }

  /* ============ UNIT ECONOMICS ============ */
  {
    const ws = wb.addWorksheet('UnitEcon', { properties: { tabColor: { argb: 'FF14B8A6' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 40;
    ['C','D','E'].forEach(c => ws.getColumn(c).width = 16);
    ws.getColumn('F').width = 56;
    titleRow(ws, 'B1', 'Unit Economics — CAC / LTV / Payback');
    ws.getRow(3).values = [null, '', 'Worst', 'Base', 'Best', 'Method'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    let r = 4;
    const block = (title, rows) => {
      sectionRow(ws, r, title, 'F'); r++;
      const start = r;
      for (const [label, w, b, bst, nf, formulaFn, note] of rows) {
        ws.getCell(`B${r}`).value = label;
        ['C','D','E'].forEach((col, i) => {
          const c = ws.getCell(`${col}${r}`);
          const v = [w, b, bst][i];
          if (formulaFn) c.value = { formula: formulaFn(col, start), result: v };
          else { c.value = v; markInput(c); }
          c.numFmt = nf;
          if (formulaFn) c.font = { bold: true };
        });
        if (note) { ws.getCell(`F${r}`).value = note; ws.getCell(`F${r}`).font = { size: 8, color: { argb: C.grayTxt } }; ws.getCell(`F${r}`).alignment = { wrapText: true, vertical: 'top' }; }
        ws.getRow(r).height = 24;
        r++;
      }
      r++;
    };
    // SUBSCRIBERS: rows offsets: ARPU=start, GM=start+1, churn=start+2, CAC=start+3, LTV=start+4, ratio, payback
    block('SUBSCRIBERS (YouMake+)', [
      ['Net ARPU ($/mo, after creator pool share)', 6.99*0.5, 7.99*0.55, 8.99*0.60, fmt.usd2, null, 'Subscription price × platform share of sub revenue (50–60%)'],
      ['Contribution margin on net ARPU', 0.70, 0.78, 0.82, fmt.pct0, null, 'After processing, streaming, storage, support allocations'],
      ['Monthly churn', 0.09, 0.065, 0.045, fmt.pct1, null, 'Niche SVOD benchmark 5–10%/mo; improves with catalog depth'],
      ['CAC (blended)', 35, 25, 16, fmt.usd0, null, 'From GTM-Viewers; best case = high organic/referral mix'],
      ['LTV', 6.99*0.5*0.70/0.09, 7.99*0.55*0.78/0.065, 8.99*0.60*0.82/0.045, fmt.usd0,
        (col, s) => `${col}${s}*${col}${s+1}/${col}${s+2}`, 'LTV = net ARPU × margin ÷ churn'],
      ['LTV : CAC', (6.99*0.5*0.70/0.09)/35, (7.99*0.55*0.78/0.065)/25, (8.99*0.60*0.82/0.045)/16, fmt.mult,
        (col, s) => `${col}${s+4}/${col}${s+3}`, 'Target ≥ 3.0x at scale'],
      ['Payback (months)', 35/(6.99*0.5*0.70), 25/(7.99*0.55*0.78), 16/(8.99*0.60*0.82), fmt.num1,
        (col, s) => `${col}${s+3}/(${col}${s}*${col}${s+1})`, 'CAC ÷ monthly contribution'],
    ]);
    block('PAY-PER-VIEW BUYERS', [
      ['Net revenue per transaction', 3.99*0.60*0.85, 4.99*0.64*0.88, 5.99*0.67*0.90, fmt.usd2, null, 'Price × platform share (60–67%) × contribution margin'],
      ['Lifetime transactions per buyer', 3, 6, 10, fmt.num0, null, 'Repeat purchase behavior over ~24 months'],
      ['CAC (must be near-organic)', 8, 4, 2, fmt.usd0, null, 'PPV cannot support paid CAC — acquired via SEO, creator affiliates, cross-sell'],
      ['LTV', 3.99*0.60*0.85*3, 4.99*0.64*0.88*6, 5.99*0.67*0.90*10, fmt.usd0,
        (col, s) => `${col}${s}*${col}${s+1}`, ''],
      ['LTV : CAC', (3.99*0.60*0.85*3)/8, (4.99*0.64*0.88*6)/4, (5.99*0.67*0.90*10)/2, fmt.mult,
        (col, s) => `${col}${s+3}/${col}${s+2}`, 'PPV works only as an organic monetization layer + sub-conversion funnel'],
    ]);
    block('CREATORS (as supply-side "customers")', [
      ['CAC per activated creator', 130, 73, 46, fmt.usd0, null, 'Signup CAC ÷ activation rate (60/0.45, 40/0.55, 30/0.65)'],
      ['Films per creator over 24 months', 4, 7, 9, fmt.num0, null, ''],
      ['Platform net revenue per creator per year', 100, 250, 600, fmt.usd0, null, 'Base ≈ Model Year-3 net revenue per active creator (~$640 by Y3, lower in Y1–2; $250 is a 24-mo blend)'],
      ['24-month creator LTV (net revenue)', 200, 500, 1200, fmt.usd0,
        (col, s) => `${col}${s+2}*2`, ''],
      ['LTV : CAC', 200/130, 500/73, 1200/46, fmt.mult,
        (col, s) => `${col}${s+3}/${col}${s}`, 'Healthy even in worst case — supply acquisition is cheap relative to its revenue yield'],
    ]);
    sectionRow(ws, r, 'READ-THROUGH', 'F'); r++;
    const reads = [
      'Subscriber economics clear the 3x LTV:CAC bar in Base case (≈3.2x) with ~7-month payback — fundable, not exceptional. The lever is churn: every point of monthly churn ≈ ±$11 LTV.',
      'PPV is margin-rich but cannot absorb paid acquisition. Treat PPV as (1) monetization of organic traffic and (2) a stepping stone to subscription.',
      'Creator-side LTV:CAC of ~7x in Base case is the quiet strength of the model: supply compounds (films stay in catalog) while demand churns.',
      'Worst-case subscriber economics (1.1x LTV:CAC) are NOT viable — the model depends on pushing churn below ~7%/mo within 18 months. This is the #1 metric to underwrite.',
    ];
    for (const t of reads) {
      ws.mergeCells(`B${r}:F${r}`);
      ws.getCell(`B${r}`).value = '• ' + t;
      ws.getCell(`B${r}`).alignment = { wrapText: true };
      ws.getRow(r).height = 30;
      r++;
    }
  }

  /* ============ HIRING ============ */
  {
    const ws = wb.addWorksheet('Hiring', { properties: { tabColor: { argb: 'FF0EA5E9' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 34; ws.getColumn('C').width = 18;
    ['D','E','F','G'].forEach(c => ws.getColumn(c).width = 13);
    ws.getColumn('H').width = 46;
    titleRow(ws, 'B1', 'Hiring Plan — Years 1–3 (Base case)');
    ws.getRow(3).values = [null, 'Role', 'Salary (fully loaded)', 'Start', 'Y1 FTE', 'Y2 FTE', 'Y3 FTE', 'Notes'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F','G','H'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    const roles = [
      ['CEO (founder)', 120000, 'Day 1', 1, 1, 1, 'Below-market founder salary until Series A'],
      ['CTO (founder or founding eng.)', 140000, 'Day 1', 1, 1, 1, 'Owns platform, infra, AI moderation pipeline'],
      ['Full-stack engineers', 160000, 'M1 / M9', 1.5, 3, 5, 'Player, payments, dashboards, recommendation v1'],
      ['ML / moderation engineer', 175000, 'M12', 0, 1, 2, 'Provenance detection, content QA automation, recsys'],
      ['Product designer', 140000, 'M6', 0.5, 1, 1.5, 'Contract→FTE; viewer UX is the retention lever'],
      ['Head of Content / Curation', 130000, 'M3', 0.8, 1, 1, 'Ex-festival programmer; owns quality bar & editorial'],
      ['Creator Success managers', 95000, 'M4 / M14', 0.7, 2, 4, '1 per ~150 active creators; onboarding, payouts, retention'],
      ['Growth / performance marketer', 135000, 'M8', 0.4, 1, 2, 'Owns paid + lifecycle; agency support in Y1'],
      ['Content & social lead', 90000, 'M10', 0.2, 1, 2, 'Trailer channel, clips, newsletter'],
      ['Customer support', 65000, 'M12', 0.1, 1, 2.5, 'Outsourced/part-time in Y1; in-house from Y2'],
      ['Finance / ops (fractional → FTE)', 110000, 'M6 / M24', 0.3, 0.5, 1, 'Fractional CFO until Series A; payouts compliance'],
      ['Trust & safety / moderation ops', 80000, 'M9', 0.5, 1.5, 3, 'Human review layer on top of AI screening'],
    ];
    let r = 4;
    const firstR = r;
    for (const [role, sal, start, y1, y2, y3, notes] of roles) {
      ws.getRow(r).values = [null, role, sal, start, y1, y2, y3, notes];
      ws.getCell(`C${r}`).numFmt = fmt.usd0; markInput(ws.getCell(`C${r}`));
      ['E','F','G'].forEach(c => { ws.getCell(`${c}${r}`).numFmt = '0.0'; markInput(ws.getCell(`${c}${r}`)); });
      ws.getCell(`H${r}`).font = { size: 8, color: { argb: C.grayTxt } };
      ws.getCell(`H${r}`).alignment = { wrapText: true, vertical: 'top' };
      if (r % 2 === 0) ['B','C','D','E','F','G','H'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 26;
      r++;
    }
    const lastR = r - 1;
    const totals = [0, 1, 2].map(i => roles.reduce((s, ro) => s + ro[3 + i], 0));
    const payTotals = [0, 1, 2].map(i => roles.reduce((s, ro) => s + ro[3 + i] * ro[1], 0));
    ws.getCell(`B${r}`).value = 'TOTAL HEADCOUNT'; ws.getCell(`B${r}`).font = { bold: true };
    ['E','F','G'].forEach((c, i) => {
      ws.getCell(`${c}${r}`).value = { formula: `SUM(${c}${firstR}:${c}${lastR})`, result: totals[i] };
      ws.getCell(`${c}${r}`).font = { bold: true }; ws.getCell(`${c}${r}`).numFmt = '0.0';
    });
    ['B','C','D','E','F','G','H'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
    r++;
    ws.getCell(`B${r}`).value = 'TOTAL PAYROLL'; ws.getCell(`B${r}`).font = { bold: true };
    ['E','F','G'].forEach((c, i) => {
      ws.getCell(`${c}${r}`).value = { formula: `SUMPRODUCT($C$${firstR}:$C$${lastR},${c}${firstR}:${c}${lastR})`, result: payTotals[i] };
      ws.getCell(`${c}${r}`).font = { bold: true }; ws.getCell(`${c}${r}`).numFmt = fmt.usd0;
    });
    ['B','C','D','E','F','G','H'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
    r += 2;
    ws.mergeCells(`B${r}:H${r}`);
    ws.getCell(`B${r}`).value = 'Note: FTE figures are year-averages (0.5 = hired mid-year). Salaries are fully loaded (base + taxes + benefits + equipment), US-remote blend; 30–40% savings available via EU/LatAm engineering hires. Reconciles to Model payroll within ±10% (Model uses a single blended average).';
    ws.getCell(`B${r}`).alignment = { wrapText: true };
    ws.getCell(`B${r}`).font = { size: 9, italic: true, color: { argb: C.grayTxt } };
    ws.getRow(r).height = 44;
  }

  /* ============ USE OF FUNDS ============ */
  {
    const ws = wb.addWorksheet('UseOfFunds', { properties: { tabColor: { argb: 'FF84CC16' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 30;
    ['C','D'].forEach(c => ws.getColumn(c).width = 16);
    ws.getColumn('E').width = 64;
    titleRow(ws, 'B1', 'Use of Funds — Recommended $4.0M Seed (24-month plan)');
    ws.getCell('B3').value = 'Round size ($):'; ws.getCell('B3').font = { bold: true };
    const rs = ws.getCell('C3'); rs.value = 4000000; rs.numFmt = fmt.usd0; markInput(rs);
    ws.getRow(5).values = [null, 'Category', '% allocation', 'Amount ($)', 'What it buys'];
    ws.getRow(5).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E'].forEach(c => ws.getCell(`${c}5`).fill = fill(C.headerFill));
    const alloc = [
      ['Engineering & Product', 0.38, 'Core team of 4–5 engineers + design: recommendation engine, payout infrastructure, apps (web → TV → mobile), creator analytics dashboard'],
      ['Growth & Marketing', 0.24, 'Creator + viewer acquisition per GTM sheets; performance budget gated on retention milestones'],
      ['Content & Creator Success', 0.14, 'Founding-creator incentives, curation team, festival/community programs, creator success managers'],
      ['Trust, Safety & Moderation', 0.08, 'Human review ops, AI screening tooling, provenance verification, copyright claim handling'],
      ['Infrastructure', 0.06, 'Streaming/CDN, storage, transcoding capacity ahead of growth'],
      ['Legal & Compliance', 0.05, 'Content licensing framework, AI-content policy counsel, payout/KYC compliance, entity & IP'],
      ['Operations & Buffer', 0.05, 'Finance ops, insurance, contingency'],
    ];
    let r = 6;
    const firstR = r;
    for (const [cat, pct, what] of alloc) {
      ws.getCell(`B${r}`).value = cat; ws.getCell(`B${r}`).font = { bold: true };
      const p = ws.getCell(`C${r}`); p.value = pct; p.numFmt = fmt.pct0; markInput(p);
      ws.getCell(`D${r}`).value = { formula: `C${r}*$C$3`, result: pct * 4000000 };
      ws.getCell(`D${r}`).numFmt = fmt.usd0;
      ws.getCell(`E${r}`).value = what;
      ws.getCell(`E${r}`).alignment = { wrapText: true, vertical: 'top' };
      ws.getCell(`E${r}`).font = { size: 9 };
      if (r % 2 === 0) ['B','C','D','E'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 38;
      r++;
    }
    ws.getCell(`B${r}`).value = 'TOTAL'; ws.getCell(`B${r}`).font = { bold: true };
    ws.getCell(`C${r}`).value = { formula: `SUM(C${firstR}:C${r - 1})`, result: 1 };
    ws.getCell(`C${r}`).numFmt = fmt.pct0; ws.getCell(`C${r}`).font = { bold: true };
    ws.getCell(`D${r}`).value = { formula: `SUM(D${firstR}:D${r - 1})`, result: 4000000 };
    ws.getCell(`D${r}`).numFmt = fmt.usd0; ws.getCell(`D${r}`).font = { bold: true };
    ['B','C','D','E'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.subHeaderFill));
  }

  /* ============ VALUATION ============ */
  {
    const ws = wb.addWorksheet('Valuation', { properties: { tabColor: { argb: 'FFA855F7' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 30;
    ['C','D','E'].forEach(c => ws.getColumn(c).width = 20);
    ws.getColumn('F').width = 60;
    titleRow(ws, 'B1', 'Valuation Framework');
    ws.getRow(3).values = [null, 'Round', 'Timing / milestone', 'Valuation (post-money)', 'Dilution', 'Basis & comparables'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    const rounds = [
      ['Pre-seed / angel (if taken)', 'Now: MVP live, pre-traction', '$5–8M cap (SAFE)', '10–15%', '2025–26 US pre-seed medians ~$5–7M cap (Carta); AI-adjacent consumer premium ~20–30%; no traction discount offsets it. Comparable: typical pre-revenue marketplace SAFEs.'],
      ['SEED (recommended now)', 'MVP + first 50–100 founding creators signed', '$14–18M post ($4M on $10–14M pre)', '~22–28%', 'Carta 2025 seed medians: ~$15M post for consumer/marketplace; AI-content platforms command upper band. Comps at seed stage: Patreon ($2.1M seed, 2013-era pricing — adjust 3–4x), Nebula (bootstrapped to ~$50M val), early Vimeo OTT.'],
      ['Series A', 'Month 20–28: $1.5–2.5M ARR, 4–5x YoY growth, churn <7%/mo, 1,000+ films', '$45–70M post ($9–12M raise)', '~18–22%', '8–15x forward net-revenue multiple for marketplace + AI premium. Comps: consumer subscription As at $2M ARR ≈ $40–60M (2024–25 vintage); Curiosity Stream IPO\'d at ~5x revenue (mature, low growth — YouMakeTV at A should price on growth).'],
      ['Series B (illustrative)', 'Year 4: $8–12M net revenue run-rate', '$120–200M', '~15–20%', 'Dependent on take-rate durability and EBITDA trajectory; only if Series A milestones beat plan.'],
    ];
    let r = 4;
    for (const vals of rounds) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).font = { bold: true };
      ws.getCell(`D${r}`).font = { bold: true, color: { argb: C.purple } };
      ['C','D','E','F'].forEach(c => { ws.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: 'top' }; });
      ws.getCell(`F${r}`).font = { size: 9, color: { argb: C.grayTxt } };
      if (r % 2 === 0) ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 62;
      r++;
    }
    r += 1;
    sectionRow(ws, r, 'ASSUMPTIONS & HONEST CAVEATS', 'F'); r++;
    const cav = [
      'These valuations assume the milestone column is MET. Pre-traction, the company is worth what seed investors will pay for team + thesis + working product: $10–14M pre is the defensible range in mid-2026, not higher.',
      'AI-content platforms currently enjoy a sentiment premium; it may compress. The model\'s Base case supports a Series A on metrics (not hype) by Month ~24–28.',
      'Anchor on NET revenue multiples. Quoting gross billings multiples will damage credibility with marketplace-literate investors.',
      'Founder dilution through Series A ≈ 40–45% cumulative (incl. ~10% ESOP refresh). Plan accordingly.',
    ];
    for (const t of cav) {
      ws.mergeCells(`B${r}:F${r}`);
      ws.getCell(`B${r}`).value = '• ' + t;
      ws.getCell(`B${r}`).alignment = { wrapText: true };
      ws.getRow(r).height = 32;
      r++;
    }
  }

  /* ============ RISKS ============ */
  {
    const ws = wb.addWorksheet('Risks', { properties: { tabColor: { argb: 'FFDC2626' } } });
    ws.getColumn('A').width = 2; ws.getColumn('B').width = 24; ws.getColumn('C').width = 12; ws.getColumn('D').width = 12;
    ws.getColumn('E').width = 56; ws.getColumn('F').width = 56;
    titleRow(ws, 'B1', 'Risk Register');
    ws.getRow(3).values = [null, 'Risk', 'Likelihood', 'Impact', 'Description', 'Mitigation'];
    ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}3`).fill = fill(C.headerFill));
    const risks = [
      ['Copyright & IP', 'High', 'High', 'AI films may embed copyrighted characters, music, or likenesses; training-data litigation (e.g., studios vs. AI vendors) could create downstream liability for distributors.', 'Pre-publication review (already built); automated music/character fingerprinting; creator warranties + indemnification in ToS; DMCA-compliant takedown; E&O insurance; "provenance required" metadata. Budgeted legal line grows 2.8x by Y5.'],
      ['AI regulation', 'Medium-High', 'Medium', 'EU AI Act transparency rules (in force, content-labeling obligations phasing through 2026–27), US state laws (deepfake/likeness), mandatory AI-content labeling.', 'Labeling AI content is YouMakeTV\'s default — regulation that burdens general platforms is a tailwind for a compliance-native one. Counsel on retainer; geo-gating capability.'],
      ['Moderation failures', 'Medium', 'High', 'Deepfakes of real people, CSAM-adjacent generated content, extremist content — a single scandal could kill distribution partnerships and app-store presence.', 'Human review of 100% of titles pre-publication (feasible to ~30K films/yr); AI screening layer; likeness-verification for real-person depictions; strict creator identity (KYC at payout).'],
      ['Fraud', 'Medium', 'Medium', 'View-count fraud to game revenue tiers; stolen-card PPV purchases; self-dealing (creators buying own content); chargebacks.', 'Paid-view definition requires watch-time + payment settlement; payout holds (30 days); device/IP anomaly detection; KYC; chargeback reserves in payout terms.'],
      ['Content quality / lemon market', 'High', 'Medium', 'AI tools produce vastly more mediocre content than good; a flooded catalog destroys viewer trust (the "Spotify AI slop" problem).', 'Curation IS the product: approval gate, editorial front page, quality-weighted discovery, tiered placement. Reject rate expected 60–80% early. This is the core defensibility thesis.'],
      ['Competition (tool vendors verticalize)', 'Medium-High', 'High', 'OpenAI (Sora feed), Runway, or YouTube could launch an AI-film destination with vastly more resources and built-in supply.', 'Speed to liquidity + multi-tool neutrality (creators don\'t want their distribution owned by one tool vendor); curation brand; creator payout relationships. Partner aggressively with 2nd-tier tools who need a distribution story.'],
      ['Funding risk', 'Medium', 'High', 'Consumer/marketplace seed appetite is selective; Series A requires real retention metrics in ~24 months; AI premium may fade.', 'Raise 24 months of runway (not 18); gate spend on retention milestones; maintain B2B licensing pivot option (white-label AI content library) as a revenue backstop.'],
      ['Demand risk (do viewers want AI films?)', 'Medium-High', 'Very High', 'The unproven core assumption: will consumers pay to watch AI-generated films at scale? Current evidence is anecdotal (viral shorts), not transactional.', 'This is what the seed round exists to answer. Phase-gated spending: no scale marketing until D7 retention >25% and M3 sub retention >55% are proven on a small base. Honest kill criteria defined in Bootstrapping sheet.'],
    ];
    let r = 4;
    for (const vals of risks) {
      ws.getRow(r).values = [null, ...vals];
      ws.getCell(`B${r}`).font = { bold: true };
      ws.getCell(`C${r}`).font = { color: { argb: C.bad }, bold: true, size: 9 };
      ws.getCell(`D${r}`).font = { color: { argb: C.bad }, bold: true, size: 9 };
      ['E','F'].forEach(c => { ws.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(`${c}${r}`).font = { size: 9 }; });
      if (r % 2 === 0) ['B','C','D','E','F'].forEach(c => ws.getCell(`${c}${r}`).fill = fill(C.bandFill));
      ws.getRow(r).height = 72;
      r++;
    }
  }

  await wb.xlsx.writeFile(OUT);
  console.log('Wrote', OUT);

  /* print scenario summaries for use in deck/PDF */
  const names = ['CONSERVATIVE', 'BASE', 'AGGRESSIVE'];
  const f = (v) => (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : (v / 1e3).toFixed(0) + 'K');
  R.forEach((r, i) => {
    console.log(`\n=== ${names[i]} ===`);
    console.log('GrossBillings:', r.gross.map(f).join('  '));
    console.log('NetRevenue:   ', r.netRev.map(f).join('  '));
    console.log('EBITDA:       ', r.ebitda.map(f).join('  '));
    console.log('GM%:          ', r.gmPct.map(v => (v * 100).toFixed(0) + '%').join('  '));
    console.log('SubsEnd:      ', r.subsEnd.map(v => Math.round(v).toLocaleString()).join('  '));
    console.log('ActiveCreators:', r.activeCreators.map(v => Math.round(v)).join('  '));
    console.log('Catalog:      ', r.catalog.map(v => Math.round(v)).join('  '));
    console.log('ExitARR:      ', r.exitARR.map(f).join('  '));
    console.log('CashEnd:      ', r.cashEnd.map(f).join('  '));
    console.log('Payouts:      ', r.payouts.map(f).join('  '));
    console.log('Mktg:         ', r.mktg.map(f).join('  '));
  });
}
main().catch(e => { console.error(e); process.exit(1); });
