"use client";

import { useMemo, useState } from "react";

import {
  buildCcsTimelineWithGe,
  ccsFrameworkSummary,
} from "@/lib/ccs-planning";
import type { CcsMajorDetail } from "@/lib/ccs-major-detail-types";
import type { CcsRequirementsFramework } from "@/lib/ucsb-ccs";
import type { PlanEntry, PlanTrack } from "@/lib/ucsb-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type CcsQuarterTimelineProps = {
  detail: CcsMajorDetail;
  ccsFramework: CcsRequirementsFramework;
};

const TRACK_LABELS: Record<PlanTrack, string> = {
  freshman: "Freshman start",
  transfer: "Transfer",
  bs_ms: "BS/MS (5-year)",
  bs_ms_transfer: "BS/MS transfer",
};

function EntryBadge({ entry }: { entry: PlanEntry }) {
  if (isPlanSlot(entry)) {
    const colors =
      entry.slot === "CCS_GE" || entry.slot === "GE"
        ? "border-gaucho-blue/30 bg-gaucho-gold/10 dark:bg-gaucho-blue/40 text-gaucho-gold-dark dark:text-gaucho-gold-light"
        : entry.slot === "ELECTIVE"
          ? "border-gaucho-gold/30 bg-gaucho-gold/10 text-gaucho-blue-dark dark:text-gaucho-gold-light"
          : "border-slate-500/30 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200";
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
      <span className="font-mono text-gaucho-gold-dark dark:text-gaucho-gold-light">{entry.code}</span>
      {entry.units != null && (
        <span className="text-slate-900 dark:text-slate-500"> · {entry.units}u</span>
      )}
      {entry.notes ? (
        <span className="mt-0.5 block text-[10px] text-slate-900 dark:text-slate-500">{entry.notes}</span>
      ) : null}
    </span>
  );
}

export function CcsQuarterTimeline({
  detail,
  ccsFramework,
}: CcsQuarterTimelineProps) {
  const availableTracks = useMemo(() => {
    const set = new Set<PlanTrack>();
    for (const p of detail.recommended_plans) {
      set.add(p.track);
    }
    return (["freshman", "transfer", "bs_ms", "bs_ms_transfer"] as PlanTrack[]).filter(
      (t) => set.has(t),
    );
  }, [detail.recommended_plans]);

  const [track, setTrack] = useState<PlanTrack>(
    availableTracks[0] ?? "freshman",
  );

  const timeline = useMemo(
    () =>
      buildCcsTimelineWithGe(
        detail.recommended_plans,
        track,
        detail.quarter_totals ?? [],
      ),
    [detail.recommended_plans, detail.quarter_totals, track],
  );

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const q of timeline) set.add(q.year);
    return Array.from(set).sort((a, b) => a - b);
  }, [timeline]);

  return (
    <div className="card-glow rounded-2xl border border-gaucho-blue/25 bg-slate-50 dark:bg-slate-900/50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            4-year plan — {detail.graduation_units} units
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {ccsFrameworkSummary(ccsFramework)}.{" "}
            {detail.quality_tier === "flexible"
              ? "Suggested plan — finalize with faculty advisor."
              : "From official major sheet — verify on GOLD."}
          </p>
        </div>
        {availableTracks.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {availableTracks.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  track === t
                    ? "bg-gaucho-blue text-white"
                    : "border border-slate-300 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:border-gaucho-blue/40"
                }`}
              >
                {TRACK_LABELS[t]}
              </button>
            ))}
          </div>
        ) : null}
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
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold/90">
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
                    q.sheetTotalUnits != null
                      ? ` · ${q.sheetTotalUnits}u sheet`
                      : "";
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
