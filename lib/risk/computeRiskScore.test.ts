import assert from "node:assert/strict";
import test from "node:test";

import { computeRiskScore } from "@/lib/risk/computeRiskScore";
import type { StressScenarioResult } from "@/lib/stress/types";

const highRiskInput: StressScenarioResult[] = [
  {
    scenario: {
      id: "stress",
      label: "stress",
      apyShockPct: -0.5,
      redeemShockMultiplier: 2,
      capUtilizationTarget: 0.92,
    },
    preSnapshot: {
      id: "a",
      claimableYield: 30000,
      mint24h: 100000,
      redeem24h: 80000,
      instantCapUsed: 4200000,
      instantCapTotal: 6000000,
      treasuryBalance: 600000,
    },
    postSnapshot: {
      id: "a",
      claimableYield: 15000,
      mint24h: 100000,
      redeem24h: 200000,
      instantCapUsed: 5520000,
      instantCapTotal: 6000000,
      treasuryBalance: 600000,
    },
    runwayBeforeDays: 30,
    runwayAfterDays: 6,
    runwayDeltaDays: -24,
    capUtilizationAfter: 0.92,
    riskSignals: ["Runway below 30 days", "Cap utilization above 90%"],
  },
];

test("computeRiskScore classifies high risk scenarios", () => {
  const report = computeRiskScore({ scenarioResults: highRiskInput });
  assert.equal(report.level, "HIGH");
  assert.ok(report.score >= 70);
});

test("computeRiskScore is deterministic", () => {
  const a = computeRiskScore({ scenarioResults: highRiskInput });
  const b = computeRiskScore({ scenarioResults: highRiskInput });
  assert.deepEqual(a, b);
});

