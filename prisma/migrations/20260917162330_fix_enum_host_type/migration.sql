/*
  Warnings:

  - The values [PROPIO] on the enum `HostType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HostType_new" AS ENUM ('CLASSIC', 'SOS', 'ADOPT', 'PROPRIO', 'RELAY');
ALTER TABLE "Host" ALTER COLUMN "type" TYPE "HostType_new" USING ("type"::text::"HostType_new");
ALTER TYPE "HostType" RENAME TO "HostType_old";
ALTER TYPE "HostType_new" RENAME TO "HostType";
DROP TYPE "public"."HostType_old";
COMMIT;
