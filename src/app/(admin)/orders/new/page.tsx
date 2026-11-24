import Link from "next/link";
import { notFound } from "next/navigation";
import { createOrder } from "@/app/actions";
import { OrderForm } from "@/components/OrderForm";
import { nextOrderNumber } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const { customer: customerId } = await searchParams;
  if (!customerId) {
    return (
      <p className="card text-sm text-slate-600">
        Open a <Link href="/customers" className="text-blue-900 underline">customer</Link> to create an order.
      </p>
    );
  }
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) notFound();

  // Pre-fill each garment from the customer's most recent order that has it.
  const recent = await prisma.order.findMany({
    where: { customerId },
    orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: { blazerM: true, trouserM: true, shirtM: true },
  });
  const measurements = {
    blazerM: recent.find((o) => o.blazerM)?.blazerM ?? null,
    trouserM: recent.find((o) => o.trouserM)?.trouserM ?? null,
    shirtM: recent.find((o) => o.shirtM)?.shirtM ?? null,
  };

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/customers/${customerId}`} className="text-sm text-slate-500 hover:text-blue-900">← {customer.name}</Link>
        <h1 className="text-2xl font-semibold">New order</h1>
        {recent.length > 0 && <p className="text-sm text-slate-500">Measurements pre-filled from previous orders.</p>}
      </div>
      <OrderForm
        action={createOrder.bind(null, customerId)}
        defaults={{ orderNumber: await nextOrderNumber(), measurements }}
        cancelHref={`/customers/${customerId}`}
        submitLabel="Create order"
      />
    </div>
  );
}
