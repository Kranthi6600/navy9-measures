"use client";

import Link from "next/link";
import type { ActionState } from "@/lib/types";
import { DateInput } from "./DateInput";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

type Customer = {
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth?: string;
  height: number | null;
  weight: number | null;
};

export function CustomerForm({
  action,
  customer,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  customer?: Customer;
  cancelHref: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  return (
    <form method="post" onSubmit={onSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="height">Height</label>
            <input className="input" id="height" name="height" type="number" step="0.1" min="0" placeholder="cm / in" defaultValue={customer?.height ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="weight">Weight (kg)</label>
            <input className="input" id="weight" name="weight" type="number" step="0.1" min="0" defaultValue={customer?.weight ?? ""} />
          </div>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pending={pending}>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
