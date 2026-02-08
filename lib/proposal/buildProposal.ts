import { getAppEnv } from "@/lib/env";

type AllocationMap = Record<string, { base: number; min: number; max: number }>;

type BuildPolicyUpdateProposalInput = {
  sourcePolicyId: string;
  sourceVersion: number;
  targetPolicyId: string;
  targetVersion: number;
  riskScore: number;
  riskLevel: string;
  sourceAllocations: AllocationMap;
  targetAllocations: AllocationMap;
};

export type PolicyUpdateAction =
  | {
      type: "UPDATE_ALLOCATION";
      bucket: string;
      from: number;
      to: number;
    }
  | {
      type: "SWITCH_ACTIVE_POLICY";
      fromPolicyId: string;
      toPolicyId: string;
    };

export type PolicyUpdateProposal = {
  metadata: {
    type: "POLICY_UPDATE_PROPOSAL";
    sourcePolicyId: string;
    sourceVersion: number;
    targetPolicyId: string;
    targetVersion: number;
    riskScore: number;
    riskLevel: string;
  };
  actions: PolicyUpdateAction[];
  payload: {
    network: "mainnet" | "testnet";
    txKind: "programmableTransaction";
    module: "yieldpilot::governance";
    commands: Array<Record<string, unknown>>;
  };
};

export function buildPolicyUpdateProposal(input: BuildPolicyUpdateProposalInput): PolicyUpdateProposal {
  const keys = Array.from(
    new Set([...Object.keys(input.sourceAllocations), ...Object.keys(input.targetAllocations)]),
  ).sort();

  const actions: PolicyUpdateAction[] = keys
    .map((bucket) => {
      const from = input.sourceAllocations[bucket]?.base ?? 0;
      const to = input.targetAllocations[bucket]?.base ?? 0;
      if (from === to) return null;
      return {
        type: "UPDATE_ALLOCATION" as const,
        bucket,
        from,
        to,
      };
    })
    .filter((item): item is PolicyUpdateAction => Boolean(item));

  actions.push({
    type: "SWITCH_ACTIVE_POLICY",
    fromPolicyId: input.sourcePolicyId,
    toPolicyId: input.targetPolicyId,
  });

  const env = getAppEnv();
  const payload = {
    network: env.suiNetwork,
    txKind: "programmableTransaction" as const,
    module: "yieldpilot::governance",
    commands: actions.map((action) => {
      if (action.type === "UPDATE_ALLOCATION") {
        return {
          command: "update_allocation",
          args: {
            policyId: input.targetPolicyId,
            bucket: action.bucket,
            from: action.from,
            to: action.to,
          },
        };
      }
      return {
        command: "switch_active_policy",
        args: {
          fromPolicyId: action.fromPolicyId,
          toPolicyId: action.toPolicyId,
        },
      };
    }),
  };

  return {
    metadata: {
      type: "POLICY_UPDATE_PROPOSAL",
      sourcePolicyId: input.sourcePolicyId,
      sourceVersion: input.sourceVersion,
      targetPolicyId: input.targetPolicyId,
      targetVersion: input.targetVersion,
      riskScore: input.riskScore,
      riskLevel: input.riskLevel,
    },
    actions,
    payload,
  };
}

