import { notFound } from "next/navigation";
import { updateCustomer } from "@/app/actions";
import { CustomerForm } from "@/components/CustomerForm";
import { toDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { blazerM: true, waistcoatM: true, trouserM: true, shirtM: true },
  });
  if (!customer) notFound();
  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-semibold">Edit {customer.name}</h1>
      <CustomerForm
        action={updateCustomer.bind(null, id)}
        customer={{ ...customer, dateOfBirth: toDateInput(customer.dateOfBirth) }}
        measurements={{
          blazerM: customer.blazerM,
          waistcoatM: customer.waistcoatM,
          trouserM: customer.trouserM,
          shirtM: customer.shirtM,
        }}
        cancelHref={`/customers/${id}`}
      />
    </div>
  );
}
