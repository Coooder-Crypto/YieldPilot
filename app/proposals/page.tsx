import Link from "next/link";

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
        <FlowStepper current="history" />
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Governance</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <FileListIcon className="h-7 w-7" />
            Proposal History
          </h1>
        </div>

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

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
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
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}
