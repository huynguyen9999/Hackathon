/**
 * Generate curated career salary catalog from Glassdoor-style research.
 * Usage: node ./node_modules/tsx/dist/cli.mjs scripts/generate-career-salary-catalog.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

import type { CareerSalaryProfile } from "../lib/types";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "career-salaries");

const AS_OF = "2025-04";

/** All exact career titles from roadmap seeds (title or label). */
const CAREER_TITLES = [
  "Academia",
  "Accounting",
  "Actuarial",
  "Aerospace engineering",
  "Architecture",
  "Arts",
  "Arts administration",
  "Biostatistics",
  "Biotech",
  "Biotech & pharmaceuticals",
  "CPA track (grad)",
  "Campaigns",
  "Choreography",
  "Climate science",
  "Clinical (grad)",
  "Combined BS/MS + Industry Thesis",
  "Composition",
  "Comprehensive Exam or Thesis Defense",
  "Computational linguistics",
  "Conservation",
  "Consulting",
  "Controls / Robotics Engineer",
  "Corporate comms",
  "Corporate finance",
  "Data Science & Analytics",
  "Data analytics",
  "Data science",
  "Design",
  "Development",
  "Diplomacy",
  "Directing",
  "Dissertation Research & Defense",
  "Education",
  "Embedded systems",
  "Energy",
  "Energy & sustainability",
  "Engineering",
  "Enterprise Risk & Insurance",
  "Environmental consulting",
  "Environmental policy",
  "Environmental science",
  "Ethics consulting",
  "Film/TV production",
  "Finance",
  "Financial analyst",
  "Fine arts",
  "Fisheries",
  "Foreign service",
  "GIS analyst",
  "Geology",
  "Government",
  "Graduate School (CS PhD / MS)",
  "Graduate study",
  "Graphic design",
  "HR",
  "Hardware / Digital Design",
  "Hardware / Digital Design Engineer",
  "Hydrology",
  "Intelligence/analysis",
  "International NGOs",
  "International business",
  "International development",
  "International relations",
  "Journalism",
  "Law",
  "ML Engineer",
  "MS/PhD in Statistics or Financial Math",
  "MS/PhD in chemical engineering",
  "Machine Learning Engineer",
  "Machine learning",
  "Marine biology",
  "Market research",
  "Marketing",
  "Materials science",
  "Mechanical design engineer",
  "Media",
  "Media analysis",
  "Medicine",
  "Museum/archives",
  "Museum/gallery",
  "Museums",
  "Music education",
  "National labs",
  "Neuroscience research",
  "Nonprofit",
  "Performance",
  "PhD Qualifying Examination",
  "Pharmaceutical",
  "Pharmaceutical R&D",
  "Physiology research",
  "Process / plant engineering",
  "Professional dance",
  "Public health",
  "Public history",
  "Public policy",
  "Publishing",
  "Quant finance",
  "Quantitative Finance",
  "Quantitative Finance / Trading",
  "RF / Wireless Engineer",
  "Remote sensing",
  "Research",
  "Risk Management & Insurance",
  "Robotics & automation",
  "SOA / CAS Actuary",
  "Security Engineer",
  "Signal Processing Engineer",
  "Social work",
  "Social work (grad)",
  "Software Engineer",
  "Software engineer",
  "Speech pathology (grad)",
  "Speech tech",
  "Sustainability",
  "Systems engineer",
  "Thermal & energy systems",
  "Thesis or Comprehensive Exam",
  "Thesis or Project Defense",
  "Translation",
  "UX",
  "UX research",
  "Urban planning",
  "VLSI designer",
  "Veterinary (grad)",
  "Water resources",
  "Wildlife biology",
  "Teaching",
  "Technical writing",
] as const;

type W2Input = {
  median: number;
  range_low: number;
  range_high: number;
  glassdoor_search_title: string;
  source_url: string;
  california_median?: number;
  california_note?: string;
};

function w2(input: W2Input): CareerSalaryProfile {
  return {
    salary_type: "w2",
    currency: "USD",
    experience_level: "entry",
    geo: "US",
    median: input.median,
    range_low: input.range_low,
    range_high: input.range_high,
    california_median: input.california_median,
    california_note: input.california_note,
    source_name: "Glassdoor",
    source_url: input.source_url,
    as_of: AS_OF,
    glassdoor_search_title: input.glassdoor_search_title,
  };
}

