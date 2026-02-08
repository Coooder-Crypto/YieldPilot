import type { StressScenario, StressScenarioResult, StressSnapshot } from "@/lib/stress/types";

type RunStressInput = {
  snapshot: StressSnapshot;
  scenarios: StressScenario[];
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function estimateRunwayDays(snapshot: StressSnapshot): number {
  const treasury = Math.max(0, snapshot.treasuryBalance ?? 0);
  const netOutflow = Math.max(snapshot.redeem24h - snapshot.mint24h, 0);
  if (treasury === 0) return 0;
  if (netOutflow === 0) return 36500;
  return treasury / netOutflow;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyScenario(snapshot: StressSnapshot, scenario: StressScenario): StressSnapshot {
  const claimableYield = Math.max(0, snapshot.claimableYield * (1 + scenario.apyShockPct));
  const redeem24h = Math.max(0, snapshot.redeem24h * scenario.redeemShockMultiplier);
  const capUtilization =
    scenario.capUtilizationTarget ??
    (snapshot.instantCapTotal > 0 ? snapshot.instantCapUsed / snapshot.instantCapTotal : 0);
  const instantCapUsed = snapshot.instantCapTotal * clamp(capUtilization, 0, 1);

  return {
    ...snapshot,
    claimableYield: round2(claimableYield),
    redeem24h: round2(redeem24h),
    instantCapUsed: round2(instantCapUsed),
  };
}

function buildSignals(pre: StressSnapshot, post: StressSnapshot): string[] {
  const signals: string[] = [];
  const runwayBefore = estimateRunwayDays(pre);
  const runwayAfter = estimateRunwayDays(post);

  if (runwayAfter < 30) signals.push("Runway below 30 days");
  if (runwayBefore > 0 && runwayAfter / runwayBefore < 0.6) {
    signals.push("Runway dropped by more than 40%");
  }

  const capAfter = post.instantCapTotal > 0 ? post.instantCapUsed / post.instantCapTotal : 0;
  if (capAfter >= 0.9) signals.push("Cap utilization above 90%");

  if (pre.claimableYield > 0 && post.claimableYield / pre.claimableYield < 0.6) {
    signals.push("Claimable yield dropped by more than 40%");
  }

  if (post.redeem24h > pre.redeem24h * 1.5) {
    signals.push("Redemption pressure increased materially");
  }

  return signals;
}

export function runStressTest(input: RunStressInput): StressScenarioResult[] {
  const { snapshot, scenarios } = input;
  const ordered = [...scenarios].sort((a, b) => a.id.localeCompare(b.id));

  return ordered.map((scenario) => {
    const post = applyScenario(snapshot, scenario);
    const runwayBefore = round2(estimateRunwayDays(snapshot));
    const runwayAfter = round2(estimateRunwayDays(post));
    const capUtilizationAfter =
      post.instantCapTotal > 0 ? round2(post.instantCapUsed / post.instantCapTotal) : 0;

    return {
      scenario,
      preSnapshot: snapshot,
      postSnapshot: post,
      runwayBeforeDays: runwayBefore,
      runwayAfterDays: runwayAfter,
      runwayDeltaDays: round2(runwayAfter - runwayBefore),
      capUtilizationAfter,
      riskSignals: buildSignals(snapshot, post),
    };
  });
}

