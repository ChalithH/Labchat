/*
  Warnings:

  - You are about to drop the column `type` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `safteyInfo` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `inventoryItemId` on the `item_tag` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `member_status` table. All the data in the column will be lost.
  - You are about to drop the `clock_in_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discussion_post_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discussion_reactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instrument_issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `issue_post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `typeId` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `member_status` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'EXPORT', 'IMPORT', 'VIEW_SENSITIVE');

-- DropForeignKey
ALTER TABLE "clock_in_logs" DROP CONSTRAINT "clock_in_logs_labId_fkey";

-- DropForeignKey
ALTER TABLE "clock_in_logs" DROP CONSTRAINT "clock_in_logs_memberId_fkey";

-- DropForeignKey
ALTER TABLE "discussion_post_tags" DROP CONSTRAINT "discussion_post_tags_postId_fkey";

-- DropForeignKey
ALTER TABLE "discussion_reactions" DROP CONSTRAINT "discussion_reactions_memberId_fkey";

-- DropForeignKey
ALTER TABLE "discussion_reactions" DROP CONSTRAINT "discussion_reactions_postId_fkey";

-- DropForeignKey
ALTER TABLE "event_assignment" DROP CONSTRAINT "event_assignment_eventId_fkey";

-- DropForeignKey
ALTER TABLE "instrument_issue" DROP CONSTRAINT "instrument_issue_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_log" DROP CONSTRAINT "inventory_log_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_log" DROP CONSTRAINT "inventory_log_memberId_fkey";

-- DropForeignKey
ALTER TABLE "issue_post" DROP CONSTRAINT "issue_post_issueId_fkey";

-- DropForeignKey
ALTER TABLE "issue_post" DROP CONSTRAINT "issue_post_userId_fkey";

-- DropForeignKey
ALTER TABLE "item_tag" DROP CONSTRAINT "item_tag_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "member_status" DROP CONSTRAINT "member_status_memberId_fkey";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "item" DROP COLUMN "safteyInfo",
ADD COLUMN     "safetyInfo" TEXT;

-- AlterTable
ALTER TABLE "item_tag" DROP COLUMN "inventoryItemId",
ADD COLUMN     "tagDescription" TEXT;

-- AlterTable
ALTER TABLE "lab_inventory_item" ALTER COLUMN "currentStock" DROP DEFAULT,
ALTER COLUMN "minStock" DROP DEFAULT;

-- AlterTable
ALTER TABLE "member_status" DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "bio" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "clock_in_logs";

-- DropTable
DROP TABLE "discussion_post_tags";

-- DropTable
DROP TABLE "discussion_reactions";

-- DropTable
DROP TABLE "instrument_issue";

-- DropTable
DROP TABLE "inventory_log";

-- DropTable
DROP TABLE "issue_post";

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,
    "statusWeight" INTEGER NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_item_tag" (
    "id" SERIAL NOT NULL,
    "itemTagId" INTEGER NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,

    CONSTRAINT "lab_item_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reaction" (
    "id" SERIAL NOT NULL,
    "reactionName" VARCHAR(64) NOT NULL,
    "reaction" VARCHAR(64) NOT NULL,

    CONSTRAINT "post_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_post_reaction" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "reactionId" INTEGER NOT NULL,

    CONSTRAINT "discussion_post_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tag" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_post_tag" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "postTagId" INTEGER NOT NULL,

    CONSTRAINT "discussion_post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "event_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" VARCHAR(255) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "labId" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_detail" (
    "id" SERIAL NOT NULL,
    "auditLogId" INTEGER NOT NULL,
    "field" VARCHAR(255) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "audit_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_detail_auditLogId_idx" ON "audit_detail"("auditLogId");

-- AddForeignKey
ALTER TABLE "member_status" ADD CONSTRAINT "member_status_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_status" ADD CONSTRAINT "member_status_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_item_tag" ADD CONSTRAINT "lab_item_tag_itemTagId_fkey" FOREIGN KEY ("itemTagId") REFERENCES "item_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_item_tag" ADD CONSTRAINT "lab_item_tag_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_reaction" ADD CONSTRAINT "discussion_post_reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_reaction" ADD CONSTRAINT "discussion_post_reaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_reaction" ADD CONSTRAINT "discussion_post_reaction_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "post_reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_tag" ADD CONSTRAINT "discussion_post_tag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_tag" ADD CONSTRAINT "discussion_post_tag_postTagId_fkey" FOREIGN KEY ("postTagId") REFERENCES "post_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "event_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_assignment" ADD CONSTRAINT "event_assignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_detail" ADD CONSTRAINT "audit_detail_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "audit_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;
