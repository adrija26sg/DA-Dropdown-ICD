// scripts/fetch-icd10.js
import fs from "fs";
import fetch from "node-fetch";

const OUTPUT_FILE = "src/app/data/icd10.json";
const BATCH_SIZE = 1000;
const RETRY_LIMIT = 3;

// Load whatever’s there already (or start fresh)
let all = [];
if (fs.existsSync(OUTPUT_FILE)) {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
  all = Array.isArray(existing) ? existing : [];
  console.log(`📁 Resuming: ${all.length} codes loaded`);
}
let offset = all.length;

(async () => {
  console.log("📦 Starting ICD-10 fetch…");

  while (true) {
    let attempts = 0;
    let items = [];

    // Retry loop
    while (attempts < RETRY_LIMIT) {
      try {
        console.log(`🔁 Fetching codes ${offset}–${offset + BATCH_SIZE - 1}`);
        const url = new URL(
          "https://clinicaltables.nlm.nih.gov/fhir/R4/ValueSet/icd10cm/$expand"
        );
        url.searchParams.set("count", String(BATCH_SIZE));
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("_format", "json");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        items = json.expansion?.contains || [];
        break; // success
      } catch (err) {
        attempts++;
        console.warn(`⚠️ Attempt ${attempts} failed: ${err.message}`);
        if (attempts >= RETRY_LIMIT) {
          console.error("❌ Too many failures, stopping early.");
          process.exit(1);
        }
      }
    }

    // No more data? we’re done
    if (items.length === 0) {
      console.log("🛑 No more codes returned, finishing up.");
      break;
    }

    // Append & save
    const mapped = items.map((c) => ({ code: c.code, display: c.display }));
    all.push(...mapped);
    fs.mkdirSync("src/app/data", { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2), "utf-8");
    console.log(`✅ Saved ${all.length} total codes so far`);

    offset += BATCH_SIZE;
  }

  console.log(`🎉 Complete! ${all.length} ICD‑10 codes written to ${OUTPUT_FILE}`);
})();
