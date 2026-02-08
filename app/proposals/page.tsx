import Link from "next/link";

import { BilingualBrief } from "@/app/components/bilingual-brief";
import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { FileListIcon } from "@/app/components/metric-icons";
import { LevelBadge, SegmentMeter } from "@/app/components/visual-metrics";
import { listProposalsWithContext } from "@/server/services/proposal-service";

export default async function ProposalsPage() {
  const proposals = await listProposalsWithContext();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="fade-up">
          <FlowStepper current="history" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Use history to show auditability: every recommendation becomes a traceable proposal record." />
        </div>
        <div className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Governance</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <FileListIcon className="h-7 w-7" />
            Proposal History
          </h1>
        </div>
        <BilingualBrief
          className="fade-up delay-2"
          eyebrow="Auditability"
          titleEn="History is where strategy credibility is proven."
          titleZh="历史记录是策略可信度被验证的地方。"
          enParagraphs={[
            "A recommendation without traceability is only opinion. This page keeps a durable record of how stress signals translated into governance proposals over time.",
            "Reviewers can compare proposal density, execution status, and policy version changes to evaluate whether treasury adjustments were measured or reactive.",
            "In demo context, this section shows that YieldPilot is not a one-off analyzer; it is an operational memory layer for treasury governance.",
          ]}
          zhParagraphs={[
            "没有可追溯性的建议，本质上只是观点。这个页面保存了从压力信号到治理提案的完整历史记录。",
            "评审者可以通过提案复杂度、执行状态和策略版本变化，判断团队的调整是有节奏的，还是被动反应式的。",
            "在 Demo 语境下，这里体现 YieldPilot 不是一次性分析工具，而是金库治理的“运营记忆层”。",
          ]}
        />

        {proposals.length === 0 ? (
          <ErrorStateCard
            title="No Proposals Yet"
            message="Run stress validation and generate a draft to create your first governance proposal."
            actions={[
              { label: "Run Stress Test", href: "/stress-test" },
              { label: "Back to Console", href: "/console" },
            ]}
          />
        ) : null}

        <div className="interactive-card fade-up delay-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3">Proposal</th>
                <th className="px-4 py-3">Policy Version</th>
                <th className="px-4 py-3">Snapshot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Complexity</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <Link href={`/proposals/${proposal.id}`} className="text-cyan-300 hover:text-cyan-200">
                      {proposal.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">v{proposal.plan.policy.version}</td>
                  <td className="px-4 py-3">{proposal.plan.snapshot.source}</td>
                  <td className="px-4 py-3">
                    <LevelBadge level={proposal.status === "EXECUTED" ? "low" : "medium"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <SegmentMeter
                        ratio={Math.min((Array.isArray(proposal.actions) ? proposal.actions.length : 1) / 8, 1)}
                        inverse
                      />
                      <span className="text-xs text-slate-400">action density</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Console
          </Link>
        </div>
      </div>
    </main>
  );
}
