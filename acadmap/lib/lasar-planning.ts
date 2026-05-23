import type { LsRequirementsFramework } from "@/lib/ucsb-ls";
import type { PlanEntry, PlanTrack, PlanYear, QuarterPlan, QuarterName } from "@/lib/ucsb-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type GeSlotTemplate = {
  slot: "GE" | "LASAR";
  label: string;
  units: number;
};

/** Suggested GE/LASAR pacing across 12 quarters (freshman track). */
export const DEFAULT_GE_SLOTS: GeSlotTemplate[] = [
  { slot: "GE", label: "GE — Area A (Writing)", units: 4 },
  { slot: "GE", label: "GE — Area C (Science/Math)", units: 4 },
  { slot: "GE", label: "GE — Area D (Social Science)", units: 4 },
  { slot: "GE", label: "GE — Area E (Culture & Thought)", units: 4 },
  { slot: "GE", label: "GE — Area F (Arts)", units: 4 },
  { slot: "GE", label: "GE — Area G (Literature)", units: 4 },
  { slot: "GE", label: "GE — Area B (Foreign Language)", units: 4 },
  { slot: "LASAR", label: "LASAR — Writing (WRT)", units: 4 },
  { slot: "LASAR", label: "LASAR — European Traditions (EUR)", units: 4 },
  { slot: "LASAR", label: "LASAR — World Cultures (NWC)", units: 4 },
  { slot: "LASAR", label: "LASAR — Quantitative (QNT)", units: 4 },
  { slot: "LASAR", label: "LASAR — Ethnicity (ETH)", units: 4 },
  { slot: "GE", label: "GE — Area D (2nd course)", units: 4 },
  { slot: "GE", label: "GE — Area E (2nd course)", units: 4 },
  { slot: "GE", label: "GE — Area B (level 2+)", units: 4 },
  { slot: "GE", label: "GE — Area B (level 3+)", units: 4 },
  { slot: "GE", label: "GE — Additional breadth", units: 4 },
  { slot: "GE", label: "GE — Additional breadth", units: 4 },
];

const QUARTERS: QuarterName[] = ["Fall", "Winter", "Spring"];

export type TimelineQuarter = {
  year: PlanYear;
  quarter: QuarterName;
  majorEntries: PlanEntry[];
  geSlots: GeSlotTemplate[];
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

/** Merge major plan with GE/LASAR slots in quarters with fewer than target major units. */
export function buildTimelineWithGe(
  plans: QuarterPlan[],
  track: PlanTrack,
  geSlots: GeSlotTemplate[] = DEFAULT_GE_SLOTS,
  targetUnitsPerQuarter = 12,
): TimelineQuarter[] {
  const trackPlans = plans.filter((x) => x.track === track);
  const byKey = new Map<string, PlanEntry[]>();
  for (const p of trackPlans) {
    byKey.set(quarterKey(p.year, p.quarter), p.entries);
  }

  const maxYear = Math.min(
    5,
    trackPlans.reduce((max, p) => Math.max(max, p.year), 4),
  ) as PlanYear;

  const timeline: TimelineQuarter[] = [];
  let geIndex = 0;

  for (let year = 1; year <= maxYear; year += 1) {
    for (const quarter of QUARTERS) {
      const majorEntries = byKey.get(quarterKey(year, quarter)) ?? [];
      const filled: GeSlotTemplate[] = [];
      let units = majorUnits(majorEntries);

      while (units < targetUnitsPerQuarter && geIndex < geSlots.length) {
        const slot = geSlots[geIndex];
        geIndex += 1;
        filled.push(slot);
        units += slot.units;
      }

      timeline.push({
        year: year as PlanYear,
        quarter,
        majorEntries,
        geSlots: filled,
      });
    }
  }

  return timeline;
}

export function lasarFrameworkSummary(framework: LsRequirementsFramework): string {
  return `${framework.total_units} · ${framework.upper_division_units} upper-division units · GE Areas A–G + special subjects`;
}
