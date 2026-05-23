import type {
  ExploreCollege,
  ExploreFiltersState,
  ExploreMajor,
  ExperienceType,
  InterestTag,
} from "@/lib/explore-types";

export function filterExploreMajors(
  majors: ExploreMajor[],
  filters: ExploreFiltersState,
): ExploreMajor[] {
  let result = majors;

  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter((m) => {
      const haystack = [
        m.name,
        m.slug,
        m.department,
        m.degreeType,
        m.collegeLabel,
        m.college,
        ...m.careerOutcomes,
        ...m.interestTags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (filters.colleges.length > 0) {
    result = result.filter((m) => filters.colleges.includes(m.college));
  }

  if (filters.schools.length > 0) {
    result = result.filter((m) =>
      filters.schools.includes(m.schoolShortName),
    );
  }

  if (filters.experience.length > 0) {
    result = result.filter((m) => filters.experience.includes(m.experienceType));
  }

  if (filters.degreeTypes.length > 0) {
    result = result.filter((m) => filters.degreeTypes.includes(m.degreeType));
  }

  if (filters.selective === "selective") {
    result = result.filter((m) => m.selective);
  } else if (filters.selective === "open") {
    result = result.filter((m) => !m.selective);
  }

  if (filters.departments.length > 0) {
    result = result.filter((m) => filters.departments.includes(m.department));
  }

  if (filters.interestTags.length > 0) {
    result = result.filter((m) =>
      filters.interestTags.some((tag) => m.interestTags.includes(tag)),
    );
  }

  if (filters.graphOnly) {
    result = result.filter((m) => m.hasInteractiveGraph);
  }

  if (filters.undecidedFriendly) {
    result = result.filter((m) => m.undecidedFriendly);
  }

  return result;
}

const COLLEGE_VALUES: ExploreCollege[] = [
  "engineering",
  "letters-science",
  "creative-studies",
  "graduate",
];

const EXPERIENCE_VALUES: ExperienceType[] = ["graph", "guide", "catalog"];

const INTEREST_VALUES: InterestTag[] = [
  "stem",
  "social-sciences",
  "arts-humanities",
  "pre-professional",
];

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): ExploreFiltersState {
  const colleges = parseListParam(params.get("college")).filter((c) =>
    COLLEGE_VALUES.includes(c as ExploreCollege),
  ) as ExploreCollege[];

  const experience = parseListParam(params.get("experience")).filter((e) =>
    EXPERIENCE_VALUES.includes(e as ExperienceType),
  ) as ExperienceType[];

  const degreeTypes = parseListParam(params.get("degree"));
  const departments = parseListParam(params.get("dept"));

  const interestTags = parseListParam(params.get("tags")).filter((t) =>
    INTEREST_VALUES.includes(t as InterestTag),
  ) as InterestTag[];

  const selectiveParam = params.get("selective");
  const selective =
    selectiveParam === "selective" || selectiveParam === "open"
      ? selectiveParam
      : "all";

  const viewParam = params.get("view");
  const view =
    viewParam === "college" || viewParam === "department"
      ? viewParam
      : "grid";

  const schools = parseListParam(params.get("school"));

  return {
    query: params.get("q") ?? "",
    schools,
    colleges,
    experience,
    degreeTypes,
    selective,
    departments,
    interestTags,
    graphOnly: params.get("graph") === "1",
    undecidedFriendly: params.get("undecided") === "1",
    view,
  };
}

export function filtersToSearchParams(
  filters: ExploreFiltersState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.schools.length > 0) {
    params.set("school", filters.schools.join(","));
  }
  if (filters.colleges.length > 0) {
    params.set("college", filters.colleges.join(","));
  }
  if (filters.experience.length > 0) {
    params.set("experience", filters.experience.join(","));
  }
  if (filters.degreeTypes.length > 0) {
    params.set("degree", filters.degreeTypes.join(","));
  }
  if (filters.selective !== "all") {
    params.set("selective", filters.selective);
  }
  if (filters.departments.length > 0) {
    params.set("dept", filters.departments.join(","));
  }
  if (filters.interestTags.length > 0) {
    params.set("tags", filters.interestTags.join(","));
  }
  if (filters.graphOnly) params.set("graph", "1");
  if (filters.undecidedFriendly) params.set("undecided", "1");
  if (filters.view !== "grid") params.set("view", filters.view);

  return params;
}

export function countActiveFilters(filters: ExploreFiltersState): number {
  let n = 0;
  if (filters.schools.length > 0) n++;
  if (filters.colleges.length > 0) n++;
  if (filters.experience.length > 0) n++;
  if (filters.degreeTypes.length > 0) n++;
  if (filters.selective !== "all") n++;
  if (filters.departments.length > 0) n++;
  if (filters.interestTags.length > 0) n++;
  if (filters.graphOnly) n++;
  if (filters.undecidedFriendly) n++;
  return n;
}

export function mergeFilters(
  base: ExploreFiltersState,
  patch: Partial<ExploreFiltersState>,
): ExploreFiltersState {
  return { ...base, ...patch };
}

export type { ExploreFiltersState };
