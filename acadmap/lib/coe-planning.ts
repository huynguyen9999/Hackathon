import type { CoeGeFramework } from "@/lib/ucsb-coe";
import type { CoeMajorDetail, PlanEntry, PlanTrack, PlanYear, QuarterName } from "@/lib/coe-major-detail-types";
import { isPlanSlot } from "@/lib/ucsb-major-detail-types";

export type GeSlotTemplate = {
  slot: "GE" | "LASAR";
  label: string;
  units: number;
};

/** CoE GE pacing — Areas A, D×2, E×2, F, G + special subjects (GEAR pp. 11–13). */
export const DEFAULT_COE_GE_SLOTS: GeSlotTemplate[] = [
  { slot: "GE", label: "GE — Area D (Social Science)", units: 4 },
  { slot: "GE", label: "GE — Area E (Culture & Thought)", units: 4 },
  { slot: "GE", label: "GE — Area F (Arts)", units: 4 },
  { slot: "GE", label: "GE — Area G (Literature)", units: 4 },
  { slot: "GE", label: "GE — Area D (2nd course)", units: 4 },
  { slot: "GE", label: "GE — Area E (2nd course)", units: 4 },
  { slot: "LASAR", label: "CoE — Writing (4 courses)", units: 4 },
  { slot: "LASAR", label: "CoE — Ethnicity", units: 4 },
  { slot: "LASAR", label: "CoE — European or World Cultures", units: 4 },
  { slot: "GE", label: "GE — Additional breadth", units: 4 },
  { slot: "GE", label: "GE — Free elective", units: 4 },
  { slot: "GE", label: "GE — Free elective", units: 4 },
];

const QUARTERS: QuarterName[] = ["Fall", "Winter", "Spring"];

export type CoeTimelineQuarter = {
  year: PlanYear;
  quarter: QuarterName;
  majorEntries: PlanEntry[];
  geSlots: GeSlotTemplate[];
  gearTotalUnits?: number;
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

function hasGeInEntries(entries: PlanEntry[]): boolean {
  return entries.some(
    (e) =>
      isPlanSlot(e) &&
      (e.slot === "GE" || e.label.toUpperCase().includes("G.E.")),
  ) || entries.some(
    (e) =>
      !isPlanSlot(e) &&
      (e.code.startsWith("WRIT") || e.code.includes("G.E.")),
  );
}

export function buildCoeTimelineWithGe(
  plans: CoeMajorDetail["recommended_plans"],
  track: PlanTrack,
  quarterTotals: { year: PlanYear; quarter: QuarterName; units: number }[] = [],
  geSlots: GeSlotTemplate[] = DEFAULT_COE_GE_SLOTS,
  targetUnitsPerQuarter = 12,
): CoeTimelineQuarter[] {
  const trackPlans = plans.filter((x) => x.track === track);
  const byKey = new Map<string, PlanEntry[]>();
  const totalsByKey = new Map<string, number>();

  for (const p of trackPlans) {
    byKey.set(quarterKey(p.year, p.quarter), p.entries);
  }
  for (const t of quarterTotals) {
    totalsByKey.set(quarterKey(t.year, t.quarter), t.units);
  }

  const maxYear = Math.min(
    5,
    trackPlans.reduce((max, p) => Math.max(max, p.year), 4),
  ) as PlanYear;

  const timeline: CoeTimelineQuarter[] = [];
  let geIndex = 0;

  for (let year = 1; year <= maxYear; year += 1) {
    for (const quarter of QUARTERS) {
      const key = quarterKey(year, quarter);
      const majorEntries = byKey.get(key) ?? [];
      const filled: GeSlotTemplate[] = [];
      let units = majorUnits(majorEntries);

      const gearTotal = totalsByKey.get(key);
      const skipGeInjection = hasGeInEntries(majorEntries);

      while (
        !skipGeInjection &&
        units < targetUnitsPerQuarter &&
        geIndex < geSlots.length
      ) {
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
        gearTotalUnits: gearTotal,
      });
    }
  }

  return timeline;
}

export function coeGeFrameworkSummary(framework: CoeGeFramework): string {
  return `${framework.total_units} · CoE GE Areas A, D, E, F, G + writing, ethnicity, world/European traditions`;
}
