import Link from "next/link";
import { CustomersTable, type CustomerRow } from "@/components/CustomersTable";
import { prisma } from "@/lib/prisma";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query.replace(/[\s\-().]/g, "") || query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: { select: { orders: true } },
      // FIXED: Removed 'createdAt' from orderBy
      orders: { orderBy: { entryDate: "desc" }, take: 1, select: { orderNumber: true, entryDate: true } },
    },
  });

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    customerNumber: c.customerNumber,
    name: c.name,
    mobile: c.mobile,
    email: c.email,
    orderCount: c._count.orders,
    lastOrderNumber: c.orders[0]?.orderNumber ?? null,
    lastOrderDate: c.orders[0]?.entryDate.toISOString() ?? null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <a href="/api/export" className="btn" download>Download CSV</a>
          <Link href="/customers/new" className="btn-primary">+ Add customer</Link>
        </div>
      </div>
      <form className="flex gap-2">
        <input className="input max-w-md" name="q" defaultValue={query} placeholder="Search by name, mobile or email" />
        <button className="btn">Search</button>
      </form>
      <CustomersTable customers={rows} emptyMessage={query ? "No customers match your search." : "No customers yet."} />
    </div>
  );
}
