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
            className="card-glow group flex h-full flex-col rounded-2xl border border-indigo-500/25 bg-slate-900/60 p-5 transition hover:border-violet-400/40 hover:bg-slate-900/90"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200 ring-1 ring-indigo-400/25">
                {major.degree_type}
              </span>
              {major.roadmap_available ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
                  Live graph
                </span>
              ) : showRequirementsLevel && major.requirements_level === "full" ? (
                <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-200">
                  Full requirements
                </span>
              ) : showRequirementsLevel && major.requirements_level === "partial" ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                  Partial
                </span>
              ) : (
                <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                  {badgeLabel}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-50 group-hover:text-indigo-100">
              {major.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{major.department}</p>

            <p className="mt-3 text-sm text-slate-400">
              {major.graduation_units ?? "180"} units
              {major.gear_page != null && ` · ref. p.${major.gear_page}`}
            </p>

            <p className="mt-2 text-xs text-slate-500 line-clamp-2">
              {major.preparation_for_major.length} prep ·{" "}
              {major.upper_division_required.length} upper-div required
            </p>

            <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition group-hover:gap-2 group-hover:text-violet-200">
              {ctaLabel}
              <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
