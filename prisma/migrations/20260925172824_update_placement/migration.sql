/*
  Warnings:

  - You are about to drop the column `ended` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `started` on the `Placement` table. All the data in the column will be lost.
  - Added the required column `status` to the `Placement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Placement" DROP COLUMN "ended",
DROP COLUMN "isActive",
DROP COLUMN "started",
ADD COLUMN     "endDate" DATE,
ADD COLUMN     "startDate" DATE,
ADD COLUMN     "status" "ColabActivity" NOT NULL;
