type Level = "low" | "medium" | "high";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toLevel(value: number, mediumAt: number, highAt: number): Level {
  if (value >= highAt) return "high";
  if (value >= mediumAt) return "medium";
  return "low";
}

export function toInverseLevel(value: number, mediumAt: number, lowAt: number): Level {
  if (value <= lowAt) return "high";
  if (value <= mediumAt) return "medium";
  return "low";
}

export function LevelBadge({ level }: { level: Level | "stable" }) {
  const map = {
    low: "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
    medium: "border-amber-500/40 bg-amber-500/20 text-amber-300",
    high: "border-rose-500/40 bg-rose-500/20 text-rose-300",
    stable: "border-cyan-500/40 bg-cyan-500/20 text-cyan-300",
  } as const;

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold uppercase", map[level])}>
      {level}
    </span>
  );
}

export function RiskLights({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  const active =
    level === "HIGH" ? [true, true, true] : level === "MEDIUM" ? [true, true, false] : [true, false, false];

  return (
    <div className="inline-flex items-center gap-2">
      {active.map((on, idx) => (
        <span
          key={idx}
          className={cn(
            "h-3 w-3 rounded-full border",
            on
              ? idx === 0
                ? "border-emerald-400 bg-emerald-400"
                : idx === 1
                  ? "border-amber-400 bg-amber-400"
                  : "border-rose-400 bg-rose-400"
              : "border-slate-600 bg-slate-800",
          )}
        />
      ))}
    </div>
  );
}

export function SegmentMeter({
  ratio,
  segments = 10,
  inverse = false,
}: {
  ratio: number;
  segments?: number;
  inverse?: boolean;
}) {
  const value = Math.min(1, Math.max(0, ratio));
  const filled = Math.round(value * segments);

  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: segments }).map((_, idx) => {
        const on = idx < filled;
        const color = inverse
          ? value > 0.75
            ? "bg-rose-400"
            : value > 0.45
              ? "bg-amber-400"
              : "bg-emerald-400"
          : value > 0.75
            ? "bg-emerald-400"
            : value > 0.45
              ? "bg-amber-400"
              : "bg-rose-400";

        return <span key={idx} className={cn("h-2 w-3 rounded-sm", on ? color : "bg-slate-800")} />;
      })}
    </div>
  );
}

export function ArrowTrend({ improving }: { improving: boolean }) {
  return (
    <span className={cn("text-xs font-semibold uppercase", improving ? "text-emerald-300" : "text-rose-300")}>
      {improving ? "Uptrend" : "Downtrend"}
    </span>
  );
}

