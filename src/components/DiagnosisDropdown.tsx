"use client";

import React, { FC, useMemo, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { StylesConfig } from "react-select";
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

/** Debounce helper for exactly two‑arg callbacks */
function debounce(
  func: (input: string, callback: (opts: ICDOption[]) => void) => void,
  delay: number
): (input: string, callback: (opts: ICDOption[]) => void) => void {
  let timer: NodeJS.Timeout;
  return (input, callback) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(input, callback);
    }, delay);
  };
}

export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => {
  // Prepare local ICD‑11 options
  const allOptions: ICDOption[] = useMemo(
    () =>
      rawData.map((e) => ({
        code: e.code.toUpperCase(),
        label: e.display,
      })),
    []
  );

  // Fetch ICD‑10 from NLM API
  const fetchICD10 = async (input: string): Promise<ICDOption[]> => {
    const term = input.trim().toUpperCase();
    const url =
      "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search" +
      "?sf=code,name&terms=" +
      encodeURIComponent(term) +
      "&maxList=100";

    const res = await fetch(url);
    const data: [number, string[], null, [string, string][]] = await res.json();
    return data[3].map(([code, label]) => ({ code, label }));
  };

  // Combined loader for react‑select
  const loadOptions = useMemo(
    () =>
      debounce((input, callback) => {
        const term = input.trim().toUpperCase();
        if (!term) {
          callback([]);
          return;
        }

        // 1) Local JSON ICD‑11 matches
        const localMatches = allOptions.filter((o) =>
          o.code.startsWith(term)
        );

        // 2) If only 1 character, skip API
        if (term.length === 1) {
          callback(localMatches.slice(0, 20));
          return;
        }

        // 3) Otherwise fetch ICD‑10 and merge
        fetchICD10(term)
          .then((apiMatches) => {
            const merged = [
              ...localMatches,
              ...apiMatches.filter(
                (a) => !localMatches.some((l) => l.code === a.code)
              ),
            ];
            callback(merged.slice(0, 25));
          })
          .catch(() => {
            // on error, fall back to local only
            callback(localMatches.slice(0, 20));
          });
      }, 300),
    [allOptions]
  );

  const noOptionsMessage = useCallback(
    ({ inputValue }: { inputValue: string }) =>
      inputValue.length ? "No match found" : "Start typing…",
    []
  );

  // Dark theme for react‑select
  const customStyles: StylesConfig<ICDOption> = {
    control: (base) => ({ ...base, backgroundColor: "#000", borderColor: "#444" }),
    input: (base) => ({ ...base, color: "#fff" }),
    menu: (base) => ({ ...base, backgroundColor: "#000" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#333" : "#000",
      color: "#fff",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "#fff" }),
    placeholder: (base) => ({ ...base, color: "#888" }),
  };

  return (
    <form autoComplete="off">
      <AsyncSelect<ICDOption, false>
        cacheOptions={false}
        defaultOptions={false}
        loadOptions={loadOptions}
        styles={customStyles}
        value={value}
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

// "use client";

// import React, { FC, useMemo, useCallback, useRef } from "react";
// import AsyncSelect from "react-select/async";
// import { get, set } from "idb-keyval";
// import rawDataUntyped from "@/app/data/icd11.json";

// interface RawEntry {
//   code: string;
//   display: string;
// }
// const rawData = rawDataUntyped as RawEntry[];

// export interface ICDOption {
//   code: string;
//   label: string;
// }

// interface Props {
//   value: ICDOption | null;
//   onChange: (opt: ICDOption | null) => void;
// }

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   delay: number
// ): (...args: Parameters<T>) => void {
//   let timer: NodeJS.Timeout;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => func(...args), delay);
//   };
// }

// export const DiagnosisDropdown: FC<Props> = ({ value, onChange }) => {
//   const allOptions: ICDOption[] = useMemo(
//     () =>
//       rawData.map((e) => ({
//         code: e.code.toUpperCase(),
//         label: e.display,
//       })),
//     []
//   );

//   const icd10Cache = useRef(new Map<string, ICDOption[]>());

//   const fetchICD10 = async (input: string): Promise<ICDOption[]> => {
//     const term = input.trim().toUpperCase();
//     const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(term)}&maxList=100`;
//     const res = await fetch(url);
//     const data: [number, string[], null, [string, string][]] = await res.json();
//     const results = data[3].map((entry) => ({
//       code: entry[0],
//       label: entry[1],
//     }));
//     return results;
//   };

//   const loadOptions = useMemo(
//     () =>
//       debounce(
//         async (
//           input: string,
//           callback: (options: ICDOption[]) => void
//         ): Promise<void> => {
//           const term = input.trim().toUpperCase();
//           if (!term) return callback([]);

//           const localMatches = allOptions
//             .filter((o) => o.code.startsWith(term))
//             .slice(0, 20);

//           if (term.length === 1) return callback(localMatches);

//           let apiMatches: ICDOption[] = [];
//           try {
//             apiMatches = await fetchICD10(term);
//           } catch {}

//           const merged = [
//             ...localMatches,
//             ...apiMatches.filter(
//               (api) => !localMatches.find((local) => local.code === api.code)
//             ),
//           ];

//           callback(merged.slice(0, 25));
//         },
//         300
//       ),
//     [allOptions]
//   );

//   const noOptionsMessage = useCallback(
//     ({ inputValue }: { inputValue: string }) =>
//       inputValue.length > 0 ? "No match found" : "Start typing...",
//     []
//   );
// //FOR BETTER VISIBILITY
//   const customStyles = {
//     control: (provided: any) => ({
//       ...provided,
//       backgroundColor: "#000",
//       color: "#fff",
//       borderColor: "#444",
//     }),
//     input: (provided: any) => ({
//       ...provided,
//       color: "#fff",
//     }),
//     menu: (provided: any) => ({
//       ...provided,
//       backgroundColor: "#000",
//       color: "#fff",
//     }),
//     option: (provided: any, state: any) => ({
//       ...provided,
//       backgroundColor: state.isFocused ? "#222" : "#000",
//       color: "#fff",
//       cursor: "pointer",
//     }),
//     singleValue: (provided: any) => ({
//       ...provided,
//       color: "#fff",
//     }),
//     placeholder: (provided: any) => ({
//       ...provided,
//       color: "#888",
//     }),
//   };
// //STYLING PART ENDS HERE
//   return (
//     <form autoComplete="off">
//       <AsyncSelect
//         cacheOptions={false}
//         defaultOptions={false}
//         loadOptions={loadOptions}
//         styles={customStyles}
//         onInputChange={(input) => input.toUpperCase()}
//         value={value}
//         onChange={(opt) => onChange(opt as ICDOption | null)}
//         getOptionLabel={(o) => `${o.code} – ${o.label}`}
//         getOptionValue={(o) => o.code}
//         placeholder="Search ICD-10 + ICD-11 codes..."
//         noOptionsMessage={noOptionsMessage}
//         isClearable
//         instanceId="diagnosis-unified"
//         autoFocus
//       />
//     </form>
//   );
// };
