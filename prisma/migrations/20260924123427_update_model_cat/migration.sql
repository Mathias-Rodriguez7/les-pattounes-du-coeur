/*
  Warnings:

  - You are about to drop the column `focalPoint` on the `Cat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[catNumber]` on the table `Cat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `catNumber` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CatStatus" ADD VALUE 'DEAD';

-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "focalPoint",
ADD COLUMN     "catNumber" VARCHAR(8) NOT NULL;

-- AlterTable
ALTER TABLE "MediaCat" ADD COLUMN     "focalPointX" INTEGER,
ADD COLUMN     "focalPointY" INTEGER;

-- DropEnum
DROP TYPE "FocalPoint";

-- CreateIndex
CREATE UNIQUE INDEX "Cat_catNumber_key" ON "Cat"("catNumber");
