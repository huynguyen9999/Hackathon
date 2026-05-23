import type {
  AuditSnapshot,
  RequirementBucketProgress,
} from "@/lib/planner/contracts";
import type { RoadmapNode } from "@/lib/types";

export type DegreeAuditRules = {
  majorSlug: string;
  degreeType: string;
  graduationUnitsTarget: number;
  buckets: {
    key: string;
    label: string;
    requiredCourseCodes: string[];
    requiredUnits?: number;
  }[];
};

function normalizeCourseCode(value: string): string {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

function parseNodeCourseCode(node: RoadmapNode): string {
  return normalizeCourseCode(node.label);
}

export function buildAuditSnapshot(input: {
  rules: DegreeAuditRules;
  nodes: RoadmapNode[];
  completedNodeIds: string[];
  plannedNodeIds: string[];
}): AuditSnapshot {
  const nodeById = new Map(input.nodes.map((n) => [n.id, n]));
  const courseNodeByCode = new Map<string, RoadmapNode>();
  for (const node of input.nodes) {
    if (node.node_type !== "course") continue;
    courseNodeByCode.set(parseNodeCourseCode(node), node);
  }

  const completedUnits = input.completedNodeIds.reduce((sum, nodeId) => {
    const node = nodeById.get(nodeId);
    return sum + (node?.units ?? 0);
  }, 0);

  const plannedUnits = input.plannedNodeIds.reduce((sum, nodeId) => {
    const node = nodeById.get(nodeId);
    return sum + (node?.units ?? 0);
  }, 0);

  const completedSet = new Set(input.completedNodeIds);
  const plannedSet = new Set(input.plannedNodeIds);

  const buckets: RequirementBucketProgress[] = input.rules.buckets.map((bucket) => {
    const normalizedCodes = bucket.requiredCourseCodes.map(normalizeCourseCode);
    const bucketNodes = normalizedCodes
      .map((code) => courseNodeByCode.get(code))
      .filter((n): n is RoadmapNode => Boolean(n));

    const completedBucketUnits = bucketNodes.reduce((sum, node) => {
      return sum + (completedSet.has(node.id) ? node.units ?? 4 : 0);
    }, 0);

    const required = bucket.requiredUnits ?? Math.max(bucketNodes.length * 4, 4);
    const percent = Math.min(100, Math.round((completedBucketUnits / required) * 100));

    return {
      key: bucket.key,
      label: bucket.label,
      completed: completedBucketUnits,
      required,
      percent,
      remaining: Math.max(0, required - completedBucketUnits),
    };
  });

  const completionPercent = Math.min(
    100,
    Math.round((completedUnits / Math.max(input.rules.graduationUnitsTarget, 1)) * 100),
  );

  return {
    majorSlug: input.rules.majorSlug,
    degreeType: input.rules.degreeType,
    graduationUnitsTarget: input.rules.graduationUnitsTarget,
    completedUnits,
    plannedUnits,
    remainingUnits: Math.max(0, input.rules.graduationUnitsTarget - completedUnits),
    completionPercent,
    buckets,
  };
}
