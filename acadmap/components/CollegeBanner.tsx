import { GearBanner } from "@/components/GearBanner";
import type { CoeCatalog } from "@/lib/ucsb-coe";
import type { CcsCatalog } from "@/lib/ucsb-ccs";
import type { LsCatalog } from "@/lib/ucsb-ls";

export type CollegeBannerProps = {
  variant: "engineering" | "letters-science" | "creative-studies";
  coeCatalog?: CoeCatalog | null;
  lsCatalog?: LsCatalog | null;
  ccsCatalog?: CcsCatalog | null;
  className?: string;
};

export function CollegeBanner({
  variant,
  coeCatalog,
  lsCatalog,
  ccsCatalog,
  className = "",
}: CollegeBannerProps) {
  if (variant === "engineering" && coeCatalog?.gear) {
    return <GearBanner gear={coeCatalog.gear} className={className} />;
  }

  if (variant === "letters-science" && lsCatalog) {
    const { requirements_framework: rf, college } = lsCatalog;
    return (
      <div
        className={`rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-950/80 to-indigo-950/50 p-5 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Official sources · L&S
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Letters & Science Academic Requirements (LASAR)
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{rf.lasar_note}</p>
            <p className="mt-2 text-xs text-slate-900 dark:text-slate-500">
              {rf.total_units} · {rf.upper_division_units} upper-division units ·
              GE Areas A–G + special subjects (WRT, EUR, NWC, QNT, ETH)
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={college.duels_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              DUELS degree requirements ↗
            </a>
            <a
              href={college.admissions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-teal-500/40 px-5 py-2.5 text-center text-sm font-medium text-teal-800 dark:text-teal-200 transition hover:bg-teal-950/50"
            >
              Admissions majors ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "creative-studies" && ccsCatalog) {
    const { requirements_framework: rf, college, handbook } = ccsCatalog;
    return (
      <div
        className={`rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/80 to-orange-950/50 p-5 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Official sources · CCS
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
              College of Creative Studies requirements
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{rf.ccs_ge_note}</p>
            <p className="mt-2 text-xs text-slate-900 dark:text-slate-500">
              {rf.total_units} · {rf.ccs_ge_courses} CCS GE courses · Ethnicity
              required · 6-quarter CCS residency
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={handbook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-amber-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              {handbook.catalog_year} Student Handbook ↗
            </a>
            <a
              href={college.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-amber-500/40 px-5 py-2.5 text-center text-sm font-medium text-amber-800 dark:text-amber-200 transition hover:bg-amber-950/50"
            >
              How to apply ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
