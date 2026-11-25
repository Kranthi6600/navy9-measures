"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateFmt, formatMoney } from "@/lib/format";

export type OrderRow = {
  id: string;
  orderNumber: string;
  entryDate: string;
  customer: { id: string; name: string; mobile: string };
  total: number | null;
  balance: number | null;
};

export function OrdersTable({ orders, emptyMessage }: { orders: OrderRow[]; emptyMessage: string }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Order No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((o) => (
            <tr
              key={o.id}
              onClick={() => router.push(`/orders/${o.id}`)}
              className="cursor-pointer transition-colors hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium">
                <Link href={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="text-blue-900 hover:underline">
                  #{o.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{dateFmt.format(new Date(o.entryDate))}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/customers/${o.customer.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  {o.customer.name}
                </Link>
                <span className="ml-2 text-slate-500">{o.customer.mobile}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatMoney(o.total)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatMoney(o.balance)}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
