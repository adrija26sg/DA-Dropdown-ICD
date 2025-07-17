// src/app/page.tsx
"use client";

import { useState } from "react";
import { DiagnosisDropdown, ICDOption } from "@/components/DiagnosisDropdown";

export default function HomePage() {
  const [diag, setDiag] = useState<ICDOption | null>(null);

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Select a Diagnosis</h1>
      <DiagnosisDropdown value={diag} onChange={setDiag} />
      {diag && (
        <p>
          You selected: <strong>{diag.code} — {diag.label}</strong>
        </p>
      )}
    </div>
  );
}
