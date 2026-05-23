"use client";

import { useMemo, useState } from "react";

import type { LsRequirementsFramework } from "@/lib/ucsb-ls";
import { buildTimelineWithGe, lasarFrameworkSummary } from "@/lib/lasar-planning";
import type { LsMajorDetail, PlanEntry } from "@/lib/ucsb-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type QuarterTimelineProps = {
  detail: LsMajorDetail;
  lasarFramework: LsRequirementsFramework;
};

function EntryBadge({ entry }: { entry: PlanEntry }) {
  if (isPlanSlot(entry)) {
    const colors =
      entry.slot === "GE"
        ? "border-violet-500/30 bg-violet-950/40 text-violet-200"
        : entry.slot === "ELECTIVE"
          ? "border-teal-500/30 bg-teal-950/40 text-teal-200"
          : "border-indigo-500/30 bg-indigo-950/40 text-indigo-200";
    return (
      <span
        className={`block rounded-lg border px-2 py-1.5 text-[11px] leading-tight ${colors}`}
      >
        {entry.label}
      </span>
    );
  }

  return (
    <span className="block rounded-lg border border-slate-600/40 bg-slate-900/80 px-2 py-1.5 text-[11px] leading-tight text-slate-200">
      <span className="font-mono text-teal-200">{entry.code}</span>
      {entry.units != null && (
        <span className="text-slate-500"> · {entry.units}u</span>
      )}
    </span>
  );
}

export function QuarterTimeline({ detail, lasarFramework }: QuarterTimelineProps) {
  const [track, setTrack] = useState<"freshman" | "transfer">("freshman");

  const timeline = useMemo(
    () => buildTimelineWithGe(detail.recommended_plans, track),
    [detail.recommended_plans, track],
  );

  const hasTransfer = detail.recommended_plans.some((p) => p.track === "transfer");

  return (
    <div className="card-glow rounded-2xl border border-teal-500/20 bg-slate-900/50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Recommended 4-year plan
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {lasarFrameworkSummary(lasarFramework)}. GE/LASAR slots fill quarters
            below ~12 major units — verify on GOLD.
          </p>
        </div>
        {hasTransfer && (
          <div className="flex rounded-lg border border-slate-600/40 p-0.5">
            <button
              type="button"
              onClick={() => setTrack("freshman")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                track === "freshman"
                  ? "bg-teal-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Freshman start
            </button>
            <button
              type="button"
              onClick={() => setTrack("transfer")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                track === "transfer"
                  ? "bg-teal-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Transfer
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-4 gap-2 border-b border-slate-700/50 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Fall</span>
            <span>Winter</span>
            <span>Spring</span>
            <span className="text-slate-600">—</span>
          </div>
          {[1, 2, 3, 4].map((year) => (
            <div key={year} className="mt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-300/90">
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
                  return (
                    <div
                      key={quarter}
                      className="min-h-[120px] rounded-xl border border-slate-700/40 bg-slate-950/30 p-2"
                    >
                      <p className="mb-2 text-[10px] font-medium uppercase text-slate-500">
                        {quarter}
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
                                  : entry.code
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
