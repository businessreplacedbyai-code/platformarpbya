-- CreateTable
CREATE TABLE "OutreachLead" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "email" TEXT,
    "emailSource" TEXT,
    "messageSubject" TEXT,
    "messageBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "sentAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutreachLead_placeId_key" ON "OutreachLead"("placeId");

-- CreateIndex
CREATE INDEX "OutreachLead_city_status_idx" ON "OutreachLead"("city", "status");

-- CreateIndex
CREATE INDEX "OutreachLead_status_createdAt_idx" ON "OutreachLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OutreachLead_category_city_idx" ON "OutreachLead"("category", "city");
