import { createServerClient } from "@/lib/supabase";
import type {
  Plan,
  PlanComment,
  PlanMember,
  PlannerRole,
  PlanVersion,
  PlannedCourseState,
  ExternalCredit,
  ValidationIssue,
  AuditSnapshot,
} from "@/lib/planner/contracts";

type PlanRow = {
  id: string;
  owner_id: string;
  title: string;
  school_short_name: string;
  major_slug: string;
  roadmap_id: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

type PlanMemberRow = {
  plan_id: string;
  user_id: string;
  role: PlannerRole;
};

type PlanVersionRow = {
  id: string;
  plan_id: string;
  version: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  audit_snapshot: AuditSnapshot | null;
  validation_issues: ValidationIssue[] | null;
};

type PlanCourseStateRow = {
  version_id: string;
  node_id: string;
  status: "planned" | "completed";
  year: number | null;
  quarter: string | null;
  source: string | null;
};

type PlanCreditRow = {
  version_id: string;
  credit_id: string;
  type: "ap" | "transfer";
  exam_or_course: string;
  score_or_grade: string | null;
  mapped_node_ids: string[];
  notes: string | null;
};

function toQuarter(row: PlanCourseStateRow) {
  if (row.year == null || !row.quarter) return undefined;
  return {
    year: row.year as 1 | 2 | 3 | 4,
    quarter: row.quarter as "Fall" | "Winter",
  };
}

function mapVersion(
  version: PlanVersionRow,
  courseStates: PlanCourseStateRow[],
  credits: PlanCreditRow[],
): PlanVersion {
  const byVersionStates = courseStates
    .filter((s) => s.version_id === version.id)
    .map((s) => ({
      nodeId: s.node_id,
      status: s.status,
      quarter: toQuarter(s),
      source: (s.source as "manual" | "ap" | "transfer" | null) ?? undefined,
    }));

  const byVersionCredits = credits
    .filter((c) => c.version_id === version.id)
    .map((c) => ({
      id: c.credit_id,
      type: c.type,
      examOrCourse: c.exam_or_course,
      scoreOrGrade: c.score_or_grade ?? undefined,
      mappedNodeIds: c.mapped_node_ids,
      notes: c.notes ?? undefined,
    }));

  return {
    id: version.id,
    planId: version.plan_id,
    version: version.version,
    notes: version.notes ?? undefined,
    createdBy: version.created_by,
    createdAt: version.created_at,
    auditSnapshot: version.audit_snapshot ?? undefined,
    validationIssues: version.validation_issues ?? [],
    courseStates: byVersionStates,
    externalCredits: byVersionCredits,
  };
}

export async function getUserPlans(userId: string): Promise<Plan[]> {
  const supabase = await createServerClient();

  const { data: memberships, error: membershipError } = await supabase
    .from("planner_plan_members")
    .select("plan_id, role")
    .eq("user_id", userId);

  if (membershipError) throw membershipError;
  if (!memberships || memberships.length === 0) return [];

  const planIds = memberships.map((m) => m.plan_id);
  const roleByPlan = new Map(memberships.map((m) => [m.plan_id, m.role as PlannerRole]));

  const { data: plans, error: plansError } = await supabase
    .from("planner_plans")
    .select("*")
    .in("id", planIds)
    .eq("archived", false)
    .order("updated_at", { ascending: false });

  if (plansError) throw plansError;

  return (plans as PlanRow[]).map((plan) => ({
    id: plan.id,
    ownerId: plan.owner_id,
    title: plan.title,
    schoolShortName: plan.school_short_name,
    majorSlug: plan.major_slug,
    roadmapId: plan.roadmap_id ?? undefined,
    archived: plan.archived,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
    myRole: roleByPlan.get(plan.id) ?? "viewer",
  }));
}

export async function createPlan(input: {
  userId: string;
  title: string;
  schoolShortName: string;
  majorSlug: string;
  roadmapId?: string;
}): Promise<Plan> {
  const supabase = await createServerClient();

  const { data: plan, error: planError } = await supabase
    .from("planner_plans")
    .insert({
      owner_id: input.userId,
      title: input.title,
      school_short_name: input.schoolShortName,
      major_slug: input.majorSlug,
      roadmap_id: input.roadmapId ?? null,
    })
    .select("*")
    .single();

  if (planError) throw planError;

  const { error: memberError } = await supabase.from("planner_plan_members").insert({
    plan_id: (plan as PlanRow).id,
    user_id: input.userId,
    role: "owner",
  });

  if (memberError) throw memberError;

  return {
    id: (plan as PlanRow).id,
    ownerId: (plan as PlanRow).owner_id,
    title: (plan as PlanRow).title,
    schoolShortName: (plan as PlanRow).school_short_name,
    majorSlug: (plan as PlanRow).major_slug,
    roadmapId: (plan as PlanRow).roadmap_id ?? undefined,
    archived: (plan as PlanRow).archived,
    createdAt: (plan as PlanRow).created_at,
    updatedAt: (plan as PlanRow).updated_at,
    myRole: "owner",
  };
}

export async function getPlanForUser(planId: string, userId: string): Promise<Plan | null> {
  const supabase = await createServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: plan, error: planError } = await supabase
    .from("planner_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (planError) throw planError;

  const { data: versions, error: versionsError } = await supabase
    .from("planner_plan_versions")
    .select("*")
    .eq("plan_id", planId)
    .order("version", { ascending: false });

  if (versionsError) throw versionsError;

  const latest = (versions as PlanVersionRow[])[0];

  let latestVersion: PlanVersion | undefined;

  if (latest) {
    const { data: states, error: statesError } = await supabase
      .from("planner_course_states")
      .select("*")
      .eq("version_id", latest.id);

    if (statesError) throw statesError;

    const { data: credits, error: creditsError } = await supabase
      .from("planner_external_credits")
      .select("*")
      .eq("version_id", latest.id);

    if (creditsError) throw creditsError;

    latestVersion = mapVersion(
      latest,
      (states ?? []) as PlanCourseStateRow[],
      (credits ?? []) as PlanCreditRow[],
    );
  }

  return {
    id: (plan as PlanRow).id,
    ownerId: (plan as PlanRow).owner_id,
    title: (plan as PlanRow).title,
    schoolShortName: (plan as PlanRow).school_short_name,
    majorSlug: (plan as PlanRow).major_slug,
    roadmapId: (plan as PlanRow).roadmap_id ?? undefined,
    archived: (plan as PlanRow).archived,
    createdAt: (plan as PlanRow).created_at,
    updatedAt: (plan as PlanRow).updated_at,
    myRole: (membership.role as PlannerRole) ?? "viewer",
    latestVersion,
  };
}

export async function updatePlan(
  planId: string,
  userId: string,
  input: {
    title?: string;
    notes?: string;
    courseStates?: PlannedCourseState[];
    externalCredits?: ExternalCredit[];
    auditSnapshot?: AuditSnapshot;
    validationIssues?: ValidationIssue[];
  },
): Promise<Plan | null> {
  const supabase = await createServerClient();

  const { data: membership, error: memberError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) return null;
  if (membership.role === "viewer") {
    throw new Error("Viewer role cannot edit plans.");
  }

  if (input.title) {
    const { error: titleError } = await supabase
      .from("planner_plans")
      .update({ title: input.title })
      .eq("id", planId);

    if (titleError) throw titleError;
  }

  const hasVersionPayload =
    input.courseStates != null ||
    input.externalCredits != null ||
    input.auditSnapshot != null ||
    input.validationIssues != null ||
    input.notes != null;

  if (hasVersionPayload) {
    const { data: latest, error: latestError } = await supabase
      .from("planner_plan_versions")
      .select("version")
      .eq("plan_id", planId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    const nextVersion = ((latest?.version as number | undefined) ?? 0) + 1;

    const { data: createdVersion, error: versionError } = await supabase
      .from("planner_plan_versions")
      .insert({
        plan_id: planId,
        version: nextVersion,
        notes: input.notes ?? null,
        created_by: userId,
        audit_snapshot: input.auditSnapshot ?? null,
        validation_issues: input.validationIssues ?? [],
      })
      .select("id")
      .single();

    if (versionError) throw versionError;

    const versionId = createdVersion.id as string;

    if (input.courseStates && input.courseStates.length > 0) {
      const rows = input.courseStates.map((state) => ({
        version_id: versionId,
        node_id: state.nodeId,
        status: state.status,
        year: state.quarter?.year ?? null,
        quarter: state.quarter?.quarter ?? null,
        source: state.source ?? null,
      }));
      const { error: statesError } = await supabase
        .from("planner_course_states")
        .insert(rows);
      if (statesError) throw statesError;
    }

    if (input.externalCredits && input.externalCredits.length > 0) {
      const rows = input.externalCredits.map((credit) => ({
        version_id: versionId,
        credit_id: credit.id,
        type: credit.type,
        exam_or_course: credit.examOrCourse,
        score_or_grade: credit.scoreOrGrade ?? null,
        mapped_node_ids: credit.mappedNodeIds,
        notes: credit.notes ?? null,
      }));
      const { error: creditError } = await supabase
        .from("planner_external_credits")
        .insert(rows);
      if (creditError) throw creditError;
    }
  }

  return getPlanForUser(planId, userId);
}

export async function createShareToken(
  planId: string,
  userId: string,
  role: "advisor" | "viewer",
  expiresAt?: string,
) {
  const supabase = await createServerClient();

  const { data: membership, error: memberError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership || membership.role !== "owner") {
    throw new Error("Only owners can create share links.");
  }

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from("planner_share_tokens")
    .insert({
      plan_id: planId,
      token,
      role,
      created_by: userId,
      expires_at: expiresAt ?? null,
    })
    .select("token, role, expires_at")
    .single();

  if (error) throw error;

  return {
    token: data.token as string,
    role: data.role as "advisor" | "viewer",
    expiresAt: (data.expires_at as string | null) ?? undefined,
  };
}

export async function addPlanComment(
  planId: string,
  userId: string,
  body: string,
): Promise<PlanComment> {
  const supabase = await createServerClient();

  const { data: membership, error: memberError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) throw new Error("You do not have access to this plan.");

  const { data, error } = await supabase
    .from("planner_comments")
    .insert({
      plan_id: planId,
      author_id: userId,
      body,
    })
    .select("id, plan_id, author_id, body, created_at")
    .single();

  if (error) throw error;

  return {
    id: data.id as string,
    planId: data.plan_id as string,
    authorId: data.author_id as string,
    body: data.body as string,
    createdAt: data.created_at as string,
  };
}

export async function getPlanComments(planId: string, userId: string): Promise<PlanComment[]> {
  const supabase = await createServerClient();

  const { data: membership, error: memberError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) return [];

  const { data, error } = await supabase
    .from("planner_comments")
    .select("id, plan_id, author_id, body, created_at")
    .eq("plan_id", planId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    planId: row.plan_id as string,
    authorId: row.author_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  }));
}


