"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ICDOption } from "@/components/DiagnosisDropdown";

// 👇 Correctly access named export
const DiagnosisDropdown = dynamic(
  () =>
    import("@/components/DiagnosisDropdown").then(
      (mod) => mod.DiagnosisDropdown
    ),
  { ssr: false }
);

export default function HomePage() {
  const [diag, setDiag] = useState<ICDOption | null>(null);

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h1>Select a Diagnosis Code</h1>

      <DiagnosisDropdown value={diag} onChange={setDiag} />

      {diag && (
        <p style={{ marginTop: "1rem" }}>
          You selected: <strong>{diag.code} — {diag.label}</strong>
        </p>
      )}
    </div>
  );
}
