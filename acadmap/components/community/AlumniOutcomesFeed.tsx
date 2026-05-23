"use client";

import { AlumniOutcomeForm } from "@/components/community/AlumniOutcomeForm";
import { useCommunitySession } from "@/components/community/useCommunitySession";
import type { AlumniOutcome } from "@/lib/community/types";

export type AlumniOutcomesFeedProps = {
  schoolShortName: string;
  outcomes: AlumniOutcome[];
};

export function AlumniOutcomesFeed({
  schoolShortName,
  outcomes,
}: AlumniOutcomesFeedProps) {
  const session = useCommunitySession();

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Alumni outcomes
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Where grads are working — community-submitted and moderated.
      </p>
      {outcomes.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map((o, i) => (
            <li
              key={`${o.role}-${o.company}-${i}`}
              className="rounded-lg border border-slate-200 p-3 dark:border-gaucho-blue/25"
            >
              <p className="font-medium text-slate-900 dark:text-white">
                {o.role}
              </p>
              {o.company ? (
                <p className="text-sm text-gaucho-blue dark:text-gaucho-gold">
                  {o.company}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">
                {o.major_slug ? `${o.major_slug.replace(/-/g, " ")} · ` : ""}
                {o.grad_year ? `Class of ${o.grad_year}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No approved outcomes yet.</p>
      )}
      {session.signedIn ? (
        <AlumniOutcomeForm schoolShortName={schoolShortName} />
      ) : null}
    </section>
  );
}
