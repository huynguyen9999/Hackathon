/**
 * Validate all coe-majors/*.json detail files.
 * Run: npm run validate:coe-details
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

import type { CoeMajorDetail } from "../lib/coe-major-detail-types";

const DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "coe-majors");

function fail(msg: string): never {
  console.error(`VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function main() {
  const files = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    fail("No detail files in coe-majors/");
  }

  for (const file of files) {
    const raw = readFileSync(path.join(DETAIL_DIR, file), "utf-8");
    const detail = JSON.parse(raw) as CoeMajorDetail;
    const expectedSlug = file.replace(/\.json$/, "");

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
    if (!detail.quarter_totals?.length) {
      fail(`${file}: missing quarter_totals`);
    }
    if (!detail.sources?.length) fail(`${file}: missing sources`);
    if (detail.quality_tier !== "gear") {
      fail(`${file}: expected quality_tier gear`);
    }
  }

  console.log(`OK: ${files.length} CoE major detail files validated.`);
}

main();
