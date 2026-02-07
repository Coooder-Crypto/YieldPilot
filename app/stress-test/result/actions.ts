"use server";

import { redirect } from "next/navigation";

import { generateRecommendationDraft } from "@/server/services/recommendation-service";

export async function createRecommendationDraftAction(formData: FormData) {
  const policyId = String(formData.get("policyId") ?? "");
  const snapshotId = String(formData.get("snapshotId") ?? "");

  if (!policyId || !snapshotId) {
    throw new Error("policyId and snapshotId are required");
  }

  const result = await generateRecommendationDraft(policyId, snapshotId);
  redirect(
    `/proposal/new?sourcePolicyId=${encodeURIComponent(result.sourcePolicy.id)}&targetPolicyId=${encodeURIComponent(
      result.targetPolicy.id,
    )}&snapshotId=${encodeURIComponent(snapshotId)}&riskScore=${result.riskReport.score}&riskLevel=${encodeURIComponent(
      result.riskReport.level,
    )}`,
  );
}
