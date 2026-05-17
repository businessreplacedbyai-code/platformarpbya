-- CreateTable
CREATE TABLE "AgentPurchaseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "agentSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentPurchaseRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cui" TEXT,
    "address" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'onboarding',
    "contractSignedAt" DATETIME,
    "goLiveAt" DATETIME,
    "plan" TEXT,
    "setupFee" INTEGER,
    "monthlyFee" INTEGER,
    "passwordHash" TEXT,
    "mustSetPassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "intakeToken" TEXT NOT NULL,
    "intakeSubmittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("address", "businessName", "contactName", "contractSignedAt", "createdAt", "cui", "email", "goLiveAt", "id", "intakeSubmittedAt", "intakeToken", "monthlyFee", "phone", "plan", "setupFee", "slug", "status", "updatedAt", "website") SELECT "address", "businessName", "contactName", "contractSignedAt", "createdAt", "cui", "email", "goLiveAt", "id", "intakeSubmittedAt", "intakeToken", "monthlyFee", "phone", "plan", "setupFee", "slug", "status", "updatedAt", "website" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");
CREATE UNIQUE INDEX "Client_intakeToken_key" ON "Client"("intakeToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
