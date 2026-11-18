-- Plusieurs personnes sur un dossier : renforts sur un SOS, admins sur une candidature
-- bénévole ou colab

-- CreateTable
CREATE TABLE "SosHelper" (
    "sos_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SosHelper_pkey" PRIMARY KEY ("sos_id","volunteer_id")
);

-- CreateTable
CREATE TABLE "FormAssignee" (
    "form_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAssignee_pkey" PRIMARY KEY ("form_id","volunteer_id")
);

-- CreateIndex
CREATE INDEX "SosHelper_volunteer_id_idx" ON "SosHelper"("volunteer_id");

-- CreateIndex
CREATE INDEX "FormAssignee_volunteer_id_idx" ON "FormAssignee"("volunteer_id");

-- AddForeignKey
ALTER TABLE "SosHelper" ADD CONSTRAINT "SosHelper_sos_id_fkey" FOREIGN KEY ("sos_id") REFERENCES "Sos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosHelper" ADD CONSTRAINT "SosHelper_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignee" ADD CONSTRAINT "FormAssignee_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignee" ADD CONSTRAINT "FormAssignee_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les candidatures bénévole / colab déjà attribuées : la personne devient la première à les suivre
INSERT INTO "FormAssignee" ("form_id", "volunteer_id")
SELECT "id", "assigned_to_id" FROM "Form"
WHERE "type" IN ('VOLUNTEER', 'COLAB') AND "assigned_to_id" IS NOT NULL;

-- … et ces deux types n'utilisent plus que FormAssignee (une seule source)
UPDATE "Form" SET "assigned_to_id" = NULL WHERE "type" IN ('VOLUNTEER', 'COLAB');
