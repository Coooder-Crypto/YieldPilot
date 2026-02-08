import type { Prisma } from "@prisma/client";

import { buildPolicyUpdateProposal } from "@/lib/proposal/buildProposal";
import {
  createPlan,
  createProposal,
  getPolicyById,
  getSnapshotById,
  getProposalById,
  listProposals,
} from "@/server/db/repositories";

type CreatePolicyUpdateProposalInput = {
  sourcePolicyId: string;
  targetPolicyId: string;
  snapshotId: string;
  riskScore: number;
  riskLevel: string;
};

type AllocationMap = Record<string, { base: number; min: number; max: number }>;

export async function createPolicyUpdateProposal(input: CreatePolicyUpdateProposalInput) {
  const [source, target, snapshot] = await Promise.all([
    getPolicyById(input.sourcePolicyId),
    getPolicyById(input.targetPolicyId),
    getSnapshotById(input.snapshotId),
  ]);

  if (!source) throw new Error(`Source policy not found: ${input.sourcePolicyId}`);
  if (!target) throw new Error(`Target policy not found: ${input.targetPolicyId}`);
  if (!snapshot) throw new Error(`Snapshot not found: ${input.snapshotId}`);

  const built = buildPolicyUpdateProposal({
    sourcePolicyId: source.id,
    sourceVersion: source.version,
    targetPolicyId: target.id,
    targetVersion: target.version,
    riskScore: input.riskScore,
    riskLevel: input.riskLevel,
    sourceAllocations: source.allocations as AllocationMap,
    targetAllocations: target.allocations as AllocationMap,
  });

  const syntheticPlan = await createPlan({
    policyId: target.id,
    snapshotId: snapshot.id,
    budget: 0,
    bucketAmounts: {} as Prisma.InputJsonValue,
    triggeredRules: [
      {
        reason: "Policy update proposal generated from stress-test recommendation",
        riskScore: input.riskScore,
        riskLevel: input.riskLevel,
      },
    ] as Prisma.InputJsonValue,
    explanation: `Proposal drafted for policy v${source.version} -> v${target.version}`,
    status: "PROPOSED",
  });

  const proposal = await createProposal({
    planId: syntheticPlan.id,
    actions: built.actions as Prisma.InputJsonValue,
    payload: {
      metadata: built.metadata,
      payload: built.payload,
    } as Prisma.InputJsonValue,
    status: "PROPOSED",
  });

  return proposal;
}

export async function getProposalWithContext(proposalId: string) {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    throw new Error(`Proposal not found: ${proposalId}`);
  }
  return proposal;
}

export async function listProposalsWithContext() {
  return listProposals();
}

