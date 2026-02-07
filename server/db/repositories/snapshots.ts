import type { SnapshotSource } from "@prisma/client";

import { prisma } from "@/server/db/client";

type CreateSnapshotInput = {
  tvlUsdc: number;
  supply: number;
  mint24h: number;
  redeem24h: number;
  claimableYield: number;
  instantCapUsed: number;
  instantCapTotal: number;
  yieldRateTrend?: number | null;
  treasuryBalance?: number | null;
  source: SnapshotSource;
};

export async function createSnapshot(input: CreateSnapshotInput) {
  return prisma.snapshot.create({ data: input });
}

export async function getLatestSnapshot() {
  return prisma.snapshot.findFirst({
    orderBy: { createdAt: "desc" },
  });
}
