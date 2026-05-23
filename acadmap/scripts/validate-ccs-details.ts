/**
 * Validate all ccs-majors/*.json detail files.
 * Run: npm run validate:ccs-details
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

import type { CcsMajorDetail } from "../lib/ccs-major-detail-types";

const DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "ccs-majors");

function fail(msg: string): never {
  console.error(`VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function main() {
  const files = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    fail("No detail files in ccs-majors/");
  }

  if (files.length !== 9) {
    fail(`Expected 9 CCS major detail files, found ${files.length}`);
  }

  for (const file of files) {
    const raw = readFileSync(path.join(DETAIL_DIR, file), "utf-8");
    const detail = JSON.parse(raw) as CcsMajorDetail;
    const expectedSlug = file.replace(/\.json$/, "");

    if (detail.slug !== expectedSlug) {
      fail(`${file}: slug mismatch (${detail.slug})`);
    }
    if (!detail.catalog_year) fail(`${file}: missing catalog_year`);
    if (!detail.preparation?.courses?.length && !detail.preparation?.notes?.length) {
      fail(`${file}: empty preparation`);
    }
    if (!detail.upper_division?.length) {
      fail(`${file}: empty upper_division`);
    }
    if (!detail.regulations) fail(`${file}: missing regulations`);
    if (!detail.recommended_plans?.length) {
      fail(`${file}: missing recommended_plans`);
    }
    if (!detail.admission_requirements) {
      fail(`${file}: missing admission_requirements`);
    }
    if (!detail.sources?.length) fail(`${file}: missing sources`);
    if (!detail.quality_tier) fail(`${file}: missing quality_tier`);
    if (!detail.career_outcomes?.length) {
      fail(`${file}: missing career_outcomes`);
    }
  }

  console.log(`OK: ${files.length} CCS major detail files validated.`);
}

main();
