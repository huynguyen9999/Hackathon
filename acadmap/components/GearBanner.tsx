import type { CoeCatalog } from "@/lib/ucsb-coe";

export type GearBannerProps = {
  gear: CoeCatalog["gear"];
  className?: string;
};

export function GearBanner({ gear, className = "" }: GearBannerProps) {
  return (
    <div
      className={`rounded-xl border border-violet-500/30 bg-gradient-to-r from-indigo-950/80 to-violet-950/50 p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
            Official source · {gear.catalog_year}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">
            General Engineering Academic Requirements (GEAR)
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">{gear.note}</p>
        </div>
        <a
          href={gear.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500"
        >
          Open 25-26 GEAR PDF ↗
        </a>
      </div>
    </div>
  );
}
