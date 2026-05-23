/**
 * Generate ls-majors/*.json for all L&S catalog majors missing sheet-level detail.
 * Hand-authored sheet files are never overwritten (see SHEET_SLUGS).
 *
 * Run: npm run generate:details
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

import type {
  CourseRef,
  LsMajorDetail,
  PlanTrack,
  QuarterPlan,
} from "../lib/ucsb-major-detail-types";
import type { UcsbMajor } from "../lib/ucsb-types";

const ROOT = path.join(process.cwd());
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");
const DETAIL_DIR = path.join(ROOT, "data", "ucsb", "ls-majors");
const SOURCES_PATH = path.join(ROOT, "data", "ucsb", "major-sheet-sources.json");

const QUARTERS = ["Fall", "Winter", "Spring"] as const;

const SHEET_SLUGS = new Set([
  "financial-mathematics-and-statistics",
  "actuarial-science",
  "statistics-and-data-science",
  "economics",
  "economics-and-accounting",
  "mathematics",
]);

const COURSE_RE =
  /\b([A-Z]{2,8})\s+(\d+[A-Z]?)(?:\s*[-–]\s*(\d+[A-Z]?))?\b/g;

function parseCourseLine(line: string): CourseRef[] {
  const courses: CourseRef[] = [];
  const titleMatch = line.match(/—\s*(.+)$/);
  const title = titleMatch?.[1]?.trim();

  let m: RegExpExecArray | null;
  const re = new RegExp(COURSE_RE.source, "g");
  while ((m = re.exec(line)) !== null) {
    const dept = m[1];
    const start = m[2];
    const end = m[3];
    if (end) {
      courses.push({
        code: `${dept} ${start}`,
        title,
        notes: `Series through ${dept} ${end}`,
      });
    } else {
      courses.push({ code: `${dept} ${start}`, title });
    }
  }

  if (courses.length === 0 && /elective|upper-division|choose|courses/i.test(line)) {
    courses.push({ code: line.split("—")[0]?.trim() ?? line, notes: line });
  }

  return courses;
}

function uniqueCourses(lines: string[]): CourseRef[] {
  const seen = new Set<string>();
  const out: CourseRef[] = [];
  for (const line of lines) {
    for (const c of parseCourseLine(line)) {
      if (seen.has(c.code)) continue;
      seen.add(c.code);
      out.push(c);
    }
  }
  return out;
}

function distributePlans(
  prep: CourseRef[],
  upper: CourseRef[],
  track: PlanTrack,
  yearOffset = 0,
): QuarterPlan[] {
  const plans: QuarterPlan[] = [];
  const all = [...prep, ...upper];
  if (all.length === 0) return plans;

  let qi = 0;
  for (let year = 1 + yearOffset; year <= 4 + yearOffset; year += 1) {
    for (const quarter of QUARTERS) {
      const batch: CourseRef[] = [];
      while (batch.length < 2 && qi < all.length) {
        batch.push(all[qi]);
        qi += 1;
      }
      if (batch.length === 0) continue;
      plans.push({
        year: year as QuarterPlan["year"],
        quarter,
        track,
        entries: batch.map((c) => ({
          code: c.code,
          title: c.title,
          units: c.units ?? 4,
          notes: c.notes,
        })),
      });
    }
  }
  return plans;
}

function fallbackCourses(major: UcsbMajor): CourseRef[] {
  const fromElectives = uniqueCourses(major.sample_electives ?? []);
  if (fromElectives.length) return fromElectives;

  const generic = [
    ...major.preparation_for_major,
    ...major.upper_division_required,
  ].filter(Boolean);
  const parsed = uniqueCourses(generic);
  if (parsed.length) return parsed;

  return [{ code: "Major coursework", notes: "See department major sheet for sequence" }];
}

function buildFromCatalog(major: UcsbMajor, catalogYear: string): LsMajorDetail {
  const prepCourses = uniqueCourses(major.preparation_for_major);
  const upperCourses = uniqueCourses(major.upper_division_required);
  const planCourses =
    prepCourses.length || upperCourses.length
      ? [...prepCourses, ...upperCourses]
      : fallbackCourses(major);

  const sources: { title: string; url: string }[] = [];
  if (major.catalog_program_code) {
    sources.push({
      title: `UCSB Catalog — ${major.catalog_program_code}`,
      url: `https://catalog.ucsb.edu/programs/${major.catalog_program_code}`,
    });
  }
  if (major.department_url) {
    sources.push({ title: "Department", url: major.department_url });
  }
  if (major.curriculum_url) {
    sources.push({ title: "Program page", url: major.curriculum_url });
  }

  return {
    slug: major.slug,
    name: major.name,
    catalog_year: catalogYear,
    sources,
    preparation: {
      label: "Preparation for the major",
      courses: prepCourses.length ? prepCourses : [{ code: "See catalog", notes: major.notes }],
      notes: major.notes
        ? [major.notes]
        : ["Auto-generated from ls-catalog summary — verify on official major sheet."],
    },
    upper_division: [
      {
        label: "Upper-division required",
        courses: upperCourses.length
          ? upperCourses
          : [{ code: "See department major sheet" }],
        notes: major.departmental_electives_note
          ? [major.departmental_electives_note]
          : undefined,
      },
    ],
    electives: major.sample_electives?.length
      ? {
          label: "Sample electives",
          courses: uniqueCourses(major.sample_electives),
          choose_units: major.departmental_electives_units,
        }
      : undefined,
    regulations: {
      major_gpa: 2.0,
      pnp_allowed: false,
      other: major.selective
        ? ["Selective major — verify admission requirements on admissions site."]
        : undefined,
    },
    recommended_plans: [
      ...distributePlans(planCourses, [], "freshman"),
      ...distributePlans(planCourses, [], "transfer", 2),
    ],
    career_outcomes: major.career_outcomes ?? [],
    quality_tier: "catalog",
    notes: [
      "Auto-generated from ls-catalog.json. Upgrade to sheet fidelity by parsing department major sheet PDF.",
    ],
  };
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    majors: UcsbMajor[];
  };
  const registry = existsSync(SOURCES_PATH)
    ? (JSON.parse(readFileSync(SOURCES_PATH, "utf-8")) as { catalog_year: string })
    : { catalog_year: "2025-2026" };

  let created = 0;
  let skipped = 0;

  for (const major of catalog.majors) {
    const outPath = path.join(DETAIL_DIR, `${major.slug}.json`);
    if (SHEET_SLUGS.has(major.slug)) {
      skipped += 1;
      continue;
    }

    const existing = existsSync(outPath)
      ? (JSON.parse(readFileSync(outPath, "utf-8")) as LsMajorDetail)
      : null;
    if (existing?.quality_tier === "sheet") {
      skipped += 1;
      continue;
    }

    const detail = buildFromCatalog(major, registry.catalog_year);
    writeFileSync(outPath, `${JSON.stringify(detail, null, 2)}\n`, "utf-8");
    created += 1;
  }

  const total = readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json")).length;
  console.log(
    `generate:details — wrote ${created}, skipped ${skipped}. Total detail files: ${total}.`,
  );
  console.log("Run npm run sync:details && npm run validate:details");
}

main();
