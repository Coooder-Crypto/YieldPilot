-- CreateEnum
CREATE TYPE "Objective" AS ENUM ('GROWTH', 'DEFENSE', 'BALANCED');

-- CreateEnum
CREATE TYPE "SnapshotSource" AS ENUM ('SUI_MAINNET', 'SUI_TESTNET');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'PROPOSED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PROPOSED', 'EXECUTED');

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objective" "Objective" NOT NULL,
    "allocations" JSONB NOT NULL,
    "rules" JSONB NOT NULL,
    "guards" JSONB NOT NULL,
    "execution" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tvlUsdc" DOUBLE PRECISION NOT NULL,
    "supply" DOUBLE PRECISION NOT NULL,
    "mint24h" DOUBLE PRECISION NOT NULL,
    "redeem24h" DOUBLE PRECISION NOT NULL,
    "claimableYield" DOUBLE PRECISION NOT NULL,
    "instantCapUsed" DOUBLE PRECISION NOT NULL,
    "instantCapTotal" DOUBLE PRECISION NOT NULL,
    "yieldRateTrend" DOUBLE PRECISION,
    "treasuryBalance" DOUBLE PRECISION,
    "source" "SnapshotSource" NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "policyId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "bucketAmounts" JSONB NOT NULL,
    "triggeredRules" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" TEXT NOT NULL,
    "actions" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PROPOSED',

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Policy_isActive_idx" ON "Policy"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_version_key" ON "Policy"("version");

-- CreateIndex
CREATE INDEX "Snapshot_createdAt_idx" ON "Snapshot"("createdAt");

-- CreateIndex
CREATE INDEX "Plan_policyId_idx" ON "Plan"("policyId");

-- CreateIndex
CREATE INDEX "Plan_snapshotId_idx" ON "Plan"("snapshotId");

-- CreateIndex
CREATE INDEX "Plan_status_idx" ON "Plan"("status");

-- CreateIndex
CREATE INDEX "Proposal_planId_idx" ON "Proposal"("planId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
