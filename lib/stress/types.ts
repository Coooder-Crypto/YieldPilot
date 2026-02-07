export type StressScenario = {
  id: string;
  label: string;
  apyShockPct: number;
  redeemShockMultiplier: number;
  capUtilizationTarget?: number;
};

export type StressSnapshot = {
  id: string;
  claimableYield: number;
  mint24h: number;
  redeem24h: number;
  instantCapUsed: number;
  instantCapTotal: number;
  treasuryBalance?: number | null;
};

export type StressScenarioResult = {
  scenario: StressScenario;
  preSnapshot: StressSnapshot;
  postSnapshot: StressSnapshot;
  runwayBeforeDays: number;
  runwayAfterDays: number;
  runwayDeltaDays: number;
  capUtilizationAfter: number;
  riskSignals: string[];
};

