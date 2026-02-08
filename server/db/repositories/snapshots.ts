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

export async function getSnapshotById(id: string) {
  return prisma.snapshot.findUnique({
    where: { id },
  });
}

export async function getLatestSnapshot() {
  return prisma.snapshot.findFirst({
    orderBy: { createdAt: "desc" },
  });
}

export async function listSnapshots() {
  return prisma.snapshot.findMany({
    orderBy: { createdAt: "desc" },
  });
}
