import { prisma } from "./prisma";

export async function nextOrderNumber() {
  const rows = await prisma.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(CAST("orderNumber" AS INTEGER)) AS max
    FROM "Order"
    WHERE "orderNumber" ~ '^[0-9]{1,9}$'`;
  return String((rows[0]?.max ?? 0) + 1);
}
