import { parseExecutionPlan, type ExecutionPlanInput } from "@/lib/schemas/execution-plan";
import type { PolicyInput } from "@/lib/schemas/policy";

type SnapshotInput = {
  id: string;
  claimableYield: number;
  mint24h: number;
  redeem24h: number;
  instantCapUsed: number;
  instantCapTotal: number;
  treasuryBalance?: number | null;
};

type AddressConfig = {
  treasuryVault: string;
  bucketDestinations: Record<string, string>;
};

type ComputeInput = {
  policyId: string;
  policy: PolicyInput;
  snapshot: SnapshotInput;
  addressConfig: AddressConfig;
};

type RatioMap = Record<string, number>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round6(value: number): number {
  return Number(value.toFixed(6));
}

function evaluateCondition(
  op: ">" | ">=" | "<" | "<=" | "==",
  left: number,
  right: number,
): boolean {
  if (op === ">") return left > right;
  if (op === ">=") return left >= right;
  if (op === "<") return left < right;
  if (op === "<=") return left <= right;
  return left === right;
}

function boundedNormalize(
  raw: RatioMap,
  minMap: RatioMap,
  maxMap: RatioMap,
): RatioMap {
  const keys = Object.keys(raw).sort();
  const result: RatioMap = {};
  const locked = new Set<string>();
  let remaining = 1;

  for (const key of keys) {
    result[key] = 0;
  }

  for (let i = 0; i < keys.length; i++) {
    const unlocked = keys.filter((key) => !locked.has(key));
    if (unlocked.length === 0) break;

    const rawSum = unlocked.reduce((sum, key) => sum + Math.max(0, raw[key]), 0);
    const candidate: RatioMap = {};
    for (const key of unlocked) {
      candidate[key] =
        rawSum === 0 ? remaining / unlocked.length : (Math.max(0, raw[key]) / rawSum) * remaining;
    }

    let anyViolation = false;
    for (const key of unlocked) {
      const min = minMap[key];
      const max = maxMap[key];
      if (candidate[key] < min) {
        result[key] = min;
        remaining -= min;
        locked.add(key);
        anyViolation = true;
      } else if (candidate[key] > max) {
        result[key] = max;
        remaining -= max;
        locked.add(key);
        anyViolation = true;
      }
    }

    if (!anyViolation) {
      for (const key of unlocked) {
        result[key] = candidate[key];
      }
      remaining = 0;
      break;
    }

    if (remaining <= 0) break;
  }

  if (remaining !== 0) {
    const unlocked = keys.filter((key) => !locked.has(key));
    if (unlocked.length > 0) {
      const share = remaining / unlocked.length;
      for (const key of unlocked) {
        result[key] = clamp(result[key] + share, minMap[key], maxMap[key]);
      }
    }
  }

  const finalSum = keys.reduce((sum, key) => sum + result[key], 0);
  if (finalSum <= 0) {
    const equal = 1 / keys.length;
    for (const key of keys) {
      result[key] = equal;
    }
  } else {
    for (const key of keys) {
      result[key] = result[key] / finalSum;
    }
  }

  return result;
}

export function computeExecutionPlan(input: ComputeInput): ExecutionPlanInput {
  const { policyId, policy, snapshot, addressConfig } = input;
  const allocationKeys = Object.keys(policy.allocations).sort();

  const capUtilization =
    snapshot.instantCapTotal > 0 ? snapshot.instantCapUsed / snapshot.instantCapTotal : 0;
  const metrics: Record<string, number> = {
    claimableYield: snapshot.claimableYield,
    instantCapUtilization: capUtilization,
    netMint24h: snapshot.mint24h - snapshot.redeem24h,
    mint24h: snapshot.mint24h,
    redeem24h: snapshot.redeem24h,
    treasuryBalance: snapshot.treasuryBalance ?? 0,
  };

  const maxTransfer = policy.guards.maxTransferPerEpoch;
  let budget = Math.min(snapshot.claimableYield, maxTransfer);
  const treasuryBalance = snapshot.treasuryBalance ?? Number.POSITIVE_INFINITY;
  const remainingAfterTransfer = treasuryBalance - budget;
  if (remainingAfterTransfer < policy.guards.treasuryFloor) {
    const allowed = Math.max(0, treasuryBalance - policy.guards.treasuryFloor);
    budget = Math.min(budget, allowed);
  }
  budget = round6(Math.max(0, budget));

  const ratios: RatioMap = {};
  const minMap: RatioMap = {};
  const maxMap: RatioMap = {};
  for (const key of allocationKeys) {
    const conf = policy.allocations[key];
    ratios[key] = conf.base;
    minMap[key] = conf.min;
    maxMap[key] = conf.max;
  }

  const triggeredRules: Array<{ ruleId: string; reason: string }> = [];
  for (const rule of policy.rules) {
    const current = metrics[rule.if.metric];
    if (current === undefined) continue;
    const matched = evaluateCondition(rule.if.op, current, rule.if.value);
    if (!matched) continue;

    const bucket = rule.then.bucket;
    if (!(bucket in ratios)) continue;
    ratios[bucket] = ratios[bucket] + rule.then.delta;
    triggeredRules.push({
      ruleId: rule.id,
      reason: `${rule.if.metric} ${rule.if.op} ${rule.if.value} (actual: ${round6(current)})`,
    });
  }

  const normalized = boundedNormalize(ratios, minMap, maxMap);
  const bucketAmounts: Record<string, number> = {};
  let allocated = 0;

  for (let i = 0; i < allocationKeys.length; i++) {
    const key = allocationKeys[i];
    if (i === allocationKeys.length - 1) {
      bucketAmounts[key] = round6(Math.max(0, budget - allocated));
    } else {
      const amount = round6(budget * normalized[key]);
      bucketAmounts[key] = amount;
      allocated += amount;
    }
  }

  const actions: ExecutionPlanInput["actions"] = [];
  if (budget > 0) {
    actions.push({
      type: "CLAIM_YIELD",
      to: addressConfig.treasuryVault,
      amount: budget,
    });

    for (const key of allocationKeys) {
      const amount = bucketAmounts[key];
      if (amount <= 0) continue;
      actions.push({
        type: "TRANSFER",
        token: "USDC",
        from: addressConfig.treasuryVault,
        to: addressConfig.bucketDestinations[key] ?? key,
        amount,
      });
    }
  }

  const explanation = [
    `Budget set to ${budget} based on claimableYield and maxTransferPerEpoch.`,
    triggeredRules.length > 0
      ? `Triggered rules: ${triggeredRules.map((rule) => rule.ruleId).join(", ")}.`
      : "No dynamic rule was triggered.",
    `Generated ${actions.length} actions in proposal-only mode.`,
  ].join(" ");

  return parseExecutionPlan({
    policyId,
    snapshotId: snapshot.id,
    budget,
    bucketAmounts,
    triggeredRules,
    actions,
    explanation,
    status: "draft",
  });
}

