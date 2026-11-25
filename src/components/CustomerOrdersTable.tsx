"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateFmt, formatMoney } from "@/lib/format";

export type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  entryDate: string;
  items: string;
  total: number | null;
  advance: number | null;
  balance: number | null;
};

export function CustomerOrdersTable({ orders }: { orders: CustomerOrderRow[] }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Order No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Advance</th>
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
                <Link
                  href={`/orders/${o.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-900 hover:underline"
                >
                  #{o.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{dateFmt.format(new Date(o.entryDate))}</td>
              <td className="px-4 py-3">{o.items || "—"}</td>
              <td className="px-4 py-3 text-right font-mono">{formatMoney(o.total)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatMoney(o.advance)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatMoney(o.balance)}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
