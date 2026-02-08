import Link from "next/link";

import { DemoTip } from "@/app/components/demo-tip";
import { ErrorStateCard } from "@/app/components/error-state-card";
import { FlowStepper } from "@/app/components/flow-stepper";
import { listPolicies, listSnapshots } from "@/server/db/repositories";

export default async function StressTestPage() {
  const [policies, snapshots] = await Promise.all([listPolicies(), listSnapshots()]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="fade-up">
          <FlowStepper current="stress" />
        </div>
        <div className="fade-up delay-1">
          <DemoTip text="Pick the active policy and latest snapshot. One click runs all stress scenarios." />
        </div>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Stress Test</p>
          <h1 className="mt-2 text-3xl font-semibold">Run Strategy Validation</h1>
          <p className="mt-3 text-slate-300">
            Simulate APY drawdown, redemption shocks, and cap pressure before you ship a policy.
          </p>
        </div>

        {policies.length === 0 || snapshots.length === 0 ? (
          <ErrorStateCard
            title="Missing Policy Or Snapshot"
            message="Stress testing needs both a policy and a snapshot. Reset demo data to recover baseline inputs."
            actions={[
              { label: "Back to Console", href: "/console" },
              { label: "Proposal History", href: "/proposals" },
            ]}
          />
        ) : null}

        {policies.length > 0 && snapshots.length > 0 ? (
          <form
            action="/stress-test/result"
            method="get"
            className="interactive-card fade-up delay-2 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
          >
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Policy</span>
              <select
                name="policyId"
                defaultValue={policies[0]?.id}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              >
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    v{policy.version} · {policy.objective.toLowerCase()} · {policy.isActive ? "active" : "inactive"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Snapshot</span>
              <select
                name="snapshotId"
                defaultValue={snapshots[0]?.id}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              >
                {snapshots.map((snapshot) => (
                  <option key={snapshot.id} value={snapshot.id}>
                    {snapshot.createdAt.toISOString()} · claimable {snapshot.claimableYield.toLocaleString()} ·{" "}
                    {snapshot.source}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-feedback rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Run Stress Test
              </button>
              <Link href="/console" className="self-center text-sm text-cyan-300 hover:text-cyan-200">
                Back to Console
              </Link>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}
