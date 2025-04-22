/*
  Warnings:

  - You are about to drop the `instrument_booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_assignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "instrument_booking" DROP CONSTRAINT "instrument_booking_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "instrument_booking" DROP CONSTRAINT "instrument_booking_memberId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_labId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_memberId_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_memberId_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_taskId_fkey";

-- DropTable
DROP TABLE "instrument_booking";

-- DropTable
DROP TABLE "task";

-- DropTable
DROP TABLE "task_assignment";

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "instrumentId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_assignment" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "event_assignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_assignment" ADD CONSTRAINT "event_assignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_assignment" ADD CONSTRAINT "event_assignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
