import type { GradeBucketCounts } from "@/lib/ucsb-grades-types";

export type GradeChartSegment = {
  key: string;
  label: string;
  count: number;
  colorClass: string;
};

export const LETTER_GRADE_SEGMENTS: {
  key: keyof GradeBucketCounts;
  label: string;
  colorClass: string;
}[] = [
  { key: "Ap", label: "A+", colorClass: "bg-emerald-600" },
  { key: "A", label: "A", colorClass: "bg-emerald-500" },
  { key: "Am", label: "A-", colorClass: "bg-emerald-400" },
  { key: "Bp", label: "B+", colorClass: "bg-lime-500" },
  { key: "B", label: "B", colorClass: "bg-lime-400" },
  { key: "Bm", label: "B-", colorClass: "bg-yellow-400" },
  { key: "Cp", label: "C+", colorClass: "bg-amber-400" },
  { key: "C", label: "C", colorClass: "bg-amber-500" },
  { key: "Cm", label: "C-", colorClass: "bg-orange-400" },
  { key: "Dp", label: "D+", colorClass: "bg-orange-500" },
  { key: "D", label: "D", colorClass: "bg-red-400" },
  { key: "Dm", label: "D-", colorClass: "bg-red-500" },
  { key: "F", label: "F", colorClass: "bg-red-700" },
];

export function countsToSegments(counts: GradeBucketCounts): GradeChartSegment[] {
  return LETTER_GRADE_SEGMENTS.map(({ key, label, colorClass }) => ({
    key,
    label,
    count: counts[key] ?? 0,
    colorClass,
  })).filter((s) => s.count > 0);
}

export function totalLetterGrades(counts: GradeBucketCounts): number {
  return LETTER_GRADE_SEGMENTS.reduce((sum, { key }) => sum + (counts[key] ?? 0), 0);
}

export function formatGpa(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}
