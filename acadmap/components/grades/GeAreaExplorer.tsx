"use client";

import Link from "next/link";

import type { GeAreaId, GeAreaInfo } from "@/lib/ucsb-ges-types";
import type { GeAreaCourse } from "@/lib/ucsb-ges-types";
import { buildGradesUrl } from "@/lib/ucsb-grades-urls";
import { formatGpa } from "@/lib/ucsb-grades-utils";

export type GeAreaExplorerProps = {
  areas: GeAreaInfo[];
  selectedArea: GeAreaId | null;
  courses: GeAreaCourse[];
  loading?: boolean;
  onAreaChange: (area: GeAreaId) => void;
  onSelectCourse: (courseId: string) => void;
};

export function GeAreaExplorer({
  areas,
  selectedArea,
  courses,
  loading = false,
  onAreaChange,
  onSelectCourse,
}: GeAreaExplorerProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          GE areas
        </h3>
        <ul className="max-h-[480px] space-y-1 overflow-y-auto rounded-xl border border-gaucho-blue-light/25 p-2 dark:border-gaucho-gold/20">
          {areas.map((area) => {
            const active = selectedArea === area.id;
            return (
              <li key={area.id}>
                <button
                  type="button"
                  onClick={() => onAreaChange(area.id)}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    active
                      ? "bg-teal-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  {area.label}
                </button>
              </li>
            );
          })}
        </ul>
        {selectedArea && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {areas.find((a) => a.id === selectedArea)?.description}
          </p>
        )}
      </div>

      <div>
        {!selectedArea ? (
          <div className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-12 text-center dark:bg-slate-900/40">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select a GE area to browse qualifying courses with average GPA.
            </p>
          </div>
        ) : loading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading courses…</p>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-50 px-6 py-12 text-center dark:bg-slate-900/40">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No courses listed for this area.
            </p>
          </div>
        ) : (
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="border-b border-gaucho-blue-light/10 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onSelectCourse(course.courseId)}
                        className="font-mono text-xs font-semibold text-gaucho-blue underline-offset-2 hover:underline dark:text-gaucho-gold"
                      >
                        {course.courseId}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {formatGpa(course.avgGpa)}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Link
                        href={buildGradesUrl({ course: course.courseId, tab: "search" })}
                        className="text-xs font-medium text-teal-700 underline dark:text-teal-200"
                      >
                        View grades
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
