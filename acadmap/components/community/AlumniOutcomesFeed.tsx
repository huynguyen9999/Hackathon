import type { AlumniOutcome } from "@/lib/community/types";

export type AlumniOutcomesFeedProps = {
  outcomes: AlumniOutcome[];
};

export function AlumniOutcomesFeed({ outcomes }: AlumniOutcomesFeedProps) {
  if (outcomes.length === 0) return null;

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Alumni outcomes
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Where grads are working — community-submitted and moderated.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {outcomes.map((o, i) => (
          <li
            key={`${o.role}-${o.company}-${i}`}
            className="rounded-lg border border-slate-200 p-3 dark:border-gaucho-blue/25"
          >
            <p className="font-medium text-slate-900 dark:text-white">{o.role}</p>
            {o.company ? (
              <p className="text-sm text-gaucho-blue dark:text-gaucho-gold">{o.company}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">
              {o.major_slug ? `${o.major_slug.replace(/-/g, " ")} · ` : ""}
              {o.grad_year ? `Class of ${o.grad_year}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
