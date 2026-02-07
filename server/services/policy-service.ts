import type { Objective, Prisma } from "@prisma/client";

import type { PolicyFormInput } from "@/lib/schemas/policy-form";
import { createVersionedActivePolicy } from "@/server/db/repositories";
import { generatePolicyWithRetry } from "@/server/services/policy-generator";

function mapObjectiveToDb(value: PolicyFormInput["objective"]): Objective {
  if (value === "growth") return "GROWTH";
  if (value === "defense") return "DEFENSE";
  return "BALANCED";
}

export async function createPolicyFromForm(input: PolicyFormInput) {
  const generated = await generatePolicyWithRetry(input);
  const payload = generated.policy;

  const created = await createVersionedActivePolicy({
    objective: mapObjectiveToDb(payload.objective),
    allocations: payload.allocations as Prisma.InputJsonValue,
    rules: payload.rules as Prisma.InputJsonValue,
    guards: payload.guards as Prisma.InputJsonValue,
    execution: payload.execution as Prisma.InputJsonValue,
    metrics: payload.metrics as Prisma.InputJsonValue,
  });

  return {
    policy: created,
    generation: {
      mode: generated.mode,
      retries: generated.retries,
    },
  };
}
