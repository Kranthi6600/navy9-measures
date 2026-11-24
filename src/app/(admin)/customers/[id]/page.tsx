import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCustomer, removeCustomerPhoto, uploadCustomerPhoto } from "@/app/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { PhotoUpload } from "@/components/PhotoUpload";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { dateFmt, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        include: { items: { select: { product: true, quantity: true } } },
      },
    },
  });
  if (!customer) notFound();

  const details = [
    ["Mobile", customer.mobile],
    ["Email", customer.email],
    ["Date of birth", customer.dateOfBirth && dateFmt.format(customer.dateOfBirth)],
    ["Height", customer.height],
    ["Weight", customer.weight != null ? `${customer.weight} kg` : null],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/customers" className="text-sm text-slate-500 hover:text-blue-900">← Customers</Link>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/edit`} className="btn">Edit</Link>
          <DeleteButton
            action={deleteCustomer.bind(null, id)}
            confirmText={`Delete ${customer.name} and all their orders?`}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="card space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
            {customer.photoUrl ? (
              <Image src={customer.photoUrl} alt={customer.name} fill sizes="220px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo</div>
            )}
          </div>
          <PhotoUpload action={uploadCustomerPhoto.bind(null, id)} enabled={cloudinaryConfigured} hasPhoto={!!customer.photoUrl} />
          {customer.photoUrl && (
            <DeleteButton
              action={removeCustomerPhoto.bind(null, id)}
              confirmText="Remove this photo?"
              label="Remove photo"
              className="w-full text-center text-xs text-red-600 hover:underline"
            />
          )}
        </div>
        <dl className="card grid h-fit grid-cols-2 gap-4 sm:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="label">{label}</dt>
              <dd className="text-sm">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <Link href={`/orders/new?customer=${id}`} className="btn-primary">+ New order</Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Order No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Advance</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/orders/${o.id}`} className="text-blue-900 hover:underline">#{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3">{dateFmt.format(o.entryDate)}</td>
                  <td className="px-4 py-3">{o.items.map((i) => `${i.product} ×${i.quantity}`).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatMoney(o.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatMoney(o.advanceAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatMoney(o.balanceAmount)}</td>
                </tr>
              ))}
              {customer.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
