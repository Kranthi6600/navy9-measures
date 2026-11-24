import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b print:hidden border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/customers" className="text-lg font-semibold text-blue-900">Navy9 Measures</Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/customers" className="hover:text-blue-900">Customers</Link>
              <Link href="/orders" className="hover:text-blue-900">Orders</Link>
              <Link href="/orders/new" className="hover:text-blue-900">New order</Link>
              <Link href="/customers/new" className="hover:text-blue-900">New customer</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">{session.user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
