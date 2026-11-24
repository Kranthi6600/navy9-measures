import { notFound } from "next/navigation";
import { saveMeasurement } from "@/app/actions";
import { MeasurementForm } from "@/components/MeasurementForm";
import { MEASUREMENT_KEYS } from "@/lib/measurements";
import { prisma } from "@/lib/prisma";

export default async function NewMeasurementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { measurements: { orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }], take: 1 } },
  });
  if (!customer) notFound();
  const latest = customer.measurements[0];
  const defaults = latest
    ? { unit: latest.unit, ...Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, latest[k]])) }
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New measurements</h1>
        <p className="text-sm text-slate-500">
          {customer.name}
          {latest && " · pre-filled from the latest record"}
        </p>
      </div>
      <MeasurementForm
        action={saveMeasurement.bind(null, id, null)}
        defaults={defaults}
        cancelHref={`/customers/${id}`}
      />
    </div>
  );
}
