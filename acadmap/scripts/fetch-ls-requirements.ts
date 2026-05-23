/**
 * Merge admissions master list + department metadata into ls-catalog.json.
 * Optionally fetches UCSB catalog HTML to supplement thin entries.
 *
 * Run from acadmap/: npm run fetch:ls
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";

import {
  LS_DEPT_META,
  LS_SLUG_ALIASES,
  catalogProgramUrl,
} from "../lib/ucsb-dept-urls";
import type { RequirementsLevel, UcsbMajor } from "../lib/ucsb-types";

type AdmissionsEntry = {
  name: string;
  slug: string;
  degree_type: string;
  admissions_url?: string;
};

type AdmissionsFile = {
  source: string;
  catalog_year: string;
  majors: AdmissionsEntry[];
  slug_aliases?: Record<string, string>;
};

type LsCatalogFile = {
  school: Record<string, unknown>;
  lasar: Record<string, unknown>;
  college: Record<string, unknown>;
  requirements_framework: Record<string, unknown>;
  majors: UcsbMajor[];
  sources: { title: string; url: string }[];
  last_updated: string;
};

const ROOT = path.join(process.cwd());
const ADMISSIONS_PATH = path.join(ROOT, "data", "ucsb", "admissions-ls-majors.json");
const CATALOG_PATH = path.join(ROOT, "data", "ucsb", "ls-catalog.json");

function pickRicher(existing: string[] | undefined, fallback: string[]): string[] {
  if (!existing?.length) return fallback;
  if (existing.length >= fallback.length) return existing;
  return fallback;
}

function requirementsLevel(
  prep: string[],
  upper: string[],
): RequirementsLevel {
  return prep.length >= 3 && upper.length >= 3 ? "full" : "partial";
}

function admissionsUrlFor(slug: string): string {
  return `https://admissions.sa.ucsb.edu/majors#${slug}`;
}

function buildExistingMap(existing: UcsbMajor[]): Map<string, UcsbMajor> {
  const map = new Map<string, UcsbMajor>();
  for (const major of existing) {
    map.set(major.slug, major);
    const alias = LS_SLUG_ALIASES[major.slug];
    if (alias) {
      map.set(alias, { ...major, slug: alias });
    }
  }
  for (const [alias, canonical] of Object.entries(LS_SLUG_ALIASES)) {
    const old = existing.find((m) => m.slug === alias);
    if (old) {
      map.set(canonical, {
        ...old,
        slug: canonical,
        name: old.name === "Psychology" ? "Psychological and Brain Sciences" : old.name === "Biology" ? "Biological Sciences" : old.name,
      });
    }
  }
  return map;
}

function mergeMajor(
  admission: AdmissionsEntry,
  existing: UcsbMajor | undefined,
  meta: (typeof LS_DEPT_META)[string] | undefined,
): UcsbMajor {
  const prep = pickRicher(existing?.preparation_for_major, meta?.preparation_for_major ?? []);
  const upper = pickRicher(existing?.upper_division_required, meta?.upper_division_required ?? []);
  const level = requirementsLevel(prep, upper);

  return {
    name: admission.name,
    slug: admission.slug,
    degree_type: admission.degree_type,
    department: meta?.department ?? existing?.department ?? "College of Letters and Science",
    department_url: meta?.department_url ?? existing?.department_url ?? "https://www.ls.ucsb.edu/",
    curriculum_url:
      meta?.curriculum_url ??
      existing?.curriculum_url ??
      (meta?.catalog_program_code
        ? catalogProgramUrl(meta.catalog_program_code)
        : "https://catalog.ucsb.edu/"),
    graduation_units: meta?.graduation_units ?? existing?.graduation_units ?? 180,
    roadmap_available: existing?.roadmap_available ?? false,
    preparation_for_major: prep,
    upper_division_required: upper,
    departmental_electives_units:
      meta?.departmental_electives_units ?? existing?.departmental_electives_units,
    departmental_electives_note:
      meta?.departmental_electives_note ?? existing?.departmental_electives_note,
    sample_electives: meta?.sample_electives ?? existing?.sample_electives ?? [],
    career_outcomes: meta?.career_outcomes ?? existing?.career_outcomes ?? [],
    notes: meta?.notes ?? existing?.notes,
    requirements_level: level,
    admissions_url: admission.admissions_url ?? admissionsUrlFor(admission.slug),
    catalog_program_code: meta?.catalog_program_code,
    selective: meta?.selective ?? existing?.selective,
  };
}

/** Parse course-like lines from catalog HTML (best-effort). */
function parseCatalogCourses(html: string): { prep: string[]; upper: string[] } {
  const prep: string[] = [];
  const upper: string[] = [];
  const courseRe = /([A-Z]{2,6}\s+\d+[A-Z]{0,3})\s*[—–-]\s*([^<\n]+)/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = courseRe.exec(html)) !== null) {
    const line = `${match[1]} — ${match[2].trim()}`;
    if (seen.has(line)) continue;
    seen.add(line);
    const num = parseInt(match[1].replace(/\D/g, ""), 10);
    if (Number.isNaN(num)) continue;
    if (num < 100) prep.push(line);
    else upper.push(line);
  }

  return { prep: prep.slice(0, 12), upper: upper.slice(0, 12) };
}

