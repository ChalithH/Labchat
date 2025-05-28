-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastViewedLabId" INTEGER;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_lastViewedLabId_fkey" FOREIGN KEY ("lastViewedLabId") REFERENCES "lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;
