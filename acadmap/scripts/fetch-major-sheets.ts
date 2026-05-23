/**
 * Scaffold or refresh major detail files from major-sheet-sources.json.
 * Existing hand-authored details are preserved unless --force is passed.
 *
 * Run: npm run fetch:sheets
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import type { LsMajorDetail } from "../lib/ucsb-major-detail-types";

const ROOT = path.join(process.cwd());
const SOURCES_PATH = path.join(ROOT, "data", "ucsb", "major-sheet-sources.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "ls-majors");
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");

type Registry = {
  catalog_year: string;
  wave_1: string[];
  sources: Record<
    string,
    { dept_page?: string; major_sheet_pdf?: string; plan_of_study_pdf?: string }
  >;
};

function scaffold(slug: string, name: string, registry: Registry): LsMajorDetail {
  const src = registry.sources[slug];
  return {
    slug,
    name,
    catalog_year: registry.catalog_year,
    sources: [
      ...(src?.major_sheet_pdf
        ? [{ title: "Major sheet", url: src.major_sheet_pdf }]
        : []),
      ...(src?.dept_page ? [{ title: "Department page", url: src.dept_page }] : []),
    ],
    preparation: {
      label: "Preparation for the major",
      courses: [],
      notes: ["Scaffold — run manual QA and fill from major sheet PDF."],
    },
    upper_division: [
      {
        label: "Upper-division required",
        courses: [],
        notes: ["Scaffold — fill from major sheet."],
      },
    ],
    regulations: { major_gpa: 2.0, pnp_allowed: false },
    recommended_plans: [],
    career_outcomes: [],
    notes: ["Auto-scaffolded by fetch:sheets — needs manual completion."],
  };
}

function main() {
  const force = process.argv.includes("--force");
  const registry = JSON.parse(readFileSync(SOURCES_PATH, "utf-8")) as Registry;
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: { slug: string; name: string }[];
  };

  let created = 0;
  let skipped = 0;

  for (const slug of Object.keys(registry.sources)) {
    const outPath = path.join(DETAIL_DIR, `${slug}.json`);
    if (existsSync(outPath) && !force) {
      skipped += 1;
      continue;
    }

    const major = catalog.majors.find((m) => m.slug === slug);
    const name = major?.name ?? slug;
    const detail = existsSync(outPath) && force
      ? (JSON.parse(readFileSync(outPath, "utf-8")) as LsMajorDetail)
      : scaffold(slug, name, registry);

    writeFileSync(outPath, `${JSON.stringify(detail, null, 2)}\n`, "utf-8");
    created += 1;
  }

  console.log(`fetch:sheets — wrote ${created} file(s), skipped ${skipped} existing.`);
  console.log("Run npm run sync:details && npm run validate:details after QA.");
}

main();
