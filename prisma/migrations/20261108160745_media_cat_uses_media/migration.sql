/*
  Warnings:

  - You are about to drop the column `mime_type` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `original_name` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `size_bytes` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `storage_key` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `MediaCat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id]` on the table `MediaCat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_id` to the `MediaCat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "mime_type",
DROP COLUMN "original_name",
DROP COLUMN "size_bytes",
DROP COLUMN "storage_key",
DROP COLUMN "type",
DROP COLUMN "url",
ADD COLUMN     "file_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MediaCat_file_id_key" ON "MediaCat"("file_id");

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
