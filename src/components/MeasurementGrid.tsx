import type { Garment, MeasurementData } from "@/lib/measurements";

export function MeasurementGrid({ garment, values }: { garment: Garment; values: MeasurementData }) {
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {garment.fields.map((field) => {
          const value = values[field.key];
          return (
            <div key={field.key} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">{field.label}</dt>
              <dd className="font-mono text-sm font-medium">
                {value != null && value !== "" ? value : <span className="text-slate-300">—</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      {values.comment && <p className="text-sm whitespace-pre-wrap text-slate-600">{values.comment}</p>}
    </div>
  );
}
