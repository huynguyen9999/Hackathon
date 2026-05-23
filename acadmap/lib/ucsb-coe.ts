import { promises as fs } from "fs";
import path from "path";

import type { CoeMajorDetail } from "@/lib/coe-major-detail-types";
import type { UcsbMajor, UcsbSchoolInfo, UcsbSource } from "@/lib/ucsb-types";

export type CoeMajor = UcsbMajor;
export type CoeCourseRef = {
  code: string;
  title: string;
  units: number;
};

export const COE_COLLEGE_SLUG = "engineering";

export type CoeGeFramework = {
  total_units: string;
  university_requirements: string[];
  ge_general_subject_areas: string[];
  ge_special_subject_areas: string[];
  gear_note: string;
};

export type CoeCatalog = {
  school: UcsbSchoolInfo & {
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
  gear_framework: CoeGeFramework;
  majors: CoeMajor[];
  sources: UcsbSource[];
  last_updated: string;
};

const CATALOG_PATH = path.join(process.cwd(), "data", "ucsb", "coe-catalog.json");
const MAJOR_DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "coe-majors");

export function coeMajorDetailPath(slug: string): string {
  return path.join(MAJOR_DETAIL_DIR, `${slug}.json`);
}

export async function loadCoeMajorDetail(
  majorSlug: string,
): Promise<CoeMajorDetail | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadCoeMajorDetail() is server-only");
  }

  try {
    const raw = await fs.readFile(coeMajorDetailPath(majorSlug.toLowerCase()), "utf-8");
    return JSON.parse(raw) as CoeMajorDetail;
  } catch {
    return null;
  }
}

export async function isCoeMajorSlug(majorSlug: string): Promise<boolean> {
  const major = await getUcsbMajorBySlug(majorSlug);
  return major != null;
}

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

export function coeMajorHubHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/schools/${schoolShortName}/${COE_COLLEGE_SLUG}/${majorSlug}`;
}

/** @deprecated Use coeMajorHubHref */
export function majorHubHref(schoolShortName: string, majorSlug: string): string {
  return coeMajorHubHref(schoolShortName, majorSlug);
}

export function coeCollegeHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}/${COE_COLLEGE_SLUG}`;
}

export function schoolHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}`;
}
