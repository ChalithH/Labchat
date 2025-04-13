/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "universityId" VARCHAR(16) NOT NULL,
    "loginEmail" TEXT NOT NULL,
    "loginPassword" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "office" TEXT,
    "bio" VARCHAR(256),
    "dateJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissionLevel" INTEGER NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissionLevel" INTEGER NOT NULL,

    CONSTRAINT "lab_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_member" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "labRoleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inductionDone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lab_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_status" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "member_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "safteyInfo" TEXT,
    "approval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_inventory_item" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "itemUnit" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_inventory_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_tag" (
    "id" SERIAL NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_log" (
    "id" SERIAL NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "actiontype" TEXT NOT NULL,
    "notes" TEXT,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_post" (
    "id" SERIAL NOT NULL,
    "discussionId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isAnnounce" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "discussion_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_reply" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_post_tags" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "discussion_post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_reactions" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "reactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "labId" INTEGER NOT NULL,

    CONSTRAINT "instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_booking" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT,

    CONSTRAINT "instrument_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_issue" (
    "id" SERIAL NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "instrument_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_post" (
    "id" SERIAL NOT NULL,
    "issueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignment" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "task_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clock_in_logs" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "logTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logType" TEXT NOT NULL,

    CONSTRAINT "clock_in_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_loginEmail_key" ON "user"("loginEmail");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_member" ADD CONSTRAINT "lab_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_member" ADD CONSTRAINT "lab_member_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_member" ADD CONSTRAINT "lab_member_labRoleId_fkey" FOREIGN KEY ("labRoleId") REFERENCES "lab_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_status" ADD CONSTRAINT "member_status_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_status" ADD CONSTRAINT "member_status_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_inventory_item" ADD CONSTRAINT "lab_inventory_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_inventory_item" ADD CONSTRAINT "lab_inventory_item_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tag" ADD CONSTRAINT "item_tag_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "lab_inventory_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_log" ADD CONSTRAINT "inventory_log_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post" ADD CONSTRAINT "discussion_post_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post" ADD CONSTRAINT "discussion_post_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_post_tags" ADD CONSTRAINT "discussion_post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reactions" ADD CONSTRAINT "discussion_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reactions" ADD CONSTRAINT "discussion_reactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument" ADD CONSTRAINT "instrument_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_booking" ADD CONSTRAINT "instrument_booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_booking" ADD CONSTRAINT "instrument_booking_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_issue" ADD CONSTRAINT "instrument_issue_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_post" ADD CONSTRAINT "issue_post_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "instrument_issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_post" ADD CONSTRAINT "issue_post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_in_logs" ADD CONSTRAINT "clock_in_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_in_logs" ADD CONSTRAINT "clock_in_logs_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
