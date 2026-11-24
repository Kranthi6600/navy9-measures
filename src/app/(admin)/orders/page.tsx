import Link from "next/link";
import { dateFmt, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const include = { customer: { select: { id: true, name: true, mobile: true } } };
  const [exact, matches] = await Promise.all([
    query ? prisma.order.findUnique({ where: { orderNumber: query }, include }) : null,
    prisma.order.findMany({
      where: query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { customer: { name: { contains: query, mode: "insensitive" } } },
              { customer: { mobile: { contains: query.replace(/[\s\-().]/g, "") || query, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { entryDate: "desc" },
      take: 100,
      include,
    }),
  ]);
  const orders = exact ? [exact, ...matches.filter((o) => o.id !== exact.id)] : matches;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/orders/new" className="btn-primary">+ New order</Link>
      </div>
      <form className="flex gap-2">
        <input className="input max-w-md" name="q" defaultValue={query} placeholder="Search by order no., customer name or mobile" />
        <button className="btn">Search</button>
      </form>
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
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/orders/${o.id}`} className="text-blue-900 hover:underline">#{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3">{dateFmt.format(o.entryDate)}</td>
                <td className="px-4 py-3">
                  <Link href={`/customers/${o.customer.id}`} className="hover:underline">{o.customer.name}</Link>
                  <span className="ml-2 text-slate-500">{o.customer.mobile}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatMoney(o.totalAmount)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatMoney(o.balanceAmount)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {query ? "No orders match your search." : "No orders yet. Create one from a customer's page."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
