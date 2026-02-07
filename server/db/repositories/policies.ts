import type { Prisma, Objective } from "@prisma/client";

import { prisma } from "@/server/db/client";

type CreatePolicyInput = {
  version: number;
  objective: Objective;
  allocations: Prisma.InputJsonValue;
  rules: Prisma.InputJsonValue;
  guards: Prisma.InputJsonValue;
  execution: Prisma.InputJsonValue;
  metrics: Prisma.InputJsonValue;
  isActive?: boolean;
};

export async function createPolicy(input: CreatePolicyInput) {
  return prisma.policy.create({ data: input });
}

export async function getActivePolicy() {
  return prisma.policy.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });
}

export async function listPolicies() {
  return prisma.policy.findMany({
    orderBy: [{ version: "desc" }],
  });
}
