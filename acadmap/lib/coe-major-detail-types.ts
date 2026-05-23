/** GEAR major detail shapes (College of Engineering). */

import type {
  MajorRegulations,
  PlanTrack,
  PlanYear,
  QuarterName,
  PlanEntry,
  RequirementBlock,
} from "@/lib/ucsb-major-detail-types";

export type { PlanEntry, PlanTrack, PlanYear, QuarterName, RequirementBlock, MajorRegulations };

export type QuarterTotal = {
  year: PlanYear;
  quarter: QuarterName;
  units: number;
};

export type CoeMajorDetail = {
  slug: string;
  name: string;
  catalog_year: string;
  gear_page: number;
  graduation_units: number;
  sources: { title: string; url: string }[];
  preparation: RequirementBlock;
  upper_division: RequirementBlock[];
  electives?: RequirementBlock;
  science_courses?: RequirementBlock;
  regulations: MajorRegulations;
  recommended_plans: {
    year: PlanYear;
    quarter: QuarterName;
    track: PlanTrack;
    entries: PlanEntry[];
  }[];
  quarter_totals?: QuarterTotal[];
  career_outcomes: string[];
  quality_tier: "gear" | "catalog";
  notes?: string[];
};
