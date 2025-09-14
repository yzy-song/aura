-- CreateTable
CREATE TABLE "public"."AiSummary" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "AiSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSummary_profileId_period_key" ON "public"."AiSummary"("profileId", "period");

-- AddForeignKey
ALTER TABLE "public"."AiSummary" ADD CONSTRAINT "AiSummary_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
