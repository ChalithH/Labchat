/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "event_id_key" ON "event"("id");
