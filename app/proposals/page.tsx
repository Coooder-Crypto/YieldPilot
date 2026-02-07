import Link from "next/link";

import { listProposalsWithContext } from "@/server/services/proposal-service";

export default async function ProposalsPage() {
  const proposals = await listProposalsWithContext();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Governance</p>
          <h1 className="mt-2 text-2xl font-semibold">Proposal History</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3">Proposal</th>
                <th className="px-4 py-3">Policy Version</th>
                <th className="px-4 py-3">Snapshot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
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
                  <td className="px-4 py-3">{proposal.status.toLowerCase()}</td>
                  <td className="px-4 py-3">{proposal.createdAt.toISOString()}</td>
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

