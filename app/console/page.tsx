import Link from "next/link";

import { resetDemoAction } from "@/app/console/actions";
import { BilingualBrief } from "@/app/components/bilingual-brief";
import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { ResetButton } from "@/app/console/reset-button";
import { DollarIcon, FileListIcon, GaugeIcon, ShieldIcon } from "@/app/components/metric-icons";
import { ArrowTrend, LevelBadge, SegmentMeter, toInverseLevel, toLevel } from "@/app/components/visual-metrics";
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
  const capRatio = latestSnapshot ? latestSnapshot.instantCapUsed / latestSnapshot.instantCapTotal : 0;
  const claimableLevel = toLevel(latestSnapshot?.claimableYield ?? 0, 15000, 30000);
  const capLevel = toLevel(capRatio, 0.65, 0.85);
  const runwayLevel = runwayDays === null ? "stable" : toInverseLevel(runwayDays, 45, 20);
  const proposalActivity = toLevel(proposals.length, 3, 8);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="fade-up">
          <FlowStepper current="console" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Start by reading the dashboard state, then run Stress Test to reveal survivability gaps." />
        </div>
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">
          YieldPilot Console
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Strategy Survivability Dashboard</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Run stress validation, generate policy update drafts, and track governance-ready proposals.
        </p>
        <BilingualBrief
          className="fade-up delay-2"
          eyebrow="Product Story"
          titleEn="This dashboard is not for growth vanity, it is for survival decisions."
          titleZh="这个仪表盘不是增长炫技工具，而是生存决策面板。"
          enParagraphs={[
            "StableLayer can continuously produce yield, but yield alone does not make a treasury safe. Unsafe allocation logic can drain incentives, underfund insurance, and compress runway before the team notices the damage.",
            "YieldPilot starts from one position: every treasury already has a strategy, but very few teams can explain whether that strategy survives under stress. This console exposes the current baseline before any simulation begins.",
            "From here, the operator should move into Stress Test, trigger scenario shocks, and return with a decision-backed proposal instead of relying on intuition or chat discussions.",
          ]}
          zhParagraphs={[
            "StableLayer 可以持续产生收益，但有收益不代表金库安全。分配逻辑一旦失衡，就会出现激励过度、保险不足、runway 快速压缩，而且团队往往在问题扩大后才发现。",
            "YieldPilot 的核心立场是：每个金库都有策略，但很少有人能清楚回答这个策略在压力条件下是否还能活下来。当前页面先把基线状态可视化，再进入模拟环节。",
            "接下来应进入 Stress Test 触发冲击场景，再回到治理提案环节，用可解释的证据驱动决策，而不是依赖经验和情绪判断。",
          ]}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Claimable Yield</p>
              <DollarIcon />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <LevelBadge level={claimableLevel} />
              <ArrowTrend improving={claimableLevel !== "low"} />
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={(latestSnapshot?.claimableYield ?? 0) / 40000} inverse />
            </div>
          </article>
          <article className="interactive-card fade-up delay-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Cap Utilization</p>
              <GaugeIcon />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <LevelBadge level={capLevel} />
              <ArrowTrend improving={capLevel !== "high"} />
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={capRatio} />
            </div>
          </article>
          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Runway (est.)</p>
              <ShieldIcon />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <LevelBadge level={runwayLevel} />
              <ArrowTrend improving={runwayLevel === "stable" || runwayLevel === "low"} />
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={runwayDays === null ? 1 : Math.min(runwayDays / 90, 1)} inverse />
            </div>
          </article>
          <article className="interactive-card fade-up delay-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Proposals</p>
              <FileListIcon />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <LevelBadge level={proposalActivity} />
              <ArrowTrend improving={proposalActivity !== "low"} />
            </div>
            <div className="mt-3">
              <SegmentMeter ratio={Math.min(proposals.length / 10, 1)} inverse />
            </div>
          </article>
        </section>

        <section className="interactive-card fade-up delay-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Active Policy</h2>
          {activePolicy ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <p>Version: v{activePolicy.version}</p>
              <p>Objective: {activePolicy.objective.toLowerCase()}</p>
              <p>Status: active</p>
            </div>
          ) : (
            <div className="mt-3">
              <ErrorStateCard
                title="No Active Policy"
                message="Reset demo data or seed the database to restore a runnable policy baseline."
                actions={[
                  { label: "Go Stress Test", href: "/stress-test" },
                  { label: "Proposal History", href: "/proposals" },
                ]}
              />
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/stress-test"
            className="btn-feedback rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Run Stress Test
          </Link>
          <Link
            href="/proposals"
            className="btn-feedback rounded-full border border-cyan-400/60 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:text-cyan-200"
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
