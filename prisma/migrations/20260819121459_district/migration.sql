/*
  Warnings:

  - You are about to alter the column `email` on the `Profil` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `address` on the `Profil` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - The primary key for the `Sickness` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "District" AS ENUM ('HOPITAUX_FACULTES', 'CROIX_D_ARGENT', 'PORT_MARIANNE', 'CENTRE_VILLE', 'CEVENNES', 'PRES_D_ARENES', 'MOSSON');

-- AlterTable
ALTER TABLE "Profil" ADD COLUMN     "city" VARCHAR(80) NOT NULL DEFAULT 'Montpellier',
ADD COLUMN     "district" "District",
ADD COLUMN     "postal_code" VARCHAR(10) NOT NULL DEFAULT '34000',
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "address" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Sickness" DROP CONSTRAINT "Sickness_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sickness_pkey" PRIMARY KEY ("id");
