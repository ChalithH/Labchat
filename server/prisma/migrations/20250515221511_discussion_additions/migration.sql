-- CreateEnum
CREATE TYPE "DiscussionCategoryState" AS ENUM ('OPEN', 'HIDDEN');

-- CreateEnum
CREATE TYPE "DiscussionPostState" AS ENUM ('REPLIES_OPEN', 'REPLIES_CLOSED', 'HIDDEN', 'STICKY');

-- AlterTable
ALTER TABLE "discussion" ADD COLUMN     "postPermission" INTEGER,
ADD COLUMN     "visiblePermission" INTEGER;

-- AlterTable
ALTER TABLE "discussion_post" ADD COLUMN     "state" "DiscussionPostState" NOT NULL DEFAULT 'REPLIES_OPEN';
