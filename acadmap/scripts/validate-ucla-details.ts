/**
 * Validates UCLA coe-majors detail files against coe-catalog.json slugs and schema depth.
 * Run: npm run validate:ucla-details
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

import type { CoeMajorDetail } from "../lib/coe-major-detail-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "ucla", "coe-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucla", "coe-majors");
const SEEDS_DIR = path.join(ROOT, "data", "seeds");

function fail(msg: string): never {
  console.error(`VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function seedPathForSlug(slug: string): string {
  return path.join(SEEDS_DIR, `ucla-${slug}.json`);
}

function validateDetailFile(file: string) {
  const raw = readFileSync(path.join(DETAIL_DIR, file), "utf-8");
  const detail = JSON.parse(raw) as CoeMajorDetail;
  const expectedSlug = file.replace(/\.json$/, "");
  const hasSeed = existsSync(seedPathForSlug(expectedSlug));
  const strictParity = expectedSlug === "electrical-engineering";

  if (detail.slug !== expectedSlug) {
    fail(`${file}: slug mismatch (${detail.slug})`);
  }
  if (!detail.catalog_year) fail(`${file}: missing catalog_year`);
  if (!detail.gear_page) fail(`${file}: missing gear_page`);
  if (!detail.preparation?.courses?.length) {
    fail(`${file}: empty preparation courses`);
  }
  if (!detail.upper_division?.length) {
    fail(`${file}: empty upper_division`);
  }
  if (!detail.regulations) fail(`${file}: missing regulations`);
  if (!detail.recommended_plans?.length) {
    fail(`${file}: missing recommended_plans`);
  }
  if (strictParity && !detail.quarter_totals?.length) {
    fail(`${file}: missing quarter_totals`);
  }
  if (!detail.sources?.length) fail(`${file}: missing sources`);
  if (strictParity && detail.quality_tier !== "gear") {
    fail(`${file}: expected quality_tier gear`);
  }

  if (expectedSlug === "electrical-engineering") {
    if (detail.recommended_plans.length !== 12) {
      fail(`${file}: expected 12 recommended plan quarters, got ${detail.recommended_plans.length}`);
    }
    if (!hasSeed) {
      fail(`${file}: missing seed file ucla-${expectedSlug}.json for roadmap parity`);
    }
  }
}

async function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: { slug: string; detail_available?: boolean; roadmap_available?: boolean }[];
  };

  const detailFiles = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"));
  const slugs = new Set(detailFiles.map((f) => f.replace(/\.json$/, "")));

  let errors = 0;
  for (const m of catalog.majors) {
    if (m.detail_available && !slugs.has(m.slug)) {
      console.error(`Missing detail file for ${m.slug}`);
      errors++;
    }
    if (m.roadmap_available && !existsSync(seedPathForSlug(m.slug))) {
      console.error(`Catalog marks roadmap for ${m.slug} but seed is missing`);
      errors++;
    }
  }

  for (const slug of slugs) {
    if (!catalog.majors.some((m) => m.slug === slug)) {
      console.error(`Orphan detail file: ${slug}.json`);
      errors++;
    }
  }

  if (errors > 0) {
    process.exit(1);
  }

  for (const file of detailFiles) {
    validateDetailFile(file);
  }

  console.log(`Validated ${slugs.size} UCLA coe-majors detail files.`);
}

main();
