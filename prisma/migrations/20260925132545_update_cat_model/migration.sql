/*
  Warnings:

  - A unique constraint covering the columns `[chipId]` on the table `Cat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cat_chipId_key" ON "Cat"("chipId");
