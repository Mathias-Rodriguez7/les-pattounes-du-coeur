-- Les tâches, bloc 2 : « Plus tard », rappel de vaccin (V1), FA indisponible (F5),
-- demande « en cours de traitement » (A3)

-- AlterEnum
ALTER TYPE "FormStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable : la date du rappel d'un vaccin
ALTER TABLE "Care" ADD COLUMN     "next_due_date" DATE;

-- AlterTable : depuis quand une FA n'est plus disponible
ALTER TABLE "Host" ADD COLUMN     "unavailable_since" TIMESTAMP(3);

-- Les FA déjà indisponibles : on part de leur dernière modification
UPDATE "Host" SET "unavailable_since" = "updatedAt" WHERE "is_available" = false;

-- CreateTable
CREATE TABLE "TaskSnooze" (
    "id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "task_id" VARCHAR(100) NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,
    "note" VARCHAR(255),
    "urgency" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSnooze_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskSnooze_volunteer_id_task_id_key" ON "TaskSnooze"("volunteer_id", "task_id");

-- AddForeignKey
ALTER TABLE "TaskSnooze" ADD CONSTRAINT "TaskSnooze_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
