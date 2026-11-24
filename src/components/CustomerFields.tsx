import { splitHeight } from "@/lib/format";
import { DateInput } from "./DateInput";

export type CustomerValues = {
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth?: string;
  height: number | null;
  weight: number | null;
};

// Renders grid cells; the parent supplies the grid.
export function CustomerFields({ customer }: { customer?: CustomerValues | null }) {
  const height = splitHeight(customer?.height);
  return (
    <>
      <div>
        <label className="label" htmlFor="name">Name *</label>
        <input className="input" id="name" name="name" required defaultValue={customer?.name} />
      </div>
      <div>
        <label className="label" htmlFor="mobile">Mobile *</label>
        <input className="input" id="mobile" name="mobile" type="tel" required defaultValue={customer?.mobile} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="dateOfBirth">Date of birth</label>
        <DateInput id="dateOfBirth" name="dateOfBirth" defaultValue={customer?.dateOfBirth} />
      </div>
      <fieldset>
        <legend className="label">Height</legend>
        <div className="flex gap-2">
          <input className="input" name="heightFeet" type="number" step="1" min="0" max="9" placeholder="ft" aria-label="Height feet" defaultValue={height?.feet ?? ""} />
          <input className="input" name="heightInches" type="number" step="0.1" min="0" max="11.9" placeholder="in" aria-label="Height inches" defaultValue={height?.inches ?? ""} />
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="weight">Weight (kg)</label>
        <input className="input" id="weight" name="weight" type="number" step="0.1" min="0" defaultValue={customer?.weight ?? ""} />
      </div>
    </>
  );
}
