"use client";

import { useState } from "react";

export function SizeSelect({
  id,
  name,
  options,
  defaultValue,
  extraValue,
}: {
  id: string;
  name: string;
  options: string[];
  defaultValue?: string | null;
  extraValue?: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const allOptions = extraValue && !options.includes(extraValue) ? [extraValue, ...options] : options;

  function choose(v: string) {
    setValue(v);
    setOpen(false);
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className={value ? "" : "text-slate-400"}>{value || "Select…"}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 pt-1">
          <ul
            role="listbox"
            className="scrollbar-slim max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
          >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => choose("")}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors hover:bg-blue-50 ${!value ? "font-medium text-blue-900" : "text-slate-700"}`}
            >
              Select…
            </button>
          </li>
          {allOptions.map((size) => (
            <li key={size}>
              <button
                type="button"
                role="option"
                aria-selected={value === size}
                onClick={() => choose(size)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors hover:bg-blue-50 ${value === size ? "font-medium text-blue-900" : "text-slate-700"}`}
              >
                {size}
                {value === size && <span className="text-blue-900">✓</span>}
              </button>
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  );
}
