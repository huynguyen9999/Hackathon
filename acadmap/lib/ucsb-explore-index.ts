import { promises as fs } from "fs";
import path from "path";

import type {
  ExploreCollege,
  ExploreMajor,
  ExperienceType,
  InterestTag,
} from "@/lib/explore-types";
import { COLLEGE_LABELS } from "@/lib/explore-utils";
import { getApprovedRoadmapList } from "@/lib/roadmap";
import {
  ccsMajorHubHref,
  coeMajorHubHref,
  lsMajorHubHref,
  majorRoadmapHref,
} from "@/lib/ucsb-paths";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbCoeCatalog } from "@/lib/ucsb-coe";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import type { UcsbMajor } from "@/lib/ucsb-types";

type MajorTagsEntry = {
  interestTags: InterestTag[];
  undecidedFriendly: boolean;
};

const COLLEGE_LABELS_LOCAL: Record<ExploreCollege, string> = COLLEGE_LABELS;

function exploreId(college: ExploreCollege, slug: string): string {
  return `${college}:${slug}`;
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
  graphSlugs: Set<string>,
  tagsById: Record<string, MajorTagsEntry>,
): ExploreMajor {
  const id = exploreId(college, major.slug);
  const tagEntry = tagsById[id] ?? {
    interestTags: ["arts-humanities"] as InterestTag[],
    undecidedFriendly: false,
  };

  const seedHasGraph = graphSlugs.has(major.slug);
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
    college,
    collegeLabel: COLLEGE_LABELS_LOCAL[college],
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

async function loadMajorTags(): Promise<Record<string, MajorTagsEntry>> {
  const filePath = path.join(process.cwd(), "data", "ucsb", "major-tags.json");
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as Record<string, MajorTagsEntry>;
}

export async function loadUcsbExploreIndex(): Promise<ExploreMajor[]> {
  const [coe, ls, ccs, roadmaps, tagsById] = await Promise.all([
    loadUcsbCoeCatalog(),
    loadUcsbLsCatalog(),
    loadUcsbCcsCatalog(),
    getApprovedRoadmapList(),
    loadMajorTags(),
  ]);

  if (!coe || !ls || !ccs) {
    return [];
  }

  const graphSlugs = new Set(
    roadmaps.map((r) => r.major.slug.toLowerCase()),
  );

  const schoolShortName = coe.school.short_name.toLowerCase();

  const entries: ExploreMajor[] = [
    ...coe.majors.map((m) =>
      normalizeMajor(m, "engineering", schoolShortName, graphSlugs, tagsById),
    ),
    ...ls.majors.map((m) =>
      normalizeMajor(m, "letters-science", schoolShortName, graphSlugs, tagsById),
    ),
    ...ccs.majors.map((m) =>
      normalizeMajor(m, "creative-studies", schoolShortName, graphSlugs, tagsById),
    ),
  ];

  return entries.sort((a, b) => {
    if (a.hasInteractiveGraph !== b.hasInteractiveGraph) {
      return a.hasInteractiveGraph ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export { COLLEGE_LABELS } from "@/lib/explore-utils";
