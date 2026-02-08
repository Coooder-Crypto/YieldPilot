import type { Prisma } from "@prisma/client";

import { applyStressRecommendation } from "@/lib/policy/applyRecommendation";
import { parsePolicy } from "@/lib/schemas/policy";
import { createVersionedPolicy, getPolicyById } from "@/server/db/repositories";
import { runStressTestReport } from "@/server/services/stress-service";

function mapObjectiveToDb(value: "growth" | "defense" | "balanced"): "GROWTH" | "DEFENSE" | "BALANCED" {
  if (value === "growth") return "GROWTH";
  if (value === "defense") return "DEFENSE";
  return "BALANCED";
}

function mapObjectiveFromDb(value: "GROWTH" | "DEFENSE" | "BALANCED"): "growth" | "defense" | "balanced" {
  if (value === "GROWTH") return "growth";
  if (value === "DEFENSE") return "defense";
  return "balanced";
}

export async function generateRecommendationDraft(policyId: string, snapshotId: string) {
  const report = await runStressTestReport(policyId, snapshotId);
  const sourcePolicy = await getPolicyById(policyId);
  if (!sourcePolicy) {
    throw new Error(`Policy not found: ${policyId}`);
  }

  const parsed = parsePolicy({
    objective: mapObjectiveFromDb(sourcePolicy.objective),
    allocations: sourcePolicy.allocations,
    rules: sourcePolicy.rules,
    guards: sourcePolicy.guards,
    execution: sourcePolicy.execution,
    metrics: sourcePolicy.metrics,
  });

  const recommendation = applyStressRecommendation(parsed, report.riskReport);

  const created = await createVersionedPolicy({
    objective: mapObjectiveToDb(recommendation.recommendedPolicy.objective),
    allocations: recommendation.recommendedPolicy.allocations as Prisma.InputJsonValue,
    rules: recommendation.recommendedPolicy.rules as Prisma.InputJsonValue,
    guards: recommendation.recommendedPolicy.guards as Prisma.InputJsonValue,
    execution: recommendation.recommendedPolicy.execution as Prisma.InputJsonValue,
    metrics: recommendation.recommendedPolicy.metrics as Prisma.InputJsonValue,
    isActive: false,
  });

  const proposalDraft = {
    type: "POLICY_UPDATE_PROPOSAL",
    sourcePolicyId: sourcePolicy.id,
    sourceVersion: sourcePolicy.version,
    targetPolicyId: created.id,
    targetVersion: created.version,
    rationale: {
      riskScore: report.riskReport.score,
      riskLevel: report.riskReport.level,
      topSignals: report.riskReport.topSignals,
    },
    changes: recommendation.diffs,
    requiredApprovals: ["treasury_admin", "multisig"],
  };

  return {
    sourcePolicy,
    targetPolicy: created,
    riskReport: report.riskReport,
    diffs: recommendation.diffs,
    proposalDraft,
  };
}

