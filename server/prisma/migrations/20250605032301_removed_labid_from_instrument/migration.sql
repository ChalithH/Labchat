/*
  Warnings:

  - You are about to drop the column `labId` on the `instrument` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "instrument" DROP CONSTRAINT "instrument_labId_fkey";

-- AlterTable
ALTER TABLE "instrument" DROP COLUMN "labId";
