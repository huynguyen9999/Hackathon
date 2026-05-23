import Link from "next/link";

import type { UcsbMajor } from "@/lib/ucsb-types";

export type MajorCatalogGridProps = {
  majors: UcsbMajor[];
  getMajorHref: (majorSlug: string) => string;
  badgeLabel?: string;
  ctaLabel?: string;
  showRequirementsLevel?: boolean;
};

export function MajorCatalogGrid({
  majors,
  getMajorHref,
  badgeLabel = "Catalog",
  ctaLabel = "View requirements",
  showRequirementsLevel = false,
}: MajorCatalogGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {majors.map((major) => (
        <li key={major.slug}>
          <Link
            href={getMajorHref(major.slug)}
            className="card-glow group flex h-full flex-col rounded-2xl border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 p-5 transition hover:border-gaucho-gold/40 hover:bg-white/95 dark:bg-slate-900/90"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="rounded-lg bg-gaucho-blue-light/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold-light ring-1 ring-gaucho-blue-light/25">
                {major.degree_type}
              </span>
              {major.roadmap_available ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
                  Live graph
                </span>
              ) : showRequirementsLevel && major.requirements_level === "roadmap" ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
                  Live graph
                </span>
              ) : showRequirementsLevel && major.requirements_level === "gear" ? (
                <span className="rounded-full bg-gaucho-blue-light/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gaucho-blue dark:text-gaucho-gold-light">
                  GEAR detail
                </span>
              ) : showRequirementsLevel && major.detail_available ? (
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-200">
                  {major.requirements_level === "sheet" || major.requirements_level === "roadmap"
                    ? "Sheet detail"
                    : "Catalog detail"}
                </span>
              ) : showRequirementsLevel && major.requirements_level === "full" ? (
                <span className="rounded-full bg-gaucho-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gaucho-blue dark:text-gaucho-gold-light">
                  Full requirements
                </span>
              ) : showRequirementsLevel && major.requirements_level === "partial" ? (
                <span className="rounded-full bg-gaucho-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gaucho-gold-dark dark:text-gaucho-gold-light">
                  Partial
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                  {badgeLabel}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 group-hover:text-gaucho-blue-dark dark:text-gaucho-gold-light">
              {major.name}
            </h3>
            <p className="mt-1 text-xs text-slate-900 dark:text-slate-500">{major.department}</p>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {major.graduation_units ?? "180"} units
              {major.gear_page != null && ` · ref. p.${major.gear_page}`}
            </p>

            <p className="mt-2 text-xs text-slate-900 dark:text-slate-500 line-clamp-2">
              {major.preparation_for_major.length} prep ·{" "}
              {major.upper_division_required.length} upper-div required
            </p>

            <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold transition group-hover:gap-2 group-hover:text-gaucho-blue dark:text-gaucho-gold-light">
              {ctaLabel}
              <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
