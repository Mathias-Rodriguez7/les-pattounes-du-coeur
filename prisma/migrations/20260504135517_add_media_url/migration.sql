/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Profil` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Profil` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `Profil` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "mediaUrl" TEXT;

-- AlterTable
ALTER TABLE "Profil" ADD COLUMN     "phone" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profil_phone_key" ON "Profil"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profil_email_key" ON "Profil"("email");
