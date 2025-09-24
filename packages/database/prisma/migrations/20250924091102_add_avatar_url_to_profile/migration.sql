/*
  Warnings:

  - You are about to drop the column `avatarId` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "avatarId",
ADD COLUMN     "avatarUrl" TEXT;
