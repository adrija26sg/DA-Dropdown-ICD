"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ICDOption } from "@/components/DiagnosisDropdown";

const DiagnosisDropdown = dynamic(
  () => import("@/components/DiagnosisDropdown").then(mod => mod.DiagnosisDropdown),
  { ssr: false }
);

export default function HomePage() {
  const [diag, setDiag] = useState<ICDOption | null>(null);

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1 className="text-xl font-semibold mb-4">Select a Diagnosis</h1>
      <DiagnosisDropdown value={diag} onChange={setDiag} />
      {diag && (
        <p className="mt-4">
          <strong>You selected:</strong> {diag.code} — {diag.label}
        </p>
      )}
    </div>
  );
}
