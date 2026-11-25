import Link from "next/link";
import { OrdersTable, type OrderRow } from "@/components/OrdersTable";
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

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    entryDate: o.entryDate.toISOString(),
    customer: o.customer,
    total: o.totalAmount == null ? null : Number(o.totalAmount),
    balance: o.balanceAmount == null ? null : Number(o.balanceAmount),
  }));

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
      <OrdersTable orders={rows} emptyMessage={query ? "No orders match your search." : "No orders yet. Create one from a customer's page."} />
    </div>
  );
}
