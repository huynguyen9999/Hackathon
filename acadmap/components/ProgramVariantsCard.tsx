import type { ProgramVariant } from "@/lib/ucsb-major-detail-types";

export type ProgramVariantsCardProps = {
  variants: ProgramVariant[];
};

export function ProgramVariantsCard({ variants }: ProgramVariantsCardProps) {
  if (!variants.length) return null;

  return (
    <div className="card-glow rounded-2xl border border-gaucho-blue-light/25 bg-slate-50 dark:bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Combined degree pathways</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Optional programs beyond the standard B.S. — verify eligibility with department advisors.
      </p>
      <div className="mt-5 space-y-4">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="rounded-xl border border-gaucho-blue-light/20 bg-slate-50 dark:bg-slate-950/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gaucho-blue-dark dark:text-gaucho-gold-light">{variant.label}</h3>
                <p className="mt-0.5 text-xs text-slate-900 dark:text-slate-500">{variant.degree}</p>
              </div>
              {variant.url ? (
                <a
                  href={variant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gaucho-blue dark:text-gaucho-gold hover:text-gaucho-blue dark:text-gaucho-gold-light"
                >
                  Program page ↗
                </a>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{variant.summary}</p>
            {variant.notes?.length ? (
              <ul className="mt-3 space-y-1 text-xs text-slate-900 dark:text-slate-500">
                {variant.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
