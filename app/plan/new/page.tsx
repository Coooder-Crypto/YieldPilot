import Link from "next/link";

import { createPlanAction } from "@/app/plan/new/actions";
import { PlanSubmitButton } from "@/app/plan/new/submit-button";
import { listPolicies, listSnapshots } from "@/server/db/repositories";

export default async function NewPlanPage() {
  const [policies, snapshots] = await Promise.all([listPolicies(), listSnapshots()]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Execution Planner</p>
          <h1 className="mt-2 text-3xl font-semibold">Create Plan</h1>
          <p className="mt-3 text-slate-300">
            Choose a policy version and a snapshot, then compute a deterministic execution plan.
          </p>
        </div>

        <form action={createPlanAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Policy Version</span>
            <select
              name="policyId"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              defaultValue={policies[0]?.id}
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              defaultValue={snapshots[0]?.id}
            >
              {snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.createdAt.toISOString()} · claimable {snapshot.claimableYield.toLocaleString()} ·{" "}
                  {snapshot.source}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <PlanSubmitButton />
            <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
              Back to Console
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
