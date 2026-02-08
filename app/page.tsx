import Link from "next/link";
import { BilingualBrief } from "@/app/components/bilingual-brief";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1d4ed8_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#0f766e_0%,transparent_35%)] opacity-35" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
          YieldPilot
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          StableLayer makes yield programmable. YieldPilot makes it survivable.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Protocols rarely fail from lack of yield. They fail from fragile
          allocation. Stress-test strategy under APY drawdown, redemption
          spikes, and cap pressure before governance executes.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/console"
            className="btn-feedback rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start
          </Link>
          <p className="text-sm text-slate-300">
            Safety promise: AI recommends and explains; humans approve every proposal.
          </p>
        </div>
        <div className="mt-10">
          <BilingualBrief
            className="fade-up delay-1"
            eyebrow="Mission"
            titleEn="YieldPilot is a survival engine for programmable stablecoin treasuries."
            titleZh="YieldPilot 是可编程稳定币金库的生存引擎。"
            enParagraphs={[
              "Most protocols do not fail because they cannot generate yield. They fail because treasury yield is allocated without stress evidence, and risk accumulates silently until a regime shift exposes weakness.",
              "YieldPilot reframes treasury operations as a validation loop: observe baseline health, run scenario stress, measure survivability, and only then produce governance proposals.",
              "This creates a disciplined bridge between AI assistance and human control. AI generates analysis and draft direction; operators and governors remain accountable for final execution.",
            ]}
            zhParagraphs={[
              "多数协议不是死于“没有收益”，而是死于“没有证据的收益分配”。风险会在平稳期悄悄累积，直到市场切换时集中暴露。",
              "YieldPilot 把金库运营重构为验证闭环：先看基线健康，再做压力模拟，再评估生存性，最后才进入治理提案。",
              "这也建立了 AI 与人工治理的边界：AI 负责分析与草案建议，人类运营者和治理参与者负责最终决策与执行。",
            ]}
          />
        </div>
      </main>
    </div>
  );
}
