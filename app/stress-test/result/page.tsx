import Link from "next/link";
import { notFound } from "next/navigation";

import { formatAmount, formatUsd } from "@/lib/utils/format";
import { runStressTestReport } from "@/server/services/stress-service";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function riskBadgeClass(level: string): string {
  if (level === "HIGH") return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  if (level === "MEDIUM") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
}

export default async function StressResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const policyId = typeof params.policyId === "string" ? params.policyId : "";
  const snapshotId = typeof params.snapshotId === "string" ? params.snapshotId : "";
  if (!policyId || !snapshotId) {
    notFound();
  }

  const report = await runStressTestReport(policyId, snapshotId).catch(() => null);
  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Stress Test Result</p>
          <h1 className="mt-2 text-2xl font-semibold">Policy v{report.policy.version}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Snapshot: <span className="text-slate-100">{report.snapshot.source}</span>
            </p>
            <p>
              Claimable: <span className="text-slate-100">{formatUsd(report.snapshot.claimableYield)}</span>
            </p>
            <p>
              Treasury: <span className="text-slate-100">{formatUsd(report.snapshot.treasuryBalance ?? 0)}</span>
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Risk Score
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-semibold">{report.riskReport.score}</p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(report.riskReport.level)}`}
              >
                {report.riskReport.level}
              </span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-slate-300">
              {report.riskReport.topSignals.map((signal) => (
                <li key={signal}>- {signal}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Recommendations
            </h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {report.riskReport.recommendations.map((rec) => (
                <li key={rec}>- {rec}</li>
              ))}
            </ul>
          </article>
        </section>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Scenario Breakdown</h2>
          <div className="space-y-3">
            {report.scenarioResults.map((result) => (
              <div key={result.scenario.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{result.scenario.label}</p>
                  <p className="text-xs text-slate-300">Cap after: {formatAmount(result.capUtilizationAfter * 100)}%</p>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                  <p>Runway before: {formatAmount(result.runwayBeforeDays)} days</p>
                  <p>Runway after: {formatAmount(result.runwayAfterDays)} days</p>
                  <p>Delta: {formatAmount(result.runwayDeltaDays)} days</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="flex gap-4">
          <Link href="/stress-test" className="text-sm text-cyan-300 hover:text-cyan-200">
            Run another stress test
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}
