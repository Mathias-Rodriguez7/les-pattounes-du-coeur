/*
  Warnings:

  - A unique constraint covering the columns `[media_id]` on the table `News` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Care` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdoptionStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CatDocumentKind" AS ENUM ('SURRENDER', 'ADOPTION_CONTRACT', 'ADOPTION_RETURN', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CareType" ADD VALUE 'DEWORMING';
ALTER TYPE "CareType" ADD VALUE 'FIV_TEST';
ALTER TYPE "CareType" ADD VALUE 'IDENTIFICATION';

-- DropIndex
DROP INDEX "Adoption_cat_id_key";

-- AlterTable
ALTER TABLE "Adoption" ADD COLUMN     "end_date" DATE,
ADD COLUMN     "status" "AdoptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Care" ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "sickness_id" UUID;

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "media_id" UUID;

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "type" "MediaType" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "original_name" VARCHAR(255),
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatDocument" (
    "id" UUID NOT NULL,
    "cat_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "kind" "CatDocumentKind" NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "adoption_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareDocument" (
    "id" UUID NOT NULL,
    "care_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_storage_key_key" ON "Media"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "CatDocument_media_id_key" ON "CatDocument"("media_id");

-- CreateIndex
CREATE INDEX "CatDocument_cat_id_idx" ON "CatDocument"("cat_id");

-- CreateIndex
CREATE INDEX "CatDocument_adoption_id_idx" ON "CatDocument"("adoption_id");

-- CreateIndex
CREATE UNIQUE INDEX "CareDocument_media_id_key" ON "CareDocument"("media_id");

-- CreateIndex
CREATE INDEX "CareDocument_care_id_idx" ON "CareDocument"("care_id");

-- CreateIndex
CREATE INDEX "Adoption_cat_id_idx" ON "Adoption"("cat_id");

-- CreateIndex
CREATE INDEX "Care_cat_id_idx" ON "Care"("cat_id");

-- CreateIndex
CREATE INDEX "Care_sickness_id_idx" ON "Care"("sickness_id");

-- CreateIndex
CREATE UNIQUE INDEX "News_media_id_key" ON "News"("media_id");

-- AddForeignKey
ALTER TABLE "Care" ADD CONSTRAINT "Care_sickness_id_fkey" FOREIGN KEY ("sickness_id") REFERENCES "Sickness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDocument" ADD CONSTRAINT "CatDocument_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDocument" ADD CONSTRAINT "CatDocument_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDocument" ADD CONSTRAINT "CatDocument_adoption_id_fkey" FOREIGN KEY ("adoption_id") REFERENCES "Adoption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareDocument" ADD CONSTRAINT "CareDocument_care_id_fkey" FOREIGN KEY ("care_id") REFERENCES "Care"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareDocument" ADD CONSTRAINT "CareDocument_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
