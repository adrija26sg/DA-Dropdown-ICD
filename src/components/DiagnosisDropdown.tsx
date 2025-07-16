// src/components/ICD11Dropdown.tsx
"use client";

import React, { FC, useMemo, useCallback, useState } from "react";
import AsyncSelect from "react-select/async";
import rawData from "@/app/data/icd11.json";

export interface ICDOption {
  code: string;
  label: string;
}

interface Props {
  value: ICDOption | null;
  onChange: (opt: ICDOption | null) => void;
}

export const ICD11Dropdown: FC<Props> = ({ value, onChange }) => {
  // 1) Build your options array once
  const allOptions: ICDOption[] = useMemo(
    () =>
      rawData.map((e) => ({
        code: e.code,
        label: e.display,
      })),
    []
  );

  // 2) loadOptions: prefix‑only filter on code
  const loadOptions = useCallback(
    (input: string) => {
      const term = input.trim().toLowerCase();
      if (!term) return Promise.resolve([]);
      // Only codes starting with the term
      const matches = allOptions.filter((o) =>
        o.code.toLowerCase().startsWith(term)
      );
      return Promise.resolve(matches.slice(0, 10));
    },
    [allOptions]
  );

  // 3) Custom “no options” message
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
      placeholder="Type an ICD‑11 code…"
      noOptionsMessage={noOptionsMessage}
      isClearable
      instanceId="icd11-client"
    />
  );
};
