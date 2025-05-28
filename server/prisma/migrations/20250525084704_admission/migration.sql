/*
  Warnings:

  - The `status` column on the `lab_admission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `lab_admission_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "lab_admission_status" DROP CONSTRAINT "lab_admission_status_admissionId_fkey";

-- AlterTable
ALTER TABLE "lab_admission" DROP COLUMN "status",
ADD COLUMN     "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "lab_admission_status";
