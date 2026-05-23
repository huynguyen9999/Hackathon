export type GradProgramSummary = {
  slug: string;
  name: string;
  department: string;
  degree: string;
};

export type GradProgramDetail = GradProgramSummary & {
  description: string;
  source_url: string;
  required_courses: string[];
  milestones?: string[];
};

export type GradDivision = {
  id: string;
  label: string;
};

export type GradDepartment = {
  name: string;
  subjectCode?: string;
  division: string;
  official_url: string;
  graddiv_url: string;
  degrees: string[];
  roadmap_slug?: string;
  roadmap_slugs?: string[];
};

export type GradSource = {
  title: string;
  url: string;
};
