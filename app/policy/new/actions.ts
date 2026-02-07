"use server";

import { redirect } from "next/navigation";

import { parsePolicyForm } from "@/lib/schemas/policy-form";
import { createPolicyFromForm } from "@/server/services/policy-service";

export async function createPolicyAction(formData: FormData) {
  const rawWhitelist = String(formData.get("whitelist") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const parsed = parsePolicyForm({
    objective: formData.get("objective"),
    epochHours: formData.get("epochHours"),
    budgetCap: formData.get("budgetCap"),
    treasuryFloor: formData.get("treasuryFloor"),
    riskLevel: formData.get("riskLevel"),
    whitelist: rawWhitelist,
  });

  const result = await createPolicyFromForm(parsed);
  redirect(`/policy/${result.policy.id}`);
}
