import Link from "next/link";

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
          Stress-test treasury strategy under APY drawdown, redemption spikes,
          and cap pressure. Score risk, generate recommendations, and produce
          governance-ready proposals.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/console"
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start
          </Link>
          <p className="text-sm text-slate-300">
            Safety promise: AI recommends and explains; humans approve every proposal.
          </p>
        </div>
      </main>
    </div>
  );
}
