-- 1. Les adoptions en cours deviennent des essais : on RENOMME la valeur,
--    les lignes existantes la suivent sans rien perdre
ALTER TYPE "AdoptionStatus" RENAME VALUE 'ACTIVE' TO 'TRIAL';

-- 2. La nouvelle valeur
ALTER TYPE "AdoptionStatus" ADD VALUE 'FINAL';

-- 3. La valeur par défaut
ALTER TABLE "Adoption" ALTER COLUMN "status" SET DEFAULT 'TRIAL';

-- 4. Les dates. trial_ends_at est obligatoire, mais des adoptions existent déjà :
--    on l'ajoute vide, on la remplit, PUIS on la rend obligatoire
ALTER TABLE "Adoption" ADD COLUMN "trial_ends_at" DATE;
ALTER TABLE "Adoption" ADD COLUMN "finalized_at" DATE;
UPDATE "Adoption" SET "trial_ends_at" = ("createdAt" + INTERVAL '6 months')::date;
ALTER TABLE "Adoption" ALTER COLUMN "trial_ends_at" SET NOT NULL;

-- 5. L'index de la liste « à finaliser »
CREATE INDEX "Adoption_status_trial_ends_at_idx" ON "Adoption"("status", "trial_ends_at");