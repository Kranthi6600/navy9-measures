"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { GARMENTS, PRODUCTS, isTextField, type GarmentRelation, type MeasurementData } from "@/lib/measurements";
import type { ActionState } from "@/lib/types";
import { DateInput } from "./DateInput";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

type ItemRow = { product: string; rate: string; quantity: string };

export type OrderDefaults = {
  orderNumber: string;
  entryDate?: string;
  totalAmount?: number | null;
  advanceAmount?: number | null;
  items?: { product: string; rate: number; quantity: number }[];
  measurements?: Partial<Record<GarmentRelation, MeasurementData | null>>;
};

const emptyRow: ItemRow = { product: "", rate: "", quantity: "1" };

function rowAmount(row: ItemRow) {
  const amount = Number(row.rate || 0) * Number(row.quantity || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

export function OrderForm({
  action,
  defaults,
  cancelHref,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: OrderDefaults;
  cancelHref: string;
  submitLabel: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  const [items, setItems] = useState<ItemRow[]>(
    defaults.items?.length
      ? defaults.items.map((i) => ({ product: i.product, rate: String(i.rate), quantity: String(i.quantity) }))
      : [emptyRow],
  );
  const [total, setTotal] = useState(defaults.totalAmount?.toString() ?? "");
  const [advance, setAdvance] = useState(defaults.advanceAmount?.toString() ?? "");

  const itemsTotal = items.reduce((sum, row) => sum + (row.product ? rowAmount(row) : 0), 0);
  const effectiveTotal = total !== "" ? Number(total) : items.some((r) => r.product) ? itemsTotal : null;
  const balance = effectiveTotal != null ? effectiveTotal - Number(advance || 0) : null;

  function updateRow(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-6">
      <div className="card grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="orderNumber">Order No. *</label>
          <input className="input" id="orderNumber" name="orderNumber" required defaultValue={defaults.orderNumber} />
        </div>
        <div>
          <label className="label" htmlFor="entryDate">Entry date</label>
          <DateInput id="entryDate" name="entryDate" defaultToday defaultValue={defaults.entryDate} />
        </div>
      </div>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-blue-900">Items</h2>
        <datalist id="products">
          {PRODUCTS.map((p) => <option key={p} value={p} />)}
        </datalist>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="pb-2">Product</th>
                <th className="w-32 pb-2">Rate</th>
                <th className="w-24 pb-2">Qty</th>
                <th className="w-32 pb-2 text-right">Amount</th>
                <th className="w-10 pb-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2">
                    <input className="input" name="item.product" list="products" aria-label="Product" value={row.product} onChange={(e) => updateRow(i, { product: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <input className="input" name="item.rate" type="number" min="0" step="0.01" aria-label="Rate" value={row.rate} onChange={(e) => updateRow(i, { rate: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <input className="input" name="item.quantity" type="number" min="1" step="1" aria-label="Quantity" value={row.quantity} onChange={(e) => updateRow(i, { quantity: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2 text-right font-mono">{formatMoney(rowAmount(row))}</td>
                  <td className="py-1 text-right">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Remove item"
                      onClick={() => setItems((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : [emptyRow]))}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn" onClick={() => setItems((rows) => [...rows, emptyRow])}>+ Add item</button>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="totalAmount">Total amount</label>
            <input className="input" id="totalAmount" name="totalAmount" type="number" min="0" step="0.01" placeholder={`${itemsTotal} (sum of items)`} value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="advanceAmount">Advance</label>
            <input className="input" id="advanceAmount" name="advanceAmount" type="number" min="0" step="0.01" value={advance} onChange={(e) => setAdvance(e.target.value)} />
          </div>
          <div>
            <span className="label">Balance</span>
            <p className="py-2 font-mono text-lg font-semibold">{formatMoney(balance)}</p>
          </div>
        </div>
      </section>

      {GARMENTS.map((garment) => {
        const values = defaults.measurements?.[garment.relation] ?? {};
        return (
          <fieldset key={garment.key} className="card">
            <legend className="px-1 text-sm font-semibold text-blue-900">{garment.title}</legend>
            <p className="mb-3 text-xs text-slate-500">Leave empty if not part of this order.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {garment.fields.map((field) => {
                const isText = isTextField(field.key);
                const name = `${garment.key}.${field.key}`;
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
              <textarea className="input" id={`${garment.key}.comment`} name={`${garment.key}.comment`} rows={2} defaultValue={values.comment ?? ""} />
            </div>
          </fieldset>
        );
      })}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
