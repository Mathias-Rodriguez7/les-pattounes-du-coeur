/*
  Warnings:

  - The values [ADOPTION] on the enum `FormType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `catId` on the `Adoption` table. All the data in the column will be lost.
  - You are about to drop the column `profilId` on the `Adoption` table. All the data in the column will be lost.
  - You are about to drop the column `profilId` on the `BlacklistHistoric` table. All the data in the column will be lost.
  - You are about to drop the column `catId` on the `Care` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `catNumber` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `chipId` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `hairLength` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isAlreadySterilized` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isDeworming` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isFivTest` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isIdentify` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isOkCat` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isOkChild` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isOkDog` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isOutside` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isSterilize` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `Cat` table. All the data in the column will be lost.
  - The primary key for the `CatVolunteer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catId` on the `CatVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `volunteerId` on the `CatVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `breakEnd` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `breakStart` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `isStockFeed` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `is_animals-at-home` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfCatsAtHome` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfDogsAtHome` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `otherAnimalsAtHome` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `outside_desciption` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `profilId` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `stopActivity` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `catId` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `fille` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointX` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `focalPointY` on the `MediaCat` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `News` table. All the data in the column will be lost.
  - The primary key for the `NewsCat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catId` on the `NewsCat` table. All the data in the column will be lost.
  - You are about to drop the column `newsId` on the `NewsCat` table. All the data in the column will be lost.
  - You are about to drop the column `catId` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `hostId` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Profil` table. All the data in the column will be lost.
  - You are about to drop the column `volunteerId` on the `Session` table. All the data in the column will be lost.
  - The primary key for the `Sickness` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catId` on the `Sickness` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Sickness` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Sickness` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Sickness` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Sickness` table. All the data in the column will be lost.
  - You are about to drop the column `breakEnd` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `breakStart` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `profilId` on the `Volunteer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cat_id]` on the table `Adoption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cat_number]` on the table `Cat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chip_id]` on the table `Cat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profil_id]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profil_id]` on the table `Volunteer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cat_id` to the `Adoption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profil_id` to the `Adoption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profil_id` to the `BlacklistHistoric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `Care` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_number` to the `Cat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `CatVolunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteer_id` to the `CatVolunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `has_animals_at_home` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_stock_feed` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profil_id` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `MediaCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `NewsCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `news_id` to the `NewsCat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `Placement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `host_id` to the `Placement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteer_id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat_id` to the `Sickness` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sickness` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Sickness` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `profil_id` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormType_new" AS ENUM ('ADOPTION_SPECIFIC', 'ADOPTION_FLEXIBLE', 'VOLUNTEER', 'HOST', 'COLAB', 'OTHER');
ALTER TABLE "Form" ALTER COLUMN "type" TYPE "FormType_new" USING ("type"::text::"FormType_new");
ALTER TYPE "FormType" RENAME TO "FormType_old";
ALTER TYPE "FormType_new" RENAME TO "FormType";
DROP TYPE "public"."FormType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Adoption" DROP CONSTRAINT "Adoption_catId_fkey";

-- DropForeignKey
ALTER TABLE "Adoption" DROP CONSTRAINT "Adoption_profilId_fkey";

-- DropForeignKey
ALTER TABLE "BlacklistHistoric" DROP CONSTRAINT "BlacklistHistoric_profilId_fkey";

-- DropForeignKey
ALTER TABLE "Care" DROP CONSTRAINT "Care_catId_fkey";

-- DropForeignKey
ALTER TABLE "CatVolunteer" DROP CONSTRAINT "CatVolunteer_catId_fkey";

-- DropForeignKey
ALTER TABLE "CatVolunteer" DROP CONSTRAINT "CatVolunteer_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Host" DROP CONSTRAINT "Host_profilId_fkey";

-- DropForeignKey
ALTER TABLE "MediaCat" DROP CONSTRAINT "MediaCat_catId_fkey";

-- DropForeignKey
ALTER TABLE "NewsCat" DROP CONSTRAINT "NewsCat_catId_fkey";

-- DropForeignKey
ALTER TABLE "NewsCat" DROP CONSTRAINT "NewsCat_newsId_fkey";

-- DropForeignKey
ALTER TABLE "Placement" DROP CONSTRAINT "Placement_catId_fkey";

-- DropForeignKey
ALTER TABLE "Placement" DROP CONSTRAINT "Placement_hostId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "Sickness" DROP CONSTRAINT "Sickness_catId_fkey";

-- DropForeignKey
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_profilId_fkey";

-- DropIndex
DROP INDEX "Adoption_catId_key";

-- DropIndex
DROP INDEX "Cat_catNumber_key";

-- DropIndex
DROP INDEX "Cat_chipId_key";

-- DropIndex
DROP INDEX "Host_profilId_key";

-- DropIndex
DROP INDEX "Sickness_catId_idx";

-- DropIndex
DROP INDEX "Volunteer_profilId_key";

-- AlterTable
ALTER TABLE "Adoption" DROP COLUMN "catId",
DROP COLUMN "profilId",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "profil_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "BlacklistHistoric" DROP COLUMN "profilId",
ADD COLUMN     "profil_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Care" DROP COLUMN "catId",
ADD COLUMN     "cat_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "birthDate",
DROP COLUMN "catNumber",
DROP COLUMN "chipId",
DROP COLUMN "hairLength",
DROP COLUMN "isAlreadySterilized",
DROP COLUMN "isDeworming",
DROP COLUMN "isFivTest",
DROP COLUMN "isIdentify",
DROP COLUMN "isOkCat",
DROP COLUMN "isOkChild",
DROP COLUMN "isOkDog",
DROP COLUMN "isOutside",
DROP COLUMN "isSterilize",
DROP COLUMN "isVisible",
ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "cat_number" VARCHAR(8) NOT NULL,
ADD COLUMN     "chip_id" VARCHAR(255),
ADD COLUMN     "hair_length" "HairLength",
ADD COLUMN     "is_already_sterilized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deworming" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_fiv_test" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_identify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_ok_cat" BOOLEAN DEFAULT false,
ADD COLUMN     "is_ok_child" BOOLEAN DEFAULT false,
ADD COLUMN     "is_ok_dog" BOOLEAN DEFAULT false,
ADD COLUMN     "is_outside" BOOLEAN DEFAULT false,
ADD COLUMN     "is_sterilize" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CatVolunteer" DROP CONSTRAINT "CatVolunteer_pkey",
DROP COLUMN "catId",
DROP COLUMN "volunteerId",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "volunteer_id" UUID NOT NULL,
ADD CONSTRAINT "CatVolunteer_pkey" PRIMARY KEY ("cat_id", "volunteer_id");

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "assignedToId",
ADD COLUMN     "assigned_to_id" UUID,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "data" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "breakEnd",
DROP COLUMN "breakStart",
DROP COLUMN "isAvailable",
DROP COLUMN "isStockFeed",
DROP COLUMN "is_animals-at-home",
DROP COLUMN "numberOfCatsAtHome",
DROP COLUMN "numberOfDogsAtHome",
DROP COLUMN "otherAnimalsAtHome",
DROP COLUMN "outside_desciption",
DROP COLUMN "profilId",
DROP COLUMN "stopActivity",
ADD COLUMN     "break_end" TIMESTAMP(3),
ADD COLUMN     "break_start" TIMESTAMP(3),
ADD COLUMN     "has_animals_at_home" BOOLEAN NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_stock_feed" BOOLEAN NOT NULL,
ADD COLUMN     "number_of_cats_at_home" INTEGER,
ADD COLUMN     "number_of_dogs_at_home" INTEGER,
ADD COLUMN     "other_animals_at_home" TEXT,
ADD COLUMN     "outside_description" TEXT,
ADD COLUMN     "profil_id" UUID NOT NULL,
ADD COLUMN     "stop_activity" TEXT;

-- AlterTable
ALTER TABLE "MediaCat" DROP COLUMN "catId",
DROP COLUMN "fille",
DROP COLUMN "focalPointX",
DROP COLUMN "focalPointY",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "file" VARCHAR(255),
ADD COLUMN     "focal_point_x" INTEGER,
ADD COLUMN     "focal_point_y" INTEGER;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "mediaUrl",
ADD COLUMN     "media_url" TEXT;

-- AlterTable
ALTER TABLE "NewsCat" DROP CONSTRAINT "NewsCat_pkey",
DROP COLUMN "catId",
DROP COLUMN "newsId",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "news_id" UUID NOT NULL,
ADD CONSTRAINT "NewsCat_pkey" PRIMARY KEY ("news_id", "cat_id");

-- AlterTable
ALTER TABLE "Placement" DROP COLUMN "catId",
DROP COLUMN "endDate",
DROP COLUMN "hostId",
DROP COLUMN "startDate",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "end_date" DATE,
ADD COLUMN     "host_id" UUID NOT NULL,
ADD COLUMN     "start_date" DATE;

-- AlterTable
ALTER TABLE "Profil" DROP COLUMN "birthDate",
ADD COLUMN     "birth_date" DATE;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "volunteerId",
ADD COLUMN     "volunteer_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Sickness" DROP CONSTRAINT "Sickness_pkey",
DROP COLUMN "catId",
DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "cat_id" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Sickness_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "breakEnd",
DROP COLUMN "breakStart",
DROP COLUMN "profilId",
ADD COLUMN     "break_end" TIMESTAMP(3),
ADD COLUMN     "break_start" TIMESTAMP(3),
ADD COLUMN     "profil_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Adoption_cat_id_key" ON "Adoption"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cat_cat_number_key" ON "Cat"("cat_number");

-- CreateIndex
CREATE UNIQUE INDEX "Cat_chip_id_key" ON "Cat"("chip_id");

-- CreateIndex
CREATE INDEX "Form_type_idx" ON "Form"("type");

-- CreateIndex
CREATE INDEX "Form_status_idx" ON "Form"("status");

-- CreateIndex
CREATE INDEX "Form_assigned_to_id_idx" ON "Form"("assigned_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "Host_profil_id_key" ON "Host"("profil_id");

-- CreateIndex
CREATE INDEX "Sickness_cat_id_idx" ON "Sickness"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_profil_id_key" ON "Volunteer"("profil_id");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistHistoric" ADD CONSTRAINT "BlacklistHistoric_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sickness" ADD CONSTRAINT "Sickness_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsCat" ADD CONSTRAINT "NewsCat_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsCat" ADD CONSTRAINT "NewsCat_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteer" ADD CONSTRAINT "CatVolunteer_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteer" ADD CONSTRAINT "CatVolunteer_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adoption" ADD CONSTRAINT "Adoption_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adoption" ADD CONSTRAINT "Adoption_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Care" ADD CONSTRAINT "Care_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
