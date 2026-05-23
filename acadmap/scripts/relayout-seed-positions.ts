/**
 * Rewrite position_x / position_y in seed JSON files using spreadRoadmapNodePositions.
 * Usage: npx tsx scripts/relayout-seed-positions.ts [--ls-only]
 */
import { promises as fs } from "fs";
import path from "path";

import { layoutRoadmapNodes } from "../lib/roadmap-layout";
import type { SeedRoadmapInput } from "../lib/types";

const SEEDS_DIR = path.join(process.cwd(), "data", "seeds");

const LS_SLUGS = new Set([
  "actuarial-science",
  "financial-mathematics-and-statistics",
]);

async function main() {
  const lsOnly = process.argv.includes("--ls-only");
  const files = (await fs.readdir(SEEDS_DIR)).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const slug = file.replace(/^ucsb-/, "").replace(/\.json$/, "");
    if (lsOnly && !LS_SLUGS.has(slug)) continue;

    const filePath = path.join(SEEDS_DIR, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const seed = JSON.parse(raw) as SeedRoadmapInput;

    const layout = seed.metadata?.layout as string | undefined;
    seed.nodes = layoutRoadmapNodes(seed.nodes, layout);
    await fs.writeFile(filePath, `${JSON.stringify(seed, null, 2)}\n`, "utf-8");
    console.log(`Relaid out ${file} (${seed.nodes.length} nodes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
