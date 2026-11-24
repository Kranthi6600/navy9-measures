import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteOrder } from "@/app/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { MeasurementGrid } from "@/components/MeasurementGrid";
import { PrintButton } from "@/components/PrintButton";
import { dateFmt, formatMoney } from "@/lib/format";
import { GARMENTS } from "@/lib/measurements";
import { prisma } from "@/lib/prisma";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true, blazerM: true, trouserM: true, shirtM: true },
  });
  if (!order) notFound();
  const garments = GARMENTS.filter((g) => order[g.relation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/customers/${order.customerId}`} className="text-sm text-slate-500 hover:text-blue-900 print:hidden">
            ← {order.customer.name}
          </Link>
          <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            {order.customer.name} · {order.customer.mobile} · {dateFmt.format(order.entryDate)}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <Link href={`/orders/${id}/edit`} className="btn">Edit</Link>
          <DeleteButton action={deleteOrder.bind(null, id)} confirmText={`Delete order #${order.orderNumber}?`} />
        </div>
      </div>

      <section className="card space-y-4">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="pb-2">Product</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">{item.product}</td>
                <td className="py-2 text-right font-mono">{formatMoney(item.rate)}</td>
                <td className="py-2 text-right font-mono">{item.quantity}</td>
                <td className="py-2 text-right font-mono">{formatMoney(item.amount)}</td>
              </tr>
            ))}
            {order.items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-500">No items.</td>
              </tr>
            )}
          </tbody>
        </table>
        <dl className="ml-auto grid w-full max-w-xs grid-cols-2 gap-1 border-t border-slate-100 pt-3 text-sm">
          <dt className="text-slate-500">Total</dt>
          <dd className="text-right font-mono">{formatMoney(order.totalAmount)}</dd>
          <dt className="text-slate-500">Advance</dt>
          <dd className="text-right font-mono">{formatMoney(order.advanceAmount)}</dd>
          <dt className="font-semibold">Balance</dt>
          <dd className="text-right font-mono font-semibold">{formatMoney(order.balanceAmount)}</dd>
        </dl>
      </section>

      {garments.map((g) => (
        <section key={g.key} className="card space-y-3">
          <h2 className="text-sm font-semibold text-blue-900">{g.title}</h2>
          <MeasurementGrid garment={g} values={order[g.relation]!} />
        </section>
      ))}
      {garments.length === 0 && <p className="card text-sm text-slate-500">No measurements recorded for this order.</p>}
    </div>
  );
}
