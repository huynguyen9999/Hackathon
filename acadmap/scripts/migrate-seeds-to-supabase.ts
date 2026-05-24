#!/usr/bin/env node
/**
 * Migrate all JSON seeds in data/seeds/ to Supabase as approved roadmaps.
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage:
 *   npm run migrate:seeds
 *   npm run migrate:seeds -- --force
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

import { createAdminClient } from "../lib/supabase-admin";
import type { SeedRoadmapInput } from "../lib/types";
import { isSeedRoadmapInput } from "../lib/validate-seed";

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadSeedFiles(): { file: string; input: SeedRoadmapInput }[] {
  const seedsDir = path.join(process.cwd(), "data", "seeds");
  const files = readdirSync(seedsDir).filter((f) => f.endsWith(".json"));
  const results: { file: string; input: SeedRoadmapInput }[] = [];

  for (const file of files.sort()) {
    const raw = readFileSync(path.join(seedsDir, file), "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (!isSeedRoadmapInput(parsed)) {
      throw new Error(`Invalid seed format: ${file}`);
    }
    results.push({ file, input: parsed });
  }

  return results;
}

async function ensureSchool(
  supabase: ReturnType<typeof createAdminClient>,
  input: SeedRoadmapInput,
): Promise<string> {
  const shortName = input.school.short_name.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("schools")
    .select("id")
    .eq("short_name", shortName)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("schools")
    .insert({
      name: input.school.name.trim(),
      short_name: shortName,
      location: input.school.location?.trim() ?? null,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? `Failed to create school ${shortName}`);
  }

  return created.id;
}

async function ensureMajor(
  supabase: ReturnType<typeof createAdminClient>,
  schoolId: string,
  input: SeedRoadmapInput,
): Promise<string> {
  const majorSlug = input.major.slug.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("majors")
    .select("id")
    .eq("school_id", schoolId)
    .eq("slug", majorSlug)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("majors")
    .insert({
      school_id: schoolId,
      name: input.major.name.trim(),
      slug: majorSlug,
      degree_type: input.major.degree_type.trim(),
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? `Failed to create major ${majorSlug}`);
  }

  return created.id;
}

async function findApprovedRoadmap(
  supabase: ReturnType<typeof createAdminClient>,
  majorId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("major_id", majorId)
    .eq("status", "approved")
    .eq("version", 1)
    .maybeSingle();

  return data?.id ?? null;
}

async function deleteRoadmap(
  supabase: ReturnType<typeof createAdminClient>,
  roadmapId: string,
): Promise<void> {
  await supabase.from("edges").delete().eq("roadmap_id", roadmapId);
  await supabase.from("nodes").delete().eq("roadmap_id", roadmapId);
  await supabase.from("roadmaps").delete().eq("id", roadmapId);
}

async function insertApprovedRoadmap(
  supabase: ReturnType<typeof createAdminClient>,
  majorId: string,
  input: SeedRoadmapInput,
): Promise<string> {
  const { data: roadmapRow, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      major_id: majorId,
      contributor_id: null,
      status: "approved",
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

  return roadmapId;
}

async function main(): Promise<void> {
  loadEnvLocal();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const supabase = createAdminClient();
  const seeds = loadSeedFiles();

  let inserted = 0;
  let skipped = 0;
  let replaced = 0;
  const errors: string[] = [];

  console.log(`Migrating ${seeds.length} seed files${force ? " (--force)" : ""}…\n`);

  for (const { file, input } of seeds) {
    const label = `${input.school.short_name}/${input.major.slug}`;
    try {
      const schoolId = await ensureSchool(supabase, input);
      const majorId = await ensureMajor(supabase, schoolId, input);
      const existingId = await findApprovedRoadmap(supabase, majorId);

      if (existingId && !force) {
        console.log(`SKIP ${file} (${label}) — approved roadmap exists`);
        skipped++;
        continue;
      }

      if (existingId && force) {
        await deleteRoadmap(supabase, existingId);
        replaced++;
      }

      const roadmapId = await insertApprovedRoadmap(supabase, majorId, input);
      console.log(`OK   ${file} (${label}) → ${roadmapId}`);
      inserted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`FAIL ${file} (${label}): ${message}`);
      errors.push(`${file}: ${message}`);
    }
  }

  console.log(
    `\nDone: ${inserted} inserted, ${skipped} skipped, ${replaced} replaced, ${errors.length} errors`,
  );

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
