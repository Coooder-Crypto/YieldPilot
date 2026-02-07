import Link from "next/link";

import { createPolicyAction } from "@/app/policy/new/actions";
import { SubmitButton } from "@/app/policy/new/submit-button";

export default function NewPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Policy Studio</p>
          <h1 className="mt-2 text-3xl font-semibold">Create Policy</h1>
          <p className="mt-3 text-slate-300">
            Submit strategy constraints and let YieldPilot generate a schema-validated policy.
          </p>
        </div>

        <form action={createPolicyAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Objective</span>
            <select
              name="objective"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              defaultValue="balanced"
            >
              <option value="growth">Growth</option>
              <option value="defense">Defense</option>
              <option value="balanced">Balanced</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Epoch Hours</span>
              <input
                name="epochHours"
                type="number"
                min={1}
                max={168}
                defaultValue={24}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Budget Cap (USDC)</span>
              <input
                name="budgetCap"
                type="number"
                min={1}
                step="0.01"
                defaultValue={50000}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Treasury Floor (USDC)</span>
              <input
                name="treasuryFloor"
                type="number"
                min={0}
                step="0.01"
                defaultValue={200000}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Risk Level</span>
              <select
                name="riskLevel"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                defaultValue="medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Whitelist Addresses (comma separated, optional)
            </span>
            <input
              name="whitelist"
              type="text"
              placeholder="0xabc..., 0xdef..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500"
            />
          </label>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <SubmitButton />
            <Link href="/console" className="text-sm text-cyan-300 hover:text-cyan-200">
              Back to Console
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
