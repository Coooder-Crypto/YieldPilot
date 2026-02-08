"use client";

import { useState } from "react";

type Props = {
  value: string;
};

export function CopyJsonButton({ value }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="rounded-full border border-cyan-400/60 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-300 hover:text-cyan-200"
    >
      {copied ? "Copied" : "Copy JSON"}
    </button>
  );
}

