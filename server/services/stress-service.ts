import { computeRiskScore } from "@/lib/risk/computeRiskScore";
import { runStressTest } from "@/lib/stress/runStressTest";
import type { StressScenario } from "@/lib/stress/types";
import { getPolicyById, getSnapshotById } from "@/server/db/repositories";

export const defaultStressScenarios: StressScenario[] = [
  {
    id: "apy_down_50",
    label: "APY Down 50%",
    apyShockPct: -0.5,
    redeemShockMultiplier: 1,
    capUtilizationTarget: 0.75,
  },
  {
    id: "redeem_2x",
    label: "Redeem 2x",
    apyShockPct: 0,
    redeemShockMultiplier: 2,
    capUtilizationTarget: 0.82,
  },
  {
    id: "cap_90",
    label: "Cap Utilization 90%",
    apyShockPct: -0.2,
    redeemShockMultiplier: 1.3,
    capUtilizationTarget: 0.9,
  },
];

export async function runStressTestReport(policyId: string, snapshotId: string) {
  const [policy, snapshot] = await Promise.all([getPolicyById(policyId), getSnapshotById(snapshotId)]);
  if (!policy) {
    throw new Error(`Policy not found: ${policyId}`);
  }
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${snapshotId}`);
  }

  const scenarioResults = runStressTest({
    snapshot: {
      id: snapshot.id,
      claimableYield: snapshot.claimableYield,
      mint24h: snapshot.mint24h,
      redeem24h: snapshot.redeem24h,
      instantCapUsed: snapshot.instantCapUsed,
      instantCapTotal: snapshot.instantCapTotal,
      treasuryBalance: snapshot.treasuryBalance,
    },
    scenarios: defaultStressScenarios,
  });

  const riskReport = computeRiskScore({ scenarioResults });

  return {
    policy: {
      id: policy.id,
      version: policy.version,
      objective: policy.objective,
    },
    snapshot: {
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      source: snapshot.source,
      claimableYield: snapshot.claimableYield,
      treasuryBalance: snapshot.treasuryBalance,
    },
    scenarioResults,
    riskReport,
  };
}

