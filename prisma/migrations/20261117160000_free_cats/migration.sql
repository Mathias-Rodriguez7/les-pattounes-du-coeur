-- Chats libres : attrapés, stérilisés, relâchés (statut FREE + leurs infos dans FreeCatInfo)

-- CreateEnum
CREATE TYPE "SterilizationPayer" AS ENUM ('ASSO', 'MONTPELLIER', 'JUVIGNAC', 'LATTES', 'SAINT_CLEMENT_DE_RIVIERE', 'SAINT_JEAN_DE_VEDAS', 'OTHER');

-- AlterTable : le N° Pattounes devient facultatif (un chat libre n'en a pas toujours), et le tatouage
ALTER TABLE "Cat" ALTER COLUMN "cat_number" DROP NOT NULL,
ADD COLUMN     "tattoo_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "Veterinarian" ADD COLUMN     "is_city_partner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FreeCatInfo" (
    "cat_id" UUID NOT NULL,
    "payer" "SterilizationPayer" NOT NULL,
    "payer_other" VARCHAR(255),
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10),
    "district" "District",
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "feeder_name" VARCHAR(255) NOT NULL,
    "feeder_contact" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "converted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeCatInfo_pkey" PRIMARY KEY ("cat_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cat_tattoo_id_key" ON "Cat"("tattoo_id");

-- AddForeignKey
ALTER TABLE "FreeCatInfo" ADD CONSTRAINT "FreeCatInfo_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les partenaires de la mairie de Montpellier déjà dans la liste
UPDATE "Veterinarian" SET "is_city_partner" = true
WHERE "name" IN ('City Véto Port Marianne', 'Clinique vétérinaire Les Tonnelles');

-- Les cliniques qui manquaient (adresse et téléphone à compléter depuis la page Vétérinaires)
INSERT INTO "Veterinarian" ("id", "category", "name", "doctors", "area", "is_city_partner", "updatedAt") VALUES
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire Vet''Ecusson', NULL, 'Montpellier', true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire de la Pompignane', 'SCP Rosa Cabezuelo', 'Montpellier / Pompignane', true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'PARTNER', 'Clinique Vétocia Montpellier', NULL, 'Montpellier', false, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire de l''Aiguelongue', NULL, 'Montpellier / Aiguelongue', false, CURRENT_TIMESTAMP);
