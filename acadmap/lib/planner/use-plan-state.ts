"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AuditSnapshot,
  ExternalCredit,
  Plan,
  PlannedCourseState,
  ValidationIssue,
} from "@/lib/planner/contracts";
import { buildAuditSnapshot, type DegreeAuditRules } from "@/lib/planner/degree-audit";
import { validatePlannerState } from "@/lib/planner/validation";
import {
  parseQuarterKey,
  PLANNER_QUARTERS,
  PLANNER_YEARS,
  quarterKey,
  type QuarterKey,
} from "@/lib/planner/plan-types";
import { buildNodeIdByCourseCode } from "@/lib/planner/credit-mapper";
import type { RoadmapDetail, RoadmapNode } from "@/lib/types";

const STORAGE_PREFIX = "igauchoback:planner:";

type PlannerLocalState = {
  assignments: Record<QuarterKey, string[]>;
  statusByNodeId: Record<string, "planned" | "completed">;
  externalCredits: ExternalCredit[];
  title: string;
};

function emptyAssignments(): Record<QuarterKey, string[]> {
  const output = {} as Record<QuarterKey, string[]>;
  for (const year of PLANNER_YEARS) {
    for (const quarter of PLANNER_QUARTERS) {
      output[quarterKey(year, quarter)] = [];
    }
  }
  return output;
}

function localStorageKey(roadmapId: string): string {
  return `${STORAGE_PREFIX}${roadmapId}`;
}

function toCourseStates(
  assignments: Record<QuarterKey, string[]>,
  statusByNodeId: Record<string, "planned" | "completed">,
): PlannedCourseState[] {
  const quarterByNode = new Map<string, QuarterKey>();
  for (const [key, nodeIds] of Object.entries(assignments)) {
    for (const nodeId of nodeIds) {
      quarterByNode.set(nodeId, key as QuarterKey);
    }
  }

  return Object.entries(statusByNodeId).map(([nodeId, status]) => {
    const q = quarterByNode.get(nodeId);
    if (!q) return { nodeId, status };
    const parsed = parseQuarterKey(q);
    return {
      nodeId,
      status,
      quarter: parsed ? { year: parsed.year, quarter: parsed.quarter } : undefined,
    };
  });
}

