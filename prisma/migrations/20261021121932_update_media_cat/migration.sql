/*
  Warnings:

  - You are about to drop the column `catId` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `fille` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointX` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointY` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `MediaCat` table. All the data in the column will be lost.
  - Added the required column `cat_id` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_bytes` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storage_key` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `MediaCat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_catId_fkey";

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "catId",
DROP COLUMN "fille",
DROP COLUMN "focalPointX",
DROP COLUMN "focalPointY",
DROP COLUMN "picture",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "focal_point_x" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "focal_point_y" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mime_type" VARCHAR(100) NOT NULL,
ADD COLUMN     "original_name" VARCHAR(255),
ADD COLUMN     "size_bytes" INTEGER NOT NULL,
ADD COLUMN     "storage_key" TEXT NOT NULL,
ADD COLUMN     "type" "MediaType" NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "MediaCat_cat_id_idx" ON "MediaCat"("cat_id");

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
