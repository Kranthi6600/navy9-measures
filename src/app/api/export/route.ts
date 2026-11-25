import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dateFmt } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const customers = await prisma.customer.findMany({
    orderBy: { customerNumber: "asc" },
    include: {
      orders: {
        orderBy: { entryDate: "asc" },
        include: { items: { select: { product: true, quantity: true } } },
      },
    },
  });

  const header = [
    "Customer No.",
    "Name",
    "Mobile",
    "Email",
    "Order No.",
    "Entry Date",
    "Items",
    "Total",
    "GST Rate %",
    "GST Amount",
    "Advance",
    "Balance",
  ];

  const lines: string[] = [header.join(",")];
  for (const c of customers) {
    if (c.orders.length === 0) {
      lines.push([c.customerNumber, c.name, c.mobile, c.email, "", "", "", "", "", "", "", ""].map(csvCell).join(","));
      continue;
    }
    for (const o of c.orders) {
      lines.push(
        [
          c.customerNumber,
          c.name,
          c.mobile,
          c.email,
          o.orderNumber,
          dateFmt.format(o.entryDate),
          o.items.map((i) => `${i.product} x${i.quantity}`).join("; "),
          o.totalAmount == null ? "" : Number(o.totalAmount),
          o.taxRate ?? "",
          o.taxAmount == null ? "" : Number(o.taxAmount),
          o.advanceAmount == null ? "" : Number(o.advanceAmount),
          o.balanceAmount == null ? "" : Number(o.balanceAmount),
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers_export.csv"',
    },
  });
}
