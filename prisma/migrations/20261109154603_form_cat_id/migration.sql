-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "cat_id" UUID;

-- CreateIndex
CREATE INDEX "Form_cat_id_idx" ON "Form"("cat_id");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
