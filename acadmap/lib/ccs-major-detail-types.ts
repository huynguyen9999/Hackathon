/** CCS major detail shapes (College of Creative Studies major sheets). */

import type {
  MajorRegulations,
  PlanEntry,
  PlanTrack,
  PlanYear,
  QuarterName,
  QuarterPlan,
  RequirementBlock,
  ProgramVariant,
} from "@/lib/ucsb-major-detail-types";

export type { PlanEntry, PlanTrack, PlanYear, QuarterName, RequirementBlock, MajorRegulations, ProgramVariant };

export type QuarterTotal = {
  year: PlanYear;
  quarter: QuarterName;
  units: number;
};

export type CcsAdmissionRequirements = {
  letter_of_intent: boolean;
  letters_of_recommendation?: number;
  transcripts: boolean;
  supplemental?: boolean;
  portfolio?: boolean;
  notes: string[];
};

export type CcsMajorDetail = {
  slug: string;
  name: string;
  catalog_year: string;
  graduation_units: number;
  sources: { title: string; url: string }[];
  preparation: RequirementBlock;
  upper_division: RequirementBlock[];
  electives?: RequirementBlock;
  science_courses?: RequirementBlock;
  regulations: MajorRegulations;
  recommended_plans: QuarterPlan[];
  quarter_totals?: QuarterTotal[];
  admission_requirements: CcsAdmissionRequirements;
  program_variants?: ProgramVariant[];
  career_outcomes: string[];
  quality_tier: "sheet" | "flexible";
  notes?: string[];
};
