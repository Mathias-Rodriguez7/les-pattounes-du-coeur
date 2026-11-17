-- Le foyer ne compte plus que les adultes et les enfants (retour des clientes).
-- Avant de supprimer les colonnes, les ados et les bébés déjà saisis sont comptés comme enfants.
UPDATE "Host"
SET "children_at_home" = COALESCE("children_at_home", 0) + COALESCE("teens_at_home", 0) + COALESCE("babies_at_home", 0)
WHERE "teens_at_home" IS NOT NULL OR "babies_at_home" IS NOT NULL;

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "babies_at_home",
DROP COLUMN "teens_at_home";
