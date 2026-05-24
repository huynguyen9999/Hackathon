#!/usr/bin/env node
/**
 * Lists career titles in seeds that lack salary profiles (no write).
 * Usage: npm run enrich:career-salaries
 */
import { readdirSync, readFileSync } from "fs";
import path from "path";

import { resolveCareerSalary } from "../lib/career-salaries/resolve";
import type { SeedRoadmapInput } from "../lib/types";

const SEEDS_DIR = path.join(process.cwd(), "data", "seeds");

function main(): void {
  const titles = new Set<string>();
  const missing = new Set<string>();

  for (const file of readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".json"))) {
    const seed = JSON.parse(
      readFileSync(path.join(SEEDS_DIR, file), "utf8"),
    ) as SeedRoadmapInput;

    for (const node of seed.nodes) {
      if (node.node_type !== "career") continue;
      const title = (node.title ?? node.label).trim();
      titles.add(title);
      if (!resolveCareerSalary(title, node.metadata)) {
        missing.add(title);
      }
    }
  }

  console.log(`Unique career titles: ${titles.size}`);
  if (missing.size === 0) {
    console.log("All titles resolve to salary profiles.");
    return;
  }

  console.log(`Missing (${missing.size}):`);
  for (const t of [...missing].sort()) {
    console.log(`  - ${t}`);
  }
  process.exit(1);
}

main();
