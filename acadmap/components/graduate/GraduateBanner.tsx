import Link from "next/link";

import type { GradSource } from "@/lib/ucsb-grad-programs-types";

export type GraduateBannerProps = {
  sources: GradSource[];
  departmentCount: number;
  roadmapCount: number;
  className?: string;
};

export function GraduateBanner({
  sources,
  departmentCount,
  roadmapCount,
  className = "",
}: GraduateBannerProps) {
  return (
    <div
      className={`rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-50 via-white to-gaucho-blue/5 p-6 dark:from-violet-950/30 dark:via-gaucho-blue-dark/40 dark:to-gaucho-blue-dark/20 sm:p-8 ${className}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-200">
            UCSB Graduate Division
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gaucho-blue dark:text-white">
            MS, PhD, and professional graduate programs
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Browse {departmentCount}+ departments from the official Graduate
            Division index, explore graduate-level courses, and open interactive
            CoE roadmaps where available.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-400/30 dark:text-violet-200">
              {departmentCount} departments
            </span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-400/30 dark:text-emerald-200">
              {roadmapCount} interactive roadmaps
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:shrink-0">
          <Link
            href="/schools/ucsb/courses?level=G"
            className="rounded-lg bg-gaucho-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gaucho-blue-light dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
          >
            Browse grad courses
          </Link>
          <a
            href="https://www.graddiv.ucsb.edu/graduate-programs/departments"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gaucho-blue/25 px-4 py-2.5 text-sm font-medium text-gaucho-blue transition hover:border-gaucho-gold/40 dark:text-gaucho-gold"
          >
            Official dept list ↗
          </a>
        </div>
      </div>

      {sources.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-violet-500/15 pt-5">
          {sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gaucho-blue underline-offset-2 hover:underline dark:text-gaucho-gold"
              >
                {source.title} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
