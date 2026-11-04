-- DropForeignKey
ALTER TABLE "BlacklistHistoric" DROP CONSTRAINT "BlacklistHistoric_profil_id_fkey";

-- AlterTable
ALTER TABLE "BlacklistHistoric" ALTER COLUMN "profil_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BlacklistHistoric" ADD CONSTRAINT "BlacklistHistoric_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "Profil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
