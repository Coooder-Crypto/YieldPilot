import Link from "next/link";

type StepKey = "console" | "stress" | "result" | "draft" | "history";

const STEPS: Array<{ key: StepKey; label: string; href: string }> = [
  { key: "console", label: "Console", href: "/console" },
  { key: "stress", label: "Stress Test", href: "/stress-test" },
  { key: "result", label: "Risk Result", href: "/stress-test/result" },
  { key: "draft", label: "Proposal Draft", href: "/proposal/new" },
  { key: "history", label: "History", href: "/proposals" },
];

export function FlowStepper({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <nav className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3" aria-label="Flow steps">
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.key} className="flex items-center gap-2">
              <Link
                href={step.href}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : done
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-300"
                }`}
              >
                {index + 1}. {step.label}
              </Link>
              {index < STEPS.length - 1 ? <span className="text-slate-600">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

