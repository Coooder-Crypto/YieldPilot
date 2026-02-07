"use server";

import { redirect } from "next/navigation";

import { createPlanFromPolicyAndSnapshot } from "@/server/services/plan-service";

export async function createPlanAction(formData: FormData) {
  const policyId = String(formData.get("policyId") ?? "");
  const snapshotId = String(formData.get("snapshotId") ?? "");

  if (!policyId || !snapshotId) {
    throw new Error("policyId and snapshotId are required");
  }

  const result = await createPlanFromPolicyAndSnapshot(policyId, snapshotId);
  redirect(`/plan/${result.plan.id}`);
}
