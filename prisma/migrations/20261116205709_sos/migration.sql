-- CreateEnum
CREATE TYPE "SosStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "SosCategory" AS ENUM ('GIVEN', 'FOUND', 'TREATED', 'STERILIZED');

-- CreateEnum
CREATE TYPE "SosSource" AS ENUM ('WEBSITE', 'PHONE', 'EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "SosDismissReason" AS ENUM ('DECEASED', 'NOT_FOUND', 'FALSE_ALARM', 'OTHER');

-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "sos_id" UUID;

-- CreateTable
CREATE TABLE "Sos" (
    "id" UUID NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "SosSource" NOT NULL DEFAULT 'WEBSITE',
    "status" "SosStatus" NOT NULL DEFAULT 'NEW',
    "category" "SosCategory",
    "reporter_first_name" VARCHAR(100) NOT NULL,
    "reporter_last_name" VARCHAR(100) NOT NULL,
    "reporter_phone" VARCHAR(30),
    "reporter_email" VARCHAR(255),
    "address" VARCHAR(500),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "handled_by_id" UUID,
    "handled_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "dismiss_reason" "SosDismissReason",
    "dismiss_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sos_status_idx" ON "Sos"("status");

-- CreateIndex
CREATE INDEX "Sos_handled_by_id_idx" ON "Sos"("handled_by_id");

-- CreateIndex
CREATE INDEX "Cat_sos_id_idx" ON "Cat"("sos_id");

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_sos_id_fkey" FOREIGN KEY ("sos_id") REFERENCES "Sos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sos" ADD CONSTRAINT "Sos_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
