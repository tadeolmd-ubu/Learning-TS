-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sku" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
