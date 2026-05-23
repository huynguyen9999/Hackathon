import type { RoadmapEdge, RoadmapNode } from "@/lib/types";
import type { ValidationIssue } from "@/lib/planner/contracts";
import { DEFAULT_UNIT_TARGET, plannerQuarterIndex, type QuarterKey } from "@/lib/planner/plan-types";

export type PlannerValidationInput = {
  assignments: Record<QuarterKey, string[]>;
  statusByNodeId: Record<string, "planned" | "completed">;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  unitMin?: number;
  unitMax?: number;
};

function isCourseNode(node: RoadmapNode | undefined): node is RoadmapNode {
  return Boolean(node && node.node_type === "course");
}

export function validatePlannerState(input: PlannerValidationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const unitMin = input.unitMin ?? DEFAULT_UNIT_TARGET.min;
  const unitMax = input.unitMax ?? DEFAULT_UNIT_TARGET.max;

  const nodeById = new Map(input.nodes.map((n) => [n.id, n]));
  const prereqEdges = input.edges.filter((e) => e.edge_type === "prerequisite");

  for (const [quarterKey, nodeIds] of Object.entries(input.assignments)) {
    let units = 0;
    for (const nodeId of nodeIds) {
      const node = nodeById.get(nodeId);
      if (!isCourseNode(node)) continue;
      units += node.units ?? 4;
    }

    if (nodeIds.length > 0 && units > unitMax) {
      issues.push({
        id: `unit-overload-${quarterKey}`,
        kind: "unit-overload",
        severity: "error",
        message: `${quarterKey} has ${units} units (max recommended ${unitMax}).`,
        nodeIds,
      });
    }

    if (nodeIds.length > 0 && units < unitMin) {
      issues.push({
        id: `unit-underload-${quarterKey}`,
        kind: "unit-underload",
        severity: "warning",
        message: `${quarterKey} has ${units} units (below recommended ${unitMin}).`,
        nodeIds,
      });
    }
  }

  const quarterByNode = new Map<string, QuarterKey>();
  for (const [quarterKey, nodeIds] of Object.entries(input.assignments)) {
    for (const nodeId of nodeIds) {
      quarterByNode.set(nodeId, quarterKey as QuarterKey);
    }
  }

  for (const edge of prereqEdges) {
    const sourceStatus = input.statusByNodeId[edge.source_id];
    const targetStatus = input.statusByNodeId[edge.target_id];
    if (!targetStatus) continue;

    const sourceQuarter = quarterByNode.get(edge.source_id);
    const targetQuarter = quarterByNode.get(edge.target_id);

    const sourceIndex = sourceStatus === "completed"
      ? -1
      : sourceQuarter
        ? plannerQuarterIndex(sourceQuarter)
        : Number.POSITIVE_INFINITY;

    const targetIndex = targetStatus === "completed"
      ? -1
      : targetQuarter
        ? plannerQuarterIndex(targetQuarter)
        : Number.POSITIVE_INFINITY;

    if (sourceIndex >= targetIndex) {
      const source = nodeById.get(edge.source_id);
      const target = nodeById.get(edge.target_id);
      issues.push({
        id: `prereq-${edge.id}`,
        kind: "prerequisite-order",
        severity: "error",
        nodeIds: [edge.source_id, edge.target_id],
        message: `${target?.label ?? edge.target_id} is scheduled before prerequisite ${source?.label ?? edge.source_id}.`,
      });
    }
  }

  return issues;
}
