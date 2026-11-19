-- Bloc 4 : le circuit de publication d'un chat, et le récapitulatif hebdomadaire

-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "publication_refusal_note" VARCHAR(500),
ADD COLUMN     "publication_refused_at" TIMESTAMP(3),
ADD COLUMN     "publication_requested_at" TIMESTAMP(3),
ADD COLUMN     "publication_requested_by_id" UUID;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "weekly_digest" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_publication_requested_by_id_fkey" FOREIGN KEY ("publication_requested_by_id") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
