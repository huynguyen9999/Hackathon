import type { CcsRequirementsFramework } from "@/lib/ucsb-ccs";
import type { PlanEntry, PlanTrack, PlanYear, QuarterPlan, QuarterName } from "@/lib/ucsb-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type CcsGeSlotTemplate = {
  slot: "CCS_GE";
  label: string;
  units: number;
};

/** Suggested CCS GE pacing: 8 unrelated courses + Ethnicity across 12 quarters. */
export const DEFAULT_CCS_GE_SLOTS: CcsGeSlotTemplate[] = [
  { slot: "CCS_GE", label: "CCS GE — STEM", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Social Science", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Arts/Humanities", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — STEM", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Social Science", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Arts/Humanities", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — STEM", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Ethnicity", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Social Science", units: 4 },
  { slot: "CCS_GE", label: "CCS GE — Arts/Humanities", units: 4 },
];

const QUARTERS: QuarterName[] = ["Fall", "Winter", "Spring"];

export type CcsTimelineQuarter = {
  year: PlanYear;
  quarter: QuarterName;
  majorEntries: PlanEntry[];
  geSlots: CcsGeSlotTemplate[];
  sheetTotalUnits?: number;
};

function quarterKey(year: number, quarter: QuarterName): string {
  return `${year}-${quarter}`;
}

function majorUnits(entries: PlanEntry[]): number {
  return entries.reduce((sum, e) => {
    if (isPlanSlot(e)) return sum + (e.units ?? 0);
    return sum + (e.units ?? 4);
  }, 0);
}

function hasCcsGeSlot(entries: PlanEntry[]): boolean {
  return entries.some((e) => isPlanSlot(e) && (e.slot === "CCS_GE" || e.slot === "GE"));
}

/** Merge major plan with CCS GE slots in quarters below target units. */
export function buildCcsTimelineWithGe(
  plans: QuarterPlan[],
  track: PlanTrack,
  quarterTotals: { year: PlanYear; quarter: QuarterName; units: number }[] = [],
  geSlots: CcsGeSlotTemplate[] = DEFAULT_CCS_GE_SLOTS,
  targetUnitsPerQuarter = 12,
): CcsTimelineQuarter[] {
  const trackPlans = plans.filter((x) => x.track === track);
  const byKey = new Map<string, PlanEntry[]>();
  for (const p of trackPlans) {
    byKey.set(quarterKey(p.year, p.quarter), p.entries);
  }

  const totalsByKey = new Map<string, number>();
  for (const t of quarterTotals) {
    totalsByKey.set(quarterKey(t.year, t.quarter), t.units);
  }

  const maxYear = Math.min(
    5,
    trackPlans.reduce((max, p) => Math.max(max, p.year), 4),
  ) as PlanYear;

  const timeline: CcsTimelineQuarter[] = [];
  let geIndex = 0;

  for (let year = 1; year <= maxYear; year += 1) {
    for (const quarter of QUARTERS) {
      const key = quarterKey(year, quarter);
      const majorEntries = byKey.get(key) ?? [];
      const filled: CcsGeSlotTemplate[] = [];
      let units = majorUnits(majorEntries);

      if (!hasCcsGeSlot(majorEntries)) {
        while (units < targetUnitsPerQuarter && geIndex < geSlots.length) {
          const slot = geSlots[geIndex];
          geIndex += 1;
          filled.push(slot);
          units += slot.units;
        }
      }

      timeline.push({
        year: year as PlanYear,
        quarter,
        majorEntries,
        geSlots: filled,
        sheetTotalUnits: totalsByKey.get(key),
      });
    }
  }

  return timeline;
}

export function ccsFrameworkSummary(framework: CcsRequirementsFramework): string {
  return `${framework.total_units} · ${framework.ccs_ge_courses} CCS GE courses (unrelated to major) · Ethnicity required`;
}
