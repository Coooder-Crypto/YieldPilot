import Link from "next/link";
import { notFound } from "next/navigation";

import { stringifyJson } from "@/lib/utils/json";
import { getPolicyById } from "@/server/db/repositories";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatObjective(value: string) {
  return value.toLowerCase();
}

export default async function PolicyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const policy = await getPolicyById(id);

  if (!policy) {
    notFound();
  }

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
            <pre className="overflow-x-auto text-xs text-slate-200">{stringifyJson(policy.allocations)}</pre>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Rules</h2>
            <pre className="overflow-x-auto text-xs text-slate-200">{stringifyJson(policy.rules)}</pre>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Guards</h2>
            <pre className="overflow-x-auto text-xs text-slate-200">{stringifyJson(policy.guards)}</pre>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              Execution & Metrics
            </h2>
            <pre className="overflow-x-auto text-xs text-slate-200">
              {stringifyJson({ execution: policy.execution, metrics: policy.metrics })}
            </pre>
          </article>
        </section>

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
