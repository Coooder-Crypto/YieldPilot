import type { StressScenarioResult } from "@/lib/stress/types";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RiskReport = {
  score: number;
  level: RiskLevel;
  topSignals: string[];
  recommendations: string[];
};

type ComputeRiskInput = {
  scenarioResults: StressScenarioResult[];
};

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function computeRiskScore(input: ComputeRiskInput): RiskReport {
  const { scenarioResults } = input;
  if (scenarioResults.length === 0) {
    return {
      score: 0,
      level: "LOW",
      topSignals: [],
      recommendations: [],
    };
  }

  const worstRunway = Math.min(...scenarioResults.map((item) => item.runwayAfterDays));
  const worstRunwayDropRatio = Math.max(
    ...scenarioResults.map((item) => {
      if (item.runwayBeforeDays <= 0) return 1;
      return Math.max(0, (item.runwayBeforeDays - item.runwayAfterDays) / item.runwayBeforeDays);
    }),
  );
  const worstCap = Math.max(...scenarioResults.map((item) => item.capUtilizationAfter));
  const allSignals = uniqueStrings(scenarioResults.flatMap((item) => item.riskSignals));

  let score = 0;
  if (worstRunway < 14) score += 40;
  else if (worstRunway < 30) score += 28;
  else if (worstRunway < 60) score += 15;

  if (worstRunwayDropRatio > 0.6) score += 25;
  else if (worstRunwayDropRatio > 0.4) score += 16;
  else if (worstRunwayDropRatio > 0.2) score += 8;

  if (worstCap >= 0.9) score += 25;
  else if (worstCap >= 0.8) score += 15;
  else if (worstCap >= 0.7) score += 8;

  score = Math.min(100, Math.round(score));
  const level: RiskLevel = score >= 70 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";

  const recommendations: string[] = [];
  if (worstRunway < 30 || worstRunwayDropRatio > 0.4) {
    recommendations.push("Increase reserve allocation by 10%-20% to protect runway.");
  }
  if (worstCap >= 0.85) {
    recommendations.push("Lower aggressive distribution until cap utilization returns below 80%.");
  }
  if (allSignals.includes("Claimable yield dropped by more than 40%")) {
    recommendations.push("Reduce discretionary spending bucket and tighten maxTransferPerEpoch.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Current policy is resilient under tested scenarios; keep monitoring.");
  }

  return {
    score,
    level,
    topSignals: allSignals.slice(0, 5),
    recommendations,
  };
}

