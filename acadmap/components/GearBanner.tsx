import type { CoeCatalog } from "@/lib/ucsb-coe";

export type GearBannerProps = {
  gear: CoeCatalog["gear"];
  className?: string;
  headline?: string;
  buttonLabel?: string;
};

export function GearBanner({
  gear,
  className = "",
  headline = "General Engineering Academic Requirements (GEAR)",
  buttonLabel,
}: GearBannerProps) {
  const btn =
    buttonLabel ?? `Open ${gear.catalog_year} GEAR PDF ↗`;

  return (
    <div
      className={`rounded-lg border border-gaucho-blue/20 bg-gaucho-blue/5 p-5 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/60 sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Official source · {gear.catalog_year}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {headline}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
            {gear.note}
          </p>
        </div>
        <a
          href={gear.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-gaucho-blue px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gaucho-blue-light"
        >
          {btn}
        </a>
      </div>
    </div>
  );
}
