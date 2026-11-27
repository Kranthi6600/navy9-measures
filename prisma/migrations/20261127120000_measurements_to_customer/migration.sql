-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "blazerCustomerId" TEXT,
ADD COLUMN     "shirtCustomerId" TEXT,
ADD COLUMN     "trouserCustomerId" TEXT,
ADD COLUMN     "waistcoatCustomerId" TEXT;

-- Backfill: for each garment, keep only the measurement from the customer's
-- most recent order and point it at the customer. Older duplicates are removed
-- so the new unique constraints hold.

-- Blazer
DELETE FROM "Measurement" m
USING "Order" o
WHERE m."blazerOrderId" = o."id"
AND EXISTS (
  SELECT 1 FROM "Measurement" m2
  JOIN "Order" o2 ON m2."blazerOrderId" = o2."id"
  WHERE o2."customerId" = o."customerId"
    AND (o2."entryDate" > o."entryDate" OR (o2."entryDate" = o."entryDate" AND o2."id" > o."id"))
);
UPDATE "Measurement" m SET "blazerCustomerId" = o."customerId"
FROM "Order" o WHERE m."blazerOrderId" = o."id";

-- Waistcoat
DELETE FROM "Measurement" m
USING "Order" o
WHERE m."waistcoatOrderId" = o."id"
AND EXISTS (
  SELECT 1 FROM "Measurement" m2
  JOIN "Order" o2 ON m2."waistcoatOrderId" = o2."id"
  WHERE o2."customerId" = o."customerId"
    AND (o2."entryDate" > o."entryDate" OR (o2."entryDate" = o."entryDate" AND o2."id" > o."id"))
);
UPDATE "Measurement" m SET "waistcoatCustomerId" = o."customerId"
FROM "Order" o WHERE m."waistcoatOrderId" = o."id";

-- Trousers
DELETE FROM "Measurement" m
USING "Order" o
WHERE m."trouserOrderId" = o."id"
AND EXISTS (
  SELECT 1 FROM "Measurement" m2
  JOIN "Order" o2 ON m2."trouserOrderId" = o2."id"
  WHERE o2."customerId" = o."customerId"
    AND (o2."entryDate" > o."entryDate" OR (o2."entryDate" = o."entryDate" AND o2."id" > o."id"))
);
UPDATE "Measurement" m SET "trouserCustomerId" = o."customerId"
FROM "Order" o WHERE m."trouserOrderId" = o."id";

-- Shirt
DELETE FROM "Measurement" m
USING "Order" o
WHERE m."shirtOrderId" = o."id"
AND EXISTS (
  SELECT 1 FROM "Measurement" m2
  JOIN "Order" o2 ON m2."shirtOrderId" = o2."id"
  WHERE o2."customerId" = o."customerId"
    AND (o2."entryDate" > o."entryDate" OR (o2."entryDate" = o."entryDate" AND o2."id" > o."id"))
);
UPDATE "Measurement" m SET "shirtCustomerId" = o."customerId"
FROM "Order" o WHERE m."shirtOrderId" = o."id";

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_blazerCustomerId_key" ON "Measurement"("blazerCustomerId");
CREATE UNIQUE INDEX "Measurement_shirtCustomerId_key" ON "Measurement"("shirtCustomerId");
CREATE UNIQUE INDEX "Measurement_trouserCustomerId_key" ON "Measurement"("trouserCustomerId");
CREATE UNIQUE INDEX "Measurement_waistcoatCustomerId_key" ON "Measurement"("waistcoatCustomerId");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_blazerCustomerId_fkey" FOREIGN KEY ("blazerCustomerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_shirtCustomerId_fkey" FOREIGN KEY ("shirtCustomerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_trouserCustomerId_fkey" FOREIGN KEY ("trouserCustomerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_waistcoatCustomerId_fkey" FOREIGN KEY ("waistcoatCustomerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_blazerOrderId_fkey";
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_waistcoatOrderId_fkey";
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_trouserOrderId_fkey";
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_shirtOrderId_fkey";

-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "blazerOrderId",
DROP COLUMN "shirtOrderId",
DROP COLUMN "trouserOrderId",
DROP COLUMN "waistcoatOrderId";