function ca(median: number, pct = 0.18): { california_median: number; california_note: string } {
  const california_median = Math.round(median * (1 + pct));
  return {
    california_median,
    california_note: `California median ~${Math.round(pct * 100)}% above US for this role.`,
  };
}

const GRADUATE_PROGRAM: CareerSalaryProfile = {
  salary_type: "stipend_or_na",
  currency: "USD",
  experience_level: "entry",
  geo: "US",
  source_name: "Glassdoor",
  source_url:
    "https://www.glassdoor.com/Salaries/graduate-research-assistant-salary-SRCH_KO0,28.htm",
  as_of: AS_OF,
  glassdoor_search_title: "Graduate Research Assistant",
  note: "Graduate stipend or fellowship — typically $22K–$42K/yr; not full-time W-2 salary.",
};

const PROFILES: Record<string, CareerSalaryProfile> = {
  "software-engineer": w2({
    median: 95000,
    range_low: 75000,
    range_high: 120000,
    glassdoor_search_title: "Entry Level Software Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-software-engineer-salary-SRCH_KO0,28.htm",
    ...ca(95000, 0.21),
  }),
  "ml-engineer": w2({
    median: 110000,
    range_low: 85000,
    range_high: 140000,
    glassdoor_search_title: "Entry Level Machine Learning Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-machine-learning-engineer-salary-SRCH_KO0,37.htm",
    ...ca(110000, 0.23),
  }),
  "data-science": w2({
    median: 98000,
    range_low: 78000,
    range_high: 125000,
    glassdoor_search_title: "Entry Level Data Scientist",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-data-scientist-salary-SRCH_KO0,25.htm",
    ...ca(98000, 0.2),
  }),
  "security-engineer": w2({
    median: 105000,
    range_low: 82000,
    range_high: 130000,
    glassdoor_search_title: "Entry Level Security Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-security-engineer-salary-SRCH_KO0,28.htm",
    ...ca(105000, 0.22),
  }),
  "embedded-systems": w2({
    median: 92000,
    range_low: 72000,
    range_high: 115000,
    glassdoor_search_title: "Embedded Software Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/embedded-software-engineer-salary-SRCH_KO0,27.htm",
    ...ca(92000, 0.17),
  }),
  "hardware-digital-design": w2({
    median: 96000,
    range_low: 76000,
    range_high: 120000,
    glassdoor_search_title: "Hardware Engineer",
    source_url: "https://www.glassdoor.com/Salaries/hardware-engineer-salary-SRCH_KO0,17.htm",
    ...ca(96000, 0.2),
  }),
  "controls-robotics-engineer": w2({
    median: 88000,
    range_low: 68000,
    range_high: 112000,
    glassdoor_search_title: "Robotics Engineer",
    source_url: "https://www.glassdoor.com/Salaries/robotics-engineer-salary-SRCH_KO0,17.htm",
    ...ca(88000, 0.15),
  }),
  "rf-wireless-engineer": w2({
    median: 90000,
    range_low: 70000,
    range_high: 115000,
    glassdoor_search_title: "RF Engineer",
    source_url: "https://www.glassdoor.com/Salaries/rf-engineer-salary-SRCH_KO0,11.htm",
    ...ca(90000, 0.14),
  }),
  "signal-processing-engineer": w2({
    median: 92000,
    range_low: 72000,
    range_high: 116000,
    glassdoor_search_title: "Signal Processing Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/signal-processing-engineer-salary-SRCH_KO0,26.htm",
    ...ca(92000, 0.16),
  }),
  "systems-engineer": w2({
    median: 86000,
    range_low: 68000,
    range_high: 108000,
    glassdoor_search_title: "Systems Engineer",
    source_url: "https://www.glassdoor.com/Salaries/systems-engineer-salary-SRCH_KO0,16.htm",
    ...ca(86000, 0.13),
  }),
  "mechanical-design-engineer": w2({
    median: 78000,
    range_low: 62000,
    range_high: 98000,
    glassdoor_search_title: "Mechanical Design Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/mechanical-design-engineer-salary-SRCH_KO0,25.htm",
  }),
  "process-plant-engineering": w2({
    median: 82000,
    range_low: 65000,
    range_high: 105000,
    glassdoor_search_title: "Entry Level Process Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-process-engineer-salary-SRCH_KO0,28.htm",
  }),
  "thermal-energy-systems": w2({
    median: 80000,
    range_low: 64000,
    range_high: 102000,
    glassdoor_search_title: "Thermal Engineer",
    source_url: "https://www.glassdoor.com/Salaries/thermal-engineer-salary-SRCH_KO0,16.htm",
  }),
  "aerospace-engineering": w2({
    median: 85000,
    range_low: 68000,
    range_high: 108000,
    glassdoor_search_title: "Aerospace Engineer",
    source_url: "https://www.glassdoor.com/Salaries/aerospace-engineer-salary-SRCH_KO0,19.htm",
    ...ca(85000, 0.12),
  }),
  "speech-tech": w2({
    median: 95000,
    range_low: 75000,
    range_high: 118000,
    glassdoor_search_title: "Speech Scientist",
    source_url: "https://www.glassdoor.com/Salaries/speech-scientist-salary-SRCH_KO0,16.htm",
    ...ca(95000, 0.18),
  }),
  "computational-linguistics": w2({
    median: 85000,
    range_low: 68000,
    range_high: 105000,
    glassdoor_search_title: "Computational Linguist",
    source_url:
      "https://www.glassdoor.com/Salaries/computational-linguist-salary-SRCH_KO0,23.htm",
    ...ca(85000, 0.18),
  }),
  "ux": w2({
    median: 76000,
    range_low: 58000,
    range_high: 96000,
    glassdoor_search_title: "Entry Level UX Designer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-ux-designer-salary-SRCH_KO0,23.htm",
    ...ca(76000, 0.16),
  }),
  "design": w2({
    median: 62000,
    range_low: 48000,
    range_high: 78000,
    glassdoor_search_title: "Product Designer",
    source_url: "https://www.glassdoor.com/Salaries/product-designer-salary-SRCH_KO0,16.htm",
  }),
  "graphic-design": w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Graphic Designer",
    source_url: "https://www.glassdoor.com/Salaries/graphic-designer-salary-SRCH_KO0,16.htm",
  }),
  "engineering": w2({
    median: 75000,
    range_low: 60000,
    range_high: 94000,
    glassdoor_search_title: "Entry Level Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-engineer-salary-SRCH_KO0,20.htm",
  }),
  "architecture": w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Entry Level Architect",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-architect-salary-SRCH_KO0,21.htm",
  }),
  accounting: w2({
    median: 58000,
    range_low: 48000,
    range_high: 72000,
    glassdoor_search_title: "Entry Level Accountant",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-accountant-salary-SRCH_KO0,22.htm",
  }),
  actuarial: w2({
    median: 75000,
    range_low: 62000,
    range_high: 92000,
    glassdoor_search_title: "Entry Level Actuary",
    source_url: "https://www.glassdoor.com/Salaries/entry-level-actuary-salary-SRCH_KO0,19.htm",
  }),
  "corporate-finance": w2({
    median: 72000,
    range_low: 58000,
    range_high: 90000,
    glassdoor_search_title: "Corporate Financial Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/corporate-financial-analyst-salary-SRCH_KO0,27.htm",
  }),
  finance: w2({
    median: 68000,
    range_low: 55000,
    range_high: 85000,
    glassdoor_search_title: "Entry Level Financial Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-financial-analyst-salary-SRCH_KO0,29.htm",
  }),
  "quant-finance": w2({
    median: 105000,
    range_low: 85000,
    range_high: 135000,
    glassdoor_search_title: "Quantitative Analyst",
    source_url: "https://www.glassdoor.com/Salaries/quantitative-analyst-salary-SRCH_KO0,21.htm",
    ...ca(105000, 0.19),
  }),
  "risk-management-insurance": w2({
    median: 68000,
    range_low: 55000,
    range_high: 85000,
    glassdoor_search_title: "Risk Analyst",
    source_url: "https://www.glassdoor.com/Salaries/risk-analyst-salary-SRCH_KO0,12.htm",
  }),
  consulting: w2({
    median: 78000,
    range_low: 62000,
    range_high: 98000,
    glassdoor_search_title: "Entry Level Consultant",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-consultant-salary-SRCH_KO0,22.htm",
  }),
  "market-research": w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Market Research Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/market-research-analyst-salary-SRCH_KO0,23.htm",
  }),
  marketing: w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Entry Level Marketing",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-marketing-salary-SRCH_KO0,20.htm",
  }),
  campaigns: w2({
    median: 55000,
    range_low: 44000,
    range_high: 68000,
    glassdoor_search_title: "Campaign Manager",
    source_url: "https://www.glassdoor.com/Salaries/campaign-manager-salary-SRCH_KO0,16.htm",
  }),
  hr: w2({
    median: 58000,
    range_low: 47000,
    range_high: 72000,
    glassdoor_search_title: "Entry Level HR",
    source_url: "https://www.glassdoor.com/Salaries/entry-level-hr-salary-SRCH_KO0,13.htm",
  }),
  "international-business": w2({
    median: 65000,
    range_low: 52000,
    range_high: 82000,
    glassdoor_search_title: "International Business Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/international-business-analyst-salary-SRCH_KO0,30.htm",
  }),
  "international-development": w2({
    median: 55000,
    range_low: 44000,
    range_high: 68000,
    glassdoor_search_title: "International Development",
    source_url:
      "https://www.glassdoor.com/Salaries/international-development-salary-SRCH_KO0,25.htm",
  }),
  "corporate-comms": w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Corporate Communications",
    source_url:
      "https://www.glassdoor.com/Salaries/corporate-communications-salary-SRCH_KO0,24.htm",
  }),
  "ethics-consulting": w2({
    median: 68000,
    range_low: 54000,
    range_high: 85000,
    glassdoor_search_title: "Ethics Consultant",
    source_url: "https://www.glassdoor.com/Salaries/ethics-consultant-salary-SRCH_KO0,17.htm",
  }),
  "biotech-pharma": w2({
    median: 72000,
    range_low: 58000,
    range_high: 90000,
    glassdoor_search_title: "Biotech Research Associate",
    source_url:
      "https://www.glassdoor.com/Salaries/biotech-research-associate-salary-SRCH_KO0,27.htm",
    ...ca(72000, 0.18),
  }),
  biostatistics: w2({
    median: 78000,
    range_low: 62000,
    range_high: 98000,
    glassdoor_search_title: "Biostatistician",
    source_url: "https://www.glassdoor.com/Salaries/biostatistician-salary-SRCH_KO0,15.htm",
    ...ca(78000, 0.14),
  }),
  "neuroscience-research": w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Research Associate Neuroscience",
    source_url:
      "https://www.glassdoor.com/Salaries/neuroscience-research-associate-salary-SRCH_KO0,31.htm",
  }),
  "physiology-research": w2({
    median: 45000,
    range_low: 36000,
    range_high: 55000,
    glassdoor_search_title: "Research Assistant Physiology",
    source_url:
      "https://www.glassdoor.com/Salaries/physiology-research-assistant-salary-SRCH_KO0,31.htm",
  }),
  "materials-science": w2({
    median: 75000,
    range_low: 60000,
    range_high: 94000,
    glassdoor_search_title: "Materials Scientist",
    source_url: "https://www.glassdoor.com/Salaries/materials-scientist-salary-SRCH_KO0,18.htm",
  }),
  "climate-science": w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Climate Scientist",
    source_url: "https://www.glassdoor.com/Salaries/climate-scientist-salary-SRCH_KO0,17.htm",
  }),
  "environmental-science": w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Environmental Scientist",
    source_url:
      "https://www.glassdoor.com/Salaries/environmental-scientist-salary-SRCH_KO0,22.htm",
  }),
  geology: w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Entry Level Geologist",
    source_url: "https://www.glassdoor.com/Salaries/entry-level-geologist-salary-SRCH_KO0,20.htm",
  }),
  hydrology: w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Hydrologist",
    source_url: "https://www.glassdoor.com/Salaries/hydrologist-salary-SRCH_KO0,11.htm",
  }),
  "remote-sensing": w2({
    median: 65000,
    range_low: 52000,
    range_high: 82000,
    glassdoor_search_title: "Remote Sensing Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/remote-sensing-analyst-salary-SRCH_KO0,22.htm",
  }),
  "gis-analyst": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "GIS Analyst",
    source_url: "https://www.glassdoor.com/Salaries/gis-analyst-salary-SRCH_KO0,11.htm",
  }),
  "marine-biology": w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Marine Biologist",
    source_url: "https://www.glassdoor.com/Salaries/marine-biologist-salary-SRCH_KO0,15.htm",
  }),
  "wildlife-biology": w2({
    median: 46000,
    range_low: 38000,
    range_high: 55000,
    glassdoor_search_title: "Wildlife Biologist",
    source_url: "https://www.glassdoor.com/Salaries/wildlife-biologist-salary-SRCH_KO0,17.htm",
  }),
  fisheries: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Fisheries Biologist",
    source_url: "https://www.glassdoor.com/Salaries/fisheries-biologist-salary-SRCH_KO0,18.htm",
  }),
  "water-resources": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Water Resources Engineer",
    source_url:
      "https://www.glassdoor.com/Salaries/water-resources-engineer-salary-SRCH_KO0,24.htm",
  }),
  research: w2({
    median: 50000,
    range_low: 40000,
    range_high: 62000,
    glassdoor_search_title: "Research Associate",
    source_url: "https://www.glassdoor.com/Salaries/research-associate-salary-SRCH_KO0,18.htm",
  }),
  "national-labs": w2({
    median: 72000,
    range_low: 58000,
    range_high: 90000,
    glassdoor_search_title: "Research Scientist",
    source_url: "https://www.glassdoor.com/Salaries/research-scientist-salary-SRCH_KO0,17.htm",
  }),
  "environmental-consulting": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Environmental Consultant",
    source_url:
      "https://www.glassdoor.com/Salaries/environmental-consultant-salary-SRCH_KO0,23.htm",
  }),
  "environmental-policy": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Environmental Policy Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/environmental-policy-analyst-salary-SRCH_KO0,28.htm",
  }),
  energy: w2({
    median: 75000,
    range_low: 60000,
    range_high: 94000,
    glassdoor_search_title: "Energy Engineer",
    source_url: "https://www.glassdoor.com/Salaries/energy-engineer-salary-SRCH_KO0,14.htm",
  }),
  "energy-sustainability": w2({
    median: 68000,
    range_low: 54000,
    range_high: 85000,
    glassdoor_search_title: "Sustainability Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/sustainability-analyst-salary-SRCH_KO0,21.htm",
  }),
  conservation: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Conservation Scientist",
    source_url:
      "https://www.glassdoor.com/Salaries/conservation-scientist-salary-SRCH_KO0,21.htm",
  }),
  arts: w2({
    median: 45000,
    range_low: 36000,
    range_high: 55000,
    glassdoor_search_title: "Artist",
    source_url: "https://www.glassdoor.com/Salaries/artist-salary-SRCH_KO0,6.htm",
  }),
  "arts-administration": w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Arts Administrator",
    source_url: "https://www.glassdoor.com/Salaries/arts-administrator-salary-SRCH_KO0,17.htm",
  }),
  choreography: w2({
    median: 42000,
    range_low: 34000,
    range_high: 52000,
    glassdoor_search_title: "Choreographer",
    source_url: "https://www.glassdoor.com/Salaries/choreographer-salary-SRCH_KO0,12.htm",
  }),
  composition: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Composer",
    source_url: "https://www.glassdoor.com/Salaries/composer-salary-SRCH_KO0,8.htm",
  }),
  directing: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Theater Director",
    source_url: "https://www.glassdoor.com/Salaries/theater-director-salary-SRCH_KO0,16.htm",
  }),
  "film-tv-production": w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Production Assistant",
    source_url: "https://www.glassdoor.com/Salaries/production-assistant-salary-SRCH_KO0,19.htm",
  }),
  media: w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Media Analyst",
    source_url: "https://www.glassdoor.com/Salaries/media-analyst-salary-SRCH_KO0,13.htm",
  }),
  performance: w2({
    median: 42000,
    range_low: 34000,
    range_high: 52000,
    glassdoor_search_title: "Professional Dancer",
    source_url: "https://www.glassdoor.com/Salaries/professional-dancer-salary-SRCH_KO0,19.htm",
  }),
  "music-education": w2({
    median: 48000,
    range_low: 40000,
    range_high: 58000,
    glassdoor_search_title: "Music Teacher",
    source_url: "https://www.glassdoor.com/Salaries/music-teacher-salary-SRCH_KO0,13.htm",
  }),
  publishing: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Editorial Assistant",
    source_url: "https://www.glassdoor.com/Salaries/editorial-assistant-salary-SRCH_KO0,18.htm",
  }),
  "technical-writing": w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    california_median: 72000,
    california_note:
      "CA tech hubs often pay ~15% above US for technical writers.",
    glassdoor_search_title: "Technical Writer",
    source_url:
      "https://www.glassdoor.com/Salaries/technical-writer-salary-SRCH_KO0,17.htm",
  }),
  journalism: w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Entry Level Journalist",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-journalist-salary-SRCH_KO0,22.htm",
  }),
  translation: w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "Translator",
    source_url: "https://www.glassdoor.com/Salaries/translator-salary-SRCH_KO0,10.htm",
  }),
  government: w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Government Analyst",
    source_url: "https://www.glassdoor.com/Salaries/government-analyst-salary-SRCH_KO0,18.htm",
  }),
  diplomacy: w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Foreign Service Officer",
    source_url:
      "https://www.glassdoor.com/Salaries/foreign-service-officer-salary-SRCH_KO0,22.htm",
  }),
  "intelligence-analysis": w2({
    median: 72000,
    range_low: 58000,
    range_high: 90000,
    glassdoor_search_title: "Intelligence Analyst",
    source_url: "https://www.glassdoor.com/Salaries/intelligence-analyst-salary-SRCH_KO0,21.htm",
  }),
  "international-relations": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "International Relations Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/international-relations-analyst-salary-SRCH_KO0,31.htm",
  }),
  "international-ngos": w2({
    median: 52000,
    range_low: 42000,
    range_high: 65000,
    glassdoor_search_title: "NGO Program Officer",
    source_url: "https://www.glassdoor.com/Salaries/ngo-program-officer-salary-SRCH_KO0,19.htm",
  }),
  "public-policy": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Policy Analyst",
    source_url: "https://www.glassdoor.com/Salaries/policy-analyst-salary-SRCH_KO0,14.htm",
  }),
  "public-health": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Public Health Analyst",
    source_url:
      "https://www.glassdoor.com/Salaries/public-health-analyst-salary-SRCH_KO0,21.htm",
  }),
  "urban-planning": w2({
    median: 58000,
    range_low: 46000,
    range_high: 72000,
    glassdoor_search_title: "Urban Planner",
    source_url: "https://www.glassdoor.com/Salaries/urban-planner-salary-SRCH_KO0,13.htm",
  }),
  law: w2({
    median: 75000,
    range_low: 60000,
    range_high: 95000,
    glassdoor_search_title: "Entry Level Attorney",
    source_url: "https://www.glassdoor.com/Salaries/entry-level-attorney-salary-SRCH_KO0,19.htm",
  }),
  medicine: w2({
    median: 62000,
    range_low: 50000,
    range_high: 78000,
    glassdoor_search_title: "Medical Resident",
    source_url: "https://www.glassdoor.com/Salaries/medical-resident-salary-SRCH_KO0,16.htm",
  }),
  education: w2({
    median: 48000,
    range_low: 40000,
    range_high: 58000,
    glassdoor_search_title: "Entry Level Teacher",
    source_url: "https://www.glassdoor.com/Salaries/entry-level-teacher-salary-SRCH_KO0,19.htm",
  }),
  "social-work": w2({
    median: 48000,
    range_low: 40000,
    range_high: 58000,
    glassdoor_search_title: "Entry Level Social Worker",
    source_url:
      "https://www.glassdoor.com/Salaries/entry-level-social-worker-salary-SRCH_KO0,24.htm",
  }),
  nonprofit: w2({
    median: 48000,
    range_low: 40000,
    range_high: 58000,
    glassdoor_search_title: "Nonprofit Program Coordinator",
    source_url:
      "https://www.glassdoor.com/Salaries/nonprofit-program-coordinator-salary-SRCH_KO0,29.htm",
  }),
  academia: w2({
    median: 55000,
    range_low: 44000,
    range_high: 68000,
    glassdoor_search_title: "Postdoctoral Researcher",
    source_url:
      "https://www.glassdoor.com/Salaries/postdoctoral-researcher-salary-SRCH_KO0,23.htm",
  }),
  "museum-archives": w2({
    median: 45000,
    range_low: 36000,
    range_high: 55000,
    glassdoor_search_title: "Museum Curator Assistant",
    source_url:
      "https://www.glassdoor.com/Salaries/museum-curator-assistant-salary-SRCH_KO0,24.htm",
  }),
  "public-history": w2({
    median: 48000,
    range_low: 38000,
    range_high: 58000,
    glassdoor_search_title: "Public Historian",
    source_url: "https://www.glassdoor.com/Salaries/public-historian-salary-SRCH_KO0,15.htm",
  }),
  "graduate-program": GRADUATE_PROGRAM,
};

