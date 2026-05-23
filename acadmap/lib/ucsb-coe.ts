import { promises as fs } from "fs";
import path from "path";

export type CoeCourseRef = {
  code: string;
  title: string;
  units: number;
};

export type CoeMajor = {
  name: string;
  slug: string;
  degree_type: string;
  department: string;
  department_url: string;
  curriculum_url: string;
  course_grid_url?: string;
  gear_page?: number;
  graduation_units?: number;
  roadmap_available: boolean;
  preparation_for_major: string[];
  upper_division_required: string[];
  departmental_electives_units?: number;
  departmental_electives_note?: string;
  sample_electives: string[];
  career_outcomes: string[];
  /** @deprecated use preparation_for_major */
  core_courses?: CoeCourseRef[];
};

export type CoeCatalog = {
  school: {
    name: string;
    short_name: string;
    location: string;
    college: string;
    official_url: string;
    majors_url: string;
    gear_publications_url?: string;
  };
  gear: {
    catalog_year: string;
    pdf_url: string;
    note: string;
  };
  majors: CoeMajor[];
  sources: { title: string; url: string }[];
  last_updated: string;
};

const CATALOG_PATH = path.join(process.cwd(), "data", "ucsb", "coe-catalog.json");

export async function loadUcsbCoeCatalog(): Promise<CoeCatalog | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadUcsbCoeCatalog() is server-only");
  }

  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf-8");
    return JSON.parse(raw) as CoeCatalog;
  } catch {
    return null;
  }
}

export async function getUcsbMajorBySlug(
  majorSlug: string,
): Promise<CoeMajor | null> {
  const catalog = await loadUcsbCoeCatalog();
  if (!catalog) return null;
  return (
    catalog.majors.find((m) => m.slug === majorSlug.toLowerCase()) ?? null
  );
}

export function majorRoadmapHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/roadmap/${schoolShortName}/${majorSlug}`;
}

export function majorHubHref(schoolShortName: string, majorSlug: string): string {
  return `/schools/${schoolShortName}/${majorSlug}`;
}

export function schoolHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}`;
}
