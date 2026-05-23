import { promises as fs } from "fs";
import path from "path";

import { isOfficialUcsbConnectorEnabled } from "@/lib/env";
import type { DegreeAuditRules } from "@/lib/planner/degree-audit";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbCoeCatalog } from "@/lib/ucsb-coe";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import type { UcsbMajor } from "@/lib/ucsb-types";

type ExternalRule = {
  exam?: string;
  source?: string;
  external_course?: string;
  min_score?: number;
  mapped_course_codes: string[];
  notes?: string;
};

export type UcsbCreditRuleSet = {
  apRules: ExternalRule[];
  transferRules: ExternalRule[];
};

export interface UcsbConnector {
  getDegreeAuditRules(schoolShortName: string, majorSlug: string): Promise<DegreeAuditRules | null>;
  getCreditRules(): Promise<UcsbCreditRuleSet>;
}

function extractCourseCodes(courses: string[]): string[] {
  const seen = new Set<string>();
  for (const value of courses) {
    const matches = value.toUpperCase().match(/[A-Z]{2,}\s*\d+[A-Z]?/g) ?? [];
    for (const match of matches) {
      seen.add(match.replace(/\s+/g, " ").trim());
    }
  }
  return Array.from(seen);
}

function graduationUnitsFromMajor(major: UcsbMajor): number {
  if (typeof major.graduation_units === "number") return major.graduation_units;
  return 180;
}

function majorToAuditRules(major: UcsbMajor): DegreeAuditRules {
  const preparationCodes = extractCourseCodes(major.preparation_for_major ?? []);
  const upperDivisionCodes = extractCourseCodes(major.upper_division_required ?? []);

  return {
    majorSlug: major.slug,
    degreeType: major.degree_type,
    graduationUnitsTarget: graduationUnitsFromMajor(major),
    buckets: [
      {
        key: "major-preparation",
        label: "Major preparation",
        requiredCourseCodes: preparationCodes,
        requiredUnits: Math.max(4, preparationCodes.length * 4),
      },
      {
        key: "major-upper-division",
        label: "Major upper-division",
        requiredCourseCodes: upperDivisionCodes,
        requiredUnits: Math.max(4, upperDivisionCodes.length * 4),
      },
      {
        key: "major-electives",
        label: "Major electives",
        requiredCourseCodes: [],
        requiredUnits: Math.max(0, major.departmental_electives_units ?? 0),
      },
    ],
  };
}

async function loadRuleFile(fileName: string): Promise<ExternalRule[]> {
  const filePath = path.join(process.cwd(), "data", "ucsb", "rules", fileName);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as ExternalRule[];
  } catch {
    return [];
  }
}

const snapshotProvider: UcsbConnector = {
  async getDegreeAuditRules(schoolShortName, majorSlug) {
    if (schoolShortName.toLowerCase() !== "ucsb") return null;

    const [coe, ls, ccs] = await Promise.all([
      loadUcsbCoeCatalog(),
      loadUcsbLsCatalog(),
      loadUcsbCcsCatalog(),
    ]);

    const major =
      coe?.majors.find((m) => m.slug === majorSlug) ??
      ls?.majors.find((m) => m.slug === majorSlug) ??
      ccs?.majors.find((m) => m.slug === majorSlug) ??
      null;

    if (!major) return null;
    return majorToAuditRules(major);
  },

  async getCreditRules() {
    const [apRules, transferRules] = await Promise.all([
      loadRuleFile("ap-credit-rules.json"),
      loadRuleFile("transfer-credit-rules.json"),
    ]);

    return { apRules, transferRules };
  },
};

const officialProvider: UcsbConnector = {
  async getDegreeAuditRules(_schoolShortName, _majorSlug) {
    throw new Error(
      "Official UCSB connector is not configured yet. Set USE_OFFICIAL_UCSB_CONNECTOR=false to use snapshot rules.",
    );
  },
  async getCreditRules() {
    throw new Error(
      "Official UCSB connector is not configured yet. Set USE_OFFICIAL_UCSB_CONNECTOR=false to use snapshot rules.",
    );
  },
};

export function getUcsbConnector(): UcsbConnector {
  return isOfficialUcsbConnectorEnabled() ? officialProvider : snapshotProvider;
}
