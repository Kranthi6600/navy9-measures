"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateFmt } from "@/lib/format";

export type CustomerRow = {
  id: string;
  customerNumber: string;
  name: string;
  mobile: string;
  email: string | null;
  orderCount: number;
  lastOrderNumber: string | null;
  lastOrderDate: string | null;
};

export function CustomersTable({ customers, emptyMessage }: { customers: CustomerRow[]; emptyMessage: string }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Customer No.</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Mobile</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3 text-center">Orders</th>
            <th className="px-4 py-3">Last order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => (
            <tr
              key={c.id}
              onClick={() => router.push(`/customers/${c.id}`)}
              className="cursor-pointer transition-colors hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.customerNumber}</td>
              <td className="px-4 py-3 font-medium">
                <Link href={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()} className="text-blue-900 hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="px-4 py-3">{c.mobile}</td>
              <td className="px-4 py-3">{c.email ?? "—"}</td>
              <td className="px-4 py-3 text-center">{c.orderCount}</td>
              <td className="px-4 py-3">
                {c.lastOrderNumber ? `#${c.lastOrderNumber} · ${c.lastOrderDate ? dateFmt.format(new Date(c.lastOrderDate)) : ""}` : "—"}
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
