export type SourceListProps = {
  sources: { title: string; url: string }[];
  className?: string;
};

export function SourceList({ sources, className = "" }: SourceListProps) {
  return (
    <section
      className={`rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 ${className}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Data sources
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Course lists are snapshots from official UCSB pages—not a live scrape.
        Verify prerequisites in the{" "}
        <a
          href="https://catalog.ucsb.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 underline-offset-2 hover:underline"
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
              className="text-sm text-indigo-300/90 transition hover:text-indigo-200"
            >
              {source.title} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
