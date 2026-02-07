import Link from "next/link";

import { resetDemoAction } from "@/app/console/actions";
import { ResetButton } from "@/app/console/reset-button";
import { formatAmount, formatUsd } from "@/lib/utils/format";
import { getActivePolicy, getLatestSnapshot, listProposals } from "@/server/db/repositories";

export default function ConsolePage() {
  return <ConsolePageContent />;
}

async function ConsolePageContent() {
  const [activePolicy, latestSnapshot, proposals] = await Promise.all([
    getActivePolicy(),
    getLatestSnapshot(),
    listProposals(),
  ]);

  const runwayDays =
    latestSnapshot && latestSnapshot.redeem24h > latestSnapshot.mint24h
      ? (latestSnapshot.treasuryBalance ?? 0) / (latestSnapshot.redeem24h - latestSnapshot.mint24h)
      : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">
          YieldPilot Console
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Strategy Survivability Dashboard</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Run stress validation, generate policy update drafts, and track governance-ready proposals.
        </p>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Claimable Yield</p>
            <p className="mt-2 text-2xl font-semibold">
              {latestSnapshot ? formatUsd(latestSnapshot.claimableYield) : "-"}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Cap Utilization</p>
            <p className="mt-2 text-2xl font-semibold">
              {latestSnapshot
                ? `${formatAmount((latestSnapshot.instantCapUsed / latestSnapshot.instantCapTotal) * 100, 1)}%`
                : "-"}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Runway (est.)</p>
            <p className="mt-2 text-2xl font-semibold">
              {runwayDays === null ? "Stable" : `${formatAmount(runwayDays, 1)}d`}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Proposals</p>
            <p className="mt-2 text-2xl font-semibold">{proposals.length}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Active Policy</h2>
          {activePolicy ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <p>Version: v{activePolicy.version}</p>
              <p>Objective: {activePolicy.objective.toLowerCase()}</p>
              <p>Status: active</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No active policy found.</p>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/stress-test"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Run Stress Test
          </Link>
          <Link
            href="/proposals"
            className="rounded-full border border-cyan-400/60 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Proposal History
          </Link>
          <form action={resetDemoAction}>
            <ResetButton />
          </form>
        </div>
      </div>
    </main>
  );
}
