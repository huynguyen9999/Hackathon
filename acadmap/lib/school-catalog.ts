import { promises as fs } from "fs";
import path from "path";

import type {
  ExploreCollege,
  ExploreMajor,
  ExperienceType,
  InterestTag,
} from "@/lib/explore-types";
import { COLLEGE_LABELS } from "@/lib/explore-utils";
import type { CoeMajorDetail } from "@/lib/coe-major-detail-types";
import { getApprovedRoadmapList } from "@/lib/roadmap";
import { listActiveSchools } from "@/lib/schools/registry";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import type {
  CoeCatalog,
  CoeMajor,
} from "@/lib/ucsb-coe";
import {
  ccsMajorHubHref,
  coeMajorHubHref,
  lsMajorHubHref,
  majorRoadmapHref,
} from "@/lib/ucsb-paths";
import type { UcsbMajor } from "@/lib/ucsb-types";

type MajorTagsEntry = {
  interestTags: InterestTag[];
  undecidedFriendly: boolean;
};

function coeCatalogPath(school: string): string {
  return path.join(process.cwd(), "data", school, "coe-catalog.json");
}

function coeMajorDetailDir(school: string): string {
  return path.join(process.cwd(), "data", school, "coe-majors");
}

export async function loadCoeCatalog(
  schoolShortName: string,
): Promise<CoeCatalog | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadCoeCatalog() is server-only");
  }

  try {
    const raw = await fs.readFile(
      coeCatalogPath(schoolShortName.toLowerCase()),
      "utf-8",
    );
    return JSON.parse(raw) as CoeCatalog;
  } catch {
    return null;
  }
}

export async function getCoeMajorBySlug(
  schoolShortName: string,
  majorSlug: string,
): Promise<CoeMajor | null> {
  const catalog = await loadCoeCatalog(schoolShortName);
  if (!catalog) return null;
  return (
    catalog.majors.find((m) => m.slug === majorSlug.toLowerCase()) ?? null
  );
}

export async function loadCoeMajorDetail(
  schoolShortName: string,
  majorSlug: string,
): Promise<CoeMajorDetail | null> {
  if (typeof window !== "undefined") {
    throw new Error("loadCoeMajorDetail() is server-only");
  }

  try {
    const filePath = path.join(
      coeMajorDetailDir(schoolShortName.toLowerCase()),
      `${majorSlug.toLowerCase()}.json`,
    );
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as CoeMajorDetail;
  } catch {
    return null;
  }
}

function exploreId(
  school: string,
  college: ExploreCollege,
  slug: string,
): string {
  return `${school}:${college}:${slug}`;
}

function majorHubHref(
  college: ExploreCollege,
  schoolShortName: string,
  slug: string,
): string {
  switch (college) {
    case "engineering":
      return coeMajorHubHref(schoolShortName, slug);
    case "letters-science":
      return lsMajorHubHref(schoolShortName, slug);
    case "creative-studies":
      return ccsMajorHubHref(schoolShortName, slug);
  }
}

function resolveExperienceType(
  hasGraph: boolean,
  hasDetail: boolean,
): ExperienceType {
  if (hasGraph) return "graph";
  if (hasDetail) return "guide";
  return "catalog";
}

function buildHook(major: UcsbMajor, selective: boolean): string {
  if (selective) {
    return "Selective admission — review requirements before applying.";
  }
  if (major.career_outcomes.length > 0) {
    return major.career_outcomes[0];
  }
  if (major.notes) {
    return major.notes;
  }
  return `Explore pathways in ${major.department}.`;
}