async function fetchCatalogSupplement(code: string): Promise<{ prep: string[]; upper: string[] } | null> {
  try {
    const url = catalogProgramUrl(code);
    const res = await fetch(url, {
      headers: { "User-Agent": "iGauchoBack/1.0 (education catalog indexer)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const parsed = parseCatalogCourses(html);
    if (parsed.prep.length < 2 && parsed.upper.length < 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function main() {
  const admissions = JSON.parse(readFileSync(ADMISSIONS_PATH, "utf-8")) as AdmissionsFile;
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as LsCatalogFile;
  const existingMap = buildExistingMap(catalog.majors);

  const majors: UcsbMajor[] = [];
  const fetchCatalog = process.argv.includes("--fetch-catalog");
  let fetched = 0;

  for (const entry of admissions.majors) {
    const meta = LS_DEPT_META[entry.slug];
    if (!meta) {
      console.warn(`Missing dept meta for slug: ${entry.slug}`);
    }

    let merged = mergeMajor(entry, existingMap.get(entry.slug), meta);

    if (
      fetchCatalog &&
      meta?.catalog_program_code &&
      merged.requirements_level !== "full"
    ) {
      const supplement = await fetchCatalogSupplement(meta.catalog_program_code);
      if (supplement) {
        fetched++;
        merged = {
          ...merged,
          preparation_for_major: pickRicher(supplement.prep, merged.preparation_for_major),
          upper_division_required: pickRicher(supplement.upper, merged.upper_division_required),
          requirements_level: requirementsLevel(
            pickRicher(supplement.prep, merged.preparation_for_major),
            pickRicher(supplement.upper, merged.upper_division_required),
          ),
        };
      }
    }

    majors.push(merged);
  }

  majors.sort((a, b) => a.name.localeCompare(b.name));

  const updated: LsCatalogFile = {
    ...catalog,
    majors,
    sources: [
      {
        title: "UCSB Undergraduate Admissions — Majors",
        url: admissions.source,
      },
      {
        title: "UCSB Admissions L&S master list",
        url: "https://admissions.sa.ucsb.edu/majors",
      },
      {
        title: "DUELS — L&S Degree Requirements",
        url: "https://duels.ucsb.edu/degree-planning/degree-requirements",
      },
      {
        title: "UCSB General Catalog",
        url: "https://catalog.ucsb.edu/",
      },
      {
        title: "UCSB Selective Majors",
        url: "https://admissions.sa.ucsb.edu/selective-majors",
      },
    ],
    last_updated: new Date().toISOString().slice(0, 10),
  };

  writeFileSync(CATALOG_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");

  const fullCount = majors.filter((m) => m.requirements_level === "full").length;
  console.log(`Wrote ${majors.length} majors to ls-catalog.json (${fullCount} full, ${majors.length - fullCount} partial).`);
  if (fetchCatalog) {
    console.log(`Catalog fetch supplemented ${fetched} majors.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
