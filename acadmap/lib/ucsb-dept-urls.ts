/** Department URLs, catalog codes, and requirements for all UCSB L&S majors. */

export type DeptMeta = {
  department: string;
  department_slug?: string;
  department_url: string;
  faculty_url?: string;
  curriculum_url: string;
  catalog_program_code: string;
  graduation_units?: number;
  preparation_for_major: string[];
  upper_division_required: string[];
  departmental_electives_units?: number;
  departmental_electives_note?: string;
  sample_electives: string[];
  career_outcomes: string[];
  notes?: string;
  selective?: boolean;
};

function catalog(code: string): string {
  return `https://catalog.ucsb.edu/programs/${code}`;
}

export const LS_DEPT_META: Record<string, DeptMeta> = {
  "actuarial-science": {
    department: "Department of Statistics & Applied Probability",
    department_slug: "pstat",
    department_url: "https://www.pstat.ucsb.edu/",
    faculty_url: "https://www.pstat.ucsb.edu/people/faculty",
    curriculum_url: catalog("BSACT"),
    catalog_program_code: "BSACT",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "MATH 2A-B or 3A-B — Calculus",
      "MATH 4A-B — Linear algebra & differential equations",
      "MATH 6A-B — Vector calculus",
      "MATH 8 or PSTAT 8 — Proofs / probability theory",
      "PSTAT 10 — Probability and statistics",
      "CMPSC 8 — Programming",
      "CMPSC 9 or 16 — Intermediate programming"
    ],
    upper_division_required: [
      "PSTAT 120A-B — Probability & statistics",
      "PSTAT 126, 160A-B, 174 — Statistics & financial math core",
      "PSTAT 170, 171, 172A-B — Actuarial core",
      "12 units upper-division PSTAT/MATH/ECON electives (Areas D & E)"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "Selective major. Transfer prep: Calc I–II, linear algebra, multivariable calc, intro programming (C or better, GPA 2.75+). SOA exam prep encouraged.",
    sample_electives: ["PSTAT 175", "PSTAT 176", "MATH 117", "ECON 1"],
    career_outcomes: ["Actuary", "Risk analyst", "Insurance", "Quantitative finance", "Data science"]
  },
  anthropology: {
    department: "Department of Anthropology",
    department_url: "https://www.anth.ucsb.edu/",
    curriculum_url: catalog("BAANT"),
    catalog_program_code: "BAANT",
    graduation_units: 180,
    preparation_for_major: [
      "ANTH 2 — Introductory Cultural Anthropology",
      "ANTH 3 or 5 — Biological or Archaeological Anthropology",
      "Statistics or methods prep course"
    ],
    upper_division_required: [
      "ANTH 102 — Anthropological Theory",
      "Methods course (ethnographic or archaeological)",
      "Upper-division ANTH electives in subdisciplines"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Subfields: sociocultural, archaeology, biological anthropology.",
    sample_electives: ["ANTH 120", "ANTH 130", "ANTH 150", "ANTH 170"],
    career_outcomes: ["UX research", "Museums", "International development", "Public health", "Academia"]
  },
  "applied-mathematics": {
    department: "Department of Mathematics",
    department_url: "https://www.math.ucsb.edu/",
    curriculum_url: catalog("BSAPM"),
    catalog_program_code: "BSAPM",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "MATH 3A-B — Calculus",
      "MATH 4A-B — Linear Algebra & Differential Equations",
      "MATH 8 — Transition to Proofs",
      "PHYS 7A-B (recommended)"
    ],
    upper_division_required: [
      "MATH 118A-B-C — Real Analysis",
      "MATH 111A-B — Abstract Algebra",
      "Applied math cluster electives (numerical, ODE/PDE, modeling)"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "BS Applied Mathematics emphasizes modeling and computation. Selective major with strong math GPA.",
    sample_electives: ["MATH 124", "MATH 132", "MATH 160", "MATH 170"],
    career_outcomes: ["Data science", "Engineering", "Finance", "Research", "Graduate study"]
  },
  "aquatic-biology": {
    department: "Department of Ecology, Evolution, and Marine Biology",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSAQB"),
    catalog_program_code: "BSAQB",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C (or 2 series)",
      "MATH 3A-B",
      "EEMB 2-3 or MCDB 1A-B",
      "PHYS 6A-B-C or 7A-B-C"
    ],
    upper_division_required: [
      "EEMB upper-division marine/aquatic courses",
      "Laboratory/field requirement",
      "Capstone or research"
    ],
    departmental_electives_units: 36,
    departmental_electives_note: "Focus on marine and freshwater systems. Field and lab intensive.",
    sample_electives: ["EEMB 120", "EEMB 157", "EEMB 184", "EEMB 199"],
    career_outcomes: ["Marine biology", "Conservation", "Fisheries", "Environmental consulting", "Graduate study"]
  },
  art: {
    department: "Department of Art",
    department_url: "https://www.art.ucsb.edu/",
    curriculum_url: catalog("BAART"),
    catalog_program_code: "BAART",
    graduation_units: 180,
    preparation_for_major: [
      "ART 1A-B-C — Foundation studio sequence",
      "ART 12 — Art history survey",
      "Lower-division studio electives"
    ],
    upper_division_required: [
      "Upper-division studio concentration",
      "ART history/theory courses",
      "Senior exhibition or portfolio review"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Studio areas include painting, sculpture, print, digital media, and photography.",
    sample_electives: ["ART 130", "ART 140", "ART 150", "ART 190"],
    career_outcomes: ["Fine arts", "Graphic design", "Museum/gallery", "Teaching", "Creative direction"]
  },
  "asian-american-studies": {
    department: "Department of Asian American Studies",
    department_url: "https://www.asam.ucsb.edu/",
    curriculum_url: catalog("BAASAM"),
    catalog_program_code: "BAASAM",
    graduation_units: 180,
    preparation_for_major: [
      "AS AM 1 — Introduction to Asian American Studies",
      "Lower-division AS AM courses",
      "Related ethnic studies or history survey"
    ],
    upper_division_required: [
      "Upper-division AS AM electives",
      "Research or community engagement project",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary focus on Asian American history, culture, and politics.",
    sample_electives: ["AS AM 110", "AS AM 130", "AS AM 150", "AS AM 170"],
    career_outcomes: ["Law", "Education", "Nonprofit", "Public policy", "Community organizing"]
  },
  "asian-studies": {
    department: "Department of East Asian Languages and Cultural Studies",
    department_url: "https://www.ealc.ucsb.edu/",
    curriculum_url: catalog("BAASST"),
    catalog_program_code: "BAASST",
    graduation_units: 180,
    preparation_for_major: [
      "EACS lower-division surveys",
      "Language study (Chinese, Japanese, or Korean)",
      "Area history or culture course"
    ],
    upper_division_required: [
      "Upper-division EACS courses",
      "Advanced language or literature",
      "Senior thesis option"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Regional focus on East Asia with language requirement.",
    sample_electives: ["EACS 120", "EACS 140", "CHIN 120", "JAPAN 120"],
    career_outcomes: ["International business", "Diplomacy", "Translation", "Teaching", "Graduate study"]
  },
  biochemistry: {
    department: "Department of Chemistry and Biochemistry",
    department_url: "https://www.chem.ucsb.edu/",
    curriculum_url: catalog("BSBCH"),
    catalog_program_code: "BSBCH",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "CHEM 6AL-BL",
      "MATH 3A-B, 4A-B",
      "PHYS 7A-B-C",
      "CHEM 109A-B-C"
    ],
    upper_division_required: [
      "CHEM 113A-B-C — Physical Chemistry",
      "BCHM/MCDB biochemistry courses",
      "Upper-division lab or research"
    ],
    departmental_electives_units: 12,
    departmental_electives_note: "Selective major. Heavy chemistry and biology integration. Pre-med and biotech paths.",
    sample_electives: ["CHEM 171", "MCDB 108A", "CHEM 173", "BCHM 142"],
    career_outcomes: ["Biotech", "Pharmaceutical R&D", "Medicine", "Research", "Graduate study"]
  },
  "biological-sciences": {
    department: "Department of Ecology, Evolution, and Marine Biology / MCDB",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSBIO"),
    catalog_program_code: "BSBIO",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C (or 2 series)",
      "CHEM 1LB or 2LC",
      "MATH 3A-B",
      "MATH 4A or PSTAT 5A",
      "EEMB 2-3 or MCDB 1A-B",
      "PHYS 6A-B-C or 7A-B-C"
    ],
    upper_division_required: [
      "Upper-division biology electives (EEMB and/or MCDB)",
      "Laboratory course requirement",
      "Capstone or senior project"
    ],
    departmental_electives_units: 40,
    departmental_electives_note: "BS Biological Sciences spans EEMB and MCDB. Selective major for transfers.",
    sample_electives: ["EEMB 120", "MCDB 108A", "EEMB 157", "MCDB 131"],
    career_outcomes: ["Medicine", "Biotech", "Environmental science", "Marine biology", "Graduate study"]
  },
  biopsychology: {
    department: "Department of Psychological & Brain Sciences",
    department_url: "https://www.psych.ucsb.edu/",
    curriculum_url: catalog("BSBPSY"),
    catalog_program_code: "BSBPSY",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "PSY 1 — Introductory Psychology",
      "CHEM 1A-B (or 2 series)",
      "MATH 3A-B",
      "MCDB 1A-B or EEMB 2",
      "PSY 10A-B — Methods and Statistics"
    ],
    upper_division_required: [
      "PSY 112 — Biopsychology",
      "Upper-division neuroscience/psych electives",
      "Research methods or lab"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "BS track with heavier biology and neuroscience than BA Psychology.",
    sample_electives: ["PSY 112", "PSY 114", "MCDB 108A", "PSY 199"],
    career_outcomes: ["Neuroscience research", "Medicine", "Pharmaceutical", "Graduate study", "Clinical psychology"]
  },
  "black-studies": {
    department: "Department of Black Studies",
    department_url: "https://www.blackstudies.ucsb.edu/",
    curriculum_url: catalog("BABLS"),
    catalog_program_code: "BABLS",
    graduation_units: 180,
    preparation_for_major: [
      "BL ST 1 — Introduction to Black Studies",
      "Lower-division BL ST courses",
      "Related history or sociology survey"
    ],
    upper_division_required: [
      "Upper-division BL ST electives",
      "Theory or methods course",
      "Senior seminar or project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary study of African diaspora history, culture, and politics.",
    sample_electives: ["BL ST 110", "BL ST 130", "BL ST 150", "BL ST 170"],
    career_outcomes: ["Law", "Education", "Social work", "Public policy", "Community leadership"]
  },
  chemistry: {
    department: "Department of Chemistry and Biochemistry",
    department_url: "https://www.chem.ucsb.edu/",
    curriculum_url: catalog("BSCHEM"),
    catalog_program_code: "BSCHEM",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "CHEM 6AL-BL",
      "MATH 3A-B, 4A-B",
      "PHYS 7A-B-C-D",
      "CHEM 109A-B-C"
    ],
    upper_division_required: [
      "CHEM 113A-B-C — Physical Chemistry",
      "CHEM 142A-B-C — Inorganic/Quantum",
      "Upper-division chemistry electives"
    ],
    departmental_electives_units: 12,
    departmental_electives_note: "ACS-certified track available. Selective major.",
    sample_electives: ["CHEM 171", "CHEM 173", "CHEM 174", "CHEM 180"],
    career_outcomes: ["Pharmaceutical R&D", "Materials science", "Teaching", "Graduate study", "Analytical chemistry"]
  },
  "chicano-and-chicano-studies": {
    department: "Department of Chicana and Chicano Studies",
    department_url: "https://www.chicst.ucsb.edu/",
    curriculum_url: catalog("BACHST"),
    catalog_program_code: "BACHST",
    graduation_units: 180,
    preparation_for_major: [
      "CH ST 1A-B — Introduction to Chicana/o Studies",
      "Lower-division CH ST courses",
      "Related history or Spanish language course"
    ],
    upper_division_required: [
      "Upper-division CH ST electives",
      "Community engagement or research",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Focus on Chicana/o and Latina/o history, culture, and social justice.",
    sample_electives: ["CH ST 110", "CH ST 130", "CH ST 150", "CH ST 170"],
    career_outcomes: ["Education", "Law", "Social work", "Public policy", "Community organizing"]
  },
  chinese: {
    department: "Department of East Asian Languages and Cultural Studies",
    department_url: "https://www.ealc.ucsb.edu/",
    curriculum_url: catalog("BACHIN"),
    catalog_program_code: "BACHIN",
    graduation_units: 180,
    preparation_for_major: [
      "CHIN 1-6 — Chinese language sequence",
      "EACS lower-division survey",
      "Lower-division Chinese culture course"
    ],
    upper_division_required: [
      "CHIN 120+ — Advanced Chinese",
      "Upper-division literature/culture",
      "Senior project"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Language proficiency through advanced coursework required.",
    sample_electives: ["CHIN 120", "CHIN 140", "EACS 130", "EACS 150"],
    career_outcomes: ["Translation", "International business", "Diplomacy", "Teaching", "Graduate study"]
  },
  classics: {
    department: "Department of Classics",
    department_url: "https://www.classics.ucsb.edu/",
    curriculum_url: catalog("BACLAS"),
    catalog_program_code: "BACLAS",
    graduation_units: 180,
    preparation_for_major: [
      "Greek or Latin language sequence",
      "CLAS lower-division surveys",
      "Ancient history or mythology survey"
    ],
    upper_division_required: [
      "Advanced Greek/Latin reading",
      "Upper-division classical civilization",
      "Senior thesis option"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Emphasis on ancient Greek and Roman languages, literature, and history.",
    sample_electives: ["CLAS 110", "CLAS 130", "GREEK 100", "LATIN 100"],
    career_outcomes: ["Law", "Teaching", "Museum/archives", "Graduate study", "Publishing"]
  },
  communication: {
    department: "Department of Communication",
    department_url: "https://www.comm.ucsb.edu/",
    curriculum_url: catalog("BACOMM"),
    catalog_program_code: "BACOMM",
    graduation_units: 180,
    preparation_for_major: [
      "COMM 1 — Introduction to Communication",
      "COMM 88A or statistics course",
      "Lower-division COMM courses"
    ],
    upper_division_required: [
      "COMM 100A-B — Theory/Methods",
      "Upper-division COMM electives",
      "Senior capstone"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Selective major with prep GPA requirement.",
    sample_electives: ["COMM 121", "COMM 130", "COMM 145", "COMM 160"],
    career_outcomes: ["Marketing", "Media", "Corporate comms", "UX", "Law"]
  },
  "comparative-literature": {
    department: "Department of Comparative Literature",
    department_url: "https://www.complit.ucsb.edu/",
    curriculum_url: catalog("BACMLT"),
    catalog_program_code: "BACMLT",
    graduation_units: 180,
    preparation_for_major: [
      "Lower-division literature in two languages",
      "C LIT gateway courses",
      "Foreign language through intermediate level"
    ],
    upper_division_required: [
      "Upper-division C LIT courses",
      "Literary theory requirement",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Cross-cultural literary study; foreign language proficiency required.",
    sample_electives: ["C LIT 110", "C LIT 130", "C LIT 150", "C LIT 170"],
    career_outcomes: ["Publishing", "Translation", "Teaching", "Graduate study", "International NGOs"]
  },
  dance: {
    department: "Department of Theater and Dance",
    department_url: "https://www.theaterdance.ucsb.edu/",
    curriculum_url: catalog("BADAN"),
    catalog_program_code: "BADAN",
    graduation_units: 180,
    preparation_for_major: [
      "DANCE lower-division technique courses",
      "DANCE history/theory",
      "Performance participation"
    ],
    upper_division_required: [
      "Advanced technique",
      "Choreography or production",
      "Senior performance/project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "BFA requires audition. BA track available.",
    sample_electives: ["DANCE 130", "DANCE 150", "DANCE 170", "DANCE 190"],
    career_outcomes: ["Professional dance", "Choreography", "Teaching", "Arts administration", "Physical therapy"]
  },
  "earth-science": {
    department: "Department of Earth Science",
    department_url: "https://www.earth.ucsb.edu/",
    curriculum_url: catalog("BSEAR"),
    catalog_program_code: "BSEAR",
    graduation_units: 180,
    preparation_for_major: [
      "CHEM 1A-B",
      "MATH 3A-B, 4A",
      "EARTH 2-4 — Intro geology sequence",
      "PHYS 7A-B or 6A-B"
    ],
    upper_division_required: [
      "EARTH upper-division core",
      "Field/lab requirement",
      "Emphasis area electives (geology, geophysics, etc.)"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "BA and BS tracks with emphases in climate, geology, geobiology, geophysics.",
    sample_electives: ["EARTH 120", "EARTH 130", "EARTH 150", "EARTH 170"],
    career_outcomes: ["Environmental consulting", "Geology", "Climate science", "Energy", "Graduate study"]
  },
  "ecology-and-evolution": {
    department: "Department of Ecology, Evolution, and Marine Biology",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSEEMB"),
    catalog_program_code: "BSEEMB",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "MATH 3A-B",
      "EEMB 2-3",
      "PHYS 6A-B-C or 7A-B-C"
    ],
    upper_division_required: [
      "EEMB ecology/evolution core",
      "Field or lab intensive course",
      "Upper-division EEMB electives"
    ],
    departmental_electives_units: 36,
    departmental_electives_note: "Selective major. Focus on population, community, and evolutionary biology.",
    sample_electives: ["EEMB 120", "EEMB 157", "EEMB 184", "EEMB 199"],
    career_outcomes: ["Conservation", "Research", "Environmental policy", "Graduate study", "Wildlife biology"]
  },
  economics: {
    department: "Department of Economics",
    department_url: "https://www.econ.ucsb.edu/",
    curriculum_url: "https://econ.ucsb.edu/programs/undergraduate/majors",
    catalog_program_code: "BAECON",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "ECON 1 — Principles of Microeconomics",
      "ECON 2 — Principles of Macroeconomics",
      "ECON 10A — Intermediate Microeconomic Theory",
      "ECON 5 or PSTAT 120A",
      "MATH 2A-B or 3A-B (C or better)",
      "Pre-major GPA 2.85+ on ECON 1, 2, 10A"
    ],
    upper_division_required: [
      "ECON 100B — Intermediate Macroeconomics",
      "ECON 101 — Econometrics",
      "ECON 140A",
      "Six additional upper-division ECON electives"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "Selective major. ECON 5 and 10A must be taken at UCSB.",
    sample_electives: ["ECON 115", "ECON 130", "ECON 140B", "ECON 171"],
    career_outcomes: ["Financial analyst", "Consulting", "Data analytics", "Public policy", "Graduate study"],
    notes: "ECON 5 and ECON 10A must be taken at UCSB."
  },
  "economics-and-accounting": {
    department: "Department of Economics",
    department_url: "https://www.econ.ucsb.edu/",
    curriculum_url: catalog("BAECAC"),
    catalog_program_code: "BAECAC",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "ECON 1 — Microeconomics",
      "ECON 2 — Macroeconomics",
      "Two calculus courses (MATH 3A-B or equivalent)",
      "GPA 2.75+ in prep courses (C or better each)"
    ],
    upper_division_required: [
      "ECON 100B, 101, 140A",
      "Accounting/finance electives",
      "Upper-division ECON courses"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "Selective major. Combines economics with accounting coursework. Verify accounting course list with department.",
    sample_electives: ["ECON 115", "ECON 130", "ECON 150A", "ECON 171"],
    career_outcomes: ["Accounting", "Finance", "Consulting", "CPA track (grad)", "Corporate finance"]
  },
  english: {
    department: "Department of English",
    department_url: "https://www.english.ucsb.edu/",
    curriculum_url: catalog("BAENG"),
    catalog_program_code: "BAENG",
    graduation_units: 180,
    preparation_for_major: [
      "Lower-division English literature surveys",
      "Writing 50 or equivalent",
      "ENG 10 or gateway courses"
    ],
    upper_division_required: [
      "Upper-division ENG by period and genre",
      "Literary theory course",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Literature and creative writing tracks available.",
    sample_electives: ["ENG 101", "ENG 115", "ENG 130", "ENG 150"],
    career_outcomes: ["Publishing", "Teaching", "Law", "Technical writing", "Graduate study"]
  },
  "environmental-studies": {
    department: "Environmental Studies Program",
    department_url: "https://www.es.ucsb.edu/",
    curriculum_url: catalog("BAES"),
    catalog_program_code: "BAES",
    graduation_units: 180,
    preparation_for_major: [
      "ENV S 1 — Introduction to Environmental Studies",
      "CHEM 1A or EARTH 2",
      "ECON 1 or GEOG 5",
      "Statistics course"
    ],
    upper_division_required: [
      "ENV S core upper-division",
      "Concentration electives (policy, science, etc.)",
      "Senior project or internship"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary BA/BS with science and policy tracks.",
    sample_electives: ["ENV S 130", "ENV S 150", "ENV S 170", "ENV S 190"],
    career_outcomes: ["Environmental policy", "Conservation", "Sustainability", "Law", "Graduate study"]
  },
  "feminist-studies": {
    department: "Department of Feminist Studies",
    department_url: "https://www.femst.ucsb.edu/",
    curriculum_url: catalog("BAFEM"),
    catalog_program_code: "BAFEM",
    graduation_units: 180,
    preparation_for_major: [
      "FEMST 1 — Introduction to Feminist Studies",
      "Lower-division FEMST courses",
      "Related sociology or history survey"
    ],
    upper_division_required: [
      "Upper-division FEMST electives",
      "Theory/methods course",
      "Senior seminar or project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary focus on gender, sexuality, and social justice.",
    sample_electives: ["FEMST 110", "FEMST 130", "FEMST 150", "FEMST 170"],
    career_outcomes: ["Law", "Social work", "Public health", "Nonprofit", "Graduate study"]
  },
  "film-and-media-studies": {
    department: "Department of Film and Media Studies",
    department_url: "https://www.filmandmedia.ucsb.edu/",
    curriculum_url: catalog("BAFMS"),
    catalog_program_code: "BAFMS",
    graduation_units: 180,
    preparation_for_major: [
      "FAMST 1 — Introduction to Film Studies",
      "FAMST lower-division surveys",
      "Production or theory gateway"
    ],
    upper_division_required: [
      "Upper-division FAMST theory/history",
      "Production or analysis electives",
      "Senior project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Critical studies and production tracks.",
    sample_electives: ["FAMST 110", "FAMST 130", "FAMST 150", "FAMST 170"],
    career_outcomes: ["Film/TV production", "Media analysis", "Marketing", "Journalism", "Graduate study"]
  },
  "financial-mathematics-and-statistics": {
    department: "Department of Statistics & Applied Probability",
    department_slug: "pstat",
    department_url: "https://www.pstat.ucsb.edu/",
    faculty_url: "https://www.pstat.ucsb.edu/people/faculty",
    curriculum_url: catalog("BSFMS"),
    catalog_program_code: "BSFMS",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "MATH 3A-B — Calculus",
      "MATH 4A — Linear Algebra",
      "MATH 6A — Vector Calculus",
      "PSTAT 120A — Probability",
      "ECON 1-2 (recommended)"
    ],
    upper_division_required: [
      "PSTAT 160A-B — Statistics",
      "Financial math electives",
      "Upper-division PSTAT/MATH courses"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "Quantitative finance and statistics focus.",
    sample_electives: ["PSTAT 174", "PSTAT 176", "MATH 117", "ECON 130"],
    career_outcomes: ["Quantitative finance", "Risk analysis", "Data science", "Actuarial", "Banking"]
  },
  french: {
    department: "Department of French and Italian",
    department_url: "https://www.frit.ucsb.edu/",
    curriculum_url: catalog("BAFR"),
    catalog_program_code: "BAFR",
    graduation_units: 180,
    preparation_for_major: [
      "FR 1-6 — French language sequence",
      "Lower-division French literature/culture",
      "Intermediate French composition"
    ],
    upper_division_required: [
      "FR 100+ — Advanced French",
      "Upper-division literature/culture",
      "Senior seminar"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Language proficiency through advanced coursework.",
    sample_electives: ["FR 120", "FR 140", "FR 160", "FR 180"],
    career_outcomes: ["Translation", "International relations", "Teaching", "Publishing", "Graduate study"]
  },
  geography: {
    department: "Department of Geography",
    department_url: "https://www.geog.ucsb.edu/",
    curriculum_url: catalog("BAGEO"),
    catalog_program_code: "BAGEO",
    graduation_units: 180,
    preparation_for_major: [
      "GEOG 5 — Human Geography",
      "GEOG 12 — Maps and Spatial Reasoning",
      "Statistics or GIS intro"
    ],
    upper_division_required: [
      "Upper-division GEOG electives",
      "GIS or methods course",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "BA human geography and BS physical geography/GIS emphases.",
    sample_electives: ["GEOG 130", "GEOG 150", "GEOG 170", "GEOG 190"],
    career_outcomes: ["GIS analyst", "Urban planning", "Environmental consulting", "Remote sensing", "Graduate study"]
  },
  german: {
    department: "Department of Germanic and Slavic Studies",
    department_url: "https://www.gss.ucsb.edu/",
    curriculum_url: catalog("BAGERM"),
    catalog_program_code: "BAGERM",
    graduation_units: 180,
    preparation_for_major: [
      "GER 1-6 — German language sequence",
      "Lower-division German culture/literature",
      "Intermediate German composition"
    ],
    upper_division_required: [
      "GER 100+ — Advanced German",
      "Upper-division literature/culture",
      "Senior project"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Language and cultural studies of German-speaking world.",
    sample_electives: ["GER 120", "GER 140", "GER 160", "GER 180"],
    career_outcomes: ["Translation", "International business", "Teaching", "Graduate study", "EU policy"]
  },
  "global-studies": {
    department: "Department of Global Studies",
    department_url: "https://www.global.ucsb.edu/",
    curriculum_url: catalog("BAGS"),
    catalog_program_code: "BAGS",
    graduation_units: 180,
    preparation_for_major: [
      "GLOBL 1 — Introduction to Global Studies",
      "Foreign language study",
      "Regional survey course"
    ],
    upper_division_required: [
      "Upper-division GLOBL core",
      "Concentration electives",
      "Senior capstone or study abroad integration"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary international affairs major. Study abroad encouraged.",
    sample_electives: ["GLOBL 130", "GLOBL 150", "GLOBL 170", "GLOBL 190"],
    career_outcomes: ["International NGOs", "Diplomacy", "Development", "Law", "Graduate study"]
  },
  history: {
    department: "Department of History",
    department_url: "https://www.history.ucsb.edu/",
    curriculum_url: catalog("BAHIS"),
    catalog_program_code: "BAHIS",
    graduation_units: 180,
    preparation_for_major: [
      "HIST 4A-B-C or regional surveys",
      "Lower-division HIST electives",
      "Writing or research methods course"
    ],
    upper_division_required: [
      "Upper-division HIST by region/era",
      "HIST 201 — Historiography",
      "Research seminar"
    ],
    departmental_electives_units: 36,
    departmental_electives_note: "Regional concentrations available.",
    sample_electives: ["HIST 105", "HIST 121", "HIST 140", "HIST 180"],
    career_outcomes: ["Law", "Education", "Public history", "Government", "Journalism"]
  },
  "history-of-art-and-architecture": {
    department: "Department of History of Art and Architecture",
    department_url: "https://www.haa.ucsb.edu/",
    curriculum_url: catalog("BAHAA"),
    catalog_program_code: "BAHAA",
    graduation_units: 180,
    preparation_for_major: [
      "HAA lower-division surveys",
      "Art history gateway courses",
      "Studio art or architecture intro (recommended)"
    ],
    upper_division_required: [
      "Upper-division HAA by period/region",
      "Methods/theory course",
      "Senior thesis option"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Visual culture from antiquity to contemporary.",
    sample_electives: ["HAA 130", "HAA 150", "HAA 170", "HAA 190"],
    career_outcomes: ["Museum/gallery", "Architecture", "Conservation", "Graduate study", "Publishing"]
  },
  "history-of-policy-law-and-governance": {
    department: "Department of History",
    department_url: "https://www.history.ucsb.edu/",
    curriculum_url: catalog("BAHPLG"),
    catalog_program_code: "BAHPLG",
    graduation_units: 180,
    preparation_for_major: [
      "HIST lower-division surveys",
      "POL S 1 or introductory policy course",
      "Statistics or research methods course"
    ],
    upper_division_required: [
      "Upper-division HIST/POL S cross-listed courses",
      "Policy/governance focus electives",
      "Senior research project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary major combining history with policy and law.",
    sample_electives: ["HIST 130", "POL S 120", "HIST 170", "POL S 174"],
    career_outcomes: ["Law", "Public policy", "Government", "Nonprofit", "Graduate study"]
  },
  "hydrologic-sciences-and-policy": {
    department: "Department of Geography / Bren School",
    department_url: "https://www.geog.ucsb.edu/",
    curriculum_url: catalog("BSHSP"),
    catalog_program_code: "BSHSP",
    graduation_units: 180,
    preparation_for_major: [
      "CHEM 1A-B",
      "MATH 3A-B",
      "GEOG or EARTH intro",
      "Statistics"
    ],
    upper_division_required: [
      "Hydrology/water policy core",
      "Science and policy electives",
      "Senior project"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Interdisciplinary water science and policy program.",
    sample_electives: ["GEOG 130", "ENV S 150", "EARTH 130", "GEOG 170"],
    career_outcomes: ["Water resources", "Environmental policy", "Hydrology", "Consulting", "Graduate study"]
  },
  "italian-studies": {
    department: "Department of French and Italian",
    department_url: "https://www.frit.ucsb.edu/",
    curriculum_url: catalog("BAITST"),
    catalog_program_code: "BAITST",
    graduation_units: 180,
    preparation_for_major: [
      "ITAL 1-6 — Italian language sequence",
      "Lower-division Italian culture",
      "Intermediate Italian composition"
    ],
    upper_division_required: [
      "ITAL 100+ — Advanced Italian",
      "Upper-division literature/culture",
      "Senior seminar"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Italian language, literature, and cultural studies.",
    sample_electives: ["ITAL 120", "ITAL 140", "ITAL 160", "ITAL 180"],
    career_outcomes: ["Translation", "International relations", "Teaching", "Arts", "Graduate study"]
  },
  japanese: {
    department: "Department of East Asian Languages and Cultural Studies",
    department_url: "https://www.ealc.ucsb.edu/",
    curriculum_url: catalog("BAJAPN"),
    catalog_program_code: "BAJAPN",
    graduation_units: 180,
    preparation_for_major: [
      "JAPAN 1-6 — Japanese language sequence",
      "EACS lower-division survey",
      "Lower-division Japanese culture course"
    ],
    upper_division_required: [
      "JAPAN 120+ — Advanced Japanese",
      "Upper-division literature/culture",
      "Senior project"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Language proficiency through advanced coursework.",
    sample_electives: ["JAPAN 120", "JAPAN 140", "EACS 130", "EACS 150"],
    career_outcomes: ["Translation", "International business", "Teaching", "Graduate study", "Tech industry"]
  },
  "language-culture-and-society": {
    department: "Department of Linguistics",
    department_url: "https://www.linguistics.ucsb.edu/",
    curriculum_url: catalog("BALCS"),
    catalog_program_code: "BALCS",
    graduation_units: 180,
    preparation_for_major: [
      "LING 20 — Language and Linguistics",
      "Foreign language study",
      "ANTH or SOC intro"
    ],
    upper_division_required: [
      "Upper-division LING courses",
      "Sociolinguistics/anthropology electives",
      "Senior project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary sociolinguistics and language in society.",
    sample_electives: ["LING 130", "LING 150", "ANTH 120", "SOC 130"],
    career_outcomes: ["Education", "Speech pathology (grad)", "UX research", "Translation", "Graduate study"]
  },
  "latin-american-and-iberian-studies": {
    department: "Department of Spanish and Portuguese",
    department_url: "https://www.spanport.ucsb.edu/",
    curriculum_url: catalog("BALAIS"),
    catalog_program_code: "BALAIS",
    graduation_units: 180,
    preparation_for_major: [
      "SPAN or PORT language sequence",
      "Lower-division LAIS surveys",
      "Latin American history or culture survey"
    ],
    upper_division_required: [
      "Upper-division LAIS courses",
      "Advanced language/literature",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Latin American and Iberian cultures in Spanish/Portuguese.",
    sample_electives: ["LAIS 130", "SPAN 140", "PORT 120", "LAIS 170"],
    career_outcomes: ["International development", "Translation", "Diplomacy", "Teaching", "Graduate study"]
  },
  linguistics: {
    department: "Department of Linguistics",
    department_url: "https://www.linguistics.ucsb.edu/",
    curriculum_url: catalog("BALING"),
    catalog_program_code: "BALING",
    graduation_units: 180,
    preparation_for_major: [
      "LING 20 — Language and Linguistics",
      "LING 50 — Phonetics",
      "MATH or logic course"
    ],
    upper_division_required: [
      "LING 106 — Syntax",
      "LING 107 — Semantics",
      "Upper-division LING electives"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Formal linguistics with phonology, syntax, and semantics.",
    sample_electives: ["LING 130", "LING 150", "LING 170", "LING 199"],
    career_outcomes: ["Computational linguistics", "Speech tech", "Teaching", "Graduate study", "UX research"]
  },
  mathematics: {
    department: "Department of Mathematics",
    department_url: "https://www.math.ucsb.edu/",
    curriculum_url: catalog("BAMATH"),
    catalog_program_code: "BAMATH",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "MATH 2A-B or 3A-B",
      "MATH 4A-B",
      "MATH 8 — Transition to Proofs"
    ],
    upper_division_required: [
      "MATH 111A-B — Abstract Algebra",
      "MATH 118A-B-C — Real Analysis",
      "Upper-division MATH electives"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "BA and BS tracks. Selective major for transfers.",
    sample_electives: ["MATH 117", "MATH 124", "MATH 132", "MATH 160"],
    career_outcomes: ["Data science", "Actuarial", "Finance", "Teaching", "Graduate study"]
  },
  "medieval-studies": {
    department: "Department of History",
    department_url: "https://www.history.ucsb.edu/",
    curriculum_url: catalog("BAMDS"),
    catalog_program_code: "BAMDS",
    graduation_units: 180,
    preparation_for_major: [
      "HIST 4A-B or medieval surveys",
      "Latin or relevant language study",
      "Medieval literature or art survey"
    ],
    upper_division_required: [
      "Upper-division medieval history/art/literature",
      "Interdisciplinary electives",
      "Senior thesis"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary medieval Europe major.",
    sample_electives: ["HIST 130", "HAA 130", "CLAS 110", "ENG 130"],
    career_outcomes: ["Graduate study", "Museum/archives", "Teaching", "Publishing", "Law"]
  },
  "middle-east-studies": {
    department: "Department of Religious Studies",
    department_url: "https://www.religion.ucsb.edu/",
    curriculum_url: catalog("BAMES"),
    catalog_program_code: "BAMES",
    graduation_units: 180,
    preparation_for_major: [
      "MES lower-division surveys",
      "Middle Eastern language study (recommended)",
      "HIST or RS intro"
    ],
    upper_division_required: [
      "Upper-division MES courses",
      "Regional concentration electives",
      "Senior project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Interdisciplinary study of Middle East history, politics, and culture.",
    sample_electives: ["MES 130", "RS 130", "HIST 140", "MES 170"],
    career_outcomes: ["Diplomacy", "International NGOs", "Journalism", "Graduate study", "Policy"]
  },
  "molecular-and-cellular-biology": {
    department: "Department of Molecular, Cellular, and Developmental Biology",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSMCDB"),
    catalog_program_code: "BSMCDB",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "MATH 3A-B",
      "MCDB 1A-B",
      "PHYS 6A-B-C or 7A-B-C"
    ],
    upper_division_required: [
      "MCDB upper-division core",
      "Laboratory requirement",
      "Upper-division MCDB electives"
    ],
    departmental_electives_units: 36,
    departmental_electives_note: "Selective major. Molecular and cellular focus. Pre-med and biotech.",
    sample_electives: ["MCDB 108A", "MCDB 131", "MCDB 150", "MCDB 199"],
    career_outcomes: ["Biotech", "Medicine", "Research", "Pharmaceutical", "Graduate study"]
  },
  "music-performance-music-studies": {
    department: "Department of Music",
    department_url: "https://www.music.ucsb.edu/",
    curriculum_url: catalog("BAMUS"),
    catalog_program_code: "BAMUS",
    graduation_units: 180,
    preparation_for_major: [
      "MUS lower-division theory",
      "Performance ensemble participation",
      "Music history survey"
    ],
    upper_division_required: [
      "Advanced theory/composition",
      "Performance or studies concentration",
      "Senior recital or project (BM)"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "BM requires audition. BA in music studies also available.",
    sample_electives: ["MUS 130", "MUS 150", "MUS 170", "MUS 190"],
    career_outcomes: ["Performance", "Composition", "Music education", "Arts administration", "Graduate study"]
  },
  philosophy: {
    department: "Department of Philosophy",
    department_url: "https://www.philosophy.ucsb.edu/",
    curriculum_url: "https://www.philosophy.ucsb.edu/undergraduate",
    catalog_program_code: "BAPHIL",
    graduation_units: 180,
    preparation_for_major: [
      "PHIL 20A-B-C — History of Philosophy",
      "PHIL 3 or 4 — Logic",
      "Lower-division PHIL electives"
    ],
    upper_division_required: [
      "Upper-division PHIL distributed across areas",
      "Core or Ethics emphasis",
      "Senior seminar"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "Core Philosophy or Ethics and Public Policy emphasis.",
    sample_electives: ["PHIL 100", "PHIL 112", "PHIL 115", "PHIL 124"],
    career_outcomes: ["Law", "Public policy", "Ethics consulting", "Academia", "Tech ethics"]
  },
  physics: {
    department: "Department of Physics",
    department_url: "https://www.physics.ucsb.edu/",
    curriculum_url: catalog("BSPHY"),
    catalog_program_code: "BSPHY",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "PHYS 7A-B-C-D-L",
      "MATH 3A-B, 4A-B, 6A-B"
    ],
    upper_division_required: [
      "PHYS 105A-B — Mechanics",
      "PHYS 110A-B — E&M",
      "PHYS 115A-B-C — Quantum",
      "PHYS 120 — Thermodynamics"
    ],
    departmental_electives_units: 12,
    departmental_electives_note: "BS for grad school/technical careers. Selective major.",
    sample_electives: ["PHYS 130", "PHYS 134", "PHYS 145", "PHYS 199"],
    career_outcomes: ["Graduate study", "Engineering", "Quant finance", "National labs", "Data science"]
  },
  physiology: {
    department: "Department of Molecular, Cellular, and Developmental Biology",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSPSIO"),
    catalog_program_code: "BSPSIO",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "MATH 3A-B",
      "MCDB 1A-B",
      "PHYS 6A-B-C"
    ],
    upper_division_required: [
      "Physiology core courses",
      "Laboratory requirement",
      "Upper-division MCDB/EEMB electives"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Focus on organismal and systems physiology. Pre-med track.",
    sample_electives: ["MCDB 108A", "EEMB 120", "MCDB 131", "PHYS 6C"],
    career_outcomes: ["Medicine", "Physiology research", "Pharmaceutical", "Graduate study", "Allied health"]
  },
  "political-science": {
    department: "Department of Political Science",
    department_url: "https://www.polsci.ucsb.edu/",
    curriculum_url: catalog("BAPOL"),
    catalog_program_code: "BAPOL",
    graduation_units: 180,
    preparation_for_major: [
      "POL S 1 — American Government",
      "POL S 6 — Data Analysis",
      "POL S 7 — International Relations",
      "POL S 12 — Comparative Politics"
    ],
    upper_division_required: [
      "Upper-division POL S subfields",
      "Methods/theory requirement",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Subfields: American, IR, comparative, theory, methods.",
    sample_electives: ["POL S 105", "POL S 120", "POL S 130", "POL S 174"],
    career_outcomes: ["Law", "Government", "Foreign service", "Campaigns", "Journalism"]
  },
  portuguese: {
    department: "Department of Spanish and Portuguese",
    department_url: "https://www.spanport.ucsb.edu/",
    curriculum_url: catalog("BAPORT"),
    catalog_program_code: "BAPORT",
    graduation_units: 180,
    preparation_for_major: [
      "PORT 1-6 — Portuguese language sequence",
      "Lower-division Luso-Brazilian culture",
      "Intermediate Portuguese composition"
    ],
    upper_division_required: [
      "PORT 100+ — Advanced Portuguese",
      "Upper-division literature/culture",
      "Senior seminar"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Portuguese language and Luso-Brazilian studies.",
    sample_electives: ["PORT 120", "PORT 140", "PORT 160", "LAIS 130"],
    career_outcomes: ["Translation", "International development", "Diplomacy", "Teaching", "Graduate study"]
  },
  "psychological-and-brain-sciences": {
    department: "Department of Psychological & Brain Sciences",
    department_url: "https://www.psych.ucsb.edu/",
    curriculum_url: catalog("BAPSY"),
    catalog_program_code: "BAPSY",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "PSY 1 — Introductory Psychology",
      "PSTAT 5 or 5LS",
      "PSY 10A — Research Methods",
      "PSY 10B — Statistical Methods"
    ],
    upper_division_required: [
      "PSY 102A — Social Psychology",
      "PSY 105 — Developmental",
      "PSY 110 — Cognitive",
      "PSY 112 — Biopsychology",
      "Upper-division PSY electives"
    ],
    departmental_electives_units: 20,
    departmental_electives_note: "Selective major. Verify prep GPA on department website.",
    sample_electives: ["PSY 130", "PSY 140", "PSY 150", "PSY 170"],
    career_outcomes: ["Clinical (grad)", "UX research", "HR", "Market research", "Neuroscience"]
  },
  "religious-studies": {
    department: "Department of Religious Studies",
    department_url: "https://www.religion.ucsb.edu/",
    curriculum_url: catalog("BARS"),
    catalog_program_code: "BARS",
    graduation_units: 180,
    preparation_for_major: [
      "RS lower-division surveys",
      "World religions gateway courses",
      "Related history or philosophy survey"
    ],
    upper_division_required: [
      "Upper-division RS by tradition/region",
      "Theory/methods course",
      "Senior seminar"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Comparative study of world religions and secular traditions.",
    sample_electives: ["RS 130", "RS 150", "RS 170", "RS 190"],
    career_outcomes: ["Law", "Nonprofit", "Education", "Graduate study", "International NGOs"]
  },
  "russian-and-east-european-studies": {
    department: "Department of Germanic and Slavic Studies",
    department_url: "https://www.gss.ucsb.edu/",
    curriculum_url: catalog("BAREES"),
    catalog_program_code: "BAREES",
    graduation_units: 180,
    preparation_for_major: [
      "RUSS language sequence",
      "Lower-division REES surveys",
      "East European history survey"
    ],
    upper_division_required: [
      "Advanced Russian language",
      "Upper-division REES culture/politics",
      "Senior project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "Russian and East European languages, history, and culture.",
    sample_electives: ["RUSS 120", "GSS 130", "HIST 140", "GSS 170"],
    career_outcomes: ["Diplomacy", "Translation", "Intelligence/analysis", "Graduate study", "International NGOs"]
  },
  sociology: {
    department: "Department of Sociology",
    department_url: "https://www.soc.ucsb.edu/",
    curriculum_url: catalog("BASOC"),
    catalog_program_code: "BASOC",
    graduation_units: 180,
    preparation_for_major: [
      "SOC 1 — Introduction to Sociology",
      "SOC 2 — Social Problems",
      "PSTAT 5 or SOC 3"
    ],
    upper_division_required: [
      "SOC 100 — Sociological Theory",
      "SOC 101 — Research Methods",
      "Upper-division SOC electives"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Quantitative and qualitative methods tracks.",
    sample_electives: ["SOC 120", "SOC 130", "SOC 142", "SOC 185"],
    career_outcomes: ["Social work (grad)", "Market research", "HR", "Public health", "Nonprofit"]
  },
  spanish: {
    department: "Department of Spanish and Portuguese",
    department_url: "https://www.spanport.ucsb.edu/",
    curriculum_url: catalog("BASPN"),
    catalog_program_code: "BASPN",
    graduation_units: 180,
    preparation_for_major: [
      "SPAN 1-6 — Spanish language sequence",
      "Lower-division Spanish literature/culture",
      "Intermediate Spanish composition"
    ],
    upper_division_required: [
      "SPAN 100+ — Advanced Spanish",
      "Upper-division literature/culture",
      "Senior seminar"
    ],
    departmental_electives_units: 28,
    departmental_electives_note: "Spanish language, literature, and Hispanic cultures.",
    sample_electives: ["SPAN 120", "SPAN 140", "SPAN 160", "LAIS 130"],
    career_outcomes: ["Translation", "Education", "International business", "Law", "Graduate study"]
  },
  "statistics-and-data-science": {
    department: "Department of Statistics & Applied Probability",
    department_slug: "pstat",
    department_url: "https://www.pstat.ucsb.edu/",
    faculty_url: "https://www.pstat.ucsb.edu/people/faculty",
    curriculum_url: catalog("BSPSTAT"),
    catalog_program_code: "BSPSTAT",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "MATH 3A-B — Calculus",
      "MATH 4A — Linear Algebra",
      "PSTAT 120A — Probability",
      "CMPSC 16 or programming course"
    ],
    upper_division_required: [
      "PSTAT 160A-B — Mathematical Statistics",
      "Data science electives",
      "Upper-division PSTAT courses"
    ],
    departmental_electives_units: 24,
    departmental_electives_note: "BA and BS tracks. Selective major for transfers.",
    sample_electives: ["PSTAT 175", "PSTAT 176", "CMPSC 130A", "MATH 117"],
    career_outcomes: ["Data science", "Machine learning", "Biostatistics", "Actuarial", "Tech industry"]
  },
  theater: {
    department: "Department of Theater and Dance",
    department_url: "https://www.theaterdance.ucsb.edu/",
    curriculum_url: catalog("BATHR"),
    catalog_program_code: "BATHR",
    graduation_units: 180,
    preparation_for_major: [
      "THTR lower-division acting/directing",
      "THTR history/theory",
      "Production participation"
    ],
    upper_division_required: [
      "Advanced acting/directing/design",
      "Upper-division THTR electives",
      "Senior production/project"
    ],
    departmental_electives_units: 32,
    departmental_electives_note: "BFA requires audition. Acting, design, and directing tracks.",
    sample_electives: ["THTR 130", "THTR 150", "THTR 170", "THTR 190"],
    career_outcomes: ["Performance", "Directing", "Design", "Arts administration", "Film/TV"]
  },
  zoology: {
    department: "Department of Ecology, Evolution, and Marine Biology",
    department_url: "https://www.biology.ucsb.edu/",
    curriculum_url: catalog("BSZOO"),
    catalog_program_code: "BSZOO",
    graduation_units: 180,
    selective: true,
    preparation_for_major: [
      "CHEM 1A-B-C",
      "MATH 3A-B",
      "EEMB 2-3",
      "PHYS 6A-B-C"
    ],
    upper_division_required: [
      "EEMB zoology/animal biology core",
      "Laboratory/field requirement",
      "Upper-division EEMB electives"
    ],
    departmental_electives_units: 36,
    departmental_electives_note: "Animal biology focus within EEMB. Selective major.",
    sample_electives: ["EEMB 120", "EEMB 157", "EEMB 184", "EEMB 199"],
    career_outcomes: ["Wildlife biology", "Conservation", "Veterinary (grad)", "Research", "Zoo/aquarium"]
  }
};

export const LS_SLUG_ALIASES: Record<string, string> = {
  psychology: "psychological-and-brain-sciences",
  biology: "biological-sciences"
};

export function resolveLsSlug(slug: string): string {
  return LS_SLUG_ALIASES[slug.toLowerCase()] ?? slug.toLowerCase();
}

export function catalogProgramUrl(code: string): string {
  return `https://catalog.ucsb.edu/programs/${code}`;
}
