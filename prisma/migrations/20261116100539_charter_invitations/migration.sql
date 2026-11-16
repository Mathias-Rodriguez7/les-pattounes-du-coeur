/*
  Warnings:

  - You are about to drop the column `isFlexibleDispatcher` on the `Volunteer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationKind" AS ENUM ('HOST', 'VOLUNTEER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InfoDocumentCategory" ADD VALUE 'FA_CHARTER';
ALTER TYPE "InfoDocumentCategory" ADD VALUE 'VOLUNTEER_CHARTER';

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "isFlexibleDispatcher";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "kind" "InvitationKind" NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "form_id" UUID,
    "created_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharterAcceptance" (
    "id" UUID NOT NULL,
    "profil_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharterAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_hash_key" ON "Invitation"("token_hash");

-- CreateIndex
CREATE INDEX "Invitation_kind_idx" ON "Invitation"("kind");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "CharterAcceptance_document_id_idx" ON "CharterAcceptance"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "CharterAcceptance_profil_id_document_id_key" ON "CharterAcceptance"("profil_id", "document_id");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharterAcceptance" ADD CONSTRAINT "CharterAcceptance_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharterAcceptance" ADD CONSTRAINT "CharterAcceptance_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "InfoDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
