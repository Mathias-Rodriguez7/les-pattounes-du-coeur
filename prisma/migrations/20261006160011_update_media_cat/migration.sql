/*
  Warnings:

  - You are about to drop the column `fille` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `MediaCat` table. All the data in the column will be lost.
  - Added the required column `filename` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MediaCat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_catId_fkey";

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "fille",
DROP COLUMN "picture",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key" VARCHAR(500) NOT NULL,
ADD COLUMN     "mimeType" VARCHAR(100) NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "thumbnailKey" VARCHAR(500),
ADD COLUMN     "type" "MediaType" NOT NULL;

-- CreateIndex
CREATE INDEX "MediaCat_catId_idx" ON "MediaCat"("catId");

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
