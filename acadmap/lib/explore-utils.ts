import type { ExploreMajor } from "@/lib/explore-types";

export const COLLEGE_LABELS: Record<
  ExploreMajor["college"],
  string
> = {
  engineering: "College of Engineering",
  "letters-science": "Letters & Science",
  "creative-studies": "Creative Studies",
};

export function getUniqueDepartments(majors: ExploreMajor[]): string[] {
  return Array.from(new Set(majors.map((m) => m.department))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getUniqueDegreeTypes(majors: ExploreMajor[]): string[] {
  return Array.from(new Set(majors.map((m) => m.degreeType))).sort((a, b) =>
    a.localeCompare(b),
  );
}
