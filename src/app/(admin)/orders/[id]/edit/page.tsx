import Link from "next/link";
import { notFound } from "next/navigation";
import { saveOrder } from "@/app/actions";
import { OrderForm } from "@/components/OrderForm";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { toDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true, blazerM: true, trouserM: true, shirtM: true },
  });
  if (!order) notFound();
  const { customer } = order;

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/orders/${id}`} className="text-sm text-slate-500 hover:text-blue-900">← Order #{order.orderNumber}</Link>
        <h1 className="text-2xl font-semibold">Edit order · {customer.name}</h1>
      </div>
      <OrderForm
        action={saveOrder.bind(null, id)}
        defaults={{
          orderNumber: order.orderNumber,
          entryDate: toDateInput(order.entryDate),
                    totalAmount: order.totalAmount ? Number(order.totalAmount) : null,
          advanceAmount: order.advanceAmount ? Number(order.advanceAmount) : null,
          items: order.items.map((item) => ({
            ...item,
            rate: Number(item.rate),
            amount: Number(item.amount),
          })),
          measurements: { blazerM: order.blazerM, trouserM: order.trouserM, shirtM: order.shirtM },
          customer: {
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
        cancelHref={`/orders/${id}`}
        submitLabel="Save order"
      />
    </div>
  );
}
