#!/usr/bin/env node
import { readdir, readFile } from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "data", "ucsb", "grades");
const SPOT_CHECK = ["ECE 130A", "CMPSC 16", "MATH 4A"];

async function main(): Promise<void> {
  const metaRaw = await readFile(path.join(ROOT, "meta.json"), "utf8");
  const meta = JSON.parse(metaRaw) as { courseCount?: number };
  if (!meta.courseCount || meta.courseCount < 100) {
    throw new Error("meta.json invalid or too few courses");
  }

  const indexRaw = await readFile(path.join(ROOT, "search-index.json"), "utf8");
  const index = JSON.parse(indexRaw) as { courses: { courseId: string }[] };
  if (!Array.isArray(index.courses) || index.courses.length === 0) {
    throw new Error("search-index.json invalid");
  }

  const lbRaw = await readFile(path.join(ROOT, "leaderboards.json"), "utf8");
  const lb = JSON.parse(lbRaw) as {
    highestGpa: unknown[];
    lowestGpa: unknown[];
    mostOffered: unknown[];
  };
  if (!lb.highestGpa?.length || !lb.mostOffered?.length) {
    throw new Error("leaderboards.json invalid");
  }

  const byDept = await readdir(path.join(ROOT, "by-dept"));
  const deptFiles = byDept.filter((f) => f.endsWith(".json"));
  if (deptFiles.length === 0) {
    throw new Error("No by-dept shards");
  }

  const gesAreas = await readFile(path.join(ROOT, "ges", "areas.json"), "utf8");
  const ges = JSON.parse(gesAreas) as { areas: unknown[] };
  if (!Array.isArray(ges.areas) || ges.areas.length === 0) {
    throw new Error("ges/areas.json invalid");
  }

  const ids = new Set(index.courses.map((c) => c.courseId));
  for (const courseId of SPOT_CHECK) {
    if (!ids.has(courseId)) {
      throw new Error(`Spot-check course missing: ${courseId}`);
    }
  }

  console.log(
    `Validated ${index.courses.length} courses, ${deptFiles.length} dept shards, ${ges.areas.length} GE areas.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
