/** Shared UCSB college catalog shapes (CoE + L&S). */

export type RequirementsLevel =
  | "full"
  | "partial"
  | "summary"
  | "sheet"
  | "gear"
  | "roadmap"
  | "catalog";

export type UcsbMajor = {
  name: string;
  slug: string;
  degree_type: string;
  department: string;
  department_url: string;
  curriculum_url: string;
  course_grid_url?: string;
  gear_page?: number;
  graduation_units?: number;
  roadmap_available: boolean;
  preparation_for_major: string[];
  upper_division_required: string[];
  departmental_electives_units?: number;
  departmental_electives_note?: string;
  sample_electives: string[];
  career_outcomes: string[];
  notes?: string;
  requirements_level?: RequirementsLevel;
  admissions_url?: string;
  catalog_program_code?: string;
  selective?: boolean;
  major_sheet_url?: string;
  plan_of_study_url?: string;
  detail_available?: boolean;
};

export type UcsbSource = {
  title: string;
  url: string;
};

export type UcsbSchoolInfo = {
  name: string;
  short_name: string;
  location: string;
};
