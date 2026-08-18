/*
  Warnings:

  - You are about to drop the column `sickness` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `treatment` on the `Cat` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SicknessStatus" AS ENUM ('ACTIVE', 'TREATED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "sickness",
DROP COLUMN "treatment";

-- CreateTable
CREATE TABLE "sicknesses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "catId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "treatment" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "SicknessStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sicknesses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sicknesses" ADD CONSTRAINT "sicknesses_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
