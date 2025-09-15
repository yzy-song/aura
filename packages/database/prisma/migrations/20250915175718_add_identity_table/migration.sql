/*
  Warnings:

  - You are about to drop the column `firebaseUid` on the `Profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Profile_firebaseUid_key";

-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "firebaseUid";
