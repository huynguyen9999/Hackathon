import { GearBanner } from "@/components/GearBanner";
import type { CoeCatalog } from "@/lib/ucsb-coe";
import type { CcsCatalog } from "@/lib/ucsb-ccs";
import type { LsCatalog } from "@/lib/ucsb-ls";

export type CollegeBannerProps = {
  variant: "engineering" | "letters-science" | "creative-studies";
  coeCatalog?: CoeCatalog | null;
  lsCatalog?: LsCatalog | null;
  ccsCatalog?: CcsCatalog | null;
  schoolShortName?: string;
  className?: string;
};

export function CollegeBanner({
  variant,
  coeCatalog,
  lsCatalog,
  ccsCatalog,
  schoolShortName,
  className = "",
}: CollegeBannerProps) {
  if (variant === "engineering" && coeCatalog?.gear) {
    const isUcla = schoolShortName === "ucla";
    return (
      <GearBanner
        gear={coeCatalog.gear}
        className={className}
        headline={
          isUcla
            ? "UCLA Samueli School Announcement"
            : "General Engineering Academic Requirements (GEAR)"
        }
        buttonLabel={
          isUcla
            ? `Open ${coeCatalog.gear.catalog_year} Announcement PDF ↗`
            : undefined
        }
      />
    );
  }

  if (variant === "letters-science" && lsCatalog) {
    const { requirements_framework: rf, college } = lsCatalog;
    return (
      <div
        className={`rounded-lg border border-gaucho-blue/20 bg-gaucho-blue/5 p-5 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/60 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
              Official sources · L&S
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              Letters & Science Academic Requirements (LASAR)
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {rf.lasar_note}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {rf.total_units} · {rf.upper_division_units} upper-division units ·
              GE Areas A–G + special subjects (WRT, EUR, NWC, QNT, ETH)
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={college.duels_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gaucho-blue px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gaucho-blue-light"
            >
              DUELS degree requirements ↗
            </a>
            <a
              href={college.admissions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gaucho-blue/25 px-5 py-2.5 text-center text-sm font-medium text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light dark:hover:bg-gaucho-blue/40"
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
        className={`rounded-lg border border-gaucho-blue/20 bg-gaucho-blue/5 p-5 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/60 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
              Official sources · CCS
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              College of Creative Studies requirements
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {rf.ccs_ge_note}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {rf.total_units} · {rf.ccs_ge_courses} CCS GE courses · Ethnicity
              required · 6-quarter CCS residency
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={handbook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gaucho-blue px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gaucho-blue-light"
            >
              {handbook.catalog_year} Student Handbook ↗
            </a>
            <a
              href={college.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gaucho-blue/25 px-5 py-2.5 text-center text-sm font-medium text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light dark:hover:bg-gaucho-blue/40"
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
