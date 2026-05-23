import { promises as fs } from "fs";
import path from "path";

import { isSupabaseConfigured } from "@/lib/env";
import { createServerClient } from "@/lib/supabase";
import type {
  DbEdgeRow,
  DbMajorRow,
  DbNodeRow,
  DbRoadmapRow,
  DbSchoolRow,
  Major,
  Roadmap,
  RoadmapDetail,
  RoadmapEdge,
  RoadmapListItem,
  RoadmapNode,
  School,
  SeedRoadmapInput,
} from "@/lib/types";

const SEEDS_DIR = path.join(process.cwd(), "data", "seeds");

function seedRoadmapId(shortName: string, majorSlug: string): string {
  return `seed-${shortName.toLowerCase()}-${majorSlug.toLowerCase()}`;
}

function seedMajorId(shortName: string, majorSlug: string): string {
  return `seed-major-${shortName.toLowerCase()}-${majorSlug.toLowerCase()}`;
}

function seedSchoolId(shortName: string): string {
  return `seed-school-${shortName.toLowerCase()}`;
}

export function seedInputToDetail(
  input: SeedRoadmapInput,
  fileBase?: string,
): RoadmapDetail {
  const shortName = input.school.short_name.toLowerCase();
  const majorSlug = input.major.slug.toLowerCase();
  const roadmapId =
    fileBase ?? seedRoadmapId(shortName, majorSlug);

  const school: School = {
    id: input.school.id ?? seedSchoolId(shortName),
    name: input.school.name,
    short_name: shortName,
    location: input.school.location,
  };

  const major: Major = {
    id: input.major.id ?? seedMajorId(shortName, majorSlug),
    school_id: school.id,
    name: input.major.name,
    slug: majorSlug,
    degree_type: input.major.degree_type,
  };

  const nodes: RoadmapNode[] = input.nodes.map((n) => ({
    ...n,
    roadmap_id: roadmapId,
    self_learnable: n.self_learnable ?? false,
  }));

  const edges: RoadmapEdge[] = input.edges.map((e) => ({
    ...e,
    roadmap_id: roadmapId,
  }));

  return {
    id: roadmapId,
    major_id: major.id,
    status: "approved",
    version: 1,
    nodes,
    edges,
    school,
    major,
  };
}

/** Read every JSON seed (server-only). All seeds are treated as approved. */
export async function loadSeedRoadmapDetails(): Promise<RoadmapDetail[]> {
  if (typeof window !== "undefined") {
    throw new Error("loadSeedRoadmapDetails() must run on the server");
  }

  let entries: string[];
  try {
    entries = await fs.readdir(SEEDS_DIR);
  } catch {
    return [];
  }

  const details: RoadmapDetail[] = [];

  for (const file of entries.filter((f) => f.endsWith(".json"))) {
    const raw = await fs.readFile(path.join(SEEDS_DIR, file), "utf-8");
    const parsed = JSON.parse(raw) as SeedRoadmapInput;
    const base = file.replace(/\.json$/, "");
    details.push(seedInputToDetail(parsed, `seed-${base}`));
  }

  return details.sort((a, b) =>
    `${a.school.short_name}-${a.major.slug}`.localeCompare(
      `${b.school.short_name}-${b.major.slug}`,
    ),
  );
}

function detailToListItem(detail: RoadmapDetail): RoadmapListItem {
  return {
    id: detail.id,
    major_id: detail.major_id,
    status: detail.status,
    version: detail.version,
    school: detail.school,
    major: detail.major,
  };
}

/** Approved roadmaps only (seeds + Supabase). */
export async function getApprovedRoadmapList(): Promise<RoadmapListItem[]> {
  const byId = new Map<string, RoadmapListItem>();

  for (const seed of await loadSeedRoadmapDetails()) {
    byId.set(seed.id, detailToListItem(seed));
  }

  if (isSupabaseConfigured()) {
    const remote = await fetchApprovedListFromSupabase();
    for (const item of remote) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.school.short_name.localeCompare(b.school.short_name),
  );
}

export async function getRoadmapDetailById(
  id: string,
): Promise<RoadmapDetail | null> {
  const seeds = await loadSeedRoadmapDetails();
  const fromSeed = seeds.find((r) => r.id === id);
  if (fromSeed && fromSeed.status === "approved") return fromSeed;

  if (!isSupabaseConfigured()) return null;

  return fetchRoadmapDetailFromSupabase(id);
}

export async function getRoadmapBySlug(
  schoolShortName: string,
  majorSlug: string,
): Promise<RoadmapDetail | null> {
  const school = schoolShortName.toLowerCase();
  const major = majorSlug.toLowerCase();

  const seeds = await loadSeedRoadmapDetails();
  const fromSeed = seeds.find(
    (r) =>
      r.status === "approved" &&
      r.school.short_name === school &&
      r.major.slug === major,
  );
  if (fromSeed) return fromSeed;

  if (!isSupabaseConfigured()) return null;

  return fetchRoadmapDetailBySlugFromSupabase(school, major);
}

