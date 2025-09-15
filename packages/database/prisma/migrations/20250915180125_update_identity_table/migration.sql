-- CreateTable
CREATE TABLE "public"."Identity" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_provider_providerId_key" ON "public"."Identity"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "public"."Identity" ADD CONSTRAINT "Identity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
