/**
 * Sync berkeley/coe-catalog.json with coe-majors detail files and seed roadmaps.
 * Run: npm run sync:berkeley-details
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import type { CoeMajorDetail } from "../lib/coe-major-detail-types";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "berkeley", "coe-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "berkeley", "coe-majors");
const SOURCES_PATH = path.join(ROOT, "data", "berkeley", "engineering-sources.json");

function seedPathForSlug(slug: string): string {
  return path.join(ROOT, "data", "seeds", `berkeley-${slug}.json`);
}

function summarizePrep(detail: CoeMajorDetail): string[] {
  const codes = detail.preparation.courses.map((c) => c.code);
  const has = (prefix: string) => codes.some((c) => c.startsWith(prefix));

  const summary: string[] = [];
  if (has("MATH 51")) summary.push("MATH 51", "MATH 52", "MATH 53", "MATH 54");
  if (has("PHYSICS 7A")) summary.push("PHYSICS 7A", "PHYSICS 7B");
  if (has("COMPSCI 61A")) summary.push("COMPSCI 61A", "COMPSCI 61C");
  if (has("EECS 16A")) summary.push("EECS 16A", "EECS 16B");

  if (summary.length === 0) {
    return codes.slice(0, 8);
  }
  return summary;
}

function summarizeUpperDiv(detail: CoeMajorDetail): string[] {
  const codes: string[] = [];
  for (const block of detail.upper_division) {
    for (const course of block.courses) {
      if (!codes.includes(course.code)) {
        codes.push(course.code);
      }
    }
  }
  return codes;
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: UcsbMajor[];
    last_updated: string;
    gear?: { catalog_year?: string };
  };

  const sources = existsSync(SOURCES_PATH)
    ? (JSON.parse(readFileSync(SOURCES_PATH, "utf-8")) as {
        catalog_year?: string;
        sources?: Record<string, { four_year_plan_url?: string; dept_page?: string }>;
      })
    : null;

  const detailFiles = existsSync(DETAIL_DIR)
    ? readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"))
    : [];
  const detailSlugs = new Set(detailFiles.map((f) => f.replace(/\.json$/, "")));

  for (const major of catalog.majors) {
    const hasDetail = detailSlugs.has(major.slug);
    major.detail_available = hasDetail;

    if (existsSync(seedPathForSlug(major.slug))) {
      major.roadmap_available = true;
    } else {
      major.roadmap_available = false;
    }

    const sourceEntry = sources?.sources?.[major.slug];
    if (sourceEntry?.four_year_plan_url) {
      major.plan_of_study_url = sourceEntry.four_year_plan_url;
    }
    if (sourceEntry?.dept_page) {
      major.curriculum_url = sourceEntry.dept_page;
    }

    if (hasDetail) {
      const detail = JSON.parse(
        readFileSync(path.join(DETAIL_DIR, `${major.slug}.json`), "utf-8"),
      ) as CoeMajorDetail;

      major.career_outcomes = detail.career_outcomes;
      major.preparation_for_major = summarizePrep(detail);
      major.upper_division_required = summarizeUpperDiv(detail);
      major.graduation_units = detail.graduation_units;
      major.gear_page = detail.gear_page;

      if (major.roadmap_available) {
        major.requirements_level = "roadmap";
      } else if (detail.quality_tier === "gear") {
        major.requirements_level = "gear";
      } else {
        major.requirements_level = "summary";
      }
    }
  }

  if (catalog.gear && sources?.catalog_year) {
    catalog.gear.catalog_year = sources.catalog_year;
  }

  catalog.last_updated = new Date().toISOString().slice(0, 10);
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");

  console.log(
    `Synced Berkeley catalog: ${detailSlugs.size} majors with detail (${Array.from(detailSlugs).join(", ")}).`,
  );
}

main();
