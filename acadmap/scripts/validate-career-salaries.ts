#!/usr/bin/env node
/**
 * Validates that every career node title in seed JSON resolves to a salary profile.
 * Usage: npm run validate:career-salaries
 */
import { readdirSync, readFileSync } from "fs";
import path from "path";

import { resolveCareerSalary } from "../lib/career-salaries/resolve";
import type { SeedRoadmapInput } from "../lib/types";

const SEEDS_DIR = path.join(process.cwd(), "data", "seeds");

function main(): void {
  const missing: { file: string; title: string }[] = [];
  let careerCount = 0;

  for (const file of readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".json"))) {
    const seed = JSON.parse(
      readFileSync(path.join(SEEDS_DIR, file), "utf8"),
    ) as SeedRoadmapInput;

    for (const node of seed.nodes) {
      if (node.node_type !== "career") continue;
      careerCount++;
      const title = (node.title ?? node.label).trim();
      const profile = resolveCareerSalary(title, node.metadata);
      if (!profile) {
        missing.push({ file, title });
      }
    }
  }

  if (missing.length > 0) {
    console.error(`Missing salary profiles for ${missing.length} career nodes:\n`);
    for (const m of missing) {
      console.error(`  ${m.file}: "${m.title}"`);
    }
    process.exit(1);
  }

  console.log(
    `OK: all ${careerCount} career nodes across ${readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".json")).length} seeds resolve to salary profiles.`,
  );
}

main();
