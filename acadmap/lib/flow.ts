import { layoutRoadmapNodes } from "@/lib/roadmap-layout";
import type {
  CourseNodeMetadata,
  EdgeType,
  FlowEdge,
  FlowNode,
  RoadmapEdge,
  RoadmapNode,
  Resource,
} from "@/lib/types";

function parseCourseNodeMetadata(
  metadata: Record<string, unknown> | undefined,
): CourseNodeMetadata | undefined {
  if (!metadata) return undefined;

  const courseLevel =
    metadata.course_level === "graduate" ||
    metadata.course_level === "undergraduate"
      ? metadata.course_level
      : undefined;

  if (metadata.role === "capstone") {
    return {
      role: "capstone",
      optional: metadata.optional === true,
      sequence:
        typeof metadata.sequence === "number" ? metadata.sequence : undefined,
      course_level: courseLevel,
    };
  }

  if (
    courseLevel ||
    metadata.role === "core" ||
    metadata.role === "elective" ||
    metadata.role === "exam"
  ) {
    return {
      role: typeof metadata.role === "string" ? metadata.role : undefined,
      course_level: courseLevel,
    };
  }

  return undefined;
}

const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  prerequisite: "Prerequisite",
  recommended: "Recommended",
  leads_to: "Leads to",
};

export function roadmapNodeToFlowNode(node: RoadmapNode): FlowNode | null {
  if (node.node_type === "skill") return null;

  const resources: Resource[] = node.resources ?? [];
  const title = node.title ?? node.label;
  const description = node.description ?? "";

  if (node.node_type === "career") {
    return {
      id: node.id,
      type: "career",
      position: { x: node.position_x, y: node.position_y },
      data: {
        nodeType: "career",
        label: node.label,
        title,
        description,
        selfLearnable: node.self_learnable,
        resources,
      },
    };
  }

  return {
    id: node.id,
    type: "course",
    position: { x: node.position_x, y: node.position_y },
    data: {
      nodeType: "course",
      label: node.label,
      title,
      description,
      units: node.units ?? 0,
      selfLearnable: node.self_learnable,
      resources,
      nodeMetadata: parseCourseNodeMetadata(node.metadata),
    },
  };
}

export function roadmapNodesToFlowNodes(
  nodes: RoadmapNode[],
  layout?: string,
): FlowNode[] {
  return layoutRoadmapNodes(nodes, layout)
    .map(roadmapNodeToFlowNode)
    .filter((n): n is FlowNode => n !== null);
}

export function roadmapEdgesToFlowEdges(edges: RoadmapEdge[]): FlowEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source_id,
    target: edge.target_id,
    label: edge.label ?? EDGE_TYPE_LABELS[edge.edge_type],
    data: { edgeType: edge.edge_type },
  }));
}


export function applyPlannerNodeStatuses(
  nodes: FlowNode[],
  statusByNodeId: Record<string, "planned" | "completed">,
): FlowNode[] {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      scheduleStatus: statusByNodeId[node.id],
    },
  }));
}
