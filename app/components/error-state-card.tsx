import Link from "next/link";

type Action = {
  label: string;
  href: string;
};

export function ErrorStateCard({
  title,
  message,
  actions,
}: {
  title: string;
  message: string;
  actions: Action[];
}) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-100">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-300">State Error</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-rose-100/90">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-full border border-rose-300/60 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-200"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

