CREATE TABLE IF NOT EXISTS "ClientUsage" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "amount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClientUsage_clientId_period_resource_key"
  ON "ClientUsage" ("clientId", "period", "resource");
