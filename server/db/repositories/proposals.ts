import type { ProposalStatus, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/client";

type CreateProposalInput = {
  planId: string;
  actions: Prisma.InputJsonValue;
  payload: Prisma.InputJsonValue;
  status?: ProposalStatus;
};

export async function createProposal(input: CreateProposalInput) {
  return prisma.proposal.create({ data: input });
}

export async function listProposals() {
  return prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
}
