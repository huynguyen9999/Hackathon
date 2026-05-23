/**
 * Sync ccs-catalog.json with ccs-majors detail files.
 * Run: npm run sync:ccs-details
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import type { CcsMajorDetail } from "../lib/ccs-major-detail-types";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ccs-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "ccs-majors");

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
    major.roadmap_available = false;

    if (hasDetail) {
      const detail = JSON.parse(
        readFileSync(path.join(DETAIL_DIR, `${major.slug}.json`), "utf-8"),
      ) as CcsMajorDetail;
      major.career_outcomes = detail.career_outcomes;
      major.requirements_level =
        detail.quality_tier === "sheet" ? "sheet" : "summary";
    }
  }

  catalog.last_updated = new Date().toISOString().slice(0, 10);
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");

  console.log(
    `Synced CCS catalog: ${detailSlugs.size} majors with detail (${Array.from(detailSlugs).join(", ")}).`,
  );
}

main();
