import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingPolicy = await prisma.policy.findFirst({
    where: { version: 1 },
  });

  if (!existingPolicy) {
    await prisma.policy.create({
      data: {
        version: 1,
        objective: "BALANCED",
        allocations: {
          ecosystem: { base: 0.5, min: 0.3, max: 0.7 },
          buyback: { base: 0.3, min: 0.1, max: 0.5 },
          reserve: { base: 0.2, min: 0.1, max: 0.4 },
        },
        rules: [
          {
            id: "cap_high_shift_to_reserve",
            if: { metric: "instantCapUtilization", op: ">", value: 0.8 },
            then: { bucket: "reserve", delta: 0.1 },
          },
        ],
        guards: {
          maxTransferPerEpoch: 50000,
          treasuryFloor: 200000,
          whitelist: [],
        },
        execution: { mode: "proposal_only", epochHours: 24 },
        metrics: ["runwayDays", "netMint24h", "claimableYield"],
        isActive: true,
      },
    });
  }

  const existingSnapshot = await prisma.snapshot.findFirst();
  if (!existingSnapshot) {
    const source =
      process.env.SUI_NETWORK === "mainnet" ? "SUI_MAINNET" : "SUI_TESTNET";

    await prisma.snapshot.create({
      data: {
        tvlUsdc: 12000000,
        supply: 11500000,
        mint24h: 180000,
        redeem24h: 92000,
        claimableYield: 32000,
        instantCapUsed: 4200000,
        instantCapTotal: 6000000,
        yieldRateTrend: 0.0125,
        treasuryBalance: 780000,
        source,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
