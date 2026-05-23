"use client";

import type { AuditSnapshot, ValidationIssue } from "@/lib/planner/contracts";

export type ValidationPanelProps = {
  issues: ValidationIssue[];
  auditSnapshot: AuditSnapshot | null;
};

export function ValidationPanel({ issues, auditSnapshot }: ValidationPanelProps) {
  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Validation & degree audit
      </h2>

      <div className="mt-3 space-y-2">
        {issues.length === 0 ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
            No planner validation issues.
          </p>
        ) : (
          issues.map((issue) => (
            <p
              key={issue.id}
              className={[
                "rounded-md px-3 py-2 text-xs",
                issue.severity === "error"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-200",
              ].join(" ")}
            >
              {issue.message}
            </p>
          ))
        )}
      </div>

      {auditSnapshot ? (
        <div className="mt-4 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-3 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
          <p className="text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
            {auditSnapshot.completionPercent}% complete · {auditSnapshot.remainingUnits} units remaining
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {auditSnapshot.buckets.map((bucket) => (
              <li key={bucket.key}>
                {bucket.label}: {bucket.completed}/{bucket.required} units ({bucket.percent}%)
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Degree audit overlay unavailable for this roadmap.
        </p>
      )}
    </section>
  );
}
