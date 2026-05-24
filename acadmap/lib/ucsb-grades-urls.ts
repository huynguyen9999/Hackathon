import { parseCourseLabel } from "@/lib/ucsb-curriculum-urls";

export type GradesUrlOptions = {
  course?: string;
  dept?: string;
  area?: string;
  q?: string;
  sort?: "avgGpa" | "offerings" | "name";
  tab?: "search" | "ge" | "leaderboards";
};

export function normalizeGradesCourseId(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const parsed = parseCourseLabel(trimmed);
  if (parsed) {
    return `${parsed.subjectCode} ${parsed.courseNumber}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

export function buildGradesUrl(options: GradesUrlOptions = {}): string {
  const params = new URLSearchParams();
  if (options.tab) params.set("tab", options.tab);
  if (options.course) params.set("course", normalizeGradesCourseId(options.course));
  if (options.dept) params.set("dept", options.dept.toUpperCase());
  if (options.area) params.set("area", options.area);
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.sort) params.set("sort", options.sort);
  const qs = params.toString();
  return `/schools/ucsb/grades${qs ? `?${qs}` : ""}`;
}
