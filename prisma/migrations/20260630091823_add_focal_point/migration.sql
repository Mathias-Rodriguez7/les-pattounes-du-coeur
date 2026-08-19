-- CreateEnum
CREATE TYPE "FocalPoint" AS ENUM ('TOP', 'MID', 'BOT');

-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "focalPoint" "FocalPoint" DEFAULT 'MID';
