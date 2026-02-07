import { z } from "zod";

import { abstractActionSchema } from "@/lib/schemas/common";

export const executionPlanSchema = z.object({
  policyId: z.string().min(1),
  snapshotId: z.string().min(1),
  budget: z.number().nonnegative(),
  bucketAmounts: z.record(z.string().min(1), z.number().nonnegative()),
  triggeredRules: z.array(
    z.object({
      ruleId: z.string().min(1),
      reason: z.string().min(1),
    }),
  ),
  actions: z.array(abstractActionSchema),
  explanation: z.string().min(1),
  status: z.enum(["draft", "proposed", "executed"]).default("draft"),
});

export type ExecutionPlanInput = z.infer<typeof executionPlanSchema>;

export function parseExecutionPlan(input: unknown): ExecutionPlanInput {
  return executionPlanSchema.parse(input);
}
