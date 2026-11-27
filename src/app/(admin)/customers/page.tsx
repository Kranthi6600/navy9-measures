import Link from "next/link";
import { CustomersTable, type CustomerRow } from "@/components/CustomersTable";
import { prisma } from "@/lib/prisma";

const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function daysUntilBirthday(dob: Date, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let next = new Date(Date.UTC(today.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
  if (next < today) next = new Date(Date.UTC(today.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate()));
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [customers, birthdayCustomers] = await Promise.all([
    prisma.customer.findMany({
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
    }),
    prisma.customer.findMany({
      where: { dateOfBirth: { not: null } },
      select: { id: true, name: true, dateOfBirth: true },
      take: 500,
    }),
  ]);

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

  const birthdays = birthdayCustomers
    .map((c) => ({ ...c, days: daysUntilBirthday(c.dateOfBirth!) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_15rem]">
      <div className="min-w-0 space-y-4">
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

      <aside className="card h-fit space-y-3">
        <h2 className="text-sm font-semibold text-blue-900">Upcoming birthdays</h2>
        {birthdays.length === 0 && <p className="text-sm text-slate-500">No birthdays on record.</p>}
        <ul className="space-y-2">
          {birthdays.map((c) => (
            <li key={c.id}>
              <Link href={`/customers/${c.id}`} className="flex items-center justify-between gap-2 text-sm hover:bg-slate-50 -mx-2 rounded px-2 py-1">
                <span className="truncate font-medium">{c.name}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {dayFmt.format(c.dateOfBirth!)}
                  {c.days === 0 ? " · today" : c.days === 1 ? " · tomorrow" : ` · in ${c.days}d`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
