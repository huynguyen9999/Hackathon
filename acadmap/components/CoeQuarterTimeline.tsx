"use client";

import { useMemo } from "react";

import {
  buildCoeTimelineWithGe,
  coeGeFrameworkSummary,
} from "@/lib/coe-planning";
import type { CoeGeFramework } from "@/lib/ucsb-coe";
import type { CoeMajorDetail, PlanEntry } from "@/lib/coe-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type CoeQuarterTimelineProps = {
  detail: CoeMajorDetail;
  coeGeFramework: CoeGeFramework;
};

function EntryBadge({ entry }: { entry: PlanEntry }) {
  if (isPlanSlot(entry)) {
    const colors =
      entry.slot === "GE"
        ? "border-gaucho-gold/30 bg-gaucho-blue-dark/40 text-gaucho-blue dark:text-gaucho-gold-light"
        : entry.slot === "ELECTIVE"
          ? "border-gaucho-blue/30 bg-gaucho-blue/5 dark:bg-gaucho-blue/40 text-gaucho-blue dark:text-gaucho-gold-light"
          : "border-gaucho-blue-light/30 bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40 text-gaucho-blue dark:text-gaucho-gold-light";
    return (
      <span
        className={`block rounded-lg border px-2 py-1.5 text-[11px] leading-tight ${colors}`}
      >
        {entry.label}
      </span>
    );
  }

  return (
    <span className="block rounded-lg border border-slate-300 dark:border-slate-600/40 bg-white dark:bg-slate-900/80 px-2 py-1.5 text-[11px] leading-tight text-slate-800 dark:text-slate-200">
      <span className="font-mono text-gaucho-blue dark:text-gaucho-gold-light">{entry.code}</span>
      {entry.units != null && (
        <span className="text-slate-900 dark:text-slate-500"> · {entry.units}u</span>
      )}
      {entry.notes ? (
        <span className="mt-0.5 block text-[10px] text-slate-900 dark:text-slate-500">{entry.notes}</span>
      ) : null}
    </span>
  );
}

export function CoeQuarterTimeline({
  detail,
  coeGeFramework,
}: CoeQuarterTimelineProps) {
  const timeline = useMemo(
    () =>
      buildCoeTimelineWithGe(
        detail.recommended_plans,
        "freshman",
        detail.quarter_totals ?? [],
      ),
    [detail.recommended_plans, detail.quarter_totals],
  );

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const q of timeline) set.add(q.year);
    return Array.from(set).sort((a, b) => a - b);
  }, [timeline]);

  return (
    <div className="card-glow rounded-2xl border border-gaucho-blue-light/25 bg-slate-50 dark:bg-slate-900/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          GEAR 4-year plan — {detail.graduation_units} units
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {coeGeFrameworkSummary(coeGeFramework)}. Quarter totals from GEAR
          GRID — verify on GOLD.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-3 gap-2 border-b border-slate-300 dark:border-slate-700/50 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-500">
            <span>Fall</span>
            <span>Winter</span>
            <span>Spring</span>
          </div>
          {years.map((year) => (
            <div key={year} className="mt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
                Year {year}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["Fall", "Winter", "Spring"] as const).map((quarter) => {
                  const q = timeline.find(
                    (t) => t.year === year && t.quarter === quarter,
                  );
                  if (!q) return null;
                  const entries: PlanEntry[] = [
                    ...q.majorEntries,
                    ...q.geSlots.map((s) => ({
                      slot: s.slot,
                      label: s.label,
                      units: s.units,
                    })),
                  ];
                  const headerExtra =
                    q.gearTotalUnits != null ? ` · ${q.gearTotalUnits}u GEAR` : "";
                  return (
                    <div
                      key={quarter}
                      className="min-h-[120px] rounded-xl border border-slate-300/60 dark:border-slate-300 dark:border-slate-700/40 bg-slate-100 dark:bg-slate-950/30 p-2"
                    >
                      <p className="mb-2 text-[10px] font-medium uppercase text-slate-900 dark:text-slate-500">
                        {quarter}
                        {headerExtra}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {entries.length === 0 ? (
                          <span className="text-[11px] text-slate-600">
                            GE / electives
                          </span>
                        ) : (
                          entries.map((entry, i) => (
                            <EntryBadge
                              key={
                                isPlanSlot(entry)
                                  ? `${entry.label}-${i}`
                                  : `${entry.code}-${i}`
                              }
                              entry={entry}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
