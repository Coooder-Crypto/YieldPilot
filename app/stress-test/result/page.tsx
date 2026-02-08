import Link from "next/link";

import { BilingualBrief } from "@/app/components/bilingual-brief";
import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { AlertIcon, BoltIcon, DollarIcon, GaugeIcon, SparkIcon } from "@/app/components/metric-icons";
import { ArrowTrend, fromRiskLevel, LevelBadge, RiskLights, SegmentMeter, toLevel } from "@/app/components/visual-metrics";
import { createRecommendationDraftAction } from "@/app/stress-test/result/actions";
import { runStressTestReport } from "@/server/services/stress-service";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
          <div className="fade-up">
            <FlowStepper current="result" />
          </div>
          <div className="fade-up delay-1">
            <DemoTip text="Pause here: call out the risk level, then trigger the draft generation CTA." />
          </div>
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
        <div className="fade-up">
          <FlowStepper current="result" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Tell the story in two beats: risk revealed, then recommendation applied." />
        </div>
        <BilingualBrief
          className="fade-up delay-2"
          eyebrow="Result Interpretation"
          titleEn="A risk score is only useful when it changes what you do next."
          titleZh="风险评分只有在改变下一步行动时才有价值。"
          enParagraphs={[
            "The result is designed for decision cadence. First, read risk intensity and top signals. Second, inspect scenario-level runway changes. Third, convert findings into a concrete strategy draft.",
            "If score falls sharply under stress, this is not a cosmetic alert. It means current allocation assumptions cannot absorb volatility and may force emergency governance later.",
            "Use recommendations as structured hypotheses. In the next screen, those hypotheses become an allocation diff and a proposal payload ready for treasury workflow.",
          ]}
          zhParagraphs={[
            "结果页的目标是服务决策节奏：先判断风险强度和关键信号，再看场景下 runway 的变化，最后把结论转成可执行的策略草案。",
            "如果压力下评分明显下跌，这不是装饰性提示，而是说明当前分配假设无法吸收波动，后续可能被动进入紧急治理。",
            "建议项应被当作结构化假设。下一步这些假设会落地为 allocation diff 和 proposal payload，直接进入金库治理流程。",
          ]}
        />
        <div className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
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
          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              <AlertIcon />
              Risk Score
            </h2>
            <div className="flex items-center gap-3">
              <RiskLights level={report.riskReport.level} />
              <LevelBadge level={fromRiskLevel(report.riskReport.level)} />
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

          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
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

        <article className="interactive-card fade-up delay-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
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
            Run Another Stress Test
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to Console
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
            className="btn-feedback rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Generate vNext Proposal Draft
          </button>
        </form>
      </div>
    </main>
  );
}
