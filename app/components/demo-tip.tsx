export function DemoTip({ text }: { text: string }) {
  return (
    <aside className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Demo Tip</p>
      <p className="mt-2 text-sm text-cyan-100/90">{text}</p>
    </aside>
  );
}

