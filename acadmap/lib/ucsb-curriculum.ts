import { promises as fs } from "fs";
import path from "path";

import {
  getUcsbApiKey,
  getUcsbCurriculumCacheHours,
} from "@/lib/env";
import type {
  UcsbCourseLevel,
  UcsbCoursePrimary,
  UcsbCourseSearchParams,
  UcsbCourseSearchResult,
  UcsbCourseSection,
  UcsbCurriculumSnapshot,
  UcsbQuarter,
  UcsbSubject,
} from "@/lib/ucsb-curriculum-types";
export { OFFICIAL_COURSE_SEARCH_URL } from "@/lib/ucsb-curriculum-types";

const CURRICULUM_DIR = path.join(process.cwd(), "data", "ucsb", "curriculum");
const API_SEARCH =
  "https://api.ucsb.edu/academics/curriculums/v1/classes/search";

type ApiClassSection = {
  enrollCode?: string;
  section?: string;
  session?: string;
  classSection?: string;
  instructor?: string;
  timeLocations?: string;
  enrolledTotal?: number;
  maxEnroll?: number;
};

type ApiCoursePage = {
  classes?: ApiClassEntry[];
  totalCount?: number;
};

type ApiClassEntry = {
  courseInfo?: {
    courseId?: string;
    title?: string;
    description?: string;
    units?: number;
    subjectCode?: string;
    objLevelCode?: string;
  };
  classSections?: ApiClassSection[];
};

function snapshotPath(
  quarter: string,
  subjectCode: string,
  level: UcsbCourseLevel,
): string {
  return path.join(
    CURRICULUM_DIR,
    "snapshots",
    quarter,
    `${subjectCode.toUpperCase()}-${level}.json`,
  );
}

function normalizeSection(raw: ApiClassSection): UcsbCourseSection {
  return {
    enrollCode: raw.enrollCode ?? "",
    section: raw.section ?? raw.classSection ?? "",
    session: raw.session,
    classSection: raw.classSection,
    instructor: raw.instructor,
    timeLocations: raw.timeLocations,
    enrolledTotal: raw.enrolledTotal,
    maxEnroll: raw.maxEnroll,
  };
}

function groupPrimaries(entries: ApiClassEntry[]): UcsbCoursePrimary[] {
  const byCourse = new Map<string, UcsbCoursePrimary>();

  for (const entry of entries) {
    const info = entry.courseInfo;
    if (!info?.courseId) continue;

    const key = info.courseId.trim().toUpperCase();
    const existing = byCourse.get(key);

    const sections = (entry.classSections ?? [])
      .map(normalizeSection)
      .filter((s) => s.enrollCode || s.section);

    if (existing) {
      existing.sections.push(...sections);
      continue;
    }

    byCourse.set(key, {
      courseId: key,
      title: info.title ?? key,
      description: info.description,
      units: info.units,
      subjectCode: (info.subjectCode ?? key.split(/\s+/)[0] ?? "").toUpperCase(),
      objLevelCode: info.objLevelCode ?? "U",
      sections,
    });
  }

  return Array.from(byCourse.values()).sort((a, b) =>
    a.courseId.localeCompare(b.courseId),
  );
}

function normalizeApiPage(json: ApiCoursePage): UcsbCoursePrimary[] {
  return groupPrimaries(json.classes ?? []);
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadSnapshot(
  quarter: string,
  subjectCode: string,
  level: UcsbCourseLevel,
): Promise<UcsbCurriculumSnapshot | null> {
  return readJsonFile<UcsbCurriculumSnapshot>(
    snapshotPath(quarter, subjectCode, level),
  );
}

async function fetchLiveCourses(
  params: UcsbCourseSearchParams,
): Promise<UcsbCourseSearchResult | null> {
  const apiKey = getUcsbApiKey();
  if (!apiKey) return null;

  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 100;
  const subject = params.subjectCode.toUpperCase();

  let url: string;
  if (params.level === "A") {
    url = `${API_SEARCH}?quarter=${params.quarter}&subjectCode=${subject}&pageNumber=${pageNumber}&pageSize=${pageSize}&includeClassSections=true`;
  } else {
    url = `${API_SEARCH}?quarter=${params.quarter}&subjectCode=${subject}&objLevelCode=${params.level}&pageNumber=${pageNumber}&pageSize=${pageSize}&includeClassSections=true`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "ucsb-api-version": "1.0",
      "ucsb-api-key": apiKey,
    },
    next: { revalidate: getUcsbCurriculumCacheHours() * 3600 },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as ApiCoursePage;
  const courses = normalizeApiPage(json);

  return {
    quarter: params.quarter,
    subjectCode: subject,
    level: params.level,
    courses,
    source: "live",
    fetchedAt: new Date().toISOString(),
    totalCount: json.totalCount ?? courses.length,
  };
}

export async function listSubjects(): Promise<UcsbSubject[]> {
  const data = await readJsonFile<{ subjects: UcsbSubject[] }>(
    path.join(CURRICULUM_DIR, "subjects.json"),
  );
  return data?.subjects ?? [];
}

export async function listQuarters(): Promise<UcsbQuarter[]> {
  const data = await readJsonFile<{ quarters: UcsbQuarter[] }>(
    path.join(CURRICULUM_DIR, "quarters.json"),
  );
  return data?.quarters ?? [];
}

export function getDefaultQuarter(quarters: UcsbQuarter[]): string {
  return quarters[0]?.code ?? "20252";
}

export async function searchCourses(
  params: UcsbCourseSearchParams,
  options?: { query?: string },
): Promise<UcsbCourseSearchResult> {
  const subjectCode = params.subjectCode.toUpperCase();
  const normalized = { ...params, subjectCode };

  const live = await fetchLiveCourses(normalized);
  if (live) {
    return filterCourses(live, options?.query);
  }

  const snapshot = await loadSnapshot(
    normalized.quarter,
    subjectCode,
    normalized.level,
  );

  if (snapshot) {
    const result: UcsbCourseSearchResult = {
      quarter: snapshot.quarter,
      subjectCode: snapshot.subjectCode,
      level: snapshot.level,
      courses: snapshot.courses,
      source: "snapshot",
      fetchedAt: snapshot.fetchedAt,
      totalCount: snapshot.courses.length,
    };
    return filterCourses(result, options?.query);
  }

  return {
    quarter: normalized.quarter,
    subjectCode,
    level: normalized.level,
    courses: [],
    source: "snapshot",
    fetchedAt: new Date().toISOString(),
    totalCount: 0,
  };
}

function filterCourses(
  result: UcsbCourseSearchResult,
  query?: string,
): UcsbCourseSearchResult {
  const q = query?.trim().toLowerCase();
  if (!q) return result;

  const courses = result.courses.filter(
    (c) =>
      c.courseId.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q),
  );

  return { ...result, courses, totalCount: courses.length };
}

import {
  buildCatalogUrl,
  buildCatalogUrlFromCourseLabel,
  parseCourseLabel,
} from "@/lib/ucsb-curriculum-urls";
export {
  buildCatalogUrl,
  buildCatalogUrlFromCourseLabel,
  parseCourseLabel,
} from "@/lib/ucsb-curriculum-urls";
