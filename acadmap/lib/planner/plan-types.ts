import type { PlannedCourseState } from "@/lib/planner/contracts";

export const PLANNER_YEARS = [1, 2, 3, 4] as const;
export const PLANNER_QUARTERS = ["Fall", "Winter"] as const;

export type PlannerYear = (typeof PLANNER_YEARS)[number];
export type PlannerQuarterName = (typeof PLANNER_QUARTERS)[number];

export type QuarterKey = `${PlannerYear}-${PlannerQuarterName}`;

export const DEFAULT_UNIT_TARGET = {
  min: 8,
  max: 20,
};

export function quarterKey(year: PlannerYear, quarter: PlannerQuarterName): QuarterKey {
  return `${year}-${quarter}`;
}

export function parseQuarterKey(key: string): { year: PlannerYear; quarter: PlannerQuarterName } | null {
  const [yearRaw, quarterRaw] = key.split("-");
  const year = Number(yearRaw);
  if (!PLANNER_YEARS.includes(year as PlannerYear)) return null;
  if (!PLANNER_QUARTERS.includes(quarterRaw as PlannerQuarterName)) return null;
  return { year: year as PlannerYear, quarter: quarterRaw as PlannerQuarterName };
}

export function plannerQuarterIndex(key: QuarterKey): number {
  const parsed = parseQuarterKey(key);
  if (!parsed) return Number.POSITIVE_INFINITY;
  return (parsed.year - 1) * PLANNER_QUARTERS.length + PLANNER_QUARTERS.indexOf(parsed.quarter);
}

export function statusMapFromCourseStates(
  states: PlannedCourseState[],
): Record<string, "planned" | "completed"> {
  return Object.fromEntries(states.map((state) => [state.nodeId, state.status]));
}
