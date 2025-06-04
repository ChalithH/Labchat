-- AlterEnum
ALTER TYPE "InventoryAction" ADD VALUE 'ITEM_UPDATE';

-- DropIndex
DROP INDEX "inventory_log_action_idx";
