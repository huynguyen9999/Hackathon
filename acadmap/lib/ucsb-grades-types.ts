export type GradeBucketCounts = {
  A: number;
  Ap: number;
  Am: number;
  B: number;
  Bp: number;
  Bm: number;
  C: number;
  Cp: number;
  Cm: number;
  D: number;
  Dp: number;
  Dm: number;
  F: number;
  P: number;
  s: number;
  su: number;
  IP: number;
};

export type GradeOffering = {
  quarter: string;
  year: number;
  instructor: string;
  counts: GradeBucketCounts;
  avgGpa: number | null;
  nLetterStudents: number;
  nPnpStudents: number;
};

export type GradeRollup = {
  avgGpa: number | null;
  totalStudents: number;
  gradeDistribution: GradeBucketCounts;
  offeringCount: number;
  latestOffering?: { quarter: string; year: number };
};

export type CourseGradeAggregate = {
  courseId: string;
  dept: string;
  offerings: GradeOffering[];
  rollup: GradeRollup;
};

export type GradesSearchEntry = {
  courseId: string;
  dept: string;
  avgGpa: number | null;
  offeringCount: number;
  totalStudents: number;
};

export type GradesLeaderboardEntry = GradesSearchEntry & {
  label?: string;
};

export type GradesLeaderboards = {
  highestGpa: GradesLeaderboardEntry[];
  lowestGpa: GradesLeaderboardEntry[];
  mostOffered: GradesLeaderboardEntry[];
};

export type GradesMeta = {
  source: string;
  sourceUrl: string;
  interactiveUrl: string;
  attribution: string;
  contactEmail: string;
  asOf: string;
  quarterRange: { from: string; to: string };
  courseCount: number;
  offeringCount: number;
  disclaimer: string;
};

export const EMPTY_GRADE_COUNTS: GradeBucketCounts = {
  A: 0,
  Ap: 0,
  Am: 0,
  B: 0,
  Bp: 0,
  Bm: 0,
  C: 0,
  Cp: 0,
  Cm: 0,
  D: 0,
  Dp: 0,
  Dm: 0,
  F: 0,
  P: 0,
  s: 0,
  su: 0,
  IP: 0,
};

export const DAILY_NEXUS_GRADES_URL =
  "https://dailynexus.com/interactives/grades/";
export const DAILY_NEXUS_GRADES_REPO =
  "https://github.com/dailynexusdata/grades-data";
