export type ExploreCollege =
  | "engineering"
  | "letters-science"
  | "creative-studies";

export type InterestTag =
  | "stem"
  | "social-sciences"
  | "arts-humanities"
  | "pre-professional";

export type ExperienceType = "graph" | "guide" | "catalog";

export type ExploreViewMode = "grid" | "college" | "department";

export type ExploreMajor = {
  id: string;
  slug: string;
  name: string;
  college: ExploreCollege;
  collegeLabel: string;
  department: string;
  degreeType: string;
  selective: boolean;
  requirementsLevel?: string;
  hasInteractiveGraph: boolean;
  hasDetailPage: boolean;
  graduationUnits?: number;
  careerOutcomes: string[];
  preparationForMajor: string[];
  interestTags: InterestTag[];
  undecidedFriendly: boolean;
  officialUrl: string;
  hrefGraph?: string;
  hrefMajor: string;
  experienceType: ExperienceType;
  hook: string;
};

export type ExploreFiltersState = {
  query: string;
  colleges: ExploreCollege[];
  experience: ExperienceType[];
  degreeTypes: string[];
  selective: "all" | "selective" | "open";
  departments: string[];
  interestTags: InterestTag[];
  graphOnly: boolean;
  undecidedFriendly: boolean;
  view: ExploreViewMode;
};

export const DEFAULT_EXPLORE_FILTERS: ExploreFiltersState = {
  query: "",
  colleges: [],
  experience: [],
  degreeTypes: [],
  selective: "all",
  departments: [],
  interestTags: [],
  graphOnly: false,
  undecidedFriendly: false,
  view: "grid",
};

export type GoalLaneId = "switching" | "undecided" | "selective";

export const GOAL_LANE_PRESETS: Record<
  GoalLaneId,
  Partial<ExploreFiltersState>
> = {
  switching: {
    graphOnly: true,
    selective: "all",
    colleges: [],
    interestTags: [],
    undecidedFriendly: false,
  },
  undecided: {
    undecidedFriendly: true,
    selective: "open",
    colleges: ["letters-science"],
    graphOnly: false,
  },
  selective: {
    selective: "selective",
    colleges: [],
    graphOnly: false,
    undecidedFriendly: false,
  },
};
