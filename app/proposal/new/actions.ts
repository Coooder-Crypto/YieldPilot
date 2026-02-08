"use server";

import { redirect } from "next/navigation";

import { createPolicyUpdateProposal } from "@/server/services/proposal-service";

export async function saveProposalAction(formData: FormData) {
  const sourcePolicyId = String(formData.get("sourcePolicyId") ?? "");
  const targetPolicyId = String(formData.get("targetPolicyId") ?? "");
  const snapshotId = String(formData.get("snapshotId") ?? "");
  const riskScore = Number(formData.get("riskScore") ?? 0);
  const riskLevel = String(formData.get("riskLevel") ?? "UNKNOWN");

  if (!sourcePolicyId || !targetPolicyId || !snapshotId) {
    throw new Error("sourcePolicyId, targetPolicyId and snapshotId are required");
  }

  const proposal = await createPolicyUpdateProposal({
    sourcePolicyId,
    targetPolicyId,
    snapshotId,
    riskScore: Number.isFinite(riskScore) ? riskScore : 0,
    riskLevel,
  });

  redirect(`/proposals/${proposal.id}`);
}

