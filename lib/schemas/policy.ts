import { z } from "zod";

import {
  allocationBucketSchema,
  executionSchema,
  guardSchema,
  metricSchema,
  objectiveSchema,
  ruleSchema,
} from "@/lib/schemas/common";

export const policySchema = z.object({
  objective: objectiveSchema,
  allocations: z.record(z.string().min(1), allocationBucketSchema),
  rules: z.array(ruleSchema),
  guards: guardSchema,
  execution: executionSchema,
  metrics: metricSchema,
});

export type PolicyInput = z.infer<typeof policySchema>;

export function parsePolicy(input: unknown): PolicyInput {
  return policySchema.parse(input);
}
