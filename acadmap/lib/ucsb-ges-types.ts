export type GeAreaId =
  | "AHI"
  | "Area B"
  | "Area C"
  | "Area D"
  | "Area E"
  | "Area F"
  | "Area G"
  | "Ethnicity"
  | "Euro Trad"
  | "Quant Relationships"
  | "World Cult"
  | "Writing";

export type GeAreaInfo = {
  id: GeAreaId;
  label: string;
  description: string;
};

export type GeCourseEntry = {
  courseId: string;
  areas: GeAreaId[];
};

export type GeAreaCourse = {
  courseId: string;
  avgGpa: number | null;
};

export const GE_AREAS: GeAreaInfo[] = [
  {
    id: "Area B",
    label: "Area B — Foreign Language",
    description: "Foreign language proficiency and related coursework.",
  },
  {
    id: "Area C",
    label: "Area C — Science, Mathematics, Technology",
    description: "Science, mathematics, and technology GE courses.",
  },
  {
    id: "Area D",
    label: "Area D — Social Sciences",
    description: "Social, behavioral, and economic sciences.",
  },
  {
    id: "Area E",
    label: "Area E — Culture and Thought",
    description: "Culture, thought, and human experience.",
  },
  {
    id: "Area F",
    label: "Area F — Arts",
    description: "Visual and performing arts.",
  },
  {
    id: "Area G",
    label: "Area G — Literature",
    description: "Literature and literary analysis.",
  },
  {
    id: "Writing",
    label: "Writing",
    description: "Writing-intensive GE requirement.",
  },
  {
    id: "Ethnicity",
    label: "Ethnicity",
    description: "Ethnicity GE requirement.",
  },
  {
    id: "World Cult",
    label: "World Cultures",
    description: "World cultures GE requirement.",
  },
  {
    id: "Euro Trad",
    label: "European Traditions",
    description: "European traditions GE requirement.",
  },
  {
    id: "Quant Relationships",
    label: "Quantitative Relationships",
    description: "Quantitative relationships GE requirement.",
  },
  {
    id: "AHI",
    label: "American History & Institutions",
    description: "American history and institutions (AHI).",
  },
];

export const GE_AREA_IDS = GE_AREAS.map((a) => a.id);
