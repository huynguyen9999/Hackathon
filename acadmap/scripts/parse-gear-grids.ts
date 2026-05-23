/**
 * Scaffold coe-majors from gear-sources (preserves hand-authored files).
 * Run: npm run parse:gear
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

console.log(
  "parse:gear — GEAR detail files are hand-authored in data/ucsb/coe-majors/.",
);
console.log("Run npm run validate:coe-details && npm run sync:coe-details");

const DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "coe-majors");
const SOURCES = path.join(process.cwd(), "data", "ucsb", "gear-sources.json");

if (!existsSync(SOURCES)) {
  console.error("Missing gear-sources.json");
  process.exit(1);
}

const registry = JSON.parse(readFileSync(SOURCES, "utf-8")) as {
  sources: Record<string, { gear_page: number; dept_page: string }>;
};

let count = 0;
for (const slug of Object.keys(registry.sources)) {
  if (existsSync(path.join(DETAIL_DIR, `${slug}.json`))) {
    count += 1;
  }
}

console.log(`Found ${count} existing coe-majors detail files.`);