function normalizeMajor(
  major: UcsbMajor,
  college: ExploreCollege,
  schoolShortName: string,
  schoolName: string,
  graphSlugs: Set<string>,
  tagsById: Record<string, MajorTagsEntry>,
): ExploreMajor {
  const id = exploreId(schoolShortName, college, major.slug);
  const tagEntry = tagsById[id] ??
    tagsById[`${college}:${major.slug}`] ?? {
      interestTags: ["stem"] as InterestTag[],
      undecidedFriendly: false,
    };

  const seedKey = `${schoolShortName}:${major.slug}`;
  const seedHasGraph =
    graphSlugs.has(major.slug) || graphSlugs.has(seedKey);
  const hasInteractiveGraph = major.roadmap_available && seedHasGraph;
  const hasDetailPage =
    major.detail_available === true ||
    major.requirements_level === "roadmap" ||
    major.requirements_level === "gear" ||
    major.requirements_level === "sheet" ||
    major.requirements_level === "full" ||
    major.requirements_level === "partial";

  const selective = major.selective === true;

  return {
    id,
    slug: major.slug,
    name: major.name,
    schoolShortName,
    schoolName,
    college,
    collegeLabel: COLLEGE_LABELS[college],
    department: major.department,
    degreeType: major.degree_type,
    selective,
    requirementsLevel: major.requirements_level,
    hasInteractiveGraph,
    hasDetailPage,
    graduationUnits: major.graduation_units,
    careerOutcomes: major.career_outcomes ?? [],
    preparationForMajor: major.preparation_for_major ?? [],
    interestTags: tagEntry.interestTags,
    undecidedFriendly: tagEntry.undecidedFriendly,
    officialUrl: major.curriculum_url || major.department_url,
    hrefGraph: hasInteractiveGraph
      ? majorRoadmapHref(schoolShortName, major.slug)
      : undefined,
    hrefMajor: majorHubHref(college, schoolShortName, major.slug),
    experienceType: resolveExperienceType(hasInteractiveGraph, hasDetailPage),
    hook: buildHook(major, selective),
  };
}

async function loadMajorTagsForSchool(
  schoolShortName: string,
): Promise<Record<string, MajorTagsEntry>> {
  const filePath = path.join(
    process.cwd(),
    "data",
    schoolShortName,
    "major-tags.json",
  );
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as Record<string, MajorTagsEntry>;
  } catch {
    return {};
  }
}

export async function loadExploreIndex(): Promise<ExploreMajor[]> {
  const [schools, roadmaps] = await Promise.all([
    listActiveSchools(),
    getApprovedRoadmapList(),
  ]);

  const graphSlugs = new Set<string>();
  for (const r of roadmaps) {
    graphSlugs.add(r.major.slug.toLowerCase());
    if (r.school?.short_name) {
      graphSlugs.add(
        `${r.school.short_name.toLowerCase()}:${r.major.slug.toLowerCase()}`,
      );
    }
  }

  const entries: ExploreMajor[] = [];

  for (const school of schools) {
    const tagsById = await loadMajorTagsForSchool(school.short_name);

    for (const college of school.colleges) {
      if (college.catalogType === "coe") {
        const coe = await loadCoeCatalog(school.short_name);
        if (!coe) continue;
        entries.push(
          ...coe.majors.map((m) =>
            normalizeMajor(
              m,
              "engineering",
              school.short_name,
              school.name,
              graphSlugs,
              tagsById,
            ),
          ),
        );
      } else if (college.catalogType === "ls" && school.short_name === "ucsb") {
        const ls = await loadUcsbLsCatalog();
        if (!ls) continue;
        entries.push(
          ...ls.majors.map((m) =>
            normalizeMajor(
              m,
              "letters-science",
              school.short_name,
              school.name,
              graphSlugs,
              tagsById,
            ),
          ),
        );
      } else if (college.catalogType === "ccs" && school.short_name === "ucsb") {
        const ccs = await loadUcsbCcsCatalog();
        if (!ccs) continue;
        entries.push(
          ...ccs.majors.map((m) =>
            normalizeMajor(
              m,
              "creative-studies",
              school.short_name,
              school.name,
              graphSlugs,
              tagsById,
            ),
          ),
        );
      }
    }
  }

  return entries.sort((a, b) => {
    if (a.hasInteractiveGraph !== b.hasInteractiveGraph) {
      return a.hasInteractiveGraph ? -1 : 1;
    }
    if (a.schoolShortName !== b.schoolShortName) {
      return a.schoolShortName.localeCompare(b.schoolShortName);
    }
    return a.name.localeCompare(b.name);
  });
}

/** @deprecated Use loadExploreIndex */
export async function loadUcsbExploreIndex(): Promise<ExploreMajor[]> {
  const all = await loadExploreIndex();
  return all.filter((m) => m.schoolShortName === "ucsb");
}
