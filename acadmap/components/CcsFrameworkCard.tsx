import type { CcsRequirementsFramework } from "@/lib/ucsb-ccs";

export function CcsFrameworkCard({ framework }: { framework: CcsRequirementsFramework }) {
  return (
    <section className="rounded-2xl border border-gaucho-blue/20 bg-slate-50 dark:bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        All CCS students must complete
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{framework.total_units}</p>
      <p className="mt-2 text-sm text-gaucho-blue dark:text-gaucho-gold-light/80">{framework.ccs_ge_note}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold/80">
            University requirements
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {framework.university_requirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold/80">
            CCS General Education ({framework.ccs_ge_courses} courses)
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {framework.ccs_ge_distribution.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
