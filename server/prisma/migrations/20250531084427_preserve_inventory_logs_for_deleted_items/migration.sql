-- DropForeignKey
ALTER TABLE "inventory_log" DROP CONSTRAINT "inventory_log_labInventoryItemId_fkey";

-- AlterTable
ALTER TABLE "inventory_log" ALTER COLUMN "labInventoryItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_labInventoryItemId_fkey" FOREIGN KEY ("labInventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
