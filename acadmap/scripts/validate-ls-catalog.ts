/**
 * Validate ls-catalog.json against the 58-major admissions master list.
 *
 * Run from acadmap/: npm run validate:ls
 */
import { readFileSync } from "fs";
import path from "path";

import { LS_DEPT_META } from "../lib/ucsb-dept-urls";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const ADMISSIONS_PATH = path.join(ROOT, "data", "ucsb", "admissions-ls-majors.json");
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");

const EXPECTED_COUNT = 58;

function fail(message: string): never {
  console.error(`VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function main() {
  const admissions = JSON.parse(readFileSync(ADMISSIONS_PATH, "utf-8")) as {
    majors: { slug: string }[];
  };
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: UcsbMajor[];
  };

  if (admissions.majors.length !== EXPECTED_COUNT) {
    fail(`admissions-ls-majors.json has ${admissions.majors.length} majors, expected ${EXPECTED_COUNT}`);
  }

  if (catalog.majors.length !== EXPECTED_COUNT) {
    fail(`ls-catalog.json has ${catalog.majors.length} majors, expected ${EXPECTED_COUNT}`);
  }

  const slugs = catalog.majors.map((m) => m.slug);
  const unique = new Set(slugs);
  if (unique.size !== slugs.length) {
    fail("Duplicate slugs found in ls-catalog.json");
  }

  const admissionSlugs = new Set(admissions.majors.map((m) => m.slug));
  for (const slug of slugs) {
    if (!admissionSlugs.has(slug)) {
      fail(`Unexpected slug in catalog: ${slug}`);
    }
    if (!LS_DEPT_META[slug]) {
      fail(`Missing dept meta for slug: ${slug}`);
    }
  }

  for (const major of catalog.majors) {
    if (!major.preparation_for_major?.length) {
      fail(`${major.slug}: empty preparation_for_major`);
    }
    if (!major.upper_division_required?.length) {
      fail(`${major.slug}: empty upper_division_required`);
    }
    if (!major.department_url) {
      fail(`${major.slug}: missing department_url`);
    }
    if (!major.curriculum_url) {
      fail(`${major.slug}: missing curriculum_url`);
    }
    if (!major.catalog_program_code) {
      fail(`${major.slug}: missing catalog_program_code`);
    }
  }

  const full = catalog.majors.filter((m) => m.requirements_level === "full").length;
  console.log(`OK: ${catalog.majors.length} majors, ${full} full requirements, ${catalog.majors.length - full} partial.`);
}

main();
