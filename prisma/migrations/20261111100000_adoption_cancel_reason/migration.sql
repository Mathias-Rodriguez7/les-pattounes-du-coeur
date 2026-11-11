-- Pourquoi une adoption a été annulée (retour du chat). Facultatif : colonne vide autorisée,
-- les adoptions existantes ne sont pas touchées.
ALTER TABLE "Adoption" ADD COLUMN "cancel_reason" TEXT;
