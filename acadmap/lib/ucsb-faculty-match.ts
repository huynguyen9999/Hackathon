import type { DepartmentFacultyFile, FacultyMember } from "@/lib/ucsb-faculty-types";
import { KEY_CONTACT_ROLES } from "@/lib/ucsb-faculty-types";

function normalizeCareerToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function careerOutcomeMatches(
  facultyTags: string[] | undefined,
  careerOutcomes: string[],
): boolean {
  if (!facultyTags?.length || !careerOutcomes.length) return false;

  const normalizedOutcomes = careerOutcomes.map(normalizeCareerToken);
  for (const tag of facultyTags) {
    const normalizedTag = normalizeCareerToken(tag);
    for (const outcome of normalizedOutcomes) {
      if (
        outcome.includes(normalizedTag) ||
        normalizedTag.includes(outcome) ||
        outcome.split(" ").some(
          (word) => word.length > 3 && normalizedTag.includes(word),
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

export function getCareerAlignedFaculty(
  faculty: DepartmentFacultyFile,
  careerOutcomes: string[],
): FacultyMember[] {
  return faculty.members.filter((member) =>
    careerOutcomeMatches(member.career_tags, careerOutcomes),
  );
}

function normalizeCourseCode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, " ");
}

export function facultyForCourse(
  faculty: DepartmentFacultyFile,
  courseLabel: string,
): FacultyMember[] {
  const normalizedLabel = normalizeCourseCode(courseLabel);
  return faculty.members.filter((member) =>
    member.teaches?.some(
      (course) => normalizeCourseCode(course) === normalizedLabel,
    ),
  );
}

export function facultyForCareerLabel(
  faculty: DepartmentFacultyFile,
  careerLabel: string,
): FacultyMember[] {
  const normalized = normalizeCareerToken(careerLabel);
  return faculty.members.filter((member) =>
    member.career_tags?.some((tag) => {
      const tagNorm = normalizeCareerToken(tag);
      return tagNorm.includes(normalized) || normalized.includes(tagNorm);
    }),
  );
}

export function getKeyContacts(
  faculty: DepartmentFacultyFile,
): FacultyMember[] {
  return faculty.members.filter((member) =>
    member.roles?.some((role) => KEY_CONTACT_ROLES.includes(role)),
  );
}