/** Schools with at least one approved roadmap. */
export async function getSchoolsWithApprovedRoadmaps(): Promise<School[]> {
  const list = await getApprovedRoadmapList();
  const seen = new Map<string, School>();

  for (const { school } of list) {
    if (!seen.has(school.id)) {
      seen.set(school.id, school);
    }
  }

  return Array.from(seen.values()).sort((a, b) =>
    a.short_name.localeCompare(b.short_name),
  );
}

/** @deprecated Use getApprovedRoadmapList */
export async function getAllRoadmaps(): Promise<RoadmapDetail[]> {
  const list = await getApprovedRoadmapList();
  const details: RoadmapDetail[] = [];

  for (const item of list) {
    const full = await getRoadmapDetailById(item.id);
    if (full) details.push(full);
  }

  return details;
}

/** @deprecated Use getSchoolsWithApprovedRoadmaps */
export async function getSchools(): Promise<School[]> {
  return getSchoolsWithApprovedRoadmaps();
}

export async function getMajorsForSchool(
  schoolShortName: string,
): Promise<Major[]> {
  const normalized = schoolShortName.toLowerCase();
  const list = await getApprovedRoadmapList();
  return list
    .filter((r) => r.school.short_name === normalized)
    .map((r) => r.major);
}

/** Insert contribution into Supabase with status pending. */
export async function insertRoadmapFromSeed(
  input: SeedRoadmapInput,
  contributorId: string,
): Promise<RoadmapDetail> {
  const supabase = await createServerClient();

  const shortName = input.school.short_name.toLowerCase().trim();

  let schoolId = input.school.id;
  if (!schoolId) {
    const { data: existingSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("short_name", shortName)
      .maybeSingle();

    if (existingSchool?.id) {
      schoolId = existingSchool.id;
    } else {
      const { data: newSchool, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: input.school.name.trim(),
          short_name: shortName,
          location: input.school.location?.trim() ?? null,
        })
        .select("id")
        .single();

      if (schoolError || !newSchool) {
        throw new Error(schoolError?.message ?? "Failed to create school");
      }
      schoolId = newSchool.id;
    }
  }

  const majorSlug = input.major.slug.toLowerCase().trim();

  let majorId = input.major.id;
  if (!majorId) {
    const { data: existingMajor } = await supabase
      .from("majors")
      .select("id")
      .eq("school_id", schoolId)
      .eq("slug", majorSlug)
      .maybeSingle();

    if (existingMajor?.id) {
      majorId = existingMajor.id;
    } else {
      const { data: newMajor, error: majorError } = await supabase
        .from("majors")
        .insert({
          school_id: schoolId,
          name: input.major.name.trim(),
          slug: majorSlug,
          degree_type: input.major.degree_type.trim(),
        })
        .select("id")
        .single();

      if (majorError || !newMajor) {
        throw new Error(majorError?.message ?? "Failed to create major");
      }
      majorId = newMajor.id;
    }
  }

  const { data: roadmapRow, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      major_id: majorId,
      contributor_id: contributorId,
      status: "pending",
      version: 1,
    })
    .select("id")
    .single();

  if (roadmapError || !roadmapRow) {
    throw new Error(roadmapError?.message ?? "Failed to create roadmap");
  }

  const roadmapId = roadmapRow.id as string;
  const idByExternal = new Map<string, string>();

  for (const node of input.nodes) {
    const { data: inserted, error: nodeError } = await supabase
      .from("nodes")
      .insert({
        roadmap_id: roadmapId,
        external_id: node.id,
        node_type: node.node_type,
        label: node.label,
        title: node.title ?? null,
        description: node.description ?? null,
        units: node.units ?? null,
        self_learnable: node.self_learnable,
        resources: node.resources ?? [],
        position_x: node.position_x,
        position_y: node.position_y,
        metadata: node.metadata ?? {},
      })
      .select("id, external_id")
      .single();

    if (nodeError || !inserted) {
      throw new Error(nodeError?.message ?? `Failed to insert node ${node.id}`);
    }

    idByExternal.set(node.id, inserted.id);
  }

  for (const edge of input.edges) {
    const sourceId = idByExternal.get(edge.source_id);
    const targetId = idByExternal.get(edge.target_id);

    if (!sourceId || !targetId) {
      throw new Error(`Invalid edge ${edge.id}: unknown source or target`);
    }

    const { error: edgeError } = await supabase.from("edges").insert({
      roadmap_id: roadmapId,
      source_id: sourceId,
      target_id: targetId,
      edge_type: edge.edge_type,
      label: edge.label ?? null,
    });

    if (edgeError) {
      throw new Error(edgeError.message);
    }
  }

  const detail = await fetchRoadmapDetailFromSupabase(roadmapId);
  if (!detail) {
    throw new Error("Roadmap created but could not be loaded");
  }

  return detail;
}

// ——— Supabase mappers ———

