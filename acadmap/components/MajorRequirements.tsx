import type { UcsbMajor } from "@/lib/ucsb-types";

export type MajorRequirementsProps = {
  major: UcsbMajor;
  /** GEAR (engineering) vs LASAR (L&S) label */
  requirementsLabel?: string;
  pageRefLabel?: string;
};

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-blue/80 dark:text-gaucho-gold/80">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 before:content-['•'] before:text-gaucho-blue-light"
          >
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MajorRequirements({
  major,
  requirementsLabel = "Major requirements",
  pageRefLabel,
}: MajorRequirementsProps) {
  const ref =
    pageRefLabel ??
    (major.gear_page != null ? ` · ref. p.${major.gear_page}` : "");

  return (
    <div className="card-glow rounded-2xl border border-gaucho-blue-light/20 bg-slate-50 dark:bg-slate-900/50 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {requirementsLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {major.degree_type} · {major.graduation_units ?? "180"} units to
            graduate
            {ref}
          </p>
        </div>
        <a
          href={major.curriculum_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gaucho-blue dark:text-gaucho-gold hover:text-gaucho-blue dark:text-gaucho-gold-light"
        >
          Department / catalog ↗
        </a>
      </div>

      {major.notes && (
        <p className="mb-6 rounded-lg border border-gaucho-blue/20 bg-gaucho-gold/10 dark:bg-gaucho-blue/20 px-3 py-2 text-sm text-gaucho-blue dark:text-gaucho-gold-light/90">
          {major.notes}
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <RequirementList
          title="Preparation for the major"
          items={major.preparation_for_major}
        />
        <RequirementList
          title="Upper-division required"
          items={major.upper_division_required}
        />
      </div>

      {major.departmental_electives_note && (
        <div className="mt-8 rounded-lg border border-gaucho-blue-light/15 bg-slate-50 dark:bg-slate-950/50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-blue/80 dark:text-gaucho-gold/80">
            Electives
            {major.departmental_electives_units != null &&
              ` (${major.departmental_electives_units} units)`}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {major.departmental_electives_note}
          </p>
          {major.sample_electives.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {major.sample_electives.map((code) => (
                <span
                  key={code}
                  className="rounded bg-gaucho-blue-light/15 px-2 py-0.5 font-mono text-[11px] text-gaucho-blue dark:text-gaucho-gold-light"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {major.career_outcomes.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold/80">
            Typical career paths
          </h3>
          <div className="flex flex-wrap gap-2">
            {major.career_outcomes.map((career) => (
              <span
                key={career}
                className="rounded-full border border-gaucho-gold/25 bg-gaucho-blue-dark/30 px-3 py-1 text-xs text-gaucho-gold-light"
              >
                {career}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
