import Link from "next/link";

import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { AlertIcon, BoltIcon, DollarIcon, GaugeIcon, SparkIcon } from "@/app/components/metric-icons";
import { ArrowTrend, LevelBadge, RiskLights, SegmentMeter, toLevel } from "@/app/components/visual-metrics";
import { createRecommendationDraftAction } from "@/app/stress-test/result/actions";
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
  const invalidInput = !policyId || !snapshotId;

  const report = invalidInput ? null : await runStressTestReport(policyId, snapshotId).catch(() => null);
  if (!report) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <FlowStepper current="result" />
          <ErrorStateCard
            title="Stress Result Unavailable"
            message="The selected policy/snapshot is invalid or missing. Re-run stress test with valid inputs."
            actions={[
              { label: "Go Stress Test", href: "/stress-test" },
              { label: "Back to Console", href: "/console" },
            ]}
          />
        </div>
      </main>
    );
  }
  const treasuryLevel = toLevel(report.snapshot.treasuryBalance ?? 0, 300000, 700000);
  const claimableLevel = toLevel(report.snapshot.claimableYield, 15000, 30000);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <FlowStepper current="result" />
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Stress Test Result</p>
          <h1 className="mt-2 text-2xl font-semibold">Policy v{report.policy.version}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              <span className="mr-2 inline-flex align-middle"><GaugeIcon className="h-6 w-6" /></span>
              Snapshot: <span className="text-slate-100">{report.snapshot.source}</span>
            </p>
            <p>
              <span className="mr-2 inline-flex align-middle"><DollarIcon className="h-6 w-6" /></span>
              Claimable: <LevelBadge level={claimableLevel} />
            </p>
            <p>
              <span className="mr-2 inline-flex align-middle"><SparkIcon className="h-6 w-6" /></span>
              Treasury: <LevelBadge level={treasuryLevel} />
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <AlertIcon />
              Risk Score
            </h2>
            <div className="flex items-center gap-3">
              <RiskLights level={report.riskReport.level} />
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(report.riskReport.level)}`}
              >
                {report.riskReport.level}
              </span>
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={report.riskReport.score / 100} />
            </div>
            <ul className="mt-4 space-y-1 text-sm text-slate-300">
              {report.riskReport.topSignals.map((signal) => (
                <li key={signal}>- {signal}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <SparkIcon />
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
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            <BoltIcon />
            Scenario Breakdown
          </h2>
          <div className="space-y-3">
            {report.scenarioResults.map((result) => (
              <div key={result.scenario.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{result.scenario.label}</p>
                  <LevelBadge level={toLevel(result.capUtilizationAfter, 0.65, 0.85)} />
                </div>
                <div className="mt-3 grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
                  <div className="space-y-2">
                    <p>Runway Before</p>
                    <SegmentMeter ratio={Math.min(result.runwayBeforeDays / 90, 1)} inverse />
                  </div>
                  <div className="space-y-2">
                    <p>Runway After</p>
                    <SegmentMeter ratio={Math.min(result.runwayAfterDays / 90, 1)} inverse />
                  </div>
                  <div className="space-y-2">
                    <p>Trend</p>
                    <ArrowTrend improving={result.runwayDeltaDays >= 0} />
                  </div>
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

        <form action={createRecommendationDraftAction} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <input type="hidden" name="policyId" value={policyId} />
          <input type="hidden" name="snapshotId" value={snapshotId} />
          <p className="mb-3 text-sm text-slate-300">
            Convert this stress result into a governance-ready strategy update draft.
          </p>
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Generate vNext Proposal Draft
          </button>
        </form>
      </div>
    </main>
  );
}
