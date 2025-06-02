-- CreateTable
CREATE TABLE "reply_reaction" (
    "id" SERIAL NOT NULL,
    "reactionName" VARCHAR(64) NOT NULL,
    "reaction" VARCHAR(64) NOT NULL,

    CONSTRAINT "reply_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_reply_reaction" (
    "id" SERIAL NOT NULL,
    "replyId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "reactionId" INTEGER NOT NULL,

    CONSTRAINT "discussion_reply_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discussion_reply_reaction_replyId_memberId_reactionId_key" ON "discussion_reply_reaction"("replyId", "memberId", "reactionId");

-- AddForeignKey
ALTER TABLE "discussion_reply_reaction" ADD CONSTRAINT "discussion_reply_reaction_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "discussion_reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply_reaction" ADD CONSTRAINT "discussion_reply_reaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply_reaction" ADD CONSTRAINT "discussion_reply_reaction_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "reply_reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
