import { promises as fs } from "fs";
import path from "path";

import type { ExploreMajor, InterestTag } from "@/lib/explore-types";
import { buildCatalogUrl } from "@/lib/ucsb-curriculum-urls";
import type {
  GradDepartment,
  GradDivision,
  GradProgramDetail,
  GradProgramSummary,
  GradSource,
} from "@/lib/ucsb-grad-programs-types";
export type {
  GradDepartment,
  GradDivision,
  GradProgramDetail,
  GradProgramSummary,
  GradSource,
} from "@/lib/ucsb-grad-programs-types";

const GRAD_DIR = path.join(process.cwd(), "data", "ucsb", "grad-programs");

export async function listGradPrograms(): Promise<GradProgramSummary[]> {
  const index = await readJson<{ programs: GradProgramSummary[] }>(
    path.join(GRAD_DIR, "index.json"),
  );
  return index?.programs ?? [];
}

export async function getGradProgram(
  slug: string,
): Promise<GradProgramDetail | null> {
  return readJson<GradProgramDetail>(path.join(GRAD_DIR, `${slug}.json`));
}

export async function getGradSources(): Promise<GradSource[]> {
  const data = await readJson<{ sources: GradSource[] }>(
    path.join(GRAD_DIR, "sources.json"),
  );
  return data?.sources ?? [];
}

export async function listGradDepartments(): Promise<GradDepartment[]> {
  const data = await readJson<{ departments: GradDepartment[] }>(
    path.join(GRAD_DIR, "departments.json"),
  );
  return data?.departments ?? [];
}

export async function listGradDivisions(): Promise<GradDivision[]> {
  const data = await readJson<{ divisions: GradDivision[] }>(
    path.join(GRAD_DIR, "departments.json"),
  );
  return data?.divisions ?? [];
}

export async function listGradDepartmentsByDivision(): Promise<
  Record<string, GradDepartment[]>
> {
  const [divisions, departments] = await Promise.all([
    listGradDivisions(),
    listGradDepartments(),
  ]);

  const grouped: Record<string, GradDepartment[]> = {};
  for (const div of divisions) {
    grouped[div.id] = [];
  }

  for (const dept of departments) {
    if (!grouped[dept.division]) {
      grouped[dept.division] = [];
    }
    grouped[dept.division].push(dept);
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export function getDepartmentRoadmapSlugs(dept: GradDepartment): string[] {
  if (dept.roadmap_slugs?.length) return dept.roadmap_slugs;
  if (dept.roadmap_slug) return [dept.roadmap_slug];
  return [];
}

export async function getGradHubStats(): Promise<{
  departmentCount: number;
  roadmapCount: number;
}> {
  const [departments, programs] = await Promise.all([
    listGradDepartments(),
    listGradPrograms(),
  ]);
  return {
    departmentCount: departments.length,
    roadmapCount: programs.length,
  };
}

function gradInterestTags(department: string): InterestTag[] {
  const stem = ["ECE", "CMPSC", "ME", "CH E", "MATH", "PHYS", "PSTAT", "CHEM"];
  if (stem.includes(department)) return ["stem"];
  return ["pre-professional"];
}

export function gradProgramToExploreMajor(
  program: GradProgramSummary,
  graphSlugs: Set<string>,
): ExploreMajor {
  const slug = program.slug.toLowerCase();
  const hasInteractiveGraph =
    graphSlugs.has(slug) ||
    graphSlugs.has(`ucsb:${slug}`) ||
    graphSlugs.has(`seed-ucsb-${slug}`);

  return {
    id: `ucsb:graduate:${slug}`,
    slug,
    name: program.name,
    schoolShortName: "ucsb",
    schoolName: "UC Santa Barbara",
    college: "graduate",
    collegeLabel: "Graduate Division",
    department: program.department,
    degreeType: program.degree,
    selective: false,
    requirementsLevel: "roadmap",
    hasInteractiveGraph,
    hasDetailPage: hasInteractiveGraph,
    careerOutcomes: [],
    preparationForMajor: [],
    interestTags: gradInterestTags(program.department),
    undecidedFriendly: false,
    officialUrl: `/schools/ucsb/graduate`,
    hrefGraph: hasInteractiveGraph ? `/roadmap/ucsb/${slug}` : undefined,
    hrefMajor: `/schools/ucsb/graduate`,
    experienceType: hasInteractiveGraph ? "graph" : "catalog",
    programLevel: "graduate",
    hook: `Graduate ${program.degree} in ${program.department} — interactive roadmap available.`,
  };
}

export function gradDepartmentToExploreMajor(dept: GradDepartment): ExploreMajor {
  const slug = dept.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: `ucsb:graduate-dept:${slug}`,
    slug,
    name: dept.name,
    schoolShortName: "ucsb",
    schoolName: "UC Santa Barbara",
    college: "graduate",
    collegeLabel: "Graduate Division",
    department: dept.subjectCode ?? dept.name,
    degreeType: dept.degrees[0] ?? "Graduate",
    selective: false,
    hasInteractiveGraph: false,
    hasDetailPage: false,
    careerOutcomes: dept.degrees,
    preparationForMajor: [],
    interestTags: gradInterestTags(dept.subjectCode ?? ""),
    undecidedFriendly: false,
    officialUrl: dept.graddiv_url,
    hrefMajor: buildCatalogUrl({
      subject: dept.subjectCode,
      level: "G",
    }),
    experienceType: "catalog",
    programLevel: "graduate",
    hook: `${dept.degrees.join(", ")} — official Graduate Division program.`,
  };
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
