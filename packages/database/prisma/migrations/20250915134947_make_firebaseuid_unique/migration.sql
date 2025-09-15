/*
  Warnings:

  - A unique constraint covering the columns `[firebaseUid]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Profile_firebaseUid_key" ON "public"."Profile"("firebaseUid");
