/*
  Warnings:

  - You are about to drop the column `duration` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointX` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointY` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `isMain` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailKey` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MediaCat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_catId_fkey";

-- DropIndex
DROP INDEX "MediaCat_catId_idx";

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "duration",
DROP COLUMN "filename",
DROP COLUMN "focalPointX",
DROP COLUMN "focalPointY",
DROP COLUMN "isMain",
DROP COLUMN "key",
DROP COLUMN "mimeType",
DROP COLUMN "size",
DROP COLUMN "thumbnailKey",
DROP COLUMN "type",
ADD COLUMN     "fille" VARCHAR(255),
ADD COLUMN     "picture" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
