-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerNumber" TEXT;

-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "waistcoatOrderId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "taxAmount" DECIMAL(10,2),
ADD COLUMN     "taxRate" DOUBLE PRECISION;

-- Backfill sequential customer numbers for existing rows
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
  FROM "Customer"
)
UPDATE "Customer" c
SET "customerNumber" = 'CUST-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE c."id" = n."id";

ALTER TABLE "Customer" ALTER COLUMN "customerNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_waistcoatOrderId_key" ON "Measurement"("waistcoatOrderId");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_waistcoatOrderId_fkey" FOREIGN KEY ("waistcoatOrderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
