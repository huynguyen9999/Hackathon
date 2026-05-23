"use client";

import type { UcsbCoursePrimary } from "@/lib/ucsb-curriculum-types";

export type CourseResultsTableProps = {
  courses: UcsbCoursePrimary[];
  selectedCourseId: string | null;
  onSelect: (course: UcsbCoursePrimary) => void;
};

export function CourseResultsTable({
  courses,
  selectedCourseId,
  onSelect,
}: CourseResultsTableProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-12 text-center dark:bg-slate-900/40">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No courses match your filters. Try another subject, quarter, or level.
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
              Code
            </th>
            <th className="px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Title
            </th>
            <th className="hidden px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold sm:table-cell">
              Units
            </th>
            <th className="hidden px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold md:table-cell">
              Sections
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const selected = selectedCourseId === course.courseId;
            const isGrad = course.objLevelCode === "G";

            return (
              <tr
                key={course.courseId}
                onClick={() => onSelect(course)}
                className={[
                  "cursor-pointer border-b border-gaucho-blue-light/10 transition last:border-0",
                  selected
                    ? "bg-gaucho-gold/15 dark:bg-gaucho-gold/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gaucho-blue dark:text-gaucho-gold">
                      {course.courseId}
                    </span>
                    {isGrad && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-200">
                        Graduate
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {course.title}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 sm:table-cell">
                  {course.units ?? "—"}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 md:table-cell">
                  {course.sections.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
