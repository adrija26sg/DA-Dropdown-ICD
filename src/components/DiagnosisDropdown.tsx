// src/components/DiagnosisDropdown.tsx
"use client";

import React, { FC, useMemo, useCallback } from "react";
import AsyncSelect from "react-select/async";
import rawDataUntyped from "@/app/data/icd10_final.json";
interface RawEntry { code: string; display: string }
const rawData = rawDataUntyped as RawEntry[];
export interface ICDOption {
  code: string;
  label: string;
}

interface Props {
  value: ICDOption | null;
  onChange: (opt: ICDOption | null) => void;
}

export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => {
  // 1) One‑time map your JSON into { code, label }
  const allOptions: ICDOption[] = useMemo(
    () => rawData.map((e) => ({ code: e.code, label: e.display })),
    []
  );

  // 2) Prefix‑only filter on code
  const loadOptions = useCallback(
    (input: string) => {
      const term = input.trim().toLowerCase();
      if (!term) return Promise.resolve([]);
      const matches = allOptions.filter((o) =>
        o.code.toLowerCase().startsWith(term)
      );
      return Promise.resolve(matches.slice(0, 10));
    },
    [allOptions]
  );

  // 3) Custom “no options” messaging
  const noOptionsMessage = useCallback(
    ({ inputValue }: { inputValue: string }) =>
      inputValue.length > 0 ? "Wrong code" : "Start typing a code",
    []
  );

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      value={value}
      onChange={(opt) => onChange(opt as ICDOption | null)}
      getOptionLabel={(o) => `${o.code} – ${o.label}`}
      getOptionValue={(o) => o.code}
      placeholder="Type an ICD‑10 code…"
      noOptionsMessage={noOptionsMessage}
      isClearable
      instanceId="icd10-client"
    />
  );
};
