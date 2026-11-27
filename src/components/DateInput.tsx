"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function localToday() {
  const now = new Date();
  return toISODate(new Date(now.getTime() - now.getTimezoneOffset() * 60000));
}

function parseISO(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

function formatDisplay(iso: string) {
  const d = parseISO(iso);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

// Accepts "d-m-yyyy" / "ddmmyyyy" typed input; returns ISO or null.
function parseTyped(text: string) {
  const digits = text.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return toISODate(d);
}

function autoFormat(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("-");
}

// Date field: type DD-MM-YYYY directly, or open the custom calendar via the icon.
// Submits "YYYY-MM-DD" through a hidden input.
export function DateInput({
  id,
  name,
  defaultToday,
  defaultValue,
  className,
  readOnly,
  tabIndex,
}: {
  id?: string;
  name?: string;
  defaultToday?: boolean;
  defaultValue?: string;
  className?: string;
  readOnly?: boolean;
  tabIndex?: number;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [text, setText] = useState(formatDisplay(defaultValue ?? ""));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const d = parseISO(defaultValue ?? "") ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!defaultToday || defaultValue) return;
    const today = localToday();
    setValue(today);
    setText(formatDisplay(today));
  }, [defaultToday, defaultValue]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear + 5 - i);

  const todayISO = localToday();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function pick(day: number) {
    const iso = toISODate(new Date(view.year, view.month, day));
    setValue(iso);
    setText(formatDisplay(iso));
    setOpen(false);
  }

  function onTypeChange(raw: string) {
    const formatted = autoFormat(raw);
    setText(formatted);
    const iso = parseTyped(formatted);
    if (iso) {
      setValue(iso);
      const d = parseISO(iso)!;
      setView({ year: d.getFullYear(), month: d.getMonth() });
    } else if (formatted === "") {
      setValue("");
    }
  }

  function onBlur() {
    // Revert to the last valid value if what's typed isn't a complete date.
    if (!parseTyped(text)) setText(formatDisplay(value));
  }

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD-MM-YYYY"
          disabled={readOnly}
          tabIndex={tabIndex}
          value={text}
          onChange={(e) => onTypeChange(e.target.value)}
          onBlur={onBlur}
          className={`${className ?? "input"} pr-9 ${readOnly ? "cursor-not-allowed" : ""}`}
        />
        {!readOnly && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Open calendar"
            onClick={() => setOpen((o) => !o)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-1">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900" aria-label="Previous month">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 010 1.06L8.06 10l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
            </button>
            <div className="flex items-center gap-1">
              <span className="relative">
                <select
                  value={view.month}
                  onChange={(e) => setView((v) => ({ ...v, month: Number(e.target.value) }))}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-1 pr-6 pl-2 text-sm font-semibold text-slate-800 transition-all hover:border-blue-900/40 hover:bg-blue-50/50 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none"
                  aria-label="Month"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m.slice(0, 3)}</option>)}
                </select>
                <svg className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="relative">
                <select
                  value={view.year}
                  onChange={(e) => setView((v) => ({ ...v, year: Number(e.target.value) }))}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-1 pr-6 pl-2 text-sm font-semibold text-slate-800 transition-all hover:border-blue-900/40 hover:bg-blue-50/50 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:outline-none"
                  aria-label="Year"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <svg className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900" aria-label="Next month">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium tracking-wide text-slate-400 uppercase">
            {WEEKDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day == null) return <span key={`b${i}`} />;
              const iso = toISODate(new Date(view.year, view.month, day));
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={day}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(day)}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-900 font-semibold text-white"
                      : isToday
                        ? "font-semibold text-blue-900 ring-1 ring-blue-900/40 hover:bg-blue-50"
                        : "text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const today = localToday();
              setValue(today);
              setText(formatDisplay(today));
              const t = new Date();
              setView({ year: t.getFullYear(), month: t.getMonth() });
              setOpen(false);
            }}
            className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-blue-900 transition-colors hover:bg-blue-50"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
