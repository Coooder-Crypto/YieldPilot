"use client";

import { useFormStatus } from "react-dom";

export function ResetButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-feedback rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Resetting..." : "Reset Demo Data"}
    </button>
  );
}
