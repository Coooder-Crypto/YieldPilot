import Link from "next/link";

import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { BoltIcon, FileListIcon } from "@/app/components/metric-icons";
import { LevelBadge, SegmentMeter } from "@/app/components/visual-metrics";
import { CopyJsonButton } from "@/app/proposal/new/copy-json-button";
import { stringifyJson } from "@/lib/utils/json";
import { getProposalWithContext } from "@/server/services/proposal-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await getProposalWithContext(id).catch(() => null);
  if (!proposal) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="fade-up">
            <FlowStepper current="history" />
          </div>
          <div className="fade-up delay-1">
            <DemoTip text="If this appears during demo, recover by opening proposals list and selecting a valid item." />
          </div>
          <ErrorStateCard
            title="Proposal Not Found"
            message="The requested proposal is missing or not accessible in current demo state."
            actions={[
              { label: "Back to Proposals", href: "/proposals" },
              { label: "Back to Console", href: "/console" },
            ]}
          />
        </div>
      </main>
    );
  }

  const actionsJson = stringifyJson(proposal.actions);
  const payloadJson = stringifyJson(proposal.payload);
  const actionCount = Array.isArray(proposal.actions) ? proposal.actions.length : 1;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="fade-up">
          <FlowStepper current="history" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Open actions first, then payload, to explain governance intent before implementation details." />
        </div>
        <div className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Proposal Detail</p>
          <h1 className="mt-2 text-2xl font-semibold">{proposal.id}</h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Status: <LevelBadge level={proposal.status === "EXECUTED" ? "low" : "medium"} />
            </p>
            <p>Policy v{proposal.plan.policy.version}</p>
            <p>Snapshot: {proposal.plan.snapshot.source}</p>
          </div>
        </div>

        <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <BoltIcon />
              Actions
            </h2>
            <CopyJsonButton value={actionsJson} />
          </div>
          <div className="mb-3">
            <SegmentMeter ratio={Math.min(actionCount / 8, 1)} inverse />
          </div>
          <pre className="overflow-x-auto text-xs text-slate-200">{actionsJson}</pre>
        </article>

        <article className="interactive-card fade-up delay-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <FileListIcon />
              Payload
            </h2>
            <CopyJsonButton value={payloadJson} />
          </div>
          <pre className="overflow-x-auto text-xs text-slate-200">{payloadJson}</pre>
        </article>

        <div className="flex gap-4">
          <Link href="/proposals" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Proposals
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Console
          </Link>
        </div>
      </div>
    </main>
  );
}
