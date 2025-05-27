-- AlterTable
ALTER TABLE "lab" ADD COLUMN     "labPic" TEXT;

-- AlterTable
ALTER TABLE "lab_inventory_item" ADD COLUMN     "itemPic" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isPCI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilePic" TEXT;
