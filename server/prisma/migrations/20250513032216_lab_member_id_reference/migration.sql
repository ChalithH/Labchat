/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `lab_member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "discussion_post" DROP CONSTRAINT "discussion_post_memberId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "lab_member_userId_key" ON "lab_member"("userId");

-- AddForeignKey
ALTER TABLE "discussion_post" ADD CONSTRAINT "discussion_post_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
