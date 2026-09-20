/*
  Warnings:

  - You are about to drop the column `birthDate` on the `Host` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Host" DROP COLUMN "birthDate";

-- AlterTable
ALTER TABLE "Profil" ADD COLUMN     "birthDate" DATE;
