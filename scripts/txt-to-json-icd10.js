// scripts/txt-to-json-icd10.js
import fs from "fs";
import path from "path";

const IN  = path.resolve(process.cwd(), "codes.txt");            // your two‑column text
const OUT = path.resolve(process.cwd(), "src/app/data/icd10_final.json");

if (!fs.existsSync(IN)) {
  console.error("❌ codes.txt not found at", IN);
  process.exit(1);
}

const lines = fs.readFileSync(IN, "utf-8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => !!l);

const out = lines.map((line, idx) => {
  const [code, ...rest] = line.split(/\s+/);
  const display = rest.join(" ").trim();
  if (!code || !display) {
    console.warn(`⚠️ Skipping malformed line ${idx + 1}: "${line}"`);
    return null;
  }
  return { code, display };
}).filter(Boolean);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
console.log(`✅ Wrote ${out.length} codes to ${OUT}`);
