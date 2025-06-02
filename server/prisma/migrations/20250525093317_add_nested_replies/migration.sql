-- AlterTable
ALTER TABLE "discussion_reply" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "discussion_reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
