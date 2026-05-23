import {
  getCoeMajorBySlug as getCoeMajorBySlugForSchool,
  loadCoeCatalog as loadCoeCatalogForSchool,
  loadCoeMajorDetail as loadCoeMajorDetailForSchool,
} from "@/lib/school-catalog";
import type { UcsbMajor, UcsbSchoolInfo, UcsbSource } from "@/lib/ucsb-types";

export type { CoeMajorDetail } from "@/lib/coe-major-detail-types";

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

const UCSB = "ucsb";

export async function loadCoeMajorDetail(
  majorSlug: string,
  schoolShortName = UCSB,
): Promise<import("@/lib/coe-major-detail-types").CoeMajorDetail | null> {
  return loadCoeMajorDetailForSchool(schoolShortName, majorSlug);
}

export async function isCoeMajorSlug(
  majorSlug: string,
  schoolShortName = UCSB,
): Promise<boolean> {
  const major = await getCoeMajorBySlugForSchool(schoolShortName, majorSlug);
  return major != null;
}

export async function loadUcsbCoeCatalog(): Promise<CoeCatalog | null> {
  return loadCoeCatalogForSchool(UCSB);
}

export async function loadCoeCatalog(
  schoolShortName: string,
): Promise<CoeCatalog | null> {
  return loadCoeCatalogForSchool(schoolShortName);
}

export async function getUcsbMajorBySlug(
  majorSlug: string,
): Promise<CoeMajor | null> {
  return getCoeMajorBySlugForSchool(UCSB, majorSlug);
}

export async function getCoeMajorBySlug(
  schoolShortName: string,
  majorSlug: string,
): Promise<CoeMajor | null> {
  return getCoeMajorBySlugForSchool(schoolShortName, majorSlug);
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
