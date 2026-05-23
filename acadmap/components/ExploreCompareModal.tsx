"use client";

import Link from "next/link";

import type { ExploreMajor } from "@/lib/explore-types";

function normalizeCourse(code: string): string {
  return code.replace(/\s+/g, " ").trim().toUpperCase();
}

function sharedItems(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(normalizeCourse));
  return a.filter((item) => setB.has(normalizeCourse(item)));
}

export type ExploreCompareModalProps = {
  majors: [ExploreMajor, ExploreMajor] | null;
  onClose: () => void;
};

export function ExploreCompareModal({ majors, onClose }: ExploreCompareModalProps) {
  if (!majors) return null;

  const [left, right] = majors;
  const sharedPrep = sharedItems(
    left.preparationForMajor,
    right.preparationForMajor,
  );
  const sharedCareers = sharedItems(left.careerOutcomes, right.careerOutcomes);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gaucho-blue/20 bg-white p-6 shadow-xl dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="compare-title"
              className="text-lg font-semibold text-gaucho-blue dark:text-white"
            >
              Compare majors
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Insight into overlap—not a 4-year schedule planner.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-gaucho-blue/40"
            aria-label="Close compare"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[left, right].map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-gaucho-blue/10 p-3 dark:border-gaucho-gold/15"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
                {m.collegeLabel}
              </p>
              <h3 className="font-semibold text-gaucho-blue dark:text-white">
                {m.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{m.department}</p>
              <p className="mt-2 text-xs">
                {m.hasInteractiveGraph ? (
                  <Link
                    href={m.hrefGraph!}
                    className="font-medium text-gaucho-blue hover:underline dark:text-gaucho-gold"
                  >
                    Open graph →
                  </Link>
                ) : (
                  <span className="text-slate-500">No interactive graph yet</span>
                )}
                {" · "}
                <Link
                  href={m.hrefMajor}
                  className="text-gaucho-blue hover:underline dark:text-gaucho-gold-light"
                >
                  Major guide
                </Link>
              </p>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Shared preparation courses
          </h3>
          {sharedPrep.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {sharedPrep.map((c) => (
                <li
                  key={c}
                  className="rounded bg-gaucho-blue/10 px-2 py-1 font-mono text-xs text-gaucho-blue dark:text-gaucho-gold-light"
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No overlapping prep courses listed in catalog data.
            </p>
          )}
        </section>

        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Shared career outcomes
          </h3>
          {sharedCareers.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
              {sharedCareers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No overlapping career outcomes in catalog data.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
