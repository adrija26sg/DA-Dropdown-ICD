// src/app/api/icd10/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const term = (req.nextUrl.searchParams.get("search") || "").trim();
  if (!term) {
    return NextResponse.json([], { status: 200 });
  }

  const url = new URL(
    "https://clinicaltables.nlm.nih.gov/fhir/R4/ValueSet/icd10cm/$expand"
  );
  url.searchParams.set("filter", term);
  url.searchParams.set("count", "50");
  url.searchParams.set("_format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("FHIR expand failed:", await res.text());
    return NextResponse.json([], { status: 500 });
  }

  const json = await res.json();
  const list = (json.expansion?.contains || []).map((c: any) => ({
    code: c.code,
    label: c.display,
  }));

  return NextResponse.json(list);
}
