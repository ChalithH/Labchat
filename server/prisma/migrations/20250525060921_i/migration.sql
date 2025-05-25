/*
  Warnings:

  - You are about to drop the `LabAttendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LabAttendance" DROP CONSTRAINT "LabAttendance_memberId_fkey";

-- DropTable
DROP TABLE "LabAttendance";

-- CreateTable
CREATE TABLE "lab_attendance" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),

    CONSTRAINT "lab_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lab_attendance_memberId_idx" ON "lab_attendance"("memberId");

-- AddForeignKey
ALTER TABLE "lab_attendance" ADD CONSTRAINT "lab_attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "lab_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
