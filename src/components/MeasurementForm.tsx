"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MEASUREMENT_GROUPS, type MeasurementValues } from "@/lib/measurements";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export type MeasurementDefaults = MeasurementValues & {
  unit?: "IN" | "CM";
  takenAt?: string;
  notes?: string | null;
};

export function MeasurementForm({
  action,
  defaults,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: MeasurementDefaults;
  cancelHref: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaults?.takenAt || !dateRef.current) return;
    const now = new Date();
    dateRef.current.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }, [defaults?.takenAt]);

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-6">
      <div className="card grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="takenAt">Date</label>
          <input className="input" id="takenAt" name="takenAt" type="date" ref={dateRef} defaultValue={defaults?.takenAt} />
        </div>
        <div>
          <label className="label" htmlFor="unit">Unit</label>
          <select className="input" id="unit" name="unit" defaultValue={defaults?.unit ?? "IN"}>
            <option value="IN">Inches</option>
            <option value="CM">Centimetres</option>
          </select>
        </div>
      </div>

      {MEASUREMENT_GROUPS.map((group) => (
        <fieldset key={group.title} className="card">
          <legend className="px-1 text-sm font-semibold text-blue-900">{group.title}</legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="label" htmlFor={field.key}>{field.label}</label>
                <input
                  className="input"
                  id={field.key}
                  name={field.key}
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  min="0"
                  defaultValue={defaults?.[field.key] ?? ""}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="card">
        <label className="label" htmlFor="notes">Notes / style preferences</label>
        <textarea className="input" id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pending={pending}>Save measurements</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
