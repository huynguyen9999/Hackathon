/**
 * Generate interactive roadmap seed JSON from ls-majors detail files.
 * Usage: npx tsx scripts/generate-ls-seeds.ts [--limit N] [--slug name]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import { spreadRoadmapNodePositions } from "../lib/roadmap-layout";
import type { CourseRef, LsMajorDetail } from "../lib/ucsb-major-detail-types";
import type { SeedRoadmapInput } from "../lib/types";

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "ls-majors");
const SEEDS_DIR = path.join(ROOT, "data", "seeds");

const MAX_COURSES = 14;
const MAX_CAREERS = 4;

const COURSE_CODE =
  /^[A-Z]{2,10}\s+\d+[A-Z]{0,2}$/;

const SKIP_CODE =
  /elective|upper-division|upper division|cluster|lab or|research|methods course|studio|concentration|portfolio|exhibition|capstone|approved|choose|sample|subdisciplines|biochemistry courses|science elective/i;

function slugifyCode(code: string): string {
  return code.toLowerCase().replace(/\s+/g, "-");
}

function isValidCourseCode(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed || trimmed.length > 20) return false;
  if (SKIP_CODE.test(trimmed)) return false;
  return COURSE_CODE.test(trimmed);
}

function collectCourseRefs(detail: LsMajorDetail): CourseRef[] {
  const seen = new Set<string>();
  const out: CourseRef[] = [];

  const add = (ref: CourseRef) => {
    const code = ref.code.trim();
    if (!isValidCourseCode(code) || seen.has(code)) return;
    seen.add(code);
    out.push({ ...ref, code });
  };

  for (const c of detail.pre_major?.courses ?? []) add(c);
  for (const c of detail.preparation.courses) add(c);
  for (const block of detail.upper_division) {
    for (const c of block.courses) add(c);
  }
  for (const c of detail.electives?.courses ?? []) add(c);

  for (const plan of detail.recommended_plans) {
    for (const entry of plan.entries) {
      if ("slot" in entry) continue;
      add(entry);
    }
  }

  return out.slice(0, MAX_COURSES);
}

function courseDescription(ref: CourseRef, majorName: string): string {
  if (ref.notes && ref.notes.length < 120 && !SKIP_CODE.test(ref.notes)) {
    return ref.notes;
  }
  if (ref.title && ref.title.length < 120 && !SKIP_CODE.test(ref.title)) {
    return `${ref.title} — part of the ${majorName} prerequisite and major sequence.`;
  }
  return `Required or recommended course for the ${majorName} major at UCSB.`;
}

function careerId(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `career-${base || index}`;
}

function buildSeed(
  detail: LsMajorDetail,
  degreeType: string,
): SeedRoadmapInput {
  const courses = collectCourseRefs(detail);
  const careers = detail.career_outcomes.slice(0, MAX_CAREERS);

  if (courses.length < 3) {
    throw new Error(`${detail.slug}: not enough valid course codes (${courses.length})`);
  }

  const courseNodes = courses.map((ref, index) => {
    const col = index;
    return {
      id: slugifyCode(ref.code),
      node_type: "course" as const,
      label: ref.code,
      title: ref.title ?? ref.code,
      description: courseDescription(ref, detail.name),
      units: ref.units ?? 4,
      self_learnable: /CMPSC|CS|python|programming/i.test(ref.code + (ref.title ?? "")),
      position_x: 80 + col * 300,
      position_y: 80,
    };
  });

  const careerStartX = 80 + courseNodes.length * 300;
  const careerNodes = careers.map((outcome, index) => ({
    id: careerId(outcome, index),
    node_type: "career" as const,
    label: outcome.split("(")[0]?.trim().slice(0, 28) ?? outcome.slice(0, 28),
    title: outcome,
    description: `Career path for ${detail.name} graduates: ${outcome}.`,
    self_learnable: false,
    position_x: careerStartX,
    position_y: 80 + index * 220,
  }));

  const edges: SeedRoadmapInput["edges"] = [];
  for (let i = 0; i < courseNodes.length - 1; i++) {
    edges.push({
      id: `e${i + 1}`,
      source_id: courseNodes[i]!.id,
      target_id: courseNodes[i + 1]!.id,
      edge_type: "prerequisite",
    });
  }

  const lastCourse = courseNodes[courseNodes.length - 1]!;
  const midCourse = courseNodes[Math.max(0, courseNodes.length - 3)]!;
  careerNodes.forEach((career, i) => {
    edges.push({
      id: `ec${i + 1}`,
      source_id: i % 2 === 0 ? lastCourse.id : midCourse.id,
      target_id: career.id,
      edge_type: "leads_to",
    });
  });

  const sourceUrl = detail.sources[0]?.url ?? "https://catalog.ucsb.edu/";

  const seed: SeedRoadmapInput = {
    school: {
      name: "UC Santa Barbara",
      short_name: "ucsb",
      location: "Santa Barbara, CA",
    },
    major: {
      name: detail.name,
      slug: detail.slug,
      degree_type: degreeType,
    },
    metadata: {
      source: `UCSB L&S ${detail.name} (${detail.catalog_year})`,
      source_url: sourceUrl,
    },
    nodes: spreadRoadmapNodePositions([...courseNodes, ...careerNodes]),
    edges,
  };

  return seed;
}

function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 20;
  const onlySlug = slugArg?.split("=")[1];
  const force = process.argv.includes("--force");

  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: { slug: string; degree_type: string; name: string }[];
  };

  const targets = onlySlug
    ? catalog.majors.filter((m) => m.slug === onlySlug)
    : catalog.majors.slice(0, limit);

  let written = 0;
  let skipped = 0;

  for (const major of targets) {
    const detailPath = path.join(DETAIL_DIR, `${major.slug}.json`);
    if (!existsSync(detailPath)) {
      console.warn(`Skip ${major.slug}: no detail file`);
      skipped++;
      continue;
    }

    const detail = JSON.parse(readFileSync(detailPath, "utf-8")) as LsMajorDetail;
    const outPath = path.join(SEEDS_DIR, `ucsb-${major.slug}.json`);

    if (existsSync(outPath) && !force) {
      console.log(`Keep existing ${outPath}`);
      skipped++;
      continue;
    }

    try {
      const seed = buildSeed(detail, major.degree_type);
      writeFileSync(outPath, `${JSON.stringify(seed, null, 2)}\n`, "utf-8");
      console.log(`Wrote ${outPath} (${seed.nodes.length} nodes)`);
      written++;
    } catch (err) {
      console.warn(`Skip ${major.slug}: ${(err as Error).message}`);
      skipped++;
    }
  }

  console.log(`Done: ${written} seeds written, ${skipped} skipped.`);
}

main();
