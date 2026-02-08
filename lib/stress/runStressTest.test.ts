import assert from "node:assert/strict";
import test from "node:test";

import { runStressTest } from "@/lib/stress/runStressTest";

const snapshot = {
  id: "s1",
  claimableYield: 30000,
  mint24h: 120000,
  redeem24h: 90000,
  instantCapUsed: 4200000,
  instantCapTotal: 6000000,
  treasuryBalance: 700000,
};

const scenarios = [
  {
    id: "apy_down_50",
    label: "APY -50%",
    apyShockPct: -0.5,
    redeemShockMultiplier: 1,
    capUtilizationTarget: 0.7,
  },
  {
    id: "redeem_2x",
    label: "Redeem x2",
    apyShockPct: 0,
    redeemShockMultiplier: 2,
    capUtilizationTarget: 0.75,
  },
];

test("runStressTest is deterministic for same input", () => {
  const a = runStressTest({ snapshot, scenarios });
  const b = runStressTest({ snapshot, scenarios });
  assert.deepEqual(a, b);
});

test("runStressTest applies shocks correctly", () => {
  const [apyScenario] = runStressTest({ snapshot, scenarios });
  assert.equal(apyScenario.postSnapshot.claimableYield, 15000);
});

