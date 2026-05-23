import { promises as fs } from "fs";
import path from "path";

import {
  CCS_COLLEGE_SLUG,
  ccsCollegeHubHref,
  ccsMajorHubHref,
} from "@/lib/ucsb-paths";
import type { CcsMajorDetail } from "@/lib/ccs-major-detail-types";
import type { UcsbMajor, UcsbSchoolInfo, UcsbSource } from "@/lib/ucsb-types";

export { CCS_COLLEGE_SLUG, ccsCollegeHubHref, ccsMajorHubHref };

export type CcsRequirementsFramework = {
  total_units: string;
  upper_division_units: number;
  university_requirements: string[];
  ccs_ge_distribution: string[];
  ccs_ge_note: string;
  ccs_ge_courses: number;
};

export type CcsHandbook = {
  catalog_year: string;
  pdf_url: string;
  note: string;
};

export type CcsCatalog = {
  school: UcsbSchoolInfo & {
    college?: string;
    official_url?: string;
    majors_url?: string;
  };
  handbook: CcsHandbook;
  college: {
    name: string;
    slug: string;
    official_url: string;
    apply_url: string;
    majors_url: string;
    catalog_url: string;
    catalog_degrees_url: string;
  };
  requirements_framework: CcsRequirementsFramework;
  majors: UcsbMajor[];
  sources: UcsbSource[];
  last_updated: string;
};

const CATALOG_PATH = path.join(process.cwd(), "data", "ucsb", "ccs-catalog.json");
const MAJOR_DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "ccs-majors");

export function ccsMajorDetailPath(slug: string): string {
  return path.join(MAJOR_DETAIL_DIR, `${slug}.json`);
}

export async function loadCcsMajorDetail(
  majorSlug: string,
): Promise<CcsMajorDetail | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadCcsMajorDetail() is server-only");
  }

  try {
    const raw = await fs.readFile(ccsMajorDetailPath(majorSlug), "utf-8");
    return JSON.parse(raw) as CcsMajorDetail;
  } catch {
    return null;
  }
}

export async function loadUcsbCcsCatalog(): Promise<CcsCatalog | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadUcsbCcsCatalog() is server-only");
  }

  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf-8");
    return JSON.parse(raw) as CcsCatalog;
  } catch {
    return null;
  }
}

export async function getUcsbCcsMajorBySlug(
  majorSlug: string,
): Promise<UcsbMajor | null> {
  const catalog = await loadUcsbCcsCatalog();
  if (!catalog) return null;
  return catalog.majors.find((m) => m.slug === majorSlug) ?? null;
}

export async function isCcsMajorSlug(majorSlug: string): Promise<boolean> {
  return (await getUcsbCcsMajorBySlug(majorSlug)) != null;
}
