import Link from "next/link";
import { notFound } from "next/navigation";

import { formatUsd } from "@/lib/utils/format";
import { stringifyJson } from "@/lib/utils/json";
import { getComputedPlanByPlanId } from "@/server/services/plan-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getComputedPlanByPlanId(id).catch(() => null);
  if (!result) {
    notFound();
  }

  const { plan, computed } = result;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Execution Plan</p>
          <h1 className="mt-2 text-2xl font-semibold">Plan {plan.id}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Budget: <span className="text-slate-100">{formatUsd(computed.budget)}</span>
            </p>
            <p>
              Status: <span className="text-slate-100">{plan.status.toLowerCase()}</span>
            </p>
            <p>
              Created: <span className="text-slate-100">{plan.createdAt.toISOString()}</span>
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Bucket Amounts
            </h2>
            <div className="space-y-2">
              {Object.entries(computed.bucketAmounts).map(([bucket, amount]) => (
                <div key={bucket} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-300">{bucket}</span>
                  <span className="font-medium text-slate-100">{formatUsd(amount)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Triggered Rules
            </h2>
            <div className="space-y-3">
              {computed.triggeredRules.length === 0 ? (
                <p className="text-sm text-slate-400">No rules triggered in this run.</p>
              ) : (
                computed.triggeredRules.map((rule) => (
                  <div key={rule.ruleId} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-sm font-medium text-slate-100">{rule.ruleId}</p>
                    <p className="mt-1 text-xs text-slate-300">{rule.reason}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Actions</h2>
          <pre className="overflow-x-auto text-xs text-slate-200">{stringifyJson(computed.actions)}</pre>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            Explanation
          </h2>
          <p className="text-sm text-slate-200">{computed.explanation}</p>
        </article>

        <div className="flex gap-4">
          <Link href="/plan/new" className="text-sm text-cyan-300 hover:text-cyan-200">
            Generate another plan
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}