function mapSchool(row: DbSchoolRow): School {
  return {
    id: row.id,
    name: row.name,
    short_name: row.short_name,
    location: row.location ?? undefined,
  };
}

function mapMajor(row: DbMajorRow): Major {
  return {
    id: row.id,
    school_id: row.school_id,
    name: row.name,
    slug: row.slug,
    degree_type: row.degree_type ?? "",
  };
}

function mapNode(row: DbNodeRow, nodeIdForGraph: string): RoadmapNode {
  return {
    id: nodeIdForGraph,
    roadmap_id: row.roadmap_id,
    node_type: row.node_type,
    label: row.label,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    units: row.units ?? undefined,
    self_learnable: row.self_learnable,
    resources: row.resources ?? undefined,
    position_x: row.position_x,
    position_y: row.position_y,
    metadata: row.metadata ?? undefined,
  };
}

function mapEdge(
  row: DbEdgeRow,
  resolveNodeId: (uuid: string) => string,
): RoadmapEdge {
  return {
    id: row.id,
    roadmap_id: row.roadmap_id,
    source_id: resolveNodeId(row.source_id),
    target_id: resolveNodeId(row.target_id),
    edge_type: row.edge_type,
    label: row.label ?? undefined,
  };
}

async function hydrateDetail(
  roadmap: DbRoadmapRow,
  school: DbSchoolRow,
  major: DbMajorRow,
  nodeRows: DbNodeRow[],
  edgeRows: DbEdgeRow[],
): Promise<RoadmapDetail> {
  const uuidToGraphId = new Map<string, string>();
  for (const row of nodeRows) {
    uuidToGraphId.set(row.id, row.external_id ?? row.id);
  }

  const resolveNodeId = (uuid: string) => uuidToGraphId.get(uuid) ?? uuid;

  const nodes = nodeRows.map((row) =>
    mapNode(row, resolveNodeId(row.id)),
  );
  const edges = edgeRows.map((row) => mapEdge(row, resolveNodeId));

  return {
    id: roadmap.id,
    major_id: roadmap.major_id,
    status: roadmap.status,
    version: roadmap.version,
    nodes,
    edges,
    school: mapSchool(school),
    major: mapMajor(major),
  };
}

async function fetchApprovedListFromSupabase(): Promise<RoadmapListItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("roadmaps")
    .select(
      `
      id,
      major_id,
      status,
      version,
      major:majors (
        id,
        school_id,
        name,
        slug,
        degree_type,
        school:schools (
          id,
          name,
          short_name,
          location
        )
      )
    `,
    )
    .eq("status", "approved");

  if (error || !data?.length) return [];

  return data
    .map((row) => {
      const rawMajor = row.major as unknown;
      const major = (
        Array.isArray(rawMajor) ? rawMajor[0] : rawMajor
      ) as DbMajorRow & { school: DbSchoolRow };
      const school = Array.isArray(major?.school)
        ? major.school[0]
        : major?.school;
      if (!major || !school) return null;
      return {
        id: row.id as string,
        major_id: row.major_id as string,
        status: row.status as Roadmap["status"],
        version: row.version as number,
        school: mapSchool(school),
        major: mapMajor({ ...major, school_id: major.school_id }),
      } satisfies RoadmapListItem;
    })
    .filter((x): x is RoadmapListItem => x !== null);
}

async function fetchRoadmapDetailFromSupabase(
  id: string,
): Promise<RoadmapDetail | null> {
  const supabase = await createServerClient();

  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select(
      `
      *,
      major:majors (
        *,
        school:schools (*)
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !roadmap) return null;

  const rawMajor = roadmap.major as unknown;
  const major = (
    Array.isArray(rawMajor) ? rawMajor[0] : rawMajor
  ) as DbMajorRow & { school: DbSchoolRow };
  const school = Array.isArray(major?.school)
    ? major.school[0]
    : major?.school;
  if (!major || !school) return null;

  const [{ data: nodeRows }, { data: edgeRows }] = await Promise.all([
    supabase.from("nodes").select("*").eq("roadmap_id", id),
    supabase.from("edges").select("*").eq("roadmap_id", id),
  ]);

  if (!nodeRows || !edgeRows) return null;

  return hydrateDetail(
    roadmap as DbRoadmapRow,
    school,
    major,
    nodeRows as DbNodeRow[],
    edgeRows as DbEdgeRow[],
  );
}

async function fetchRoadmapDetailBySlugFromSupabase(
  shortName: string,
  majorSlug: string,
): Promise<RoadmapDetail | null> {
  const supabase = await createServerClient();

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("short_name", shortName)
    .maybeSingle();

  if (!school) return null;

  const { data: major } = await supabase
    .from("majors")
    .select("id")
    .eq("school_id", school.id)
    .eq("slug", majorSlug)
    .maybeSingle();

  if (!major) return null;

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("major_id", major.id)
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!roadmap) return null;

  return fetchRoadmapDetailFromSupabase(roadmap.id);
}
