#!/usr/bin/env node
import { readdir, readFile } from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "data", "ucsb", "curriculum");

async function main(): Promise<void> {
  const subjectsRaw = await readFile(path.join(ROOT, "subjects.json"), "utf8");
  const subjects = JSON.parse(subjectsRaw) as { subjects: unknown[] };
  if (!Array.isArray(subjects.subjects) || subjects.subjects.length === 0) {
    throw new Error("subjects.json invalid or empty");
  }

  const quartersRaw = await readFile(path.join(ROOT, "quarters.json"), "utf8");
  const quarters = JSON.parse(quartersRaw) as { quarters: unknown[] };
  if (!Array.isArray(quarters.quarters) || quarters.quarters.length === 0) {
    throw new Error("quarters.json invalid or empty");
  }

  const snapRoot = path.join(ROOT, "snapshots");
  const quarterDirs = await readdir(snapRoot);
  let fileCount = 0;

  for (const quarter of quarterDirs) {
    const files = await readdir(path.join(snapRoot, quarter));
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await readFile(path.join(snapRoot, quarter, file), "utf8");
      const data = JSON.parse(raw) as {
        quarter?: string;
        subjectCode?: string;
        level?: string;
        courses?: unknown[];
      };
      if (!data.quarter || !data.subjectCode || !data.level) {
        throw new Error(`Invalid snapshot ${quarter}/${file}`);
      }
      if (!Array.isArray(data.courses)) {
        throw new Error(`Missing courses array in ${quarter}/${file}`);
      }
      fileCount += 1;
    }
  }

  if (fileCount === 0) {
    throw new Error("No snapshot files found");
  }

  console.log(
    `Validated ${subjects.subjects.length} subjects, ${quarters.quarters.length} quarters, ${fileCount} snapshots.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