function readLocalState(roadmapId: string): PlannerLocalState | null {
  try {
    const raw = window.localStorage.getItem(localStorageKey(roadmapId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlannerLocalState;
    return {
      assignments: parsed.assignments ?? emptyAssignments(),
      statusByNodeId: parsed.statusByNodeId ?? {},
      externalCredits: parsed.externalCredits ?? [],
      title: parsed.title ?? "My Plan",
    };
  } catch {
    return null;
  }
}

function writeLocalState(roadmapId: string, state: PlannerLocalState) {
  window.localStorage.setItem(localStorageKey(roadmapId), JSON.stringify(state));
}

function titleFromRoadmap(roadmap: RoadmapDetail): string {
  return `${roadmap.major.name} 4-year plan`;
}

function uniqueNodeIds(values: string[]): string[] {
  return [...new Set(values)];
}

export function usePlanState(input: {
  roadmap: RoadmapDetail;
  auditRules: DegreeAuditRules | null;
}) {
  const { roadmap, auditRules } = input;
  const [planId, setPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(titleFromRoadmap(roadmap));
  const [assignments, setAssignments] = useState<Record<QuarterKey, string[]>>(emptyAssignments());
  const [statusByNodeId, setStatusByNodeId] = useState<Record<string, "planned" | "completed">>({});
  const [externalCredits, setExternalCredits] = useState<ExternalCredit[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const nodesById = useMemo(
    () => new Map(roadmap.nodes.map((node) => [node.id, node])),
    [roadmap.nodes],
  );

  const courseNodes = useMemo(
    () => roadmap.nodes.filter((node) => node.node_type === "course"),
    [roadmap.nodes],
  );

  useEffect(() => {
    const local = readLocalState(roadmap.id);
    if (local) {
      setAssignments(local.assignments);
      setStatusByNodeId(local.statusByNodeId);
      setExternalCredits(local.externalCredits);
      setTitle(local.title);
    }
    setIsHydrated(true);
  }, [roadmap.id]);

  useEffect(() => {
    if (!isHydrated) return;
    writeLocalState(roadmap.id, {
      assignments,
      statusByNodeId,
      externalCredits,
      title,
    });
  }, [assignments, externalCredits, isHydrated, roadmap.id, statusByNodeId, title]);

  useEffect(() => {
    let active = true;

    async function loadRemotePlan() {
      try {
        const plansRes = await fetch("/api/plans", { credentials: "include" });
        if (!plansRes.ok) return;

        const plansBody = (await plansRes.json()) as { plans?: Plan[] };
        const match = plansBody.plans?.find(
          (plan) =>
            plan.roadmapId === roadmap.id ||
            (plan.schoolShortName === roadmap.school.short_name &&
              plan.majorSlug === roadmap.major.slug),
        );

        if (!match || !active) return;
        setPlanId(match.id);

        const planRes = await fetch(`/api/plans/${match.id}`, { credentials: "include" });
        if (!planRes.ok) return;
        const planBody = (await planRes.json()) as { plan?: Plan };
        const latest = planBody.plan?.latestVersion;
        if (!latest || !active) return;

        const nextAssignments = emptyAssignments();
        const nextStatus: Record<string, "planned" | "completed"> = {};

        for (const state of latest.courseStates) {
          nextStatus[state.nodeId] = state.status;
          if (state.quarter) {
            const key = quarterKey(state.quarter.year, state.quarter.quarter);
            nextAssignments[key] = uniqueNodeIds([...nextAssignments[key], state.nodeId]);
          }
        }

        setAssignments(nextAssignments);
        setStatusByNodeId(nextStatus);
        setExternalCredits(latest.externalCredits ?? []);
        if (planBody.plan?.title) setTitle(planBody.plan.title);
      } catch {
        // offline/local fallback is acceptable
      }
    }

    void loadRemotePlan();

    return () => {
      active = false;
    };
  }, [roadmap.id, roadmap.major.slug, roadmap.school.short_name]);

  const completedNodeIds = useMemo(
    () =>
      Object.entries(statusByNodeId)
        .filter(([, status]) => status === "completed")
        .map(([nodeId]) => nodeId),
    [statusByNodeId],
  );

  const plannedNodeIds = useMemo(
    () =>
      Object.entries(statusByNodeId)
        .filter(([, status]) => status === "planned")
        .map(([nodeId]) => nodeId),
    [statusByNodeId],
  );

  const validationIssues: ValidationIssue[] = useMemo(
    () =>
      validatePlannerState({
        assignments,
        statusByNodeId,
        nodes: roadmap.nodes,
        edges: roadmap.edges,
      }),
    [assignments, roadmap.edges, roadmap.nodes, statusByNodeId],
  );

  const auditSnapshot: AuditSnapshot | null = useMemo(() => {
    if (!auditRules) return null;
    return buildAuditSnapshot({
      rules: auditRules,
      nodes: roadmap.nodes,
      completedNodeIds,
      plannedNodeIds,
    });
  }, [auditRules, completedNodeIds, plannedNodeIds, roadmap.nodes]);

  const setNodeStatus = useCallback(
    (nodeId: string, status: "planned" | "completed" | null) => {
      setStatusByNodeId((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[nodeId];
          return next;
        }
        next[nodeId] = status;
        return next;
      });
    },
    [],
  );

  const assignNodeToQuarter = useCallback((nodeId: string, key: QuarterKey | null) => {
    setAssignments((prev) => {
      const next = { ...prev };
      for (const quarterKeyValue of Object.keys(next) as QuarterKey[]) {
        next[quarterKeyValue] = next[quarterKeyValue].filter((id) => id !== nodeId);
      }

      if (key) {
        next[key] = uniqueNodeIds([...next[key], nodeId]);
      }
      return next;
    });
  }, []);

  const toggleCompleted = useCallback(
    (nodeId: string) => {
      setStatusByNodeId((prev) => {
        const current = prev[nodeId];
        if (current === "completed") {
          const next = { ...prev };
          delete next[nodeId];
          return next;
        }
        return { ...prev, [nodeId]: "completed" };
      });
      assignNodeToQuarter(nodeId, null);
    },
    [assignNodeToQuarter],
  );

  const togglePlanned = useCallback(
    (nodeId: string, defaultQuarter: QuarterKey) => {
      setStatusByNodeId((prev) => {
        const current = prev[nodeId];
        if (current === "planned") {
          const next = { ...prev };
          delete next[nodeId];
          return next;
        }
        return { ...prev, [nodeId]: "planned" };
      });
      assignNodeToQuarter(nodeId, defaultQuarter);
    },
    [assignNodeToQuarter],
  );

  const addExternalCredit = useCallback((credit: ExternalCredit) => {
    setExternalCredits((prev) => uniqueNodeIds(prev.map((c) => c.id).concat(credit.id)).includes(credit.id)
      ? prev.map((c) => (c.id === credit.id ? credit : c))
      : [...prev, credit]);

    setStatusByNodeId((prev) => {
      const next = { ...prev };
      for (const nodeId of credit.mappedNodeIds) {
        next[nodeId] = "completed";
      }
      return next;
    });

    setAssignments((prev) => {
      const next = { ...prev };
      for (const nodeId of credit.mappedNodeIds) {
        for (const key of Object.keys(next) as QuarterKey[]) {
          next[key] = next[key].filter((id) => id !== nodeId);
        }
      }
      return next;
    });
  }, []);

  const removeExternalCredit = useCallback((creditId: string) => {
    setExternalCredits((prev) => prev.filter((credit) => credit.id !== creditId));
  }, []);

  const clearPlan = useCallback(() => {
    setAssignments(emptyAssignments());
    setStatusByNodeId({});
    setExternalCredits([]);
  }, []);

  const ensurePlanned = useCallback(
    (nodeId: string, quarter: QuarterKey) => {
      setStatusByNodeId((prev) => ({ ...prev, [nodeId]: "planned" }));
      assignNodeToQuarter(nodeId, quarter);
    },
    [assignNodeToQuarter],
  );

  const persist = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      let activePlanId = planId;

      if (!activePlanId) {
        const createRes = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            schoolShortName: roadmap.school.short_name,
            majorSlug: roadmap.major.slug,
            roadmapId: roadmap.id,
          }),
        });

        if (!createRes.ok) {
          throw new Error("Failed to create collaborative plan.");
        }

        const createBody = (await createRes.json()) as { plan: Plan };
        activePlanId = createBody.plan.id;
        setPlanId(activePlanId);
      }

      const courseStates = toCourseStates(assignments, statusByNodeId);

      const patchRes = await fetch(`/api/plans/${activePlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes: `Auto-saved ${new Date().toISOString()}`,
          courseStates,
          externalCredits,
          validationIssues,
          auditSnapshot,
        }),
      });

      if (!patchRes.ok) {
        const body = (await patchRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to save collaborative plan.");
      }

      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save plan.");
    } finally {
      setIsSaving(false);
    }
  }, [
    assignments,
    auditSnapshot,
    externalCredits,
    planId,
    roadmap.id,
    roadmap.major.slug,
    roadmap.school.short_name,
    statusByNodeId,
    title,
    validationIssues,
  ]);

  const nodeCourseCodeMap = useMemo(
    () => buildNodeIdByCourseCode(courseNodes),
    [courseNodes],
  );

  return {
    title,
    setTitle,
    planId,
    assignments,
    statusByNodeId,
    completedNodeIds,
    plannedNodeIds,
    externalCredits,
    validationIssues,
    auditSnapshot,
    isHydrated,
    isSaving,
    saveError,
    lastSavedAt,
    courseNodes,
    nodesById,
    nodeCourseCodeMap,
    assignNodeToQuarter,
    toggleCompleted,
    togglePlanned,
    ensurePlanned,
    addExternalCredit,
    removeExternalCredit,
    clearPlan,
    persist,
  };
}
