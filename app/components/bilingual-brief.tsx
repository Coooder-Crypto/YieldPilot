type BilingualBriefProps = {
  eyebrow?: string;
  titleEn: string;
  titleZh: string;
  enParagraphs: string[];
  zhParagraphs: string[];
  className?: string;
};

export function BilingualBrief({
  eyebrow = "Narrative",
  titleEn,
  titleZh,
  enParagraphs,
  zhParagraphs,
  className = "",
}: BilingualBriefProps) {
  return (
    <section className={`interactive-card rounded-2xl border border-slate-800 bg-slate-900/70 p-6 ${className}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <article className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">English Version</p>
          <h2 className="text-xl font-semibold text-slate-100">{titleEn}</h2>
          <div className="space-y-3 text-sm text-slate-300">
            {enParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
        <article className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">中文版本</p>
          <h2 className="text-xl font-semibold text-slate-100">{titleZh}</h2>
          <div className="space-y-3 text-sm text-slate-300">
            {zhParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
