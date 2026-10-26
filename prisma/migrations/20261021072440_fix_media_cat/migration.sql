/*
  Warnings:

  - You are about to drop the column `cat_id` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focal_point_x` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focal_point_y` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `is_cover` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `MediaCat` table. All the data in the column will be lost.
  - Added the required column `catId` to the `MediaCat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_cat_id_fkey";

-- DropIndex
DROP INDEX "MediaCat_cat_id_idx";

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "cat_id",
DROP COLUMN "createdAt",
DROP COLUMN "filename",
DROP COLUMN "focal_point_x",
DROP COLUMN "focal_point_y",
DROP COLUMN "is_cover",
DROP COLUMN "mime_type",
DROP COLUMN "size",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
DROP COLUMN "url",
ADD COLUMN     "catId" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fille" VARCHAR(255),
ADD COLUMN     "focalPointX" INTEGER,
ADD COLUMN     "focalPointY" INTEGER,
ADD COLUMN     "picture" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
