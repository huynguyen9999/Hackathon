import { GearBanner } from "@/components/GearBanner";
import type { CoeCatalog } from "@/lib/ucsb-coe";
import type { LsCatalog } from "@/lib/ucsb-ls";

export type CollegeBannerProps = {
  variant: "engineering" | "letters-science";
  coeCatalog?: CoeCatalog | null;
  lsCatalog?: LsCatalog | null;
  className?: string;
};

export function CollegeBanner({
  variant,
  coeCatalog,
  lsCatalog,
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
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Official sources · L&S
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">
              Letters & Science Academic Requirements (LASAR)
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{rf.lasar_note}</p>
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
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              DUELS degree requirements ↗
            </a>
            <a
              href={college.admissions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-teal-500/40 px-5 py-2.5 text-center text-sm font-medium text-teal-200 transition hover:bg-teal-950/50"
            >
              Admissions majors ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
