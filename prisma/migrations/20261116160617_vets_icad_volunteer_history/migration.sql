-- CreateEnum
CREATE TYPE "VeterinarianCategory" AS ENUM ('PARTNER', 'EMERGENCY', 'SPECIALIST');

-- AlterTable
ALTER TABLE "Adoption" ADD COLUMN     "icad_transferred_at" DATE;

-- AlterTable
ALTER TABLE "Care" ADD COLUMN     "veterinarian_id" UUID;

-- CreateTable
CREATE TABLE "Veterinarian" (
    "id" UUID NOT NULL,
    "category" "VeterinarianCategory" NOT NULL DEFAULT 'PARTNER',
    "name" VARCHAR(255) NOT NULL,
    "doctors" VARCHAR(255),
    "specialty" VARCHAR(255),
    "area" VARCHAR(100),
    "address" VARCHAR(255),
    "phone" VARCHAR(30),
    "website" VARCHAR(255),
    "hours" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veterinarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatVolunteerHistory" (
    "id" UUID NOT NULL,
    "cat_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatVolunteerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatVolunteerHistory_volunteer_id_idx" ON "CatVolunteerHistory"("volunteer_id");

-- CreateIndex
CREATE INDEX "CatVolunteerHistory_cat_id_idx" ON "CatVolunteerHistory"("cat_id");

-- CreateIndex
CREATE INDEX "Care_veterinarian_id_idx" ON "Care"("veterinarian_id");

-- AddForeignKey
ALTER TABLE "Care" ADD CONSTRAINT "Care_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "Veterinarian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteerHistory" ADD CONSTRAINT "CatVolunteerHistory_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteerHistory" ADD CONSTRAINT "CatVolunteerHistory_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les vétérinaires de la « Liste des vétérinaires partenaires Pattounes » (version 05.2025).
-- Ensuite, la liste se gère depuis l'appli (page Vétérinaires).
INSERT INTO "Veterinarian" ("id", "category", "name", "doctors", "specialty", "area", "address", "phone", "website", "hours", "notes") VALUES
  (gen_random_uuid(), 'PARTNER', 'City Véto Port Marianne', 'Dr MENARD', NULL, 'Montpellier / Port Marianne', '191 rue Shirin Ebadi 34000 Montpellier', '04 67 20 05 20', 'http://www.city-veto-portmarianne.fr/', E'Lundi au vendredi 8h30-13h et 14h-19h\nSamedi 9h-13h et 14h-17h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire Les Tonnelles', 'Dr MARIE', NULL, 'Montpellier / Celleneuve', '235 avenue Paul Bringuier 34080 Montpellier', '04 67 10 74 74', 'http://www.cliniqueveterinairedestonnelles.com/', E'Lundi au vendredi 8h30-12h et 14h-19h\nSamedi 9h-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire du Corum', 'Dr GILLES et Dr COIGNET', 'Dermatologie (Dr COIGNET)', 'Montpellier / Corum', '3 avenue Jean Mermoz 34000 Montpellier', '04 67 60 31 66', 'https://clinique-veterinaire-du-corum.com/', E'Lundi au vendredi 8h-12h et 14h-19h\nSamedi 8h30-12h30', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire Aube Rouge', 'Dr Frédéric GRANIER', NULL, 'Castelnau-le-Lez', 'Résidence Europe Elysée, 720 route de Nîmes 34170 Castelnau-le-Lez', '04 67 04 49 54', NULL, E'Lundi au vendredi 8h30-12h et 14h30-19h\nSamedi 9h-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire Impériale', 'Dr Adrien ROSAS', NULL, 'Baillargues', '98 route Impériale 34670 Baillargues', '04 67 40 02 02', 'https://www.groupeveterinairedecamargue.fr/cliniques-veterinaires/clinique-veterinaire-baillargues/', E'Lundi au vendredi 8h30-12h et 14h30-19h\nSamedi 8h30-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique Les Mascottes', 'Dr Catherine CUCHET-SUBSOL', NULL, 'Saint-Drézéry', '247 avenue de la Croix de Mounié 34160 Saint-Drézéry', '04 99 61 40 52', 'https://veterinairesaintdrezery.fr/', E'Lundi au vendredi (fermé le jeudi) 9h-12h et 15h-19h\nSamedi 9h-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique vétérinaire LAK', 'Dr Laurent KUENTZ, Dr Lise BEAUMAL et Dr Yann TOUSSAINT', 'Fractures (Dr KUENTZ)', 'Boirargues', '909 avenue des Platanes 34970 Lattes', '04 11 93 49 51', NULL, E'Lundi au vendredi 9h-12h et 15h-19h\nSamedi 9h-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Vétérinaire de Maurin', 'Dr Xavier GAUTHERON', 'Chirurgie orthopédique', 'Lattes / Maurin', '20 rue du Clos des Entreprises 34970 Lattes', '09 81 87 08 67', 'https://www.veterinairemaurin.fr/', E'Lundi, mercredi, vendredi 8h30-12h et 15h-19h\nMardi, jeudi 8h30-19h\nSamedi 8h30-12h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Vétérinaires de Villeneuve-lès-Maguelone', 'Dr Aurélie GEORGES et Dr Sébastien MARNOT', 'Ophtalmologie (Dr GEORGES)', 'Villeneuve-lès-Maguelone', '15 avenue de Palavas 34750 Villeneuve-lès-Maguelone', '04 67 69 32 12', 'https://www.veterinaire-maguelone.fr/', E'Lundi au vendredi 8h30-12h et 14h30-19h\nSamedi 9h-12h et 14h30-17h', NULL),
  (gen_random_uuid(), 'PARTNER', 'Clinique de Balaruc-les-Bains', 'Dr STROOT', NULL, 'Balaruc-les-Bains', 'Route de Sète 34540 Balaruc-les-Bains', '04 67 36 01 15', NULL, E'Lundi au vendredi 8h30-12h et 14h-19h\nSamedi 8h30-12h', NULL),
  (gen_random_uuid(), 'EMERGENCY', 'Vét''Urgences', NULL, NULL, 'Montpellier', '157 rue Claude Balbastre 34000 Montpellier', '04 67 45 46 84', NULL, NULL, 'En cas d''extrême urgence la nuit ou le week-end. Les urgences sont très chères : à réserver aux urgences vitales.'),
  (gen_random_uuid(), 'SPECIALIST', 'Cabinet de la Clémentide', 'Dr Typhaine ROUSSEAU', 'Ophtalmologie', 'Saint-Clément-de-Rivière', '33 impasse Cabernet 34980 Saint-Clément-de-Rivière', '04 67 40 60 51', NULL, NULL, 'Uniquement sur orientation d''un autre vétérinaire.'),
  (gen_random_uuid(), 'SPECIALIST', 'Okivét - Clinique vétérinaire Montpellier Millénaire', NULL, 'Échographies cardiaques', 'Montpellier / Millénaire', '12 rue Claude Chappe 34000 Montpellier', '04 67 22 40 26', NULL, NULL, 'Uniquement sur orientation d''un autre vétérinaire, et seulement si la clinique du Corum ne peut pas faire l''échographie.'),
  (gen_random_uuid(), 'SPECIALIST', 'Centre Hospitalier Vétérinaire Languedocia', NULL, 'Neurologie', 'Montpellier', '470 rue Favre de Saint-Castor 34080 Montpellier', '04 67 75 14 44', NULL, NULL, 'Uniquement sur orientation d''un autre vétérinaire.'),
  (gen_random_uuid(), 'SPECIALIST', 'Clinique vétérinaire du Port', 'Dr SULTAN', 'Ostéopathie, acupuncture, homéopathie', 'La Grande-Motte', '333 avenue Robert Fages 34280 La Grande-Motte', '04 67 29 21 10', NULL, NULL, 'Uniquement sur orientation d''un autre vétérinaire. Le Dr SULTAN consulte aussi à la clinique du Grand Cèdre (Sommières).'),
  (gen_random_uuid(), 'SPECIALIST', 'Clinique vétérinaire du Grand Cèdre', 'Dr SULTAN', 'Ostéopathie, acupuncture, homéopathie', 'Sommières', '30 route de Saussines 30250 Sommières', '04 66 35 05 05', NULL, NULL, 'Uniquement sur orientation d''un autre vétérinaire.');
