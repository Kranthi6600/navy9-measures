import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrder } from "@/app/actions";
import { OrderForm } from "@/components/OrderForm";
import { toDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true, blazerM: true, trouserM: true, shirtM: true },
  });
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/orders/${id}`} className="text-sm text-slate-500 hover:text-blue-900">← Order #{order.orderNumber}</Link>
        <h1 className="text-2xl font-semibold">Edit order · {order.customer.name}</h1>
      </div>
      <OrderForm
        action={updateOrder.bind(null, id)}
        defaults={{
          orderNumber: order.orderNumber,
          entryDate: toDateInput(order.entryDate),
          totalAmount: order.totalAmount,
          advanceAmount: order.advanceAmount,
          items: order.items,
          measurements: { blazerM: order.blazerM, trouserM: order.trouserM, shirtM: order.shirtM },
        }}
        cancelHref={`/orders/${id}`}
        submitLabel="Save order"
      />
    </div>
  );
}
