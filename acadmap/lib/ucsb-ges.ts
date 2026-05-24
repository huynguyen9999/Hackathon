import { promises as fs } from "fs";
import path from "path";

import type {
  GeAreaCourse,
  GeAreaId,
  GeAreaInfo,
  GeCourseEntry,
} from "@/lib/ucsb-ges-types";
import { GE_AREAS } from "@/lib/ucsb-ges-types";
import { normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";

const GES_DIR = path.join(process.cwd(), "data", "ucsb", "grades", "ges");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function areaFileName(area: GeAreaId): string {
  return `${area.replace(/\s+/g, "-").replace(/[^\w-]/g, "")}.json`;
}

export async function listGeAreas(): Promise<GeAreaInfo[]> {
  const data = await readJsonFile<{ areas: GeAreaInfo[] }>(
    path.join(GES_DIR, "areas.json"),
  );
  return data?.areas ?? GE_AREAS;
}

export async function getGeAreasForCourse(
  courseId: string,
): Promise<GeAreaId[]> {
  const normalized = normalizeGradesCourseId(courseId);
  const data = await readJsonFile<{ courses: Record<string, GeAreaId[]> }>(
    path.join(GES_DIR, "by-course.json"),
  );
  return data?.courses[normalized] ?? [];
}

export async function getCoursesForArea(
  area: GeAreaId,
): Promise<GeAreaCourse[]> {
  const data = await readJsonFile<{ courses: GeAreaCourse[] }>(
    path.join(GES_DIR, "by-area", areaFileName(area)),
  );
  return data?.courses ?? [];
}

export async function getGeCourseIndex(): Promise<GeCourseEntry[]> {
  const data = await readJsonFile<{ courses: Record<string, GeAreaId[]> }>(
    path.join(GES_DIR, "by-course.json"),
  );
  if (!data?.courses) return [];
  return Object.entries(data.courses).map(([courseId, areas]) => ({
    courseId,
    areas,
  }));
}
