import { promises as fs } from "fs";
import path from "path";

export type CollegeCatalogType = "coe" | "ls" | "ccs";

export type SchoolCollegeConfig = {
  slug: string;
  label: string;
  subtitle: string;
  catalogType: CollegeCatalogType;
  description: string;
};

export type SchoolConfig = {
  short_name: string;
  name: string;
  location: string;
  email_domains: string[];
  official_url: string;
  preview?: boolean;
  theme: { primary: string; accent: string };
  colleges: SchoolCollegeConfig[];
};

type SchoolsIndex = {
  schools: SchoolConfig[];
};

const INDEX_PATH = path.join(process.cwd(), "data", "schools", "index.json");

let cachedIndex: SchoolsIndex | null = null;

async function loadIndex(): Promise<SchoolsIndex> {
  if (cachedIndex) return cachedIndex;
  const raw = await fs.readFile(INDEX_PATH, "utf-8");
  cachedIndex = JSON.parse(raw) as SchoolsIndex;
  return cachedIndex;
}

export async function listActiveSchools(): Promise<SchoolConfig[]> {
  const index = await loadIndex();
  return index.schools;
}

export async function getSchoolConfig(
  shortName: string,
): Promise<SchoolConfig | null> {
  const schools = await listActiveSchools();
  return (
    schools.find((s) => s.short_name.toLowerCase() === shortName.toLowerCase()) ??
    null
  );
}

export async function schoolHasCollege(
  shortName: string,
  collegeSlug: string,
): Promise<boolean> {
  const school = await getSchoolConfig(shortName);
  if (!school) return false;
  return school.colleges.some((c) => c.slug === collegeSlug);
}

export async function getCollegeConfig(
  shortName: string,
  collegeSlug: string,
): Promise<SchoolCollegeConfig | null> {
  const school = await getSchoolConfig(shortName);
  if (!school) return null;
  return school.colleges.find((c) => c.slug === collegeSlug) ?? null;
}

export function isEmailVerifiedForSchool(
  email: string | undefined | null,
  school: SchoolConfig,
): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return school.email_domains.some((domain) => lower.endsWith(`@${domain}`));
}
