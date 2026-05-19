-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "assignedToId" UUID,
ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
