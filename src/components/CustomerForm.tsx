"use client";

import Link from "next/link";
import type { ActionState } from "@/lib/types";
import { CustomerFields, type CustomerValues } from "./CustomerFields";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function CustomerForm({
  action,
  customer,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  customer?: CustomerValues;
  cancelHref: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  return (
    <form method="post" onSubmit={onSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomerFields customer={customer} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pending={pending}>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
