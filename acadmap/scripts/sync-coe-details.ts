/**
 * Sync coe-catalog.json with coe-majors detail files and gear-sources.
 * Run: npm run sync:coe-details
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import type { CoeMajorDetail } from "../lib/coe-major-detail-types";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "coe-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "coe-majors");

function seedPathForSlug(slug: string): string {
  return path.join(ROOT, "data", "seeds", `ucsb-${slug}.json`);
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: UcsbMajor[];
    last_updated: string;
  };

  const detailFiles = existsSync(DETAIL_DIR)
    ? readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"))
    : [];
  const detailSlugs = new Set(detailFiles.map((f) => f.replace(/\.json$/, "")));

  for (const major of catalog.majors) {
    const hasDetail = detailSlugs.has(major.slug);
    major.detail_available = hasDetail;

    if (existsSync(seedPathForSlug(major.slug))) {
      major.roadmap_available = true;
    }

    if (hasDetail) {
      const detail = JSON.parse(
        readFileSync(path.join(DETAIL_DIR, `${major.slug}.json`), "utf-8"),
      ) as CoeMajorDetail;
      major.career_outcomes = detail.career_outcomes;
      if (major.roadmap_available) {
        major.requirements_level = "roadmap";
      } else if (detail.quality_tier === "gear") {
        major.requirements_level = "gear";
      } else {
        major.requirements_level = "summary";
      }
    }
  }

  catalog.last_updated = new Date().toISOString().slice(0, 10);
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");

  console.log(
    `Synced CoE catalog: ${detailSlugs.size} majors with GEAR detail (${Array.from(detailSlugs).join(", ")}).`,
  );
}

main();
