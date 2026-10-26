/*
  Warnings:

  - You are about to drop the column `created_at` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `MediaCat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
