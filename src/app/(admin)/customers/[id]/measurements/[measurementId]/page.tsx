import { notFound } from "next/navigation";
import { saveMeasurement } from "@/app/actions";
import { MeasurementForm } from "@/components/MeasurementForm";
import { MEASUREMENT_KEYS } from "@/lib/measurements";
import { prisma } from "@/lib/prisma";

export default async function EditMeasurementPage({
  params,
}: {
  params: Promise<{ id: string; measurementId: string }>;
}) {
  const { id, measurementId } = await params;
  const m = await prisma.measurement.findFirst({
    where: { id: measurementId, customerId: id },
    include: { customer: { select: { name: true } } },
  });
  if (!m) notFound();
  const defaults = {
    unit: m.unit,
    takenAt: m.takenAt.toISOString().slice(0, 10),
    notes: m.notes,
    ...Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, m[k]])),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit measurements</h1>
        <p className="text-sm text-slate-500">{m.customer.name}</p>
      </div>
      <MeasurementForm
        action={saveMeasurement.bind(null, id, measurementId)}
        defaults={defaults}
        cancelHref={`/customers/${id}`}
      />
    </div>
  );
}
