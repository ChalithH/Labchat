-- DropForeignKey
ALTER TABLE "inventory_log" DROP CONSTRAINT "inventory_log_labInventoryItemId_fkey";

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_labInventoryItemId_fkey" FOREIGN KEY ("labInventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
