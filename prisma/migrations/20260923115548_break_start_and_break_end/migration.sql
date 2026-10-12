-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "breakEnd" TIMESTAMP(3),
ADD COLUMN     "breakStart" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "breakEnd" TIMESTAMP(3),
ADD COLUMN     "breakStart" TIMESTAMP(3);
