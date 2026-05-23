import { promises as fs } from "fs";
import path from "path";

import { LS_DEPT_META, resolveLsSlug } from "@/lib/ucsb-dept-urls";
import type { DepartmentFacultyFile } from "@/lib/ucsb-faculty-types";

const FACULTY_DIR = path.join(process.cwd(), "data", "ucsb", "faculty");

export function facultyFilePath(departmentSlug: string): string {
  return path.join(FACULTY_DIR, `${departmentSlug}.json`);
}

export async function loadDepartmentFaculty(
  departmentSlug: string,
): Promise<DepartmentFacultyFile | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadDepartmentFaculty() is server-only");
  }

  try {
    const raw = await fs.readFile(facultyFilePath(departmentSlug), "utf-8");
    return JSON.parse(raw) as DepartmentFacultyFile;
  } catch {
    return null;
  }
}

export function departmentSlugForMajor(majorSlug: string): string | null {
  const meta = LS_DEPT_META[resolveLsSlug(majorSlug)];
  return meta?.department_slug ?? null;
}

export async function loadDepartmentFacultyForMajor(
  majorSlug: string,
): Promise<DepartmentFacultyFile | null> {
  const departmentSlug = departmentSlugForMajor(majorSlug);
  if (!departmentSlug) return null;
  return loadDepartmentFaculty(departmentSlug);
}

export {
  careerOutcomeMatches,
  facultyForCareerLabel,
  facultyForCourse,
  getCareerAlignedFaculty,
  getKeyContacts,
} from "@/lib/ucsb-faculty-match";
