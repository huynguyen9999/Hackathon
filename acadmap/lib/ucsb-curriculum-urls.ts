import type { UcsbCourseLevel } from "@/lib/ucsb-curriculum-types";

export function parseCourseLabel(
  label: string,
): { subjectCode: string; courseNumber: string } | null {
  const match = label.trim().match(/^(.+?)\s+(\d+\w*)$/i);
  if (!match) return null;
  return {
    subjectCode: match[1].trim().toUpperCase(),
    courseNumber: match[2],
  };
}

export function buildCatalogUrl(options: {
  quarter?: string;
  subject?: string;
  level?: UcsbCourseLevel;
  query?: string;
}): string {
  const params = new URLSearchParams();
  if (options.quarter) params.set("quarter", options.quarter);
  if (options.subject) params.set("subject", options.subject.toUpperCase());
  if (options.level) params.set("level", options.level);
  if (options.query) params.set("q", options.query);
  const qs = params.toString();
  return `/schools/ucsb/courses${qs ? `?${qs}` : ""}`;
}

export function buildCatalogUrlFromCourseLabel(
  label: string,
  quarter?: string,
): string | null {
  const parsed = parseCourseLabel(label);
  if (!parsed) return null;
  return buildCatalogUrl({
    quarter,
    subject: parsed.subjectCode,
    level: "A",
    query: parsed.courseNumber,
  });
}
