export type PlannerRole = "owner" | "advisor" | "viewer";

export type PlannerQuarter = {
  year: 1 | 2 | 3 | 4;
  quarter: "Fall" | "Winter";
};

export type PlannedCourseState = {
  nodeId: string;
  status: "planned" | "completed";
  quarter?: PlannerQuarter;
  source?: "manual" | "ap" | "transfer";
};

export type ExternalCredit = {
  id: string;
  type: "ap" | "transfer";
  examOrCourse: string;
  scoreOrGrade?: string;
  mappedNodeIds: string[];
  notes?: string;
};

export type RequirementBucketProgress = {
  key: string;
  label: string;
  completed: number;
  required: number;
  percent: number;
  remaining: number;
};

export type AuditSnapshot = {
  majorSlug: string;
  degreeType: string;
  graduationUnitsTarget: number;
  completedUnits: number;
  plannedUnits: number;
  remainingUnits: number;
  completionPercent: number;
  buckets: RequirementBucketProgress[];
};

export type ValidationIssue = {
  id: string;
  kind: "unit-overload" | "unit-underload" | "prerequisite-order";
  severity: "warning" | "error";
  message: string;
  nodeIds?: string[];
  quarter?: PlannerQuarter;
};

export type PlanVersion = {
  id: string;
  planId: string;
  version: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
  courseStates: PlannedCourseState[];
  externalCredits: ExternalCredit[];
  auditSnapshot?: AuditSnapshot;
  validationIssues: ValidationIssue[];
};

export type Plan = {
  id: string;
  ownerId: string;
  title: string;
  schoolShortName: string;
  majorSlug: string;
  roadmapId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  myRole: PlannerRole;
  latestVersion?: PlanVersion;
};

export type PlanComment = {
  id: string;
  planId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type PlanShareToken = {
  token: string;
  planId: string;
  role: Exclude<PlannerRole, "owner">;
  expiresAt?: string;
};

export type CreatePlanInput = {
  title: string;
  schoolShortName: string;
  majorSlug: string;
  roadmapId?: string;
};

export type UpdatePlanInput = {
  title?: string;
  notes?: string;
  courseStates?: PlannedCourseState[];
  externalCredits?: ExternalCredit[];
  auditSnapshot?: AuditSnapshot;
  validationIssues?: ValidationIssue[];
};


export type PlanMember = {
  planId: string;
  userId: string;
  role: PlannerRole;
  createdAt: string;
};
