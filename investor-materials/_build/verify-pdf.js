const fs = require('fs');
const pdf = require('pdf-parse');
pdf(fs.readFileSync('../YouMakeTV_Executive_Summary.pdf')).then(d => {
  console.log('numpages:', d.numpages);
  const probes = ['~ 40–45%', '<=', '>=', '→ 35%', 'Phase 3', '$14.4M', 'Risks & Mitigations', 'Valuation Analysis', 'Confidential · 14'];
  for (const probe of probes) console.log(JSON.stringify(probe), d.text.includes(probe));
  console.log('artifact "H present:', d.text.includes('"H'));
});
