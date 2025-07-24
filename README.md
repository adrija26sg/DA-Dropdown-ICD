# 🩺 DiagnosisDropdown: Unified ICD-10 + ICD-11 Code Search

This component provides a unified diagnosis code search experience by combining:

- ✅ **Local ICD-11 search** from static JSON
- 🌐 **Live ICD-10 API** search via NLM (U.S. National Library of Medicine)
- ⚡ Debounced input for performance
- 💾 Smart caching using IndexedDB (`idb-keyval`) + in-memory

---

## 📦 Features

- **ICD-11 Search (local)**: Fast prefix search on codes from a bundled JSON file
- **ICD-10 Search (API)**: Fetches live results from `https://clinicaltables.nlm.nih.gov` API
- **Debounced Input**: 300ms delay to minimize API requests
- **Persistent Caching**:
  - ✅ Uses `IndexedDB` via `idb-keyval` to cache past queries
  - ✅ In-memory fallback for the current session
- **Deduplication**: Merges results from both sources without duplicates

---

## 🧠 Workflow

### When the user types:
1. The input is debounced (300ms) to avoid frequent lookups.
2. Local ICD-11 codes are filtered using **prefix match**.
3. These results are **immediately shown** in the dropdown.
4. In the background:
    - The ICD-10 API is queried.
    - The result is checked in:
        - IndexedDB (persistent cache)
        - In-memory map (session cache)
    - If no match is found, a network request is sent.
5. The final result is a **merged, de-duplicated list** from both sources.
<img width="1410" height="3840" alt="Untitled diagram _ Mermaid Chart-2025-07-24-200059" src="https://github.com/user-attachments/assets/2bca8101-f937-4187-9e07-315e964cbffb" />

---

## 📂 File Overview

- `DiagnosisDropdown.tsx`  
  Main component using `react-select/async` to render the searchable dropdown.

- `icd11.json`  
  Static file bundled with ICD-11 codes (`{ code, display }[]` format).

---

## 🔧 Tech Stack

- React (with hooks)
- TypeScript
- [react-select](https://react-select.com/home)
- [idb-keyval](https://www.npmjs.com/package/idb-keyval) for IndexedDB
- NLM Clinical Tables API for ICD-10 codes

---

## 📌 Example Use

```tsx
const [diagnosis, setDiagnosis] = useState<ICDOption | null>(null);

<DiagnosisDropdown
  value={diagnosis}
  onChange={setDiagnosis}
/>
