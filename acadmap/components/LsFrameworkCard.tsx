import type { LsRequirementsFramework } from "@/lib/ucsb-ls";

export function LsFrameworkCard({ framework }: { framework: LsRequirementsFramework }) {
  return (
    <section className="rounded-2xl border border-teal-500/20 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-slate-50">
        All L&S students must complete
      </h2>
      <p className="mt-1 text-sm text-slate-400">{framework.total_units}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300/80">
            University requirements
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {framework.university_requirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300/80">
            GE — general subject (A–G)
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {framework.ge_general_subject_areas.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300/80">
          GE — special subjects
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {framework.ge_special_subject_areas.map((item) => (
            <span
              key={item}
              className="rounded-full border border-teal-500/25 bg-teal-950/30 px-3 py-1 text-xs text-teal-100"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
