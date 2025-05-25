/*
  Warnings:

  - A unique constraint covering the columns `[statusName]` on the table `status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "LabAttendance" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),

    CONSTRAINT "LabAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabAttendance_memberId_idx" ON "LabAttendance"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "status_statusName_key" ON "status"("statusName");

-- AddForeignKey
ALTER TABLE "LabAttendance" ADD CONSTRAINT "LabAttendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
