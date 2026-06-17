# Build scripts for investor materials

These Node.js scripts generate the three deliverables in the parent folder:

| Script | Output |
|---|---|
| `build-xlsx.js` | `YouMakeTV_BusinessPlan.xlsx` — formula-driven 5-year model, 13 sheets, 3 scenarios |
| `build-deck.js` | `YouMakeTV_Investor_Deck.pptx` — 16-slide investor deck |
| `build-pdf.js` | `YouMakeTV_Executive_Summary.pdf` — 14-page executive summary & business plan |

## Rebuilding

```
npm install exceljs pptxgenjs pdfkit
node build-xlsx.js   # also prints the 3-scenario financial summary to console
node build-deck.js
node build-pdf.js
```

All headline numbers in the deck and PDF come from the Base scenario printed by
`build-xlsx.js` — if you change assumptions in that script, rebuild all three so
the documents stay consistent. (Changing assumptions inside the Excel file itself
recalculates the workbook live; no rebuild needed for that.)

`node_modules` is intentionally not kept here (OneDrive sync weight); run
`npm install` before rebuilding.