export async function acceptPlanShareToken(
  token: string,
  userId: string,
): Promise<Plan | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("accept_planner_share_token", {
    p_token: token,
  });

  if (error) throw error;

  const planId = (data as string | null) ?? null;
  if (!planId) return null;

  return getPlanForUser(planId, userId);
}


export async function getPlanMembers(planId: string, userId: string): Promise<{ members: PlanMember[]; myRole: PlannerRole } | null> {
  const supabase = await createServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data, error } = await supabase
    .from("planner_plan_members")
    .select("plan_id, user_id, role, created_at")
    .eq("plan_id", planId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return {
    myRole: membership.role as PlannerRole,
    members: (data ?? []).map((row) => ({
      planId: row.plan_id as string,
      userId: row.user_id as string,
      role: row.role as PlannerRole,
      createdAt: row.created_at as string,
    })),
  };
}

export async function managePlanMember(input: {
  planId: string;
  actorUserId: string;
  targetUserId: string;
  role?: "advisor" | "viewer";
  remove?: boolean;
}): Promise<{ members: PlanMember[]; myRole: PlannerRole } | null> {
  const supabase = await createServerClient();

  const { data: actorMembership, error: actorError } = await supabase
    .from("planner_plan_members")
    .select("role")
    .eq("plan_id", input.planId)
    .eq("user_id", input.actorUserId)
    .maybeSingle();

  if (actorError) throw actorError;
  if (!actorMembership) return null;
  if (actorMembership.role !== "owner") {
    throw new Error("Only owners can manage collaborators.");
  }

  if (input.targetUserId === input.actorUserId) {
    throw new Error("Owners cannot modify their own owner membership.");
  }

  if (input.remove) {
    const { error: removeError } = await supabase
      .from("planner_plan_members")
      .delete()
      .eq("plan_id", input.planId)
      .eq("user_id", input.targetUserId);
    if (removeError) throw removeError;
  } else if (input.role) {
    const { error: updateError } = await supabase
      .from("planner_plan_members")
      .update({ role: input.role })
      .eq("plan_id", input.planId)
      .eq("user_id", input.targetUserId);
    if (updateError) throw updateError;
  }

  return getPlanMembers(input.planId, input.actorUserId);
}