/** Exact title → canonical slug. */
const ALIASES: Record<(typeof CAREER_TITLES)[number], keyof typeof PROFILES> = {
  Academia: "academia",
  Accounting: "accounting",
  Actuarial: "actuarial",
  "Aerospace engineering": "aerospace-engineering",
  Architecture: "architecture",
  Arts: "arts",
  "Arts administration": "arts-administration",
  Biostatistics: "biostatistics",
  Biotech: "biotech-pharma",
  "Biotech & pharmaceuticals": "biotech-pharma",
  "CPA track (grad)": "graduate-program",
  Campaigns: "campaigns",
  Choreography: "choreography",
  "Climate science": "climate-science",
  "Clinical (grad)": "graduate-program",
  "Combined BS/MS + Industry Thesis": "graduate-program",
  Composition: "composition",
  "Comprehensive Exam or Thesis Defense": "graduate-program",
  "Computational linguistics": "computational-linguistics",
  Conservation: "conservation",
  Consulting: "consulting",
  "Controls / Robotics Engineer": "controls-robotics-engineer",
  "Corporate comms": "corporate-comms",
  "Corporate finance": "corporate-finance",
  "Data Science & Analytics": "data-science",
  "Data analytics": "data-science",
  "Data science": "data-science",
  Design: "design",
  Development: "international-development",
  Diplomacy: "diplomacy",
  Directing: "directing",
  "Dissertation Research & Defense": "graduate-program",
  Education: "education",
  "Embedded systems": "embedded-systems",
  Energy: "energy",
  "Energy & sustainability": "energy-sustainability",
  Engineering: "engineering",
  "Enterprise Risk & Insurance": "risk-management-insurance",
  "Environmental consulting": "environmental-consulting",
  "Environmental policy": "environmental-policy",
  "Environmental science": "environmental-science",
  "Ethics consulting": "ethics-consulting",
  "Film/TV production": "film-tv-production",
  Finance: "finance",
  "Financial analyst": "finance",
  "Fine arts": "arts",
  Fisheries: "fisheries",
  "Foreign service": "diplomacy",
  "GIS analyst": "gis-analyst",
  Geology: "geology",
  Government: "government",
  "Graduate School (CS PhD / MS)": "graduate-program",
  "Graduate study": "graduate-program",
  "Graphic design": "graphic-design",
  HR: "hr",
  "Hardware / Digital Design": "hardware-digital-design",
  "Hardware / Digital Design Engineer": "hardware-digital-design",
  Hydrology: "hydrology",
  "Intelligence/analysis": "intelligence-analysis",
  "International NGOs": "international-ngos",
  "International business": "international-business",
  "International development": "international-development",
  "International relations": "international-relations",
  Journalism: "journalism",
  Law: "law",
  "ML Engineer": "ml-engineer",
  "MS/PhD in Statistics or Financial Math": "graduate-program",
  "MS/PhD in chemical engineering": "graduate-program",
  "Machine Learning Engineer": "ml-engineer",
  "Machine learning": "ml-engineer",
  "Marine biology": "marine-biology",
  "Market research": "market-research",
  Marketing: "marketing",
  "Materials science": "materials-science",
  "Mechanical design engineer": "mechanical-design-engineer",
  Media: "media",
  "Media analysis": "media",
  Medicine: "medicine",
  "Museum/archives": "museum-archives",
  "Museum/gallery": "museum-archives",
  Museums: "museum-archives",
  "Music education": "music-education",
  "National labs": "national-labs",
  "Neuroscience research": "neuroscience-research",
  Nonprofit: "nonprofit",
  Performance: "performance",
  "PhD Qualifying Examination": "graduate-program",
  Pharmaceutical: "biotech-pharma",
  "Pharmaceutical R&D": "biotech-pharma",
  "Physiology research": "physiology-research",
  "Process / plant engineering": "process-plant-engineering",
  "Professional dance": "performance",
  "Public health": "public-health",
  "Public history": "public-history",
  "Public policy": "public-policy",
  Publishing: "publishing",
  "Quant finance": "quant-finance",
  "Quantitative Finance": "quant-finance",
  "Quantitative Finance / Trading": "quant-finance",
  "RF / Wireless Engineer": "rf-wireless-engineer",
  "Remote sensing": "remote-sensing",
  Research: "research",
  "Risk Management & Insurance": "risk-management-insurance",
  "Robotics & automation": "controls-robotics-engineer",
  "SOA / CAS Actuary": "actuarial",
  "Security Engineer": "security-engineer",
  "Signal Processing Engineer": "signal-processing-engineer",
  "Social work": "social-work",
  "Social work (grad)": "graduate-program",
  "Software Engineer": "software-engineer",
  "Software engineer": "software-engineer",
  "Speech pathology (grad)": "graduate-program",
  "Speech tech": "speech-tech",
  Sustainability: "energy-sustainability",
  "Systems engineer": "systems-engineer",
  "Thermal & energy systems": "thermal-energy-systems",
  "Thesis or Comprehensive Exam": "graduate-program",
  "Thesis or Project Defense": "graduate-program",
  Translation: "translation",
  UX: "ux",
  "UX research": "ux",
  "Urban planning": "urban-planning",
  "VLSI designer": "hardware-digital-design",
  "Veterinary (grad)": "graduate-program",
  "Water resources": "water-resources",
  "Wildlife biology": "wildlife-biology",
  Teaching: "education",
  "Technical writing": "technical-writing",
};

