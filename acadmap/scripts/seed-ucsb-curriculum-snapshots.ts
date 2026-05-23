#!/usr/bin/env node
/**
 * Writes static curriculum snapshots when UCSB_API_KEY is unavailable.
 * Run: npm run seed:ucsb-curriculum
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type {
  UcsbCourseLevel,
  UcsbCoursePrimary,
  UcsbCurriculumSnapshot,
} from "../lib/ucsb-curriculum-types";

const ROOT = path.join(process.cwd(), "data", "ucsb", "curriculum");
const FETCHED_AT = "2026-05-23T00:00:00.000Z";
const QUARTERS = ["20252", "20261"] as const;

const SUBJECTS = [
  { code: "ECE", name: "Electrical Computer Engineering" },
  { code: "CMPSC", name: "Computer Science" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "CH E", name: "Chemical Engineering" },
  { code: "MATH", name: "Mathematics" },
  { code: "PSTAT", name: "Statistics & Applied Probability" },
  { code: "PHYS", name: "Physics" },
  { code: "ECON", name: "Economics" },
  { code: "PSY", name: "Psychology" },
  { code: "COMM", name: "Communication" },
  { code: "GRAD", name: "Graduate Division" },
] as const;

type CourseSeed = Omit<UcsbCoursePrimary, "subjectCode" | "sections"> & {
  sections?: UcsbCoursePrimary["sections"];
};

const GRAD_COURSES: Record<string, CourseSeed[]> = {
  ECE: [
    {
      courseId: "ECE 291",
      title: "Seminar in Electrical Engineering",
      description: "Graduate seminar on current topics in electrical and computer engineering.",
      units: 2,
      objLevelCode: "G",
    },
    {
      courseId: "ECE 294",
      title: "Advanced Topics in Electrical Engineering",
      description: "Special topics at the graduate level; content varies by quarter.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "ECE 296",
      title: "Advanced Special Topics in Electrical Engineering",
      description: "Advanced graduate topics in ECE research areas.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "ECE 596",
      title: "Individual Study for Master's Students",
      description: "Directed reading and research for MS students under faculty supervision.",
      units: 1,
      objLevelCode: "G",
    },
    {
      courseId: "ECE 599",
      title: "PhD Dissertation Research",
      description: "Dissertation research for doctoral candidates.",
      units: 1,
      objLevelCode: "G",
    },
  ],
  CMPSC: [
    {
      courseId: "CMPSC 290A",
      title: "Topics in Computer Science",
      description: "Graduate seminar on advanced CS topics.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "CMPSC 596",
      title: "Individual Study for Master's Students",
      description: "Individual study or research for MS students.",
      units: 1,
      objLevelCode: "G",
    },
    {
      courseId: "CMPSC 598",
      title: "Master's Thesis Research",
      description: "Thesis research for MS students.",
      units: 1,
      objLevelCode: "G",
    },
    {
      courseId: "CMPSC 599",
      title: "PhD Dissertation Research",
      description: "Dissertation research for PhD students.",
      units: 1,
      objLevelCode: "G",
    },
  ],
  ME: [
    {
      courseId: "ME 210",
      title: "Advanced Engineering Analysis",
      description: "Graduate-level analytical methods for mechanical engineering.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "ME 296",
      title: "Advanced Special Topics in Mechanical Engineering",
      description: "Special graduate topics in ME.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "ME 596",
      title: "Individual Study for Master's Students",
      description: "Directed study for MS students.",
      units: 1,
      objLevelCode: "G",
    },
  ],
  "CH E": [
    {
      courseId: "CH E 210",
      title: "Advanced Chemical Engineering Thermodynamics",
      description: "Graduate thermodynamics for chemical engineering.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "CH E 296",
      title: "Advanced Special Topics in Chemical Engineering",
      description: "Graduate special topics.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "CH E 596",
      title: "Individual Study for Master's Students",
      description: "MS directed study.",
      units: 1,
      objLevelCode: "G",
    },
  ],
  MATH: [
    {
      courseId: "MATH 201A",
      title: "Algebra I",
      description: "First quarter of graduate algebra sequence.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "MATH 202A",
      title: "Real Analysis I",
      description: "Graduate real analysis.",
      units: 4,
      objLevelCode: "G",
    },
  ],
  PSTAT: [
    {
      courseId: "PSTAT 213A",
      title: "Introduction to Probability Theory",
      description: "Graduate probability theory.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "PSTAT 215A",
      title: "Statistical Theory I",
      description: "Graduate statistical theory sequence.",
      units: 4,
      objLevelCode: "G",
    },
  ],
  PHYS: [
    {
      courseId: "PHYS 200A",
      title: "Classical Mechanics",
      description: "Graduate classical mechanics.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "PHYS 210A",
      title: "Quantum Mechanics I",
      description: "Graduate quantum mechanics.",
      units: 4,
      objLevelCode: "G",
    },
  ],
  ECON: [
    {
      courseId: "ECON 200A",
      title: "Microeconomic Theory I",
      description: "First quarter of graduate micro theory.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "ECON 201A",
      title: "Macroeconomic Theory I",
      description: "Graduate macroeconomics.",
      units: 4,
      objLevelCode: "G",
    },
  ],
  PSY: [
    {
      courseId: "PSY 211A",
      title: "Proseminar in Cognitive Psychology",
      description: "Graduate proseminar in cognition.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "PSY 296",
      title: "Advanced Special Topics in Psychology",
      description: "Graduate special topics.",
      units: 4,
      objLevelCode: "G",
    },
  ],
  COMM: [
    {
      courseId: "COMM 200A",
      title: "Proseminar in Communication",
      description: "Graduate proseminar in communication.",
      units: 4,
      objLevelCode: "G",
    },
    {
      courseId: "COMM 596",
      title: "Individual Study for Master's Students",
      description: "MS individual study.",
      units: 1,
      objLevelCode: "G",
    },
  ],
  GRAD: [
    {
      courseId: "GRAD 200",
      title: "Professional Development for Graduate Students",
      description: "Graduate Division professional development seminar.",
      units: 2,
      objLevelCode: "G",
    },
    {
      courseId: "GRAD 596",
      title: "Individual Study for Master's Students",
      description: "Graduate Division individual study.",
      units: 1,
      objLevelCode: "G",
    },
  ],
};

const UNDERGRAD_COURSES: Record<string, CourseSeed[]> = {
  ECE: [
    {
      courseId: "ECE 10A",
      title: "Circuits & Systems I",
      units: 5,
      objLevelCode: "U",
    },
    {
      courseId: "ECE 130A",
      title: "Signal Analysis & Processing I",
      units: 4,
      objLevelCode: "U",
    },
    {
      courseId: "ECE 188A",
      title: "Senior EE Capstone I",
      units: 5,
      objLevelCode: "U",
    },
  ],
  CMPSC: [
    {
      courseId: "CMPSC 16",
      title: "Problem Solving with Computers I",
      units: 4,
      objLevelCode: "U",
    },
    {
      courseId: "CMPSC 130A",
      title: "Data Structures & Algorithms I",
      units: 4,
      objLevelCode: "U",
    },
    {
      courseId: "CMPSC 170",
      title: "Operating Systems",
      units: 4,
      objLevelCode: "U",
    },
  ],
};

function withSections(
  subjectCode: string,
  seeds: CourseSeed[],
): UcsbCoursePrimary[] {
  return seeds.map((seed, index) => ({
    ...seed,
    subjectCode,
    sections: seed.sections ?? [
      {
        enrollCode: `${10000 + index}`,
        section: `${(index + 1) * 100}`,
        instructor: "Staff",
        timeLocations: "TBA",
      },
    ],
  }));
}

async function writeSnapshot(
  quarter: string,
  subjectCode: string,
  level: UcsbCourseLevel,
  courses: UcsbCoursePrimary[],
): Promise<void> {
  const fileKey = subjectCode.replace(/\s+/g, " ");
  const dir = path.join(ROOT, "snapshots", quarter);
  await mkdir(dir, { recursive: true });
  const snapshot: UcsbCurriculumSnapshot = {
    quarter,
    subjectCode: fileKey,
    level,
    fetchedAt: FETCHED_AT,
    courses,
  };
  const fileName = `${fileKey.toUpperCase().replace(/\s+/g, " ")}-${level}.json`;
  await writeFile(
    path.join(dir, fileName),
    `${JSON.stringify(snapshot, null, 2)}\n`,
    "utf8",
  );
}

async function main(): Promise<void> {
  await mkdir(ROOT, { recursive: true });

  await writeFile(
    path.join(ROOT, "subjects.json"),
    `${JSON.stringify({ subjects: SUBJECTS.map((s) => ({ subjectCode: s.code, subjectTranslation: s.name })) }, null, 2)}\n`,
  );

  await writeFile(
    path.join(ROOT, "quarters.json"),
    `${JSON.stringify(
      {
        quarters: [
          { code: "20261", label: "Fall 2026" },
          { code: "20252", label: "Spring 2026" },
          { code: "20251", label: "Winter 2026" },
          { code: "20244", label: "Fall 2025" },
        ],
      },
      null,
      2,
    )}\n`,
  );

  for (const quarter of QUARTERS) {
    for (const { code } of SUBJECTS) {
      const grad = GRAD_COURSES[code];
      if (grad) {
        await writeSnapshot(quarter, code, "G", withSections(code, grad));
      }

      const undergrad = UNDERGRAD_COURSES[code];
      if (undergrad) {
        await writeSnapshot(quarter, code, "U", withSections(code, undergrad));
        if (grad) {
          await writeSnapshot(quarter, code, "A", [
            ...withSections(code, undergrad),
            ...withSections(code, grad),
          ]);
        }
      }
    }
  }

  console.log("Wrote UCSB curriculum subjects, quarters, and snapshots.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
