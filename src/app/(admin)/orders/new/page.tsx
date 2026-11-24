import Link from "next/link";
import { notFound } from "next/navigation";
import { saveOrder } from "@/app/actions";
import { OrderForm } from "@/components/OrderForm";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { toDateInput } from "@/lib/format";
import { nextOrderNumber } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const { customer: customerId } = await searchParams;
  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId } }) : null;
  if (customerId && !customer) notFound();

  // Pre-fill each garment from the customer's most recent order that has it.
  const recent = customer
    ? await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        take: 20,
        include: { blazerM: true, trouserM: true, shirtM: true },
      })
    : [];
  const measurements = {
    blazerM: recent.find((o) => o.blazerM)?.blazerM ?? null,
    trouserM: recent.find((o) => o.trouserM)?.trouserM ?? null,
    shirtM: recent.find((o) => o.shirtM)?.shirtM ?? null,
  };

  return (
    <div className="space-y-4">
      <div>
        <Link href={customer ? `/customers/${customer.id}` : "/orders"} className="text-sm text-slate-500 hover:text-blue-900">
          ← {customer ? customer.name : "Orders"}
        </Link>
        <h1 className="text-2xl font-semibold">New order</h1>
        {recent.length > 0 && <p className="text-sm text-slate-500">Measurements pre-filled from previous orders.</p>}
      </div>
      <OrderForm
        key={customer?.id ?? "new"}
        action={saveOrder.bind(null, null)}
        defaults={{
          orderNumber: await nextOrderNumber(),
          measurements,
          customer: customer && {
            id: customer.id,
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            dateOfBirth: toDateInput(customer.dateOfBirth),
            height: customer.height,
            weight: customer.weight,
            photoUrl: customer.photoUrl,
          },
        }}
        photoEnabled={cloudinaryConfigured}
        showSearch
        cancelHref={customer ? `/customers/${customer.id}` : "/orders"}
        submitLabel="Create order"
      />
    </div>
  );
}
