/*
  Warnings:

  - You are about to drop the `sicknesses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sicknesses" DROP CONSTRAINT "sicknesses_catId_fkey";

-- DropTable
DROP TABLE "sicknesses";

-- CreateTable
CREATE TABLE "Sickness" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "catId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "treatment" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "SicknessStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sickness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sickness_catId_idx" ON "Sickness"("catId");

-- AddForeignKey
ALTER TABLE "Sickness" ADD CONSTRAINT "Sickness_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
