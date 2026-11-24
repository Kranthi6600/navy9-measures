import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCustomer, deleteMeasurement, deletePhoto, uploadPhoto } from "@/app/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { MeasurementGrid } from "@/components/MeasurementGrid";
import { PhotoUpload } from "@/components/PhotoUpload";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });
// takenAt is a calendar date stored at midnight UTC
const takenAtFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      measurements: { orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }] },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/customers" className="text-sm text-slate-500 hover:text-blue-900">← Customers</Link>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-slate-500">
            {[customer.phone, customer.email].filter(Boolean).join(" · ") || "No contact details"}
          </p>
          {customer.address && <p className="text-sm text-slate-500">{customer.address}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/edit`} className="btn">Edit</Link>
          <DeleteButton
            action={deleteCustomer.bind(null, id)}
            confirmText={`Delete ${customer.name} and all their measurements and photos?`}
          />
        </div>
      </div>

      {customer.notes && (
        <div className="card text-sm whitespace-pre-wrap text-slate-700">{customer.notes}</div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Measurements</h2>
          <Link href={`/customers/${id}/measurements/new`} className="btn-primary">+ New measurements</Link>
        </div>
        {customer.measurements.length === 0 && (
          <p className="card text-sm text-slate-500">No measurements recorded yet.</p>
        )}
        {customer.measurements.map((m, i) => (
          <details key={m.id} open={i === 0} className="card">
            <summary className="flex cursor-pointer items-center justify-between gap-2">
              <span className="font-medium">
                {takenAtFmt.format(m.takenAt)}
                {i === 0 && <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-900">Latest</span>}
              </span>
              <span className="text-xs text-slate-500">{m.unit === "IN" ? "Inches" : "Centimetres"}</span>
            </summary>
            <div className="mt-4 space-y-4">
              <MeasurementGrid values={m} unit={m.unit} />
              {m.notes && <p className="text-sm whitespace-pre-wrap text-slate-600">{m.notes}</p>}
              <div className="flex gap-2">
                <Link href={`/customers/${id}/measurements/${m.id}`} className="btn">Edit</Link>
                <DeleteButton
                  action={deleteMeasurement.bind(null, id, m.id)}
                  confirmText="Delete this measurement record?"
                />
              </div>
            </div>
          </details>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Photos</h2>
        <div className="card space-y-4">
          <PhotoUpload action={uploadPhoto.bind(null, id)} enabled={cloudinaryConfigured} />
          {customer.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {customer.photos.map((p) => (
                <figure key={p.id} className="space-y-2">
                  <a href={p.url} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-md bg-slate-100">
                    <Image src={p.url} alt={p.caption ?? customer.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </a>
                  <figcaption className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">{p.caption ?? dateFmt.format(p.createdAt)}</span>
                    <DeleteButton
                      action={deletePhoto.bind(null, id, p.id)}
                      confirmText="Delete this photo?"
                      label="Remove"
                      className="text-red-600 hover:underline disabled:opacity-50"
                    />
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No photos yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
