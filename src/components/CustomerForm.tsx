"use client";

import Link from "next/link";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

type Customer = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
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
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" type="tel" defaultValue={customer?.phone ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="address">Address</label>
          <input className="input" id="address" name="address" defaultValue={customer?.address ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Notes</label>
          <textarea className="input" id="notes" name="notes" rows={3} defaultValue={customer?.notes ?? ""} />
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
