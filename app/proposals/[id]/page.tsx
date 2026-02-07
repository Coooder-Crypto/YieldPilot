import Link from "next/link";
import { notFound } from "next/navigation";

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
    notFound();
  }

  const actionsJson = stringifyJson(proposal.actions);
  const payloadJson = stringifyJson(proposal.payload);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Proposal Detail</p>
          <h1 className="mt-2 text-2xl font-semibold">{proposal.id}</h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            <p>Status: {proposal.status.toLowerCase()}</p>
            <p>Policy v{proposal.plan.policy.version}</p>
            <p>Snapshot: {proposal.plan.snapshot.source}</p>
          </div>
        </div>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Actions</h2>
            <CopyJsonButton value={actionsJson} />
          </div>
          <pre className="overflow-x-auto text-xs text-slate-200">{actionsJson}</pre>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Payload</h2>
            <CopyJsonButton value={payloadJson} />
          </div>
          <pre className="overflow-x-auto text-xs text-slate-200">{payloadJson}</pre>
        </article>

        <div className="flex gap-4">
          <Link href="/proposals" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to proposals
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}

