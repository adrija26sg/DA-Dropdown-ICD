// src/app/page.tsx
"use client";

import { useState } from "react";
import  {  ICD11Dropdown,ICDOption } from "@/components/DiagnosisDropdown";
;

export default function HomePage() {
  const [diag, setDiag] = useState<ICDOption | null>(null);

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1 className="text-xl font-semibold mb-4">Select an ICD‑11 Code</h1>
      <ICD11Dropdown value={diag} onChange={setDiag} />
      {diag && (
        <p className="mt-4">
          <strong>You selected:</strong> {diag.code} — {diag.label}
        </p>
      )}
    </div>
  );
}
