import Link from "next/link";
import type { CoeCatalog } from "@/lib/ucsb-coe";

export type SchoolHeroProps = {
  catalog: CoeCatalog;
};

export function SchoolHero({ catalog }: SchoolHeroProps) {
  const { school, majors, gear } = catalog;
  const available = majors.filter((m) => m.roadmap_available).length;

  return (
    <section className="card-glow relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-violet-950/30 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-700 dark:text-violet-300/90">
          {school.college}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
          {school.name}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{school.location}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-lg border border-indigo-500/30 bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 text-xs text-indigo-800 dark:text-indigo-200">
            {majors.length} BS majors
          </span>
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-200">
            {available} interactive roadmap{available !== 1 ? "s" : ""}
          </span>
          <span className="rounded-lg border border-slate-300 dark:border-slate-600/40 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
            Updated {catalog.last_updated}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={school.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-800 dark:text-indigo-200 transition hover:bg-indigo-950/50"
          >
            Official CoE site ↗
          </Link>
          <Link
            href={school.majors_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 dark:border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            Majors & programs ↗
          </Link>
          <a
            href={gear.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-800 dark:text-violet-200 transition hover:bg-violet-900/40"
          >
            {gear.catalog_year} GEAR PDF ↗
          </a>
        </div>
      </div>
    </section>
  );
}
