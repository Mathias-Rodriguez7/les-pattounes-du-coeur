-- CreateEnum
CREATE TYPE "InfoDocumentCategory" AS ENUM ('GUIDE', 'CONTRACT', 'HEALTH', 'ADOPTION', 'OTHER');

-- CreateTable
CREATE TABLE "InfoDocument" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" "InfoDocumentCategory" NOT NULL,
    "file_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoDocument_file_id_key" ON "InfoDocument"("file_id");

-- CreateIndex
CREATE INDEX "InfoDocument_category_idx" ON "InfoDocument"("category");

-- AddForeignKey
ALTER TABLE "InfoDocument" ADD CONSTRAINT "InfoDocument_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
