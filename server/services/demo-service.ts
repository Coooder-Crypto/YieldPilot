import type { Prisma, SnapshotSource } from "@prisma/client";

import { prisma } from "@/server/db/client";

function getSnapshotSource(): SnapshotSource {
  return process.env.SUI_NETWORK === "mainnet" ? "SUI_MAINNET" : "SUI_TESTNET";
}

function defaultPolicyData() {
  return {
    objective: "BALANCED" as const,
    allocations: {
      ecosystem: { base: 0.5, min: 0.3, max: 0.7 },
      buyback: { base: 0.3, min: 0.1, max: 0.5 },
      reserve: { base: 0.2, min: 0.1, max: 0.4 },
    } as Prisma.InputJsonValue,
    rules: [
      {
        id: "cap_high_shift_to_reserve",
        if: { metric: "instantCapUtilization", op: ">", value: 0.8 },
        then: { bucket: "reserve", delta: 0.1 },
      },
    ] as Prisma.InputJsonValue,
    guards: {
      maxTransferPerEpoch: 50000,
      treasuryFloor: 200000,
      whitelist: [],
    } as Prisma.InputJsonValue,
    execution: { mode: "proposal_only", epochHours: 24 } as Prisma.InputJsonValue,
    metrics: ["runwayDays", "netMint24h", "claimableYield"] as Prisma.InputJsonValue,
  };
}

function defaultSnapshotData() {
  return {
    tvlUsdc: 12000000,
    supply: 11500000,
    mint24h: 180000,
    redeem24h: 92000,
    claimableYield: 32000,
    instantCapUsed: 4200000,
    instantCapTotal: 6000000,
    yieldRateTrend: 0.0125,
    treasuryBalance: 780000,
    source: getSnapshotSource(),
  };
}

export async function resetDemoData() {
  await prisma.$transaction(async (tx) => {
    await tx.proposal.deleteMany();
    await tx.plan.deleteMany();
    await tx.policy.deleteMany();
    await tx.snapshot.deleteMany();

    await tx.policy.create({
      data: {
        version: 1,
        isActive: true,
        ...defaultPolicyData(),
      },
    });

    await tx.snapshot.create({
      data: defaultSnapshotData(),
    });
  });
}

