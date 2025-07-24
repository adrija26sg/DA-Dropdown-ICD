"use client";

import React, { FC, useMemo, useCallback, useRef } from "react";
import AsyncSelect from "react-select/async";
import { get, set } from "idb-keyval";
import rawDataUntyped from "@/app/data/icd11.json";

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

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}


export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => {
  const allOptions: ICDOption[] = useMemo(
    () => rawData.map((e) => ({ code: e.code, label: e.display })),
    []
  );

  const icd10Cache = useRef(new Map<string, ICDOption[]>());

  const fetchICD10 = async (input: string): Promise<ICDOption[]> => {
    const persisted = await get<ICDOption[] | undefined>(input);
    if (persisted) return persisted;

    if (icd10Cache.current.has(input)) return icd10Cache.current.get(input)!;

    const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(input)}&maxList=10`;
    const res = await fetch(url);
    const data: [string, string[], [string, string][]] = await res.json();
    const results = data[2].map((entry: [string, string]) => ({
      code: entry[0],
      label: entry[1],
    }));

    icd10Cache.current.set(input, results);
    await set(input, results);

    return results;
  };

  const loadOptions = useMemo(
    () =>
      debounce((input: string, callback: (options: ICDOption[]) => void): void => {
        const term = input.trim().toLowerCase();
        if (!term) return callback([]);

        const localMatches = allOptions.filter((o) =>
          o.code.toLowerCase().startsWith(term)
        ).slice(0, 10);

        callback(localMatches);

        fetchICD10(term).then((apiMatches) => {
          const merged = [
            ...localMatches,
            ...apiMatches.filter(
              (api) => !localMatches.find((local) => local.code === api.code)
            )
          ];
          callback(merged.slice(0, 15));
        }).catch(() => {
          // fail silently
        });
      }, 300),
    [allOptions]
  );

  const noOptionsMessage = useCallback(
    ({ inputValue }: { inputValue: string }) =>
      inputValue.length > 0 ? "No match found" : "Start typing...",
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
      placeholder="Search ICD-10 + ICD-11 codes..."
      noOptionsMessage={noOptionsMessage}
      isClearable
      instanceId="diagnosis-unified"
    />
  );
};
