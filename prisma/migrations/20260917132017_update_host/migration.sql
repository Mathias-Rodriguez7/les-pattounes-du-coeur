/*
  Warnings:

  - You are about to drop the column `age` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `availabilityDuration` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `job` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Host` table. All the data in the column will be lost.
  - Changed the type of `space` on the `Host` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HostType" ADD VALUE 'SOS';
ALTER TYPE "HostType" ADD VALUE 'ADOPT';
ALTER TYPE "HostType" ADD VALUE 'PROPIO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlacementType" ADD VALUE 'PROPOSAL';
ALTER TYPE "PlacementType" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "age",
DROP COLUMN "availabilityDuration",
DROP COLUMN "job",
DROP COLUMN "status",
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "cat_adult" INTEGER,
ADD COLUMN     "kitten" INTEGER,
ADD COLUMN     "kittyAndKitten" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "space",
ADD COLUMN     "space" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "HostStatus";

-- DropEnum
DROP TYPE "Space";
