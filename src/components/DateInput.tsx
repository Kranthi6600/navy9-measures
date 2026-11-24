"use client";

import { useEffect, useRef } from "react";

// Defaults to the browser's local date (not the server's UTC date) when no value is given.
export function DateInput({
  defaultToday,
  defaultValue,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { defaultToday?: boolean; defaultValue?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!defaultToday || defaultValue || !ref.current) return;
    const now = new Date();
    ref.current.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }, [defaultToday, defaultValue]);
  return <input ref={ref} type="date" className="input" defaultValue={defaultValue} {...props} />;
}
