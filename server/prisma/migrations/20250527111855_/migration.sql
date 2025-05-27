/*
  Warnings:

  - You are about to drop the column `isPCI` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lab_member" ADD COLUMN     "isPCI" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isPCI";
