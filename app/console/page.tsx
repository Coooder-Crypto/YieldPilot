import Link from "next/link";

export default function ConsolePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">
          YieldPilot Console
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Dashboard Coming Online</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Iteration 0 completed. Next step is implementing policy creation,
          deterministic planning, and proposal history views.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/policy/new"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Create Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
