import { promises as fs } from "fs";
import path from "path";

import { normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";
import type {
  CourseGradeAggregate,
  GradesLeaderboards,
  GradesMeta,
  GradesSearchEntry,
} from "@/lib/ucsb-grades-types";

const GRADES_DIR = path.join(process.cwd(), "data", "ucsb", "grades");
const BY_DEPT_DIR = path.join(GRADES_DIR, "by-dept");

export type GradesSearchParams = {
  q?: string;
  dept?: string;
  sort?: "avgGpa" | "offerings" | "name";
  limit?: number;
};

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

let searchIndexCache: GradesSearchEntry[] | null = null;

async function loadSearchIndex(): Promise<GradesSearchEntry[]> {
  if (searchIndexCache) return searchIndexCache;
  const data = await readJsonFile<{ courses: GradesSearchEntry[] }>(
    path.join(GRADES_DIR, "search-index.json"),
  );
  searchIndexCache = data?.courses ?? [];
  return searchIndexCache;
}

export async function getGradesMeta(): Promise<GradesMeta | null> {
  return readJsonFile<GradesMeta>(path.join(GRADES_DIR, "meta.json"));
}

export async function getLeaderboards(): Promise<GradesLeaderboards | null> {
  return readJsonFile<GradesLeaderboards>(
    path.join(GRADES_DIR, "leaderboards.json"),
  );
}

export async function searchGrades(
  params: GradesSearchParams,
): Promise<GradesSearchEntry[]> {
  const index = await loadSearchIndex();
  const q = params.q?.trim().toLowerCase();
  const dept = params.dept?.trim().toUpperCase();
  const sort = params.sort ?? "name";
  const limit = params.limit ?? 100;

  let results = index;

  if (dept) {
    results = results.filter((e) => e.dept === dept);
  }

  if (q) {
    results = results.filter(
      (e) =>
        e.courseId.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q),
    );
  }

  results = [...results].sort((a, b) => {
    if (sort === "avgGpa") {
      return (b.avgGpa ?? -1) - (a.avgGpa ?? -1);
    }
    if (sort === "offerings") {
      return b.offeringCount - a.offeringCount;
    }
    return a.courseId.localeCompare(b.courseId);
  });

  return results.slice(0, limit);
}

export async function getCourseGrades(
  courseId: string,
): Promise<CourseGradeAggregate | null> {
  const normalized = normalizeGradesCourseId(courseId);
  const index = await loadSearchIndex();
  const entry = index.find((e) => e.courseId === normalized);
  if (!entry) return null;

  const shard = await readJsonFile<{ courses: CourseGradeAggregate[] }>(
    path.join(BY_DEPT_DIR, `${entry.dept}.json`),
  );

  return shard?.courses.find((c) => c.courseId === normalized) ?? null;
}

export async function listGradeDepartments(): Promise<string[]> {
  const index = await loadSearchIndex();
  return Array.from(new Set(index.map((e) => e.dept))).sort((a, b) =>
    a.localeCompare(b),
  );
}
