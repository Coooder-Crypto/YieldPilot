import { parsePolicy, type PolicyInput } from "@/lib/schemas/policy";
import type { RiskReport } from "@/lib/risk/computeRiskScore";

export type PolicyDiffItem = {
  key: string;
  before: number;
  after: number;
};

export type RecommendationResult = {
  recommendedPolicy: PolicyInput;
  diffs: PolicyDiffItem[];
};

function round4(value: number): number {
  return Number(value.toFixed(4));
}

function normalize(values: Record<string, number>): Record<string, number> {
  const keys = Object.keys(values);
  const total = keys.reduce((sum, key) => sum + Math.max(0, values[key]), 0);
  if (total <= 0) {
    const equal = 1 / keys.length;
    return keys.reduce<Record<string, number>>((acc, key) => {
      acc[key] = equal;
      return acc;
    }, {});
  }

  return keys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = Math.max(0, values[key]) / total;
    return acc;
  }, {});
}

export function applyStressRecommendation(
  policy: PolicyInput,
  riskReport: RiskReport,
): RecommendationResult {
  const next = JSON.parse(JSON.stringify(policy)) as PolicyInput;
  const hasReserve = Boolean(next.allocations.reserve);
  const hasEcosystem = Boolean(next.allocations.ecosystem);
  const hasBuyback = Boolean(next.allocations.buyback);

  const beforeBase: Record<string, number> = {};
  for (const [key, value] of Object.entries(next.allocations)) {
    beforeBase[key] = value.base;
  }

  const mutableBase: Record<string, number> = { ...beforeBase };

  if (riskReport.level === "HIGH") {
    if (hasReserve) mutableBase.reserve += 0.15;
    if (hasEcosystem) mutableBase.ecosystem -= 0.08;
    if (hasBuyback) mutableBase.buyback -= 0.07;
    next.guards.maxTransferPerEpoch = round4(next.guards.maxTransferPerEpoch * 0.85);
  } else if (riskReport.level === "MEDIUM") {
    if (hasReserve) mutableBase.reserve += 0.08;
    if (hasEcosystem) mutableBase.ecosystem -= 0.04;
    if (hasBuyback) mutableBase.buyback -= 0.04;
    next.guards.maxTransferPerEpoch = round4(next.guards.maxTransferPerEpoch * 0.92);
  } else {
    if (hasReserve) mutableBase.reserve += 0.02;
    if (hasEcosystem) mutableBase.ecosystem -= 0.01;
    if (hasBuyback) mutableBase.buyback -= 0.01;
  }

  const normalized = normalize(mutableBase);
  for (const [key, value] of Object.entries(next.allocations)) {
    const base = round4(normalized[key]);
    value.base = base;
    value.min = Math.min(value.min, base);
    value.max = Math.max(value.max, base);
  }

  const diffs: PolicyDiffItem[] = Object.keys(next.allocations)
    .sort()
    .map((key) => ({
      key: `${key}.base`,
      before: round4(beforeBase[key]),
      after: round4(next.allocations[key].base),
    }))
    .filter((item) => item.before !== item.after);

  return {
    recommendedPolicy: parsePolicy(next),
    diffs,
  };
}

