"use client";

import Link from "next/link";
import type { GarmentRelation, MeasurementData } from "@/lib/measurements";
import type { ActionState } from "@/lib/types";
import { CustomerFields, type CustomerValues } from "./CustomerFields";
import { MeasurementFields } from "./MeasurementFields";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function CustomerForm({
  action,
  customer,
  measurements,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  customer?: CustomerValues;
  measurements?: Partial<Record<GarmentRelation, MeasurementData | null>>;
  cancelHref: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomerFields customer={customer} />
        </div>
      </div>
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-blue-900">Measurements</h2>
        <MeasurementFields measurements={measurements} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-center gap-2">
        <SubmitButton pending={pending}>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
