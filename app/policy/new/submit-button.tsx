"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
            Generating...
          </>
        ) : (
          "Generate and Save Policy"
        )}
      </button>
      {pending ? (
        <p className="text-xs text-slate-400">
          Generating policy via AI and validating schema. This can take 10-30 seconds.
        </p>
      ) : null}
    </div>
  );
}
