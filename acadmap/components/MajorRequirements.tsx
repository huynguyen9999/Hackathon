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
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-700/80 dark:text-indigo-300/80">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 before:content-['•'] before:text-indigo-400"
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
    <div className="card-glow rounded-2xl border border-indigo-500/20 bg-slate-50 dark:bg-slate-900/50 p-6">
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
          className="text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:text-violet-800 dark:text-violet-200"
        >
          Department / catalog ↗
        </a>
      </div>

      {major.notes && (
        <p className="mb-6 rounded-lg border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-100/90">
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
        <div className="mt-8 rounded-lg border border-indigo-500/15 bg-slate-50 dark:bg-slate-950/50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-700/80 dark:text-indigo-300/80">
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
                  className="rounded bg-indigo-500/15 px-2 py-0.5 font-mono text-[11px] text-indigo-800 dark:text-indigo-200"
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
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300/80">
            Typical career paths
          </h3>
          <div className="flex flex-wrap gap-2">
            {major.career_outcomes.map((career) => (
              <span
                key={career}
                className="rounded-full border border-violet-500/25 bg-violet-950/30 px-3 py-1 text-xs text-violet-100"
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
