import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPercent, formatUsd } from "@/lib/utils/format";
import { stringifyJson } from "@/lib/utils/json";
import { getPolicyById } from "@/server/db/repositories";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatObjective(value: string) {
  return value.toLowerCase();
}

type AllocationBucket = {
  base: number;
  min: number;
  max: number;
};

type Rule = {
  id: string;
  if?: {
    metric?: string;
    op?: string;
    value?: number;
  };
  then?: {
    bucket?: string;
    delta?: number;
  };
};

export default async function PolicyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const policy = await getPolicyById(id);

  if (!policy) {
    notFound();
  }

  const allocations = policy.allocations as Record<string, AllocationBucket>;
  const rules = policy.rules as Rule[];
  const guards = policy.guards as {
    maxTransferPerEpoch?: number;
    treasuryFloor?: number;
    whitelist?: string[];
  };
  const execution = policy.execution as { mode?: string; epochHours?: number };
  const metrics = Array.isArray(policy.metrics) ? (policy.metrics as string[]) : [];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Policy Detail</p>
          <h1 className="mt-2 text-2xl font-semibold">Policy v{policy.version}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Objective: <span className="text-slate-100">{formatObjective(policy.objective)}</span>
            </p>
            <p>
              Active: <span className="text-slate-100">{policy.isActive ? "yes" : "no"}</span>
            </p>
            <p>
              Created: <span className="text-slate-100">{policy.createdAt.toISOString()}</span>
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Allocations
            </h2>
            <div className="space-y-3">
              {Object.entries(allocations).map(([bucket, value]) => (
                <div key={bucket} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm font-medium capitalize text-slate-100">{bucket}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-300">
                    <p>base: {formatPercent(value.base)}</p>
                    <p>min: {formatPercent(value.min)}</p>
                    <p>max: {formatPercent(value.max)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Rules</h2>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm font-medium text-slate-100">{rule.id}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    If {rule.if?.metric} {rule.if?.op} {rule.if?.value}, then shift{" "}
                    {formatPercent(rule.then?.delta ?? 0)} to {rule.then?.bucket}.
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Guards</h2>
            <div className="space-y-2 text-sm text-slate-200">
              <p>Max transfer / epoch: {formatUsd(guards.maxTransferPerEpoch ?? 0)}</p>
              <p>Treasury floor: {formatUsd(guards.treasuryFloor ?? 0)}</p>
              <p className="text-slate-300">
                Whitelist: {guards.whitelist?.length ? guards.whitelist.join(", ") : "not set"}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Execution & Metrics
            </h2>
            <div className="space-y-2 text-sm text-slate-200">
              <p>Mode: {execution.mode}</p>
              <p>Epoch: every {execution.epochHours}h</p>
              <p className="text-slate-300">Metrics: {metrics.length ? metrics.join(", ") : "none"}</p>
            </div>
          </article>
        </section>

        <details className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            Raw Policy JSON (Audit)
          </summary>
          <pre className="mt-4 overflow-x-auto text-xs text-slate-200">
            {stringifyJson({
              allocations: policy.allocations,
              rules: policy.rules,
              guards: policy.guards,
              execution: policy.execution,
              metrics: policy.metrics,
            })}
          </pre>
        </details>

        <div className="flex gap-4">
          <Link href="/policy/new" className="text-sm text-cyan-300 hover:text-cyan-200">
            Create another policy
          </Link>
          <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to console
          </Link>
        </div>
      </div>
    </main>
  );
}
