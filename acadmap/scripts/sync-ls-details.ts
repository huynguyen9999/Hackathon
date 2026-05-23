/**
 * Sync ls-catalog.json with ls-majors detail files and source registry.
 * Run: npm run sync:details
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import type { LsMajorDetail } from "../lib/ucsb-major-detail-types";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "ls-majors");
const SOURCES_PATH = path.join(ROOT, "data", "ucsb", "major-sheet-sources.json");

function seedPathForSlug(slug: string): string {
  return path.join(ROOT, "data", "seeds", `ucsb-${slug}.json`);
}

type SourceRegistry = {
  sources: Record<
    string,
    {
      dept_page?: string;
      major_sheet_pdf?: string;
      plan_of_study_pdf?: string;
    }
  >;
};

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: UcsbMajor[];
    last_updated: string;
  };
  const registry = JSON.parse(readFileSync(SOURCES_PATH, "utf-8")) as SourceRegistry;

  const detailFiles = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"));
  const detailSlugs = new Set(detailFiles.map((f) => f.replace(/\.json$/, "")));

  for (const major of catalog.majors) {
    const hasDetail = detailSlugs.has(major.slug);
    const src = registry.sources[major.slug];

    major.detail_available = hasDetail;

    if (existsSync(seedPathForSlug(major.slug))) {
      major.roadmap_available = true;
    }

    if (hasDetail) {
      const detail = JSON.parse(
        readFileSync(path.join(DETAIL_DIR, `${major.slug}.json`), "utf-8"),
      ) as LsMajorDetail;
      major.career_outcomes = detail.career_outcomes;
      if (major.roadmap_available) {
        major.requirements_level = "roadmap";
      } else if (detail.quality_tier === "sheet") {
        major.requirements_level = "sheet";
      } else {
        major.requirements_level = "summary";
      }
    }

    if (src?.major_sheet_pdf) {
      major.major_sheet_url = src.major_sheet_pdf;
    }
    if (src?.plan_of_study_pdf) {
      major.plan_of_study_url = src.plan_of_study_pdf;
    }
    if (src?.dept_page && hasDetail) {
      major.curriculum_url = src.dept_page;
    }
  }

  catalog.last_updated = new Date().toISOString().slice(0, 10);
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");

  console.log(
    `Synced catalog: ${detailSlugs.size} majors with sheet detail (${Array.from(detailSlugs).join(", ")}).`,
  );
}

main();
