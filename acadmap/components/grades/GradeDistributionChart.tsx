"use client";

import type { GradeBucketCounts } from "@/lib/ucsb-grades-types";
import {
  countsToSegments,
  totalLetterGrades,
} from "@/lib/ucsb-grades-utils";

export type GradeDistributionChartProps = {
  counts: GradeBucketCounts;
  compact?: boolean;
};

export function GradeDistributionChart({
  counts,
  compact = false,
}: GradeDistributionChartProps) {
  const segments = countsToSegments(counts);
  const total = totalLetterGrades(counts);

  if (total === 0) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        No letter-grade data available.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={seg.colorClass}
            style={{ width: `${(seg.count / total) * 100}%` }}
            title={`${seg.label}: ${seg.count}`}
          />
        ))}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {segments.map((seg) => (
            <span key={seg.key} className="text-[10px] text-slate-600 dark:text-slate-400">
              <span className={`mr-1 inline-block h-2 w-2 rounded-sm ${seg.colorClass}`} />
              {seg.label} {((seg.count / total) * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
