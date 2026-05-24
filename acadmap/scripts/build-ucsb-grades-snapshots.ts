#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type {
  CourseGradeAggregate,
  GradeBucketCounts,
  GradeOffering,
  GradesLeaderboardEntry,
  GradesLeaderboards,
  GradesSearchEntry,
} from "../lib/ucsb-grades-types";
import { EMPTY_GRADE_COUNTS } from "../lib/ucsb-grades-types";
import type { GeAreaId } from "../lib/ucsb-ges-types";
import { GE_AREAS, GE_AREA_IDS } from "../lib/ucsb-ges-types";

const RAW_DIR = path.join(process.cwd(), "data", "ucsb", "grades", "raw");
const OUT_DIR = path.join(process.cwd(), "data", "ucsb", "grades");
const BY_DEPT_DIR = path.join(OUT_DIR, "by-dept");
const GES_DIR = path.join(OUT_DIR, "ges");
const GES_BY_AREA_DIR = path.join(GES_DIR, "by-area");

const QUARTER_RANK: Record<string, number> = {
  Winter: 1,
  Spring: 2,
  Summer: 3,
  Fall: 4,
};

const LEADERBOARD_MIN_STUDENTS = 50;
const LEADERBOARD_SIZE = 25;

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

function normalizeHeader(h: string): string {
  return h.trim().replace(/\s+/g, " ");
}

function num(v: string | undefined): number {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
}

function optionalNum(v: string | undefined): number | null {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) ? n : null;
}

function normalizeCourseId(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
}

function parseCounts(row: Record<string, string>): GradeBucketCounts {
  return {
    A: num(row.A),
    Ap: num(row.Ap),
    Am: num(row.Am),
    B: num(row.B),
    Bp: num(row.Bp),
    Bm: num(row.Bm),
    C: num(row.C),
    Cp: num(row.Cp),
    Cm: num(row.Cm),
    D: num(row.D),
    Dp: num(row.Dp),
    Dm: num(row.Dm),
    F: num(row.F),
    P: num(row.P),
    s: num(row.s),
    su: num(row.su),
    IP: num(row.IP),
  };
}

function sumCounts(a: GradeBucketCounts, b: GradeBucketCounts): GradeBucketCounts {
  const keys = Object.keys(EMPTY_GRADE_COUNTS) as (keyof GradeBucketCounts)[];
  const out = { ...EMPTY_GRADE_COUNTS };
  for (const k of keys) {
    out[k] = a[k] + b[k];
  }
  return out;
}

function offeringStudents(counts: GradeBucketCounts, nLetter: number, nPnp: number): number {
  const bucketSum = Object.values(counts).reduce((s, v) => s + v, 0);
  return Math.max(bucketSum, nLetter + nPnp);
}

function quarterSortKey(quarter: string, year: number): number {
  return year * 10 + (QUARTER_RANK[quarter] ?? 0);
}

function buildRollup(offerings: GradeOffering[]): CourseGradeAggregate["rollup"] {
  let totalStudents = 0;
  let gpaWeightedSum = 0;
  let gpaWeight = 0;
  let gradeDistribution = { ...EMPTY_GRADE_COUNTS };
  let latest: { quarter: string; year: number } | undefined;

  for (const o of offerings) {
    const students = offeringStudents(o.counts, o.nLetterStudents, o.nPnpStudents);
    totalStudents += students;
    gradeDistribution = sumCounts(gradeDistribution, o.counts);

    if (o.avgGpa != null && students > 0) {
      gpaWeightedSum += o.avgGpa * students;
      gpaWeight += students;
    }

    if (
      !latest ||
      quarterSortKey(o.quarter, o.year) > quarterSortKey(latest.quarter, latest.year)
    ) {
      latest = { quarter: o.quarter, year: o.year };
    }
  }

  return {
    avgGpa: gpaWeight > 0 ? gpaWeightedSum / gpaWeight : null,
    totalStudents,
    gradeDistribution,
    offeringCount: offerings.length,
    latestOffering: latest,
  };
}

function deptFileName(dept: string): string {
  return `${dept.trim().toUpperCase()}.json`;
}

