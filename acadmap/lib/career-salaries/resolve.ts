import indexData from "@/data/career-salaries/index.json";
import aliasesData from "@/data/career-salaries/aliases.json";
import type { CareerSalaryProfile } from "@/lib/types";

const profiles = indexData as Record<string, CareerSalaryProfile>;
const aliases = aliasesData as Record<string, string>;

export function normalizeCareerKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s+/&-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\//g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function lookupProfile(slug: string): CareerSalaryProfile | null {
  return profiles[slug] ?? null;
}

/**
 * Resolve entry-level salary profile for a career node title or label.
 * Uses exact alias map first, then normalized key, then partial slug match.
 */
export function resolveCareerSalary(
  title: string,
  metadata?: Record<string, unknown>,
): CareerSalaryProfile | null {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const explicitKey =
    typeof metadata?.salary_key === "string" ? metadata.salary_key : null;
  if (explicitKey) {
    return lookupProfile(explicitKey);
  }

  const aliasKey = aliases[trimmed];
  if (aliasKey) {
    return lookupProfile(aliasKey);
  }

  const normalized = normalizeCareerKey(trimmed);
  const direct = lookupProfile(normalized);
  if (direct) return direct;

  for (const [slug, profile] of Object.entries(profiles)) {
    if (normalized.includes(slug) || slug.includes(normalized)) {
      return profile;
    }
  }

  return null;
}

export function listCareerSalarySlugs(): string[] {
  return Object.keys(profiles);
}

export function listCareerSalaryAliases(): Record<string, string> {
  return { ...aliases };
}
