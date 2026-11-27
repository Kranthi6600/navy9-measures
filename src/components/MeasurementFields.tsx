import { GARMENTS, SIZE_OPTIONS, isTextField, type GarmentRelation, type MeasurementData } from "@/lib/measurements";
import { SizeSelect } from "./SizeSelect";

// Renders one fieldset per garment in a responsive grid. Inputs are
// uncontrolled (name="garment.field") so they submit with the parent form.
export function MeasurementFields({
  measurements,
}: {
  measurements?: Partial<Record<GarmentRelation, MeasurementData | null>>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {GARMENTS.map((garment) => {
        const values = measurements?.[garment.relation] ?? {};
        return (
          <fieldset key={garment.key} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <legend className="px-1 text-sm font-semibold text-blue-900">{garment.title}</legend>
            <p className="mb-3 text-xs text-slate-500">Leave empty if not applicable.</p>
            <div className="grid grid-cols-2 gap-3">
              {garment.fields.map((field) => {
                const isText = isTextField(field.key);
                const name = `${garment.key}.${field.key}`;
                if (field.key === "size") {
                  return (
                    <div key={field.key}>
                      <label className="label" htmlFor={name}>{field.label}</label>
                      <SizeSelect
                        id={name}
                        name={name}
                        options={SIZE_OPTIONS[garment.key]}
                        defaultValue={values.size}
                        extraValue={values.size}
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.key}>
                    <label className="label" htmlFor={name}>{field.label}</label>
                    <input
                      className="input"
                      id={name}
                      name={name}
                      type={isText ? "text" : "number"}
                      inputMode={isText ? undefined : "decimal"}
                      step={isText ? undefined : "0.25"}
                      min={isText ? undefined : "0"}
                      defaultValue={values[field.key] ?? ""}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <label className="label" htmlFor={`${garment.key}.comment`}>Comment</label>
              <textarea className="input resize-y" id={`${garment.key}.comment`} name={`${garment.key}.comment`} rows={4} defaultValue={values.comment ?? ""} />
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
