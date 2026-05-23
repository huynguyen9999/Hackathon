import type { MajorRegulations } from "@/lib/ucsb-major-detail-types";

export type MajorRegulationsCardProps = {
  regulations: MajorRegulations;
};

export function MajorRegulationsCard({ regulations }: MajorRegulationsCardProps) {
  return (
    <div className="rounded-2xl border border-gaucho-blue/20 bg-gaucho-gold/10 dark:bg-gaucho-blue/15 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Major regulations</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {regulations.pre_major_gpa != null && (
          <>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
              Pre-major GPA
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              {regulations.pre_major_gpa}+ UC GPA on pre-major courses
            </dd>
          </>
        )}
        {regulations.major_gpa != null && (
          <>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
              Major GPA
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              {regulations.major_gpa}+ in all prep and upper-division major courses
            </dd>
          </>
        )}
        {regulations.letter_grade_minimum && (
          <>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
              Minimum grade
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">
              {regulations.letter_grade_minimum} or better in major courses
            </dd>
          </>
        )}
        {regulations.pnp_allowed === false && (
          <>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
              P/NP grading
            </dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">Not allowed for major courses</dd>
          </>
        )}
      </dl>

      {regulations.transfer_admission_rules?.length ? (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
            Transfer admission
          </h3>
          <ul className="mt-2 space-y-1.5">
            {regulations.transfer_admission_rules.map((rule) => (
              <li
                key={rule}
                className="text-sm text-slate-700 dark:text-slate-300 before:mr-2 before:text-gaucho-gold before:content-['•']"
              >
                {rule}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {regulations.excluded_courses?.length ? (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold-light/80">
            Courses that do not count
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {regulations.excluded_courses.map((code) => (
              <span
                key={code}
                className="rounded bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-400"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {regulations.other?.map((note) => (
        <p key={note} className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          {note}
        </p>
      ))}
    </div>
  );
}
