"use client";

import Link from "next/link";

import { GradeDistributionChart } from "@/components/grades/GradeDistributionChart";
import { GradeOfferingTable } from "@/components/grades/GradeOfferingTable";
import type { CourseGradeAggregate } from "@/lib/ucsb-grades-types";
import { buildGradesUrl } from "@/lib/ucsb-grades-urls";
import { formatGpa } from "@/lib/ucsb-grades-utils";
import { DAILY_NEXUS_GRADES_URL } from "@/lib/ucsb-grades-types";

export type GradesCourseDetailProps = {
  course: CourseGradeAggregate | null;
  geAreas?: string[];
};

export function GradesCourseDetail({ course, geAreas = [] }: GradesCourseDetailProps) {
  if (!course) {
    return (
      <aside className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-10 text-center dark:bg-slate-900/40">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a course to view grade distributions and instructor history.
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col overflow-hidden rounded-xl border border-gaucho-blue-light/30 bg-white dark:bg-slate-900/95">
      <header className="border-b border-gaucho-blue-light/20 px-5 py-4">
        <span className="font-mono text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold">
          {course.courseId}
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 ring-1 ring-teal-400/30 dark:text-teal-200">
            Avg GPA {formatGpa(course.rollup.avgGpa)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {course.rollup.offeringCount} offerings
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {course.rollup.totalStudents.toLocaleString()} students
          </span>
        </div>
        {geAreas.length > 0 && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            GE: {geAreas.join(", ")}
          </p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
            Grade distribution (all quarters)
          </h3>
          <GradeDistributionChart counts={course.rollup.gradeDistribution} />
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
            Offerings
          </h3>
          <GradeOfferingTable offerings={course.offerings} />
        </section>

        <a
          href={DAILY_NEXUS_GRADES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-gaucho-blue underline dark:text-gaucho-gold"
        >
          View on Daily Nexus ↗
        </a>
      </div>
    </aside>
  );
}

export type GradeDistributionSummaryProps = {
  courseId: string;
  avgGpa: number | null;
  offeringCount: number;
  gradeDistribution: CourseGradeAggregate["rollup"]["gradeDistribution"];
};

export function GradeDistributionSummary({
  courseId,
  avgGpa,
  offeringCount,
  gradeDistribution,
}: GradeDistributionSummaryProps) {
  return (
    <section className="mb-6 rounded-lg border border-teal-500/20 bg-teal-50 dark:bg-teal-950/20 px-3 py-2.5">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-200">
        Grade distribution
      </h3>
      <p className="mb-2 text-xs text-teal-900/90 dark:text-teal-100/90">
        Avg GPA {formatGpa(avgGpa)} · {offeringCount} quarters on record (Daily Nexus)
      </p>
      <GradeDistributionChart counts={gradeDistribution} compact />
      <Link
        href={buildGradesUrl({ course: courseId })}
        className="mt-2 inline-block text-xs font-medium text-teal-800 underline dark:text-teal-200"
      >
        Full grade history →
      </Link>
    </section>
  );
}
