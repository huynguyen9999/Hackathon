import type { GradDepartment } from "@/lib/ucsb-grad-programs-types";

export function getDepartmentRoadmapSlugs(dept: GradDepartment): string[] {
  if (dept.roadmap_slugs?.length) return dept.roadmap_slugs;
  if (dept.roadmap_slug) return [dept.roadmap_slug];
  return [];
}
