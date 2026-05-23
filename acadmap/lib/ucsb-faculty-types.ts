/** Faculty metadata synced from UCSB department sites for student planning context. */

export type FacultyRole =
  | "department_chair"
  | "undergraduate_vice_chair"
  | "graduate_vice_chair";

export type FacultyCategory =
  | "faculty"
  | "continuing_lecturer"
  | "visiting"
  | "affiliated";

export type FacultyMember = {
  id: string;
  name: string;
  title: string;
  roles?: FacultyRole[];
  category?: FacultyCategory;
  pronouns?: string;
  email?: string;
  office?: string;
  profile_url: string;
  research_areas?: string[];
  /** Maps to major career_outcomes[] and roadmap career nodes. */
  career_tags?: string[];
  /** Typical courses — planning hints only, not live GOLD schedule data. */
  teaches?: string[];
};

export type DepartmentFacultyFile = {
  department_slug: string;
  department: string;
  faculty_url: string;
  source_url: string;
  last_updated: string;
  members: FacultyMember[];
};

export const KEY_CONTACT_ROLES: FacultyRole[] = [
  "department_chair",
  "undergraduate_vice_chair",
];

export const FACULTY_ROLE_LABELS: Record<FacultyRole, string> = {
  department_chair: "Department Chair",
  undergraduate_vice_chair: "Undergraduate Vice Chair",
  graduate_vice_chair: "Graduate Vice Chair",
};
