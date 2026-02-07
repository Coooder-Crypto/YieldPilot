import type { PlanStatus, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/client";

type CreatePlanInput = {
  policyId: string;
  snapshotId: string;
  budget: number;
  bucketAmounts: Prisma.InputJsonValue;
  triggeredRules: Prisma.InputJsonValue;
  explanation: string;
  status?: PlanStatus;
};

export async function createPlan(input: CreatePlanInput) {
  return prisma.plan.create({ data: input });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: { policy: true, snapshot: true, proposals: true },
  });
}

export async function listPlans() {
  return prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
  });
}
