// scripts/csv-to-json-icd11.js
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const INPUT = path.resolve(process.cwd(), "icd11_mms.csv");  // or your .csv
const OUTPUT = path.resolve(process.cwd(), "src/app/data/icd11.json");

if (!fs.existsSync(INPUT)) {
  console.error("❌ Cannot find", INPUT);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT, "utf-8");
// Parse into rows of arrays
const rows = parse(raw, {
  skip_empty_lines: true,
  relax_column_count: true,
});

// Assume first row is header—drop it
const [header, ...dataRows] = rows;

// Log out the header so you can verify columns
console.log("🔎 CSV header ->", header);

// Map each row: column 2 = code, column 4 = description
const flat = dataRows
  .map((r) => {
    const code = (r[2] || "").trim();
    let display = (r[4] || "").trim();
    // strip leading dashes/spaces like “- - - - “
    display = display.replace(/^[-\s]+/, "");
    return { code, display };
  })
  .filter((e) => e.code && e.display);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(flat, null, 2), "utf-8");
console.log(`✅ Wrote ${flat.length} ICD‑11 codes to ${OUTPUT}`);
