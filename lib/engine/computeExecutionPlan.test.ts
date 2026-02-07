import assert from "node:assert/strict";
import test from "node:test";

import { computeExecutionPlan } from "@/lib/engine/computeExecutionPlan";
import { parsePolicy } from "@/lib/schemas/policy";

const samplePolicy = parsePolicy({
  objective: "balanced",
  allocations: {
    ecosystem: { base: 0.5, min: 0.2, max: 0.75 },
    buyback: { base: 0.3, min: 0.1, max: 0.5 },
    reserve: { base: 0.2, min: 0.1, max: 0.6 },
  },
  rules: [
    {
      id: "cap-pressure-increase-reserve",
      if: { metric: "instantCapUtilization", op: ">", value: 0.8 },
      then: { bucket: "reserve", delta: 0.1 },
    },
  ],
  guards: {
    maxTransferPerEpoch: 50000,
    treasuryFloor: 200000,
    whitelist: [],
  },
  execution: {
    mode: "proposal_only",
    epochHours: 24,
  },
  metrics: ["runwayDays", "claimableYield", "capUtilization", "netMint24h"],
});

test("computeExecutionPlan is deterministic for same input", () => {
  const input = {
    policyId: "policy_1",
    policy: samplePolicy,
    snapshot: {
      id: "snapshot_1",
      claimableYield: 32000,
      mint24h: 180000,
      redeem24h: 92000,
      instantCapUsed: 5200000,
      instantCapTotal: 6000000,
      treasuryBalance: 780000,
    },
    addressConfig: {
      treasuryVault: "treasury",
      bucketDestinations: {
        ecosystem: "ecosystem_vault",
        buyback: "buyback_vault",
        reserve: "reserve_vault",
      },
    },
  };

  const run1 = computeExecutionPlan(input);
  const run2 = computeExecutionPlan(input);

  assert.deepEqual(run1, run2);
});

test("computeExecutionPlan enforces treasury floor", () => {
  const result = computeExecutionPlan({
    policyId: "policy_2",
    policy: samplePolicy,
    snapshot: {
      id: "snapshot_2",
      claimableYield: 50000,
      mint24h: 0,
      redeem24h: 0,
      instantCapUsed: 1000,
      instantCapTotal: 10000,
      treasuryBalance: 205000,
    },
    addressConfig: {
      treasuryVault: "treasury",
      bucketDestinations: {
        ecosystem: "ecosystem_vault",
        buyback: "buyback_vault",
        reserve: "reserve_vault",
      },
    },
  });

  assert.equal(result.budget, 5000);
});

