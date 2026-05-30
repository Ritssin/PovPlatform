-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SE', 'SME', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PoVStatus" AS ENUM ('DRAFT', 'ACTIVE', 'AT_RISK', 'COMPLETE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('DRIVER', 'RISK', 'ACTION', 'PRODUCT', 'INDUSTRY');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoV" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL DEFAULT 'SE',
    "customerName" TEXT NOT NULL,
    "customerIndustry" TEXT NOT NULL DEFAULT '',
    "salesEngineer" TEXT NOT NULL DEFAULT '',
    "partnerName" TEXT NOT NULL DEFAULT '',
    "executiveSponsor" TEXT NOT NULL DEFAULT '',
    "opportunityValue" TEXT NOT NULL DEFAULT '',
    "scoreExecutive" INTEGER NOT NULL DEFAULT 3,
    "scoreUseCase" INTEGER NOT NULL DEFAULT 3,
    "scoreUrgency" INTEGER NOT NULL DEFAULT 3,
    "scoreCompetition" INTEGER NOT NULL DEFAULT 3,
    "scoreReadiness" INTEGER NOT NULL DEFAULT 3,
    "scoreAlignment" INTEGER NOT NULL DEFAULT 3,
    "selectedProducts" JSONB NOT NULL DEFAULT '[]',
    "driverItems" JSONB NOT NULL DEFAULT '[]',
    "businessDrivers" TEXT NOT NULL DEFAULT '',
    "riskItems" JSONB NOT NULL DEFAULT '[]',
    "selectedOutcomes" JSONB NOT NULL DEFAULT '[]',
    "planCriteria" JSONB NOT NULL DEFAULT '[]',
    "criteriaEdits" JSONB NOT NULL DEFAULT '{}',
    "customCriteria" JSONB NOT NULL DEFAULT '[]',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "povStartDate" TIMESTAMP(3),
    "povEndDate" TIMESTAMP(3),
    "trackingData" JSONB NOT NULL DEFAULT '{}',
    "actionItems" JSONB NOT NULL DEFAULT '[]',
    "updateLog" JSONB NOT NULL DEFAULT '[]',
    "outcomeSummary" TEXT NOT NULL DEFAULT '',
    "nextSteps" TEXT NOT NULL DEFAULT '',
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "percentValidated" INTEGER NOT NULL DEFAULT 0,
    "criteriaTotal" INTEGER NOT NULL DEFAULT 0,
    "criteriaValidated" INTEGER NOT NULL DEFAULT 0,
    "status" "PoVStatus" NOT NULL DEFAULT 'DRAFT',
    "salesforceOpportunityId" TEXT,
    "vivunPoVId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "businessProblem" TEXT NOT NULL,
    "successCriteria" TEXT NOT NULL,
    "measurement" TEXT NOT NULL,
    "competitiveEdge" TEXT NOT NULL,
    "edgeTags" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteriaIds" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pillar" (
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "vsCompetitors" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pillar_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "type" "LibraryType" NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoV" ADD CONSTRAINT "PoV_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
