import { z } from "zod";

export const objectiveSchema = z.enum(["growth", "defense", "balanced"]);

export const allocationBucketSchema = z.object({
  base: z.number().min(0).max(1),
  min: z.number().min(0).max(1),
  max: z.number().min(0).max(1),
});

export const conditionSchema = z.object({
  metric: z.string().min(1),
  op: z.enum([">", ">=", "<", "<=", "=="]),
  value: z.number(),
});

export const actionSchema = z.object({
  bucket: z.string().min(1),
  delta: z.number(),
});

export const ruleSchema = z.object({
  id: z.string().min(1),
  if: conditionSchema,
  then: actionSchema,
});

export const guardSchema = z.object({
  maxTransferPerEpoch: z.number().nonnegative(),
  treasuryFloor: z.number().nonnegative(),
  whitelist: z.array(z.string()).default([]),
});

export const executionSchema = z.object({
  mode: z.enum(["proposal_only", "auto_execute"]),
  epochHours: z.number().int().positive(),
});

export const metricSchema = z.array(z.string().min(1)).min(1);

export const abstractActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CLAIM_YIELD"),
    to: z.string().min(1),
    amount: z.union([z.number().positive(), z.literal("ALL")]),
  }),
  z.object({
    type: z.literal("TRANSFER"),
    token: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    amount: z.number().positive(),
  }),
]);
