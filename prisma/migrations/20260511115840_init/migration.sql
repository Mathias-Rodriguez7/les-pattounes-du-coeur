/*
  Warnings:

  - The primary key for the `Adoption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `is_actif` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `reception_capacity` on the `Host` table. All the data in the column will be lost.
  - The `actif` column on the `Volunteer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `Adoption` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `additionalInformation` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availabilityDuration` to the `Host` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ColabActivity" AS ENUM ('ACTIVE', 'BREAK', 'STOP');

-- AlterTable
ALTER TABLE "Adoption" DROP CONSTRAINT "Adoption_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Adoption_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "description",
DROP COLUMN "is_actif",
DROP COLUMN "reception_capacity",
ADD COLUMN     "actif" "ColabActivity",
ADD COLUMN     "additionalInformation" TEXT NOT NULL,
ADD COLUMN     "availabilityDuration" TEXT NOT NULL,
ADD COLUMN     "numberOfCatsAtHome" INTEGER,
ADD COLUMN     "numberOfDogsAtHome" INTEGER,
ADD COLUMN     "otherAnimalsAtHome" TEXT;

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "actif",
ADD COLUMN     "actif" "ColabActivity";

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "volunteerId" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
