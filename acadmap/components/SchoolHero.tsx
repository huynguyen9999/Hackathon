import Link from "next/link";
import type { CoeCatalog } from "@/lib/ucsb-coe";

export type SchoolHeroProps = {
  catalog: CoeCatalog;
  schoolShortName?: string;
};

export function SchoolHero({ catalog, schoolShortName }: SchoolHeroProps) {
  const { school, majors, gear } = catalog;
  const available = majors.filter((m) => m.roadmap_available).length;
  const isUcla = schoolShortName === "ucla" || school.short_name === "ucla";
  const pdfLabel = isUcla
    ? `${gear.catalog_year} Announcement PDF ↗`
    : `${gear.catalog_year} GEAR PDF ↗`;

  return (
    <section className="rounded-lg border border-gaucho-blue/15 bg-white p-6 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/50 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
        {school.college}
      </p>
      <h2 className="mt-1 text-2xl font-bold text-gaucho-blue sm:text-3xl dark:text-white">
        {school.name}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {school.location}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-md border border-gaucho-blue/20 bg-gaucho-blue/5 px-3 py-1.5 text-xs font-medium text-gaucho-blue dark:border-gaucho-gold/25 dark:bg-gaucho-blue/40 dark:text-gaucho-gold-light">
          {majors.length} BS majors
        </span>
        <span className="rounded-md border border-gaucho-gold/30 bg-gaucho-gold/10 px-3 py-1.5 text-xs font-medium text-gaucho-gold-dark dark:text-gaucho-gold">
          {available} interactive roadmap{available !== 1 ? "s" : ""}
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-gaucho-blue/30 dark:bg-gaucho-blue/20 dark:text-slate-300">
          Updated {catalog.last_updated}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={school.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gaucho-blue/25 px-4 py-2 text-sm font-medium text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light dark:hover:bg-gaucho-blue/40"
        >
          Official CoE site ↗
        </Link>
        <Link
          href={school.majors_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-gaucho-blue/30 dark:text-slate-300 dark:hover:bg-gaucho-blue/30"
        >
          Majors & programs ↗
        </Link>
        <a
          href={gear.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-gaucho-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-gaucho-blue-light"
        >
          {pdfLabel}
        </a>
      </div>
    </section>
  );
}
