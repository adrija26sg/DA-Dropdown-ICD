// src/components/DiagnosisDropdown.tsx
"use client";

import React from "react";
import AsyncSelect from "react-select/async";
import type { StylesConfig, CSSObjectWithLabel } from "react-select";


import type { FC } from "react";

export interface ICDOption {
  code: string;
  label: string;
}

async function loadOptions(input: string): Promise<ICDOption[]> {
  const res = await fetch(`/api/icd10?search=${encodeURIComponent(input)}`);
  if (!res.ok) return [];
  return res.json();
}

interface Props {
  value: ICDOption | null;
  onChange: (opt: ICDOption | null) => void;
}

export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => (
  <AsyncSelect
    cacheOptions
    loadOptions={loadOptions}
    defaultOptions={false}
    value={value}
    onChange={onChange}
    getOptionLabel={(o) => `${o.code} – ${o.label}`}
    getOptionValue={(o) => o.code}
    placeholder="Type to search ICD-10…"
    noOptionsMessage={() => "No matching code"}
    isClearable
  />
);
