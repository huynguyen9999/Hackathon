"use client";

import type { GradesSearchEntry } from "@/lib/ucsb-grades-types";
import { formatGpa } from "@/lib/ucsb-grades-utils";

export type GradesResultsTableProps = {
  courses: GradesSearchEntry[];
  selectedCourseId: string | null;
  onSelect: (course: GradesSearchEntry) => void;
};

export function GradesResultsTable({
  courses,
  selectedCourseId,
  onSelect,
}: GradesResultsTableProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-12 text-center dark:bg-slate-900/40">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No courses match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gaucho-blue-light/25 dark:border-gaucho-gold/20">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gaucho-blue-light/20 bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40">
          <tr>
            <th className="px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Course
            </th>
            <th className="px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Avg GPA
            </th>
            <th className="hidden px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold sm:table-cell">
              Offerings
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const selected = selectedCourseId === course.courseId;
            return (
              <tr
                key={course.courseId}
                onClick={() => onSelect(course)}
                className={[
                  "cursor-pointer border-b border-gaucho-blue-light/10 transition last:border-0",
                  selected
                    ? "bg-teal-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-gaucho-blue dark:text-gaucho-gold">
                    {course.courseId}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">{course.dept}</span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                  {formatGpa(course.avgGpa)}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 sm:table-cell">
                  {course.offeringCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
