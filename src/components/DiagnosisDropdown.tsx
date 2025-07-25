"use client";

import React, { FC, useMemo, useCallback, useRef, useState } from "react";
import AsyncSelect from "react-select/async";
import { get, set } from "idb-keyval";
import rawDataUntyped from "@/app/data/icd11.json";

interface RawEntry {
  code: string;
  display: string;
}
const rawData = rawDataUntyped as RawEntry[];

export interface ICDOption {
  code: string;
  label: string;
}

interface Props {
  value: ICDOption | null;
  onChange: (opt: ICDOption | null) => void;
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const allOptions: ICDOption[] = useMemo(
    () =>
      rawData.map((e) => ({
        code: e.code.toUpperCase(),
        label: e.display,
      })),
    []
  );

  const icd10Cache = useRef(new Map<string, ICDOption[]>());

  const fetchICD10 = async (input: string): Promise<ICDOption[]> => {
    const term = input.trim().toUpperCase();

    if (term.length <= 1) return []; // don't query API for single letter

    if (icd10Cache.current.has(term)) return icd10Cache.current.get(term)!;

    const cached = await get<ICDOption[] | undefined>(term);
    if (cached) return cached;

    const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(
      term
    )}&maxList=100`;

    const res = await fetch(url);
    const data: [number, string[], null, [string, string][]] = await res.json();

    const results = data[3].map((entry) => ({
      code: entry[0],
      label: entry[1],
    }));

    icd10Cache.current.set(term, results);
    await set(term, results);
    return results;
  };

  const loadOptions = useMemo(
    () =>
      debounce(
        async (
          input: string,
          callback: (options: ICDOption[]) => void
        ): Promise<void> => {
          const term = input.trim().toUpperCase();
          if (!term) return callback([]);

          const localMatches = allOptions
            .filter((o) => o.code.startsWith(term))
            .slice(0, 20);

          let apiMatches: ICDOption[] = [];
          try {
            apiMatches = await fetchICD10(term);
          } catch (_) {}

          const merged = [
            ...localMatches,
            ...apiMatches.filter(
              (api) => !localMatches.find((local) => local.code === api.code)
            ),
          ];

          callback(merged.slice(0, 25));
        },
        300
      ),
    [allOptions]
  );

  const noOptionsMessage = useCallback(
    ({ inputValue }: { inputValue: string }) =>
      inputValue.length > 0 ? "No match found" : "Start typing...",
    []
  );

  return (
    <form autoComplete="off">
      <AsyncSelect
        cacheOptions={false}
        defaultOptions={false}
        loadOptions={loadOptions}
        value={value}
        inputValue={inputValue}
        onInputChange={(val) => setInputValue(val.toUpperCase())}
        onChange={(opt) => onChange(opt as ICDOption | null)}
        getOptionLabel={(o) => `${o.code} – ${o.label}`}
        getOptionValue={(o) => o.code}
        placeholder="Search ICD-10 + ICD-11 codes..."
        noOptionsMessage={noOptionsMessage}
        isClearable
        instanceId="diagnosis-unified"
        autoFocus
      />
    </form>
  );
};
