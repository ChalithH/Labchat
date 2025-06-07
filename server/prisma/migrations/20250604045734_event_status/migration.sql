/*
  Warnings:

  - You are about to drop the column `status` on the `event` table. All the data in the column will be lost.
  - Added the required column `statusId` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "status",
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "event_status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),

    CONSTRAINT "event_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_status_name_key" ON "event_status"("name");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "event_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
