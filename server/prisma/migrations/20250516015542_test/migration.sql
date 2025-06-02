/*
  Warnings:

  - The values [REPLIES_OPEN,REPLIES_CLOSED] on the enum `DiscussionPostState` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DiscussionPostReplyState" AS ENUM ('REPLIES_OPEN', 'REPLIES_CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "DiscussionPostState_new" AS ENUM ('DEFAULT', 'HIDDEN', 'STICKY');
ALTER TABLE "discussion_post" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "discussion_post" ALTER COLUMN "state" TYPE "DiscussionPostState_new" USING ("state"::text::"DiscussionPostState_new");
ALTER TYPE "DiscussionPostState" RENAME TO "DiscussionPostState_old";
ALTER TYPE "DiscussionPostState_new" RENAME TO "DiscussionPostState";
DROP TYPE "DiscussionPostState_old";
ALTER TABLE "discussion_post" ALTER COLUMN "state" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterTable
ALTER TABLE "discussion_post" ADD COLUMN     "replyState" "DiscussionPostReplyState" NOT NULL DEFAULT 'REPLIES_OPEN',
ALTER COLUMN "state" SET DEFAULT 'DEFAULT';
