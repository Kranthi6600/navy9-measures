import Link from "next/link";
import { dateFmt } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { orders: true } },
      orders: { orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }], take: 1, select: { orderNumber: true, entryDate: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link href="/customers/new" className="btn-primary">+ New customer</Link>
      </div>
      <form className="flex gap-2">
        <input className="input max-w-md" name="q" defaultValue={query} placeholder="Search by name, mobile or email" />
        <button className="btn">Search</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/customers/${c.id}`} className="text-blue-900 hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-3">{c.mobile}</td>
                <td className="px-4 py-3">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-center">{c._count.orders}</td>
                <td className="px-4 py-3">
                  {c.orders[0] ? `#${c.orders[0].orderNumber} · ${dateFmt.format(c.orders[0].entryDate)}` : "—"}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {query ? "No customers match your search." : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
