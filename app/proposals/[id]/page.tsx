import Link from "next/link";

import { BilingualBrief } from "@/app/components/bilingual-brief";
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
        <BilingualBrief
          className="fade-up delay-2"
          eyebrow="Proposal Review"
          titleEn="A proposal is complete only when intent and payload align."
          titleZh="提案只有在“意图”和“载荷”一致时才算完整。"
          enParagraphs={[
            "The Actions block explains governance intent in operational language. The Payload block captures exact machine-readable parameters for downstream execution.",
            "Reviewing both side by side prevents a common treasury failure mode: policy rationale says one thing while implementation payload does another.",
            "This detail view is intentionally explicit so signers, delegates, and operators can independently verify that strategy edits remain within agreed risk boundaries.",
          ]}
          zhParagraphs={[
            "Actions 区块表达治理意图，强调运营语义；Payload 区块表达执行参数，强调机器可读性。",
            "两者并排审阅可以避免常见失误：讨论里说的是一套策略，实际执行载荷却是另一套参数。",
            "该详情页刻意保持透明，便于签署者、治理代表和运营者独立验证调整是否仍在约定的风险边界内。",
          ]}
        />
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
