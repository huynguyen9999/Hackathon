import { promises as fs } from "fs";
import path from "path";

import { resolveLsSlug } from "@/lib/ucsb-dept-urls";
import type { UcsbMajor, UcsbSchoolInfo, UcsbSource } from "@/lib/ucsb-types";

export type LsRequirementsFramework = {
  total_units: string;
  upper_division_units: number;
  university_requirements: string[];
  ge_general_subject_areas: string[];
  ge_special_subject_areas: string[];
  lasar_note: string;
};

export type LsLasar = {
  catalog_year: string;
  pdf_url: string;
  note: string;
};

export type LsCatalog = {
  school: UcsbSchoolInfo & {
    college?: string;
    official_url?: string;
    majors_url?: string;
  };
  lasar: LsLasar;
  college: {
    name: string;
    slug: string;
    official_url: string;
    admissions_url: string;
    duels_url: string;
    catalog_url: string;
  };
  requirements_framework: LsRequirementsFramework;
  majors: UcsbMajor[];
  sources: UcsbSource[];
  last_updated: string;
};

const CATALOG_PATH = path.join(process.cwd(), "data", "ucsb", "ls-catalog.json");

export const LS_COLLEGE_SLUG = "letters-science";

export async function loadUcsbLsCatalog(): Promise<LsCatalog | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadUcsbLsCatalog() is server-only");
  }

  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf-8");
    return JSON.parse(raw) as LsCatalog;
  } catch {
    return null;
  }
}

export async function getUcsbLsMajorBySlug(
  majorSlug: string,
): Promise<UcsbMajor | null> {
  const catalog = await loadUcsbLsCatalog();
  if (!catalog) return null;
  const slug = resolveLsSlug(majorSlug);
  return catalog.majors.find((m) => m.slug === slug) ?? null;
}

export function lsMajorHubHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/schools/${schoolShortName}/${LS_COLLEGE_SLUG}/${majorSlug}`;
}

export function lsCollegeHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}/${LS_COLLEGE_SLUG}`;
}
