"use client";

import { GradeDistributionCatalogSection } from "@/components/grades/GradeDistributionCatalogSection";
import {
  OFFICIAL_COURSE_SEARCH_URL,
  type UcsbCoursePrimary,
} from "@/lib/ucsb-curriculum-types";

export type CourseDetailPanelProps = {
  course: UcsbCoursePrimary | null;
};

export function CourseDetailPanel({ course }: CourseDetailPanelProps) {
  if (!course) {
    return (
      <aside className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-10 text-center dark:bg-slate-900/40">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a course to view description, instructors, and meeting times.
        </p>
      </aside>
    );
  }

  const isGrad = course.objLevelCode === "G";

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-gaucho-blue-light/30 bg-white dark:bg-slate-900/95">
      <header className="border-b border-gaucho-blue-light/20 bg-gradient-to-r from-gaucho-gold-light/40 to-white px-5 py-4 dark:from-gaucho-blue-dark/80 dark:to-slate-900/95">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold">
            {course.courseId}
          </span>
          {isGrad && (
            <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-200">
              Graduate
            </span>
          )}
          {course.units != null && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-300">
              {course.units} units
            </span>
          )}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          {course.title}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {course.description && (
          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {course.description}
            </p>
          </section>
        )}

        <GradeDistributionCatalogSection courseId={course.courseId} />

        {course.sections.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
              Sections ({course.sections.length})
            </h3>
            <ul className="space-y-2">
              {course.sections.map((section) => (
                <li
                  key={`${section.enrollCode}-${section.section}`}
                  className="rounded-lg border border-gaucho-blue-light/15 bg-slate-50 px-3 py-2.5 text-xs dark:bg-slate-800/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-gaucho-blue dark:text-gaucho-gold">
                      Sec {section.section || "—"}
                    </span>
                    {section.enrollCode && (
                      <span className="text-slate-500 dark:text-slate-400">
                        Enroll {section.enrollCode}
                      </span>
                    )}
                  </div>
                  {section.instructor && (
                    <p className="mt-1 text-slate-700 dark:text-slate-300">
                      {section.instructor}
                    </p>
                  )}
                  {section.timeLocations && (
                    <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                      {section.timeLocations}
                    </p>
                  )}
                  {section.enrolledTotal != null && section.maxEnroll != null && (
                    <p className="mt-0.5 text-slate-500">
                      {section.enrolledTotal}/{section.maxEnroll} enrolled
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <a
          href={OFFICIAL_COURSE_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gaucho-blue/20 px-3 py-2 text-xs font-medium text-gaucho-blue transition hover:border-gaucho-gold/40 hover:bg-gaucho-blue/5 dark:text-gaucho-gold"
        >
          View enroll restrictions on official site →
        </a>
      </div>
    </aside>
  );
}
