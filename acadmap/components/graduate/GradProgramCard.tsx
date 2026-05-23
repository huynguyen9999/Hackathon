import Link from "next/link";

import type {
  GradProgramDetail,
  GradProgramSummary,
} from "@/lib/ucsb-grad-programs-types";
import { buildCatalogUrl } from "@/lib/ucsb-curriculum-urls";

export type GradProgramCardProps = {
  program: GradProgramSummary;
  detail?: GradProgramDetail | null;
  compact?: boolean;
};

export function GradProgramCard({
  program,
  detail,
  compact = false,
}: GradProgramCardProps) {
  return (
    <article
      className={[
        "card-glow flex flex-col rounded-xl border border-violet-500/20 bg-white dark:bg-gaucho-blue-dark/40",
        compact ? "p-4" : "p-6",
      ].join(" ")}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-200">
          {program.degree}
        </span>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {program.department}
        </span>
      </div>
      <h3
        className={[
          "font-semibold text-gaucho-blue dark:text-white",
          compact ? "text-base" : "text-xl",
        ].join(" ")}
      >
        {program.name}
      </h3>
      {detail?.description && !compact && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {detail.description}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/roadmap/ucsb/${program.slug}`}
          className="rounded-lg bg-gaucho-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-gaucho-blue-light dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
        >
          View roadmap
        </Link>
        <Link
          href={buildCatalogUrl({
            subject: program.department,
            level: "G",
          })}
          className="rounded-lg border border-gaucho-blue/25 px-4 py-2 text-sm font-medium text-gaucho-blue transition hover:border-gaucho-gold/40 dark:text-gaucho-gold"
        >
          Grad courses
        </Link>
        {detail?.source_url && (
          <a
            href={detail.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300/50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-gaucho-gold/40 dark:border-slate-600 dark:text-slate-300"
          >
            Official ↗
          </a>
        )}
      </div>
    </article>
  );
}
