import { createCustomer } from "@/app/actions";
import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Add customer</h1>
      <CustomerForm action={createCustomer} cancelHref="/customers" />
    </div>
  );
}
