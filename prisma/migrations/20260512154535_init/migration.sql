-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'contact_form',
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
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
    "intakeToken" TEXT NOT NULL,
    "intakeSubmittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClientIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "cui" TEXT,
    "address" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "brandColors" TEXT,
    "toneOfVoice" TEXT,
    "workingHours" TEXT,
    "locations" TEXT,
    "services" TEXT,
    "notOffered" TEXT,
    "mainPhone" TEXT,
    "contactEmail" TEXT,
    "whatsappActive" BOOLEAN NOT NULL DEFAULT false,
    "calendarSystem" TEXT,
    "crmSystem" TEXT,
    "hasGoogleWorkspace" BOOLEAN NOT NULL DEFAULT false,
    "hasMetaBusiness" BOOLEAN NOT NULL DEFAULT false,
    "hasPosErp" BOOLEAN NOT NULL DEFAULT false,
    "hasStripe" BOOLEAN NOT NULL DEFAULT false,
    "euDataOnly" BOOLEAN NOT NULL DEFAULT false,
    "hasMedicalData" BOOLEAN NOT NULL DEFAULT false,
    "regulatedDomain" TEXT,
    "faqText" TEXT,
    "testerName" TEXT,
    "testerPhone" TEXT,
    "testerEmail" TEXT,
    "backupDecisionMaker" TEXT,
    "doNotDisturb" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientIntake_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intakeId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientUpload_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "ClientIntake" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientAgent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "agentSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "configNotes" TEXT,
    "promptOverride" TEXT,
    "goLiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientAgent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImplementationTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" DATETIME,
    "orderIdx" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImplementationTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Client_intakeToken_key" ON "Client"("intakeToken");

-- CreateIndex
CREATE UNIQUE INDEX "ClientIntake_clientId_key" ON "ClientIntake"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAgent_clientId_agentSlug_key" ON "ClientAgent"("clientId", "agentSlug");
