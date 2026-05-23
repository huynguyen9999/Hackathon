/** Detailed major-sheet shapes (department PDFs / major sheets). */

export type CourseRef = {
  code: string;
  title?: string;
  units?: number;
  alternatives?: string[];
  notes?: string;
};

export type PlanSlot = {
  slot: "GE" | "LASAR" | "ELECTIVE" | "FREE";
  label: string;
  units?: number;
};

export type PlanEntry = CourseRef | PlanSlot;

export function isPlanSlot(entry: PlanEntry): entry is PlanSlot {
  return "slot" in entry;
}

export type RequirementBlock = {
  label: string;
  units?: number;
  unit_range?: string;
  courses: CourseRef[];
  choose_n?: number;
  choose_units?: number;
  notes?: string[];
};

export type MajorRegulations = {
  pre_major_gpa?: number;
  major_gpa?: number;
  letter_grade_minimum?: string;
  letter_grade_only?: boolean;
  pnp_allowed?: boolean;
  excluded_courses?: string[];
  transfer_admission_rules?: string[];
  other?: string[];
};

export type PlanTrack = "freshman" | "transfer" | "bs_ms" | "bs_ms_transfer";

export type PlanYear = 1 | 2 | 3 | 4 | 5;

export type QuarterName = "Fall" | "Winter" | "Spring" | "Summer";

export type QuarterPlan = {
  year: PlanYear;
  quarter: QuarterName;
  track: PlanTrack;
  entries: PlanEntry[];
};

export type ProgramVariant = {
  id: string;
  label: string;
  degree: string;
  url?: string;
  summary: string;
  notes?: string[];
};

export type LsMajorDetail = {
  slug: string;
  name: string;
  catalog_year: string;
  sources: { title: string; url: string }[];
  pre_major?: RequirementBlock;
  preparation: RequirementBlock;
  upper_division: RequirementBlock[];
  electives?: RequirementBlock;
  regulations: MajorRegulations;
  recommended_plans: QuarterPlan[];
  career_outcomes: string[];
  program_variants?: ProgramVariant[];
  notes?: string[];
  /** catalog = auto-generated from ls-catalog; sheet = department PDF QA */
  quality_tier?: "catalog" | "sheet";
};
