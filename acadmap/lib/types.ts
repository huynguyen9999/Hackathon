export type NodeType = "course" | "career" | "skill";
export type EdgeType = "prerequisite" | "recommended" | "leads_to";
export type RoadmapStatus = "pending" | "approved" | "rejected";

export interface Resource {
  name: string;
  url: string;
}

export type PartnerKind = "affiliate" | "sponsored";

export type PartnerId =
  | "coursera"
  | "aws"
  | "google-career-certificates"
  | "codecraft-bootcamp";

export interface PartnerCatalogEntry {
  id: string;
  partner: PartnerId;
  partner_display_name: string;
  name: string;
  /** Destination URL (placeholder for demo). */
  url: string;
  kind: PartnerKind;
  description?: string;
  price_hint?: string;
}

export interface PartnerPlacement {
  node_labels: string[];
  affiliate_ids: string[];
  sponsored_id?: string;
}

export interface PartnerOffers {
  affiliates: PartnerCatalogEntry[];
  sponsored?: PartnerCatalogEntry;
}

export interface RoadmapNode {
  id: string;
  roadmap_id: string;
  node_type: NodeType;
  label: string;
  title?: string;
  description?: string;
  units?: number;
  self_learnable: boolean;
  resources?: Resource[];
  position_x: number;
  position_y: number;
  metadata?: Record<string, unknown>;
}

export interface RoadmapEdge {
  id: string;
  roadmap_id: string;
  source_id: string;
  target_id: string;
  edge_type: EdgeType;
  label?: string;
}

export type ScheduleStatus = "completed" | "planned";
export type NodeAnalysisState =
  | "conflict"
  | "critical"
  | "blocked"
  | "bottleneck"
  | "removed";

export interface Roadmap {
  id: string;
  major_id: string;
  status: RoadmapStatus;
  version: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface School {
  id: string;
  name: string;
  short_name: string;
  location?: string;
}

export interface Major {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  degree_type: string;
}

/** JSON file / POST body (nodes and edges omit roadmap_id). */
export interface SeedRoadmapInput {
  school: Omit<School, "id"> & { id?: string };
  major: Omit<Major, "id" | "school_id"> & { id?: string; school_id?: string };
  metadata?: {
    source?: string;
    source_url?: string;
    gear_page?: number;
    [key: string]: unknown;
  };
  nodes: Omit<RoadmapNode, "roadmap_id">[];
  edges: Omit<RoadmapEdge, "roadmap_id">[];
}

/** Full roadmap with school + major for pages and GET /api/roadmaps/[id]. */
export interface RoadmapDetail extends Roadmap {
  school: School;
  major: Major;
  metadata?: SeedRoadmapInput["metadata"];
}

/** GET /api/roadmaps list item (no nodes/edges). */
export interface RoadmapListItem {
  id: string;
  major_id: string;
  status: RoadmapStatus;
  version: number;
  school: School;
  major: Major;
}

// ——— React Flow UI types (camelCase) ———

/** Per-node metadata from seed JSON (e.g. senior capstone sequence). */
export type CourseNodeMetadata = {
  role?: string;
  optional?: boolean;
  sequence?: number;
};

export type RoadmapNodeData = {
  nodeType: "course";
  label: string;
  title: string;
  description: string;
  units: number;
  selfLearnable: boolean;
  resources: Resource[];
  nodeMetadata?: CourseNodeMetadata;
  scheduleStatus?: ScheduleStatus;
  analysisState?: NodeAnalysisState;
  analysisNote?: string;
  /** Set by RoadmapGraph when another node is focused. */
  dimmed?: boolean;
  /** Set by RoadmapGraph on the actively selected node. */
  focused?: boolean;
};

export type CareerNodeData = {
  nodeType: "career";
  label: string;
  title: string;
  description: string;
  units?: number;
  selfLearnable?: boolean;
  resources?: Resource[];
  scheduleStatus?: ScheduleStatus;
  analysisState?: NodeAnalysisState;
  analysisNote?: string;
  dimmed?: boolean;
  focused?: boolean;
};

export type iGauchoBackNodeData = RoadmapNodeData | CareerNodeData;

export type FlowNode = {
  id: string;
  type: "course" | "career";
  position: { x: number; y: number };
  data: iGauchoBackNodeData;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    edgeType: EdgeType;
    analysisState?: "conflict" | "critical" | "blocked";
  };
};

// ——— Supabase row shapes ———

export type DbSchoolRow = {
  id: string;
  name: string;
  short_name: string;
  location: string | null;
};

export type DbMajorRow = {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  degree_type: string | null;
};

export type DbRoadmapRow = {
  id: string;
  major_id: string;
  contributor_id: string | null;
  status: RoadmapStatus;
  version: number;
  created_at?: string;
  updated_at?: string;
};

export type DbNodeRow = {
  id: string;
  roadmap_id: string;
  external_id: string | null;
  node_type: NodeType;
  label: string;
  title: string | null;
  description: string | null;
  units: number | null;
  self_learnable: boolean;
  resources: Resource[] | null;
  position_x: number;
  position_y: number;
  metadata: Record<string, unknown> | null;
};

export type DbEdgeRow = {
  id: string;
  roadmap_id: string;
  source_id: string;
  target_id: string;
  edge_type: EdgeType;
  label: string | null;
};

export type ContributeFormData = {
  schoolName: string;
  shortName: string;
  major: string;
  degreeType: string;
  contributorNotes: string;
};
