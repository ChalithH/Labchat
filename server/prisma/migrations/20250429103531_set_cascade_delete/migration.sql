-- DropForeignKey
ALTER TABLE "discussion_reply" DROP CONSTRAINT "discussion_reply_postId_fkey";

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
