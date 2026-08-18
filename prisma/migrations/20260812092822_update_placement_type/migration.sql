/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `Placement` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('LONG', 'SHORT');

-- AlterTable
ALTER TABLE "Placement" DROP COLUMN "isPrimary",
ADD COLUMN     "type" "PlacementType" NOT NULL DEFAULT 'LONG';
