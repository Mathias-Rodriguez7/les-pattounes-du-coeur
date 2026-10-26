/*
  Warnings:

  - You are about to drop the column `file` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `MediaCat` table. All the data in the column will be lost.
  - Added the required column `filename` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `MediaCat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_cat_id_fkey";

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "file",
DROP COLUMN "picture",
ADD COLUMN     "filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "is_cover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mime_type" VARCHAR(100) NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "type" "MediaType" NOT NULL,
ADD COLUMN     "url" VARCHAR(255) NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "isFlexibleDispatcher" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "MediaCat_cat_id_idx" ON "MediaCat"("cat_id");

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
