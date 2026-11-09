-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "published_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Cat_is_visible_status_published_at_idx" ON "Cat"("is_visible", "status", "published_at");
