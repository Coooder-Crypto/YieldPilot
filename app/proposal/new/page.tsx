import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyJsonButton } from "@/app/proposal/new/copy-json-button";
import { saveProposalAction } from "@/app/proposal/new/actions";
import { stringifyJson } from "@/lib/utils/json";
import { getPolicyById } from "@/server/db/repositories";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AllocationMap = Record<string, { base: number; min: number; max: number }>;

function toNumber(value: string | string[] | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function ProposalNewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sourcePolicyId = typeof params.sourcePolicyId === "string" ? params.sourcePolicyId : "";
  const targetPolicyId = typeof params.targetPolicyId === "string" ? params.targetPolicyId : "";
  const snapshotId = typeof params.snapshotId === "string" ? params.snapshotId : "";
  if (!sourcePolicyId || !targetPolicyId || !snapshotId) {
    notFound();
  }

  const [source, target] = await Promise.all([getPolicyById(sourcePolicyId), getPolicyById(targetPolicyId)]);
  if (!source || !target) {
    notFound();
  }

  const sourceAlloc = source.allocations as AllocationMap;
  const targetAlloc = target.allocations as AllocationMap;
  const keys = Array.from(new Set([...Object.keys(sourceAlloc), ...Object.keys(targetAlloc)])).sort();
  const diffs = keys
    .map((key) => ({
      key,
      before: sourceAlloc[key]?.base ?? 0,
      after: targetAlloc[key]?.base ?? 0,
      delta: (targetAlloc[key]?.base ?? 0) - (sourceAlloc[key]?.base ?? 0),
    }))
    .filter((item) => item.before !== item.after);

  const riskScore = toNumber(params.riskScore, 0);
  const riskLevel = typeof params.riskLevel === "string" ? params.riskLevel : "UNKNOWN";

  const proposalJson = stringifyJson({
    type: "POLICY_UPDATE_PROPOSAL",
    sourcePolicyId: source.id,
    sourceVersion: source.version,
    targetPolicyId: target.id,
    targetVersion: target.version,
    risk: {
      score: riskScore,
      level: riskLevel,
    },
    allocationDiffs: diffs,
    status: "draft",
    requiredApprovals: ["treasury_admin", "multisig"],
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Proposal Draft</p>
          <h1 className="mt-2 text-2xl font-semibold">
            Policy v{source.version} {"->"} v{target.version}
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Generated from stress test report. Review diffs and export JSON for governance signing.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Risk Context
            </h2>
            <p className="text-sm text-slate-200">Score: {riskScore}</p>
            <p className="text-sm text-slate-200">Level: {riskLevel}</p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Allocation Diff
            </h2>
            <div className="space-y-2">
              {diffs.map((diff) => (
                <div key={diff.key} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-300">{diff.key}</span>
                  <span className="text-slate-100">
                    {(diff.before * 100).toFixed(1)}% {"->"} {(diff.after * 100).toFixed(1)}% ({diff.delta >= 0 ? "+" : ""}
                    {(diff.delta * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Proposal JSON</h2>
            <CopyJsonButton value={proposalJson} />
          </div>
          <pre className="overflow-x-auto text-xs text-slate-200">{proposalJson}</pre>
        </article>

        <div className="flex gap-4">
          <form action={saveProposalAction}>
            <input type="hidden" name="sourcePolicyId" value={source.id} />
            <input type="hidden" name="targetPolicyId" value={target.id} />
            <input type="hidden" name="snapshotId" value={snapshotId} />
            <input type="hidden" name="riskScore" value={riskScore} />
            <input type="hidden" name="riskLevel" value={riskLevel} />
            <button
              type="submit"
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Save Proposal
            </button>
          </form>
          <Link href="/stress-test" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to stress test
          </Link>
          <Link href="/proposals" className="text-sm text-cyan-300 hover:text-cyan-200">
            Proposal history
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}
