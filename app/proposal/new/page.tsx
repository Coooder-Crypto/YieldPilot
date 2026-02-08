import Link from "next/link";

import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { AlertIcon, FileListIcon, SparkIcon } from "@/app/components/metric-icons";
import { ArrowTrend, fromRiskLevel, LevelBadge, RiskLights, SegmentMeter, toLevel } from "@/app/components/visual-metrics";
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
  const invalidInput = !sourcePolicyId || !targetPolicyId || !snapshotId;

  const [source, target] = invalidInput
    ? [null, null]
    : await Promise.all([getPolicyById(sourcePolicyId), getPolicyById(targetPolicyId)]);
  if (!source || !target) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="fade-up">
            <FlowStepper current="draft" />
          </div>
          <div className="fade-up delay-1">
            <DemoTip text="This screen is your governance handoff: diff + rationale + payload." />
          </div>
          <ErrorStateCard
            title="Draft Input Missing"
            message="This draft needs source policy, target policy, and snapshot context from stress-test result."
            actions={[
              { label: "Back to Stress Test", href: "/stress-test" },
              { label: "Back to Console", href: "/console" },
            ]}
          />
        </div>
      </main>
    );
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
  const visualRiskLevel = fromRiskLevel(riskLevel);

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
        <div className="fade-up">
          <FlowStepper current="draft" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Confirm the diff, then save proposal to complete the decision loop." />
        </div>
        <div className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Proposal Draft</p>
          <h1 className="mt-2 text-2xl font-semibold">
            Policy v{source.version} {"->"} v{target.version}
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Generated from stress test report. Review diffs and export JSON for governance signing.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <AlertIcon />
              Risk Context
            </h2>
            <div className="flex items-center gap-3">
              <RiskLights level={riskLevel === "HIGH" ? "HIGH" : riskLevel === "MEDIUM" ? "MEDIUM" : "LOW"} />
              <LevelBadge level={visualRiskLevel} />
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={riskScore / 100} />
            </div>
          </article>

          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <SparkIcon />
              Allocation Diff
            </h2>
            <div className="space-y-2">
              {diffs.map((diff) => (
                <div key={diff.key} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="capitalize text-slate-300">{diff.key}</span>
                    <ArrowTrend improving={diff.delta >= 0} />
                  </div>
                  <div className="space-y-2">
                    <SegmentMeter ratio={diff.before} inverse />
                    <SegmentMeter ratio={diff.after} inverse />
                  </div>
                  <div className="mt-2">
                    <LevelBadge level={toLevel(Math.abs(diff.delta), 0.05, 0.12)} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="interactive-card fade-up delay-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <FileListIcon />
              Proposal JSON
            </h2>
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
              className="btn-feedback rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Save Proposal
            </button>
          </form>
          <Link href="/stress-test" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Stress Test
          </Link>
          <Link href="/proposals" className="text-sm text-cyan-300 hover:text-cyan-200">
            Proposal History
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Console
          </Link>
        </div>
      </div>
    </main>
  );
}