async function buildGrades(): Promise<{
  courses: CourseGradeAggregate[];
  searchIndex: GradesSearchEntry[];
  leaderboards: GradesLeaderboards;
  meta: {
    offeringCount: number;
    quarterRange: { from: string; to: string };
  };
}> {
  const raw = await readFile(path.join(RAW_DIR, "courseGrades.csv"), "utf8");
  const rows = parseCsv(raw);

  const byCourse = new Map<string, CourseGradeAggregate>();
  let minKey = Number.MAX_SAFE_INTEGER;
  let maxKey = 0;

  for (const row of rows) {
    const courseId = normalizeCourseId(row.course ?? "");
    if (!courseId) continue;

    const dept = (row.dept ?? courseId.split(/\s+/)[0] ?? "").trim().toUpperCase();
    const year = num(row.year);
    const quarter = (row.quarter ?? "").trim();
    const sortKey = quarterSortKey(quarter, year);
    minKey = Math.min(minKey, sortKey);
    maxKey = Math.max(maxKey, sortKey);

    const offering: GradeOffering = {
      quarter,
      year,
      instructor: (row.instructor ?? "").trim(),
      counts: parseCounts(row),
      avgGpa: optionalNum(row.avgGPA),
      nLetterStudents: num(row.nLetterStudents),
      nPnpStudents: num(row["nPNP students"] ?? row.nPNPStudents),
    };

    const existing = byCourse.get(courseId);
    if (existing) {
      existing.offerings.push(offering);
    } else {
      byCourse.set(courseId, {
        courseId,
        dept,
        offerings: [offering],
        rollup: {
          avgGpa: null,
          totalStudents: 0,
          gradeDistribution: { ...EMPTY_GRADE_COUNTS },
          offeringCount: 0,
        },
      });
    }
  }

  const courses: CourseGradeAggregate[] = [];
  for (const course of byCourse.values()) {
    course.offerings.sort(
      (a, b) => quarterSortKey(b.quarter, b.year) - quarterSortKey(a.quarter, a.year),
    );
    course.rollup = buildRollup(course.offerings);
    courses.push(course);
  }

  const searchIndex: GradesSearchEntry[] = courses.map((c) => ({
    courseId: c.courseId,
    dept: c.dept,
    avgGpa: c.rollup.avgGpa,
    offeringCount: c.rollup.offeringCount,
    totalStudents: c.rollup.totalStudents,
  }));

  const eligible = searchIndex.filter(
    (e) => e.avgGpa != null && e.totalStudents >= LEADERBOARD_MIN_STUDENTS,
  );

  const highestGpa = [...eligible]
    .sort((a, b) => (b.avgGpa ?? 0) - (a.avgGpa ?? 0))
    .slice(0, LEADERBOARD_SIZE);

  const lowestGpa = [...eligible]
    .sort((a, b) => (a.avgGpa ?? 0) - (b.avgGpa ?? 0))
    .slice(0, LEADERBOARD_SIZE);

  const mostOffered = [...searchIndex]
    .sort((a, b) => b.offeringCount - a.offeringCount)
    .slice(0, LEADERBOARD_SIZE);

  const formatRange = (key: number) => {
    const year = Math.floor(key / 10);
    const q = key % 10;
    const name = Object.entries(QUARTER_RANK).find(([, v]) => v === q)?.[0] ?? "";
    return `${name} ${year}`.trim();
  };

  return {
    courses,
    searchIndex,
    leaderboards: { highestGpa, lowestGpa, mostOffered },
    meta: {
      offeringCount: rows.length,
      quarterRange: {
        from: minKey === Number.MAX_SAFE_INTEGER ? "unknown" : formatRange(minKey),
        to: maxKey === 0 ? "unknown" : formatRange(maxKey),
      },
    },
  };
}

async function buildGes(searchIndex: GradesSearchEntry[]): Promise<void> {
  const raw = await readFile(path.join(RAW_DIR, "ges.csv"), "utf8");
  const rows = parseCsv(raw);
  const gpaByCourse = new Map(searchIndex.map((e) => [e.courseId, e.avgGpa]));

  const byCourse: Record<string, GeAreaId[]> = {};
  const byArea: Record<string, { courseId: string; avgGpa: number | null }[]> = {};

  for (const area of GE_AREA_IDS) {
    byArea[area] = [];
  }

  for (const row of rows) {
    const courseId = normalizeCourseId(row.Course ?? row.course ?? "");
    if (!courseId) continue;

    const areas: GeAreaId[] = [];
    for (const area of GE_AREA_IDS) {
      if (num(row[area]) > 0) {
        areas.push(area);
        byArea[area].push({ courseId, avgGpa: gpaByCourse.get(courseId) ?? null });
      }
    }

    if (areas.length > 0) {
      byCourse[courseId] = areas;
    }
  }

  for (const area of GE_AREA_IDS) {
    byArea[area].sort((a, b) => a.courseId.localeCompare(b.courseId));
  }

  await mkdir(GES_BY_AREA_DIR, { recursive: true });
  await writeFile(
    path.join(GES_DIR, "areas.json"),
    JSON.stringify({ areas: GE_AREAS }, null, 2),
  );
  await writeFile(
    path.join(GES_DIR, "by-course.json"),
    JSON.stringify({ courses: byCourse }, null, 2),
  );

  for (const area of GE_AREA_IDS) {
    const safeName = area.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    await writeFile(
      path.join(GES_BY_AREA_DIR, `${safeName}.json`),
      JSON.stringify({ area, courses: byArea[area] }, null, 2),
    );
  }
}

async function main(): Promise<void> {
  const { courses, searchIndex, leaderboards, meta } = await buildGrades();

  await mkdir(BY_DEPT_DIR, { recursive: true });

  const byDept = new Map<string, CourseGradeAggregate[]>();
  for (const course of courses) {
    const list = byDept.get(course.dept) ?? [];
    list.push(course);
    byDept.set(course.dept, list);
  }

  for (const [dept, list] of byDept.entries()) {
    list.sort((a, b) => a.courseId.localeCompare(b.courseId));
    await writeFile(
      path.join(BY_DEPT_DIR, deptFileName(dept)),
      JSON.stringify({ dept, courses: list }, null, 2),
    );
  }

  await writeFile(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      {
        source: "Daily Nexus / UCSB Office of the Registrar (CPRA)",
        sourceUrl: "https://github.com/dailynexusdata/grades-data",
        interactiveUrl: "https://dailynexus.com/interactives/grades/",
        attribution: "Daily Nexus Grades Search",
        contactEmail: "data@dailynexus.com",
        asOf: new Date().toISOString(),
        quarterRange: meta.quarterRange,
        courseCount: courses.length,
        offeringCount: meta.offeringCount,
        disclaimer:
          "Courses with fewer than five enrolled students are excluded from the source data. Grade counts are before P/NP and S/U conversions where applicable.",
      },
      null,
      2,
    ),
  );

  await writeFile(
    path.join(OUT_DIR, "search-index.json"),
    JSON.stringify({ courses: searchIndex }, null, 2),
  );

  await writeFile(
    path.join(OUT_DIR, "leaderboards.json"),
    JSON.stringify(leaderboards, null, 2),
  );

  await buildGes(searchIndex);

  console.log(
    `Built ${courses.length} courses across ${byDept.size} departments, ${meta.offeringCount} offerings.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
