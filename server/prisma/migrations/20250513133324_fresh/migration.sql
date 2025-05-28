-- DropForeignKey
ALTER TABLE "discussion_post" DROP CONSTRAINT "discussion_post_memberId_fkey";

-- DropIndex
-- DROP INDEX "lab_member_userId_key";

-- AddForeignKey
ALTER TABLE "discussion_post" ADD CONSTRAINT "discussion_post_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
