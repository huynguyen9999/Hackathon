"use client";

import type { GradeOffering } from "@/lib/ucsb-grades-types";
import { formatGpa } from "@/lib/ucsb-grades-utils";

export type GradeOfferingTableProps = {
  offerings: GradeOffering[];
};

export function GradeOfferingTable({ offerings }: GradeOfferingTableProps) {
  if (offerings.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No offerings on record.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gaucho-blue-light/20 dark:border-gaucho-gold/15">
      <table className="w-full text-left text-xs">
        <thead className="bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40">
          <tr>
            <th className="px-3 py-2 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Quarter
            </th>
            <th className="px-3 py-2 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Instructor
            </th>
            <th className="px-3 py-2 font-semibold text-gaucho-blue dark:text-gaucho-gold">
              Avg GPA
            </th>
            <th className="hidden px-3 py-2 font-semibold text-gaucho-blue dark:text-gaucho-gold sm:table-cell">
              Students
            </th>
          </tr>
        </thead>
        <tbody>
          {offerings.map((o, i) => (
            <tr
              key={`${o.quarter}-${o.year}-${o.instructor}-${i}`}
              className="border-t border-gaucho-blue-light/10"
            >
              <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                {o.quarter} {o.year}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                {o.instructor || "—"}
              </td>
              <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">
                {formatGpa(o.avgGpa)}
              </td>
              <td className="hidden px-3 py-2 text-slate-600 dark:text-slate-400 sm:table-cell">
                {o.nLetterStudents}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
