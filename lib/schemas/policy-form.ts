import { z } from "zod";

export const policyFormSchema = z.object({
  objective: z.enum(["growth", "defense", "balanced"]),
  epochHours: z.coerce.number().int().positive().max(168),
  budgetCap: z.coerce.number().positive(),
  treasuryFloor: z.coerce.number().nonnegative(),
  riskLevel: z.enum(["low", "medium", "high"]),
  whitelist: z.array(z.string().min(1)).default([]),
});

export type PolicyFormInput = z.infer<typeof policyFormSchema>;

export function parsePolicyForm(input: unknown): PolicyFormInput {
  return policyFormSchema.parse(input);
}