function main(): void {
  const titleSet = new Set(CAREER_TITLES);
  if (titleSet.size !== CAREER_TITLES.length) {
    throw new Error("CAREER_TITLES contains duplicates");
  }

  const aliasKeys = Object.keys(ALIASES);
  if (aliasKeys.length !== CAREER_TITLES.length) {
    throw new Error(
      `Alias count mismatch: ${aliasKeys.length} aliases vs ${CAREER_TITLES.length} titles`,
    );
  }

  for (const title of CAREER_TITLES) {
    if (!(title in ALIASES)) {
      throw new Error(`Missing alias for "${title}"`);
    }
    const slug = ALIASES[title];
    if (!(slug in PROFILES)) {
      throw new Error(`Alias "${title}" → "${slug}" has no profile in index`);
    }
  }

  const profileCount = Object.keys(PROFILES).length;
  if (profileCount < 70 || profileCount > 90) {
    throw new Error(`Expected 70–90 canonical profiles, got ${profileCount}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const indexPath = path.join(OUT_DIR, "index.json");
  const aliasesPath = path.join(OUT_DIR, "aliases.json");

  writeFileSync(indexPath, `${JSON.stringify(PROFILES, null, 2)}\n`);
  writeFileSync(aliasesPath, `${JSON.stringify(ALIASES, null, 2)}\n`);

  console.log(`Wrote ${indexPath} (${profileCount} profiles)`);
  console.log(`Wrote ${aliasesPath} (${aliasKeys.length} aliases)`);
}

main();
