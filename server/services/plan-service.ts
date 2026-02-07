import type { Prisma } from "@prisma/client";

import { computeExecutionPlan } from "@/lib/engine/computeExecutionPlan";
import { createPlan, getPlanById, getPolicyById, getSnapshotById } from "@/server/db/repositories";

function mapObjective(value: "GROWTH" | "DEFENSE" | "BALANCED"): "growth" | "defense" | "balanced" {
  if (value === "GROWTH") return "growth";
  if (value === "DEFENSE") return "defense";
  return "balanced";
}

export async function createPlanFromPolicyAndSnapshot(
  policyId: string,
  snapshotId: string,
) {
  const [policy, snapshot] = await Promise.all([getPolicyById(policyId), getSnapshotById(snapshotId)]);

  if (!policy) {
    throw new Error(`Policy not found: ${policyId}`);
  }
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${snapshotId}`);
  }

  const parsedPolicy = {
    objective: mapObjective(policy.objective),
    allocations: policy.allocations as Record<string, { base: number; min: number; max: number }>,
    rules: policy.rules as Array<{
      id: string;
      if: { metric: string; op: ">" | ">=" | "<" | "<=" | "=="; value: number };
      then: { bucket: string; delta: number };
    }>,
    guards: policy.guards as {
      maxTransferPerEpoch: number;
      treasuryFloor: number;
      whitelist: string[];
    },
    execution: policy.execution as { mode: "proposal_only" | "auto_execute"; epochHours: number },
    metrics: policy.metrics as string[],
  };

  const bucketDestinations = Object.keys(parsedPolicy.allocations).reduce<Record<string, string>>(
    (acc, key) => {
      acc[key] = `${key}_vault`;
      return acc;
    },
    {},
  );

  const computed = computeExecutionPlan({
    policyId: policy.id,
    policy: parsedPolicy,
    snapshot: {
      id: snapshot.id,
      claimableYield: snapshot.claimableYield,
      mint24h: snapshot.mint24h,
      redeem24h: snapshot.redeem24h,
      instantCapUsed: snapshot.instantCapUsed,
      instantCapTotal: snapshot.instantCapTotal,
      treasuryBalance: snapshot.treasuryBalance,
    },
    addressConfig: {
      treasuryVault: "treasury_vault",
      bucketDestinations,
    },
  });

  const saved = await createPlan({
    policyId: computed.policyId,
    snapshotId: computed.snapshotId,
    budget: computed.budget,
    bucketAmounts: computed.bucketAmounts as Prisma.InputJsonValue,
    triggeredRules: computed.triggeredRules as Prisma.InputJsonValue,
    explanation: computed.explanation,
    status: "DRAFT",
  });

  return {
    plan: saved,
    computed,
  };
}

export async function getComputedPlanByPlanId(planId: string) {
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const parsedPolicy = {
    objective: mapObjective(plan.policy.objective),
    allocations: plan.policy.allocations as Record<string, { base: number; min: number; max: number }>,
    rules: plan.policy.rules as Array<{
      id: string;
      if: { metric: string; op: ">" | ">=" | "<" | "<=" | "=="; value: number };
      then: { bucket: string; delta: number };
    }>,
    guards: plan.policy.guards as {
      maxTransferPerEpoch: number;
      treasuryFloor: number;
      whitelist: string[];
    },
    execution: plan.policy.execution as { mode: "proposal_only" | "auto_execute"; epochHours: number },
    metrics: plan.policy.metrics as string[],
  };

  const bucketDestinations = Object.keys(parsedPolicy.allocations).reduce<Record<string, string>>(
    (acc, key) => {
      acc[key] = `${key}_vault`;
      return acc;
    },
    {},
  );

  const computed = computeExecutionPlan({
    policyId: plan.policyId,
    policy: parsedPolicy,
    snapshot: {
      id: plan.snapshot.id,
      claimableYield: plan.snapshot.claimableYield,
      mint24h: plan.snapshot.mint24h,
      redeem24h: plan.snapshot.redeem24h,
      instantCapUsed: plan.snapshot.instantCapUsed,
      instantCapTotal: plan.snapshot.instantCapTotal,
      treasuryBalance: plan.snapshot.treasuryBalance,
    },
    addressConfig: {
      treasuryVault: "treasury_vault",
      bucketDestinations,
    },
  });

  return { plan, computed };
}
