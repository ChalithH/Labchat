-- DropForeignKey
ALTER TABLE "inventory_log" DROP CONSTRAINT "inventory_log_memberId_fkey";

-- AlterTable
ALTER TABLE "inventory_log" ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "inventory_log_userId_idx" ON "inventory_log"("userId");

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
