import type {
  EdgeType,
  NodeType,
  Resource,
  SeedRoadmapInput,
} from "@/lib/types";

const NODE_TYPES: NodeType[] = ["course", "career", "skill"];
const EDGE_TYPES: EdgeType[] = ["prerequisite", "recommended", "leads_to"];

function isResource(value: unknown): value is Resource {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return typeof r.name === "string" && typeof r.url === "string";
}

function isSeedNode(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  if (typeof n.id !== "string" || !n.id.trim()) return false;
  if (!NODE_TYPES.includes(n.node_type as NodeType)) return false;
  if (typeof n.label !== "string" || !n.label.trim()) return false;
  if (typeof n.self_learnable !== "boolean") return false;
  if (typeof n.position_x !== "number" || typeof n.position_y !== "number") {
    return false;
  }
  if (n.resources !== undefined) {
    if (!Array.isArray(n.resources) || !n.resources.every(isResource)) {
      return false;
    }
  }
  return true;
}

function isSeedEdge(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.source_id === "string" &&
    typeof e.target_id === "string" &&
    EDGE_TYPES.includes(e.edge_type as EdgeType)
  );
}

export function isSeedRoadmapInput(body: unknown): body is SeedRoadmapInput {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;

  const school = o.school;
  if (!school || typeof school !== "object") return false;
  const s = school as Record<string, unknown>;
  if (typeof s.name !== "string" || !s.name.trim()) return false;
  if (typeof s.short_name !== "string" || !s.short_name.trim()) return false;

  const major = o.major;
  if (!major || typeof major !== "object") return false;
  const m = major as Record<string, unknown>;
  if (typeof m.name !== "string" || !m.name.trim()) return false;
  if (typeof m.slug !== "string" || !m.slug.trim()) return false;
  if (typeof m.degree_type !== "string" || !m.degree_type.trim()) return false;

  if (!Array.isArray(o.nodes) || o.nodes.length === 0) return false;
  if (!o.nodes.every(isSeedNode)) return false;

  if (!Array.isArray(o.edges)) return false;
  if (!o.edges.every(isSeedEdge)) return false;

  const nodeIds = new Set(
    (o.nodes as { id: string }[]).map((n) => n.id),
  );
  for (const edge of o.edges as { source_id: string; target_id: string }[]) {
    if (!nodeIds.has(edge.source_id) || !nodeIds.has(edge.target_id)) {
      return false;
    }
  }

  return true;
}
