/**
 * Validate all ls-majors/*.json detail files.
 * Run: npm run validate:details
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

import type { LsMajorDetail } from "../lib/ucsb-major-detail-types";

const DETAIL_DIR = path.join(process.cwd(), "data", "ucsb", "ls-majors");

function fail(msg: string): never {
  console.error(`VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function main() {
  const files = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    fail("No detail files in ls-majors/");
  }

  for (const file of files) {
    const raw = readFileSync(path.join(DETAIL_DIR, file), "utf-8");
    const detail = JSON.parse(raw) as LsMajorDetail;
    const expectedSlug = file.replace(/\.json$/, "");

    if (detail.slug !== expectedSlug) {
      fail(`${file}: slug mismatch (${detail.slug})`);
    }
    if (!detail.catalog_year) fail(`${file}: missing catalog_year`);
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
    if (!detail.sources?.length) fail(`${file}: missing sources`);
  }

  console.log(`OK: ${files.length} major detail files validated.`);
}

main();
