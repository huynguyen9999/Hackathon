export type SourceListProps = {
  sources?: { title: string; url: string }[];
  className?: string;
};

export function SourceList({ sources = [], className = "" }: SourceListProps) {
  return (
    <section
      className={`rounded-xl border border-slate-300 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-900/40 p-5 ${className}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-500">
        Data sources
      </h2>
      <p className="mt-1 text-xs text-slate-900 dark:text-slate-500">
        Course lists are snapshots from official UCSB pages—not a live scrape.
        Verify prerequisites in the{" "}
        <a
          href="https://catalog.ucsb.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gaucho-blue-light underline-offset-2 hover:underline"
        >
          UCSB General Catalog
        </a>
        .
      </p>
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gaucho-blue dark:text-gaucho-gold/90 transition hover:text-gaucho-blue dark:text-gaucho-gold-light"
            >
              {source.title} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
