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

export async function getPolicyById(id: string) {
  return prisma.policy.findUnique({
    where: { id },
  });
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

export async function getNextPolicyVersion() {
  const latest = await prisma.policy.findFirst({
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return (latest?.version ?? 0) + 1;
}

export async function createVersionedActivePolicy(input: Omit<CreatePolicyInput, "version">) {
  return prisma.$transaction(async (tx) => {
    const latest = await tx.policy.findFirst({
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;

    await tx.policy.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return tx.policy.create({
      data: {
        ...input,
        version,
        isActive: true,
      },
    });
  });
}
