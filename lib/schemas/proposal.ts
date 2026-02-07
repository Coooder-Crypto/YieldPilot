import { z } from "zod";

import { abstractActionSchema } from "@/lib/schemas/common";

export const proposalSchema = z.object({
  planId: z.string().min(1),
  actions: z.array(abstractActionSchema).min(1),
  payload: z.object({
    network: z.enum(["mainnet", "testnet"]),
    txKind: z.string().min(1),
    commands: z.array(z.unknown()),
  }),
  status: z.enum(["proposed", "executed"]).default("proposed"),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

export function parseProposal(input: unknown): ProposalInput {
  return proposalSchema.parse(input);
}
