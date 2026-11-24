import { MEASUREMENT_GROUPS, type MeasurementValues } from "@/lib/measurements";

export function MeasurementGrid({ values, unit }: { values: MeasurementValues; unit: "IN" | "CM" }) {
  const suffix = unit === "IN" ? "in" : "cm";
  return (
    <div className="space-y-4">
      {MEASUREMENT_GROUPS.map((group) => (
        <div key={group.title}>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{group.title}</h4>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.fields.map((field) => {
              const value = values[field.key];
              return (
                <div key={field.key} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">{field.label}</dt>
                  <dd className="font-mono text-sm font-medium">
                    {value != null ? `${value} ${suffix}` : <span className="text-slate-300">—</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}
