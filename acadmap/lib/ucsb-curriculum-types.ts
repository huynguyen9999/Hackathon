export type UcsbCourseLevel = "U" | "G" | "A";

export type UcsbCourseSection = {
  enrollCode: string;
  section: string;
  session?: string;
  classSection?: string;
  instructor?: string;
  timeLocations?: string;
  enrolledTotal?: number;
  maxEnroll?: number;
};

export type UcsbCoursePrimary = {
  courseId: string;
  title: string;
  description?: string;
  units?: number;
  subjectCode: string;
  objLevelCode: string;
  sections: UcsbCourseSection[];
};

export type UcsbCourseSearchParams = {
  quarter: string;
  subjectCode: string;
  level: UcsbCourseLevel;
  pageNumber?: number;
  pageSize?: number;
};

export type UcsbCourseSearchResult = {
  quarter: string;
  subjectCode: string;
  level: UcsbCourseLevel;
  courses: UcsbCoursePrimary[];
  source: "live" | "snapshot";
  fetchedAt: string;
  totalCount: number;
};

export type UcsbSubject = {
  subjectCode: string;
  subjectTranslation: string;
};

export type UcsbQuarter = {
  code: string;
  label: string;
};

export type UcsbCurriculumSnapshot = {
  quarter: string;
  subjectCode: string;
  level: UcsbCourseLevel;
  fetchedAt: string;
  courses: UcsbCoursePrimary[];
};

export const OFFICIAL_COURSE_SEARCH_URL =
  "https://my.sa.ucsb.edu/public/curriculum/coursesearch.aspx";
