-- CreateEnum
CREATE TYPE "InventoryAction" AS ENUM ('STOCK_ADD', 'STOCK_REMOVE', 'STOCK_UPDATE', 'LOCATION_CHANGE', 'MIN_STOCK_UPDATE', 'ITEM_ADDED', 'ITEM_REMOVED');

-- CreateEnum
CREATE TYPE "InventorySource" AS ENUM ('ADMIN_PANEL', 'LAB_INTERFACE', 'API_DIRECT', 'BULK_IMPORT');

-- CreateTable
CREATE TABLE "inventory_log" (
    "id" SERIAL NOT NULL,
    "labInventoryItemId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "action" "InventoryAction" NOT NULL,
    "source" "InventorySource" NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "quantityChanged" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_log_labInventoryItemId_idx" ON "inventory_log"("labInventoryItemId");

-- CreateIndex
CREATE INDEX "inventory_log_memberId_idx" ON "inventory_log"("memberId");

-- CreateIndex
CREATE INDEX "inventory_log_createdAt_idx" ON "inventory_log"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_log_action_idx" ON "inventory_log"("action");

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_labInventoryItemId_fkey" FOREIGN KEY ("labInventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
